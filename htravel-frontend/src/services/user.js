import api from './api';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile (name, bio)
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Upload avatar with profile update
  uploadAvatar: async (file, profileData = {}) => {
    const formData = new FormData();
    formData.append('avatar', file);

    // Add other profile fields if provided
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.bio) formData.append('bio', profileData.bio);

    const response = await api.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default userService;
