/**
 * Places Routes (Google Maps Integration)
 * /api/places/*
 */

const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');
const { verifyToken } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for Places API (to control Google Maps API costs)
const placesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per IP
  message: 'Too many Places API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   GET /api/places/search
 * @desc    Text search for places (e.g., "restaurants in Hanoi")
 * @access  Public (but rate limited)
 * @query   query (required) - Search text
 * @query   lat (optional) - Latitude for location bias
 * @query   lng (optional) - Longitude for location bias
 * @query   radius (optional) - Search radius in meters (max 50000)
 * @query   type (optional) - Place type filter (restaurant, cafe, etc.)
 */
router.get('/search', placesLimiter, placesController.textSearch);

/**
 * @route   GET /api/places/nearby
 * @desc    Search for places near a specific location
 * @access  Public (but rate limited)
 * @query   lat (required) - Center latitude
 * @query   lng (required) - Center longitude
 * @query   radius (required) - Search radius in meters (max 50000)
 * @query   type (optional) - Place type filter
 * @query   keyword (optional) - Keyword search
 */
router.get('/nearby', placesLimiter, placesController.nearbySearch);

/**
 * @route   GET /api/places/details/:placeId
 * @desc    Get detailed information about a specific place
 * @access  Public (but rate limited)
 * @param   placeId - Google Place ID
 */
router.get('/details/:placeId', placesLimiter, placesController.getPlaceDetails);

/**
 * @route   GET /api/places/photos/:photoReference
 * @desc    Proxy to get photo from Google Maps
 * @access  Public
 */
router.get('/photos/:photoReference', placesController.getPlacePhoto);

/**
 * @route   GET /api/places/types
 * @desc    Get list of available place types for filtering
 * @access  Public
 */
router.get('/types', placesController.getPlaceTypes);

/**
 * @route   GET /api/places/status
 * @desc    Get Places service status
 * @access  Authenticated
 */
router.get('/status', verifyToken, placesController.getStatus);

module.exports = router;
