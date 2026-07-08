// server.js - Main Express Server with WebSocket & Recommendation Engine Integration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const http = require('http');

const app = express();

// Import routes
const itemRoutes = require('./routes/item.routes');
const pathRoutes = require('./routes/path.routes');
const progressRoutes = require('./routes/progress.routes');
const postRoutes = require('./routes/post.routes');
const chatRoutes = require('./routes/chat.routes');
const checkinRoutes = require('./routes/checkin.routes');
const artisanRoutes = require('./routes/artisan.routes');
const storyRoutes = require('./routes/story.routes');
const auditRoutes = require('./routes/audit.routes');
const csrfRoutes = require('./routes/csrf.routes');
const cacheRoutes = require('./routes/cache.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');
const galleryRoutes = require('./routes/gallery.routes');
const integrityRoutes = require('./routes/integrity.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { csrfProtection } = require('./middleware/csrf');

const store = require('./data/store');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const HeuristicRateLimiter = require('./middleware/rateLimiter');

const initializeSampleData = require('./config/sampleData');

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;

// ==================== MIDDLEWARE ====================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
          'https://cdnjs.cloudflare.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://unpkg.com',
          'https://api.maptiler.com',
          'https://cdn.sanity.io',
          'https://encrypted-tbn0.gstatic.com',
          'https://cdn.shopify.com',
          'https://images.unsplash.com',
          'https://tile.openstreetmap.org',
        ],
        connectSrc: [
          "'self'",
          'https://api.maptiler.com',
          `ws://localhost:${WS_PORT}`,
          `wss://*.onrender.com`,
        ],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Serve static files (placed before rate limiter to prevent script throttling)
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/scripts/collaborative',
  express.static(path.join(__dirname, 'public/scripts/collaborative'))
);

// Global Heuristic Rate Limiter
// Base protection for all endpoints: 300 tokens per minute
const globalLimiter = new HeuristicRateLimiter({
  windowMs: 60000,
  maxTokens: 300,
  baseDelayMs: 2000, // Up to 2s delay for tarpitting
  message: 'Too many requests, please slow down.',
});
app.use(globalLimiter.middleware());

// Initialize Data
initializeSampleData();

// Start Background Integrity Scanner
const integrityService = require('./services/integrityService');
integrityService.scanAll();
setInterval(
  () => {
    integrityService.scanAll();
    console.log('🔍 Scheduled integrity scan completed');
  },
  60 * 60 * 1000
); // Every hour

// ==================== FRONTEND ROUTES ====================

// Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Collaborative Map Route
app.get('/collaborative-map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'collaborative-map.html'));
});

// Map Route
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// Gallery Route
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Paths Route
app.get('/paths', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paths.html'));
});

// P2P Share Route
app.get('/p2p-share', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'p2p-share.html'));
});

// Theme Builder Route
app.get('/theme-builder', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'theme-builder.html'));
});

// Quest Route
app.get('/quest', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quest.html'));
});

// Trails Route
app.get('/trails', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'trails.html'));
});

// Chat Route
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Archives Route
app.get('/archives', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'archives.html'));
});

// Data Exchange Route
app.get('/data-exchange', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'data-exchange.html'));
});

// Serve Trivia Game Page
app.get('/trivia', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'trivia.html'));
});

// Audio Processing Route
app.get('/audio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'audio.html'));
});

// Moderation Dashboard Route
app.get('/moderation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'moderation.html'));
});

// Chunked Video Upload Route
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// ==================== RECOMMENDATION ENGINE ROUTES ====================

// Import recommendation routes
// const recommendationRoutes = require('./routes/recommendation.routes');
// app.use('/api/recommendations', recommendationRoutes);

// Recommendations Page Route
app.get('/recommendations', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recommendations.html'));
});

// ==================== API ROUTES ====================

const translationsData = require('./data/translationsData');

app.get('/api/language', (req, res) => {
  res.json({
    default: 'en',
    supported: ['en', 'hi', 'mr'],
  });
});

app.get('/api/translations', (req, res) => {
  res.json(translationsData);
});

// CSRF Token Route
app.use('/api/csrf-token', csrfRoutes);

// Apply CSRF protection globally for state-changing routes
app.use(csrfProtection);

// Global API Rate Limiter (100 reqs / 1 min)
const apiLimiter = new HeuristicRateLimiter({
  windowMs: 60000,
  max: 100,
  message:
    'Too many API requests from this IP, please try again after a minute.',
});
app.use('/api', apiLimiter.middleware());

