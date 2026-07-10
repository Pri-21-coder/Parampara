// Gallery Page JavaScript

let allItems = [];
let currentPage = 1;
let limit = 12;
let totalItems = 0;
let totalPages = 1;
let isLoading = false;
// SVG hearts (inline, no font dependency)
const HEART_FILLED =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e53e3e" stroke="#e53e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
const HEART_EMPTY =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

document.addEventListener('DOMContentLoaded', () => {
  window.galleryTimeMachine = new TimeMachineEngine({
    containerId: 'gallery-time-machine-container',
    eras: ['All', '1950', '1980', '2000', '2025'],
  });

  window.addEventListener('parampara:timemachine:change', (e) => {
    // Only respond to our own slider if we have multiple, but here we can just read the current era
    const selectedEra = window.galleryTimeMachine.getCurrentEra();
    if (window.galleryActiveEra !== selectedEra) {
      window.galleryActiveEra = selectedEra;
      currentPage = 1;
      loadGalleryItems(1);
    }
  });

  window.galleryActiveEra = 'All';

  loadGalleryItems(1);
  setupEventListeners();
  setupFavDelegation(); // ← single listener handles ALL heart clicks
  setupShareDelegation();

  // Setup Markdown live preview
  const markdownInput = document.getElementById('markdown-input');
  const markdownPreview = document.getElementById('markdown-preview');

  if (markdownInput && markdownPreview) {
    markdownInput.addEventListener('input', (e) => {
      const markdown = e.target.value;
      if (typeof window.renderMarkdown === 'function') {
        markdownPreview.innerHTML = window.renderMarkdown(markdown);
      }
    });
  }

  // Initialize Quill editor
  if (typeof Quill !== 'undefined') {
    quillEditor = new Quill('#quill-editor', {
      theme: 'snow',
      placeholder: 'Write the cultural story or pattern description here...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ header: [1, 2, 3, false] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
        ],
      },
    });
  }

  // Reload gallery if a sync completes
  window.addEventListener('parampara:sync-complete', () => {
    currentPage = 1;
    loadGalleryItems(1);
  });
});

// ── Event delegation: one listener on the grid catches every heart-button click
function setupFavDelegation() {
  const grid = document.getElementById('gallery-grid');
  grid.addEventListener('click', function (e) {
    // Walk up from the clicked element to find a .favorite-btn
    const btn = e.target.closest('.favorite-btn');
    if (!btn) return; // not a heart button click
    e.stopPropagation(); // don't open the item card

    const itemId = btn.dataset.itemId;
    if (!itemId) return;

    const fm = window.FavoritesManager;
    if (!fm) {
      console.warn('FavoritesManager not loaded');
      return;
    }

    fm.toggleFavorite(itemId);
    const isFav = fm.isFavorite(itemId);

    // Update button visually in-place (no re-render needed)
    btn.innerHTML = isFav ? HEART_FILLED : HEART_EMPTY;
    btn.classList.toggle('favorited', isFav);
    btn.title = isFav ? 'Remove from favorites' : 'Add to favorites';

    console.log(
      '[Parampara] Favorite toggled:',
      itemId,
      '→',
      isFav ? 'ADDED' : 'REMOVED'
    );
  });
}

function setupShareDelegation() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.share-card-btn');
    if (!btn) return;
    e.stopPropagation(); // prevent opening item card

    const itemId = btn.dataset.itemId;
    if (!itemId) return;

    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    if (window.ShareManager) {
      window.ShareManager.share({
        title: item.title,
        text: item.description,
        url:
          window.location.origin +
          window.location.pathname +
          '?item=' +
          encodeURIComponent(item.id),
      });
    } else {
      console.warn('ShareManager not loaded');
    }
  });
}

