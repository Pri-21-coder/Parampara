// services/eventService.js
const store = require('../../data/store');

class EventService {
  constructor() {
    this.events = [];
    this.subscribers = new Map();
    this.eventCategories = [
      'festival', 'ceremony', 'workshop', 'exhibition', 
      'performance', 'ritual', 'celebration', 'gathering'
    ];
    this.isRunning = false;
    
    this.init();
  }

  init() {
    this.loadSampleEvents();
    this.startEventDetection();
    console.log('✅ Event Service initialized');
  }

  loadSampleEvents() {
    this.events = [
      {
        id: 'event_1',
        title: 'Makar Sankranti Festival',
        description: 'Traditional harvest festival with kite flying and feasts',
        category: 'festival',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Village Center',
          lat: 22.5726,
          lng: 88.3639,
          address: 'Kolkata, West Bengal'
        },
        organizer: {
          name: 'Village Cultural Committee',
          contact: 'committee@village.org'
        },
        capacity: 500,
        rsvpCount: 0,
        attendees: [],
        virtual: {
          enabled: true,
          streamUrl: null
        },
        media: ['image1.jpg', 'image2.jpg'],
        tags: ['harvest', 'kite', 'tradition'],
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'event_2',
        title: 'Folk Music Workshop',
        description: 'Learn traditional folk music from local artists',
        category: 'workshop',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Cultural Center',
          lat: 22.5736,
          lng: 88.3649,
          address: 'Cultural Center, West Bengal'
        },
        organizer: {
          name: 'Heritage Foundation',
          contact: 'heritage@foundation.org'
        },
        capacity: 50,
        rsvpCount: 0,
        attendees: [],
        virtual: {
          enabled: true,
          streamUrl: null
        },
        media: ['workshop1.jpg'],
        tags: ['music', 'folk', 'learning'],
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'event_3',
        title: 'Traditional Art Exhibition',
        description: 'Exhibition of traditional Madhubani paintings and crafts',
        category: 'exhibition',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Art Gallery',
          lat: 22.5746,
          lng: 88.3659,
          address: 'Art Gallery, West Bengal'
        },
        organizer: {
          name: 'Artisans Collective',
          contact: 'artisans@collective.org'
        },
        capacity: 200,
        rsvpCount: 0,
        attendees: [],
        virtual: {
          enabled: true,
          streamUrl: null
        },
        media: ['exhibition1.jpg', 'exhibition2.jpg'],
        tags: ['art', 'madhubani', 'crafts'],
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * Start AI-powered event detection
   */
  startEventDetection() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔍 Event detection started');
    
