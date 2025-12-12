import api from './api';

/**
 * Article service for blog article operations (admin)
 */
export const articleService = {
  /**
   * List articles with filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Articles list with pagination
   */
  listArticles: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  /**
   * Get single article by ID or slug
   * @param {string} id - Article ID or slug
   * @returns {Promise<Object>} Article data
   */
  getArticle: async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  /**
   * Create new article
   * @param {Object} data - Article data
   * @returns {Promise<Object>} Created article
   */
  createArticle: async (data) => {
    const response = await api.post('/articles', data);
    return response.data;
  },

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {Object} data - Updated article data
   * @returns {Promise<Object>} Updated article
   */
  updateArticle: async (id, data) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
  },

  /**
   * Delete article
   * @param {string} id - Article ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteArticle: async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },

  /**
   * Get article statistics
   * @returns {Promise<Object>} Article stats
   */
  getStats: async () => {
    const response = await api.get('/articles/stats');
    return response.data;
  },
};

export default articleService;
