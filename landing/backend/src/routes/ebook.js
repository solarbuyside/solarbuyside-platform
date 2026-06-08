const express = require('express');
const router = express.Router();
const ebookController = require('../controllers/ebookController');
const authMiddleware = require('../middlewares/auth');

// Save ebook lead (public)
router.post('/lead', ebookController.saveLead);

// Get all leads (protected - admin only)
router.get('/leads', authMiddleware, ebookController.getAllLeads);

module.exports = router;
