// routes/itineraryPlanner.routes.js
const express = require('express');
const router = express.Router();
const ItineraryPlannerService = require('../services/itineraryPlannerService');

let plannerService = null;

const getService = () => {
  if (!plannerService) {
    plannerService = new ItineraryPlannerService();
  }
  return plannerService;
};

/**
 * POST /api/itinerary/generate
 * Generate itinerary
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { preferences, userId } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: preferences'
      });
    }

    const service = getService();
    const result = await service.generateItinerary(preferences, userId);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/itinerary/calculate-route
 * Calculate total distance and travel time for a sequence of coordinates
 */
router.post('/calculate-route', (req, res, next) => {
  try {
    const { route } = req.body;
    if (!route || !Array.isArray(route)) {
      return res.status(400).json({ success: false, error: 'Invalid route array' });
    }

    const { calculateHaversineDistance } = require('../utils/haversine');
    let totalDistance = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const p1 = route[i];
      const p2 = route[i + 1];
      if (p1 && p2 && p1.lat && p1.lng && p2.lat && p2.lng) {
        totalDistance += calculateHaversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
      }
    }

    // Assuming average speed of 40 km/h for estimated travel time within a rural/heritage setting
    const travelHours = totalDistance / 40; 
    
    res.json({
      success: true,
      totalDistanceKm: totalDistance,
      estimatedTimeHours: travelHours,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/itinerary/optimize
 * Optimizes a sequence of sites using A* Search.
 */
router.post('/optimize', (req, res, next) => {
  try {
    const { sites } = req.body;
    if (!sites || !Array.isArray(sites)) {
      return res.status(400).json({ success: false, error: 'Invalid sites array' });
    }

    // Filter valid sites
    const validSites = sites.filter(s => s && s.location && typeof s.location.lat === 'number' && typeof s.location.lng === 'number');
    
    // Flatten locations for optimization
    const locationsToOptimize = validSites.map(s => ({
      ...s,
      lat: s.location.lat,
      lng: s.location.lng
    }));

    const { optimizeMultiDestinationRoute } = require('../utils/pathfinding');
    const optimizedLocations = optimizeMultiDestinationRoute(locationsToOptimize);
    
    // Calculate total distance and time of the optimized route
    const { calculateHaversineDistance } = require('../utils/haversine');
    let totalDistance = 0;
    for (let i = 0; i < optimizedLocations.length - 1; i++) {
      totalDistance += calculateHaversineDistance(
        optimizedLocations[i].lat, optimizedLocations[i].lng,
        optimizedLocations[i + 1].lat, optimizedLocations[i + 1].lng
      );
    }
    const travelHours = totalDistance / 40; 

    res.json({
      success: true,
      optimizedRoute: optimizedLocations,
      totalDistanceKm: totalDistance,
      estimatedTimeHours: travelHours,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary/:itineraryId
 * Get itinerary by ID
 */
router.get('/:itineraryId', (req, res, next) => {
  try {
    const { itineraryId } = req.params;
    const service = getService();
    const itinerary = service.getItinerary(itineraryId);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      itinerary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary/user/:userId
 * Get user itineraries
 */
router.get('/user/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const itineraries = service.getUserItineraries(userId);

    res.json({
      success: true,
      itineraries,
      count: itineraries.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary
 * Get all itineraries
 */
router.get('/', (req, res, next) => {
  try {
    const service = getService();
    const itineraries = service.getItineraries();

    res.json({
      success: true,
      itineraries,
      count: itineraries.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary/sites
 * Get all cultural sites
 */
router.get('/sites', (req, res, next) => {
  try {
    const service = getService();
    const sites = service.culturalSites;

    res.json({
      success: true,
      sites,
      count: sites.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/itinerary/plan
 * Create collaborative plan
 */
router.post('/plan', (req, res, next) => {
  try {
    const data = req.body;
    const service = getService();
    const plan = service.createCollaborativePlan(data);

    res.json({
      success: true,
      plan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/itinerary/plan/:planId/join
 * Join collaborative plan
 */
router.post('/plan/:planId/join', (req, res, next) => {
  try {
    const { planId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const service = getService();
    const plan = service.joinCollaborativePlan(planId, userId);

    res.json({
      success: true,
      plan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/itinerary/plan/:planId/vote
 * Vote on plan
 */
router.post('/plan/:planId/vote', (req, res, next) => {
  try {
    const { planId } = req.params;
    const { userId, voteData } = req.body;

    if (!userId || !voteData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, voteData'
      });
    }

    const service = getService();
    const plan = service.voteOnPlan(planId, userId, voteData);

    res.json({
      success: true,
      plan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/itinerary/plans
 * Get collaborative plans
 */
router.get('/plans', (req, res, next) => {
  try {
    const { userId } = req.query;
    const service = getService();
    const plans = service.getCollaborativePlans(userId);

    res.json({
      success: true,
      plans,
      count: plans.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary/weather
 * Get weather suggestions
 */
router.get('/weather', (req, res, next) => {
  try {
    const { condition } = req.query;
    const service = getService();
    const suggestions = service.getWeatherSuggestions({ condition });

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary/updates
 * Get real-time updates
 */
router.get('/updates', (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const service = getService();
    const updates = service.getRealtimeUpdates({ lat, lng });

    res.json({
      success: true,
      updates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/itinerary/stats
 * Get itinerary statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;