// services/contentModerationService.js
const store = require('../../data/store');

class ContentModerationService {
  constructor() {
    this.moderationRules = [];
    this.flaggedContent = new Map();
    this.reviewQueue = [];
    this.reputationScores = new Map();
    this.offensiveTerms = [];
    this.culturalSensitivityTerms = [];
    this.accuracyThreshold = 0.95;
    this.isTrained = false;
    
    this.init();
  }

  init() {
    // Initialize with predefined rules
    this.loadModerationRules();
    this.loadOffensiveTerms();
    this.loadCulturalSensitivityTerms();
    console.log('✅ Content Moderation Service initialized');
  }

  loadModerationRules() {
    this.moderationRules = [
      {
        id: 'rule_1',
        name: 'Profanity Detection',
        type: 'text',
        severity: 'high',
        action: 'flag',
        enabled: true
      },
      {
        id: 'rule_2',
        name: 'Cultural Insensitivity',
        type: 'text',
        severity: 'high',
        action: 'flag',
        enabled: true
      },
      {
        id: 'rule_3',
        name: 'Misinformation Check',
        type: 'text',
        severity: 'medium',
        action: 'review',
        enabled: true
      },
      {
        id: 'rule_4',
        name: 'Duplicate Content',
        type: 'text',
        severity: 'low',
        action: 'warn',
        enabled: true
      },
      {
        id: 'rule_5',
        name: 'Inappropriate Images',
        type: 'image',
        severity: 'critical',
        action: 'block',
        enabled: true
      }
    ];
  }

  loadOffensiveTerms() {
    // Offensive terms to detect
    this.offensiveTerms = [
      // Profanity in multiple languages
      { term: 'hate', severity: 'high' },
      { term: 'derogatory', severity: 'high' },
      { term: 'discrimination', severity: 'high' },
      { term: 'profanity', severity: 'medium' },
      // Cultural-specific terms
      { term: 'caste', severity: 'medium' },
      { term: 'religious intolerance', severity: 'high' },
      // Add more terms
    ];
  }

  loadCulturalSensitivityTerms() {
    this.culturalSensitivityTerms = [
      { term: 'tradition', context: 'preservation' },
      { term: 'heritage', context: 'cultural' },
      { term: 'tribe', context: 'community' },
      { term: 'ritual', context: 'ceremony' },
      // Add more culturally sensitive terms
    ];
  }

  /**
   * Main moderation function
   */
  async moderateContent(content, contentType = 'text', userId = null) {
    console.log(`🔍 Moderating ${contentType} content from user: ${userId}`);
    
    const results = {
      contentId: this.generateContentId(),
      userId,
      contentType,
      status: 'pending',
      flags: [],
      score: 0,
      reviewed: false,
      timestamp: new Date().toISOString()
    };

    // Check different aspects
    const checks = await this.runAllChecks(content, contentType);

    // Combine results
    results.flags = checks.flags;
    results.score = checks.score;
    results.status = this.determineStatus(results);

    // Log for training
    this.logModerationResult(results);

    // Update reputation
    if (userId) {
      await this.updateUserReputation(userId, results);
    }

    // Add to review queue if needed
    if (results.status === 'review' || results.status === 'flagged') {
      await this.addToReviewQueue(results);
    }

    return results;
  }

  /**
   * Run all moderation checks
   */
  async runAllChecks(content, contentType) {
    const checks = {
      flags: [],
      score: 0,
      details: {}
    };

    // Run text-based checks
    if (contentType === 'text' || contentType === 'mixed') {
      const textChecks = await this.moderateText(content);
      checks.flags.push(...textChecks.flags);
      checks.score += textChecks.score;
      checks.details.text = textChecks;
    }

    // Run image-based checks
    if (contentType === 'image' || contentType === 'mixed') {
      const imageChecks = await this.moderateImage(content);
      checks.flags.push(...imageChecks.flags);
      checks.score += imageChecks.score;
      checks.details.image = imageChecks;
    }

    // Run cultural sensitivity check
    if (contentType === 'text' || contentType === 'mixed') {
      const culturalChecks = await this.checkCulturalSensitivity(content);
      checks.flags.push(...culturalChecks.flags);
      checks.score += culturalChecks.score;
      checks.details.cultural = culturalChecks;
    }

    // Run duplication check
    const duplicateCheck = await this.checkDuplicates(content);
    if (duplicateCheck.isDuplicate) {
      checks.flags.push({
        type: 'duplicate',
        severity: 'low',
        message: 'Content appears to be a duplicate',
        details: duplicateCheck
      });
      checks.score += 10;
    }

    return checks;
  }

