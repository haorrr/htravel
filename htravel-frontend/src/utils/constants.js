// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Token Storage Keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',

  // User
  PROFILE: '/api/user/profile',
  CHECK_IN: '/api/user/check-in',
  MAP_HISTORY: '/api/user/map-history',

  // AI
  IDENTIFY_LANDMARK: '/api/ai/identify-landmark',
  VIRTUAL_TRAVEL: '/api/ai/virtual-travel',
  VIRTUAL_TRAVEL_HISTORY: '/api/ai/virtual-travel/history',
  AI_STATUS: '/api/ai/status',

  // Articles
  ARTICLES: '/api/articles',
  ARTICLE_BY_ID: (id) => `/api/articles/${id}`,

  // Places
  PLACES_SEARCH: '/api/places/search',
  PLACES_NEARBY: '/api/places/nearby',
  PLACES_DETAILS: (id) => `/api/places/details/${id}`,
  PLACES_TYPES: '/api/places/types',
  PLACES_STATUS: '/api/places/status'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  AI_FEATURES: '/ai-features',
  MAP: '/map',
  BLOG: '/blog',
  BLOG_DETAIL: (id) => `/blog/${id}`,
  PLACES: '/places'
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
};

// Form Validation Rules
export const VALIDATION = {
  EMAIL_PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2
};

// Vietnamese Provinces by Region
export const VIETNAM_PROVINCES = [
  // Northern Vietnam
  { id: 1, name: 'Hà Nội', region: 'Bắc' },
  { id: 2, name: 'Hải Phòng', region: 'Bắc' },
  { id: 3, name: 'Quảng Ninh', region: 'Bắc' },
  { id: 4, name: 'Lào Cai', region: 'Bắc' },
  { id: 5, name: 'Ninh Bình', region: 'Bắc' },
  { id: 6, name: 'Hạ Long', region: 'Bắc' },

  // Central Vietnam
  { id: 7, name: 'Huế', region: 'Trung' },
  { id: 8, name: 'Đà Nẵng', region: 'Trung' },
  { id: 9, name: 'Hội An', region: 'Trung' },
  { id: 10, name: 'Nha Trang', region: 'Trung' },
  { id: 11, name: 'Đà Lạt', region: 'Trung' },
  { id: 12, name: 'Quy Nhơn', region: 'Trung' },

  // Southern Vietnam
  { id: 13, name: 'TP. Hồ Chí Minh', region: 'Nam' },
  { id: 14, name: 'Vũng Tàu', region: 'Nam' },
  { id: 15, name: 'Phú Quốc', region: 'Nam' },
  { id: 16, name: 'Cần Thơ', region: 'Nam' },
  { id: 17, name: 'Mũi Né', region: 'Nam' },
  { id: 18, name: 'Côn Đảo', region: 'Nam' }
];

// Blog Categories
export const BLOG_CATEGORIES = {
  DU_LICH: { value: 'du-lich', label: 'Du lịch' },
  AM_THUC: { value: 'am-thuc', label: 'Ẩm thực' },
  VAN_HOA: { value: 'van-hoa', label: 'Văn hóa' },
  KINH_NGHIEM: { value: 'kinh-nghiem', label: 'Kinh nghiệm' },
  DIA_DANH: { value: 'dia-danh', label: 'Địa danh' }
};

// Virtual Travel Destinations
export const VIRTUAL_TRAVEL_DESTINATIONS = [
  { value: 'halong_bay', label: 'Vịnh Hạ Long' },
  { value: 'hoian', label: 'Phố Cổ Hội An' },
  { value: 'sapa', label: 'Sapa' },
  { value: 'danang', label: 'Đà Nẵng' },
  { value: 'phuquoc', label: 'Phú Quốc' }
];

// Animation Durations (milliseconds)
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  IMAGE_ZOOM: 700
};

// Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// Success/Error Messages
export const MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng thử lại.',
  REGISTER_SUCCESS: 'Đăng ký thành công!',
  REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
  PROFILE_UPDATE_SUCCESS: 'Cập nhật hồ sơ thành công!',
  PROFILE_UPDATE_FAILED: 'Không thể cập nhật hồ sơ.',
  CHECK_IN_SUCCESS: 'Check-in thành công!',
  CHECK_IN_FAILED: 'Check-in thất bại.',
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
  GENERIC_ERROR: 'Đã xảy ra lỗi. Vui lòng thử lại.'
};
