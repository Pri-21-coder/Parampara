// routes/culturalExchange.routes.js
const express = require('express');
const router = express.Router();
const CulturalExchangeService = require('../server/services/culturalExchangeService');

let exchangeService = null;

const getService = () => {
  if (!exchangeService) {
    exchangeService = new CulturalExchangeService();
  }
  return exchangeService;
};

/**
 * GET /api/exchange/communities
 * Get all communities
 */
router.get('/communities', (req, res, next) => {
  try {
    const filters = {
      region: req.query.region,
      culture: req.query.culture,
      active: req.query.active === 'true' ? true : 
              req.query.active === 'false' ? false : undefined,
      search: req.query.search
    };

    const service = getService();
    const communities = service.getCommunities(filters);

    res.json({
      success: true,
      communities,
      count: communities.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/community/:communityId
 * Get community by ID
 */
router.get('/community/:communityId', (req, res, next) => {
  try {
    const { communityId } = req.params;
    const service = getService();
    const community = service.getCommunity(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    res.json({
      success: true,
      community,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exchange/community
 * Create community
 */
router.post('/community', (req, res, next) => {
  try {
    const communityData = req.body;
    const service = getService();
    const community = service.createCommunity(communityData);

    res.json({
      success: true,
      community,
      message: 'Community created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/match/:communityId
 * Match communities
 */
router.get('/match/:communityId', (req, res, next) => {
  try {
    const { communityId } = req.params;
    const service = getService();
    const matches = service.matchCommunities(communityId);

    res.json({
      success: true,
      matches,
      count: matches.length,
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
 * POST /api/exchange/schedule
 * Schedule exchange program
 */
router.post('/schedule', (req, res, next) => {
  try {
    const eventData = req.body;
    const service = getService();
    const exchange = service.scheduleExchange(eventData);

    res.json({
      success: true,
      exchange,
      message: 'Exchange scheduled successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/exchanges
 * Get exchange programs
 */
router.get('/exchanges', (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      communityId: req.query.communityId
    };

    const service = getService();
    const exchanges = service.getExchanges(filters);

    res.json({
      success: true,
      exchanges,
      count: exchanges.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exchange/join
 * Join exchange program
 */
router.post('/join', (req, res, next) => {
  try {
    const { exchangeId, userId } = req.body;

    if (!exchangeId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: exchangeId, userId'
      });
    }

    const service = getService();
    const exchange = service.joinExchange(exchangeId, userId);

    res.json({
      success: true,
      exchange,
      message: 'Joined exchange successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/exchange/collaboration
 * Create collaboration
 */
router.post('/collaboration', (req, res, next) => {
  try {
    const collaborationData = req.body;
    const service = getService();
    const collaboration = service.createCollaboration(collaborationData);

    res.json({
      success: true,
      collaboration,
      message: 'Collaboration created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/collaborations
 * Get collaborations
 */
router.get('/collaborations', (req, res, next) => {
  try {
    const { communityId } = req.query;
    const service = getService();
    const collaborations = service.getCollaborations(communityId);

    res.json({
      success: true,
      collaborations,
      count: collaborations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/exchange/collaboration/:collabId
 * Update collaboration
 */
router.put('/collaboration/:collabId', (req, res, next) => {
  try {
    const { collabId } = req.params;
    const updates = req.body;
    const service = getService();
    const collaboration = service.updateCollaboration(collabId, updates);

    res.json({
      success: true,
      collaboration,
      message: 'Collaboration updated successfully',
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
 * GET /api/exchange/workshops
 * Get workshops
 */
router.get('/workshops', (req, res, next) => {
  try {
    const filters = {
      communityId: req.query.communityId,
      level: req.query.level,
      status: req.query.status
    };

    const service = getService();
    const workshops = service.getWorkshops(filters);

    res.json({
      success: true,
      workshops,
      count: workshops.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/workshop/:workshopId
 * Get workshop by ID
 */
router.get('/workshop/:workshopId', (req, res, next) => {
  try {
    const { workshopId } = req.params;
    const service = getService();
    const workshop = service.getWorkshop(workshopId);

    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    res.json({
      success: true,
      workshop,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exchange/workshop/register
 * Register for workshop
 */
router.post('/workshop/register', (req, res, next) => {
  try {
    const { workshopId, userId } = req.body;

    if (!workshopId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: workshopId, userId'
      });
    }

    const service = getService();
    const workshop = service.registerForWorkshop(workshopId, userId);

    res.json({
      success: true,
      workshop,
      message: 'Registered for workshop successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exchange/events
 * Get events
 */
router.get('/events', (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      communityId: req.query.communityId,
      upcoming: req.query.upcoming === 'true'
    };

    const service = getService();
    const events = service.getEvents(filters);

    res.json({
      success: true,
      events,
      count: events.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/event/:eventId
 * Get event by ID
 */
router.get('/event/:eventId', (req, res, next) => {
  try {
    const { eventId } = req.params;
    const service = getService();
    const event = service.getEvent(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      event,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exchange/event
 * Create event
 */
router.post('/event', (req, res, next) => {
  try {
    const eventData = req.body;
    const service = getService();
    const event = service.createEvent(eventData);

    res.json({
      success: true,
      event,
      message: 'Event created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exchange/event/register
 * Register for event
 */
router.post('/event/register', (req, res, next) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventId, userId'
      });
    }

    const service = getService();
    const event = service.registerForEvent(eventId, userId);

    res.json({
      success: true,
      event,
      message: 'Registered for event successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/exchange/ambassadors
 * Get ambassadors
 */
router.get('/ambassadors', (req, res, next) => {
  try {
    const filters = {
      communityId: req.query.communityId,
      region: req.query.region,
      available: req.query.available === 'true' ? true :
                req.query.available === 'false' ? false : undefined
    };

    const service = getService();
    const ambassadors = service.getAmbassadors(filters);

    res.json({
      success: true,
      ambassadors,
      count: ambassadors.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/ambassador/:ambassadorId
 * Get ambassador by ID
 */
router.get('/ambassador/:ambassadorId', (req, res, next) => {
  try {
    const { ambassadorId } = req.params;
    const service = getService();
    const ambassador = service.getAmbassador(ambassadorId);

    if (!ambassador) {
      return res.status(404).json({
        success: false,
        error: 'Ambassador not found'
      });
    }

    res.json({
      success: true,
      ambassador,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/exchange/ambassador
 * Create ambassador
 */
router.post('/ambassador', (req, res, next) => {
  try {
    const ambassadorData = req.body;
    const service = getService();
    const ambassador = service.createAmbassador(ambassadorData);

    res.json({
      success: true,
      ambassador,
      message: 'Ambassador created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/calendar
 * Get event calendar
 */
router.get('/calendar', (req, res, next) => {
  try {
    const { month, year } = req.query;
    const service = getService();
    const calendar = service.getEventCalendar(
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    );

    res.json({
      success: true,
      calendar,
      count: calendar.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/stats
 * Get statistics
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

/**
 * GET /api/exchange/analytics
 * Get exchange analytics
 */
router.get('/analytics', (req, res, next) => {
  try {
    const service = getService();
    const analytics = service.getExchangeAnalytics();

    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/exchange/insights/:communityId
 * Get community insights
 */
router.get('/insights/:communityId', (req, res, next) => {
  try {
    const { communityId } = req.params;
    const service = getService();
    const insights = service.getCommunityInsights(communityId);

    res.json({
      success: true,
      insights,
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
 * GET /api/exchange/insights
 * Get overall community insights
 */
router.get('/insights', (req, res, next) => {
  try {
    const service = getService();
    const insights = service.getCommunityInsights();

    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