    // Run detection every hour
    setInterval(() => {
      this.detectEvents();
    }, 60 * 60 * 1000);
  }

  /**
   * Detect events from various sources
   */
  async detectEvents() {
    console.log('🔎 Scanning for new events...');
    
    try {
      // In production, would scrape from:
      // - Social media (Facebook events, Twitter)
      // - Local news websites
      // - Government cultural calendars
      // - Community forums
      
      // Simulate detection
      const detectedEvents = await this.scrapeEventSources();
      
      for (const detected of detectedEvents) {
        if (!this.isDuplicateEvent(detected)) {
          const event = this.createEvent(detected);
          this.events.push(event);
          
          // Notify subscribers about new event
          this.notifySubscribers(event);
          
          console.log(`📢 New event detected: ${event.title}`);
        }
      }
    } catch (error) {
      console.error('Error detecting events:', error);
    }
  }

  /**
   * Simulate scraping event sources
   */
  async scrapeEventSources() {
    // In production, would call actual APIs
    // For now, return sample detected events
    return [
      {
        title: 'Rural Craft Fair',
        description: 'Annual craft fair featuring local artisans',
        category: 'exhibition',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          name: 'Rural Market',
          lat: 22.5726 + (Math.random() - 0.5) * 0.01,
          lng: 88.3639 + (Math.random() - 0.5) * 0.01,
          address: 'Rural Market Area'
        },
        organizer: {
          name: 'Artisan Association',
          contact: 'artisans@association.org'
        },
        tags: ['craft', 'artisan', 'fair']
      }
    ];
  }

  /**
   * Check if event is duplicate
   */
  isDuplicateEvent(eventData) {
    return this.events.some(e => 
      e.title.toLowerCase() === eventData.title.toLowerCase() &&
      Math.abs(new Date(e.date) - new Date(eventData.date)) < 1000 * 60 * 60
    );
  }

  /**
   * Create new event
   */
  createEvent(eventData) {
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...eventData,
      capacity: eventData.capacity || 100,
      rsvpCount: 0,
      attendees: [],
      virtual: {
        enabled: false,
        streamUrl: null
      },
      media: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Submit event
   */
  submitEvent(eventData, userId) {
    const event = this.createEvent({
      ...eventData,
      submittedBy: userId,
      source: 'user_submission'
    });
    
    this.events.push(event);
    this.notifySubscribers(event);
    
    return event;
  }

  /**
   * Get events with filters
   */
  getEvents(filters = {}) {
    let filtered = [...this.events];

    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters.location) {
      // Filter by distance if lat/lng provided
      if (filters.lat && filters.lng) {
        filtered = filtered.filter(e => {
          const distance = this.calculateDistance(
            filters.lat, filters.lng,
            e.location.lat, e.location.lng
          );
          return distance <= (filters.radius || 50); // km
        });
      }
    }

    if (filters.startDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(filters.endDate));
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    return filtered;
  }

  /**
   * Get event by ID
   */
  getEvent(eventId) {
    return this.events.find(e => e.id === eventId);
  }

  /**
   * RSVP to event
   */
  rsvpToEvent(eventId, userId, userData = {}) {
    const event = this.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status === 'cancelled') {
      throw new Error('Event is cancelled');
    }

    if (event.attendees.includes(userId)) {
      throw new Error('Already RSVPed');
    }

    if (event.attendees.length >= event.capacity) {
      throw new Error('Event is full');
    }

    event.attendees.push(userId);
    event.rsvpCount++;
    event.updatedAt = new Date().toISOString();

    // Add to user's events
    store.userEvents = store.userEvents || {};
    if (!store.userEvents[userId]) {
      store.userEvents[userId] = [];
    }
    store.userEvents[userId].push(eventId);

    return event;
  }

  /**
   * Cancel RSVP
   */
  cancelRsvp(eventId, userId) {
    const event = this.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.attendees = event.attendees.filter(id => id !== userId);
    event.rsvpCount = Math.max(0, event.rsvpCount - 1);
    event.updatedAt = new Date().toISOString();

    if (store.userEvents && store.userEvents[userId]) {
      store.userEvents[userId] = store.userEvents[userId].filter(id => id !== eventId);
    }

    return event;
  }

  /**
   * Get user's events
   */
  getUserEvents(userId) {
    const eventIds = (store.userEvents && store.userEvents[userId]) || [];
    return this.events.filter(e => eventIds.includes(e.id));
  }

  /**
   * Subscribe to event notifications
   */
  subscribeToEvents(userId, preferences = {}) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, {
        userId,
        preferences: {
          categories: preferences.categories || ['festival', 'ceremony', 'workshop', 'exhibition', 'performance', 'ritual', 'celebration', 'gathering'],
          radius: preferences.radius || 50,
          notificationMethods: preferences.notificationMethods || ['email', 'push'],
          location: preferences.location || null,
          createdAt: new Date().toISOString()
        },
        subscribedAt: new Date().toISOString()
      });
    }

    return this.subscribers.get(userId);
  }

  /**
   * Unsubscribe from event notifications
   */
  unsubscribeFromEvents(userId) {
    this.subscribers.delete(userId);
  }

  /**
   * Get subscriber preferences
   */
  getSubscriberPreferences(userId) {
    return this.subscribers.get(userId);
  }

  /**
   * Notify subscribers about new event
   */
  notifySubscribers(event) {
    const subscribers = Array.from(this.subscribers.values());
    
    subscribers.forEach(subscriber => {
      // Check if event matches preferences
      const matchesCategory = subscriber.preferences.categories.includes(event.category);
      
      // Check if event is within radius
      let matchesLocation = true;
      if (subscriber.preferences.location) {
        const distance = this.calculateDistance(
          subscriber.preferences.location.lat,
          subscriber.preferences.location.lng,
          event.location.lat,
          event.location.lng
        );
        matchesLocation = distance <= (subscriber.preferences.radius || 50);
      }
      
      if (matchesCategory && matchesLocation) {
        // Send notifications based on preferences
        subscriber.preferences.notificationMethods.forEach(method => {
          this.sendNotification(subscriber.userId, event, method);
        });
      }
    });
  }

  /**
   * Send notification to user
   */
  sendNotification(userId, event, method) {
    // In production, would integrate with:
    // - Firebase Cloud Messaging (push)
    // - Email service (email)
    // - SMS service (sms)
    // - Web push notifications
    
    const message = {
      title: `🎉 New Event: ${event.title}`,
      body: `${event.description}\n📍 ${event.location.name}\n📅 ${new Date(event.date).toLocaleDateString()}`,
      data: {
        eventId: event.id,
        type: 'new_event'
      }
    };
    
    console.log(`📨 Sending notification to ${userId} via ${method}:`, message);
    
    // Store notification
    store.notifications = store.notifications || {};
    if (!store.notifications[userId]) {
      store.notifications[userId] = [];
    }
    store.notifications[userId].push({
      ...message,
      sentAt: new Date().toISOString(),
      method,
      read: false
    });
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId) {
    return (store.notifications && store.notifications[userId]) || [];
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(userId, notificationIndex) {
    if (store.notifications && store.notifications[userId]) {
      store.notifications[userId][notificationIndex].read = true;
    }
  }

  /**
   * Calculate distance between two coordinates (km)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get event statistics
   */
  getEventStats() {
    const stats = {
      totalEvents: this.events.length,
      upcomingEvents: this.events.filter(e => e.status === 'upcoming').length,
      pastEvents: this.events.filter(e => e.status === 'completed').length,
      byCategory: {},
      byStatus: {
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0
      },
      totalAttendees: 0,
      averageAttendance: 0,
      topCategories: []
    };

    // Count by category
    const categoryCount = {};
    this.events.forEach(event => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;
      stats.totalAttendees += event.rsvpCount || 0;
    });

    stats.byCategory = categoryCount;
    
    // Top categories
    stats.topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    stats.averageAttendance = stats.totalEvents > 0 
      ? stats.totalAttendees / stats.totalEvents 
      : 0;

    return stats;
  }

  /**
   * Create virtual stream for event
   */
  createVirtualStream(eventId) {
    const event = this.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.virtual.enabled) {
      throw new Error('Virtual streaming not enabled for this event');
    }

    // Generate stream URL (in production, would integrate with streaming service)
    const streamUrl = `https://stream.parampara.com/events/${eventId}`;
    event.virtual.streamUrl = streamUrl;
    event.updatedAt = new Date().toISOString();

    return {
      eventId,
      streamUrl,
      startTime: event.date,
      status: 'ready'
    };
  }

  /**
   * Get upcoming events near location
   */
  getNearbyEvents(lat, lng, radius = 50, limit = 10) {
    return this.getEvents({ lat, lng, radius, status: 'upcoming' })
      .slice(0, limit);
  }

  /**
   * Get event calendar data
   */
  getEventCalendar(month, year) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const events = this.getEvents({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Group events by date
    const calendar = {};
    events.forEach(event => {
      const date = new Date(event.date).toDateString();
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push(event);
    });

    return calendar;
  }
}

module.exports = EventService;