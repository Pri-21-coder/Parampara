// services/arExperienceService.js
const store = require('../../data/store');
const { v4: uuidv4 } = require('uuid');

class ARExperienceService {
  constructor() {
    this.arScenes = [];
    this.arMarkers = [];
    this.arSessions = new Map();
    this.arAssets = new Map();
    this.historicalScenes = [];
    this.landmarkData = [];
    this.arTreasureHunts = [];
    
    this.init();
  }

  init() {
    this.loadHistoricalScenes();
    this.loadLandmarkData();
    this.loadARAssets();
    this.loadSampleARScenes();
    console.log('✅ AR Experience Service initialized');
  }

  loadHistoricalScenes() {
    this.historicalScenes = [
      {
        id: 'scene_1',
        name: 'Ancient Village Life',
        description: 'Reconstruction of a 12th century village',
        period: '12th Century',
        location: { lat: 22.5726, lng: 88.3639 },
        elements: [
          { type: 'building', model: 'hut.glb', position: [0, 0, 0] },
          { type: 'tree', model: 'tree.glb', position: [2, 0, 1] },
          { type: 'character', model: 'villager.glb', position: [-1, 0, 2] }
        ],
        audio: 'village_ambient.mp3',
        info: 'This village was a center of trade and culture...'
      },
      {
        id: 'scene_2',
        name: 'Royal Court',
        description: 'Reconstruction of a royal court from the 18th century',
        period: '18th Century',
        location: { lat: 22.5736, lng: 88.3649 },
        elements: [
          { type: 'building', model: 'palace.glb', position: [0, 0, 0] },
          { type: 'character', model: 'king.glb', position: [1, 0, 1] },
          { type: 'character', model: 'queen.glb', position: [-1, 0, 1] }
        ],
        audio: 'court_music.mp3',
        info: 'The royal court was known for its patronage of arts...'
      }
    ];
  }

  loadLandmarkData() {
    this.landmarkData = [
      {
        id: 'landmark_1',
        name: 'Ancient Temple',
        description: 'A 1000-year-old temple with intricate carvings',
        location: { lat: 22.5726, lng: 88.3639 },
        category: 'temple',
        era: '10th Century',
        significance: 'One of the oldest temples in the region',
        images: ['temple1.jpg', 'temple2.jpg'],
        arModel: 'temple.glb',
        audioGuide: 'temple_guide.mp3',
        facts: [
          'Built in 950 AD',
          'Features unique architectural style',
          'Home to ancient inscriptions'
        ]
      },
      {
        id: 'landmark_2',
        name: 'Heritage Fort',
        description: 'A majestic fort from the 16th century',
        location: { lat: 22.5746, lng: 88.3659 },
        category: 'fort',
        era: '16th Century',
        significance: 'Strategic military importance',
        images: ['fort1.jpg', 'fort2.jpg'],
        arModel: 'fort.glb',
        audioGuide: 'fort_guide.mp3',
        facts: [
          'Built in 1556',
          'Witnessed 5 major battles',
          'Has secret underground passages'
        ]
      }
    ];
  }

  loadARAssets() {
    this.arAssets = new Map([
      ['artifact_1', {
        id: 'artifact_1',
        name: 'Ancient Pottery',
        type: 'artifact',
        model: 'pottery.glb',
        thumbnail: 'pottery.jpg',
        description: 'Traditional pottery from the region',
        era: 'Ancient'
      }],
      ['artifact_2', {
        id: 'artifact_2',
        name: 'Bronze Sculpture',
        type: 'artifact',
        model: 'sculpture.glb',
        thumbnail: 'sculpture.jpg',
        description: 'Bronze sculpture from the 12th century',
        era: 'Medieval'
      }],
      ['artifact_3', {
        id: 'artifact_3',
        name: 'Traditional Jewelry',
        type: 'artifact',
        model: 'jewelry.glb',
        thumbnail: 'jewelry.jpg',
        description: 'Ornate traditional jewelry',
        era: 'Traditional'
      }]
    ]);
  }

