/**
 * Admin Routes
 * Routes for admin-only user management operations
 * All routes require admin role
 */

const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { validate, updateRoleSchema, listUsersSchema } = require('../middleware/validators/adminValidator');

const router = express.Router();

// All routes require authentication + admin role
router.use(verifyToken, verifyAdmin);

// User management
router.get('/users', validate(listUsersSchema), adminController.listUsers);
router.patch('/users/:id/role', validate(updateRoleSchema), adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
