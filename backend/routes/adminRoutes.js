const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/data/listings', adminAuth, adminController.uploadListings);
router.post('/data/stats', adminAuth, adminController.uploadStats);
router.post('/data/news', adminAuth, adminController.uploadNews);
router.post('/data/events', adminAuth, adminController.uploadEvents);
router.post('/bots/trigger', adminAuth, adminController.triggerBotPost);
router.get('/data/status', adminAuth, adminController.getDataStatus);

module.exports = router;