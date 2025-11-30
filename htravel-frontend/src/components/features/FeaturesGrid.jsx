import { motion } from 'framer-motion';
import { Scan, Image as ImageIcon, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FeaturesGrid() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Scan,
      title: 'AI Nhận Diện Địa Danh',
      description: 'Upload ảnh và để AI nhận diện địa danh Việt Nam với độ chính xác cao',
      path: '/ai-features',
      gradient: 'from-luxury-gold/20 to-luxury-burgundy/20'
    },
    {
      icon: ImageIcon,
      title: 'Du Lịch Ảo AI',
      description: 'Tạo ảnh du lịch ảo với công nghệ AI, ghép ảnh của bạn vào địa danh nổi tiếng',
      path: '/ai-features',
      gradient: 'from-luxury-navy/20 to-luxury-gold/20'
    },
    {
      icon: MapPin,
      title: 'Bản Đồ Check-in',
      description: 'Theo dõi hành trình du lịch, check-in và xem lịch sử các địa điểm đã ghé thăm',
      path: '/map',
      gradient: 'from-luxury-gold-dark/20 to-luxury-navy/20'
    },
    {
      icon: FileText,
      title: 'Blog Du Lịch',
      description: 'Khám phá các bài viết, kinh nghiệm du lịch từ cộng đồng yêu thích Việt Nam',
      path: '/blog',
      gradient: 'from-luxury-burgundy/20 to-luxury-gold-dark/20'
    }
  ];

  return (
    <section className="py-20 px-6 bg-luxury-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-playfair text-white mb-4">
            Tính Năng <span className="text-luxury-gold">Nổi Bật</span>
          </h2>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Khám phá các công nghệ AI tiên tiến giúp bạn trải nghiệm du lịch Việt Nam theo cách hoàn toàn mới
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(feature.path)}
                className="group cursor-pointer"
              >
                <div className={`glass-effect rounded-xl p-6 h-full bg-gradient-to-br ${feature.gradient} hover:bg-white/20 transition-all duration-300`}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-luxury-gold/20 mb-4"
                  >
                    <Icon className="text-luxury-gold" size={28} />
                  </motion.div>

                  <h3 className="text-xl font-playfair text-white mb-3 group-hover:text-luxury-gold transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-luxury-gray-100 font-philosopher text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  <motion.div
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    className="mt-4 text-luxury-gold-light text-sm font-philosopher uppercase tracking-wider flex items-center gap-2"
                  >
                    Tìm hiểu thêm →
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
