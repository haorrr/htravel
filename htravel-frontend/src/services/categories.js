import api from './api';

/**
 * Category service for blog category operations
 */
export const categoryService = {
  /**
   * List categories (hierarchical or flat)
   * @param {Object} params - Query parameters
   * @param {boolean} params.hierarchy - Return hierarchical structure
   * @returns {Promise<Object>} Categories list
   */
  listCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  /**
   * Create new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name
   * @param {string} data.slug - Category slug (optional, auto-generated)
   * @param {number} data.parentId - Parent category ID (optional)
   * @param {string} data.description - Category description (optional)
   * @returns {Promise<Object>} Created category
   */
  createCategory: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} data - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete category
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
