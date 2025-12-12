import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  Menu,
  X,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { toast } from 'react-hot-toast';

/**
 * AdminLayout - Layout wrapper for admin pages
 * Features: Sidebar navigation, mobile responsive, user info, logout
 */
export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Tổng quan & thống kê'
    },
    {
      name: 'Người dùng',
      path: '/admin/users',
      icon: Users,
      description: 'Quản lý người dùng'
    },
    {
      name: 'Bài viết',
      path: '/admin/articles',
      icon: FileText,
      description: 'Quản lý bài viết'
    },
    {
      name: 'Danh mục',
      path: '/admin/categories',
      icon: FolderTree,
      description: 'Quản lý danh mục'
    }
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-luxury-black flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-luxury-black/95 backdrop-blur-lg border-r border-luxury-gold/20 ${
          isSidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 z-40`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-luxury-gold/20 flex items-center justify-between">
          <Link to="/admin/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="font-playfair text-2xl text-white font-bold cursor-pointer"
            >
              H<span className="text-luxury-gold">Travel</span>
              <span className="text-xs block text-luxury-gray-100 font-philosopher mt-1">
                Admin Panel
              </span>
            </motion.div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-luxury-gold/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-luxury-gold/20 flex items-center justify-center">
              <span className="text-luxury-gold font-playfair text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-philosopher font-semibold">
                {user?.name}
              </p>
              <p className="text-luxury-gray-100 text-sm font-philosopher">
                {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);

              return (
                <li key={item.path}>
                  <Link to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-luxury-gold text-luxury-black shadow-lg'
                          : 'text-luxury-gray-100 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className={`font-philosopher font-semibold ${
                          isActive ? 'text-luxury-black' : 'text-white'
                        }`}>
                          {item.name}
                        </p>
                        <p className={`text-xs font-philosopher ${
                          isActive ? 'text-luxury-black/70' : 'text-luxury-gray-200'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-luxury-gold/20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-200 font-philosopher"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </motion.button>

          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-luxury-gray-100 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 font-philosopher"
            >
              <ChevronLeft className="w-5 h-5" />
              Về trang chính
            </motion.button>
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Mobile Menu */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-80 bg-luxury-black border-r border-luxury-gold/20 z-50 flex flex-col"
            >
              {/* Mobile Header */}
              <div className="p-6 border-b border-luxury-gold/20 flex items-center justify-between">
                <div className="font-playfair text-2xl text-white font-bold">
                  H<span className="text-luxury-gold">Travel</span>
                  <span className="text-xs block text-luxury-gray-100 font-philosopher mt-1">
                    Admin Panel
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-luxury-gray-100 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-luxury-gold/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                    <span className="text-luxury-gold font-playfair text-xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-philosopher font-semibold">
                      {user?.name}
                    </p>
                    <p className="text-luxury-gray-100 text-sm font-philosopher">
                      {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.path);

                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-luxury-gold text-luxury-black shadow-lg'
                                : 'text-luxury-gray-100 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <div>
                              <p className={`font-philosopher font-semibold ${
                                isActive ? 'text-luxury-black' : 'text-white'
                              }`}>
                                {item.name}
                              </p>
                              <p className={`text-xs font-philosopher ${
                                isActive ? 'text-luxury-black/70' : 'text-luxury-gray-200'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-luxury-gold/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-200 font-philosopher"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>

                <Link to="/">
                  <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-luxury-gray-100 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 font-philosopher">
                    <ChevronLeft className="w-5 h-5" />
                    Về trang chính
                  </button>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'
      }`}>
        {/* Top Header */}
        <header className="bg-luxury-black/95 backdrop-blur-lg border-b border-luxury-gold/20 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-luxury-gray-100 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:block p-2 text-luxury-gray-100 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </motion.button>

              <div>
                <h1 className="text-lg font-playfair text-white font-semibold">
                  Admin Panel
                </h1>
                <p className="text-sm text-luxury-gray-100 font-philosopher">
                  Quản lý hệ thống HTravel
                </p>
              </div>
            </div>

            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-white font-philosopher text-sm font-semibold">
                  {user?.name}
                </p>
                <p className="text-luxury-gray-100 text-xs font-philosopher">
                  {user?.email}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                <span className="text-luxury-gold font-playfair text-lg font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
