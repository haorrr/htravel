import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categories';
import { toast } from 'react-hot-toast';

/**
 * Query keys factory for categories
 */
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  list: (params) => [...categoryKeys.lists(), params],
};

/**
 * Hook to fetch categories (hierarchical or flat)
 * @param {Object} params - Query parameters
 * @param {boolean} params.hierarchy - Return hierarchical structure
 * @returns {Object} React Query result
 */
export function useCategories(params = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.listCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

/**
 * Hook to create new category
 * @returns {Object} Mutation object
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Danh mục đã được tạo thành công');
      return response;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Không thể tạo danh mục';
      toast.error(message);
    },
  });
}

/**
 * Hook to update category
 * @returns {Object} Mutation object
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Danh mục đã được cập nhật');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Không thể cập nhật danh mục';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete category
 * @returns {Object} Mutation object
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
      const previousData = queryClient.getQueriesData({ queryKey: categoryKeys.lists() });

      // Optimistically remove from cache
      queryClient.setQueriesData({ queryKey: categoryKeys.lists() }, (old) => {
        if (!old?.data) return old;

        const data = Array.isArray(old.data) ? old.data : old.data.categories || old.data;

        const filterCategories = (categories) => {
          return categories
            .filter((cat) => cat.id !== id)
            .map((cat) => ({
              ...cat,
              children: cat.children ? filterCategories(cat.children) : undefined,
            }));
        };

        const filtered = filterCategories(data);

        return Array.isArray(old.data)
          ? { ...old, data: filtered }
          : { ...old, data: { ...old.data, categories: filtered } };
      });

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Danh mục đã được xóa');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      const message = error.response?.data?.message || 'Không thể xóa danh mục';
      toast.error(message);
    },
  });
}
