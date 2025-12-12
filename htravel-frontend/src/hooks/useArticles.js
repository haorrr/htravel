import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleService } from '../services/articles';
import { toast } from 'react-hot-toast';

/**
 * Query keys factory for articles
 */
export const articleKeys = {
  all: ['articles'],
  lists: () => [...articleKeys.all, 'list'],
  list: (params) => [...articleKeys.lists(), params],
  details: () => [...articleKeys.all, 'detail'],
  detail: (id) => [...articleKeys.details(), id],
};

/**
 * Hook to fetch articles list with filters
 * @param {Object} params - Query parameters
 * @returns {Object} React Query result
 */
export function useArticles(params = {}) {
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: () => articleService.listArticles(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to fetch single article by ID
 * @param {string} id - Article ID or slug
 * @param {Object} options - Query options
 * @returns {Object} React Query result
 */
export function useArticle(id, options = {}) {
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: () => articleService.getArticle(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to create new article
 * @returns {Object} Mutation object
 */
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => articleService.createArticle(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      toast.success('Bài viết đã được tạo thành công');
      return response;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Không thể tạo bài viết';
      toast.error(message);
    },
  });
}

/**
 * Hook to update article
 * @returns {Object} Mutation object
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => articleService.updateArticle(id, data),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: articleKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: articleKeys.lists() });
    },
    onSuccess: (response, { id }) => {
      // Update detail cache
      queryClient.setQueryData(articleKeys.detail(id), response);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });

      toast.success('Bài viết đã được cập nhật');
      return response;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Không thể cập nhật bài viết';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete article
 * @returns {Object} Mutation object
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => articleService.deleteArticle(id),
    onMutate: async (id) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: articleKeys.lists() });

      // Snapshot previous data
      const previousData = queryClient.getQueriesData({ queryKey: articleKeys.lists() });

      // Optimistically remove from cache
      queryClient.setQueriesData({ queryKey: articleKeys.lists() }, (old) => {
        if (!old?.data?.articles) return old;
        return {
          ...old,
          data: {
            ...old.data,
            articles: old.data.articles.filter((article) => article.id !== id),
            pagination: {
              ...old.data.pagination,
              total: old.data.pagination.total - 1,
            },
          },
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      toast.success('Bài viết đã được xóa');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const message = error.response?.data?.message || 'Không thể xóa bài viết';
      toast.error(message);
    },
  });
}
