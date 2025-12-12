import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Địa điểm', path: '/places' },
    { name: 'AI Travel', path: '/ai-features' },
    { name: 'Lập kế hoạch', path: '/trip-planner' },
    { name: 'Blog', path: '/blog' },
    { name: 'Bản đồ', path: '/map' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300
                 ${isScrolled ? 'bg-luxury-black/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-playfair text-2xl md:text-3xl text-white font-bold cursor-pointer"
          >
            H<span className="text-luxury-gold">Travel</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <motion.div key={item.name}>
              <Link
                to={item.path}
                className="font-philosopher text-luxury-gray-100 hover:text-luxury-gold-light
                          uppercase text-sm tracking-wider transition-colors duration-300"
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/places')}
            className="text-white hover:text-luxury-gold transition-colors hidden md:block"
            aria-label="Tìm kiếm địa điểm"
          >
            <Search size={20} />
          </motion.button>

          {/* Authentication Buttons */}
          {!isAuthenticated ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate('/login')}
              className="text-white hover:text-luxury-gold transition-colors"
              aria-label="Đăng nhập"
            >
              <User size={20} />
            </motion.button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-white hover:text-luxury-gold transition-colors"
                aria-label="User menu"
              >
                <User size={20} />
                <span className="hidden md:block text-sm font-philosopher">
                  {user?.name}
                </span>
                <ChevronDown size={16} className={`hidden md:block transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-luxury-dark/95 backdrop-blur-lg border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-philosopher text-white">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded text-xs text-luxury-gold">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm font-philosopher text-gray-300 hover:bg-gray-800 hover:text-luxury-gold transition-colors flex items-center gap-2"
                      >
                        <User size={16} />
                        Hồ sơ cá nhân
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm font-philosopher text-gray-300 hover:bg-gray-800 hover:text-luxury-gold transition-colors flex items-center gap-2"
                        >
                          <LayoutDashboard size={16} />
                          Quản trị Admin
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm font-philosopher text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors flex items-center gap-2 border-t border-gray-800 mt-2 pt-2"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-luxury-gold transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-luxury-dark/95 backdrop-blur-lg border-t border-gray-800"
      >
        <div className="px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-philosopher text-luxury-gray-100 hover:text-luxury-gold-light
                        uppercase text-sm tracking-wider transition-colors duration-300"
            >
              {item.name}
            </Link>
          ))}

          {/* Mobile Authentication Section */}
          {isAuthenticated && (
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <div className="px-2 py-2 bg-gray-800/50 rounded-lg">
                <p className="text-sm font-philosopher text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded text-xs text-luxury-gold">
                    Admin
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm font-philosopher text-gray-300 hover:text-luxury-gold transition-colors flex items-center gap-2"
              >
                <User size={16} />
                Hồ sơ cá nhân
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-philosopher text-gray-300 hover:text-luxury-gold transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  Quản trị Admin
                </button>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm font-philosopher text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}
