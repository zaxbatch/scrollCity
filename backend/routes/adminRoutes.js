const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const router = express.Router();

// ─── Data upload endpoints ──────────────────────────────────

// Upload listings
router.post('/data/listings', adminAuth, adminController.uploadListings);

// Upload market stats
router.post('/data/stats', adminAuth, adminController.uploadStats);

// Upload news items
router.post('/data/news', adminAuth, adminController.uploadNews);

// Upload events
router.post('/data/events', adminAuth, adminController.uploadEvents);

// ─── Bot trigger ────────────────────────────────────────────

// Force a bot to post immediately
router.post('/bots/trigger', adminAuth, adminController.triggerBotPost);

// ─── Data status ────────────────────────────────────────────

// Get counts of all data types
router.get('/data/status', adminAuth, adminController.getDataStatus);

// ─── Trending Topics CRUD ──────────────────────────────────

// Get all trending topics (active by default; ?all=true for all)
router.get('/trending', adminAuth, adminController.getTrendingTopics);

// Get a single trending topic
router.get('/trending/:id', adminAuth, adminController.getTrendingTopic);

// Create a new trending topic
router.post('/trending', adminAuth, adminController.createTrendingTopic);

// Update a trending topic
router.put('/trending/:id', adminAuth, adminController.updateTrendingTopic);

// Delete a trending topic
router.delete('/trending/:id', adminAuth, adminController.deleteTrendingTopic);

module.exports = router;