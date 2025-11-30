/**
 * Extract user-friendly error message from API response
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message in Vietnamese
 */
export const getErrorMessage = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Yêu cầu quá lâu. Vui lòng thử lại.';
    }
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
  }

  // HTTP error response
  const { status, data } = error.response;

  // Use backend error message if available
  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  // Fallback messages based on status code
  switch (status) {
    case 400:
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    case 401:
      return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    case 403:
      return 'Bạn không có quyền truy cập tài nguyên này.';
    case 404:
      return 'Không tìm thấy tài nguyên yêu cầu.';
    case 409:
      return 'Dữ liệu đã tồn tại. Vui lòng thử lại.';
    case 413:
      return 'File quá lớn. Vui lòng chọn file nhỏ hơn.';
    case 429:
      return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';
    case 500:
      return 'Lỗi server. Vui lòng thử lại sau.';
    case 503:
      return 'Server đang bảo trì. Vui lòng thử lại sau.';
    default:
      return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
};

/**
 * Check if error is a network error (no response)
 */
export const isNetworkError = (error) => {
  return !error.response;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 400;
};

/**
 * Extract validation errors from response
 * @param {Error} error - Axios error object
 * @returns {Object} - Object with field-specific error messages
 */
export const getValidationErrors = (error) => {
  if (!isValidationError(error)) {
    return {};
  }

  const errors = error.response?.data?.errors || {};
  return errors;
};