const tenantMiddleware = require('./middleware/tenant.middleware');
app.use('/api', tenantMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/gallery', galleryRoutes);

const tenantRoutes = require('./routes/tenant.routes');
app.use('/api/tenant', tenantRoutes);

// Heritage Score API
const heritageScoreRoutes = require('./routes/heritageScore.routes');
app.use('/api/heritage-score', heritageScoreRoutes);

const themeRoutes = require('./routes/theme.routes');
app.use('/api/themes', themeRoutes);

app.use('/api/story-generator', storyRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrity', integrityRoutes);

const exportRoutes = require('./routes/export.routes');
app.use('/api/export', exportRoutes);

const archiveRoutes = require('./routes/archive.routes');
app.use('/api/archives', archiveRoutes);

const dataExchangeRoutes = require('./routes/dataExchange.routes');
app.use('/api/data-exchange', dataExchangeRoutes);

const audioRoutes = require('./routes/audio.routes');
app.use('/api/audio', audioRoutes);

const moderationRoutes = require('./routes/moderation.routes');
app.use('/api/moderation', moderationRoutes);

const uploadRoutes = require('./routes/upload.routes');
// Bypass CSRF and body-parser for raw chunk uploads
app.use('/api/upload/chunk', express.raw({ type: '*/*', limit: '10mb' }));
app.use('/api/upload', uploadRoutes);

// Start upload session cleanup (every 5 minutes)
const { cleanupSessions } = require('./controllers/upload.controller');
setInterval(cleanupSessions, 5 * 60 * 1000);

// ==================== ADDITIONAL API ENDPOINTS ====================

app.get('/api/reputation', (req, res, next) => {
  try {
    const contributors = store.contributors || [];
    const calculated = contributors.map((c) => {
      const score =
        (c.stories || 0) * 20 +
        (c.photos || 0) * 10 +
        (c.culturalItems || 0) * 30 +
        (c.checkins || 0) * 5 +
        (c.quests || 0) * 15;

      let badge = 'Heritage Explorer';
      if (score >= 400) {
        badge = 'Heritage Guardian';
      } else if (score >= 250) {
        badge = 'Cultural Archivist';
      } else if (score >= 100) {
        badge = 'Story Collector';
      }

      return {
        id: c.id,
        name: c.name,
        stories: c.stories || 0,
        photos: c.photos || 0,
        culturalItems: c.culturalItems || 0,
        checkins: c.checkins || 0,
        quests: c.quests || 0,
        score,
        badge,
        memberSince: c.memberSince,
      };
    });

    calculated.sort((a, b) => b.score - a.score);
    res.json(calculated);
  } catch (error) {
    next(error);
  }
});

app.get('/api/timeline', (req, res, next) => {
  try {
    let events = store.timelineEvents || [];

    if (req.query.item) {
      const itemFilter = req.query.item.toLowerCase();
      events = events.filter((e) => e.item.toLowerCase() === itemFilter);
    }

    if (req.query.type) {
      const typeFilter = req.query.type.toLowerCase();
      events = events.filter((e) => e.type.toLowerCase() === typeFilter);
    }

    res.json(events);
  } catch (error) {
    next(error);
  }
});

app.get('/api/risk-dashboard', (req, res, next) => {
  try {
    const items = store.culturalItems || [];
    const responseData = items.map((item) => ({
      name: item.title,
      location: item.location,
      artisans: item.artisans !== undefined ? item.artisans : 5,
      records: item.records !== undefined ? item.records : 3,
      lastUpdated:
        item.lastUpdated ||
        (item.timestamp
          ? item.timestamp.split('T')[0]
          : new Date().toISOString().split('T')[0]),
      engagement: item.engagement !== undefined ? item.engagement : 50,
    }));
    res.json(responseData);
  } catch (error) {
    next(error);
  }
});

app.get('/api/map-style', async (req, res) => {
  if (!process.env.MAPTILER_KEY) {
    return res.json({
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    });
  }

  try {
    const response = await fetch(
      `https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_KEY}`
    );

    if (!response.ok) {
      return res.status(502).json({
        configured: false,
        message:
          'Unable to load map tiles. Please verify your MAPTILER_KEY is valid.',
      });
    }

    const style = await response.json();
    res.json(style);
  } catch (error) {
    res.status(502).json({
      configured: false,
      message: 'Unable to load map tiles. Please try again later.',
    });
  }
});

// ==================== WEBSOCKET SERVER INTEGRATION ====================

// Import WebSocket server
const CollaborativeMapServer = require('./server/websocket');

// Start WebSocket server
let wsServer;
try {
  wsServer = new CollaborativeMapServer(WS_PORT);
  console.log(`🔌 WebSocket server running on port ${WS_PORT}`);
} catch (error) {
  console.error('❌ Failed to start WebSocket server:', error.message);
  // Continue without WebSocket - app will still work
}

// Health check endpoint that includes WebSocket status
app.get('/api/health', (req, res) => {
  const wsStatus = wsServer
    ? {
        status: 'running',
        port: WS_PORT,
        clients: wsServer.clients ? wsServer.clients.size : 0,
        markers: wsServer.markers ? wsServer.markers.size : 0,
      }
    : {
        status: 'stopped',
        port: WS_PORT,
      };

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    websocket: wsStatus,
    memory: process.memoryUsage(),
  });
});

// WebSocket stats endpoint
app.get('/api/ws/stats', (req, res) => {
  if (!wsServer) {
    return res.status(503).json({
      error: 'WebSocket server not running',
      status: 'unavailable',
    });
  }

  res.json({
    status: 'running',
    clients: wsServer.clients ? wsServer.clients.size : 0,
    markers: wsServer.markers ? wsServer.markers.size : 0,
    rooms: wsServer.rooms ? wsServer.rooms.size : 0,
    history: wsServer.operationHistory ? wsServer.operationHistory.length : 0,
  });
});

