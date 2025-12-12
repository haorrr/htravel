import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Hook to fetch dashboard statistics
 * Returns: users, articles, categories, checkIns stats
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Hook to fetch dashboard trends (user growth, article distribution, check-in stats)
 * @param {string} period - '7d', '30d', or '90d'
 */
export const useDashboardTrends = (period = '30d') => {
  return useQuery({
    queryKey: ['dashboard', 'trends', period],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${API_URL}/admin/dashboard/trends?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch recent activity
 * @param {number} limit - Number of activities to fetch
 */
export const useDashboardActivity = (limit = 20) => {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${API_URL}/admin/dashboard/activity?limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (activity updates more frequently)
    gcTime: 5 * 60 * 1000,
  });
};
