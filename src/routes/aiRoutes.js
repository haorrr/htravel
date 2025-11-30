/**
 * AI Routes
 * /api/ai/*
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadLandmark } = require('../middleware/uploadLandmark');
const { uploadSelfie } = require('../middleware/uploadSelfie');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI endpoints (more restrictive due to external API costs)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP (AI operations are expensive)
  message: 'Too many AI requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/ai/identify-landmark
 * Identify landmark from uploaded image
 * Requires: Authentication (optional for demo, but tracked)
 * Body: multipart/form-data with 'image' file
 */
router.post(
  '/identify-landmark',
  aiLimiter,
  uploadLandmark,
  aiController.identifyLandmark
);

/**
 * POST /api/ai/virtual-travel
 * Generate virtual travel photo by combining selfie with destination
 * Requires: Authentication
 * Body: multipart/form-data with 'selfie' file and 'destination' field
 */
router.post(
  '/virtual-travel',
  verifyToken,
  aiLimiter,
  uploadSelfie,
  aiController.generateVirtualTravel
);

/**
 * GET /api/ai/virtual-travel/history
 * Get user's virtual travel photo history
 * Requires: Authentication
 * Query: page (default: 1), limit (default: 10)
 */
router.get(
  '/virtual-travel/history',
  verifyToken,
  aiController.getVirtualTravelHistory
);

/**
 * GET /api/ai/status
 * Get AI service status (circuit breaker state, etc.)
 * Requires: Authentication
 */
router.get('/status', verifyToken, aiController.getStatus);

module.exports = router;