function setupEventListeners() {
  const grid = document.getElementById('gallery-grid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      const reportBtn = e.target.closest('.report-card-btn');
      if (!reportBtn) return;
      e.stopPropagation();

      const itemId = reportBtn.dataset.itemId;
      if (!itemId) return;

      if (confirm('Are you sure you want to report this item for inappropriate content?')) {
        fetch('/api/moderation/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemId, type: 'culturalItem' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Item reported successfully. Thank you for keeping our community safe.');
            if (data.isHidden) {
              // Reload gallery to remove hidden item
              currentPage = 1;
              loadGalleryItems(1);
            }
          } else {
            alert(data.error || 'Failed to report item');
          }
        })
        .catch(err => console.error('Error reporting item:', err));
      }
    });
  }

  document.getElementById('add-item-btn').addEventListener('click', () => {
    document.getElementById('add-item-modal').classList.add('active');
  });

  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('add-item-modal').classList.remove('active');
  });

  document
    .getElementById('add-item-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);

      // Sync Quill editor content to hidden input
      if (quillEditor) {
        formData.set('description', quillEditor.root.innerHTML);
      }

      await handleAddItem(e, formData);

      // Cleanup after submit
      e.target.reset();
      const markdownPreview = document.getElementById('markdown-preview');
      if (markdownPreview) markdownPreview.innerHTML = '';
      document.getElementById('add-item-modal').classList.remove('active');
    });

  const debouncedFilterItems = debounce(filterItems, 300);

  document
    .getElementById('search-input')
    .addEventListener('input', debouncedFilterItems);
  document
    .getElementById('type-filter')
    .addEventListener('change', filterItems);

  const stateFilterEl = document.getElementById('state-filter');
  if (stateFilterEl) {
    stateFilterEl.addEventListener('change', filterItems);
  }
  const sortSelectEl = document.getElementById('sort-select');
  if (sortSelectEl) {
    sortSelectEl.addEventListener('change', filterItems);
  }
  const limitSelectEl = document.getElementById('limit-select');
  if (limitSelectEl) {
    limitSelectEl.addEventListener('change', (e) => {
      limit = parseInt(e.target.value, 10);
      filterItems();
    });
  }

  // Setup Image Compression
  const imageUpload = document.getElementById('image-upload');
  const imageQuality = document.getElementById('image-quality');

  if (imageUpload) {
    const handleImageCompression = async () => {
      const file = imageUpload.files[0];
      if (!file) return;

      const uiContainer = document.getElementById('image-optimization-ui');
      const origSizeEl = document.getElementById('orig-size');
      const compSizeEl = document.getElementById('comp-size');
      const savePercentEl = document.getElementById('save-percent');
      const previewEl = document.getElementById('image-preview');
      const urlInput = document.getElementById('image-url-input');
      const quality = imageQuality ? imageQuality.value : 'medium';

      uiContainer.style.display = 'block';
      origSizeEl.textContent = 'Processing...';

      try {
        if (!window.ImageOptimizer) {
          throw new Error('ImageOptimizer not loaded');
        }

        const stats = await window.ImageOptimizer.compressImage(file, quality);

        origSizeEl.textContent = window.ImageOptimizer.formatBytes(
          stats.originalSize
        );
        compSizeEl.textContent = window.ImageOptimizer.formatBytes(
          stats.compressedSize
        );
        savePercentEl.textContent = stats.savingsPercent + '%';

        previewEl.src = stats.dataUrl;
        previewEl.style.display = 'inline-block';

        // Auto-fill the URL input with base64 data
        if (urlInput) {
          urlInput.value = stats.dataUrl;
        }
      } catch (err) {
        console.error('Compression failed:', err);
        origSizeEl.textContent = 'Error';
        compSizeEl.textContent = '-';
        savePercentEl.textContent = '-';
      }
    };

    imageUpload.addEventListener('change', handleImageCompression);
    if (imageQuality) {
      imageQuality.addEventListener('change', handleImageCompression);
    }
  }
}

