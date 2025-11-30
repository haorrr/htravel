import { FILE_UPLOAD } from './constants';

/**
 * Format date to Vietnamese locale
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return new Date(date).toLocaleDateString('vi-VN', { ...defaultOptions, ...options });
};

/**
 * Format date to short format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

/**
 * Format relative time (e.g., "2 giờ trước")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
};

/**
 * Validate file for upload
 * @param {File} file - File to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Chưa chọn file' };
  }

  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return { valid: false, error: 'Kích thước file không được vượt quá 5MB' };
  }

  if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)' };
  }

  return { valid: true };
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate avatar URL from name
 * @param {string} name - User name
 * @param {number} size - Avatar size (default: 200)
 * @returns {string} - Avatar URL
 */
export const generateAvatarUrl = (name = 'User', size = 200) => {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=D4AF37&color=0A0A0A&size=${size}`;
};

/**
 * Get category color classes for blog
 * @param {string} category - Category value
 * @returns {string} - Tailwind CSS classes
 */
export const getCategoryColor = (category) => {
  const colors = {
    'du-lich': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    'am-thuc': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
    'van-hoa': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    'kinh-nghiem': 'bg-green-500/20 text-green-300 border-green-500/50',
    'dia-danh': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
  };
  return colors[category] || 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/50';
};

/**
 * Get category label in Vietnamese
 * @param {string} category - Category value
 * @returns {string} - Category label
 */
export const getCategoryLabel = (category) => {
  const labels = {
    'du-lich': 'Du lịch',
    'am-thuc': 'Ẩm thực',
    'van-hoa': 'Văn hóa',
    'kinh-nghiem': 'Kinh nghiệm',
    'dia-danh': 'Địa danh'
  };
  return labels[category] || category;
};

/**
 * Scroll to top of page smoothly
 */
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Check if user is on mobile device
 * @returns {boolean} - Is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get error message from API error response
 * @param {object} error - Axios error object
 * @returns {string} - Error message
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'Đã xảy ra lỗi từ server';
  } else if (error.request) {
    // Request made but no response
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
  } else {
    // Something else happened
    return error.message || 'Đã xảy ra lỗi không xác định';
  }
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};
