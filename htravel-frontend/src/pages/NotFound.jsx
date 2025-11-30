import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, MapPin } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full relative z-10"
      >
        <GlassCard className="p-8 md:p-12 text-center">
          {/* 404 Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-luxury-gold/10 flex items-center justify-center">
                <MapPin className="text-luxury-gold" size={60} />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-luxury-gold/20 rounded-full border-t-luxury-gold"
              />
            </div>
          </motion.div>

          {/* 404 Text */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-8xl md:text-9xl font-playfair text-luxury-gold mb-4 font-bold"
          >
            404
          </motion.h1>

          {/* Error Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl md:text-4xl font-playfair text-white mb-4"
          >
            Không Tìm Thấy Trang
          </motion.h2>

          {/* Error Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-luxury-gray-100 font-philosopher text-lg mb-8"
          >
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </motion.p>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-luxury-darker rounded-lg p-6 mb-8"
          >
            <p className="text-luxury-gray-100 font-philosopher text-sm mb-3">
              Bạn có thể thử:
            </p>
            <ul className="text-luxury-gray-200 font-philosopher text-sm space-y-2 text-left">
              <li>• Kiểm tra lại đường dẫn URL</li>
              <li>• Quay lại trang trước</li>
              <li>• Về trang chủ và bắt đầu lại</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <LuxuryButton
              variant="primary"
              onClick={() => navigate('/')}
            >
              <Home size={20} className="mr-2" />
              Về Trang Chủ
            </LuxuryButton>
            <LuxuryButton
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} className="mr-2" />
              Quay Lại
            </LuxuryButton>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
