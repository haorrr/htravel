import api from './api';

/**
 * Tag service for article tagging operations
 */
export const tagService = {
  /**
   * List tags or search by name (autocomplete)
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term for autocomplete
   * @param {number} params.limit - Maximum results
   * @returns {Promise<Object>} Tags list
   */
  listTags: async (params = {}) => {
    const response = await api.get('/tags', { params });
    return response.data;
  },

  /**
   * Get single tag with article count
   * @param {number} id - Tag ID
   * @returns {Promise<Object>} Tag data
   */
  getTag: async (id) => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  /**
   * Create new tag (or return existing)
   * @param {Object} data - Tag data
   * @param {string} data.name - Tag name
   * @param {string} data.slug - Tag slug (optional, auto-generated)
   * @returns {Promise<Object>} Created or existing tag
   */
  createTag: async (data) => {
    const response = await api.post('/tags', data);
    return response.data;
  },

  /**
   * Delete tag
   * @param {number} id - Tag ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteTag: async (id) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },

  /**
   * Get popular tags by usage count
   * @param {number} limit - Maximum results (default: 10)
   * @returns {Promise<Object>} Popular tags list
   */
  getPopularTags: async (limit = 10) => {
    const response = await api.get('/tags/popular', { params: { limit } });
    return response.data;
  },
};

export default tagService;
