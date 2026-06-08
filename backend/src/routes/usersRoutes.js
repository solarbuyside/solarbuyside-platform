const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/auth');

// All user routes require authentication
router.use(authMiddleware);

// Get all users
router.get('/', usersController.getAllUsers);

// Create new user
router.post('/', usersController.createUser);

// Update user
router.put('/:userId', usersController.updateUser);

// Delete user
router.delete('/:userId', usersController.deleteUser);

module.exports = router;
