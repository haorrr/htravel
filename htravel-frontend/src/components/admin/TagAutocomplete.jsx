import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Hash, Loader2 } from 'lucide-react';
import { useTags, useCreateTag } from '../../hooks/useTags';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Tag Autocomplete Component
 * Create-on-type autocomplete input with multi-select chip display
 *
 * @param {Object} props
 * @param {Object[]} props.selectedTags - Array of selected tag objects [{id, name}, ...]
 * @param {Function} props.onChange - Change handler (tags) => void
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {number} props.maxTags - Maximum number of tags allowed
 */
export default function TagAutocomplete({
  selectedTags = [],
  onChange,
  placeholder = 'Thêm thẻ...',
  error,
  maxTags = 10,
}) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce search input
  const debouncedSearch = useDebounce(inputValue, 300);

  // Fetch matching tags
  const { data: tagsData, isLoading } = useTags(
    { search: debouncedSearch, limit: 20 },
    { enabled: debouncedSearch.length > 0 }
  );

  const createTag = useCreateTag();

  // Available suggestions (exclude already selected)
  const suggestions = (tagsData?.data?.tags || []).filter(
    (tag) => !selectedTags.find((t) => t.id === tag.id)
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0);
    setHighlightedIndex(0);
  };

  // Handle tag selection from dropdown
  const handleSelectTag = (tag) => {
    if (selectedTags.length >= maxTags) {
      return;
    }

    onChange?.([...selectedTags, tag]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle creating new tag
  const handleCreateTag = async (name) => {
    if (!name.trim() || selectedTags.length >= maxTags) {
      return;
    }

    try {
      const response = await createTag.mutateAsync({ name: name.trim() });
      const newTag = response.data;

      // Check if tag already selected
      if (!selectedTags.find((t) => t.id === newTag.id)) {
        onChange?.([...selectedTags, newTag]);
      }

      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to create tag:', err);
    }
  };

  // Handle removing tag
  const handleRemoveTag = (tagId) => {
    onChange?.(selectedTags.filter((t) => t.id !== tagId));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && inputValue.length === 0) {
      // Backspace on empty input - remove last tag
      if (e.key === 'Backspace' && selectedTags.length > 0) {
        onChange?.(selectedTags.slice(0, -1));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === 0 && inputValue.trim()) {
          // Create new tag
          handleCreateTag(inputValue.trim());
        } else if (suggestions[highlightedIndex - 1]) {
          // Select existing tag
          handleSelectTag(suggestions[highlightedIndex - 1]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setInputValue('');
        break;

      default:
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canAddMore = selectedTags.length < maxTags;

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <motion.div
              key={tag.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-sm text-[#D4AF37] group hover:bg-[#D4AF37]/20 transition-colors"
            >
              <Hash className="w-3 h-3" />
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="p-0.5 hover:bg-[#D4AF37]/30 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        <div
          className={`flex items-center gap-2 px-4 py-3 bg-gray-900/50 border rounded-lg transition-colors ${
            error
              ? 'border-red-500 focus-within:border-red-400'
              : 'border-gray-800 focus-within:border-[#D4AF37] hover:border-gray-700'
          } ${!canAddMore ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Hash className="w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length > 0 && setIsOpen(true)}
            placeholder={
              canAddMore
                ? placeholder
                : `Đã đạt giới hạn ${maxTags} thẻ`
            }
            disabled={!canAddMore}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 disabled:cursor-not-allowed"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
          )}
        </div>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {isOpen && inputValue.length > 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-h-64 overflow-y-auto"
            >
              {/* Create New Tag Option */}
              <button
                type="button"
                onClick={() => handleCreateTag(inputValue.trim())}
                disabled={!inputValue.trim() || createTag.isPending}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  highlightedIndex === 0
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-gray-300 hover:bg-gray-800/50'
                } ${
                  !inputValue.trim() || createTag.isPending
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="flex-1">
                  Tạo thẻ mới: <strong>"{inputValue.trim()}"</strong>
                </span>
              </button>

              {/* Divider */}
              {suggestions.length > 0 && (
                <div className="border-t border-gray-800" />
              )}

              {/* Existing Tags */}
              {suggestions.length > 0 ? (
                suggestions.map((tag, index) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      highlightedIndex === index + 1
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                        : 'text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="flex-1">{tag.name}</span>
                    {tag.articleCount !== undefined && (
                      <span className="text-xs text-gray-500">
                        {tag.articleCount} bài viết
                      </span>
                    )}
                  </button>
                ))
              ) : (
                !isLoading && (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    Không tìm thấy thẻ. Nhấn Enter để tạo mới.
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {selectedTags.length} / {maxTags} thẻ
        </span>
        {canAddMore && (
          <span className="text-gray-600">
            Nhấn Enter để tạo thẻ mới, ↑↓ để điều hướng
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
