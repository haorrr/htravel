/**
 * Authentication Routes
 * /api/auth/*
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Stricter rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/register
 * Register new user
 * Body: { email, password, name }
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * POST /api/auth/login
 * Login with email and password
 * Body: { email, password }
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * POST /api/auth/refresh
 * Refresh access token
 * Body: { refreshToken }
 */
router.post('/refresh', authController.refresh);

module.exports = router;
