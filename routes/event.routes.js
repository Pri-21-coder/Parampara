// routes/event.routes.js
const express = require('express');
const router = express.Router();
const EventService = require('../server/services/eventService');

let eventService = null;

const getService = () => {
  if (!eventService) {
    eventService = new EventService();
  }
  return eventService;
};

/**
 * GET /api/events
 * Get events with filters
 */
router.get('/', (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      lat: req.query.lat ? parseFloat(req.query.lat) : null,
      lng: req.query.lng ? parseFloat(req.query.lng) : null,
      radius: req.query.radius ? parseFloat(req.query.radius) : null
    };

    const service = getService();
    const events = service.getEvents(filters);

    res.json({
      success: true,
      events,
      count: events.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:eventId
 * Get event by ID
 */
router.get('/:eventId', (req, res, next) => {
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
 * POST /api/events
 * Submit new event
 */
router.post('/', (req, res, next) => {
  try {
    const { eventData, userId } = req.body;

    if (!eventData || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eventData, userId'
      });
    }

    const service = getService();
    const event = service.submitEvent(eventData, userId);

    res.json({
      success: true,
      event,
      message: 'Event submitted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:eventId/rsvp
 * RSVP to event
 */
router.post('/:eventId/rsvp', (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId, userData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const service = getService();
    const event = service.rsvpToEvent(eventId, userId, userData);

    res.json({
      success: true,
      event,
      message: 'RSVP successful',
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
 * DELETE /api/events/:eventId/rsvp
 * Cancel RSVP
 */
router.delete('/:eventId/rsvp', (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const service = getService();
    const event = service.cancelRsvp(eventId, userId);

    res.json({
      success: true,
      event,
      message: 'RSVP cancelled',
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
 * POST /api/events/subscribe
 * Subscribe to event notifications
 */
router.post('/subscribe', (req, res, next) => {
  try {
    const { userId, preferences } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const service = getService();
    const subscription = service.subscribeToEvents(userId, preferences);

    res.json({
      success: true,
      subscription,
      message: 'Subscribed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/events/unsubscribe
 * Unsubscribe from event notifications
 */
router.delete('/unsubscribe', (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const service = getService();
    service.unsubscribeFromEvents(userId);

    res.json({
      success: true,
      message: 'Unsubscribed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/user/:userId/events
 * Get user's events
 */
router.get('/user/:userId/events', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const events = service.getUserEvents(userId);

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
 * GET /api/events/user/:userId/notifications
 * Get user notifications
 */
router.get('/user/:userId/notifications', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const notifications = service.getUserNotifications(userId);

    res.json({
      success: true,
      notifications,
      count: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/stats
 * Get event statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const service = getService();
    const stats = service.getEventStats();

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
 * GET /api/events/calendar
 * Get event calendar
 */
router.get('/calendar', (req, res, next) => {
  try {
    const { month, year } = req.query;
    const service = getService();
    const calendar = service.getEventCalendar(
      parseInt(month) || new Date().getMonth(),
      parseInt(year) || new Date().getFullYear()
    );

    res.json({
      success: true,
      calendar,
      month,
      year,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/nearby
 * Get nearby events
 */
router.get('/nearby', (req, res, next) => {
  try {
    const { lat, lng, radius, limit } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lat, lng'
      });
    }

    const service = getService();
    const events = service.getNearbyEvents(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius) || 50,
      parseInt(limit) || 10
    );

    res.json({
      success: true,
      events,
      count: events.length,
      location: { lat, lng },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:eventId/stream
 * Create virtual stream
 */
router.post('/:eventId/stream', (req, res, next) => {
  try {
    const { eventId } = req.params;
    const service = getService();
    const stream = service.createVirtualStream(eventId);

    res.json({
      success: true,
      stream,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;