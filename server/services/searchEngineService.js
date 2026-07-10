// services/searchEngineService.js
const store = require('../../data/store');

class SearchEngineService {
  constructor() {
    this.culturalTerms = [];
    this.semanticIndex = new Map();
    this.phoneticMap = new Map();
    this.searchHistory = [];
    this.popularSearches = [];
    this.isIndexed = false;
    
    this.init();
  }

  init() {
    this.loadCulturalTerms();
    this.buildSemanticIndex();
    this.buildPhoneticMap();
    this.loadSearchHistory();
    console.log('✅ Search Engine Service initialized');
  }

  /**
   * Load cultural terms and their meanings
   */
  loadCulturalTerms() {
    this.culturalTerms = [
      // Art & Crafts
      { term: 'madhubani', meaning: 'Traditional folk art from Bihar', category: 'art', synonyms: ['madhubani painting', 'mithila art'] },
      { term: 'kantha', meaning: 'Traditional embroidery from Bengal', category: 'craft', synonyms: ['kantha stitch', 'bengali embroidery'] },
      { term: 'dokra', meaning: 'Traditional metal casting craft', category: 'craft', synonyms: ['dokra art', 'metal craft'] },
      { term: 'pattachitra', meaning: 'Traditional scroll painting from Odisha', category: 'art', synonyms: ['patta chitra', 'scroll painting'] },
      
      // Festivals
      { term: 'pongal', meaning: 'Harvest festival celebrated in Tamil Nadu', category: 'festival', synonyms: ['tamil harvest festival', 'pongal festival'] },
      { term: 'diwali', meaning: 'Festival of lights celebrated across India', category: 'festival', synonyms: ['deepavali', 'festival of lights'] },
      { term: 'holi', meaning: 'Festival of colors celebrated in spring', category: 'festival', synonyms: ['color festival', 'holi festival'] },
      { term: 'onam', meaning: 'Harvest festival of Kerala', category: 'festival', synonyms: ['kerala harvest festival', 'onam festival'] },
      
      // Traditions
      { term: 'kalaripayattu', meaning: 'Traditional martial art from Kerala', category: 'tradition', synonyms: ['kalari', 'kerala martial arts'] },
      { term: 'bihu', meaning: 'Assamese harvest festival', category: 'tradition', synonyms: ['assamese festival', 'bihu dance'] },
      { term: 'garba', meaning: 'Traditional Gujarati folk dance', category: 'tradition', synonyms: ['garba dance', 'gujarati dance'] },
      
      // Cultural Artifacts
      { term: 'tanjore painting', meaning: 'Traditional art form from Tamil Nadu', category: 'artifact', synonyms: ['tanjore art', 'thanjavur painting'] },
      { term: 'channapatna toys', meaning: 'Traditional wooden toys from Karnataka', category: 'artifact', synonyms: ['channapatna craft', 'wooden toys'] },
      
      // More terms...
      { term: 'warli', meaning: 'Traditional tribal art from Maharashtra', category: 'art', synonyms: ['warli painting', 'tribal art'] },
      { term: 'kathakali', meaning: 'Classical dance form from Kerala', category: 'performance', synonyms: ['kerala dance', 'kathakali dance'] },
      { term: 'bhutan', meaning: 'Traditional Bodo dance from Assam', category: 'performance', synonyms: ['bodo dance', 'assamese dance'] },
    ];
  }

  /**
   * Build semantic index
   */
  buildSemanticIndex() {
    this.culturalTerms.forEach(term => {
      // Index by term
      this.semanticIndex.set(term.term.toLowerCase(), term);
      
      // Index by synonyms
      term.synonyms.forEach(synonym => {
        this.semanticIndex.set(synonym.toLowerCase(), term);
      });
    });
  }

  /**
   * Build phonetic map for regional variations
   */
  buildPhoneticMap() {
    const phoneticRules = {
      'sh': 's',
      'ch': 'c',
      'ph': 'f',
      'th': 't',
      'kh': 'k',
      'gh': 'g',
      'dh': 'd',
      'bh': 'b'
    };
    
    this.culturalTerms.forEach(term => {
      const variations = this.generatePhoneticVariations(term.term, phoneticRules);
      variations.forEach(variation => {
        if (!this.phoneticMap.has(variation)) {
          this.phoneticMap.set(variation, []);
        }
        this.phoneticMap.get(variation).push(term);
      });
    });
  }

  /**
   * Generate phonetic variations of a word
   */
  generatePhoneticVariations(word, rules) {
    const variations = [word.toLowerCase()];
    const wordLower = word.toLowerCase();
    
    Object.entries(rules).forEach(([pattern, replacement]) => {
      if (wordLower.includes(pattern)) {
        variations.push(wordLower.replace(pattern, replacement));
      }
    });
    
    // Handle common Indian phonetic variations
    const commonVariations = {
      'a': ['aa', 'uh'],
      'i': ['ee', 'ih'],
      'u': ['oo', 'uh'],
      'e': ['eh'],
      'o': ['oh']
    };
    
    Object.entries(commonVariations).forEach(([vowel, replacements]) => {
      replacements.forEach(replacement => {
        if (wordLower.includes(vowel)) {
          variations.push(wordLower.replace(vowel, replacement));
        }
      });
    });
    
    return variations;
  }

