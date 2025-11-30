/**
 * Admin Service
 * Business logic for admin-only user management operations
 */

const { Op } = require('sequelize');
const User = require('../models/User');
const { ForbiddenError, NotFoundError } = require('../utils/errorTypes');
const { USER_ROLES } = require('../config/constants');
const { logAdminAction } = require('../utils/auditLogger');

class AdminService {
  /**
   * List all users with pagination, search, and filters
   * @param {Object} filters - Search and filter options
   * @param {Object} pagination - Page and limit
   * @returns {Object} Users list with pagination metadata and stats
   */
  async listUsers(filters = {}, pagination = {}) {
    const {
      search = '',
      role = null,
      sortBy = 'createdAt',
      order = 'DESC',
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by role
    if (role && (role === USER_ROLES.USER || role === USER_ROLES.ADMIN)) {
      where.role = role;
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'name', 'role', 'avatarUrl', 'createdAt', 'updatedAt'],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate statistics
    const totalAdmins = await User.count({ where: { role: USER_ROLES.ADMIN } });
    const totalUsers = await User.count({ where: { role: USER_ROLES.USER } });

    return {
      users: users.map(user => user.toSafeObject()),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
      stats: {
        totalUsers,
        totalAdmins,
      },
    };
  }

  /**
   * Update user role (user ↔ admin)
   * @param {String} userId - Target user ID
   * @param {String} newRole - New role (user or admin)
   * @param {String} adminId - Admin performing the action
   * @returns {Object} Updated user
   */
  async updateUserRole(userId, newRole, adminId) {
    // Validation: Cannot change own role
    if (userId === adminId) {
      throw new ForbiddenError('Cannot change your own role');
    }

    // Validate role value
    if (newRole !== USER_ROLES.USER && newRole !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Invalid role. Must be "user" or "admin"');
    }

    // Find target user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // If demoting from admin to user, check if last admin
    if (user.role === USER_ROLES.ADMIN && newRole === USER_ROLES.USER) {
      const adminCount = await User.count({ where: { role: USER_ROLES.ADMIN } });
      if (adminCount <= 1) {
        throw new ForbiddenError('Cannot demote the last admin. At least one admin must exist.');
      }
    }

    // Store old role for audit logging
    const oldRole = user.role;

    // Update role
    user.role = newRole;
    await user.save();

    // Log audit entry
    logAdminAction('ROLE_UPDATE', adminId, userId, {
      oldRole,
      newRole,
      userName: user.name,
      userEmail: user.email,
    });

    return {
      user: user.toSafeObject(),
      oldRole,
      newRole,
    };
  }

  /**
   * Delete user account
   * @param {String} userId - User ID to delete
   * @param {String} adminId - Admin performing the action
   * @returns {Object} Deletion confirmation
   */
  async deleteUser(userId, adminId) {
    // Validation: Cannot delete own account
    if (userId === adminId) {
      throw new ForbiddenError('Cannot delete your own account');
    }

    // Find target user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validation: Cannot delete last admin
    if (user.role === USER_ROLES.ADMIN) {
      const adminCount = await User.count({ where: { role: USER_ROLES.ADMIN } });
      if (adminCount <= 1) {
        throw new ForbiddenError('Cannot delete the last admin. At least one admin must exist.');
      }
    }

    // Store user info for audit logging before deletion
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Hard delete (can be changed to soft delete if needed)
    await user.destroy();

    // Log audit entry
    logAdminAction('USER_DELETE', adminId, userId, {
      userName: userInfo.name,
      userEmail: userInfo.email,
      userRole: userInfo.role,
    });

    return userInfo;
  }
}

module.exports = new AdminService();
