import api from './api';

export const placesService = {
  // Search for places by text query
  async searchPlaces(query, lat, lng, radius, type) {
    const params = { query };
    if (lat) params.lat = lat;
    if (lng) params.lng = lng;
    if (radius) params.radius = radius;
    if (type) params.type = type;

    const response = await api.get('/places/search', { params });
    return response.data;
  },

  // Search for nearby places
  async nearbyPlaces(lat, lng, radius, type, keyword) {
    const params = { lat, lng };
    if (radius) params.radius = radius;
    if (type) params.type = type;
    if (keyword) params.keyword = keyword;

    const response = await api.get('/places/nearby', { params });
    return response.data;
  },

  // Get place details by place ID
  async getPlaceDetails(placeId) {
    const response = await api.get(`/places/details/${placeId}`);
    return response.data;
  },

  // Get list of available place types
  async getPlaceTypes() {
    const response = await api.get('/places/types');
    return response.data;
  },

  // Get Places API status
  async getStatus() {
    const response = await api.get('/places/status');
    return response.data;
  }
};

export default placesService;
