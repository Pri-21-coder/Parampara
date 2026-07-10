// services/recommendationEngine.js
const store = require('../../data/store');

class RecommendationEngine {
  constructor() {
    this.userItemMatrix = new Map();
    this.itemSimilarityMatrix = new Map();
    this.contentVectors = new Map();
    this.userPreferences = new Map();
    this.interactionHistory = [];
    this.model = null;
    this.isTrained = false;
  }

  /**
   * Train the recommendation model
   */
  async trainModel() {
    console.log('🔄 Training recommendation model...');
    
    try {
      // Get all interactions
      const interactions = await this.getUserInteractions();
      
      // Build user-item matrix
      this.buildUserItemMatrix(interactions);
      
      // Build content vectors
      await this.buildContentVectors();
      
      // Train collaborative filtering
      await this.trainCollaborativeFiltering(interactions);
      
      // Train content-based filtering
      await this.trainContentBasedFiltering();
      
      this.isTrained = true;
      console.log('✅ Recommendation model trained successfully!');
      
      return {
        status: 'success',
        message: 'Model trained successfully',
        interactions: interactions.length,
        users: this.userItemMatrix.size,
        items: this.contentVectors.size
      };
    } catch (error) {
      console.error('❌ Error training model:', error);
      throw error;
    }
  }

  /**
   * Get user interactions
   */
  async getUserInteractions() {
    // Get interactions from store or database
    const interactions = store.userInteractions || [];
    
    // If no interactions, use sample data
    if (interactions.length === 0) {
      return this.generateSampleInteractions();
    }
    
    return interactions;
  }

