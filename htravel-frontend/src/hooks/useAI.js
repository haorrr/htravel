import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { aiService } from '../services/ai';
import { getErrorMessage } from '../utils/errorHandler';

// Query keys
export const aiKeys = {
  all: ['ai'],
  virtualTravel: () => [...aiKeys.all, 'virtual-travel'],
  virtualTravelHistory: (params) => [...aiKeys.virtualTravel(), 'history', params],
  status: () => [...aiKeys.all, 'status'],
};

/**
 * Identify landmark from image
 */
export const useIdentifyLandmark = () => {
  return useMutation({
    mutationFn: aiService.identifyLandmark,
    onSuccess: () => {
      toast.success('Nhận diện địa danh thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Generate virtual travel photo
 */
export const useGenerateVirtualTravel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ selfie, destination }) =>
      aiService.generateVirtualTravel(selfie, destination),
    onSuccess: () => {
      // Invalidate history to show new photo
      queryClient.invalidateQueries({ queryKey: aiKeys.virtualTravel() });
      toast.success('Tạo ảnh du lịch ảo thành công!');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Fetch virtual travel history with pagination
 */
export const useVirtualTravelHistory = (params = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: aiKeys.virtualTravelHistory({ page, limit }),
    queryFn: () => aiService.getVirtualTravelHistory({ page, limit }),
    keepPreviousData: true,
  });
};

/**
 * Fetch AI service status
 */
export const useAIStatus = () => {
  return useQuery({
    queryKey: aiKeys.status(),
    queryFn: aiService.getAIStatus,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
