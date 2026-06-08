const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const authMiddleware = require('../middlewares/auth');

// Subscribe to newsletter (public)
router.post('/subscribe', newsletterController.subscribe);

// Get all subscribers (protected - admin only)
router.get('/subscribers', authMiddleware, newsletterController.getAllSubscribers);

module.exports = router;
