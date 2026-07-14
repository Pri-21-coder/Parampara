// services/itineraryPlannerService.js
const store = require('../../data/store');
const { v4: uuidv4 } = require('uuid');

class ItineraryPlannerService {
  constructor() {
    this.itineraries = [];
    this.culturalSites = [];
    this.userPreferences = new Map();
    this.collaborativePlans = new Map();
    this.routeCache = new Map();
    
    this.init();
  }

  init() {
    this.loadCulturalSites();
    this.loadSampleItineraries();
    console.log('✅ Itinerary Planner Service initialized');
  }

  loadCulturalSites() {
    this.culturalSites = [
      {
        id: 'site_1',
        name: 'Kolkata Heritage Walk',
        description: 'Explore the colonial heritage of Kolkata',
        location: { lat: 22.5726, lng: 88.3639 },
        category: 'heritage',
        type: 'walking_tour',
        duration: 3,
        difficulty: 'easy',
        rating: 4.8,
        popularity: 85,
        openingHours: '9:00 AM - 6:00 PM',
        entranceFee: 200,
        tags: ['colonial', 'architecture', 'history'],
        cultural_significance: 90,
        accessibility: 'wheelchair_accessible'
      },
      {
        id: 'site_2',
        name: 'Murshidabad Heritage Tour',
        description: 'Visit the historical city of Murshidabad',
        location: { lat: 24.1849, lng: 88.2719 },
        category: 'heritage',
        type: 'day_trip',
        duration: 8,
        difficulty: 'medium',
        rating: 4.7,
        popularity: 70,
        openingHours: '8:00 AM - 5:00 PM',
        entranceFee: 150,
        tags: ['historical', 'palaces', 'river'],
        cultural_significance: 85,
        accessibility: 'limited'
      },
      {
        id: 'site_3',
        name: 'Santiniketan Cultural Experience',
        description: 'Experience the cultural hub of Santiniketan',
        location: { lat: 23.6850, lng: 87.6800 },
        category: 'culture',
        type: 'cultural_tour',
        duration: 5,
        difficulty: 'easy',
        rating: 4.9,
        popularity: 90,
        openingHours: '10:00 AM - 5:00 PM',
        entranceFee: 100,
        tags: ['art', 'literature', 'tagore'],
        cultural_significance: 95,
        accessibility: 'wheelchair_accessible'
      },
      {
        id: 'site_4',
        name: 'Sundarbans Eco Tour',
        description: 'Explore the mangrove forest and wildlife',
        location: { lat: 21.9497, lng: 88.9364 },
        category: 'nature',
        type: 'boat_tour',
        duration: 10,
        difficulty: 'medium',
        rating: 4.6,
        popularity: 75,
        openingHours: '6:00 AM - 6:00 PM',
        entranceFee: 300,
        tags: ['wildlife', 'mangrove', 'eco'],
        cultural_significance: 70,
        accessibility: 'limited'
      },
      {
        id: 'site_5',
        name: 'Darjeeling Heritage Railway',
        description: 'Ride the famous toy train in Darjeeling',
        location: { lat: 27.0360, lng: 88.2627 },
        category: 'heritage',
        type: 'train_journey',
        duration: 6,
        difficulty: 'easy',
        rating: 4.8,
        popularity: 88,
        openingHours: '8:00 AM - 4:00 PM',
        entranceFee: 250,
        tags: ['railway', 'unesco', 'mountain'],
        cultural_significance: 80,
        accessibility: 'limited'
      },
      {
        id: 'site_6',
        name: 'Terracotta Temple Tour',
        description: 'Explore ancient terracotta temples',
        location: { lat: 23.0796, lng: 87.8625 },
        category: 'heritage',
        type: 'walking_tour',
        duration: 4,
        difficulty: 'easy',
        rating: 4.5,
        popularity: 65,
        openingHours: '9:00 AM - 5:00 PM',
        entranceFee: 50,
        tags: ['temple', 'terracotta', 'architecture'],
        cultural_significance: 88,
        accessibility: 'wheelchair_accessible'
      },
      {
        id: 'site_7',
        name: 'Baul Music Workshop',
        description: 'Learn about Baul music and traditions',
        location: { lat: 23.6850, lng: 87.6800 },
        category: 'culture',
        type: 'workshop',
        duration: 4,
        difficulty: 'easy',
        rating: 4.9,
        popularity: 92,
        openingHours: '10:00 AM - 2:00 PM',
        entranceFee: 350,
        tags: ['music', 'baul', 'workshop'],
        cultural_significance: 95,
        accessibility: 'wheelchair_accessible'
      },
      {
        id: 'site_8',
        name: 'Craft Village Tour',
        description: 'Visit artisan villages and craft workshops',
        location: { lat: 22.5726, lng: 88.3639 },
        category: 'culture',
        type: 'walking_tour',
        duration: 6,
        difficulty: 'easy',
        rating: 4.7,
        popularity: 80,
        openingHours: '9:00 AM - 5:00 PM',
        entranceFee: 150,
        tags: ['crafts', 'artisans', 'handicrafts'],
        cultural_significance: 90,
        accessibility: 'limited'
      }
    ];
  }

