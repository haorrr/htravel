import { QueryClient } from '@tanstack/react-query';

// Create QueryClient with optimal configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache kept for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (except 408, 429)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          if (error.response.status === 408 || error.response.status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        // Retry 5xx errors up to 3 times
        return failureCount < 3;
      },
      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (annoying in dev)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect
      refetchOnReconnect: false,
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
    },
  },
});
