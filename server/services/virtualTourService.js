// services/virtualTourService.js
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const store = require('../../data/store');

class VirtualTourService {
  constructor() {
    this.tours = [];
    this.tourSessions = new Map();
    this.tourGuides = [];
    this.tourBookings = [];
    this.tourRecordings = [];
    this.liveStreams = new Map();
    this.chatMessages = new Map();
    
    this.init();
  }

  init() {
    this.loadTourGuides();
    this.loadSampleTours();
    console.log('✅ Virtual Tour Service initialized');
  }

  loadTourGuides() {
    this.tourGuides = [
      {
        id: 'guide_1',
        name: 'Priya Sharma',
        specialty: 'Heritage Architecture',
        languages: ['English', 'Hindi', 'Bengali'],
        rating: 4.9,
        totalTours: 45,
        bio: 'Expert in heritage architecture with 10 years of experience',
        available: true,
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 'guide_2',
        name: 'Rahul Verma',
        specialty: 'Cultural History',
        languages: ['English', 'Hindi', 'Marathi'],
        rating: 4.8,
        totalTours: 32,
        bio: 'Cultural historian specializing in Indian traditions',
        available: true,
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 'guide_3',
        name: 'Ananya Patel',
        specialty: 'Art & Craft',
        languages: ['English', 'Hindi', 'Gujarati'],
        rating: 4.7,
        totalTours: 28,
        bio: 'Art expert with deep knowledge of traditional crafts',
        available: true,
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 'guide_4',
        name: 'Vikram Singh',
        specialty: 'Archaeology',
        languages: ['English', 'Hindi', 'Tamil'],
        rating: 4.9,
        totalTours: 52,
        bio: 'Archaeologist with expertise in ancient Indian sites',
        available: false,
        image: 'https://via.placeholder.com/100'
      }
    ];
  }

