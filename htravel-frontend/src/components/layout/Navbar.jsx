import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Địa điểm', path: '/places' },
    { name: 'AI Travel', path: '/ai-features' },
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate('/login')}
            className="text-white hover:text-luxury-gold transition-colors"
            aria-label="Đăng nhập"
          >
            <User size={20} />
          </motion.button>

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
        className="md:hidden overflow-hidden bg-luxury-dark/95 backdrop-blur-lg"
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
        </div>
      </motion.div>
    </motion.nav>
  );
}
