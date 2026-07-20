const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const router = express.Router();

// ─── Data upload endpoints ──────────────────────────────────
router.post('/data/listings', adminAuth, adminController.uploadListings);
router.post('/data/stats', adminAuth, adminController.uploadStats);
router.post('/data/news', adminAuth, adminController.uploadNews);
router.post('/data/events', adminAuth, adminController.uploadEvents);
router.post('/data/media', adminAuth, adminController.uploadMedia); // <-- NEW

// ─── Bot trigger ────────────────────────────────────────────
router.post('/bots/trigger', adminAuth, adminController.triggerBotPost);

// ─── Data status ────────────────────────────────────────────
router.get('/data/status', adminAuth, adminController.getDataStatus);

// ─── Trending Topics CRUD ──────────────────────────────────
router.get('/trending', adminAuth, adminController.getTrendingTopics);
router.get('/trending/:id', adminAuth, adminController.getTrendingTopic);
router.post('/trending', adminAuth, adminController.createTrendingTopic);
router.put('/trending/:id', adminAuth, adminController.updateTrendingTopic);
router.delete('/trending/:id', adminAuth, adminController.deleteTrendingTopic);

// ─── Generic CRUD for listings, stats, news, events, media ──
router.get('/data/:type', adminAuth, adminController.getItems);
router.get('/data/:type/:id', adminAuth, adminController.getItem);
router.put('/data/:type/:id', adminAuth, adminController.updateItem);
router.delete('/data/:type/:id', adminAuth, adminController.deleteItem);
router.delete('/data/:type', adminAuth, adminController.clearItems);
router.get('/test', adminAuth, (req, res) => res.json({ message: 'Admin routes are working' }));

module.exports = router;