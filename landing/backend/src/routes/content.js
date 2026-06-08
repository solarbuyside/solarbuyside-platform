const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/auth');

// Get all sections (public)
router.get('/sections', contentController.getAllSections);

// Get single section (public)
router.get('/sections/:sectionId', contentController.getSection);

// Update section (protected - admin only)
router.put('/sections/:sectionId', authMiddleware, contentController.updateSection);

// Get global assets (public)
router.get('/assets', contentController.getGlobalAssets);

// Update global asset (protected - admin only)
router.put('/assets', authMiddleware, contentController.updateGlobalAsset);

// Get global settings (public)
router.get('/settings', contentController.getGlobalSettings);

// Update global setting (protected - admin only)
router.put('/settings', authMiddleware, contentController.updateGlobalSetting);

module.exports = router;
