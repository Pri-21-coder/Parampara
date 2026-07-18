// services/analytics/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/analytics')
    .then(() => console.log('✅ Analytics Service connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Analytics Schema
const AnalyticsSchema = new mongoose.Schema({
    userId: { type: String },
    event: { type: String, required: true },
    category: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String }
});

const Analytics = mongoose.model('Analytics', AnalyticsSchema);

// ============================================
// ROUTES
// ============================================

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'analytics', timestamp: new Date().toISOString() });
});

app.post('/api/analytics/track', async (req, res) => {
    try {
        const analytics = new Analytics(req.body);
        await analytics.save();

        res.status(201).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Track analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track analytics'
        });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const { userId, event, fromDate, toDate, limit = 100 } = req.query;

        const filter = {};
        if (userId) filter.userId = userId;
        if (event) filter.event = event;
        if (fromDate) filter.timestamp = { $gte: new Date(fromDate) };
        if (toDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(toDate) };

        const analytics = await Analytics.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: analytics,
            count: analytics.length
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics'
        });
    }
});

app.get('/api/analytics/stats', async (req, res) => {
    try {
        const [stats] = await Analytics.aggregate([
            {
                $group: {
                    _id: null,
                    totalEvents: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' },
                    eventTypes: { $addToSet: '$event' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalEvents: stats?.totalEvents || 0,
                uniqueUsers: stats?.uniqueUsers?.length || 0,
                eventTypes: stats?.eventTypes || []
            }
        });
    } catch (error) {
        console.error('Get analytics stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics stats'
        });
    }
});

app.listen(PORT, () => {
    console.log(`📊 Analytics Service running on port ${PORT}`);
});