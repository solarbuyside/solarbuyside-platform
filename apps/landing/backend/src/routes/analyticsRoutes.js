const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Public route - track event (no auth required)
router.post('/event', analyticsController.trackEvent);

module.exports = router;
