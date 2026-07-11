// server/services/communityArchiveService.js
const store = require('../../data/store');
const { v4: uuidv4 } = require('uuid');

/**
 * Service class responsible for managing local community archive operations,
 * including submitting memories, filtering exhibitions, handling expert verifications,
 * tracking timeline records, and database backup/restore snapshots.
 */
class CommunityArchiveService {
  constructor() {
    this.memories = [];
    this.exhibitions = [];
    this.timelines = [];
    this.verificationQueue = [];
    this.archiveCategories = [];
    this.preservationRules = [];
    this.storage = new Map();
    
    this.init();
  }

  init() {
    this.loadArchiveCategories();
    this.loadPreservationRules();
    this.loadSampleMemories();
    console.log('✅ Community Archive Service initialized');
  }

  loadArchiveCategories() {
    this.archiveCategories = [
      { id: 'oral_history', name: 'Oral Histories', icon: '🎙️', description: 'Personal stories and interviews' },
      { id: 'folk_tales', name: 'Folk Tales', icon: '📖', description: 'Traditional stories and legends' },
      { id: 'traditional_songs', name: 'Traditional Songs', icon: '🎵', description: 'Cultural music and songs' },
      { id: 'crafts_artifacts', name: 'Crafts & Artifacts', icon: '🎨', description: 'Traditional crafts and handmade items' },
      { id: 'community_events', name: 'Community Events', icon: '🎪', description: 'Local festivals and gatherings' },
      { id: 'family_histories', name: 'Family Histories', icon: '👨‍👩‍👧‍👦', description: 'Genealogical records and family stories' },
      { id: 'cultural_practices', name: 'Cultural Practices', icon: '🙏', description: 'Rituals, ceremonies, and customs' },
      { id: 'indigenous_knowledge', name: 'Indigenous Knowledge', icon: '🧠', description: 'Traditional wisdom and practices' },
      { id: 'photographs', name: 'Historical Photographs', icon: '📸', description: 'Photographs of cultural significance' },
      { id: 'documents', name: 'Historical Documents', icon: '📄', description: 'Historical letters and documents' }
    ];
  }

  loadPreservationRules() {
    this.preservationRules = [
      {
        id: 'rule_1',
        name: 'Digital Preservation Standard',
        description: 'Follow ISO 14721:2012 OAIS reference model',
        requirements: ['format_validation', 'metadata_standards', 'integrity_checks']
      },
      {
        id: 'rule_2',
        name: 'Cultural Context Preservation',
        description: 'Preserve cultural context and significance',
        requirements: ['cultural_metadata', 'context_documentation', 'significance_notes']
      },
      {
        id: 'rule_3',
        name: 'Accessibility Standards',
        description: 'Ensure accessibility for all users',
        requirements: ['subtitles', 'descriptions', 'multi_language']
      },
      {
        id: 'rule_4',
        name: 'Authenticity Verification',
        description: 'Verify authenticity of submissions',
        requirements: ['source_verification', 'expert_review', 'community_validation']
      }
    ];
  }

  loadSampleMemories() {
    this.memories = [
      {
        id: 'memory_1',
        title: 'Grandmother\'s Folk Tales',
        description: 'Collection of folk tales passed down through generations',
        category: 'folk_tales',
        content: {
          text: 'Once upon a time, in a small village...',
          audio: 'https://example.com/audio/story1.mp3',
          images: ['https://example.com/images/story1.jpg']
        },
        metadata: {
          location: 'West Bengal',
          language: 'Bengali',
          period: '1940s',
          contributors: ['grandmother', 'family_members'],
          source: 'oral_tradition'
        },
        status: 'verified',
        submittedBy: 'user_1',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        verifiedBy: 'expert_1',
        verifiedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        votes: { up: 45, down: 2 },
        views: 150,
        tags: ['folklore', 'traditional', 'stories']
      },
      {
        id: 'memory_2',
        title: 'Traditional Kantha Embroidery',
        description: 'Documentation of traditional Kantha embroidery techniques',
        category: 'crafts_artifacts',
        content: {
          text: 'Kantha embroidery is a traditional craft from Bengal...',
          images: ['https://example.com/images/kantha1.jpg', 'https://example.com/images/kantha2.jpg'],
          video: 'https://example.com/videos/kantha.mp4'
        },
        metadata: {
          location: 'West Bengal',
          craft_type: 'embroidery',
          techniques: ['running_stitch', 'darning_stitch'],
          materials: ['cotton', 'thread']
        },
        status: 'verified',
        submittedBy: 'user_2',
        submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        verifiedBy: 'expert_2',
        verifiedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        votes: { up: 60, down: 3 },
        views: 200,
        tags: ['craft', 'embroidery', 'tradition']
      }
    ];
  }

