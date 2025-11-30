import { motion } from 'framer-motion';
import LuxuryButton from '../common/LuxuryButton';
import GlassCard from '../common/GlassCard';

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen bg-luxury-black overflow-hidden">
      {/* Background Image (placeholder for video) */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop"
          alt="Vietnam Landscape"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

      {/* Glassmorphism Content */}
      <div className="relative h-full flex items-center justify-center z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="max-w-3xl text-center p-12" hover={false}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl md:text-6xl font-playfair text-white leading-tight mb-6"
            >
              Khám Phá Việt Nam <br />
              <span className="text-luxury-gold">Cùng Công Nghệ AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl font-philosopher text-luxury-gray-100 mb-8 leading-relaxed"
            >
              Trải nghiệm du lịch thông minh với AI nhận diện địa danh,
              du lịch ảo và bản đồ tương tác
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <LuxuryButton variant="primary" size="lg">
                Khám Phá Ngay
              </LuxuryButton>
              <LuxuryButton variant="outline" size="lg">
                Xem Demo
              </LuxuryButton>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-philosopher uppercase tracking-wider">Cuộn xuống</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
