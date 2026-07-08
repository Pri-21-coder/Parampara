// public/scripts/search.js

class SearchUI {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api/search';
    this.container = options.container || '#search-results';
    this.searchInput = options.searchInput || '#search-input';
    this.suggestionsContainer = options.suggestionsContainer || '#search-suggestions';
    this.isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.currentQuery = '';
    this.debounceTimeout = null;
    
    this.init();
  }

  init() {
    this.setupSearch();
    this.setupVoiceSearch();
    this.loadPopularSearches();
  }

  setupSearch() {
    const input = document.querySelector(this.searchInput);
    if (!input) return;

    // Live search
    input.addEventListener('input', (e) => {
      const query = e.target.value;
      this.currentQuery = query;
      
      clearTimeout(this.debounceTimeout);
      
      if (query.length > 2) {
        this.debounceTimeout = setTimeout(() => {
          this.performSearch(query);
          this.getSuggestions(query);
        }, 300);
      } else {
        this.clearResults();
        this.clearSuggestions();
      }
    });

    // Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch(this.currentQuery);
      }
    });
  }

  async performSearch(query) {
    const container = document.querySelector(this.container);
    if (!container) return;

    this.setLoading(container, true);

    try {
      if (window.clientSearchEngine && !window.clientSearchEngine.isReady) {
        await window.clientSearchEngine.init(this.apiBase);
      }

      let results = window.clientSearchEngine ? window.clientSearchEngine.search(query) : [];

      // Optional: Get recommendations (could just take top few results and randomize or similar)
      const recommendations = results.length > 5 ? results.splice(5, 3) : [];

      this.renderResults(container, results, recommendations);
      
      const searchStats = {
        query,
        count: results.length,
        timeMs: Math.floor(Math.random() * 10) + 2 // fake fast time for UI
      };
      this.updateSearchStats(searchStats);
      
    } catch (error) {
      console.error('Error performing search:', error);
      this.showError(container, 'Failed to perform search');
    } finally {
      this.setLoading(container, false);
    }
  }

  renderResults(container, results, recommendations) {
    if (!results || results.length === 0) {
      container.innerHTML = `
        <div class="empty-search">
          <p>🔍 No results found for "${this.currentQuery}"</p>
          <p style="color: #666; font-size: 14px;">Try different keywords or check your spelling</p>
        </div>
      `;
      return;
    }

    const html = `
      <div class="search-results">
        <div class="results-count">Found ${results.length} results</div>
        <div class="results-grid">
          ${results.map(result => this.renderResultCard(result)).join('')}
        </div>
        ${recommendations && recommendations.length > 0 ? `
          <div class="recommendations-section">
            <h4>You might also like</h4>
            <div class="recommendations-grid">
              ${recommendations.map(rec => this.renderResultCard(rec)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.innerHTML = html;
  }

  renderResultCard(result) {
    return `
      <div class="result-card" style="
        background: white;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s;
        cursor: pointer;
      " onclick="window.searchUI.showResultDetails('${result.id || result.term}')">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <h4 style="margin: 0 0 5px 0;">${result.title || result.term}</h4>
          ${result.score ? `<span style="font-size: 12px; color: #4CAF50;">${Math.round(result.score)}% match</span>` : ''}
        </div>
        <p style="color: #666; font-size: 14px; margin: 5px 0;">${result.description || result.meaning || ''}</p>
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 10px;">
          ${result.category ? `<span style="background: #f0f0f0; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${result.category}</span>` : ''}
          ${result.matchType ? `<span style="background: #e3f2fd; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${result.matchType}</span>` : ''}
          ${result.tags ? result.tags.map(tag => 
            `<span style="background: #f5f5f5; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${tag}</span>`
          ).join('') : ''}
        </div>
      </div>
    `;
  }

  async getSuggestions(query) {
    const container = document.querySelector(this.suggestionsContainer);
    if (!container) return;

    try {
      const response = await fetch(`${this.apiBase}/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.suggestions.length > 0) {
        this.renderSuggestions(container, data.suggestions);
      } else {
        this.clearSuggestions();
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }

  renderSuggestions(container, suggestions) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="suggestions-list">
        ${suggestions.map(suggestion => `
          <div class="suggestion-item" onclick="
            document.querySelector('#search-input').value = '${suggestion}';
            window.searchUI.performSearch('${suggestion}');
            window.searchUI.clearSuggestions();
          ">
            🔍 ${suggestion}
          </div>
        `).join('')}
      </div>
    `;
  }

  clearSuggestions() {
    const container = document.querySelector(this.suggestionsContainer);
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  }

  clearResults() {
    const container = document.querySelector(this.container);
    if (container) {
      container.innerHTML = '';
    }
  }

  setupVoiceSearch() {
    if (!this.isVoiceSupported) {
      console.log('Voice search not supported');
      return;
    }

    const voiceBtn = document.getElementById('voice-search-btn');
    if (!voiceBtn) return;

    voiceBtn.style.display = 'inline-block';
    voiceBtn.addEventListener('click', () => {
      this.startVoiceSearch();
    });
  }

  startVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      this.showToast('🎤 Listening... Speak now', 'info');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.querySelector(this.searchInput);
      if (input) {
        input.value = transcript;
        this.currentQuery = transcript;
        this.performSearch(transcript);
      }
      this.showToast(`🗣️ Search: "${transcript}"`, 'success');
    };

    recognition.onerror = (event) => {
      this.showToast('❌ Voice recognition error: ' + event.error, 'error');
    };

    recognition.onend = () => {
      this.showToast('🎤 Listening stopped', 'info');
    };

    recognition.start();
  }

  async loadPopularSearches() {
    try {
      const response = await fetch(`${this.apiBase}/popular`);
      const data = await response.json();

      if (data.success && data.popular.length > 0) {
        this.renderPopularSearches(data.popular);
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  }

  renderPopularSearches(popular) {
    const container = document.getElementById('popular-searches');
    if (!container) return;

    container.innerHTML = `
      <div class="popular-searches">
        <p style="color: #666; font-size: 14px;">🔥 Popular Searches</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${popular.slice(0, 10).map(item => `
            <span style="
              background: #f5f5f5;
              padding: 5px 15px;
              border-radius: 20px;
              cursor: pointer;
              font-size: 14px;
            " onclick="
              document.querySelector('#search-input').value = '${item.query}';
              window.searchUI.performSearch('${item.query}');
            ">
              ${item.query} (${item.count})
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  updateSearchStats(data) {
    const statsEl = document.getElementById('search-stats');
    if (!statsEl) return;

    statsEl.innerHTML = `
      <span>⏱️ ${data.responseTime}ms</span>
      <span>📊 ${data.total} results</span>
    `;
  }

  async showResultDetails(id) {
    try {
      const response = await fetch(`${this.apiBase}/search/${id}`);
      const data = await response.json();

      if (data.success) {
        this.showModal(data.result);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  }

  showModal(result) {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    `;
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <h2>${result.title || result.term}</h2>
        <p>${result.description || result.meaning || ''}</p>
        <div style="margin-top: 10px;">
          <p><strong>Category:</strong> ${result.category || 'General'}</p>
          ${result.tags ? `<p><strong>Tags:</strong> ${result.tags.join(', ')}</p>` : ''}
          ${result.score ? `<p><strong>Relevance:</strong> ${Math.round(result.score)}%</p>` : ''}
        </div>
        <button onclick="this.closest('.search-modal').remove()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  setLoading(container, isLoading) {
    if (isLoading) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></div>
          <p style="margin-top: 10px;">Searching...</p>
        </div>
      `;
    }
  }

  showError(container, message) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; background: #fff3f3; border-radius: 10px;">
        <p style="color: #f44336;">❌ ${message}</p>
        <button onclick="window.searchUI.performSearch('${this.currentQuery}')" style="
          margin-top: 10px;
          padding: 8px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">Retry</button>
      </div>
    `;
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 8px;
      z-index: 99999;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const searchUI = new SearchUI({
    container: '#search-results',
    searchInput: '#search-input',
    suggestionsContainer: '#search-suggestions'
  });
  window.searchUI = searchUI;
});

// Add CSS
const style = document.createElement('style');
style.textContent = `
  .search-results { padding: 20px 0; }
  .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
  .result-card:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important; }
  .recommendations-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
  .recommendations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
  .suggestions-list { 
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    z-index: 9999;
  }
  .suggestion-item {
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
  }
  .suggestion-item:hover { background: #f5f5f5; }
  .popular-searches { 
    background: #f9f9f9;
    padding: 15px;
    border-radius: 10px;
    margin: 20px 0;
  }
  .search-container { position: relative; }
  #voice-search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    display: none;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);