const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Login
router.post('/login', authController.login);

// Verify token (protected route)
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
