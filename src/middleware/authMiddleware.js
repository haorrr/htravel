/**
 * Authentication Middleware
 * Protects routes requiring authentication and authorization
 */

const authService = require('../services/authService');
const { User } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('../utils/errorTypes');

/**
 * Verify JWT token from Authorization header
 * Attaches user to req.user for downstream middleware/controllers
 */
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyAccessToken(token);

    // Fetch user from database
    const user = await User.findByPk(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request object (exclude password)
    req.user = user.toSafeObject();
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user has admin role
 * Must be used after verifyToken middleware
 */
const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
