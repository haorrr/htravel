import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagService } from '../services/tags';
import { toast } from 'react-hot-toast';

/**
 * Query keys factory for tags
 */
export const tagKeys = {
  all: ['tags'],
  lists: () => [...tagKeys.all, 'list'],
  list: (params) => [...tagKeys.lists(), params],
  popular: (limit) => [...tagKeys.all, 'popular', limit],
};

/**
 * Hook to fetch tags (with optional search for autocomplete)
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {number} params.limit - Maximum results
 * @returns {Object} React Query result
 */
export function useTags(params = {}) {
  return useQuery({
    queryKey: tagKeys.list(params),
    queryFn: () => tagService.listTags(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch popular tags
 * @param {number} limit - Maximum results
 * @returns {Object} React Query result
 */
export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: tagKeys.popular(limit),
    queryFn: () => tagService.getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create new tag (or return existing)
 * @returns {Object} Mutation object
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => tagService.createTag(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });

      // Check if tag already existed (status 200) or was created (status 201)
      const wasCreated = response.data?.id && !response.message?.includes('exists');

      if (wasCreated) {
        toast.success('Thẻ mới đã được tạo');
      }

      return response;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Không thể tạo thẻ';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete tag
 * @returns {Object} Mutation object
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => tagService.deleteTag(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tagKeys.lists() });
      const previousData = queryClient.getQueriesData({ queryKey: tagKeys.lists() });

      // Optimistically remove from cache
      queryClient.setQueriesData({ queryKey: tagKeys.lists() }, (old) => {
        if (!old?.data) return old;

        const data = Array.isArray(old.data) ? old.data : old.data.tags || old.data;
        const filtered = data.filter((tag) => tag.id !== id);

        return Array.isArray(old.data)
          ? { ...old, data: filtered }
          : { ...old, data: { ...old.data, tags: filtered } };
      });

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      toast.success('Thẻ đã được xóa');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const message = error.response?.data?.message || 'Không thể xóa thẻ';
      toast.error(message);
    },
  });
}
