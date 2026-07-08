/**
 * Global Utility Functions for Parampara
 */

/**
 * Debounce utility to delay function execution until after a specified wait time
 * has elapsed since the last time the debounced function was invoked.
 * 
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


/**
 * WorkerManager utility to handle background tasks using Web Workers
 */
class WorkerManager {
  constructor(workerUrl = 'scripts/dataWorker.js') {
    this.worker = new Worker(workerUrl);
    this.jobIdCounter = 0;
    this.callbacks = new Map();

    this.worker.onmessage = (e) => {
      const { jobId, success, result, error } = e.data;
      if (this.callbacks.has(jobId)) {
        const { resolve, reject } = this.callbacks.get(jobId);
        this.callbacks.delete(jobId);
        if (success) {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
    };
  }

  runJob(action, payload) {
    return new Promise((resolve, reject) => {
      const jobId = ++this.jobIdCounter;
      this.callbacks.set(jobId, { resolve, reject });
      this.worker.postMessage({ action, payload, jobId });
    });
  }

  terminate() {
    this.worker.terminate();
    this.callbacks.clear();
  }
}

// Instantiate a global worker manager
window.dataWorker = new WorkerManager();

// --- CSRF Fetch Interceptor ---
(function() {
  const originalFetch = window.fetch;
  let cachedCsrfToken = null;
  let isFetchingToken = false;
  let tokenPromise = null;

  async function getCsrfToken() {
    if (cachedCsrfToken) return cachedCsrfToken;
    if (isFetchingToken) return tokenPromise;
    
    isFetchingToken = true;
    tokenPromise = originalFetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => {
        cachedCsrfToken = data.csrfToken;
        isFetchingToken = false;
        return cachedCsrfToken;
      })
      .catch(err => {
        console.error('Failed to fetch CSRF token', err);
        isFetchingToken = false;
        return null;
      });
      
    return tokenPromise;
  }

  window.fetch = async function() {
    const url = arguments[0];
    const options = arguments[1] || {};
    const method = (options.method || 'GET').toUpperCase();
    
    // Auto-hash outgoing JSON data
    if (['POST', 'PUT', 'PATCH'].includes(method) && typeof url === 'string' && url.startsWith('/api/')) {
      if (options.body && typeof options.body === 'string') {
        try {
          const bodyData = JSON.parse(options.body);
          if (typeof bodyData === 'object' && window.CryptoUtils && window.CryptoUtils.hashObject) {
            bodyData.hash = await window.CryptoUtils.hashObject(bodyData);
            options.body = JSON.stringify(bodyData);
          }
        } catch (e) {
          // ignore parsing error if it's not JSON
        }
      }
    }

    // CSRF token logic for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && typeof url === 'string' && url.startsWith('/api/')) {
      const token = await getCsrfToken();
      if (token) {
        options.headers = options.headers || {};
        if (options.headers instanceof Headers) {
          options.headers.set('X-CSRF-Token', token);
        } else {
          options.headers['X-CSRF-Token'] = token;
        }
        arguments[1] = options;
      }
    }
    
    const response = await originalFetch.apply(this, arguments);

    // Auto-verify incoming JSON data for GET requests
    if (method === 'GET' && typeof url === 'string' && url.startsWith('/api/') && window.CryptoUtils) {
      // Intercept the .json() method of the response
      const originalJson = response.json.bind(response);
      response.json = async function() {
        const data = await originalJson();
        
        async function verify(item) {
          if (Array.isArray(item)) {
            await Promise.all(item.map(verify));
          } else if (item && typeof item === 'object') {
            if (item.hash && window.IntegrityBadge && window.IntegrityBadge.verifyItem) {
              await window.IntegrityBadge.verifyItem(item);
            }
            // recursively check nested properties if they are arrays (e.g. nested items)
            for (const key in item) {
              if (Array.isArray(item[key])) {
                 await verify(item[key]);
              }
            }
          }
        }
        
        try {
           await verify(data);
        } catch (e) {
           console.error("Error verifying integrity:", e);
        }
        return data;
      };
    }

    return response;
  };
})();
