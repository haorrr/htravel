/**
 * Planner Routes
 * API endpoints for AI trip planning
 */

const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Generate itinerary
router.post('/generate', plannerController.generateItinerary);

// Save itinerary
router.post('/save', plannerController.saveItinerary);

// Get user's trips (paginated)
router.get('/my-trips', plannerController.getMyTrips);

// Get single trip by ID
router.get('/trips/:id', plannerController.getTripById);

// Delete trip
router.delete('/trips/:id', plannerController.deleteTrip);

// Service status
router.get('/status', plannerController.getStatus);

module.exports = router;
