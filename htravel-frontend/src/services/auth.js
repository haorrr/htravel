import api from './api';

export const authService = {
  // SỬA: Nhận 3 tham số riêng biệt để khớp với AuthContext
  register: async (name, email, password) => {
    // Gom lại thành object { name, email, password }
    const response = await api.post('/auth/register', { name, email, password });
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  // SỬA: Nhận email và password riêng biệt
  login: async (email, password) => {
    // Gom lại thành object { email, password }
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  // Logout user (Giữ nguyên)
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Nên xóa cả user info nếu có
  },

  // Check if user is authenticated (Giữ nguyên)
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get current user profile (Giữ nguyên)
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile (Giữ nguyên)
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Upload avatar (Giữ nguyên)
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};