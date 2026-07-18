// services/culturalExchangeService.js
const { v4: uuidv4 } = require('uuid');
const store = require('../../data/store');

class CulturalExchangeService {
  constructor() {
    this.communities = [];
    this.events = [];
    this.workshops = [];
    this.exchangePrograms = [];
    this.culturalAmbassadors = [];
    this.collaborations = [];
    this.matchScores = new Map();
    this.eventCalendar = [];
    
    this.init();
  }

  init() {
    this.loadCommunities();
    this.loadSampleEvents();
    this.loadWorkshops();
    this.loadAmbassadors();
    console.log('✅ Cultural Exchange Service initialized');
  }

  loadCommunities() {
    this.communities = [
      {
        id: 'comm_1',
        name: 'Kolkata Heritage Society',
        region: 'West Bengal',
        culture: 'Bengali',
        traditions: ['Durga Puja', 'Kantha Embroidery', 'Baul Music'],
        members: 150,
        established: 2015,
        description: 'Preserving and promoting Bengali cultural heritage',
        contact: { email: 'kolkata.heritage@example.com', phone: '+91 9876543210' },
        interests: ['traditional_arts', 'music', 'dance', 'crafts'],
        active: true,
        rating: 4.8,
        eventsHosted: 45,
        createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comm_2',
        name: 'Varanasi Cultural Circle',
        region: 'Uttar Pradesh',
        culture: 'North Indian',
        traditions: ['Ganga Aarti', 'Silk Weaving', 'Classical Music'],
        members: 120,
        established: 2018,
        description: 'Celebrating the spiritual and cultural heritage of Varanasi',
        contact: { email: 'varanasi.culture@example.com', phone: '+91 9876543211' },
        interests: ['spiritual', 'music', 'handicrafts', 'festivals'],
        active: true,
        rating: 4.7,
        eventsHosted: 32,
        createdAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comm_3',
        name: 'Rajasthan Arts Collective',
        region: 'Rajasthan',
        culture: 'Rajasthani',
        traditions: ['Folk Dance', 'Bandhani Textile', 'Puppetry'],
        members: 200,
        established: 2010,
        description: 'Promoting the vibrant arts and crafts of Rajasthan',
        contact: { email: 'rajasthan.arts@example.com', phone: '+91 9876543212' },
        interests: ['crafts', 'dance', 'textiles', 'music'],
        active: true,
        rating: 4.9,
        eventsHosted: 67,
        createdAt: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comm_4',
        name: 'Kerala Cultural Forum',
        region: 'Kerala',
        culture: 'Malayali',
        traditions: ['Kathakali', 'Onam', 'Snake Boat Races'],
        members: 180,
        established: 2012,
        description: 'Showcasing the rich cultural tapestry of Kerala',
        contact: { email: 'kerala.culture@example.com', phone: '+91 9876543213' },
        interests: ['performing_arts', 'festivals', 'cuisine', 'heritage'],
        active: true,
        rating: 4.6,
        eventsHosted: 54,
        createdAt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'comm_5',
        name: 'Bihar Heritage Foundation',
        region: 'Bihar',
        culture: 'Bihari',
        traditions: ['Chhath Puja', 'Madhubani Art', 'Bhojpuri Music'],
        members: 100,
        established: 2019,
        description: 'Reviving and preserving Bihar\'s cultural legacy',
        contact: { email: 'bihar.heritage@example.com', phone: '+91 9876543214' },
        interests: ['art', 'music', 'festivals', 'literature'],
        active: true,
        rating: 4.5,
        eventsHosted: 28,
        createdAt: new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadSampleEvents() {
    this.events = [
      {
        id: 'event_1',
        title: 'Bengali Cultural Festival',
        description: 'Celebration of Bengali arts, music, and cuisine',
        type: 'festival',
        hostCommunity: 'comm_1',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 3,
        venue: 'Kolkata Cultural Center',
        capacity: 200,
        registered: 145,
        speakers: ['Lakshmi Devi', 'Ravi Shankar'],
        schedule: [
          { time: '10:00 AM', activity: 'Inauguration' },
          { time: '11:00 AM', activity: 'Kantha Embroidery Workshop' },
          { time: '2:00 PM', activity: 'Baul Music Performance' },
          { time: '5:00 PM', activity: 'Cultural Quiz' }
        ],
        virtual: true,
        registrationFee: 500,
        tags: ['festival', 'bengali', 'music', 'crafts'],
        status: 'upcoming',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'event_2',
        title: 'Rajasthan Folk Arts Workshop',
        description: 'Learn traditional Rajasthani folk arts and crafts',
        type: 'workshop',
        hostCommunity: 'comm_3',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 2,
        venue: 'Jaipur Art Center',
        capacity: 50,
        registered: 35,
        speakers: ['Meera Devi', 'Ramesh Kumar'],
        schedule: [
          { time: '9:00 AM', activity: 'Introduction to Rajasthani Arts' },
          { time: '10:30 AM', activity: 'Bandhani Textile Workshop' },
          { time: '1:00 PM', activity: 'Puppetry Demonstration' },
          { time: '3:00 PM', activity: 'Folk Dance Session' }
        ],
        virtual: true,
        registrationFee: 300,
        tags: ['workshop', 'rajasthani', 'crafts', 'dance'],
        status: 'upcoming',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'event_3',
        title: 'Kerala Classical Arts Showcase',
        description: 'Evening of Kathakali, Mohiniyattam, and classical music',
        type: 'performance',
        hostCommunity: 'comm_4',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 1,
        venue: 'Trivandrum Cultural Hall',
        capacity: 300,
        registered: 220,
        speakers: ['Vijay Menon', 'Sreeja Nair'],
        schedule: [
          { time: '6:00 PM', activity: 'Kathakali Performance' },
          { time: '7:30 PM', activity: 'Mohiniyattam Dance' },
          { time: '8:30 PM', activity: 'Classical Music Concert' }
        ],
        virtual: true,
        registrationFee: 750,
        tags: ['performance', 'kerala', 'dance', 'music'],
        status: 'upcoming',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadWorkshops() {
    this.workshops = [
      {
        id: 'ws_1',
        title: 'Introduction to Kantha Embroidery',
        description: 'Learn the basics of traditional Kantha embroidery',
        communityId: 'comm_1',
        instructor: 'Lakshmi Devi',
        level: 'beginner',
        duration: 4,
        sessions: 6,
        maxParticipants: 20,
        currentParticipants: 12,
        topics: ['History of Kantha', 'Basic Stitches', 'Creating Patterns', 'Color Theory'],
        schedule: 'Every Saturday, 10:00 AM - 12:00 PM',
        materials: ['Needle', 'Thread', 'Fabric', 'Pattern Book'],
        fee: 1500,
        virtual: true,
        rating: 4.9,
        reviews: 8,
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ws_2',
        title: 'Rajasthan Block Printing',
        description: 'Master the art of traditional block printing',
        communityId: 'comm_3',
        instructor: 'Ramesh Kumar',
        level: 'intermediate',
        duration: 6,
        sessions: 8,
        maxParticipants: 15,
        currentParticipants: 10,
        topics: ['History of Block Printing', 'Carving Blocks', 'Color Mixing', 'Printing Techniques'],
        schedule: 'Every Sunday, 2:00 PM - 4:00 PM',
        materials: ['Blocks', 'Fabric', 'Colors', 'Wooden Mallet'],
        fee: 2500,
        virtual: false,
        rating: 4.8,
        reviews: 6,
        status: 'active',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  loadAmbassadors() {
    this.culturalAmbassadors = [
      {
        id: 'amb_1',
        name: 'Priya Sharma',
        communityId: 'comm_1',
        region: 'West Bengal',
        expertise: ['Kantha Embroidery', 'Baul Music', 'Bengali Literature'],
        languages: ['Bengali', 'Hindi', 'English'],
        experience: 8,
        eventsHosted: 25,
        rating: 4.9,
        bio: 'Passionate about preserving Bengali cultural heritage',
        available: true,
        image: 'https://via.placeholder.com/100',
        contact: { email: 'priya@example.com', phone: '+91 9876543210' },
        createdAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'amb_2',
        name: 'Vikram Singh',
        communityId: 'comm_3',
        region: 'Rajasthan',
        expertise: ['Folk Dance', 'Puppetry', 'Rajasthani Music'],
        languages: ['Hindi', 'English', 'Rajasthani'],
        experience: 10,
        eventsHosted: 35,
        rating: 4.8,
        bio: 'Dedicated to promoting Rajasthan\'s rich folk traditions',
        available: true,
        image: 'https://via.placeholder.com/100',
        contact: { email: 'vikram@example.com', phone: '+91 9876543211' },
        createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'amb_3',
        name: 'Sreeja Nair',
        communityId: 'comm_4',
        region: 'Kerala',
        expertise: ['Kathakali', 'Mohiniyattam', 'Classical Music'],
        languages: ['Malayalam', 'Hindi', 'English'],
        experience: 12,
        eventsHosted: 40,
        rating: 4.9,
        bio: 'Preserving and promoting Kerala\'s classical arts',
        available: true,
        image: 'https://via.placeholder.com/100',
        contact: { email: 'sreeja@example.com', phone: '+91 9876543212' },
        createdAt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Get all communities
   */
  getCommunities(filters = {}) {
    let filtered = [...this.communities];

    if (filters.region) {
      filtered = filtered.filter(c => c.region === filters.region);
    }

    if (filters.culture) {
      filtered = filtered.filter(c => c.culture.toLowerCase().includes(filters.culture.toLowerCase()));
    }

    if (filters.active !== undefined) {
      filtered = filtered.filter(c => c.active === filters.active);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.traditions.some(t => t.toLowerCase().includes(search))
      );
    }

    return filtered;
  }

  /**
   * Get community by ID
   */
  getCommunity(communityId) {
    return this.communities.find(c => c.id === communityId);
  }

  /**
   * Create community
   */
  createCommunity(communityData) {
    const community = {
      id: `comm_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...communityData,
      members: communityData.members || 0,
      eventsHosted: 0,
      rating: 0,
      active: true,
      createdAt: new Date().toISOString()
    };

    this.communities.push(community);
    return community;
  }

  /**
   * Match communities based on interests
   */
  matchCommunities(communityId) {
    const community = this.getCommunity(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const matches = this.communities
      .filter(c => c.id !== communityId && c.active)
      .map(c => {
        const score = this.calculateMatchScore(community, c);
        return { community: c, score };
      })
      .sort((a, b) => b.score - a.score);

    // Cache match scores
    this.matchScores.set(communityId, matches);

    return matches;
  }

  /**
   * Calculate match score between communities
   */
  calculateMatchScore(community1, community2) {
    let score = 0;

    // Interest matching
    const commonInterests = community1.interests.filter(i =>
      community2.interests.includes(i)
    );
    score += (commonInterests.length / Math.max(community1.interests.length, community2.interests.length)) * 40;

    // Regional proximity (simplified)
    if (community1.region === community2.region) {
      score += 20;
    }

    // Tradition matching
    const commonTraditions = community1.traditions.filter(t =>
      community2.traditions.includes(t)
    );
    score += (commonTraditions.length / Math.max(community1.traditions.length, community2.traditions.length)) * 30;

    // Size compatibility
    const sizeRatio = Math.min(community1.members, community2.members) /
                      Math.max(community1.members, community2.members);
    score += sizeRatio * 10;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Schedule exchange program
   */
  scheduleExchange(eventData) {
    const exchange = {
      id: `exchange_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...eventData,
      status: 'scheduled',
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.exchangePrograms.push(exchange);

    // Notify communities
    this.notifyCommunities(exchange);

    return exchange;
  }

  /**
   * Get exchange programs
   */
  getExchanges(filters = {}) {
    let filtered = [...this.exchangePrograms];

    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters.communityId) {
      filtered = filtered.filter(e =>
        e.community1Id === filters.communityId ||
        e.community2Id === filters.communityId
      );
    }

    return filtered;
  }

  /**
   * Join exchange program
   */
  joinExchange(exchangeId, userId) {
    const exchange = this.exchangePrograms.find(e => e.id === exchangeId);
    if (!exchange) {
      throw new Error('Exchange not found');
    }

    if (!exchange.participants.includes(userId)) {
      exchange.participants.push(userId);
      exchange.updatedAt = new Date().toISOString();
    }

    return exchange;
  }

  /**
   * Create collaboration
   */
  createCollaboration(collaborationData) {
    const collaboration = {
      id: `collab_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...collaborationData,
      status: 'pending',
      progress: 0,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.collaborations.push(collaboration);
    return collaboration;
  }

  /**
   * Get collaborations
   */
  getCollaborations(communityId = null) {
    if (communityId) {
      return this.collaborations.filter(c =>
        c.community1Id === communityId ||
        c.community2Id === communityId
      );
    }
    return this.collaborations;
  }

  /**
   * Update collaboration progress
   */
  updateCollaboration(collabId, updates) {
    const collab = this.collaborations.find(c => c.id === collabId);
    if (!collab) {
      throw new Error('Collaboration not found');
    }

    Object.assign(collab, updates);
    collab.updatedAt = new Date().toISOString();
    return collab;
  }

  /**
   * Get workshops
   */
  getWorkshops(filters = {}) {
    let filtered = [...this.workshops];

    if (filters.communityId) {
      filtered = filtered.filter(w => w.communityId === filters.communityId);
    }

    if (filters.level) {
      filtered = filtered.filter(w => w.level === filters.level);
    }

    if (filters.status) {
      filtered = filtered.filter(w => w.status === filters.status);
    }

    return filtered;
  }

  /**
   * Get workshop by ID
   */
  getWorkshop(workshopId) {
    return this.workshops.find(w => w.id === workshopId);
  }

  /**
   * Register for workshop
   */
  registerForWorkshop(workshopId, userId) {
    const workshop = this.getWorkshop(workshopId);
    if (!workshop) {
      throw new Error('Workshop not found');
    }

    if (workshop.currentParticipants >= workshop.maxParticipants) {
      throw new Error('Workshop is full');
    }

    workshop.currentParticipants++;
    return workshop;
  }

  /**
   * Get events
   */
  getEvents(filters = {}) {
    let filtered = [...this.events];

    if (filters.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters.communityId) {
      filtered = filtered.filter(e => e.hostCommunity === filters.communityId);
    }

    if (filters.upcoming) {
      filtered = filtered.filter(e => new Date(e.date) > new Date());
    }

    return filtered;
  }

  /**
   * Get event by ID
   */
  getEvent(eventId) {
    return this.events.find(e => e.id === eventId);
  }

  /**
   * Create event
   */
  createEvent(eventData) {
    const event = {
      id: `event_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...eventData,
      registered: 0,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.push(event);

    // Add to calendar
    this.eventCalendar.push({
      eventId: event.id,
      date: event.date,
      title: event.title,
      type: event.type
    });

    return event;
  }

  /**
   * Register for event
   */
  registerForEvent(eventId, userId) {
    const event = this.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.registered >= event.capacity) {
      throw new Error('Event is full');
    }

    event.registered++;
    event.updatedAt = new Date().toISOString();
    return event;
  }

  /**
   * Get ambassadors
   */
  getAmbassadors(filters = {}) {
    let filtered = [...this.culturalAmbassadors];

    if (filters.communityId) {
      filtered = filtered.filter(a => a.communityId === filters.communityId);
    }

    if (filters.region) {
      filtered = filtered.filter(a => a.region === filters.region);
    }

    if (filters.available !== undefined) {
      filtered = filtered.filter(a => a.available === filters.available);
    }

    return filtered;
  }

  /**
   * Get ambassador by ID
   */
  getAmbassador(ambassadorId) {
    return this.culturalAmbassadors.find(a => a.id === ambassadorId);
  }

  /**
   * Create ambassador
   */
  createAmbassador(ambassadorData) {
    const ambassador = {
      id: `amb_${Date.now()}_${uuidv4().slice(0, 8)}`,
      ...ambassadorData,
      eventsHosted: 0,
      rating: 0,
      available: true,
      createdAt: new Date().toISOString()
    };

    this.culturalAmbassadors.push(ambassador);
    return ambassador;
  }

  /**
   * Get event calendar
   */
  getEventCalendar(month = null, year = null) {
    let events = [...this.eventCalendar];

    if (month !== null && year !== null) {
      events = events.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    }

    return events;
  }

  /**
   * Notify communities
   */
  notifyCommunities(exchange) {
    // In production: send email, push notifications
    console.log(`📧 Notifying communities about exchange: ${exchange.title}`);
    
    const community1 = this.getCommunity(exchange.community1Id);
    const community2 = this.getCommunity(exchange.community2Id);

    if (community1) {
      console.log(`📧 Notifying ${community1.name}`);
    }
    if (community2) {
      console.log(`📧 Notifying ${community2.name}`);
    }
  }

  /**
   * Get cultural exchange statistics
   */
  getStats() {
    const totalEvents = this.events.length;
    const upcomingEvents = this.events.filter(e => e.status === 'upcoming').length;
    const totalWorkshops = this.workshops.length;
    const totalExchanges = this.exchangePrograms.length;
    const totalCollaborations = this.collaborations.length;
    const totalAmbassadors = this.culturalAmbassadors.length;
    const totalCommunities = this.communities.length;

    // Community engagement
    const communityEngagement = this.communities.map(c => ({
      name: c.name,
      events: this.events.filter(e => e.hostCommunity === c.id).length,
      workshops: this.workshops.filter(w => w.communityId === c.id).length,
      ambassadors: this.culturalAmbassadors.filter(a => a.communityId === c.id).length
    }));

    // Popular events
    const popularEvents = [...this.events]
      .sort((a, b) => b.registered - a.registered)
      .slice(0, 5);

    // Popular workshops
    const popularWorkshops = [...this.workshops]
      .sort((a, b) => b.currentParticipants - a.currentParticipants)
      .slice(0, 5);

    return {
      totalCommunities,
      totalEvents,
      upcomingEvents,
      totalWorkshops,
      totalExchanges,
      totalCollaborations,
      totalAmbassadors,
      communityEngagement,
      popularEvents,
      popularWorkshops,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get exchange analytics
   */
  getExchangeAnalytics() {
    const exchanges = this.exchangePrograms;
    const completed = exchanges.filter(e => e.status === 'completed').length;
    const inProgress = exchanges.filter(e => e.status === 'in_progress').length;
    const scheduled = exchanges.filter(e => e.status === 'scheduled').length;

    const totalParticipants = exchanges.reduce((sum, e) => sum + (e.participants?.length || 0), 0);

    return {
      totalExchanges: exchanges.length,
      completed,
      inProgress,
      scheduled,
      totalParticipants,
      averageParticipants: exchanges.length > 0 ? totalParticipants / exchanges.length : 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get community insights
   */
  getCommunityInsights(communityId = null) {
    if (communityId) {
      const community = this.getCommunity(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      const events = this.events.filter(e => e.hostCommunity === communityId);
      const workshops = this.workshops.filter(w => w.communityId === communityId);
      const ambassadors = this.culturalAmbassadors.filter(a => a.communityId === communityId);
      const collaborations = this.collaborations.filter(c =>
        c.community1Id === communityId || c.community2Id === communityId
      );

      return {
        community,
        eventCount: events.length,
        workshopCount: workshops.length,
        ambassadorCount: ambassadors.length,
        collaborationCount: collaborations.length,
        totalMembers: community.members || 0,
        engagementScore: this.calculateEngagementScore(communityId),
        timestamp: new Date().toISOString()
      };
    }

    // Overall insights
    const activeCommunities = this.communities.filter(c => c.active).length;
    const avgMembers = this.communities.reduce((sum, c) => sum + (c.members || 0), 0) / this.communities.length;

    return {
      activeCommunities,
      avgMembers: Math.round(avgMembers),
      totalCommunities: this.communities.length,
      mostActive: this.getMostActiveCommunities(5),
      highestRated: this.getHighestRatedCommunities(5),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate engagement score for community
   */
  calculateEngagementScore(communityId) {
    const events = this.events.filter(e => e.hostCommunity === communityId);
    const workshops = this.workshops.filter(w => w.communityId === communityId);
    const exchanges = this.exchangePrograms.filter(e =>
      e.community1Id === communityId || e.community2Id === communityId
    );

    const eventScore = Math.min(events.length * 5, 30);
    const workshopScore = Math.min(workshops.length * 10, 30);
    const exchangeScore = Math.min(exchanges.length * 15, 40);

    return Math.min(eventScore + workshopScore + exchangeScore, 100);
  }

  /**
   * Get most active communities
   */
  getMostActiveCommunities(limit = 5) {
    const sorted = [...this.communities]
      .sort((a, b) => (b.eventsHosted || 0) - (a.eventsHosted || 0))
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        name: c.name,
        eventsHosted: c.eventsHosted || 0,
        members: c.members || 0
      }));

    return sorted;
  }

  /**
   * Get highest rated communities
   */
  getHighestRatedCommunities(limit = 5) {
    const sorted = [...this.communities]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        name: c.name,
        rating: c.rating || 0,
        region: c.region
      }));

    return sorted;
  }
}

module.exports = CulturalExchangeService;