  /**
   * Load search history
   */
  loadSearchHistory() {
    this.searchHistory = store.searchHistory || [];
    this.popularSearches = this.calculatePopularSearches();
  }

  /**
   * Calculate popular searches
   */
  calculatePopularSearches() {
    const counts = {};
    this.searchHistory.forEach(item => {
      const query = item.query.toLowerCase();
      counts[query] = (counts[query] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * Main search function
   */
  async search(query, options = {}) {
    const startTime = Date.now();
    
    // Log search
    this.logSearch(query, options);
    
    // Perform search
    const results = await this.performSearch(query, options);
    
    // Get recommendations
    const recommendations = options.includeRecommendations ? 
      await this.getRecommendations(query, results) : [];
    
    const responseTime = Date.now() - startTime;
    
    return {
      query,
      results,
      recommendations,
      total: results.length,
      responseTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform actual search
   */
  async performSearch(query, options = {}) {
    const queryLower = query.toLowerCase();
    let results = [];
    const sources = options.sources || ['all'];

    // 1. Semantic Search
    const semanticResults = this.semanticSearch(queryLower);
    results = [...results, ...semanticResults];

    // 2. Phonetic Search
    const phoneticResults = this.phoneticSearch(queryLower);
    results = [...results, ...phoneticResults];

    // 3. Full-text Search
    const textResults = this.fullTextSearch(queryLower);
    results = [...results, ...textResults];

    // 4. Cultural Context Search
    const culturalResults = this.culturalContextSearch(queryLower);
    results = [...results, ...culturalResults];

    // Remove duplicates and rank
    results = this.deduplicateAndRank(results);

    // Apply filters
    if (options.category) {
      results = results.filter(r => r.category === options.category);
    }

    // Limit results
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Semantic search
   */
  semanticSearch(query) {
    const results = [];
    
    // Exact match
    if (this.semanticIndex.has(query)) {
      const term = this.semanticIndex.get(query);
      results.push({
        ...term,
        score: 100,
        matchType: 'semantic_exact',
        source: 'semantic'
      });
    }

    // Partial match
    this.semanticIndex.forEach((term, key) => {
      if (key.includes(query) || query.includes(key)) {
        results.push({
          ...term,
          score: 70,
          matchType: 'semantic_partial',
          source: 'semantic'
        });
      }
    });

    return results;
  }

  /**
   * Phonetic search
   */
  phoneticSearch(query) {
    const results = [];
    
    if (this.phoneticMap.has(query)) {
      const terms = this.phoneticMap.get(query);
      terms.forEach(term => {
        results.push({
          ...term,
          score: 85,
          matchType: 'phonetic',
          source: 'phonetic'
        });
      });
    }

    return results;
  }

  /**
   * Full-text search
   */
  fullTextSearch(query) {
    const results = [];
    const contentItems = store.culturalItems || [];
    
    contentItems.forEach(item => {
      const searchText = `${item.title} ${item.description} ${item.tags || ''}`.toLowerCase();
      if (searchText.includes(query)) {
        const score = this.calculateRelevance(query, searchText);
        results.push({
          ...item,
          score,
          matchType: 'full_text',
          source: 'content'
        });
      }
    });

    return results;
  }

  /**
   * Cultural context search
   */
  culturalContextSearch(query) {
    const results = [];
    
    // Check if query matches any cultural context
    const contexts = {
      'art': ['painting', 'sculpture', 'craft', 'artwork'],
      'festival': ['celebration', 'festivities', 'holiday'],
      'tradition': ['custom', 'ritual', 'practice'],
      'craft': ['handicraft', 'handmade', 'artisan'],
      'performance': ['dance', 'music', 'theater']
    };

    Object.entries(contexts).forEach(([context, keywords]) => {
      if (keywords.some(kw => query.includes(kw))) {
        // Get all items in this context
        const contextItems = store.culturalItems.filter(item => 
          item.category === context || item.tags?.includes(context)
        );
        contextItems.forEach(item => {
          results.push({
            ...item,
            score: 60,
            matchType: 'cultural_context',
            source: 'context'
          });
        });
      }
    });

    return results;
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(query, text) {
    const queryWords = query.split(/\s+/);
    let score = 0;
    
    queryWords.forEach(word => {
      if (text.includes(word)) {
        score += 20;
        // Bonus for exact phrase
        if (text.includes(query)) {
          score += 30;
        }
      }
    });
    
    return Math.min(score, 100);
  }

  /**
   * Deduplicate and rank results
   */
  deduplicateAndRank(results) {
    const seen = new Map();
    const ranked = [];
    
    results.forEach(result => {
      const key = result.id || result.term;
      if (!seen.has(key) || seen.get(key).score < result.score) {
        seen.set(key, result);
      }
    });
    
    // Sort by score
    ranked.push(...Array.from(seen.values()));
    ranked.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    return ranked;
  }

  /**
   * Get recommendations based on search
   */
  async getRecommendations(query, results) {
    // Use recommendation engine if available
    try {
      const RecommendationEngine = require('./recommendationEngine');
      const engine = new RecommendationEngine();
      await engine.trainModel();
      
      // Get recommendations based on top result
      if (results.length > 0 && results[0].id) {
        const recs = await engine.getSimilarContent(results[0].id, 5);
        return recs;
      }
    } catch (error) {
      console.log('Recommendation engine not available');
    }
    
    return [];
  }

  /**
   * Log search for analytics
   */
  logSearch(query, options) {
    const entry = {
      query,
      timestamp: new Date().toISOString(),
      options: options || {},
      userId: options.userId || 'anonymous'
    };
    
    this.searchHistory.push(entry);
    store.searchHistory = this.searchHistory;
    
    // Update popular searches
    this.popularSearches = this.calculatePopularSearches();
  }

  /**
   * Get search suggestions (autocomplete)
   */
  getSuggestions(query) {
    const queryLower = query.toLowerCase();
    const suggestions = [];
    
    // From semantic index
    this.semanticIndex.forEach((term, key) => {
      if (key.startsWith(queryLower) && !suggestions.includes(term.term)) {
        suggestions.push(term.term);
      }
    });
    
    // From popular searches
    this.popularSearches.forEach(item => {
      if (item.query.startsWith(queryLower) && !suggestions.includes(item.query)) {
        suggestions.push(item.query);
      }
    });
    
    return suggestions.slice(0, 10);
  }

  /**
   * Get search analytics
   */
  getAnalytics(period = 'week') {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }
    
    const recentSearches = this.searchHistory.filter(
      entry => new Date(entry.timestamp) >= startDate
    );
    
    // Calculate metrics
    const totalSearches = recentSearches.length;
    const uniqueUsers = new Set(recentSearches.map(e => e.userId)).size;
    const topQueries = this.calculatePopularSearches();
    
    return {
      period,
      totalSearches,
      uniqueUsers,
      averageSearchesPerUser: uniqueUsers > 0 ? totalSearches / uniqueUsers : 0,
      topQueries: topQueries.slice(0, 10),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get search stats
   */
  getStats() {
    return {
      totalSearches: this.searchHistory.length,
      uniqueTerms: this.semanticIndex.size,
      popularSearches: this.popularSearches.slice(0, 10),
      categories: this.culturalTerms.reduce((acc, term) => {
        acc[term.category] = (acc[term.category] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Image search
   */
  async imageSearch(imageUrl, options = {}) {
    // In production, would use actual image recognition
    // For now, simulate with tag matching
    
    const tags = await this.extractImageTags(imageUrl);
    const results = [];
    
    // Search content by tags
    const contentItems = store.culturalItems || [];
    contentItems.forEach(item => {
      const itemTags = item.tags || [];
      const matchScore = tags.filter(tag => 
        itemTags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
      ).length;
      
      if (matchScore > 0) {
        results.push({
          ...item,
          score: Math.min(matchScore / tags.length * 100, 100),
          matchType: 'image'
        });
      }
    });
    
    return results;
  }

  /**
   * Extract tags from image
   */
  async extractImageTags(imageUrl) {
    // In production, would use actual image recognition API
    // For now, simulate tag extraction
    const mockTags = ['art', 'craft', 'traditional', 'handmade'];
    return mockTags;
  }

  /**
   * Voice search
   */
  async voiceSearch(audioData) {
    // In production, would use speech-to-text service
    // For now, simulate voice search with text
    
    // Simulate conversion from speech to text
    const text = this.simulateSpeechToText(audioData);
    
    // Perform search with the text
    return this.search(text);
  }

  /**
   * Simulate speech to text
   */
  simulateSpeechToText(audioData) {
    // In production, would use actual speech-to-text
    // For now, return sample text based on audio data
    const sampleQueries = [
      'madhubani painting',
      'traditional crafts',
      'cultural festivals',
      'heritage sites'
    ];
    return sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
  }

  /**
   * Rebuild index
   */
  async rebuildIndex() {
    console.log('🔄 Rebuilding search index...');
    this.semanticIndex.clear();
    this.phoneticMap.clear();
    
    this.loadCulturalTerms();
    this.buildSemanticIndex();
    this.buildPhoneticMap();
    this.loadSearchHistory();
    
    this.isIndexed = true;
    console.log('✅ Search index rebuilt');
    
    return {
      status: 'success',
      termsIndexed: this.semanticIndex.size,
      phoneticEntries: this.phoneticMap.size
    };
  }
}

module.exports = SearchEngineService;