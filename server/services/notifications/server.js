// services/notifications/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// In-memory notification store
const notifications = [];
const emailQueue = [];
const smsQueue = [];

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'notifications', timestamp: new Date().toISOString() });
});

// Send Email
app.post('/api/notifications/email', (req, res) => {
    try {
        const { to, subject, body, template } = req.body;

        const email = {
            id: `email_${Date.now()}`,
            to,
            subject,
            body,
            template: template || 'default',
            status: 'queued',
            createdAt: new Date().toISOString()
        };

        emailQueue.push(email);

        // Simulate email sending
        setTimeout(() => {
            email.status = 'sent';
            console.log(`📧 Email sent to ${to}: ${subject}`);
        }, 1000);

        res.status(202).json({
            success: true,
            data: {
                message: 'Email queued for sending',
                emailId: email.id
            }
        });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email'
        });
    }
});

// Send SMS
app.post('/api/notifications/sms', (req, res) => {
    try {
        const { to, message } = req.body;

        const sms = {
            id: `sms_${Date.now()}`,
            to,
            message,
            status: 'queued',
            createdAt: new Date().toISOString()
        };

        smsQueue.push(sms);

        // Simulate SMS sending
        setTimeout(() => {
            sms.status = 'sent';
            console.log(`📱 SMS sent to ${to}: ${message.substring(0, 30)}...`);
        }, 1000);

        res.status(202).json({
            success: true,
            data: {
                message: 'SMS queued for sending',
                smsId: sms.id
            }
        });
    } catch (error) {
        console.error('SMS error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send SMS'
        });
    }
});

// Send Push Notification
app.post('/api/notifications/push', (req, res) => {
    try {
        const { userId, title, body, data } = req.body;

        const notification = {
            id: `push_${Date.now()}`,
            userId,
            title,
            body,
            data,
            status: 'sent',
            read: false,
            createdAt: new Date().toISOString()
        };

        notifications.push(notification);

        res.status(201).json({
            success: true,
            data: {
                message: 'Push notification sent',
                notificationId: notification.id
            }
        });
    } catch (error) {
        console.error('Push notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send push notification'
        });
    }
});

// Get User Notifications
app.get('/api/notifications/:userId', (req, res) => {
    try {
        const userNotifications = notifications
            .filter(n => n.userId === req.params.userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            data: userNotifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notifications'
        });
    }
});

// Mark as Read
app.put('/api/notifications/:id/read', (req, res) => {
    try {
        const notification = notifications.find(n => n.id === req.params.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        notification.read = true;

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
});

// Get Queue Status
app.get('/api/notifications/queue', (req, res) => {
    res.json({
        success: true,
        data: {
            emailQueue: emailQueue.length,
            smsQueue: smsQueue.length,
            notifications: notifications.length
        }
    });
});

app.listen(PORT, () => {
    console.log(`📧 Notifications Service running on port ${PORT}`);
});