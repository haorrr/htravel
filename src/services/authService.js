/**
 * Authentication Service
 * Handles JWT token generation, verification, and user authentication logic
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ValidationError, UnauthorizedError } = require('../utils/errorTypes');

class AuthService {
  /**
   * Generate access token (15min expiry)
   */
  generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Generate refresh token (7 days expiry)
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Register new user
   */
  async register(email, password, name) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user (password will be hashed by Sequelize beforeSave hook)
    const user = await User.create({ email, password, name });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findByPk(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user.id, user.role);

    return { accessToken };
  }
}

module.exports = new AuthService();
