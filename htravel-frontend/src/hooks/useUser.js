import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../services/user';
import { getErrorMessage } from '../utils/errorHandler';

// Query keys
export const userKeys = {
  all: ['user'],
  profile: () => [...userKeys.all, 'profile'],
};

/**
 * Fetch user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update user profile (name, bio)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success('Cập nhật profile thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Upload avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, profileData }) => userService.uploadAvatar(file, profileData),
    onSuccess: () => {
      // Invalidate profile to show new avatar
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      toast.success('Cập nhật ảnh đại diện thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