async function loadGalleryItems(page = 1) {
  if (isLoading) return;

  isLoading = true;
  const galleryGrid = document.getElementById('gallery-grid');
  const loadingIndicator = document.getElementById('loading-indicator');

  if (window.SkeletonEngine) {
    window.SkeletonEngine.show(galleryGrid, 'card', limit, false);
  } else {
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
  }

  try {
    const searchTerm = document.getElementById('search-input').value.trim();
    const typeFilter = document.getElementById('type-filter').value;
    const stateFilter = document.getElementById('state-filter');
    const sortSelect = document.getElementById('sort-select');

    let url = `/api/gallery?page=${page}&limit=${limit}`;
    if (typeFilter !== 'all') url += `&type=${typeFilter}`;
    if (window.galleryActiveEra && window.galleryActiveEra !== 'All') {
      url += `&year=${window.galleryActiveEra}`;
    }
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
      if (window.Telemetry) {
        window.Telemetry.track('search', {
          query: searchTerm,
          type: typeFilter,
        });
      }
    }
    if (stateFilter && stateFilter.value !== 'all') {
      url += `&state=${encodeURIComponent(stateFilter.value)}`;
    }
    if (sortSelect && sortSelect.value) {
      url += `&sort=${encodeURIComponent(sortSelect.value)}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    // Check if new format
    let items = [];
    if (result && result.success && result.data && result.pagination) {
      items = result.data;
      totalItems = result.pagination.totalItems || items.length;
      totalPages = result.pagination.totalPages || 1;
    } else if (result && result.data && result.meta) {
      items = result.data;
      totalItems = result.meta.totalItems || items.length;
      totalPages = result.meta.totalPages || 1;
    } else {
      // Fallback if backend not updated
      items = Array.isArray(result) ? result : [];
      totalItems = items.length;
      totalPages = 1;
    }

    allItems = items;

    if (window.SkeletonEngine) {
      window.SkeletonEngine.hide(galleryGrid);
    }
    displayItems(allItems);
    renderPagination();
    
    // Smoothly scroll back to the top of the gallery grid if we navigated pages
    if (page > 1) {
      const header = document.querySelector('.gallery-header');
      if (header) header.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error loading items:', error);
    if (window.SkeletonEngine) {
      window.SkeletonEngine.hide(galleryGrid);
    }
    allItems = getSampleItems();
    displayItems(allItems);
    totalItems = allItems.length;
    totalPages = 1;
    renderPagination();
  } finally {
    isLoading = false;
    if (loadingIndicator) loadingIndicator.style.display = 'none';
  }
}

function renderPagination() {
  const container = document.getElementById('pagination-container');
  if (!container) return;

  if (totalItems === 0 || totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  let html = `<div class="pagination-info">Showing ${startItem}–${endItem} of ${totalItems} items</div>`;
  html += `<div class="pagination-controls">`;

  // Previous button
  html += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Previous</button>`;

  // Page Numbers
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    html += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-btn" style="border:none;background:transparent;">...</span>`;
    }
  }

  for (let p = startPage; p <= endPage; p++) {
    html += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="changePage(${p})">${p}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="pagination-btn" style="border:none;background:transparent;">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  // Next button
  html += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next &raquo;</button>`;
  
  html += `</div>`;
  container.innerHTML = html;
}

window.changePage = function(page) {
  if (page < 1 || page > totalPages || page === currentPage) return;
  currentPage = page;
  loadGalleryItems(currentPage);
};

// ── Translation helper
function tGallery(key) {
  if (typeof PARAMPARA_TRANSLATIONS === 'undefined') return key;
  const lang =
    localStorage.getItem('parampara_lang') ||
    localStorage.getItem('language') ||
    'en';
  const dict = PARAMPARA_TRANSLATIONS[lang] || PARAMPARA_TRANSLATIONS['en'];
  return (dict && dict[key]) || PARAMPARA_TRANSLATIONS['en'][key] || key;
}

function translateType(type) {
  const keyMap = {
    visual: 'modal_type_visual',
    audio: 'modal_type_audio',
    story: 'modal_type_story',
  };
  return tGallery(keyMap[type] || type);
}

// --- VDOM State ---
let lastGalleryVirtualTree = null;
let galleryViewportNode = null;

// Re-render on language change
window.addEventListener('parampara:langchange', () => {
  displayItems(allItems);
});

const GalleryItemComponent = ({ item }) => {
  if (!window.vdom) return null;
  const { h } = window.vdom;
  
  const isFav = !!(window.FavoritesManager && window.FavoritesManager.isFavorite(item.id));
  const heartSvg = isFav ? HEART_FILLED : HEART_EMPTY;

  let mediaNode;
  if (item.imageUrl) {
    mediaNode = h('img', {
      src: item.imageUrl,
      alt: escapeHtml(item.title),
      loading: 'lazy',
      class: 'lazy-img',
      onload: function() { this.classList.add('loaded'); },
      style: 'width:100%;height:100%;object-fit:cover;'
    });
  } else {
    mediaNode = h('span', {}, getTypeIcon(item.type));
  }

  const shareBtn = h('button', {
    class: 'share-card-btn',
    'data-item-id': escapeHtml(item.id),
    'aria-label': 'Share this item',
    title: 'Share this item',
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>'
  });

  const favBtn = h('button', {
    class: `favorite-btn${isFav ? ' favorited' : ''}`,
    'data-item-id': escapeHtml(item.id),
    'aria-label': isFav ? 'Remove from favorites' : 'Add to favorites',
    title: isFav ? 'Remove from favorites' : 'Add to favorites',
    innerHTML: heartSvg
  });

  const reportBtn = h('button', {
    class: 'report-card-btn',
    'data-item-id': escapeHtml(item.id),
    'aria-label': 'Report inappropriate content',
    title: 'Report inappropriate content',
    innerHTML: '🚩',
    style: 'position:absolute; top:10px; left:10px; background:rgba(255,255,255,0.8); border:none; border-radius:50%; width:36px; height:36px; cursor:pointer; font-size:16px; z-index:2; box-shadow:0 2px 5px rgba(0,0,0,0.2);'
  });

  let panoramaBtn = null;
  if (item.panoramaUrl) {
    panoramaBtn = h('button', {
      class: 'panorama-view-btn',
      onclick: (e) => { 
        if (window.panoramaViewer) { window.panoramaViewer.open(item); }
        e.stopPropagation(); 
      },
      title: 'View in 360',
      style: 'position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); color:#fff; border:none; padding:5px 10px; border-radius:15px; cursor:pointer; font-size:0.8rem; z-index:2; backdrop-filter: blur(4px);'
    }, '👁️ View 360°');
  }

  const imageWrapper = h('div', { class: 'gallery-item-image', style: 'position:relative;' }, 
    mediaNode, shareBtn, favBtn, reportBtn, panoramaBtn
  );

  let tagsNode = null;
  if (item.tags && item.tags.length > 0) {
    const tagElements = item.tags.map(tag => h('span', { class: 'tag' }, escapeHtml(tag)));
    tagsNode = h('div', { class: 'gallery-item-tags' }, ...tagElements);
  }

    let badgeProps = { style: 'display:inline-flex; align-items:center; font-size: 0.75rem; padding: 2px 6px; border-radius: 12px; margin-left: 8px; vertical-align: middle; font-weight: bold; cursor: help;' };
    let badgeText = '';
    if (!item.hash) {
      badgeProps.style += 'background: #f3f4f6; color: #6b7280;';
      badgeProps.title = 'This item was created before integrity hashing was enabled.';
      badgeText = '🛡️ Unverified';
    } else if (item._verified) {
      badgeProps.style += 'background: #def7ec; color: #03543f;';
      badgeProps.title = 'Content integrity verified via SHA-256 hash.';
      badgeText = '✅ Verified';
    } else {
      badgeProps.style += 'background: #fde8e8; color: #9b1c1c;';
      badgeProps.title = 'Integrity check failed! Content may have been altered.';
      badgeText = '⚠️ Tampered';
    }
    const badgeNode = h('span', badgeProps, badgeText);

    const descHtml = renderMarkdown(item.description.substring(0, 100) + (item.description.length > 100 ? '...' : ''), true);

    const contentWrapper = h('div', { 
      class: 'gallery-item-content', 
      onclick: (e) => { viewItem(item.id); e.stopPropagation(); },
      style: 'cursor:pointer;'
    },
      h('span', { class: 'gallery-item-type' }, translateType(item.type)),
      h('div', { class: 'gallery-item-location' },
        h('span', { class: 'gallery-item-location-marker' }, '📍'),
        h('strong', {}, escapeHtml(item.location))
      ),
      h('h3', { style: 'display: flex; align-items: center;' }, escapeHtml(item.title), badgeNode),
      h('div', { class: 'markdown-body', style: 'font-size:0.9rem; margin-bottom:1rem;', innerHTML: descHtml }),
    tagsNode
  );

  return h('div', { class: 'gallery-item', 'data-item-id': escapeHtml(item.id), key: item.id },
    imageWrapper, contentWrapper
  );
};

function displayItems(items) {
  if (!window.vdom) {
    console.warn('[Parampara Gallery] VDOM engine not loaded. Check script imports.');
    return;
  }
  
  const { h, diff, scheduleUpdate, render: vdomRender } = window.vdom;

  if (!galleryViewportNode) {
    galleryViewportNode = document.getElementById('gallery-grid');
  }

  scheduleUpdate(() => {
    let currentVirtualTree;

    if (!items || items.length === 0) {
      currentVirtualTree = h('div', { id: 'gallery-grid', class: 'gallery-grid', key: 'gallery-grid' },
        h('div', { style: 'grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);', key: 'empty-state' },
          h('p', { style: 'font-size: 1.2rem; margin-bottom: 1rem;' }, tGallery('gallery_empty_title')),
          h('p', {}, tGallery('gallery_empty_desc'))
        )
      );
    } else {
      const itemNodes = items.map(item => h(GalleryItemComponent, { item, key: item.id }));
      currentVirtualTree = h('div', { id: 'gallery-grid', class: 'gallery-grid', key: 'gallery-grid' }, ...itemNodes);
    }

    if (!lastGalleryVirtualTree) {
      // Trick VDOM into diffing the children instead of destroying the root node,
      // which preserves event delegation (setupFavDelegation & setupShareDelegation).
      lastGalleryVirtualTree = h('div', { id: 'gallery-grid', class: 'gallery-grid', key: 'gallery-grid' });
      // Clear out the original server-rendered or previous innerHTML empty state safely
      galleryViewportNode.innerHTML = '';
    }

    const renderStart = performance.now();
    const updatedDOM = diff(galleryViewportNode, lastGalleryVirtualTree, currentVirtualTree);
    if (updatedDOM) {
      galleryViewportNode = updatedDOM;
    }
    const renderEnd = performance.now();
    console.log(`[Gallery VDOM Patch] Completed diff in ${(renderEnd - renderStart).toFixed(2)}ms`);

    lastGalleryVirtualTree = currentVirtualTree;
  });
}

function getTypeIcon(type) {
  const icons = { visual: '🖼️', audio: '🎧', story: '📖' };
  return icons[type] || '📄';
}

async function getCurrentFilteredItems() {
  const searchTerm = document
    .getElementById('search-input')
    .value.toLowerCase();
  const typeFilter = document.getElementById('type-filter').value;

  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    galleryGrid.style.opacity = '0.5';
  }

  try {
    const filtered = await window.dataWorker.runJob('filterGalleryItems', {
      items: allItems,
      typeFilter,
      searchTerm,
    });

    return filtered;
  } catch (error) {
    console.error('Worker filter error:', error);
    return allItems;
  } finally {
    if (galleryGrid) {
      galleryGrid.style.opacity = '1';
    }
  }
}

async function filterItems() {
  currentPage = 1;
  await loadGalleryItems(1);
}

async function handleAddItem(e) {
  e.preventDefault();

  document.querySelectorAll('.field-error').forEach((el) => el.remove());
  document
    .querySelectorAll('.input-error')
    .forEach((el) => el.classList.remove('input-error'));

  document
    .querySelectorAll('.input-error')
    .forEach((el) => el.classList.remove('input-error'));

  const formData = new FormData(e.target);
  const title = formData.get('title').trim();
  const type = formData.get('type');
  const location = formData.get('location').trim();
  const description = formData.get('description').trim();
  const imageUrl = formData.get('imageUrl').trim();
  const audioUrl = formData.get('audioUrl').trim();

  let hasError = false;

  function showError(fieldName, message) {
    const input = e.target.querySelector(`[name="${fieldName}"]`);
    input.classList.add('input-error');
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    input.parentNode.appendChild(error);
    hasError = true;
  }

  function isValidUrl(str) {
    if (str.startsWith('data:image/')) return true;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  if (!title) showError('title', 'Title is required.');
  if (!location) showError('location', 'Location/Village is required.');
  if (!description) showError('description', 'Description is required.');
  if (imageUrl && !isValidUrl(imageUrl))
    showError(
      'imageUrl',
      'Please enter a valid URL (e.g. https://example.com/image.jpg).'
    );
  if (audioUrl && !isValidUrl(audioUrl))
    showError('audioUrl', 'Please enter a valid URL.');

  if (hasError) return;

  const data = {
    title,
    type,
    location,
    description,
    imageUrl: imageUrl || '',
    audioUrl: audioUrl || '',
    tags: formData.get('tags')
      ? formData
          .get('tags')
          .split(',')
          .map((t) => t.trim())
      : [],
  };

  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const newItem = await response.json();
      currentPage = 1;
      loadGalleryItems(1);
      e.target.reset();
      const uiContainer = document.getElementById('image-optimization-ui');
      if (uiContainer) uiContainer.style.display = 'none';

      const markdownPreview = document.getElementById('markdown-preview');
      if (markdownPreview) markdownPreview.innerHTML = '';
      document.getElementById('add-item-modal').classList.remove('active');
      window.SyncManager
        ? window.SyncManager.showToast(
            tGallery('gallery_item_added'),
            'success'
          )
        : alert(tGallery('gallery_item_added'));
    } else {
      throw new Error(`Server returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Error adding item:', error);

    // Offline submission handling
    const isNetworkError =
      !navigator.onLine ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError');

    if (isNetworkError && window.SyncManager) {
      try {
        await window.SyncManager.enqueue(
          '/api/items',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          },
          { title: data.title }
        );

        e.target.reset();
        if (quillEditor) {
          quillEditor.root.innerHTML = '';
        }
        document.getElementById('add-item-modal').classList.remove('active');
        window.SyncManager.showToast(
          'Network is unavailable. Your submission has been saved locally and will be synced automatically when online.',
          'info'
        );
      } catch (syncErr) {
        console.error('Failed to save to offline queue:', syncErr);
        window.SyncManager.showToast(tGallery('gallery_item_error'), 'error');
      }
    } else {
      window.SyncManager
        ? window.SyncManager.showToast(tGallery('gallery_item_error'), 'error')
        : alert(tGallery('gallery_item_error'));
    }
  }
}

