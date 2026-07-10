importScripts('/scripts/idb-storage.js');

const CACHE_VERSION = 'v6';
const CORE_CACHE = `parampara-core-${CACHE_VERSION}`;
const API_CACHE = `parampara-api-${CACHE_VERSION}`;
const MEDIA_CACHE = `parampara-media-${CACHE_VERSION}`;

// LRU Config
const MAX_MEDIA_ITEMS = 50;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/styles/theme.css',
  '/styles/languageSelector.css',
  '/scripts/main.js',
  '/scripts/theme.js',
  '/scripts/languageSwitcher.js',
  '/scripts/cacheLayer.js',
  '/scripts/sw-register.js',
  '/scripts/audio-visualizer.js',
  '/scripts/idb-storage.js',
  '/scripts/sync-manager.js',
  '/scripts/offline-dashboard.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching core assets');
      return cache.addAll(CORE_ASSETS).catch(error => {
        console.warn('[ServiceWorker] Failed to cache some assets', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[ServiceWorker] Purging cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET requests from caching
  if (event.request.method !== 'GET') {
    return;
  }

  // API Requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiNetworkFirstWithIDB(event.request));
    return;
  }

  // Media Assets (images, audio, video)
  const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp3', '.wav', '.ogg', '.mp4', '.webm'];
  const isMedia = mediaExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext)) || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/images/');
  
  if (isMedia) {
    event.respondWith(mediaCacheFirstLRU(event.request, MEDIA_CACHE));
    return;
  }

  // Core Static Assets (HTML, CSS, JS) and other navigations
  event.respondWith(staleWhileRevalidate(event.request, CORE_CACHE));
});

// Advanced API Cache via IndexedDB
async function apiNetworkFirstWithIDB(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status === 200) {
      // Clone before reading JSON
      const clone = networkResponse.clone();
      const data = await clone.json();
      await self.idbStorage.setApiData(request.url, data);
    }
    return networkResponse;
  } catch (error) {
    // Fallback to IndexedDB
    const cachedData = await self.idbStorage.getApiData(request.url);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error; // Let it fail if not in IDB
  }
}

// Advanced Media Cache with LRU Eviction
async function mediaCacheFirstLRU(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update LRU access time
    self.idbStorage.updateLruAccess(request.url).catch(console.error);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      
      // Get blob to calculate size
      const blob = await clone.blob();
      
      // Store in Cache API
      await cache.put(request, new Response(blob, {
        headers: networkResponse.headers,
        status: networkResponse.status,
        statusText: networkResponse.statusText
      }));
      
      // Track in LRU DB
      await self.idbStorage.updateLruAccess(request.url, blob.size);
      
      // Enforce LRU Limit
      enforceLRULimit(cacheName);
      
      return new Response(blob, {
        headers: networkResponse.headers,
        status: networkResponse.status,
        statusText: networkResponse.statusText
      });
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

async function enforceLRULimit(cacheName) {
  try {
    // We check how many items are in the media cache roughly by checking LRU DB
    // To be precise, we get all items. If > MAX_MEDIA_ITEMS, we delete the oldest.
    // In a real app we might check quota: navigator.storage.estimate()
    const store = await self.idbStorage.getStore('lru-meta', 'readonly');
    const countRequest = store.count();
    
    countRequest.onsuccess = async () => {
      const count = countRequest.result;
      if (count > MAX_MEDIA_ITEMS) {
        const excess = count - MAX_MEDIA_ITEMS;
        const oldestItems = await self.idbStorage.getOldestLruItems(excess);
        
        const cache = await caches.open(cacheName);
        for (const item of oldestItems) {
          await cache.delete(item.url);
          await self.idbStorage.removeLruItem(item.url);
          console.log(`[ServiceWorker] Evicted from LRU cache: ${item.url}`);
        }
      }
    };
  } catch (err) {
    console.error('[ServiceWorker] LRU Eviction failed', err);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  if (request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  
  return new Response('', { status: 408, statusText: 'Request Timeout' });
}

// Background Sync 
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    console.log('[ServiceWorker] Background sync triggered');
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  const queue = await self.idbStorage.getSyncQueue();
  if (queue.length === 0) return;

  for (const item of queue) {
    if (item.status === 'failed') continue;
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });
      if (response.ok || response.status === 400 || response.status === 422) {
        await self.idbStorage.removeSyncTask(item.id);
        console.log(`[ServiceWorker] Synced task ${item.id} successfully`);
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('[ServiceWorker] Sync failed for task', item.id, err);
      throw err; // Let SyncManager know it failed so it retries
    }
  }
}

// Network First Caching Helper
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, checking cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fall back to offline page if it's a page navigation
    if (request.mode === 'navigate') {
      const coreCache = await caches.open(CORE_CACHE);
      const offlineResponse = await coreCache.match('/offline.html');
      if (offlineResponse) return offlineResponse;
    }
    throw error;
  }
}
