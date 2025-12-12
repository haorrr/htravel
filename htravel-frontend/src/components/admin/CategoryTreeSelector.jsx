import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, FolderOpen, Folder, Loader2 } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

/**
 * Category Tree Selector Component
 * Multi-select dropdown with 2-level hierarchical category display
 *
 * @param {Object} props
 * @param {number[]} props.selectedIds - Array of selected category IDs
 * @param {Function} props.onChange - Change handler (ids) => void
 * @param {string} props.error - Error message to display
 * @param {boolean} props.required - Is this field required
 */
export default function CategoryTreeSelector({
  selectedIds = [],
  onChange,
  error,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const { data, isLoading, isError } = useCategories({ hierarchy: true });
  const categories = Array.isArray(data?.data) 
  ? data.data 
  : (data?.data?.categories || []);

  // Toggle category expansion
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

  // Toggle category selection
  const toggleSelect = (categoryId) => {
    if (selectedIds.includes(categoryId)) {
      onChange?.(selectedIds.filter((id) => id !== categoryId));
    } else {
      onChange?.([...selectedIds, categoryId]);
    }
  };

  // Get selected category names for display
  const getSelectedNames = () => {
    const names = [];
    categories.forEach((parent) => {
      if (selectedIds.includes(parent.id)) {
        names.push(parent.name);
      }
      parent.children?.forEach((child) => {
        if (selectedIds.includes(child.id)) {
          names.push(`${parent.name} › ${child.name}`);
        }
      });
    });
    return names;
  };

  const selectedNames = getSelectedNames();

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-left flex items-center justify-between transition-colors ${
          error
            ? 'border-red-500 focus:border-red-400'
            : 'border-gray-800 focus:border-[#D4AF37] hover:border-gray-700'
        } ${isOpen ? 'border-[#D4AF37]' : ''}`}
      >
        <div className="flex-1 min-w-0">
          {selectedNames.length === 0 ? (
            <span className="text-gray-500">
              Chọn danh mục{required ? ' *' : ''}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedNames.map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-sm text-[#D4AF37]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              </div>
            )}

            {isError && (
              <div className="px-4 py-8 text-center text-red-400">
                Không thể tải danh mục
              </div>
            )}

            {!isLoading && !isError && categories.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                Chưa có danh mục nào. Vui lòng tạo danh mục trước.
              </div>
            )}

            {!isLoading && !isError && categories.length > 0 && (
              <div className="py-2">
                {categories.map((parent) => (
                  <CategoryNode
                    key={parent.id}
                    category={parent}
                    level={0}
                    selectedIds={selectedIds}
                    expandedCategories={expandedCategories}
                    onToggleExpand={toggleExpand}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Category Node Component
 * Recursive component for displaying category tree
 */
function CategoryNode({
  category,
  level,
  selectedIds,
  expandedCategories,
  onToggleExpand,
  onToggleSelect,
}) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);
  const isSelected = selectedIds.includes(category.id);

  const indent = level * 24;

  return (
    <>
      {/* Parent/Child Category Item */}
      <div
        className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 cursor-pointer transition-colors ${
          isSelected ? 'bg-[#D4AF37]/10' : ''
        }`}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(category.id);
            }}
            className="p-0.5 hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox */}
        <label
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(category.id);
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-gray-900 cursor-pointer"
          />

          {/* Icon */}
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <Folder className="w-4 h-4 text-gray-400" />
            )
          ) : (
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
          )}

          {/* Name */}
          <span
            className={`text-sm ${
              isSelected
                ? 'text-[#D4AF37] font-medium'
                : level === 0
                ? 'text-gray-200'
                : 'text-gray-400'
            }`}
          >
            {category.name}
          </span>

          {/* Article Count (if available) */}
          {category.articleCount !== undefined && (
            <span className="text-xs text-gray-500 ml-auto">
              {category.articleCount}
            </span>
          )}
        </label>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {category.children.map((child) => (
              <CategoryNode
                key={child.id}
                category={child}
                level={level + 1}
                selectedIds={selectedIds}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
