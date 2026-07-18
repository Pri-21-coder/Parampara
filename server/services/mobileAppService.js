// services/mobileAppService.js
const { v4: uuidv4 } = require('uuid');

const store = require('../data/store');

const store = require('../../data/store');


class MobileAppService {
  constructor() {
    this.devices = new Map();
    this.offlineData = new Map();
    this.syncQueue = [];
    this.pushTokens = [];
    this.audioRecordings = [];
    this.images = [];
    this.userSessions = new Map();
    
    this.init();
  }

  init() {
    this.loadSampleData();
    console.log('✅ Mobile App Service initialized');
  }

  loadSampleData() {
    // Sample offline content
    this.offlineData.set('offline_1', {
      id: 'offline_1',
      type: 'cultural_site',
      name: 'Kolkata Heritage Walk',
      data: {
        description: 'Explore colonial heritage of Kolkata',
        location: { lat: 22.5726, lng: 88.3639 },
        images: ['https://via.placeholder.com/300'],
        audio: null,
        video: null
      },
      downloadedAt: new Date().toISOString(),
      size: 2.5 // MB
    });

    this.offlineData.set('offline_2', {
      id: 'offline_2',
      type: 'story',
      name: 'The Legend of the Lost Temple',
      data: {
        content: 'In a remote village nestled in the mountains...',
        audio: 'https://via.placeholder.com/audio.mp3',
        images: ['https://via.placeholder.com/300']
      },
      downloadedAt: new Date().toISOString(),
      size: 1.2
    });
  }

  /**
   * Register device
   */
  registerDevice(deviceData) {
    const deviceId = `device_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const device = {
      id: deviceId,
      ...deviceData,
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active'
    };

    this.devices.set(deviceId, device);
    return device;
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId) {
    return this.devices.get(deviceId);
  }

  /**
   * Register push token
   */
  registerPushToken(userId, token, platform) {
    const pushToken = {
      id: `push_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      token,
      platform,
      registeredAt: new Date().toISOString(),
      active: true
    };

