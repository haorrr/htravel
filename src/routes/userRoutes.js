/**
 * User Routes
 * /api/user/*
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validation');
const { uploadAvatar, processAvatar } = require('../middleware/uploadMiddleware');

/**
 * GET /api/user/profile
 * Get authenticated user's profile
 * Requires: Authentication (Bearer token)
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * PUT /api/user/profile
 * Update authenticated user's profile
 * Requires: Authentication (Bearer token)
 * Body: { name?, bio? }
 * File: avatar (multipart/form-data)
 */
router.put(
  '/profile',
  verifyToken,
  uploadAvatar,
  processAvatar,
  validateProfileUpdate,
  userController.updateProfile
);

module.exports = router;
