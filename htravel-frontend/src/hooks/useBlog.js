import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { blogService } from '../services/blog';
import { getErrorMessage } from '../utils/errorHandler';

// Query keys
export const blogKeys = {
  all: ['blog'],
  articles: () => [...blogKeys.all, 'articles'],
  article: (id) => [...blogKeys.articles(), id],
  articlesList: (filters) => [...blogKeys.articles(), 'list', filters],
  categories: () => [...blogKeys.all, 'categories'],
  stats: () => [...blogKeys.all, 'stats'],
};

/**
 * Fetch paginated articles with filters
 */
export const useArticles = (params = {}) => {
  const { page = 1, limit = 10, categoryId, search } = params;

  return useQuery({
    queryKey: blogKeys.articlesList({ page, limit, categoryId, search }),
    queryFn: () => blogService.listArticles({ page, limit, categoryId, search }),
    keepPreviousData: true,
  });
};

/**
 * Fetch single article by ID
 */
export const useArticle = (articleId) => {
  return useQuery({
    queryKey: blogKeys.article(articleId),
    queryFn: () => blogService.getArticle(articleId),
    enabled: !!articleId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: blogKeys.categories(),
    queryFn: blogService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
  });
};

/**
 * Fetch article statistics (admin only)
 */
export const useArticleStats = () => {
  return useQuery({
    queryKey: blogKeys.stats(),
    queryFn: blogService.getArticleStats,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create new article (admin only)
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleData, thumbnail }) =>
      blogService.createArticle(articleData, thumbnail),
    onSuccess: () => {
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: blogKeys.articles() });
      queryClient.invalidateQueries({ queryKey: blogKeys.stats() });
      toast.success('Tạo bài viết thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Update article (admin only)
 */
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, articleData, thumbnail }) =>
      blogService.updateArticle(articleId, articleData, thumbnail),
    onSuccess: (data, variables) => {
      // Invalidate specific article and lists
      queryClient.invalidateQueries({ queryKey: blogKeys.article(variables.articleId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.articles() });
      toast.success('Cập nhật bài viết thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Delete article (admin only)
 */
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogService.deleteArticle,
    onSuccess: () => {
      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: blogKeys.articles() });
      queryClient.invalidateQueries({ queryKey: blogKeys.stats() });
      toast.success('Xóa bài viết thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Create category (admin only)
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      toast.success('Tạo danh mục thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Update category (admin only)
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, categoryData }) =>
      blogService.updateCategory(categoryId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      toast.success('Cập nhật danh mục thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Delete category (admin only)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
      toast.success('Xóa danh mục thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
