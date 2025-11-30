import { motion } from 'framer-motion';
import HeroSection from '../components/features/HeroSection';
import FeaturesGrid from '../components/features/FeaturesGrid';
import DestinationCard from '../components/features/DestinationCard';

export default function Homepage() {
  const featuredDestinations = [
    {
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070',
      title: 'Vịnh Hạ Long',
      description: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ',
      category: 'Miền Bắc'
    },
    {
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2071',
      title: 'Phố Cổ Hội An',
      description: 'Thành phố cổ quyến rũ với đèn lồng rực rỡ và kiến trúc xưa',
      category: 'Miền Trung'
    },
    {
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070',
      title: 'Sài Gòn',
      description: 'Thành phố năng động với văn hóa ẩm thực và lịch sử phong phú',
      category: 'Miền Nam'
    },
    {
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070',
      title: 'Sapa',
      description: 'Ruộng bậc thang tuyệt đẹp và văn hóa dân tộc độc đáo',
      category: 'Miền Bắc'
    },
  ];

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Featured Destinations */}
      <section className="py-20 px-6 bg-luxury-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-playfair text-white mb-4">
              Điểm Đến <span className="text-luxury-gold">Nổi Bật</span>
            </h2>
            <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
              Khám phá những địa danh đẹp nhất Việt Nam từ Bắc chí Nam
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <DestinationCard {...destination} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-luxury-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-effect rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
              Sẵn Sàng Khám Phá <span className="text-luxury-gold">Việt Nam</span>?
            </h2>
            <p className="text-luxury-gray-100 font-philosopher text-lg mb-8">
              Đăng ký ngay để trải nghiệm các tính năng AI độc đáo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-luxury-gold text-luxury-black px-8 py-3 rounded-lg font-philosopher font-bold uppercase tracking-wider hover:bg-luxury-gold-light transition-colors"
              >
                Đăng Ký Miễn Phí
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="border border-luxury-gray-400 text-luxury-gray-100 px-8 py-3 rounded-lg font-philosopher font-bold uppercase tracking-wider hover:border-luxury-gold hover:text-luxury-gold transition-colors"
              >
                Tìm Hiểu Thêm
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
