/**
 * Check-In Routes
 * Authenticated endpoints for location check-in management
 */

const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateCheckIn } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiter for check-in creation (prevent spam)
const checkInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 check-ins per 15 minutes
  message: 'Too many check-ins created. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/user/check-in
 * @desc    Create new check-in with automatic province extraction
 * @access  Private
 * @body    { locationName?, latitude, longitude, visitDate?, province? }
 */
router.post('/check-in', verifyToken, checkInLimiter, validateCheckIn, checkInController.createCheckIn);

/**
 * @route   GET /api/user/check-ins?page=1&limit=10
 * @desc    Get paginated check-in history for authenticated user
 * @access  Private
 * @query   page (default: 1), limit (default: 10, max: 100)
 */
router.get('/check-ins', verifyToken, checkInController.getCheckIns);

/**
 * @route   GET /api/user/map-history
 * @desc    Get list of unique provinces visited (for map visualization)
 * @access  Private
 * @returns { provinces: string[], count: number }
 */
router.get('/map-history', verifyToken, checkInController.getMapHistory);

/**
 * @route   GET /api/user/check-in-stats
 * @desc    Get check-in statistics (total check-ins, provinces visited)
 * @access  Private
 */
router.get('/check-in-stats', verifyToken, checkInController.getStats);

/**
 * @route   DELETE /api/user/check-in/:id
 * @desc    Delete specific check-in (only own check-ins)
 * @access  Private
 */
router.delete('/check-in/:id', verifyToken, checkInController.deleteCheckIn);

module.exports = router;