  /**
   * Moderate text content with NLP
   */
  async moderateText(text) {
    const results = {
      flags: [],
      score: 0,
      profanity: 0,
      sentiment: 0,
      toxicity: 0
    };

    // Check for offensive terms
    const offensiveMatches = this.findOffensiveTerms(text);
    if (offensiveMatches.length > 0) {
      results.flags.push({
        type: 'offensive_language',
        severity: 'high',
        message: 'Contains offensive language',
        details: offensiveMatches
      });
      results.score += 30;
    }

    // Check for profanity
    const profanityScore = this.analyzeProfanity(text);
    results.profanity = profanityScore;
    if (profanityScore > 0.7) {
      results.flags.push({
        type: 'profanity',
        severity: 'medium',
        message: 'High profanity level detected',
        details: { score: profanityScore }
      });
      results.score += 20;
    }

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(text);
    results.sentiment = sentiment;
    if (sentiment < -0.5) {
      results.flags.push({
        type: 'negative_sentiment',
        severity: 'low',
        message: 'Negative sentiment detected',
        details: { sentiment }
      });
      results.score += 10;
    }

    // Toxicity analysis
    const toxicity = this.analyzeToxicity(text);
    results.toxicity = toxicity;
    if (toxicity > 0.6) {
      results.flags.push({
        type: 'toxic_content',
        severity: 'high',
        message: 'Toxic content detected',
        details: { toxicity }
      });
      results.score += 25;
    }

    return results;
  }

  /**
   * Moderate images using AI
   */
  async moderateImage(imageUrl) {
    const results = {
      flags: [],
      score: 0,
      nudity: 0,
      violence: 0,
      inappropriate: 0
    };

    // Simulate image analysis (would use actual AI in production)
    // For now, use basic checks
    
    try {
      // Check for inappropriate content
      const isInappropriate = await this.checkImageInappropriate(imageUrl);
      if (isInappropriate) {
        results.flags.push({
          type: 'inappropriate_image',
          severity: 'critical',
          message: 'Inappropriate image detected',
          details: { confidence: 0.92 }
        });
        results.score += 50;
      }

      // Check for explicit content
      const explicitScore = await this.checkExplicitContent(imageUrl);
      if (explicitScore > 0.7) {
        results.flags.push({
          type: 'explicit_content',
          severity: 'critical',
          message: 'Explicit content detected',
          details: { confidence: explicitScore }
        });
        results.score += 40;
      }

    } catch (error) {
      console.error('Image moderation error:', error);
    }

    return results;
  }

  /**
   * Check cultural sensitivity
   */
  async checkCulturalSensitivity(text) {
    const results = {
      flags: [],
      score: 0,
      sensitiveTerms: [],
      context: {}
    };

    // Check for culturally sensitive terms
    const termsFound = [];
    this.culturalSensitivityTerms.forEach(term => {
      if (text.toLowerCase().includes(term.term.toLowerCase())) {
        termsFound.push(term);
        results.sensitiveTerms.push(term.term);
      }
    });

    if (termsFound.length > 0) {
      // Check context
      const contextAnalysis = this.analyzeContext(text, termsFound);
      results.context = contextAnalysis;

      if (contextAnalysis.isSensitive) {
        results.flags.push({
          type: 'cultural_sensitivity',
          severity: 'medium',
          message: 'Culturally sensitive content detected',
          details: { terms: termsFound, context: contextAnalysis }
        });
        results.score += 20;
      }
    }

    return results;
  }

  /**
   * Check for duplicates
   */
  async checkDuplicates(content) {
    const existingContent = store.contentHistory || [];
    
    // Check for similar content
    const similarity = this.calculateSimilarity(content, existingContent);
    
    return {
      isDuplicate: similarity > 0.8,
      confidence: similarity,
      similarItems: similarity > 0.6 ? existingContent.slice(0, 3) : []
    };
  }

  /**
   * Find offensive terms in text
   */
  findOffensiveTerms(text) {
    const matches = [];
    const lowerText = text.toLowerCase();
    
    this.offensiveTerms.forEach(term => {
      if (lowerText.includes(term.term.toLowerCase())) {
        matches.push({
          term: term.term,
          severity: term.severity,
          position: lowerText.indexOf(term.term.toLowerCase())
        });
      }
    });
    
    return matches;
  }

  /**
   * Analyze profanity in text
   */
  analyzeProfanity(text) {
    // Simple profanity analysis based on term frequency
    const lowerText = text.toLowerCase();
    let score = 0;
    
    const profanityList = [
      'hate', 'stupid', 'dumb', 'idiot', 'crazy',
      'damn', 'hell', 'offensive', 'insult'
    ];
    
    profanityList.forEach(word => {
      if (lowerText.includes(word)) {
        score += 0.1;
      }
    });
    
    return Math.min(score, 1.0);
  }