    this.pushTokens.push(pushToken);
    return pushToken;
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId, notification) {
    const tokens = this.pushTokens.filter(t => t.userId === userId && t.active);
    
    if (tokens.length === 0) {
      console.log('No push tokens found for user:', userId);
      return null;
    }

    // In production: use Firebase Cloud Messaging or similar
    console.log(`📱 Sending push notification to ${tokens.length} devices`);
    console.log('Notification:', notification);

    return {
      success: true,
      tokens: tokens.length,
      notification,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Sync offline data
   */
  async syncOfflineData(userId, offlineData) {
    console.log(`🔄 Syncing offline data for user: ${userId}`);

    const syncResult = {
      synced: [],
      failed: [],
      timestamp: new Date().toISOString()
    };

    for (const item of offlineData) {
      try {
        // Process each item
        const processed = await this.processOfflineItem(item, userId);
        syncResult.synced.push(processed);
      } catch (error) {
        syncResult.failed.push({
          item: item,
          error: error.message
        });
      }
    }

    // Add to sync queue
    this.syncQueue.push({
      userId,
      data: offlineData,
      timestamp: new Date().toISOString(),
      status: syncResult.failed.length === 0 ? 'completed' : 'partial'
    });

    return syncResult;
  }

  /**
   * Process offline item
   */
  async processOfflineItem(item, userId) {
    switch (item.type) {
      case 'memory':
        // Save memory
        return {
          id: `memory_${Date.now()}`,
          ...item.data,
          userId,
          syncedAt: new Date().toISOString()
        };
      case 'story':
        // Save story
        return {
          id: `story_${Date.now()}`,
          ...item.data,
          userId,
          syncedAt: new Date().toISOString()
        };
      case 'photo':
        // Save photo
        return {
          id: `photo_${Date.now()}`,
          ...item.data,
          userId,
          syncedAt: new Date().toISOString()
        };
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  /**
   * Get sync queue
   */
  getSyncQueue(userId = null) {
    if (userId) {
      return this.syncQueue.filter(q => q.userId === userId);
    }
    return this.syncQueue;
  }

  /**
   * Record audio
   */
  async recordAudio(userId, audioData) {
    const recording = {
      id: `audio_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      data: audioData,
      recordedAt: new Date().toISOString(),
      duration: audioData.duration || 0,
      size: audioData.size || 0,
      transcription: null
    };

    this.audioRecordings.push(recording);

    // In production: transcribe audio
    // For now: simulate transcription
    recording.transcription = await this.transcribeAudio(audioData);

    return recording;
  }

  /**
   * Transcribe audio (simulated)
   */
  async transcribeAudio(audioData) {
    // In production: use speech-to-text API
    return 'This is a simulated transcription of the audio recording.';
  }

  /**
   * Get audio recordings
   */
  getAudioRecordings(userId = null) {
    if (userId) {
      return this.audioRecordings.filter(r => r.userId === userId);
    }
    return this.audioRecordings;
  }

  /**
   * Upload image
   */
  async uploadImage(userId, imageData) {
    const image = {
      id: `img_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      data: imageData,
      uploadedAt: new Date().toISOString(),
      size: imageData.size || 0,
      processed: false
    };

    this.images.push(image);

    // In production: process image (resize, optimize)
    image.processed = await this.processImage(imageData);

    return image;
  }

  /**
   * Process image (simulated)
   */
  async processImage(imageData) {
    // In production: resize, optimize, add watermark
    return {
      original: imageData.url,
      thumbnail: imageData.url + '?w=300',
      medium: imageData.url + '?w=600',
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Get images
   */
  getImages(userId = null) {
    if (userId) {
      return this.images.filter(i => i.userId === userId);
    }
    return this.images;
  }

  /**
   * Download offline content
   */
  async downloadOfflineContent(contentId, userId) {
    // In production: fetch from database
    // For now: create sample offline content
    const content = {
      id: `offline_${Date.now()}_${uuidv4().slice(0, 8)}`,
      contentId,
      userId,
      downloadedAt: new Date().toISOString(),
      status: 'downloaded',
      size: Math.random() * 5 + 1 // MB
    };

    this.offlineData.set(content.id, content);
    return content;
  }

  /**
   * Get offline content
   */
  getOfflineContent(userId = null) {
    const contents = Array.from(this.offlineData.values());
    if (userId) {
      return contents.filter(c => c.userId === userId);
    }
    return contents;
  }

  /**
   * Delete offline content
   */
  deleteOfflineContent(contentId) {
    if (this.offlineData.has(contentId)) {
      this.offlineData.delete(contentId);
      return { success: true, message: 'Content deleted' };
    }
    return { success: false, message: 'Content not found' };
  }

  /**
   * Get user session
   */
  getUserSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        userId,
        sessions: [],
        currentSession: null
      });
    }
    return this.userSessions.get(userId);
  }

  /**
   * Start session
   */
  startSession(userId, deviceId) {
    const session = {
      id: `session_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      deviceId,
      startedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      active: true
    };

    const userSession = this.getUserSession(userId);
    userSession.sessions.push(session);
    userSession.currentSession = session;

    return session;
  }

  /**
   * End session
   */
  endSession(sessionId) {
    for (const [userId, userSession] of this.userSessions) {
      const session = userSession.sessions.find(s => s.id === sessionId);
      if (session) {
        session.active = false;
        session.endedAt = new Date().toISOString();
        if (userSession.currentSession?.id === sessionId) {
          userSession.currentSession = null;
        }
        return session;
      }
    }
    return null;
  }

  /**
   * Get mobile app statistics
   */
  getStats() {
    return {
      totalDevices: this.devices.size,
      activeDevices: Array.from(this.devices.values()).filter(d => d.status === 'active').length,
      totalPushTokens: this.pushTokens.length,
      activePushTokens: this.pushTokens.filter(t => t.active).length,
      totalAudioRecordings: this.audioRecordings.length,
      totalImages: this.images.length,
      totalOfflineContent: this.offlineData.size,
      totalSyncQueue: this.syncQueue.length,
      totalSessions: Array.from(this.userSessions.values()).reduce(
        (sum, us) => sum + us.sessions.length, 0
      ),
      activeSessions: Array.from(this.userSessions.values()).filter(
        us => us.currentSession !== null
      ).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get device analytics
   */
  getDeviceAnalytics(deviceId = null) {
    if (deviceId) {
      const device = this.getDevice(deviceId);
      if (!device) return null;

      return {
        device,
        sessions: Array.from(this.userSessions.values())
          .flatMap(us => us.sessions)
          .filter(s => s.deviceId === deviceId),
        timestamp: new Date().toISOString()
      };
    }

    // Overall device analytics
    const devices = Array.from(this.devices.values());
    return {
      totalDevices: devices.length,
      platforms: devices.reduce((acc, d) => {
        acc[d.platform] = (acc[d.platform] || 0) + 1;
        return acc;
      }, {}),
      osVersions: devices.reduce((acc, d) => {
        acc[d.osVersion] = (acc[d.osVersion] || 0) + 1;
        return acc;
      }, {}),
      activeDevices: devices.filter(d => d.status === 'active').length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get mobile app version info
   */
  getVersionInfo() {
    return {
      currentVersion: '1.0.0',
      minimumVersion: '1.0.0',
      releaseDate: new Date().toISOString(),
      features: [
        'Offline content access',
        'GPS location services',
        'AR experiences',
        'Push notifications',
        'Camera integration',
        'Voice recording',
        'Native performance'
      ],
      changelog: [
        'Initial release'
      ]
    };
  }
}

module.exports = MobileAppService;
module.exports = MobileAppService;