  loadSampleTours() {
    this.tours = [
      {
        id: 'tour_1',
        name: 'Kolkata Heritage Walk',
        description: 'Explore the colonial heritage of Kolkata with a live guide',
        location: 'Kolkata, West Bengal',
        duration: 120,
        price: 500,
        category: 'heritage',
        guideId: 'guide_1',
        images: ['https://via.placeholder.com/600x400'],
        schedule: [
          { day: 'Monday', time: '10:00 AM' },
          { day: 'Wednesday', time: '2:00 PM' },
          { day: 'Friday', time: '10:00 AM' }
        ],
        maxParticipants: 20,
        languages: ['English', 'Hindi'],
        features: ['live_chat', '360_view', 'recording'],
        rating: 4.8,
        totalReviews: 45,
        status: 'active',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tour_2',
        name: 'Mystical Varanasi Tour',
        description: 'Experience the spiritual heritage of Varanasi',
        location: 'Varanasi, Uttar Pradesh',
        duration: 180,
        price: 750,
        category: 'spiritual',
        guideId: 'guide_2',
        images: ['https://via.placeholder.com/600x400'],
        schedule: [
          { day: 'Tuesday', time: '6:00 AM' },
          { day: 'Thursday', time: '4:00 PM' },
          { day: 'Saturday', time: '6:00 AM' }
        ],
        maxParticipants: 15,
        languages: ['English', 'Hindi'],
        features: ['live_chat', '360_view', 'recording', 'vr'],
        rating: 4.9,
        totalReviews: 38,
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tour_3',
        name: 'Rajasthan Forts Expedition',
        description: 'Virtual tour of the majestic forts of Rajasthan',
        location: 'Jaipur, Rajasthan',
        duration: 240,
        price: 1000,
        category: 'historical',
        guideId: 'guide_4',
        images: ['https://via.placeholder.com/600x400'],
        schedule: [
          { day: 'Sunday', time: '9:00 AM' },
          { day: 'Wednesday', time: '9:00 AM' }
        ],
        maxParticipants: 25,
        languages: ['English', 'Hindi'],
        features: ['live_chat', '360_view', 'recording', 'ar'],
        rating: 4.7,
        totalReviews: 52,
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'tour_4',
        name: 'Kerala Backwaters Cultural Tour',
        description: 'Explore the cultural heritage of Kerala\'s backwaters',
        location: 'Kerala, India',
        duration: 150,
        price: 600,
        category: 'cultural',
        guideId: 'guide_3',
        images: ['https://via.placeholder.com/600x400'],
        schedule: [
          { day: 'Monday', time: '8:00 AM' },
          { day: 'Thursday', time: '2:00 PM' },
          { day: 'Saturday', time: '8:00 AM' }
        ],
        maxParticipants: 18,
        languages: ['English', 'Hindi', 'Malayalam'],
        features: ['live_chat', '360_view', 'recording'],
        rating: 4.6,
        totalReviews: 30,
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Get all tours
   */
  getTours(filters = {}) {
    let filtered = [...this.tours];

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.guideId) {
      filtered = filtered.filter(t => t.guideId === filters.guideId);
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.location.toLowerCase().includes(search)
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(t => t.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(t => t.price <= filters.maxPrice);
    }

    return filtered;
  }

  /**
   * Get tour by ID
   */
  getTour(tourId) {
    return this.tours.find(t => t.id === tourId);
  }

  /**
   * Get tour guides
   */
  getGuides(available = null) {
    if (available !== null) {
      return this.tourGuides.filter(g => g.available === available);
    }
    return this.tourGuides;
  }

  /**
   * Get guide by ID
   */
  getGuide(guideId) {
    return this.tourGuides.find(g => g.id === guideId);
  }

  /**
   * Start virtual tour
   */
  async startTour(tourId, userId) {
    const tour = this.getTour(tourId);
    if (!tour) {
      throw new Error('Tour not found');
    }

    const guide = this.getGuide(tour.guideId);
    if (!guide || !guide.available) {
      throw new Error('Guide not available');
    }

    // Create tour session
    const sessionId = `session_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const session = {
      id: sessionId,
      tourId,
      userId,
      guideId: tour.guideId,
      startTime: new Date().toISOString(),
      status: 'active',
      participants: [userId],
      chatMessages: [],
      recording: null,
      viewerCount: 1,
      analytics: {
        views: 1,
        interactions: 0,
        duration: 0
      }
    };

    this.tourSessions.set(sessionId, session);

    // Create live stream (simulated)
    const streamId = `stream_${Date.now()}`;
    this.liveStreams.set(streamId, {
      id: streamId,
      sessionId,
      status: 'live',
      viewers: 1,
      startedAt: new Date().toISOString()
    });

    return {
      sessionId,
      streamId,
      tour,
      guide,
      joinUrl: `/virtual-tour/${sessionId}`,
      streamUrl: `/api/tour/stream/${streamId}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Join tour session
   */
  joinTour(sessionId, userId) {
    const session = this.tourSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'ended') {
      throw new Error('Tour has ended');
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      session.viewerCount = session.participants.length;
    }

    // Update stream viewers
    for (const [streamId, stream] of this.liveStreams) {
      if (stream.sessionId === sessionId) {
        stream.viewers = session.viewerCount;
        break;
      }
    }

    return session;
  }

  /**
   * Leave tour session
   */
  leaveTour(sessionId, userId) {
    const session = this.tourSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.participants = session.participants.filter(id => id !== userId);
    session.viewerCount = session.participants.length;

    // Update stream viewers
    for (const [streamId, stream] of this.liveStreams) {
      if (stream.sessionId === sessionId) {
        stream.viewers = session.viewerCount;
        break;
      }
    }

    return session;
  }

  /**
   * End tour session
   */
  endTour(sessionId) {
    const session = this.tourSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'ended';
    session.endTime = new Date().toISOString();

    // End stream
    for (const [streamId, stream] of this.liveStreams) {
      if (stream.sessionId === sessionId) {
        stream.status = 'ended';
        break;
      }
    }

    return session;
  }

  /**
   * Stream tour content
   */
  async streamTour(streamId) {
    const stream = this.liveStreams.get(streamId);
    if (!stream) {
      throw new Error('Stream not found');
    }

    // In production: actual WebRTC/RTMP streaming
    return {
      streamId,
      status: stream.status,
      viewers: stream.viewers,
      startedAt: stream.startedAt,
      streamUrl: `/api/tour/stream/${streamId}/content`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send chat message
   */
  sendChatMessage(sessionId, userId, message) {
    const session = this.tourSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const chatMessage = {
      id: `msg_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      message,
      timestamp: new Date().toISOString()
    };

    session.chatMessages.push(chatMessage);

    // Store in chat messages map
    if (!this.chatMessages.has(sessionId)) {
      this.chatMessages.set(sessionId, []);
    }
    this.chatMessages.get(sessionId).push(chatMessage);

    return chatMessage;
  }

  /**
   * Get chat messages
   */
  getChatMessages(sessionId) {
    return this.chatMessages.get(sessionId) || [];
  }

  /**
   * Book a tour
   */
  bookTour(tourId, userId, bookingData) {
    const tour = this.getTour(tourId);
    if (!tour) {
      throw new Error('Tour not found');
    }

    const booking = {
      id: `booking_${Date.now()}_${uuidv4().slice(0, 8)}`,
      tourId,
      userId,
      date: bookingData.date,
      time: bookingData.time,
      participants: bookingData.participants || 1,
      specialRequests: bookingData.specialRequests || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending'
    };

    this.tourBookings.push(booking);
    return booking;
  }

  /**
   * Get user bookings
   */
  getUserBookings(userId) {
    return this.tourBookings.filter(b => b.userId === userId);
  }

  /**
   * Cancel booking
   */
  cancelBooking(bookingId, userId) {
    const booking = this.tourBookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized');
    }

    booking.status = 'cancelled';
    return booking;
  }

  /**
   * Record tour
   */
  recordTour(sessionId) {
    const session = this.tourSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const recording = {
      id: `recording_${Date.now()}_${uuidv4().slice(0, 8)}`,
      sessionId,
      tourId: session.tourId,
      guideId: session.guideId,
      startTime: new Date().toISOString(),
      status: 'recording',
      duration: 0
    };

    this.tourRecordings.push(recording);
    session.recording = recording.id;

    return recording;
  }

  /**
   * Stop recording
   */
  stopRecording(recordingId) {
    const recording = this.tourRecordings.find(r => r.id === recordingId);
    if (!recording) {
      throw new Error('Recording not found');
    }

    recording.status = 'completed';
    recording.endTime = new Date().toISOString();
    recording.duration = Math.floor(
      (new Date(recording.endTime) - new Date(recording.startTime)) / 1000
    );

    return recording;
  }

  /**
   * Get recordings
   */
  getRecordings(tourId = null) {
    if (tourId) {
      return this.tourRecordings.filter(r => r.tourId === tourId);
    }
    return this.tourRecordings;
  }

  /**
   * Get tour analytics
   */
  getTourAnalytics(tourId = null) {
    if (tourId) {
      const tour = this.getTour(tourId);
      if (!tour) return null;

      const bookings = this.tourBookings.filter(b => b.tourId === tourId);
      const sessions = Array.from(this.tourSessions.values()).filter(
        s => s.tourId === tourId
      );

      return {
        tourId,
        totalBookings: bookings.length,
        totalSessions: sessions.length,
        totalParticipants: sessions.reduce((sum, s) => sum + s.participants.length, 0),
        averageParticipants: sessions.length > 0 ? 
          sessions.reduce((sum, s) => sum + s.participants.length, 0) / sessions.length : 0,
        chatMessages: sessions.reduce((sum, s) => sum + s.chatMessages.length, 0),
        recordings: this.tourRecordings.filter(r => r.tourId === tourId).length,
        timestamp: new Date().toISOString()
      };
    }

    // Overall analytics
    const allSessions = Array.from(this.tourSessions.values());
    const totalParticipants = allSessions.reduce((sum, s) => sum + s.participants.length, 0);

    return {
      totalTours: this.tours.length,
      totalSessions: allSessions.length,
      totalParticipants,
      averageParticipantsPerSession: allSessions.length > 0 ? 
        totalParticipants / allSessions.length : 0,
      totalBookings: this.tourBookings.length,
      totalRecordings: this.tourRecordings.length,
      totalGuides: this.tourGuides.length,
      activeGuides: this.tourGuides.filter(g => g.available).length,
      popularTours: this.getPopularTours(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get popular tours
   */
  getPopularTours(limit = 5) {
    const tourStats = {};
    
    this.tourBookings.forEach(booking => {
      tourStats[booking.tourId] = (tourStats[booking.tourId] || 0) + 1;
    });

    const sorted = Object.entries(tourStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tourId, count]) => {
        const tour = this.getTour(tourId);
        return tour ? { ...tour, bookings: count } : null;
      })
      .filter(Boolean);

    return sorted;
  }

  /**
   * Get tour stats
   */
  getStats() {
    const allSessions = Array.from(this.tourSessions.values());
    const activeSessions = allSessions.filter(s => s.status === 'active');
    const totalParticipants = allSessions.reduce((sum, s) => sum + s.participants.length, 0);

    return {
      totalTours: this.tours.length,
      activeTours: this.tours.filter(t => t.status === 'active').length,
      totalGuides: this.tourGuides.length,
      availableGuides: this.tourGuides.filter(g => g.available).length,
      activeSessions: activeSessions.length,
      totalParticipants,
      totalBookings: this.tourBookings.length,
      totalRecordings: this.tourRecordings.length,
      totalChatMessages: Array.from(this.chatMessages.values()).reduce(
        (sum, msgs) => sum + msgs.length, 0
      ),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create new tour
   */
  createTour(tourData) {
    const tour = {
      id: `tour_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...tourData,
      rating: 0,
      totalReviews: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tours.push(tour);
    return tour;
  }

  /**
   * Update tour
   */
  updateTour(tourId, updates) {
    const tour = this.getTour(tourId);
    if (!tour) {
      throw new Error('Tour not found');
    }

    Object.assign(tour, updates);
    tour.updatedAt = new Date().toISOString();
    return tour;
  }

  /**
   * Add guide
   */
  addGuide(guideData) {
    const guide = {
      id: `guide_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...guideData,
      totalTours: 0,
      available: true,
      createdAt: new Date().toISOString()
    };

    this.tourGuides.push(guide);
    return guide;
  }

  /**
   * Update guide availability
   */
  updateGuideAvailability(guideId, available) {
    const guide = this.getGuide(guideId);
    if (!guide) {
      throw new Error('Guide not found');
    }

    guide.available = available;
    return guide;
  }

  /**
   * Rate tour
   */
  rateTour(tourId, rating) {
    const tour = this.getTour(tourId);
    if (!tour) {
      throw new Error('Tour not found');
    }

    const totalRatings = tour.totalReviews || 0;
    const currentTotal = tour.rating * totalRatings;
    const newTotal = currentTotal + rating;
    const newCount = totalRatings + 1;
    
    tour.rating = newTotal / newCount;
    tour.totalReviews = newCount;

    return tour;
  }
}

module.exports = VirtualTourService;