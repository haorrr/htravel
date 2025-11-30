import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { checkinService } from '../services/checkin';
import { getErrorMessage } from '../utils/errorHandler';

// Query keys
export const checkinKeys = {
  all: ['checkin'],
  lists: () => [...checkinKeys.all, 'list'],
  list: (filters) => [...checkinKeys.lists(), filters],
  mapHistory: () => [...checkinKeys.all, 'map-history'],
  stats: () => [...checkinKeys.all, 'stats'],
};

/**
 * Fetch paginated check-ins
 */
export const useCheckIns = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: checkinKeys.list({ page, limit }),
    queryFn: () => checkinService.getCheckIns({ page, limit }),
    keepPreviousData: true,
  });
};

/**
 * Fetch map history (visited provinces)
 */
export const useMapHistory = () => {
  return useQuery({
    queryKey: checkinKeys.mapHistory(),
    queryFn: checkinService.getMapHistory,
    staleTime: 10 * 60 * 1000, // 10 minutes (map data changes slowly)
  });
};

/**
 * Fetch check-in statistics
 */
export const useCheckInStats = () => {
  return useQuery({
    queryKey: checkinKeys.stats(),
    queryFn: checkinService.getStats,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create new check-in
 */
export const useCreateCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkinService.createCheckIn,
    onSuccess: () => {
      // Invalidate all check-in related queries
      queryClient.invalidateQueries({ queryKey: checkinKeys.all });
      toast.success('Check-in thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Delete check-in
 */
export const useDeleteCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkinService.deleteCheckIn,
    onSuccess: () => {
      // Invalidate all check-in queries
      queryClient.invalidateQueries({ queryKey: checkinKeys.all });
      toast.success('Xóa check-in thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};
