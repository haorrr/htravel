import api from './api';

export const blogService = {
  // Public: List articles with pagination and filters
  listArticles: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  // Public: Get single article by ID
  getArticle: async (articleId) => {
    const response = await api.get(`/articles/${articleId}`);
    return response.data;
  },

  // Public: Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Admin: Create new article
  createArticle: async (articleData, thumbnailFile = null) => {
    const formData = new FormData();
    formData.append('title', articleData.title);
    formData.append('content', articleData.content);
    formData.append('categoryId', articleData.categoryId);

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await api.post('/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Update article
  updateArticle: async (articleId, articleData, thumbnailFile = null) => {
    const formData = new FormData();

    if (articleData.title) formData.append('title', articleData.title);
    if (articleData.content) formData.append('content', articleData.content);
    if (articleData.categoryId) formData.append('categoryId', articleData.categoryId);

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    const response = await api.put(`/articles/${articleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Delete article
  deleteArticle: async (articleId) => {
    const response = await api.delete(`/articles/${articleId}`);
    return response.data;
  },

  // Admin: Get article statistics
  getArticleStats: async () => {
    const response = await api.get('/articles/stats');
    return response.data;
  },

  // Admin: Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Admin: Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Admin: Delete category
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },
};

export default blogService;
