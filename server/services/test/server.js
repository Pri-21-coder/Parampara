// services/tests/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
// Add job routes
const jobRoutes = require('./routes/job.routes');
app.use('/api/jobs', jobRoutes);

// Jobs page
app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'jobs.html'));
});
const app = express();
const PORT = process.env.PORT || 3003;
// Add audit routes
const auditRoutes = require('./routes/audit.routes');
app.use('/api/audit', auditRoutes);

// Add audit middleware
const { logRequest, logError } = require('./middleware/auditMiddleware');

// Apply audit middleware
app.use(logRequest);

// Audit page
app.get('/audit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'audit.html'));
});

// Error handler with audit
app.use(logError);
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tests')
    .then(() => console.log('✅ Tests Service connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test Schema
const TestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        question: { type: String, required: true },
        options: [String],
        correctAnswer: { type: Number, required: true },
        marks: { type: Number, default: 1 }
    }],
    duration: { type: Number, required: true }, // in minutes
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    category: { type: String },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Test = mongoose.model('Test', TestSchema);

// Test Result Schema
const TestResultSchema = new mongoose.Schema({
    testId: { type: String, required: true },
    userId: { type: String, required: true },
    answers: [Number],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const TestResult = mongoose.model('TestResult', TestResultSchema);

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'tests', timestamp: new Date().toISOString() });
});

// Create Test
app.post('/api/tests', async (req, res) => {
    try {
        const testData = req.body;
        // Calculate total marks
        testData.totalMarks = testData.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        
        const test = new Test(testData);
        await test.save();

        res.status(201).json({
            success: true,
            data: test
        });
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create test'
        });
    }
});

// Get All Tests
app.get('/api/tests', async (req, res) => {
    try {
        const { category, limit = 20, offset = 0 } = req.query;

        const filter = {};
        if (category) filter.category = category;

        const tests = await Test.find(filter)
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .select('-questions');

        const total = await Test.countDocuments(filter);

        res.json({
            success: true,
            data: tests,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total
            }
        });
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tests'
        });
    }
});

// Get Test by ID
app.get('/api/tests/:id', async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        res.json({
            success: true,
            data: test
        });
    } catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get test'
        });
    }
});

// Submit Test
app.post('/api/tests/:id/submit', async (req, res) => {
    try {
        const { userId, answers, timeTaken } = req.body;
        const test = await Test.findById(req.params.id);

        if (!test) {
            return res.status(404).json({
                success: false,
                error: 'Test not found'
            });
        }

        // Calculate score
        let score = 0;
        for (let i = 0; i < test.questions.length; i++) {
            if (answers[i] === test.questions[i].correctAnswer) {
                score += test.questions[i].marks || 1;
            }
        }

        const percentage = (score / test.totalMarks) * 100;
        const passed = percentage >= test.passingMarks;

        const result = new TestResult({
            testId: test._id,
            userId,
            answers,
            score,
            totalMarks: test.totalMarks,
            percentage,
            passed,
            timeTaken
        });

        await result.save();

        res.json({
            success: true,
            data: {
                score,
                totalMarks: test.totalMarks,
                percentage,
                passed,
                timeTaken,
                resultId: result._id
            }
        });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit test'
        });
    }
});

// Get Test Results
app.get('/api/tests/results/:userId', async (req, res) => {
    try {
        const results = await TestResult.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get results'
        });
    }
});

app.listen(PORT, () => {
    console.log(`📝 Tests Service running on port ${PORT}`);
});