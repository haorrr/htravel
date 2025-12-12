import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, User, Tag, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import api from '../services/api';

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await api.get('/articles', { params });
      
      // --- SỬA ĐOẠN NÀY ---
      // Dữ liệu thực sự nằm trong .articles
      const articlesData = response.data.data?.articles || []; 
      setArticles(Array.isArray(articlesData) ? articlesData : []);

      // Lấy danh sách category từ bài viết để làm bộ lọc
      const uniqueCategories = Array.isArray(articlesData)
        ? [...new Set(articlesData.map(a => a.category?.slug || a.category).filter(Boolean))]
        : [];
      setCategories(uniqueCategories);
      // ---------------------

    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Không thể tải bài viết');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    // Nếu category là object thì lấy .slug, nếu là chuỗi thì giữ nguyên, không có thì rỗng
    const slug = category?.slug || category || '';
    
    const colors = {
      'du-lich': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'am-thuc': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      'van-hoa': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'kinh-nghiem': 'bg-green-500/20 text-green-300 border-green-500/50',
      'dia-danh': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
    };
    // Tìm theo slug, nếu không thấy thì trả về màu mặc định (Vàng)
    return colors[slug] || 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/50';
  };

  // Sửa lại hàm lấy tên: Lấy thuộc tính .name
  const getCategoryName = (category) => {
    // Nếu là object {id, name, slug} thì trả về name
    if (category && typeof category === 'object') {
      return category.name;
    }
    // Nếu là chuỗi thì map tay (cho dữ liệu cũ), hoặc trả về chính nó
    const names = {
      'du-lich': 'Du lịch',
      'am-thuc': 'Ẩm thực',
      'van-hoa': 'Văn hóa',
      'kinh-nghiem': 'Kinh nghiệm',
      'dia-danh': 'Địa danh'
    };
    return names[category] || category || 'Chưa phân loại';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-gray-100 font-philosopher">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">
            Blog <span className="text-luxury-gold">Du Lịch</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Khám phá những câu chuyện, kinh nghiệm và địa danh tuyệt vời trên khắp Việt Nam
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8"
          >
            <p className="text-red-300 font-philosopher text-center">{error}</p>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gray-200" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors font-philosopher"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors font-philosopher min-w-[200px]"
              >
                <option value="all">Tất cả chủ đề</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </GlassCard>
        </motion.div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-luxury-gray-100 font-philosopher text-lg">
              Không tìm thấy bài viết nào
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/blog/${article.id}`}>
                  <GlassCard className="h-full overflow-hidden hover:border-luxury-gold transition-colors">
                    {/* Featured Image */}
                    {article.imageUrl && (
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.7 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Category */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-philosopher uppercase tracking-wider border ${getCategoryColor(article.category)}`}>
                          <Tag size={12} />
                          {getCategoryName(article.category)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-playfair text-white mb-3 line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Summary */}
                      {article.summary && (
                        <p className="text-luxury-gray-100 font-philosopher text-sm mb-4 line-clamp-3">
                          {article.summary}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-luxury-gray-200 text-xs font-philosopher">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>Admin</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Read More */}
                      <div className="mt-4 flex items-center gap-2 text-luxury-gold text-sm font-philosopher group">
                        <span>Đọc thêm</span>
                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
