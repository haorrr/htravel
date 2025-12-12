/**
 * Admin Routes
 * Routes for admin-only user management operations
 * All routes require admin role
 */

const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboardController');
const { validate, updateRoleSchema, listUsersSchema } = require('../middleware/validators/adminValidator');
const cacheMiddleware = require('../middleware/cacheMiddleware');

const router = express.Router();

// All routes require authentication + admin role
router.use(verifyToken, verifyAdmin);

// Dashboard statistics (cached for 5 minutes)
router.get('/dashboard/stats', cacheMiddleware(300), dashboardController.getStats);
router.get('/dashboard/trends', cacheMiddleware(300), dashboardController.getTrends);
router.get('/dashboard/activity', cacheMiddleware(300), dashboardController.getActivity);

// User management
router.get('/users', validate(listUsersSchema), adminController.listUsers);
router.patch('/users/:id/role', validate(updateRoleSchema), adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
