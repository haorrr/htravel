import api from './api';

export const plannerService = {
  // Generate trip itinerary
  generateItinerary: async (data) => {
    const response = await api.post('/planner/generate', data);
    return response.data;
  },

  // Save itinerary
  saveItinerary: async (data) => {
    const response = await api.post('/planner/save', data);
    return response.data;
  },

  // Get user's trips (paginated)
  getMyTrips: async (params = {}) => {
    const response = await api.get('/planner/my-trips', { params });
    return response.data;
  },

  // Get single trip by ID
  getTripById: async (id) => {
    const response = await api.get(`/planner/trips/${id}`);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (id) => {
    const response = await api.delete(`/planner/trips/${id}`);
    return response.data;
  },

  // Get service status
  getStatus: async () => {
    const response = await api.get('/planner/status');
    return response.data;
  },
};
