// services/materials/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/materials')
    .then(() => console.log('✅ Materials Service connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Material Schema
const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String, required: true },
    type: { type: String, enum: ['study', 'test', 'resource'], default: 'study' },
    category: { type: String },
    tags: [String],
    author: { type: String },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
});

const Material = mongoose.model('Material', MaterialSchema);

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'materials', timestamp: new Date().toISOString() });
});

// Create Material
app.post('/api/materials', async (req, res) => {
    try {
        const material = new Material(req.body);
        await material.save();

        res.status(201).json({
            success: true,
            data: material
        });
    } catch (error) {
        console.error('Create material error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create material'
        });
    }
});

// Get All Materials
app.get('/api/materials', async (req, res) => {
    try {
        const { type, category, limit = 20, offset = 0 } = req.query;

        const filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;

        const materials = await Material.find(filter)
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Material.countDocuments(filter);

        res.json({
            success: true,
            data: materials,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total
            }
        });
    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get materials'
        });
    }
});

// Get Material by ID
app.get('/api/materials/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material not found'
            });
        }

        // Increment views
        material.views++;
        await material.save();

        res.json({
            success: true,
            data: material
        });
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get material'
        });
    }
});

// Update Material
app.put('/api/materials/:id', async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material not found'
            });
        }

        res.json({
            success: true,
            data: material
        });
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update material'
        });
    }
});

// Delete Material
app.delete('/api/materials/:id', async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id);
        if (!material) {
            return res.status(404).json({
                success: false,
                error: 'Material not found'
            });
        }

        res.json({
            success: true,
            data: { id: material._id }
        });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete material'
        });
    }
});

// Search Materials
app.get('/api/materials/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const materials = await Material.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        }).limit(50);

        res.json({
            success: true,
            data: materials,
            count: materials.length
        });
    } catch (error) {
        console.error('Search materials error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search materials'
        });
    }
});

app.listen(PORT, () => {
    console.log(`📚 Materials Service running on port ${PORT}`);
});