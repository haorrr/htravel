import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import AdminLayout from '../layout/AdminLayout';

/**
 * AdminRoute - Protects admin-only routes
 * Requires authentication + admin role
 * Uses Outlet pattern for nested routes
 * Wraps all admin pages with AdminLayout
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Phase 1: Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-gray-100 font-philosopher">
            Đang xác thực quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // Phase 2: Authentication check
  if (!isAuthenticated) {
    // Preserve current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Phase 3: Authorization check (admin role)
  if (!isAdmin) {
    // Log unauthorized attempt
    console.warn('Unauthorized admin access attempt:', {
      path: location.pathname,
      timestamp: new Date().toISOString()
    });

    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {/* 403 Forbidden UI - Luxury Theme */}
          <div className="relative mb-8">
            <h1 className="text-9xl font-playfair text-luxury-gold opacity-20">
              403
            </h1>
          </div>

          <h2 className="text-3xl font-playfair text-white mb-4">
            Truy cập bị từ chối
          </h2>

          <p className="text-luxury-gray-100 font-philosopher mb-8">
            Bạn không có quyền truy cập vào khu vực quản trị.
            Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-luxury-gold text-luxury-black rounded-lg font-philosopher font-semibold hover:bg-luxury-gold-light transition-all duration-200 shadow-luxury"
            >
              Về Trang Chủ
            </button>

            <button
              onClick={() => window.location.href = '/profile'}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-philosopher font-semibold hover:bg-white/20 transition-all duration-200 border border-luxury-gold/30"
            >
              Trang Cá Nhân
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 4: All checks passed - render admin routes with layout
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute;
