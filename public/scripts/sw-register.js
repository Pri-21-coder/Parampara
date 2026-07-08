if ('serviceWorker' in navigator) {
  // Disable Service Worker caching on localhost to prevent caching issues during development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[ServiceWorker] Unregistered active service worker for development on localhost');
        });
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registration successful with scope: ', registration.scope);
        })
        .catch((err) => {
          console.log('[ServiceWorker] Registration failed: ', err);
        });
    });
  }
}

// Offline/Online Status Toasts
function showOfflineToast(message, type = 'warning') {
  // Remove existing toasts
  const existing = document.querySelector('.offline-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `offline-toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  // Auto-hide success toasts, keep warning until online
  if (type === 'success') {
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 4000);
  }
}

window.addEventListener('offline', () => {
  showOfflineToast('You are exploring offline. Some content is cached.', 'warning');
});

window.addEventListener('online', () => {
  showOfflineToast('Back online! Connection restored.', 'success');
});