  /**
   * Submit a new memory to the archive
   */
  async submitMemory(memoryData, userId) {
    console.log(`📝 Submitting memory: ${memoryData.title}`);

    // Validate content
    const validation = this.validateMemoryContent(memoryData);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Process media
    const processedMedia = await this.processMedia(memoryData.content);

    // Create memory object
    const memory = {
      id: `memory_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...memoryData,
      content: processedMedia,
      status: 'pending_verification',
      submittedBy: userId,
      submittedAt: new Date().toISOString(),
      verifiedBy: null,
      verifiedAt: null,
      votes: { up: 0, down: 0 },
      views: 0,
      metadata: {
        ...memoryData.metadata,
        preservation_status: 'pending',
        format: this.detectFormat(memoryData.content)
      }
    };

    // Store memory
    this.memories.push(memory);
    this.storage.set(memory.id, memory);

    // Add to verification queue
    await this.addToVerificationQueue(memory);

    // Generate timeline entries
    this.generateTimeline(memory);

    console.log(`✅ Memory submitted: ${memory.id}`);
    return memory;
  }

  /**
   * Validate memory content
   */
  validateMemoryContent(memoryData) {
    const required = ['title', 'description', 'category', 'content'];
    const missing = required.filter(field => !memoryData[field]);
    
    if (missing.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missing.join(', ')}`
      };
    }

    if (!this.archiveCategories.some(c => c.id === memoryData.category)) {
      return {
        valid: false,
        message: `Invalid category: ${memoryData.category}`
      };
    }

