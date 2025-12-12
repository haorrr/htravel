import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  X,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';

const CategoryManagement = () => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [parentForNew, setParentForNew] = useState(null);

  // Fetch categories with hierarchy
  const { data, isLoading, isError } = useCategories({ hierarchy: true });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

const categories = Array.isArray(data?.data) ? data.data : (data?.data?.categories || []);

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleOpenCreate = (parent = null) => {
    setEditingCategory(null);
    setParentForNew(parent);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setParentForNew(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setParentForNew(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory.mutateAsync(id);
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
            Quản lý <span className="text-[#D4AF37]">Danh mục</span>
          </h1>
          <p className="text-gray-400 font-philosopher">
            Tổ chức và quản lý danh mục nội dung (Tối đa 2 cấp)
          </p>
        </div>
        <button
          onClick={() => handleOpenCreate()}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#B4941F] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo danh mục gốc</span>
        </button>
      </div>

      {/* Categories Tree */}
      <GlassCard className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-red-400">
            Không thể tải danh sách danh mục
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-philosopher mb-4">
              Chưa có danh mục nào
            </p>
            <button
              onClick={() => handleOpenCreate()}
              className="text-[#D4AF37] hover:text-[#B4941F] transition-colors"
            >
              Tạo danh mục đầu tiên
            </button>
          </div>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                expandedCategories={expandedCategories}
                onToggleExpand={toggleExpand}
                onEdit={handleOpenEdit}
                onDelete={setDeleteConfirm}
                onAddChild={handleOpenCreate}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Create/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        category={editingCategory}
        parentCategory={parentForNew}
        categories={categories}
        onClose={handleCloseModal}
        onCreate={createCategory.mutateAsync}
        onUpdate={updateCategory.mutateAsync}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        category={deleteConfirm}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        isDeleting={deleteCategory.isPending}
      />
    </div>
  );
};

// Category Node Component (Recursive Tree Item)
function CategoryNode({
  category,
  expandedCategories,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const isRoot = !category.parentId;

  return (
    <div>
      {/* Category Item */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors group"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(category.id)}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-7" />
          )}

          {/* Icon */}
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <Folder className="w-5 h-5 text-gray-400" />
            )
          ) : (
            <div className="w-2 h-2 bg-gray-600 rounded-full ml-1.5" />
          )}

          {/* Name & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">
                {category.name}
              </h3>
              {isRoot && (
                <span className="px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-xs text-[#D4AF37]">
                  Gốc
                </span>
              )}
              {category.articleCount !== undefined && (
                <span className="text-sm text-gray-500">
                  {category.articleCount} bài viết
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-400 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isRoot && (
            <button
              onClick={() => onAddChild(category)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
              title="Thêm danh mục con"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm con</span>
            </button>
          )}
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-800 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-12 mt-2 space-y-2"
          >
            {category.children.map((child) => (
              <CategoryNode
                key={child.id}
                category={child}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  isOpen,
  category,
  parentCategory,
  categories,
  onClose,
  onCreate,
  onUpdate,
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentId: category.parentId || null,
      });
    } else if (parentCategory) {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: parentCategory.id,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: null,
      });
    }
    setErrors({});
  }, [category, parentCategory, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục không được để trống';
    }

    // If editing and changing parent, validate it's not becoming its own child
    if (category && formData.parentId === category.id) {
      newErrors.parentId = 'Danh mục không thể là cha của chính nó';
    }

    // If editing a parent category, ensure it's not being made a child
    if (category && category.children && category.children.length > 0 && formData.parentId) {
      newErrors.parentId = 'Danh mục có danh mục con không thể trở thành danh mục con';
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
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
        parentId: formData.parentId || undefined,
      };

      if (category) {
        await onUpdate({ id: category.id, data: payload });
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

  // Get available parent options (root categories only)
  const availableParents = categories.filter((cat) => {
    // Exclude self when editing
    if (category && cat.id === category.id) return false;
    // Exclude children when editing
    if (category && cat.parentId === category.id) return false;
    return true;
  });

  if (!isOpen) return null;

  const isCreatingChild = !!parentCategory;
  const isEditingRoot = category && !category.parentId;
  const isEditingChild = category && category.parentId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-2xl font-playfair text-white">
            {category
              ? 'Chỉnh sửa danh mục'
              : isCreatingChild
              ? `Tạo danh mục con cho "${parentCategory.name}"`
              : 'Tạo danh mục gốc'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên danh mục <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên danh mục..."
              className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none transition-colors ${
                errors.name
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-gray-800 focus:border-[#D4AF37]'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Auto-generated from name"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              Để trống để tự động tạo từ tên danh mục
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả chi tiết về danh mục..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-200 placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Parent Selection (only for root categories when editing) */}
          {!isCreatingChild && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Danh mục cha (Tùy chọn)
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                disabled={isEditingRoot && category?.children?.length > 0}
                className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-gray-200 focus:outline-none transition-colors ${
                  errors.parentId
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-gray-800 focus:border-[#D4AF37]'
                } ${
                  isEditingRoot && category?.children?.length > 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <option value="">Không có (Danh mục gốc)</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="mt-1 text-sm text-red-400">{errors.parentId}</p>
              )}
              {isEditingRoot && category?.children?.length > 0 && (
                <div className="mt-2 flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-400">
                    Danh mục này có {category.children.length} danh mục con, không
                    thể chuyển thành danh mục con
                  </p>
                </div>
              )}
            </div>
          )}

          {isCreatingChild && (
            <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
              <p className="text-sm text-[#D4AF37]">
                Danh mục này sẽ được tạo dưới "
                <strong>{parentCategory.name}</strong>"
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black rounded-lg font-medium hover:bg-[#B4941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{category ? 'Cập nhật' : 'Tạo danh mục'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({ isOpen, category, onConfirm, onCancel, isDeleting }) {
  if (!isOpen || !category) return null;

  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-2">
          Xác nhận xóa danh mục
        </h3>

        {hasChildren ? (
          <div>
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium mb-1">
                    Không thể xóa danh mục này
                  </p>
                  <p className="text-sm text-red-300">
                    Danh mục "<strong>{category.name}</strong>" có{' '}
                    {category.children.length} danh mục con. Vui lòng xóa các danh
                    mục con trước.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-6">
              Bạn có chắc chắn muốn xóa danh mục "
              <strong className="text-white">{category.name}</strong>"? Hành động
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
                <span>Xóa danh mục</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default CategoryManagement;