  /**
   * Generate sample interactions for testing
   */
  generateSampleInteractions() {
    const sampleUsers = ['user1', 'user2', 'user3', 'user4', 'user5'];
    const contentItems = store.culturalItems || [];
    const interactions = [];

    sampleUsers.forEach(userId => {
      // Each user views 5-10 items
      const numInteractions = Math.floor(Math.random() * 6) + 5;
      const shuffled = [...contentItems].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(numInteractions, shuffled.length); i++) {
        const item = shuffled[i];
        const interactionTypes = ['view', 'click', 'save', 'share', 'complete'];
        const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
        
        interactions.push({
          user_id: userId,
          content_id: item.id,
          content_type: item.type || 'cultural_item',
          interaction_type: type,
          interaction_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          session_id: `session_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            duration: Math.floor(Math.random() * 300) + 10,
            rating: Math.floor(Math.random() * 5) + 1
          }
        });
      }
    });

    return interactions;
  }

  /**
   * Build user-item matrix
   */
  buildUserItemMatrix(interactions) {
    const matrix = new Map();
    
    interactions.forEach(interaction => {
      const userId = interaction.user_id;
      const contentId = interaction.content_id;
      
      if (!matrix.has(userId)) {
        matrix.set(userId, new Map());
      }
      
      const userRow = matrix.get(userId);
      const currentScore = userRow.get(contentId) || 0;
      
      // Weight different interactions
      const weights = {
        'view': 1,
        'click': 2,
        'save': 4,
        'share': 5,
        'complete': 3
      };
      
      const weight = weights[interaction.interaction_type] || 1;
      userRow.set(contentId, currentScore + weight);
    });
    
    this.userItemMatrix = matrix;
    console.log(`📊 Built user-item matrix with ${matrix.size} users`);
  }

  /**
   * Build content vectors for content-based filtering
   */
  async buildContentVectors() {
    const contentItems = store.culturalItems || [];
    
    contentItems.forEach(item => {
      const vector = this.createContentVector(item);
      this.contentVectors.set(item.id, vector);
    });
    
    console.log(`📊 Built content vectors for ${this.contentVectors.size} items`);
  }

  /**
   * Create vector representation of content
   */
  createContentVector(item) {
    const vector = {
      tags: item.tags || [],
      location: item.location || '',
      category: item.category || 'general',
      era: item.era || 'modern',
      popularity: item.popularity || 0,
      title: item.title || '',
      description: item.description || ''
    };
    
    return vector;
  }

  /**
   * Train collaborative filtering
   */
  async trainCollaborativeFiltering(interactions) {
    // Build similarity matrix
    const items = Array.from(this.userItemMatrix.values())
      .flatMap(row => Array.from(row.keys()));
    const uniqueItems = [...new Set(items)];
    
    // Calculate item-item similarity
    uniqueItems.forEach((item1, i) => {
      uniqueItems.forEach((item2, j) => {
        if (i >= j) return;
        
        const similarity = this.calculateItemSimilarity(item1, item2);
        if (similarity > 0.1) {
          if (!this.itemSimilarityMatrix.has(item1)) {
            this.itemSimilarityMatrix.set(item1, new Map());
          }
          this.itemSimilarityMatrix.get(item1).set(item2, similarity);
          this.itemSimilarityMatrix.get(item2).set(item1, similarity);
        }
      });
    });
    
    console.log(`🔗 Built similarity matrix with ${this.itemSimilarityMatrix.size} items`);
  }

  /**
   * Calculate similarity between two items
   */
  calculateItemSimilarity(item1, item2) {
    const users1 = new Set();
    const users2 = new Set();
    
    this.userItemMatrix.forEach((row, userId) => {
      if (row.has(item1)) users1.add(userId);
      if (row.has(item2)) users2.add(userId);
    });
    
    const intersection = new Set([...users1].filter(x => users2.has(x)));
    const union = new Set([...users1, ...users2]);
    
    if (union.size === 0) return 0;
    
    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Train content-based filtering
   */
  async trainContentBasedFiltering() {
    // Content-based is ready after building vectors
    console.log('📚 Content-based filtering ready');
  }

  /**
   * Get recommendations for a user
   */
  async getRecommendations(userId, limit = 10) {
    console.log(`🎯 Getting recommendations for user: ${userId}`);
    
    try {
      // Get collaborative recommendations
      const collaborative = await this.collaborativeFilter(userId, limit * 2);
      
      // Get content-based recommendations
      const contentBased = await this.contentBasedFilter(userId, limit * 2);
      
      // Combine and rank
      const recommendations = this.hybridRanking(collaborative, contentBased, limit);
      
      // Get full content details
      const fullRecommendations = recommendations.map(rec => {
        const content = store.culturalItems.find(item => item.id === rec.id);
        return {
          ...rec,
          ...content,
          score: rec.score
        };
      });
      
      // Cache recommendations
      await this.cacheRecommendations(userId, fullRecommendations);
      
      return fullRecommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Collaborative filtering recommendation
   */
  async collaborativeFilter(userId, limit = 20) {
    if (!this.userItemMatrix.has(userId)) {
      return this.handleColdStart(limit);
    }
    
    const userRow = this.userItemMatrix.get(userId);
    const userItems = Array.from(userRow.keys());
    
    // Find similar users
    const similarUsers = [];
    this.userItemMatrix.forEach((row, otherUserId) => {
      if (otherUserId === userId) return;
      
      const otherItems = Array.from(row.keys());
      const commonItems = userItems.filter(item => otherItems.includes(item));
      
      if (commonItems.length > 0) {
        const similarity = commonItems.length / Math.sqrt(userItems.length * otherItems.length);
        similarUsers.push({ userId: otherUserId, similarity });
      }
    });
    
    // Sort by similarity
    similarUsers.sort((a, b) => b.similarity - a.similarity);
    
    // Get recommendations from similar users
    const recommendations = new Map();
    similarUsers.slice(0, 5).forEach(similar => {
      const otherRow = this.userItemMatrix.get(similar.userId);
      otherRow.forEach((score, itemId) => {
        if (!userItems.includes(itemId)) {
          const currentScore = recommendations.get(itemId) || 0;
          recommendations.set(itemId, currentScore + score * similar.similarity);
        }
      });
    });
    
    // Sort and return
    return Array.from(recommendations.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Content-based filtering recommendation
   */
  async contentBasedFilter(userId, limit = 20) {
    if (!this.userItemMatrix.has(userId)) {
      return this.handleColdStart(limit);
    }
    
    const userRow = this.userItemMatrix.get(userId);
    const userItems = Array.from(userRow.keys());
    
    // Get user's content preferences
    const userPreferences = this.getUserPreferences(userId, userItems);
    
    // Score all items
    const recommendations = [];
    this.contentVectors.forEach((vector, itemId) => {
      if (userItems.includes(itemId)) return;
      
      const similarity = this.calculateContentSimilarity(userPreferences, vector);
      if (similarity > 0.1) {
        recommendations.push({ id: itemId, score: similarity });
      }
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get user preferences from their interactions
   */
  getUserPreferences(userId, userItems) {
    const preferences = {
      tags: new Map(),
      categories: new Map(),
      locations: new Map(),
      eras: new Map()
    };
    
    userItems.forEach(itemId => {
      const vector = this.contentVectors.get(itemId);
      if (vector) {
        vector.tags.forEach(tag => {
          preferences.tags.set(tag, (preferences.tags.get(tag) || 0) + 1);
        });
        preferences.categories.set(
          vector.category,
          (preferences.categories.get(vector.category) || 0) + 1
        );
        if (vector.location) {
          preferences.locations.set(
            vector.location,
            (preferences.locations.get(vector.location) || 0) + 1
          );
        }
        if (vector.era) {
          preferences.eras.set(
            vector.era,
            (preferences.eras.get(vector.era) || 0) + 1
          );
        }
      }
    });
    
    return preferences;
  }

  /**
   * Calculate content similarity
   */
  calculateContentSimilarity(preferences, vector) {
    let score = 0;
    
    // Tags similarity
    vector.tags.forEach(tag => {
      if (preferences.tags.has(tag)) {
        score += preferences.tags.get(tag) * 2;
      }
    });
    
    // Category similarity
    if (preferences.categories.has(vector.category)) {
      score += preferences.categories.get(vector.category) * 3;
    }
    
    // Location similarity
    if (vector.location && preferences.locations.has(vector.location)) {
      score += preferences.locations.get(vector.location) * 1.5;
    }
    
    // Era similarity
    if (vector.era && preferences.eras.has(vector.era)) {
      score += preferences.eras.get(vector.era) * 1.5;
    }
    
    return score / 10; // Normalize
  }

  /**
   * Hybrid ranking
   */
  hybridRanking(collaborative, contentBased, limit) {
    const combined = new Map();
    
    // Combine with weights
    const weights = { collab: 0.6, content: 0.4 };
    
    collaborative.forEach(rec => {
      combined.set(rec.id, {
        id: rec.id,
        collabScore: rec.score,
        contentScore: 0,
        score: rec.score * weights.collab
      });
    });
    
    contentBased.forEach(rec => {
      if (combined.has(rec.id)) {
        const item = combined.get(rec.id);
        item.contentScore = rec.score;
        item.score = (item.collabScore * weights.collab) + (rec.score * weights.content);
      } else {
        combined.set(rec.id, {
          id: rec.id,
          collabScore: 0,
          contentScore: rec.score,
          score: rec.score * weights.content
        });
      }
    });
    
    // Add diversity
    const recommendations = Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit * 2);
    
    // Apply diversity
    const diverse = this.applyDiversity(recommendations, limit);
    
    return diverse;
  }

  /**
   * Apply diversity to recommendations
   */
  applyDiversity(recommendations, limit) {
    const selected = [];
    const categories = new Set();
    
    for (const rec of recommendations) {
      if (selected.length >= limit) break;
      
      const item = store.culturalItems.find(item => item.id === rec.id);
      if (!item) continue;
      
      // Ensure diversity by category
      const category = item.category || 'general';
      if (categories.size < 3 || !categories.has(category)) {
        categories.add(category);
        selected.push(rec);
      }
    }
    
    // If we still need more, add from the rest
    if (selected.length < limit) {
      for (const rec of recommendations) {
        if (selected.length >= limit) break;
        if (!selected.some(s => s.id === rec.id)) {
          selected.push(rec);
        }
      }
    }
    
    return selected;
  }

  /**
   * Handle cold start (new user or no data)
   */
  handleColdStart(limit) {
    // Return popular items
    const items = store.culturalItems || [];
    const popular = items
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
      .map(item => ({ id: item.id, score: 1 }));
    
    return popular;
  }

  /**
   * Get similar content
   */
  async getSimilarContent(contentId, limit = 5) {
    if (!this.itemSimilarityMatrix.has(contentId)) {
      return [];
    }
    
    const similar = Array.from(this.itemSimilarityMatrix.get(contentId).entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Get full content details
    return similar.map(rec => {
      const content = store.culturalItems.find(item => item.id === rec.id);
      return {
        ...rec,
        ...content
      };
    });
  }

  /**
   * Cache recommendations
   */
  async cacheRecommendations(userId, recommendations) {
    const cache = {
      userId,
      recommendations,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    };
    
    store.recommendationCache = store.recommendationCache || [];
    const existing = store.recommendationCache.findIndex(c => c.userId === userId);
    
    if (existing >= 0) {
      store.recommendationCache[existing] = cache;
    } else {
      store.recommendationCache.push(cache);
    }
  }

  /**
   * Get cached recommendations
   */
  async getCachedRecommendations(userId) {
    const cache = (store.recommendationCache || [])
      .find(c => c.userId === userId && new Date(c.expiresAt) > new Date());
    
    return cache ? cache.recommendations : null;
  }

  /**
   * Track user interaction for feedback
   */
  async trackInteraction(userId, contentId, action, metadata = {}) {
    const interaction = {
      user_id: userId,
      content_id: contentId,
      content_type: 'cultural_item',
      interaction_type: action,
      interaction_time: new Date().toISOString(),
      session_id: metadata.sessionId || 'unknown',
      metadata
    };
    
    store.userInteractions = store.userInteractions || [];
    store.userInteractions.push(interaction);
    
    // Retrain model periodically
    if (store.userInteractions.length % 50 === 0) {
      await this.trainModel();
    }
    
    return interaction;
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(startDate, endDate) {
    const interactions = store.userInteractions || [];
    const filtered = interactions.filter(i => 
      new Date(i.interaction_time) >= new Date(startDate) &&
      new Date(i.interaction_time) <= new Date(endDate)
    );
    
    const metrics = {
      totalInteractions: filtered.length,
      uniqueUsers: new Set(filtered.map(i => i.user_id)).size,
      interactionsByType: {},
      topContents: new Map()
    };
    
    filtered.forEach(interaction => {
      // Count by type
      metrics.interactionsByType[interaction.interaction_type] = 
        (metrics.interactionsByType[interaction.interaction_type] || 0) + 1;
      
      // Count by content
      metrics.topContents.set(
        interaction.content_id,
        (metrics.topContents.get(interaction.content_id) || 0) + 1
      );
    });
    
    // Get top contents
    metrics.topContents = Array.from(metrics.topContents.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return metrics;
  }

  /**
   * Get model statistics
   */
  getModelStats() {
    return {
      isTrained: this.isTrained,
      totalUsers: this.userItemMatrix.size,
      totalItems: this.contentVectors.size,
      totalInteractions: store.userInteractions ? store.userInteractions.length : 0,
      similarItems: this.itemSimilarityMatrix.size
    };
  }
}

module.exports = RecommendationEngine;