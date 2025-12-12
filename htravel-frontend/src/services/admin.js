import api from './api';

/**
 * Admin service for user management operations
 */
export const adminService = {
  /**
   * List users with search, filters, and pagination
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term for name/email
   * @param {string} params.role - Filter by role ('admin' or 'user')
   * @param {number} params.page - Page number (1-based)
   * @param {number} params.limit - Items per page
   * @returns {Promise<Object>} Users list with pagination metadata
   */
  listUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} role - New role ('admin' or 'user')
   * @returns {Promise<Object>} Updated user data
   */
  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Delete user account
   * @param {number} userId - User ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default adminService;