function viewItem(id) {
  const itemIndex = allItems.findIndex((i) => i.id === id);
  if (itemIndex === -1) return;

  if (window.webglLightbox) {
    if (window.Telemetry) window.Telemetry.track('item_view', { itemId: id });
    window.webglLightbox.open(allItems, itemIndex);
    return;
  }

  const item = allItems[itemIndex];
  const lightbox = document.getElementById('gallery-lightbox');
  const img = document.getElementById('lightbox-image');

  if (!lightbox) {
    if (window.Telemetry) window.Telemetry.track('item_view', { itemId: id });
    alert(
      `${tGallery('gallery_viewing')}: ${item.title}\n\n${item.description}`
    );
    return;
  }

  if (window.Telemetry)
    window.Telemetry.track('item_view', { itemId: id, title: item.title });
  // Set Info
  document.getElementById('lightbox-title').textContent = item.title;
  document.getElementById('lightbox-location').textContent = item.location;
  document.getElementById('lightbox-type').textContent = translateType(
    item.type
  );
  document.getElementById('lightbox-desc').innerHTML = renderMarkdown(
    item.description,
    true
  );

  const tagsContainer = document.getElementById('lightbox-tags');
  tagsContainer.innerHTML = item.tags
    ? item.tags
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('')
    : '';

  // Handle Image or fallback
  const lens = document.getElementById('magnifier-lens');
  if (item.imageUrl) {
    img.src = item.imageUrl;
    img.style.display = 'block';
    setupMagnifier(img, lens, item.imageUrl);
  } else {
    img.src = '';
    img.style.display = 'none';
    if (lens) lens.style.display = 'none';
  }

  lightbox.classList.add('active');
}

