import api from './api';

export const aiService = {
  // Identify landmark from image
  identifyLandmark: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/ai/identify-landmark', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Generate virtual travel photo
  generateVirtualTravel: async (selfieFile, destination) => {
    const formData = new FormData();
    formData.append('selfie', selfieFile);
    formData.append('destination', destination);

    const response = await api.post('/ai/virtual-travel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get virtual travel history
  getVirtualTravelHistory: async (params = {}) => {
    const response = await api.get('/ai/virtual-travel/history', { params });
    return response.data;
  },

  // Get AI service status
  getAIStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },
};