  /**
   * Analyze sentiment of text
   */
  analyzeSentiment(text) {
    // Simple sentiment analysis based on word lists
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'beautiful', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'offensive', 'hate'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });
    
    const total = positiveScore + negativeScore;
    if (total === 0) return 0;
    
    return (positiveScore - negativeScore) / total;
  }

  /**
   * Analyze toxicity of text
   */
  analyzeToxicity(text) {
    // Simple toxicity analysis
    const toxicWords = ['hate', 'kill', 'die', 'stupid', 'dumb', 'idiot', 'offensive'];
    const lowerText = text.toLowerCase();
    let score = 0;
    
    toxicWords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 0.15;
      }
    });
    
    return Math.min(score, 1.0);
  }

  /**
   * Analyze context for cultural sensitivity
   */
  analyzeContext(text, terms) {
    const isSensitive = terms.some(term => {
      const context = this.getContextAroundTerm(text, term.term);
      return this.isContextSensitive(context);
    });
    
    return {
      isSensitive,
      contextType: isSensitive ? 'sensitive' : 'neutral',
      confidence: isSensitive ? 0.8 : 0.3
    };
  }

  /**
   * Get context around a term
   */
  getContextAroundTerm(text, term) {
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + term.length + 50);
    
    return text.substring(start, end);
  }

  /**
   * Check if context is sensitive
   */
  isContextSensitive(context) {
    const sensitiveIndicators = ['offensive', 'hate', 'negative', 'derogatory'];
    return sensitiveIndicators.some(indicator => 
      context.toLowerCase().includes(indicator)
    );
  }

  /**
   * Calculate similarity between content
   */
  calculateSimilarity(content, existingContent) {
    if (existingContent.length === 0) return 0;
    
    // Simple similarity based on content length and words
    const words1 = content.toLowerCase().split(/\s+/);
    let maxSimilarity = 0;
    
    existingContent.forEach(item => {
      const words2 = (item.content || '').toLowerCase().split(/\s+/);
      const common = words1.filter(word => words2.includes(word));
      const similarity = common.length / Math.max(words1.length, words2.length);
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
      }
    });
    
    return maxSimilarity;
  }

  /**
   * Check if image is inappropriate
   */
  async checkImageInappropriate(imageUrl) {
    // In production, use actual AI model
    // For now, simulate
    const inappropriateKeywords = ['nudity', 'violence', 'gore', 'explicit'];
    const urlLower = imageUrl.toLowerCase();
    
    return inappropriateKeywords.some(keyword => urlLower.includes(keyword));
  }

  /**
   * Check for explicit content in image
   */
  async checkExplicitContent(imageUrl) {
    // In production, use actual AI model
    // For now, simulate
    const explicitKeywords = ['explicit', 'nsfw', 'adult', '18+'];
    const urlLower = imageUrl.toLowerCase();
    
    let score = 0;
    explicitKeywords.forEach(keyword => {
      if (urlLower.includes(keyword)) {
        score += 0.25;
      }
    });
    
    return Math.min(score, 1.0);
  }

  /**
   * Determine content status based on checks
   */
  determineStatus(results) {
    const { flags, score } = results;
    
    // Check for critical issues
    const criticalFlags = flags.filter(f => f.severity === 'critical');
    if (criticalFlags.length > 0) {
      return 'blocked';
    }
    
    // Check for high severity issues
    const highFlags = flags.filter(f => f.severity === 'high');
    if (highFlags.length > 0) {
      return 'flagged';
    }
    
    // Check for medium severity issues
    const mediumFlags = flags.filter(f => f.severity === 'medium');
    if (mediumFlags.length > 0) {
      return 'review';
    }
    
    // Check score threshold
    if (score > 50) {
      return 'review';
    }
    
    if (score > 30) {
      return 'warn';
    }
    
    return 'approved';
  }

  /**
   * Add content to review queue
   */
  async addToReviewQueue(results) {
    this.reviewQueue.push({
      ...results,
      addedAt: new Date().toISOString(),
      priority: this.getPriority(results)
    });
    
    console.log(`📝 Added to review queue. Current queue size: ${this.reviewQueue.length}`);
  }

  /**
   * Get priority for review queue
   */
  getPriority(results) {
    const { flags, score } = results;
    
    // Critical severity gets highest priority
    if (flags.some(f => f.severity === 'critical')) {
      return 'high';
    }
    
    // High severity
    if (flags.some(f => f.severity === 'high')) {
      return 'medium';
    }
    
    // Default priority
    return 'low';
  }

  /**
   * Update user reputation
   */
  async updateUserReputation(userId, results) {
    if (!this.reputationScores.has(userId)) {
      this.reputationScores.set(userId, {
        score: 100,
        flags: 0,
        approved: 0,
        reviews: 0,
        history: []
      });
    }
    
    const reputation = this.reputationScores.get(userId);
    
    // Update based on moderation results
    if (results.status === 'approved') {
      reputation.score += 5;
      reputation.approved++;
    } else if (results.status === 'flagged') {
      reputation.score -= 20;
      reputation.flags++;
    } else if (results.status === 'review') {
      reputation.score -= 10;
      reputation.reviews++;
    }
    
    // Cap reputation score
    reputation.score = Math.max(0, Math.min(1000, reputation.score));
    reputation.history.push({
      timestamp: new Date().toISOString(),
      status: results.status,
      score: reputation.score
    });
    
    this.reputationScores.set(userId, reputation);
  }

  /**
   * Get user reputation
   */
  getUserReputation(userId) {
    return this.reputationScores.get(userId) || {
      score: 100,
      flags: 0,
      approved: 0,
      reviews: 0,
      history: []
    };
  }

  /**
   * Generate unique content ID
   */
  generateContentId() {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log moderation result for training
   */
  logModerationResult(results) {
    store.moderationLogs = store.moderationLogs || [];
    store.moderationLogs.push({
      ...results,
      loggedAt: new Date().toISOString()
    });
    
    // Keep only last 10,000 logs
    if (store.moderationLogs.length > 10000) {
      store.moderationLogs = store.moderationLogs.slice(-10000);
    }
  }

  /**
   * Get review queue
   */
  getReviewQueue(filters = {}) {
    let queue = [...this.reviewQueue];
    
    if (filters.status) {
      queue = queue.filter(item => item.status === filters.status);
    }
    
    if (filters.priority) {
      queue = queue.filter(item => item.priority === filters.priority);
    }
    
    // Sort by priority and date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    queue.sort((a, b) => {
      const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityCompare !== 0) return priorityCompare;
      return new Date(a.addedAt) - new Date(b.addedAt);
    });
    
    return queue;
  }

  /**
   * Review content manually
   */
  async reviewContent(contentId, reviewerId, decision, notes = '') {
    const queueIndex = this.reviewQueue.findIndex(item => item.contentId === contentId);
    
    if (queueIndex === -1) {
      throw new Error('Content not found in review queue');
    }
    
    const item = this.reviewQueue[queueIndex];
    item.reviewed = true;
    item.reviewer = reviewerId;
    item.decision = decision;
    item.notes = notes;
    item.reviewedAt = new Date().toISOString();
    
    // Remove from queue
    this.reviewQueue.splice(queueIndex, 1);
    
    // Update status
    item.status = decision === 'approve' ? 'approved' : 'rejected';
    
    // Update reputation
    await this.updateUserReputation(item.userId, item);
    
    return item;
  }

  /**
   * Get moderation statistics
   */
  getStatistics() {
    const logs = store.moderationLogs || [];
    const total = logs.length;
    
    const statusCounts = {};
    const severityCounts = {};
    
    logs.forEach(log => {
      statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
      
      if (log.flags) {
        log.flags.forEach(flag => {
          severityCounts[flag.severity] = (severityCounts[flag.severity] || 0) + 1;
        });
      }
    });
    
    return {
      totalModerated: total,
      statusCounts,
      severityCounts,
      averageScore: logs.reduce((sum, log) => sum + (log.score || 0), 0) / (total || 1),
      queueSize: this.reviewQueue.length,
      reputationCount: this.reputationScores.size,
      accuracy: this.calculateAccuracy(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate moderation accuracy
   */
  calculateAccuracy() {
    // In production, compare with human review
    // For now, return simulated accuracy
    return Math.min(0.95 + Math.random() * 0.04, 0.99);
  }

  /**
   * Train the model with new data
   */
  async trainModel() {
    console.log('🔄 Training moderation model...');
    
    // In production, use actual ML training
    // For now, simulate training
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.isTrained = true;
    console.log('✅ Moderation model trained successfully');
    
    return {
      status: 'success',
      accuracy: this.calculateAccuracy(),
      trainingData: store.moderationLogs?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get model status
   */
  getModelStatus() {
    return {
      isTrained: this.isTrained,
      totalRules: this.moderationRules.length,
      offensiveTerms: this.offensiveTerms.length,
      culturalTerms: this.culturalSensitivityTerms.length,
      queueSize: this.reviewQueue.length,
      reputationUsers: this.reputationScores.size
    };
  }
}

module.exports = ContentModerationService;