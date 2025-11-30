import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import api from '../services/api';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/api/articles/${id}`);
      setArticle(response.data.data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Không thể tải bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'du-lich': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'am-thuc': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      'van-hoa': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'kinh-nghiem': 'bg-green-500/20 text-green-300 border-green-500/50',
      'dia-danh': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
    };
    return colors[category] || 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/50';
  };

  const getCategoryName = (category) => {
    const names = {
      'du-lich': 'Du lịch',
      'am-thuc': 'Ẩm thực',
      'van-hoa': 'Văn hóa',
      'kinh-nghiem': 'Kinh nghiệm',
      'dia-danh': 'Địa danh'
    };
    return names[category] || category;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link vào clipboard');
    }
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

  if (error || !article) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-300 font-philosopher text-lg mb-6">{error || 'Bài viết không tồn tại'}</p>
          <LuxuryButton onClick={() => navigate('/blog')}>
            <ArrowLeft size={16} className="mr-2" />
            Quay lại Blog
          </LuxuryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link to="/blog">
            <LuxuryButton variant="tertiary" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              Quay lại
            </LuxuryButton>
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Category */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-philosopher uppercase tracking-wider border ${getCategoryColor(article.category)}`}>
              <Tag size={14} />
              {getCategoryName(article.category)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-white mb-6">
            {article.title}
          </h1>

          {/* Summary */}
          {article.summary && (
            <p className="text-xl text-luxury-gray-100 font-philosopher mb-6">
              {article.summary}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-luxury-gray-200 font-philosopher">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(article.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-luxury-gold hover:text-luxury-gold-light transition-colors"
            >
              <Share2 size={18} />
              <span>Chia sẻ</span>
            </button>
          </div>
        </motion.div>

        {/* Featured Image */}
        {article.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-auto max-h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard className="p-8 md:p-12">
            <div
              className="prose prose-invert prose-lg max-w-none
                         prose-headings:font-playfair prose-headings:text-white
                         prose-p:font-philosopher prose-p:text-luxury-gray-100 prose-p:leading-relaxed
                         prose-a:text-luxury-gold prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-white
                         prose-ul:font-philosopher prose-ul:text-luxury-gray-100
                         prose-ol:font-philosopher prose-ol:text-luxury-gray-100
                         prose-blockquote:border-l-luxury-gold prose-blockquote:text-luxury-gray-100
                         prose-code:text-luxury-gold prose-code:bg-luxury-darker
                         prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </GlassCard>
        </motion.div>

        {/* Share CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <GlassCard className="p-8">
            <h3 className="text-2xl font-playfair text-white mb-4">
              Bạn thích bài viết này?
            </h3>
            <p className="text-luxury-gray-100 font-philosopher mb-6">
              Chia sẻ với bạn bè để cùng khám phá Việt Nam
            </p>
            <LuxuryButton variant="primary" onClick={handleShare}>
              <Share2 size={20} className="mr-2" />
              Chia sẻ bài viết
            </LuxuryButton>
          </GlassCard>
        </motion.div>

        {/* Back to Blog */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Link to="/blog">
            <LuxuryButton variant="secondary">
              <ArrowLeft size={16} className="mr-2" />
              Xem thêm bài viết khác
            </LuxuryButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
