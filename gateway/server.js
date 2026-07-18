// gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});
app.use('/api', limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        services: {
            auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
            materials: process.env.MATERIALS_SERVICE_URL || 'http://material-service:3002',
            tests: process.env.TESTS_SERVICE_URL || 'http://test-service:3003',
            notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://notification-service:3004',
            analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3005'
        }
    });
});

// Service proxies
const services = {
    auth: {
        target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
        routes: ['/api/auth']
    },
    materials: {
        target: process.env.MATERIALS_SERVICE_URL || 'http://material-service:3002',
        routes: ['/api/materials']
    },
    tests: {
        target: process.env.TESTS_SERVICE_URL || 'http://test-service:3003',
        routes: ['/api/tests']
    },
    notifications: {
        target: process.env.NOTIFICATIONS_SERVICE_URL || 'http://notification-service:3004',
        routes: ['/api/notifications']
    },
    analytics: {
        target: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3005',
        routes: ['/api/analytics']
    }
};

// Setup proxies
for (const [name, service] of Object.entries(services)) {
    for (const route of service.routes) {
        app.use(route, createProxyMiddleware({
            target: service.target,
            changeOrigin: true,
            pathRewrite: {
                [`^${route}`]: ''
            },
            onProxyReq: (proxyReq, req, res) => {
                // Forward correlation ID
                if (req.headers['x-correlation-id']) {
                    proxyReq.setHeader('x-correlation-id', req.headers['x-correlation-id']);
                }
                console.log(`🔄 Proxying ${req.method} ${req.url} to ${name} service`);
            },
            onError: (err, req, res) => {
                console.error(`Proxy error for ${name}:`, err);
                res.status(500).json({
                    success: false,
                    error: `Service ${name} unavailable`
                });
            }
        }));
    }
}

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'API Gateway',
        version: '1.0.0',
        services: Object.keys(services),
        endpoints: Object.entries(services).reduce((acc, [name, service]) => {
            acc[name] = service.routes;
            return acc;
        }, {})
    });
});

app.listen(PORT, () => {
    console.log(`🚪 API Gateway running on port ${PORT}`);
});