function setupMagnifier(img, lens, imgUrl) {
  // Disable if device supports touch/pointer is coarse
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  const zoomLevel = 2.5;

  // Cleanup old listeners if any exist by replacing the node
  const newImg = img.cloneNode(true);
  img.parentNode.replaceChild(newImg, img);
  img = newImg;

  if (!lens) return;

  lens.style.backgroundImage = `url('${imgUrl}')`;

  img.addEventListener('mouseenter', () => {
    lens.style.display = 'block';
    lens.style.backgroundSize = `${img.width * zoomLevel}px ${img.height * zoomLevel}px`;
  });

  img.addEventListener('mousemove', (e) => {
    e.preventDefault();
    const pos = getCursorPos(e, img);

    // Lens position (following cursor)
    lens.style.left = `${pos.x}px`;
    lens.style.top = `${pos.y}px`;

    // Calculate background position
    const bgX = pos.x * zoomLevel - lens.offsetWidth / 2;
    const bgY = pos.y * zoomLevel - lens.offsetHeight / 2;

    lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
  });

  img.addEventListener('mouseleave', () => {
    lens.style.display = 'none';
  });
}

function getCursorPos(e, img) {
  const rect = img.getBoundingClientRect();
  let x = e.pageX - rect.left - window.pageXOffset;
  let y = e.pageY - rect.top - window.pageYOffset;
  return { x, y };
}

