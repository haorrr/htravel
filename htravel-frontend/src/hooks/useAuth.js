import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandler';
import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Login mutation
 */
export const useLogin = () => {
  const { login } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (result) => {
      if (result.success) {
        // Clear all queries on login
        queryClient.clear();
        toast.success('Đăng nhập thành công!');
      } else {
        toast.error(result.error || 'Đăng nhập thất bại');
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  const { register } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, email, password }) => register(name, email, password),
    onSuccess: (result) => {
      if (result.success) {
        // Clear all queries on register
        queryClient.clear();
        toast.success('Đăng ký thành công!');
      } else {
        toast.error(result.error || 'Đăng ký thất bại');
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const { logout } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
      toast.success('Đăng xuất thành công!');
    },
  });
};
