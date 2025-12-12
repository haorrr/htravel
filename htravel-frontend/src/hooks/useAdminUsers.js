import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Query keys factory for admin user management
 */
export const adminUserKeys = {
  all: ['admin', 'users'],
  lists: () => [...adminUserKeys.all, 'list'],
  list: (params) => [...adminUserKeys.lists(), params],
};

/**
 * Fetch paginated users list with search and filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.role - Role filter ('admin' or 'user')
 * @param {number} params.page - Page number (1-based)
 * @param {number} params.limit - Items per page
 */
export const useAdminUsers = (params = {}) => {
  // Clean params - remove empty/undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== '' && value !== null)
  );

  return useQuery({
    queryKey: adminUserKeys.list(cleanParams),
    queryFn: () => adminService.listUsers(cleanParams),
    staleTime: 2 * 60 * 1000, // 2 minutes (user data changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    // Keep previous data while fetching new page for better UX
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Update user role mutation
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => adminService.updateUserRole(userId, role),
    onMutate: async ({ userId, role }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminUserKeys.lists() });

      // Snapshot previous data for rollback
      const previousData = queryClient.getQueriesData({ queryKey: adminUserKeys.lists() });

      // Optimistically update all cached lists
      queryClient.setQueriesData({ queryKey: adminUserKeys.lists() }, (old) => {
        if (!old?.data?.users) return old;

        return {
          ...old,
          data: {
            ...old.data,
            users: old.data.users.map((user) =>
              user.id === userId ? { ...user, role } : user
            ),
          },
        };
      });

      return { previousData };
    },
    onSuccess: (data) => {
      const role = data?.data?.user?.role || data?.data?.role;
      toast.success(`Đã chuyển vai trò thành ${role === 'admin' ? 'quản trị viên' : 'người dùng'}!`);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = getErrorMessage(error);
      toast.error(message);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

/**
 * Delete user mutation
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminUserKeys.lists() });

      // Snapshot previous data
      const previousData = queryClient.getQueriesData({ queryKey: adminUserKeys.lists() });

      // Optimistically remove user from all cached lists
      queryClient.setQueriesData({ queryKey: adminUserKeys.lists() }, (old) => {
        if (!old?.data?.users) return old;

        return {
          ...old,
          data: {
            ...old.data,
            users: old.data.users.filter((user) => user.id !== userId),
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
      toast.success('Đã xóa người dùng thành công!');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const message = getErrorMessage(error);
      toast.error(message);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};
