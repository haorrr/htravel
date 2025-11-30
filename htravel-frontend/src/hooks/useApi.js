import { useState, useCallback } from 'react';

/**
 * Custom hook for API calls with loading and error states
 * @param {Function} apiFunc - The API function to call
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunc(...args);
      setData(result.data);
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;
