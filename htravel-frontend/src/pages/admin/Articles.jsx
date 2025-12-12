import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  FileText,
  Search,
  Filter,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import CategoryTreeSelector from '../../components/admin/CategoryTreeSelector';
import TagAutocomplete from '../../components/admin/TagAutocomplete';
import {
  useArticles,
  useArticle,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from '../../hooks/useArticles';

const ArticleManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'draft', 'published'
  const [featuredFilter, setFeaturedFilter] = useState(''); // '', 'true', 'false'
  const [showFilters, setShowFilters] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch articles
  const {
    data: articlesData,
    isLoading,
    isError,
  } = useArticles({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
    isFeatured: featuredFilter || undefined,
  });

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const articlesArray = articlesData?.data?.articles || [];
  const articles = Array.isArray(articlesArray) ? articlesArray : [];
  const pagination = articlesData?.data?.pagination || {};

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteArticle.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-playfair text-white mb-2">
            Quản lý <span className="text-[#D4AF37]">Bài viết</span>
          </h1>
          <p className="text-gray-400 font-philosopher">
            Tạo, chỉnh sửa và quản lý nội dung bài viết
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#B4941F] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo bài viết mới</span>
        </button>
      </div>

      {/* Search & Filters */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-800 flex gap-4"
            >
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="draft">Nháp</option>
                  <option value="published">Đã xuất bản</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nổi bật
                </label>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Articles List */}
      <GlassCard className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-red-400">
            Không thể tải danh sách bài viết
          </div>
        )}

        {!isLoading && !isError && articles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-philosopher">
              Chưa có bài viết nào
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 text-[#D4AF37] hover:text-[#B4941F] transition-colors"
            >
              Tạo bài viết đầu tiên
            </button>
          </div>
        )}

        {!isLoading && !isError && articles.length > 0 && (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={() => handleOpenEdit(article)}
                onDelete={() => setDeleteConfirm(article)}
              />
            ))}

            {/* Pagination */}
            {pagination.totalPages && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-800">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === pageNum
                          ? 'bg-[#D4AF37] text-black'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Create/Edit Modal */}
      <ArticleModal
        isOpen={isModalOpen}
        article={editingArticle}
        onClose={handleCloseModal}
        onCreate={createArticle.mutateAsync}
        onUpdate={updateArticle.mutateAsync}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        article={deleteConfirm}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        isDeleting={deleteArticle.isPending}
      />
    </div>
  );
};

// Article Card Component
function ArticleCard({ article, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-medium text-white">
                  {article.title}
                </h3>
                {article.isFeatured && (
                  <Star className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" />
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    article.status === 'published'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}
                >
                  {article.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.viewCount || 0}
                </span>
                <span>
                  {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {Array.isArray(article.categories) && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-xs text-[#D4AF37]"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-800 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Article Modal Component
function ArticleModal({ isOpen, article, onClose, onCreate, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'draft',
    isFeatured: false,
    categoryIds: [],
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when article changes
  React.useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        slug: article.slug || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || '',
        status: article.status || 'draft',
        isFeatured: article.isFeatured || false,
        categoryIds: article.categories?.map((c) => c.id) || [],
        tags: article.tags || [],
      });
    } else {
      setFormData({
        title: '',
        content: '',
        slug: '',
        metaDescription: '',
        metaKeywords: '',
        status: 'draft',
        isFeatured: false,
        categoryIds: [],
        tags: [],
      });
    }
    setErrors({});
  }, [article, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = 'Vui lòng chọn ít nhất một danh mục';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        tagIds: formData.tags.map((t) => t.id),
      };

      if (article) {
        await onUpdate({ id: article.id, data: payload });
      } else {
        await onCreate(payload);
      }

      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-2xl font-playfair text-white">
            {article ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Nhập tiêu đề bài viết..."
              className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none transition-colors ${
                errors.title
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-gray-800 focus:border-[#D4AF37]'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Content (Markdown Editor) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nội dung <span className="text-red-400">*</span>
            </label>
            <MarkdownEditor
              value={formData.content}
              onChange={(val) => setFormData({ ...formData, content: val })}
              error={errors.content}
              minHeight={300}
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Danh mục <span className="text-red-400">*</span>
            </label>
            <CategoryTreeSelector
              selectedIds={formData.categoryIds}
              onChange={(ids) => setFormData({ ...formData, categoryIds: ids })}
              error={errors.categoryIds}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thẻ
            </label>
            <TagAutocomplete
              selectedTags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
            />
          </div>

          {/* SEO Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="Auto-generated from title"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
              >
                <option value="draft">Nháp</option>
                <option value="published">Xuất bản</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, metaDescription: e.target.value })
              }
              placeholder="Mô tả ngắn gọn cho SEO (tối đa 160 ký tự)..."
              rows={3}
              maxLength={160}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.metaDescription.length} / 160 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Keywords (SEO)
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) =>
                setFormData({ ...formData, metaKeywords: e.target.value })
              }
              placeholder="Từ khóa SEO, phân cách bằng dấu phẩy..."
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-gray-900 cursor-pointer"
            />
            <label
              htmlFor="isFeatured"
              className="text-sm text-gray-300 cursor-pointer flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Đánh dấu là bài viết nổi bật
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#B4941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{article ? 'Cập nhật' : 'Tạo bài viết'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, article, onConfirm, onCancel, isDeleting }) {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-2">
          Xác nhận xóa bài viết
        </h3>
        <p className="text-gray-400 mb-6">
          Bạn có chắc chắn muốn xóa bài viết "
          <strong className="text-white">{article.title}</strong>"? Hành động
          này không thể hoàn tác.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Xóa bài viết</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ArticleManagement;
