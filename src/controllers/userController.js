/**
 * User Controller
 * Handles user profile operations (get, update)
 */

const { User } = require('../models');
const { successResponse } = require('../utils/responseFormatter');
const { NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');
const path = require('path');

/**
 * GET /api/user/profile
 * Get authenticated user's profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    logger.info('Profile fetch:', { userId });

    // User is already attached to req.user by verifyToken middleware
    // But we'll fetch fresh data from DB to ensure accuracy
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return successResponse(
      res,
      user.toSafeObject(),
      'Profile retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Profile fetch failed:', { error: error.message, userId: req.user?.id });
    next(error);
  }
};

/**
 * PUT /api/user/profile
 * Update authenticated user's profile (name, bio, avatar)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio } = req.body;

    logger.info('Profile update:', { userId, fields: Object.keys(req.body) });

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update fields
    if (name !== undefined) {
      user.name = name;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    // Handle avatar upload
    if (req.file) {
      // Generate URL path for avatar (relative to uploads directory)
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      user.avatarUrl = avatarUrl;
      logger.info('Avatar uploaded:', { userId, avatarUrl });
    }

    // Save changes
    await user.save();

    logger.info('Profile updated successfully:', { userId });

    return successResponse(
      res,
      user.toSafeObject(),
      'Profile updated successfully',
      200
    );
  } catch (error) {
    logger.error('Profile update failed:', { error: error.message, userId: req.user?.id });
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