  loadSampleItineraries() {
    this.itineraries = [
      {
        id: 'itinerary_1',
        name: 'Kolkata Cultural Explorer',
        description: 'A 3-day cultural exploration of Kolkata',
        duration: 3,
        days: [
          {
            day: 1,
            title: 'Colonial Heritage',
            sites: ['site_1', 'site_6'],
            meals: ['lunch', 'dinner'],
            accommodation: 'Heritage Hotel',
            notes: 'Start early to avoid crowds'
          },
          {
            day: 2,
            title: 'Cultural Experience',
            sites: ['site_3', 'site_7'],
            meals: ['breakfast', 'lunch'],
            accommodation: 'Local Homestay',
            notes: 'Experience local cuisine'
          },
          {
            day: 3,
            title: 'Craft Discovery',
            sites: ['site_8'],
            meals: ['breakfast', 'lunch', 'dinner'],
            accommodation: 'Heritage Hotel',
            notes: 'Visit artisan workshops'
          }
        ],
        totalCost: 15000,
        difficulty: 'medium'
      }
    ];
  }

  /**
   * Generate personalized itinerary
   */
  async generateItinerary(preferences, userId = null) {
    console.log('🎯 Generating itinerary for:', preferences);

    // 1. Score cultural sites based on preferences
    const scoredSites = this.scoreSites(preferences);
    
    // 2. Select optimal sites
    const selectedSites = this.selectOptimalSites(scoredSites, preferences);
    
    // 3. Optimize route
    const optimizedRoute = await this.optimizeRoute(selectedSites, preferences);
    
    // 4. Generate daily schedule
    const schedule = this.generateSchedule(optimizedRoute, preferences);
    
    // 5. Create itinerary
    const itinerary = {
      id: `itinerary_${Date.now()}_${uuidv4().slice(0, 8)}`,
      name: preferences.name || 'Cultural Heritage Tour',
      description: preferences.description || 'Personalized cultural exploration',
      duration: preferences.days || 3,
      preferences: preferences,
      schedule: schedule,
      sites: optimizedRoute,
      totalCost: this.calculateTotalCost(optimizedRoute),
      totalDuration: this.calculateTotalDuration(optimizedRoute),
      difficulty: this.calculateDifficulty(optimizedRoute),
      culturalScore: this.calculateCulturalScore(optimizedRoute),
      createdBy: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Store itinerary
    this.itineraries.push(itinerary);
    
    // Save user preferences
    if (userId) {
      this.saveUserPreferences(userId, preferences);
    }

    return {
      itinerary,
      recommendations: this.getRecommendations(optimizedRoute),
      alternatives: this.getAlternatives(optimizedRoute, preferences)
    };
  }

  /**
   * Score cultural sites based on preferences
   */
  scoreSites(preferences) {
    return this.culturalSites.map(site => {
      let score = 0;
      
      // Category matching
      if (preferences.categories && preferences.categories.includes(site.category)) {
        score += 30;
      }

      // Cultural significance
      score += (site.cultural_significance / 100) * 20;

      // Popularity
      if (preferences.popularity !== 'off_beat') {
        score += (site.popularity / 100) * 10;
      }

      // Difficulty matching
      if (preferences.difficulty) {
        const difficultyMap = { easy: 1, medium: 2, hard: 3 };
        const prefDiff = difficultyMap[preferences.difficulty] || 2;
        const siteDiff = difficultyMap[site.difficulty] || 2;
        if (Math.abs(prefDiff - siteDiff) <= 1) {
          score += 15;
        }
      }

      // Budget matching
      if (preferences.budget) {
        const budgetRanges = {
          budget: 0, moderate: 150, luxury: 300
        };
        const prefBudget = budgetRanges[preferences.budget] || 150;
        if (site.entranceFee <= prefBudget * 1.5) {
          score += 10;
        }
      }

      // Time availability
      if (preferences.availableTime) {
        if (site.duration <= preferences.availableTime) {
          score += 10;
        }
      }

      // Tag matching
      if (preferences.interests) {
        const matches = site.tags.filter(tag => 
          preferences.interests.some(interest => 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        );
        score += matches.length * 5;
      }

      // Accessibility
      if (preferences.accessibility && site.accessibility === 'wheelchair_accessible') {
        score += 15;
      }

      return { ...site, score };
    });
  }

  /**
   * Select optimal sites
   */
  selectOptimalSites(scoredSites, preferences) {
    const maxSites = preferences.maxSites || 8;
    const days = preferences.days || 3;
    const sitesPerDay = Math.ceil(maxSites / days);

    // Sort by score
    scoredSites.sort((a, b) => b.score - a.score);

    // Ensure diversity
    const selected = [];
    const categories = new Set();

    for (const site of scoredSites) {
      if (selected.length >= maxSites) break;
      
      // Ensure category diversity
      if (categories.size < 3 || categories.has(site.category)) {
        selected.push(site);
        categories.add(site.category);
      }
    }

    return selected;
  }

  /**
   * Optimize route using TSP algorithm
   */
  async optimizeRoute(sites, preferences) {
    if (sites.length <= 1) return sites;

    // Simple nearest-neighbor algorithm
    const optimized = [];
    const remaining = [...sites];
    
    // Start with the most culturally significant site
    let current = remaining.reduce((a, b) => 
      a.cultural_significance > b.cultural_significance ? a : b
    );
    optimized.push(current);
    remaining.splice(remaining.indexOf(current), 1);

    while (remaining.length > 0) {
      // Find nearest site
      let nearest = null;
      let minDistance = Infinity;

      for (const site of remaining) {
        const distance = this.calculateDistance(
          current.location.lat, current.location.lng,
          site.location.lat, site.location.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = site;
        }
      }

      if (nearest) {
        optimized.push(nearest);
        remaining.splice(remaining.indexOf(nearest), 1);
        current = nearest;
      }
    }

    // Cache optimized route
    const routeKey = optimized.map(s => s.id).join('_');
    this.routeCache.set(routeKey, {
      sites: optimized,
      totalDistance: this.calculateTotalDistance(optimized),
      timestamp: new Date().toISOString()
    });

    return optimized;
  }

  /**
   * Calculate distance between two locations (km)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Calculate total distance
   */
  calculateTotalDistance(sites) {
    let total = 0;
    for (let i = 0; i < sites.length - 1; i++) {
      total += this.calculateDistance(
        sites[i].location.lat, sites[i].location.lng,
        sites[i+1].location.lat, sites[i+1].location.lng
      );
    }
    return total;
  }

  /**
   * Generate daily schedule
   */
  generateSchedule(sites, preferences) {
    const days = preferences.days || 3;
    const sitesPerDay = Math.ceil(sites.length / days);
    const schedule = [];

    for (let day = 1; day <= days; day++) {
      const daySites = sites.slice((day - 1) * sitesPerDay, day * sitesPerDay);
      
      const daySchedule = {
        day,
        title: `Day ${day}`,
        date: this.formatDate(new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000)),
        sites: daySites.map((site, index) => ({
          site: site,
          startTime: this.getTimeSlot(index, daySites.length),
          duration: site.duration,
          notes: this.getSiteNotes(site)
        })),
        meals: this.getMeals(day, days),
        accommodation: this.getAccommodation(day, days, preferences),
        totalTime: this.calculateDayTotal(daySites),
        culturalHighlights: this.getCulturalHighlights(daySites)
      };

      schedule.push(daySchedule);
    }

    return schedule;
  }

  /**
   * Get time slot for site
   */
  getTimeSlot(index, total) {
    const startTimes = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
    return startTimes[index] || '10:00 AM';
  }

  /**
   * Get site-specific notes
   */
  getSiteNotes(site) {
    const notes = [
      `Visit ${site.name} - ${site.description}`,
      `Duration: ${site.duration} hours`,
      `Best time to visit: ${site.openingHours}`
    ];
    return notes.join('. ');
  }

  /**
   * Get meals for day
   */
  getMeals(day, totalDays) {
    const meals = ['breakfast'];
    if (day < totalDays || day === 1) meals.push('lunch');
    if (day === totalDays) meals.push('dinner');
    return meals;
  }

  /**
   * Get accommodation
   */
  getAccommodation(day, totalDays, preferences) {
    const budget = preferences.budget || 'moderate';
    const options = {
      budget: ['Hostel', 'Budget Hotel', 'Homestay'],
      moderate: ['3-Star Hotel', 'Boutique Hotel', 'Heritage Home'],
      luxury: ['5-Star Hotel', 'Heritage Palace', 'Luxury Resort']
    };
    const opts = options[budget] || options.moderate;
    return opts[day % opts.length];
  }

  /**
   * Format date
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  /**
   * Calculate day total time
   */
  calculateDayTotal(sites) {
    let total = 0;
    sites.forEach(site => {
      total += site.duration || 2;
    });
    total += sites.length * 0.5; // Travel time between sites
    return Math.ceil(total);
  }

  /**
   * Get cultural highlights
   */
  getCulturalHighlights(sites) {
    return sites.map(site => `${site.name} (${site.category})`).join(', ');
  }

  /**
   * Calculate total cost
   */
  calculateTotalCost(sites) {
    let total = 0;
    sites.forEach(site => {
      total += site.entranceFee || 0;
    });
    // Add accommodation and food costs
    total += sites.length * 1000; // Rough estimate
    return Math.round(total);
  }

  /**
   * Calculate total duration
   */
  calculateTotalDuration(sites) {
    let total = 0;
    sites.forEach(site => {
      total += site.duration || 2;
    });
    return Math.ceil(total);
  }

  /**
   * Calculate difficulty
   */
  calculateDifficulty(sites) {
    const difficulties = sites.map(s => s.difficulty);
    if (difficulties.includes('hard')) return 'hard';
    if (difficulties.includes('medium')) return 'medium';
    return 'easy';
  }

  /**
   * Calculate cultural score
   */
  calculateCulturalScore(sites) {
    const scores = sites.map(s => s.cultural_significance || 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  /**
   * Get recommendations
   */
  getRecommendations(sites) {
    // Find similar sites
    const similar = [];
    const categories = new Set(sites.map(s => s.category));
    
    this.culturalSites.forEach(site => {
      if (categories.has(site.category) && !sites.includes(site)) {
        similar.push(site);
      }
    });

    return similar.slice(0, 5);
  }

  /**
   * Get alternatives
   */
  getAlternatives(sites, preferences) {
    // Find alternative sites in same categories
    const alternatives = [];
    const categories = sites.map(s => s.category);
    
    categories.forEach(category => {
      const alternativesForCategory = this.culturalSites.filter(
        s => s.category === category && !sites.includes(s)
      );
      alternatives.push(...alternativesForCategory.slice(0, 2));
    });

    return alternatives;
  }

  /**
   * Save user preferences
   */
  saveUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      ...preferences,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId) {
    return this.userPreferences.get(userId);
  }

  /**
   * Get itinerary by ID
   */
  getItinerary(itineraryId) {
    return this.itineraries.find(i => i.id === itineraryId);
  }

  /**
   * Get user itineraries
   */
  getUserItineraries(userId) {
    return this.itineraries.filter(i => i.createdBy === userId);
  }

  /**
   * Get all itineraries
   */
  getItineraries() {
    return this.itineraries;
  }

  /**
   * Create collaborative plan
   */
  createCollaborativePlan(data) {
    const plan = {
      id: `plan_${Date.now()}_${uuidv4().slice(0, 8)}`,
      name: data.name || 'Group Cultural Tour',
      description: data.description || 'Collaborative cultural exploration',
      members: data.members || [],
      itineraryId: data.itineraryId || null,
      preferences: data.preferences || {},
      createdBy: data.createdBy || 'anonymous',
      createdAt: new Date().toISOString(),
      status: 'active',
      votes: {},
      comments: []
    };

    this.collaborativePlans.set(plan.id, plan);
    return plan;
  }

  /**
   * Join collaborative plan
   */
  joinCollaborativePlan(planId, userId) {
    const plan = this.collaborativePlans.get(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (!plan.members.includes(userId)) {
      plan.members.push(userId);
    }

    return plan;
  }

  /**
   * Vote on plan
   */
  voteOnPlan(planId, userId, voteData) {
    const plan = this.collaborativePlans.get(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    plan.votes[userId] = voteData;
    return plan;
  }

  /**
   * Get collaborative plans
   */
  getCollaborativePlans(userId = null) {
    if (userId) {
      const plans = [];
      this.collaborativePlans.forEach(plan => {
        if (plan.members.includes(userId) || plan.createdBy === userId) {
          plans.push(plan);
        }
      });
      return plans;
    }
    return Array.from(this.collaborativePlans.values());
  }

  /**
   * Get weather-based suggestions
   */
  getWeatherSuggestions(weather) {
    const suggestions = [];
    
    if (weather.condition === 'rainy') {
      suggestions.push({
        type: 'indoor',
        message: 'Consider indoor cultural sites like museums and galleries',
        sites: this.culturalSites.filter(s => s.type === 'walking_tour')
      });
    } else if (weather.condition === 'sunny') {
      suggestions.push({
        type: 'outdoor',
        message: 'Perfect weather for outdoor heritage walks',
        sites: this.culturalSites.filter(s => s.type === 'walking_tour' || s.type === 'boat_tour')
      });
    }

    return suggestions;
  }

  /**
   * Get real-time updates
   */
  getRealtimeUpdates(location) {
    // In production: integrate with live data
    return {
      crowdLevel: Math.floor(Math.random() * 100),
      events: [
        { name: 'Cultural Festival', location: 'Nearby', time: 'Today 5 PM' }
      ],
      weather: {
        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        temperature: 25 + Math.floor(Math.random() * 10)
      }
    };
  }

  /**
   * Get itinerary statistics
   */
  getStats() {
    return {
      totalItineraries: this.itineraries.length,
      totalSites: this.culturalSites.length,
      totalUsers: this.userPreferences.size,
      totalPlans: this.collaborativePlans.size,
      popularSites: this.getPopularSites(),
      popularCategories: this.getPopularCategories(),
      averageDuration: this.getAverageDuration(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get popular sites
   */
  getPopularSites() {
    const sorted = [...this.culturalSites].sort((a, b) => b.popularity - a.popularity);
    return sorted.slice(0, 5).map(s => ({ name: s.name, popularity: s.popularity }));
  }

  /**
   * Get popular categories
   */
  getPopularCategories() {
    const counts = {};
    this.culturalSites.forEach(site => {
      counts[site.category] = (counts[site.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Get average duration
   */
  getAverageDuration() {
    if (this.itineraries.length === 0) return 0;
    const total = this.itineraries.reduce((sum, i) => sum + i.duration, 0);
    return Math.round(total / this.itineraries.length);
  }
}

module.exports = ItineraryPlannerService;
