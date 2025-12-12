// Export all custom hooks from a single file

// Context hooks
export { useAuth } from '../context/AuthContext';

// Utility hooks
export { useApi } from './useApi';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';

// React Query hooks - Authentication
export * from './useAuth';

// React Query hooks - User
export * from './useUser';

// React Query hooks - Check-in
export * from './useCheckIn';

// React Query hooks - Blog/Articles
export * from './useBlog';

// React Query hooks - AI Features
export * from './useAI';

// React Query hooks - Places
export * from './usePlaces';

// React Query hooks - Dashboard (Admin)
export * from './useDashboard';

// React Query hooks - Admin Users
export * from './useAdminUsers';
