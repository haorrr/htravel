/**
 * Admin Controller
 * HTTP request handlers for admin-only user management operations
 */

const adminService = require('../services/adminService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * List all users with pagination, search, and filters
 * GET /api/admin/users
 */
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, sortBy, order } = req.query;

    const filters = {
      search: search?.trim() || '',
      role: role || null,
      sortBy: sortBy || 'createdAt',
      order: order?.toUpperCase() || 'DESC',
    };

    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    const result = await adminService.listUsers(filters, pagination);

    return successResponse(res, result, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (user ↔ admin)
 * PATCH /api/admin/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.userId; // From verifyToken middleware

    const result = await adminService.updateUserRole(id, role, adminId);

    return successResponse(res, result, `User role updated to ${role} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId; // From verifyToken middleware

    const deletedUser = await adminService.deleteUser(id, adminId);

    return successResponse(
      res,
      { deletedUser },
      `User ${deletedUser.email} deleted successfully`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  updateUserRole,
  deleteUser,
};
