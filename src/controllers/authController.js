/**
 * Authentication Controller
 * Handles register, login, and token refresh endpoints
 */

const authService = require('../services/authService');
const { successResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register new user account
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    logger.info('Registration attempt:', { email });

    const result = await authService.register(email, password, name);

    logger.info('Registration successful:', { userId: result.user.id, email });

    return successResponse(
      res,
      result,
      'Registration successful',
      201
    );
  } catch (error) {
    logger.error('Registration failed:', { error: error.message, email: req.body.email });
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info('Login attempt:', { email });

    const result = await authService.login(email, password);

    logger.info('Login successful:', { userId: result.user.id, email });

    return successResponse(
      res,
      result,
      'Login successful',
      200
    );
  } catch (error) {
    logger.error('Login failed:', { error: error.message, email: req.body.email });
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    logger.info('Token refresh attempt');

    const result = await authService.refreshAccessToken(refreshToken);

    logger.info('Token refresh successful');

    return successResponse(
      res,
      result,
      'Token refreshed successfully',
      200
    );
  } catch (error) {
    logger.error('Token refresh failed:', { error: error.message });
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
};