// Lightbox close logic
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('gallery-lightbox');
  const closeBtn = document.getElementById('close-lightbox');

  if (closeBtn && lightbox) {
    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
      if (
        e.target === lightbox ||
        e.target.classList.contains('lightbox-layout') ||
        e.target.classList.contains('lightbox-image-container')
      ) {
        lightbox.classList.remove('active');
      }
    });
  }
});

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getSampleItems() {
  return [
    {
      id: '1',
      type: 'visual',
      title: 'Kantha Embroidery Patterns',
      description:
        'Traditional Kantha embroidery from rural Bengal, featuring intricate running stitch patterns depicting village life and nature.',
      location: 'Kantha Village, Bengal',
      imageUrl: '',
      tags: ['embroidery', 'textile'],
    },
    {
      id: '2',
      type: 'audio',
      title: 'Folk Songs of Rajasthan',
      description:
        'A collection of traditional folk songs passed down through generations in rural Rajasthan.',
      location: 'Jaisalmer, Rajasthan',
      imageUrl: '',
      tags: ['music', 'folk', 'oral-tradition'],
    },
    {
      id: '3',
      type: 'story',
      title: 'The Blue Door Legend',
      description:
        'An ancient story explaining why villagers in certain regions paint their doors blue to ward off evil spirits.',
      location: 'Jodhpur, Rajasthan',
      imageUrl: '',
      tags: ['legend', 'tradition', 'architecture'],
    },
    {
      id: '4',
      type: 'visual',
      title: 'Hawa Mahal Interior (360°)',
      description:
        'An immersive 360-degree view from inside the Palace of Winds.',
      location: 'Jaipur, Rajasthan',
      imageUrl:
        'https://images.unsplash.com/photo-1599661559863-718f6fdf3946?w=600&auto=format&fit=crop',
      panoramaUrl:
        'https://images.unsplash.com/photo-1557971370-e7298ee473cb?q=80&w=2560&auto=format&fit=crop', // Placeholder equirectangular
      tags: ['architecture', '360', 'heritage'],
      hotspots: [
        { lat: 10, lon: 45, info: 'Intricate Jharokhas (windows)' },
        { lat: -5, lon: -120, info: 'Courtyard view' },
      ],
    },
  ];
}
