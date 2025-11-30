import api from './api';

export const checkinService = {
  // Create new check-in
  createCheckIn: async (checkInData) => {
    const response = await api.post('/user/check-in', checkInData);
    return response.data;
  },

  // Get paginated check-in history
  getCheckIns: async (params = {}) => {
    const response = await api.get('/user/check-ins', { params });
    return response.data;
  },

  // Get visited provinces for map
  getMapHistory: async () => {
    const response = await api.get('/user/map-history');
    return response.data;
  },

  // Get check-in statistics
  getStats: async () => {
    const response = await api.get('/user/check-in-stats');
    return response.data;
  },

  // Delete specific check-in
  deleteCheckIn: async (checkInId) => {
    const response = await api.delete(`/user/check-in/${checkInId}`);
    return response.data;
  },
};

export default checkinService;
