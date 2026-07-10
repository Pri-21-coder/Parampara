// routes/virtualTour.routes.js
const express = require('express');
const router = express.Router();
const VirtualTourService = require('../server/services/virtualTourService');

let tourService = null;

const getService = () => {
  if (!tourService) {
    tourService = new VirtualTourService();
  }
  return tourService;
};

/**
 * GET /api/tours
 * Get all tours
 */
router.get('/', (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      guideId: req.query.guideId,
      status: req.query.status,
      search: req.query.search,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null
    };

    const service = getService();
    const tours = service.getTours(filters);

    res.json({
      success: true,
      tours,
      count: tours.length,
      filters,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tours/:tourId
 * Get tour by ID
 */
router.get('/:tourId', (req, res, next) => {
  try {
    const { tourId } = req.params;
    const service = getService();
    const tour = service.getTour(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        error: 'Tour not found'
      });
    }

    res.json({
      success: true,
      tour,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tours/start
 * Start virtual tour
 */
router.post('/start', async (req, res, next) => {
  try {
    const { tourId, userId } = req.body;

    if (!tourId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tourId, userId'
      });
    }

    const service = getService();
    const result = await service.startTour(tourId, userId);

    res.json({
      success: true,
      ...result,
      message: 'Tour started successfully',
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
 * POST /api/tours/join
 * Join tour session
 */
router.post('/join', (req, res, next) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userId'
      });
    }

    const service = getService();
    const session = service.joinTour(sessionId, userId);

    res.json({
      success: true,
      session,
      message: 'Joined tour successfully',
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
 * POST /api/tours/leave
 * Leave tour session
 */
router.post('/leave', (req, res, next) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userId'
      });
    }

    const service = getService();
    const session = service.leaveTour(sessionId, userId);

    res.json({
      success: true,
      session,
      message: 'Left tour successfully',
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
 * POST /api/tours/end
 * End tour session
 */
router.post('/end', (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId'
      });
    }

    const service = getService();
    const session = service.endTour(sessionId);

    res.json({
      success: true,
      session,
      message: 'Tour ended successfully',
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
 * GET /api/tours/stream/:streamId
 * Get stream info
 */
router.get('/stream/:streamId', async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const service = getService();
    const stream = await service.streamTour(streamId);

    res.json({
      success: true,
      stream,
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
 * POST /api/tours/chat
 * Send chat message
 */
router.post('/chat', (req, res, next) => {
  try {
    const { sessionId, userId, message } = req.body;

    if (!sessionId || !userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userId, message'
      });
    }

    const service = getService();
    const chatMessage = service.sendChatMessage(sessionId, userId, message);

    res.json({
      success: true,
      message: chatMessage,
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
 * GET /api/tours/chat/:sessionId
 * Get chat messages
 */
router.get('/chat/:sessionId', (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const service = getService();
    const messages = service.getChatMessages(sessionId);

    res.json({
      success: true,
      messages,
      count: messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tours/book
 * Book a tour
 */
router.post('/book', (req, res, next) => {
  try {
    const { tourId, userId, bookingData } = req.body;

    if (!tourId || !userId || !bookingData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tourId, userId, bookingData'
      });
    }

    const service = getService();
    const booking = service.bookTour(tourId, userId, bookingData);

    res.json({
      success: true,
      booking,
      message: 'Tour booked successfully',
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
 * GET /api/tours/bookings/:userId
 * Get user bookings
 */
router.get('/bookings/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const service = getService();
    const bookings = service.getUserBookings(userId);

    res.json({
      success: true,
      bookings,
      count: bookings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tours/bookings/:bookingId
 * Cancel booking
 */
router.delete('/bookings/:bookingId', (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId'
      });
    }

    const service = getService();
    const booking = service.cancelBooking(bookingId, userId);

    res.json({
      success: true,
      booking,
      message: 'Booking cancelled',
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
 * POST /api/tours/record
 * Start recording
 */
router.post('/record', (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId'
      });
    }

    const service = getService();
    const recording = service.recordTour(sessionId);

    res.json({
      success: true,
      recording,
      message: 'Recording started',
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
 * POST /api/tours/recording/stop
 * Stop recording
 */
router.post('/recording/stop', (req, res, next) => {
  try {
    const { recordingId } = req.body;

    if (!recordingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: recordingId'
      });
    }

    const service = getService();
    const recording = service.stopRecording(recordingId);

    res.json({
      success: true,
      recording,
      message: 'Recording stopped',
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
 * GET /api/tours/recordings
 * Get recordings
 */
router.get('/recordings', (req, res, next) => {
  try {
    const { tourId } = req.query;
    const service = getService();
    const recordings = service.getRecordings(tourId);

    res.json({
      success: true,
      recordings,
      count: recordings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tours/guides
 * Get tour guides
 */
router.get('/guides', (req, res, next) => {
  try {
    const { available } = req.query;
    const service = getService();
    const guides = service.getGuides(
      available !== undefined ? available === 'true' : null
    );

    res.json({
      success: true,
      guides,
      count: guides.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tours/analytics
 * Get tour analytics
 */
router.get('/analytics', (req, res, next) => {
  try {
    const { tourId } = req.query;
    const service = getService();
    const analytics = service.getTourAnalytics(tourId);

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
 * POST /api/tours/rate
 * Rate tour
 */
router.post('/rate', (req, res, next) => {
  try {
    const { tourId, rating } = req.body;

    if (!tourId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tourId, rating'
      });
    }

    const service = getService();
    const tour = service.rateTour(tourId, rating);

    res.json({
      success: true,
      tour,
      message: 'Tour rated successfully',
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
 * GET /api/tours/stats
 * Get tour statistics
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