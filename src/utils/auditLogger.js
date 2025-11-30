/**
 * Audit Logger
 * Records admin actions for security and compliance
 */

const logger = require('./logger');

/**
 * Log admin action to audit trail
 * @param {String} action - Action type ('ROLE_UPDATE' | 'USER_DELETE')
 * @param {String} adminId - ID of admin performing action
 * @param {String} targetUserId - ID of affected user
 * @param {Object} details - Additional context (oldRole, newRole, userName, etc.)
 */
const logAdminAction = (action, adminId, targetUserId, details = {}) => {
  logger.info('ADMIN_AUDIT', {
    action,
    adminId,
    targetUserId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

module.exports = {
  logAdminAction,
};
