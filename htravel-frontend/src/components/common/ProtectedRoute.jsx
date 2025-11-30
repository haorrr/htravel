import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import Loading from './Loading';

/**
 * Protected Route component - requires authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Redirect to login if not authenticated, save current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return children;
}