    return { valid: true };
  }

  /**
   * Process media content
   */
  async processMedia(content) {
    const processed = { ...content };

    // Process images
    if (content.images) {
      processed.images = await Promise.all(
        content.images.map(img => this.processImage(img))
      );
    }

    // Process audio
    if (content.audio) {
      processed.audio = await this.processAudio(content.audio);
    }

    // Process video
    if (content.video) {
      processed.video = await this.processVideo(content.video);
    }

    // Process documents
    if (content.documents) {
      processed.documents = await Promise.all(
        content.documents.map(doc => this.processDocument(doc))
      );
    }

    return processed;
  }

  /**
   * Process image
   */
  async processImage(imageData) {
    // In production: compress, optimize, add watermark
    return {
      original: imageData,
      thumbnail: imageData + '?w=300',
      medium: imageData + '?w=600',
      large: imageData + '?w=1200',
      metadata: {
        width: 1920,
        height: 1080,
        format: 'jpeg',
        size: '2.5MB'
      }
    };
  }

  /**
   * Process audio
   */
  async processAudio(audioData) {
    // In production: compress, transcode, generate waveform
    return {
      original: audioData,
      format: 'mp3',
      duration: 120,
      sample_rate: 44100,
      waveform: this.generateWaveform()
    };
  }

  /**
   * Process video
   */
  async processVideo(videoData) {
    // In production: compress, generate thumbnails
    return {
      original: videoData,
      thumbnail: videoData + '?v=thumbnail',
      format: 'mp4',
      duration: 180,
      resolution: '1080p'
    };
  }

  /**
   * Process document
   */
  async processDocument(documentData) {
    return {
      original: documentData,
      thumbnail: documentData + '?doc=preview',
      pages: 10,
      format: 'pdf',
      text_content: await this.extractText(documentData)
    };
  }

  /**
   * Generate waveform data
   */
  generateWaveform() {
    const points = 100;
    const waveform = [];
    for (let i = 0; i < points; i++) {
      waveform.push(Math.random() * 0.8 + 0.2);
    }
    return waveform;
  }

  /**
   * Extract text from document
   */
  async extractText(documentData) {
    // In production: OCR and text extraction
    return 'Extracted text from document...';
  }

  /**
   * Detect content format
   */
  detectFormat(content) {
    const format = [];
    if (content.text) format.push('text');
    if (content.images) format.push('images');
    if (content.audio) format.push('audio');
    if (content.video) format.push('video');
    if (content.documents) format.push('documents');
    return format.join(', ');
  }

  /**
   * Add to verification queue
   */
  async addToVerificationQueue(memory) {
    this.verificationQueue.push({
      memoryId: memory.id,
      priority: this.calculatePriority(memory),
      status: 'pending',
      addedAt: new Date().toISOString(),
      assignedTo: null
    });

    // Sort queue by priority
    this.verificationQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate verification priority
   */
  calculatePriority(memory) {
    let priority = 50;
    
    // Cultural significance
    if (memory.metadata && memory.metadata.significance) {
      priority += memory.metadata.significance * 10;
    }

    // Community interest (based on votes)
    const voteCount = memory.votes.up + memory.votes.down;
    if (voteCount > 100) priority += 20;
    else if (voteCount > 50) priority += 10;

    // Historical significance
    if (memory.metadata && memory.metadata.period) {
      priority += 15;
    }

    return Math.min(priority, 100);
  }

  /**
   * Verify a memory
   */
  async verifyMemory(memoryId, expertId, decision, notes = '') {
    const memory = this.getMemory(memoryId);
    if (!memory) {
      throw new Error('Memory not found');
    }

    const queueItem = this.verificationQueue.find(q => q.memoryId === memoryId);
    if (queueItem) {
      this.verificationQueue = this.verificationQueue.filter(q => q.memoryId !== memoryId);
    }

    memory.status = decision === 'approved' ? 'verified' : 'rejected';
    memory.verifiedBy = expertId;
    memory.verifiedAt = new Date().toISOString();
    memory.verificationNotes = notes;

    if (decision === 'approved') {
      memory.metadata.preservation_status = 'archived';
      
      // Generate exhibition if notable
      if (memory.votes.up > 20) {
        await this.generateExhibition(memory);
      }
    }

    return memory;
  }

  /**
   * Get verification queue
   */
  getVerificationQueue(filters = {}) {
    let queue = [...this.verificationQueue];

    if (filters.status) {
      queue = queue.filter(item => item.status === filters.status);
    }

    if (filters.priority) {
      queue = queue.filter(item => item.priority >= filters.priority);
    }

    return queue;
  }

  /**
   * Get memory by ID
   */
  getMemory(memoryId) {
    return this.memories.find(m => m.id === memoryId);
  }

  /**
   * Get memories with filters
   */
  getMemories(filters = {}) {
    let filtered = [...this.memories];

    if (filters.category) {
      filtered = filtered.filter(m => m.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search) ||
        m.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    if (filters.location) {
      filtered = filtered.filter(m => 
        m.metadata.location && m.metadata.location.includes(filters.location)
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'recent':
          filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
          break;
        case 'popular':
          filtered.sort((a, b) => (b.votes.up - b.votes.down) - (a.votes.up - a.votes.down));
          break;
        case 'views':
          filtered.sort((a, b) => b.views - a.views);
          break;
      }
    }

    return filtered;
  }

  /**
   * Vote on a memory
   */
  voteMemory(memoryId, userId, voteType) {
    const memory = this.getMemory(memoryId);
    if (!memory) {
      throw new Error('Memory not found');
    }

    if (voteType !== 'up' && voteType !== 'down') {
      throw new Error('Invalid vote type');
    }

    memory.votes[voteType] = (memory.votes[voteType] || 0) + 1;
    memory.updatedAt = new Date().toISOString();

    return memory;
  }

  /**
   * Generate timeline for a memory
   */
  generateTimeline(memory) {
    const timeline = {
      memoryId: memory.id,
      entries: [
        {
          date: memory.submittedAt,
          event: 'Memory Submitted',
          description: `"${memory.title}" was submitted by ${memory.submittedBy}`
        }
      ]
    };

    if (memory.verifiedAt) {
      timeline.entries.push({
        date: memory.verifiedAt,
        event: 'Memory Verified',
        description: `"${memory.title}" was verified by ${memory.verifiedBy}`
      });
    }

    this.timelines.push(timeline);
    return timeline;
  }

  /**
   * Generate exhibition from memories
   */
  async generateExhibition(memory) {
    // Find related memories
    const related = this.memories.filter(m => 
      m.id !== memory.id && 
      (m.category === memory.category || 
       m.tags.some(t => memory.tags.includes(t)))
    );

    const exhibition = {
      id: `exhibition_${Date.now()}`,
      title: `${memory.category.replace('_', ' ').toUpperCase()} Exhibition`,
      description: `A curated collection of ${memory.category} memories`,
      curator: 'community',
      memories: [memory.id, ...related.slice(0, 9).map(m => m.id)],
      created: new Date().toISOString(),
      status: 'active',
      views: 0
    };

    this.exhibitions.push(exhibition);
    return exhibition;
  }

  /**
   * Get exhibitions
   */
  getExhibitions(filters = {}) {
    let exhibitions = [...this.exhibitions];

    if (filters.status) {
      exhibitions = exhibitions.filter(e => e.status === filters.status);
    }

    return exhibitions;
  }

  /**
   * Get timelines
   */
  getTimelines(memoryId = null) {
    if (memoryId) {
      return this.timelines.find(t => t.memoryId === memoryId);
    }
    return this.timelines;
  }

  /**
   * Get archive statistics
   */
  getStatistics() {
    const total = this.memories.length;
    const verified = this.memories.filter(m => m.status === 'verified').length;
    const pending = this.memories.filter(m => m.status === 'pending_verification').length;
    const rejected = this.memories.filter(m => m.status === 'rejected').length;

    const categoryCount = {};
    this.memories.forEach(m => {
      categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
    });

    const totalVotes = this.memories.reduce((sum, m) => sum + m.votes.up + m.votes.down, 0);
    const totalViews = this.memories.reduce((sum, m) => sum + m.views, 0);

    return {
      totalMemories: total,
      verifiedMemories: verified,
      pendingVerification: pending,
      rejectedMemories: rejected,
      categories: categoryCount,
      totalVotes,
      totalViews,
      verificationQueue: this.verificationQueue.length,
      exhibitions: this.exhibitions.length,
      timelines: this.timelines.length,
      storage: {
        totalSize: this.calculateStorageSize(),
        formatDistribution: this.getFormatDistribution()
      }
    };
  }

  /**
   * Calculate storage size
   */
  calculateStorageSize() {
    let total = 0;
    this.memories.forEach(memory => {
      if (memory.content.images) total += memory.content.images.length * 2.5; // MB
      if (memory.content.audio) total += 5; // MB
      if (memory.content.video) total += 20; // MB
      if (memory.content.documents) total += 1; // MB
    });
    return Math.round(total * 10) / 10; // GB
  }

  /**
   * Get format distribution
   */
  getFormatDistribution() {
    const distribution = {};
    this.memories.forEach(memory => {
      const format = memory.metadata.format;
      distribution[format] = (distribution[format] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Get preservation status
   */
  getPreservationStatus() {
    return {
      totalItems: this.memories.length,
      preservedItems: this.memories.filter(m => 
        m.metadata.preservation_status === 'archived'
      ).length,
      preservationRules: this.preservationRules,
      backupStatus: 'active',
      lastBackup: new Date().toISOString(),
      storageHealth: 'healthy'
    };
  }

  /**
   * Create backup
   */
  async createBackup() {
    console.log('💾 Creating backup...');
    
    const backup = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      memories: this.memories,
      exhibitions: this.exhibitions,
      timelines: this.timelines,
      categories: this.archiveCategories,
      size: this.calculateStorageSize()
    };

    // In production: save to cloud storage
    // For now, store in memory
    this.lastBackup = backup;
    
    console.log('✅ Backup created');
    return backup;
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId) {
    console.log(`🔄 Restoring backup: ${backupId}`);
    
    // In production: load from cloud storage
    // For now, return last backup
    if (this.lastBackup) {
      this.memories = this.lastBackup.memories;
      this.exhibitions = this.lastBackup.exhibitions;
      this.timelines = this.lastBackup.timelines;
      console.log('✅ Restore complete');
      return this.lastBackup;
    }
    
    throw new Error('Backup not found');
  }

  /**
   * Get archive by category
   */
  getArchiveByCategory(categoryId) {
    return this.memories.filter(m => m.category === categoryId);
  }

  /**
   * Search archive
   */
  searchArchive(query, filters = {}) {
    const results = [];
    const searchLower = query.toLowerCase();

    this.memories.forEach(memory => {
      const match = 
        memory.title.toLowerCase().includes(searchLower) ||
        memory.description.toLowerCase().includes(searchLower) ||
        memory.tags.some(t => t.toLowerCase().includes(searchLower)) ||
        memory.metadata.location?.toLowerCase().includes(searchLower);

      if (match) {
        let score = 0;
        if (memory.title.toLowerCase().includes(searchLower)) score += 10;
        if (memory.description.toLowerCase().includes(searchLower)) score += 5;
        if (memory.tags.some(t => t.toLowerCase().includes(searchLower))) score += 3;
        if (memory.metadata.location?.toLowerCase().includes(searchLower)) score += 2;

        results.push({ ...memory, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, filters.limit || 50);
  }
}

module.exports = CommunityArchiveService;