// ==================== RECOMMENDATION ENGINE HEALTH CHECK ====================

// Recommendation engine status endpoint
app.get('/api/recommendations/health', async (req, res) => {
  try {
    const RecommendationEngine = require('./server/services/recommendationEngine');
    const engine = new RecommendationEngine();
    const stats = engine.getModelStats();

    res.json({
      status: 'healthy',
      engine: 'recommendation',
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
// Blockchain routes (temporarily disabled - service dependencies need fixing)
// const blockchainRoutes = require('./routes/blockchain.routes');
// app.use('/api/blockchain', blockchainRoutes);

// Blockchain page

app.get('/blockchain', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blockchain.html'));
});
// Add analytics dashboard routes
const analyticsDashboardRoutes = require('./routes/analyticsDashboard.routes');
app.use('/api/analytics', analyticsDashboardRoutes);

// Analytics Dashboard page
app.get('/analytics-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics-dashboard.html'));
});
// Add virtual tour routes
const virtualTourRoutes = require('./routes/virtualTour.routes');
app.use('/api/tours', virtualTourRoutes);

// Virtual Tour page
app.get('/virtual-tour', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'virtual-tour.html'));
});

// Add mobile app routes
const mobileAppRoutes = require('./routes/mobileApp.routes');
app.use('/api/mobile', mobileAppRoutes);

// Add storytelling routes
const storytellingRoutes = require('./routes/storytelling.routes');
app.use('/api/story', storytellingRoutes);

// Storytelling page
app.get('/storytelling', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'storytelling.html'));
});
// Add language learning routes
const languageLearningRoutes = require('./routes/languageLearning.routes');
app.use('/api/language', languageLearningRoutes);
// Add itinerary planner routes
const itineraryRoutes = require('./routes/itineraryPlanner.routes');
app.use('/api/itinerary', itineraryRoutes);

// Itinerary Planner page
app.get('/itinerary-planner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary-planner.html'));
});

// app.get('/blockchain', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'blockchain.html'));
// });
// Analytics Dashboard routes (disabled - service missing)
// const analyticsDashboardRoutes = require('./routes/analyticsDashboard.routes');
// app.use('/api/analytics', analyticsDashboardRoutes);
// app.get('/analytics-dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'analytics-dashboard.html'));
// });
// Virtual Tour routes (disabled - service missing)
// const virtualTourRoutes = require('./routes/virtualTour.routes');
// app.use('/api/tours', virtualTourRoutes);
// app.get('/virtual-tour', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'virtual-tour.html'));
// });
// Storytelling routes (disabled - service missing)
// const storytellingRoutes = require('./routes/storytelling.routes');
// app.use('/api/story', storytellingRoutes);
// app.get('/storytelling', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'storytelling.html'));
// });
// Language Learning routes (disabled - service missing)
// const languageLearningRoutes = require('./routes/languageLearning.routes');
// app.use('/api/language', languageLearningRoutes);

// Itinerary Planner routes (disabled - service missing)
// const itineraryRoutes = require('./routes/itineraryPlanner.routes');
// app.use('/api/itinerary', itineraryRoutes);
// app.get('/itinerary-planner', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'itinerary-planner.html'));
// });

// Language Learning page
app.get('/language-learning', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'language-learning.html'));
});
// AR Experience routes (disabled - service missing)
// const arRoutes = require('./routes/arExperience.routes');
// app.use('/api/ar', arRoutes);

// AR Experience page
app.get('/ar-experience', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ar-experience.html'));
});
// Add search engine routes
const searchEngineRoutes = require('./routes/searchEngine');
app.use('/api/search', searchEngineRoutes);

// Search page
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'search.html'));
});
// Add gamification routes

// Gamification page
app.get('/gamification', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gamification.html'));
});

// Add event routes
const eventRoutes = require('./routes/event.routes');
app.use('/api/events', eventRoutes);

// Events page
app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});
// ==================== ERROR HANDLING ====================

// 404 Middleware
app.use(notFound);

// Error Middleware
app.use(errorHandler);

// ==================== START SERVER ====================

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`✨ Parampara server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🗺️  Collaborative Map: http://localhost:${PORT}/collaborative-map`
  );
  console.log(`🎮 Trivia Game: http://localhost:${PORT}/trivia`);
  console.log(`📚 Recommendations: http://localhost:${PORT}/recommendations`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket: ws://localhost:${WS_PORT}`);
  console.log(
    `🤖 Recommendation Engine: http://localhost:${PORT}/api/recommendations/stats`
  );
});

// ==================== GRACEFUL SHUTDOWN ====================

const shutdown = () => {
  console.log('🛑 Shutting down gracefully...');

  // Close WebSocket server
  if (wsServer && wsServer.wss) {
    wsServer.wss.close(() => {
      console.log('🔌 WebSocket server closed');
    });
  }

  // Close HTTP server
  server.close(() => {
    console.log('✨ Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Force closing after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, server, wsServer };