  loadSampleARScenes() {
    this.arScenes = [
      {
        id: 'ar_scene_1',
        name: 'Temple Exploration',
        description: 'Explore the ancient temple with AR',
        location: { lat: 22.5726, lng: 88.3639 },
        elements: [
          { type: 'building', model: 'temple.glb', position: [0, 0, 0], scale: 0.5 },
          { type: 'info_point', label: 'Main Entrance', position: [1, 0, 0] },
          { type: 'info_point', label: 'Sanctum', position: [-1, 0, 1] }
        ],
        audio: 'temple_ambient.mp3'
      }
    ];
  }

  /**
   * Load AR scene for a location
   */
  async loadARScene(locationId, userId = null) {
    console.log(`🎯 Loading AR scene for location: ${locationId}`);

    const scene = this.arScenes.find(s => s.locationId === locationId) || 
                  this.createDefaultScene(locationId);

    // Create AR session
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      userId,
      locationId,
      scene,
      startedAt: new Date().toISOString(),
      elements: this.initializeSceneElements(scene),
      interactions: [],
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    };

    this.arSessions.set(sessionId, session);

    return {
      sessionId,
      scene: this.prepareSceneForAR(scene),
      assets: this.getSceneAssets(scene),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create default scene for location
   */
  createDefaultScene(locationId) {
    return {
      id: `scene_${locationId}`,
      name: 'Heritage Site',
      description: 'Explore this heritage site with AR',
      location: { lat: 0, lng: 0 },
      elements: [
        { type: 'model', model: 'default.glb', position: [0, 0, 0] },
        { type: 'info', label: 'Welcome!', position: [1, 0, 0] }
      ]
    };
  }

  /**
   * Initialize scene elements
   */
  initializeSceneElements(scene) {
    return scene.elements.map(element => ({
      ...element,
      id: uuidv4(),
      state: 'ready',
      interactionCount: 0
    }));
  }

  /**
   * Prepare scene for AR rendering
   */
  prepareSceneForAR(scene) {
    return {
      id: scene.id,
      name: scene.name,
      description: scene.description,
      elements: scene.elements.map(el => ({
        type: el.type,
        model: el.model,
        position: el.position,
        rotation: el.rotation || [0, 0, 0],
        scale: el.scale || 1,
        label: el.label || '',
        interactive: el.interactive !== false
      }))
    };
  }

  /**
   * Get assets needed for scene
   */
  getSceneAssets(scene) {
    const assets = [];
    scene.elements.forEach(element => {
      if (element.model && this.arAssets.has(element.model)) {
        assets.push(this.arAssets.get(element.model));
      }
    });
    return assets;
  }

  /**
   * Recognize landmark from image
   */
  async recognizeLandmark(imageData) {
    console.log('🔍 Recognizing landmark from image...');

    try {
      // Extract features from image
      const features = await this.extractImageFeatures(imageData);
      
      // Match against known landmarks
      const matches = this.landmarkData.map(landmark => {
        const similarity = this.calculateSimilarity(features, landmark);
        return { landmark, similarity };
      });

      // Sort by similarity
      matches.sort((a, b) => b.similarity - a.similarity);

      // Return best match if similarity > threshold
      if (matches[0] && matches[0].similarity > 0.7) {
        return {
          success: true,
          landmark: matches[0].landmark,
          confidence: matches[0].similarity,
          arScene: this.getARSceneForLandmark(matches[0].landmark.id)
        };
      }

      return {
        success: false,
        message: 'Landmark not recognized',
        suggestions: this.getSimilarLandmarks(matches)
      };
    } catch (error) {
      console.error('Error recognizing landmark:', error);
      throw new Error('Failed to recognize landmark');
    }
  }

  /**
   * Extract features from image
   */
  async extractImageFeatures(imageData) {
    // In production: use computer vision library
    // For now: simulate feature extraction
    return {
      edges: Math.random() * 100,
      corners: Math.random() * 50,
      colors: {
        red: Math.random() * 255,
        green: Math.random() * 255,
        blue: Math.random() * 255
      },
      patterns: ['circular', 'linear', 'geometric'][Math.floor(Math.random() * 3)]
    };
  }

  /**
   * Calculate similarity between features and landmark
   */
  calculateSimilarity(features, landmark) {
    // In production: use actual similarity metrics
    // For now: simulate similarity score
    return 0.5 + Math.random() * 0.4;
  }

  /**
   * Get AR scene for landmark
   */
  getARSceneForLandmark(landmarkId) {
    return this.arScenes.find(s => s.landmarkId === landmarkId) || null;
  }

  /**
   * Get similar landmarks
   */
  getSimilarLandmarks(matches) {
    return matches.slice(0, 3).map(m => ({
      id: m.landmark.id,
      name: m.landmark.name,
      similarity: m.similarity
    }));
  }

  /**
   * Update AR session position
   */
  updateARSession(sessionId, position, rotation) {
    const session = this.arSessions.get(sessionId);
    if (!session) {
      throw new Error('AR session not found');
    }

    session.position = position;
    session.rotation = rotation;
    session.lastUpdated = new Date().toISOString();

    return session;
  }

  /**
   * Interact with AR element
   */
  interactWithARElement(sessionId, elementId, interactionType) {
    const session = this.arSessions.get(sessionId);
    if (!session) {
      throw new Error('AR session not found');
    }

    const element = session.elements.find(el => el.id === elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    element.interactionCount++;
    element.lastInteraction = new Date().toISOString();
    element.state = 'interacted';

    // Record interaction
    session.interactions.push({
      elementId,
      type: interactionType,
      timestamp: new Date().toISOString()
    });

    // Get element information
    const info = this.getElementInfo(element);

    return {
      element,
      info,
      message: `Interacted with ${element.label || 'element'}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get element information
   */
  getElementInfo(element) {
    // In production: fetch from database
    return {
      name: element.label || 'Unknown Element',
      description: 'This is a cultural heritage element',
      type: element.type,
      model: element.model,
      position: element.position
    };
  }

  /**
   * Create AR treasure hunt
   */
  createARTreasureHunt(data) {
    const hunt = {
      id: `hunt_${Date.now()}`,
      name: data.name || 'AR Treasure Hunt',
      description: data.description || 'Find hidden cultural treasures!',
      location: data.location || { lat: 0, lng: 0 },
      clues: data.clues || [],
      rewards: data.rewards || [],
      status: 'active',
      createdBy: data.createdBy || 'anonymous',
      createdAt: new Date().toISOString(),
      participants: [],
      completedBy: []
    };

    this.arTreasureHunts.push(hunt);
    return hunt;
  }

  /**
   * Join AR treasure hunt
   */
  joinARTreasureHunt(huntId, userId) {
    const hunt = this.arTreasureHunts.find(h => h.id === huntId);
    if (!hunt) {
      throw new Error('Treasure hunt not found');
    }

    if (!hunt.participants.includes(userId)) {
      hunt.participants.push(userId);
    }

    return {
      hunt,
      currentClue: hunt.clues[0] || null,
      progress: hunt.participants.length
    };
  }

  /**
   * Submit clue answer
   */
  submitClueAnswer(huntId, userId, clueId, answer) {
    const hunt = this.arTreasureHunts.find(h => h.id === huntId);
    if (!hunt) {
      throw new Error('Treasure hunt not found');
    }

    const clue = hunt.clues.find(c => c.id === clueId);
    if (!clue) {
      throw new Error('Clue not found');
    }

    const isCorrect = clue.answer.toLowerCase() === answer.toLowerCase();
    
    if (isCorrect) {
      // Award points or reward
      const reward = hunt.rewards.find(r => r.clueId === clueId);
      return {
        success: true,
        message: 'Correct!',
        reward: reward || null,
        nextClue: hunt.clues[hunt.clues.indexOf(clue) + 1] || null
      };
    }

    return {
      success: false,
      message: 'Incorrect answer. Try again!',
      hint: clue.hint || null
    };
  }

  /**
   * Create virtual group tour
   */
  createVirtualGroupTour(data) {
    const tour = {
      id: `tour_${Date.now()}`,
      name: data.name || 'Virtual Heritage Tour',
      description: data.description || 'Explore heritage together!',
      location: data.location || { lat: 0, lng: 0 },
      guide: data.guide || 'AI Guide',
      schedule: data.schedule || new Date().toISOString(),
      maxParticipants: data.maxParticipants || 20,
      participants: [],
      status: 'scheduled',
      createdBy: data.createdBy || 'anonymous',
      createdAt: new Date().toISOString()
    };

    return tour;
  }

  /**
   * Join virtual group tour
   */
  joinVirtualTour(tourId, userId) {
    // In production: implement WebSocket/WebRTC
    return {
      tourId,
      userId,
      joinedAt: new Date().toISOString(),
      streamUrl: `https://stream.parampara.com/tour/${tourId}`,
      participants: 5 // placeholder
    };
  }

  /**
   * Share AR photo
   */
  async shareARPhoto(sessionId, photoData, caption = '') {
    const session = this.arSessions.get(sessionId);
    if (!session) {
      throw new Error('AR session not found');
    }

    const shareData = {
      id: `share_${Date.now()}`,
      sessionId,
      userId: session.userId,
      photo: photoData,
      caption,
      scene: session.scene.name,
      location: session.scene.location,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    // Store share
    store.arShares = store.arShares || [];
    store.arShares.push(shareData);

    return shareData;
  }

  /**
   * Get AR shares
   */
  getARShares(filters = {}) {
    let shares = store.arShares || [];

    if (filters.userId) {
      shares = shares.filter(s => s.userId === filters.userId);
    }

    if (filters.location) {
      shares = shares.filter(s => 
        s.scene.location && 
        Math.abs(s.scene.location.lat - filters.location.lat) < 0.01 &&
        Math.abs(s.scene.location.lng - filters.location.lng) < 0.01
      );
    }

    shares.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return shares.slice(0, filters.limit || 50);
  }

  /**
   * Get AR statistics
   */
  getARStats() {
    const shares = store.arShares || [];
    
    return {
      totalSessions: this.arSessions.size,
      activeSessions: Array.from(this.arSessions.values()).filter(
        s => new Date(s.lastUpdated || s.startedAt) > new Date(Date.now() - 30 * 60 * 1000)
      ).length,
      totalShares: shares.length,
      totalTreasureHunts: this.arTreasureHunts.length,
      totalLandmarks: this.landmarkData.length,
      topSharedLocations: this.getTopSharedLocations(shares),
      popularScenes: this.getPopularScenes(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get top shared locations
   */
  getTopSharedLocations(shares) {
    const locationCount = {};
    shares.forEach(share => {
      const key = `${share.scene.location.lat},${share.scene.location.lng}`;
      locationCount[key] = (locationCount[key] || 0) + 1;
    });

    return Object.entries(locationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }

  /**
   * Get popular scenes
   */
  getPopularScenes() {
    const shares = store.arShares || [];
    const sceneCount = {};

    shares.forEach(share => {
      const sceneName = share.scene.name;
      sceneCount[sceneName] = (sceneCount[sceneName] || 0) + 1;
    });

    return Object.entries(sceneCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  /**
   * Get AR session
   */
  getARSession(sessionId) {
    return this.arSessions.get(sessionId);
  }

  /**
   * Get all landmarks
   */
  getLandmarks() {
    return this.landmarkData;
  }

  /**
   * Get landmark by ID
   */
  getLandmark(landmarkId) {
    return this.landmarkData.find(l => l.id === landmarkId);
  }

  /**
   * Get historical scenes
   */
  getHistoricalScenes() {
    return this.historicalScenes;
  }

  /**
   * Get AR assets
   */
  getARAssets() {
    return Array.from(this.arAssets.values());
  }

  /**
   * Get treasure hunts
   */
  getTreasureHunts() {
    return this.arTreasureHunts;
  }

  /**
   * Get virtual tours
   */
  getVirtualTours() {
    return this.virtualTours || [];
  }
}

module.exports = ARExperienceService;
