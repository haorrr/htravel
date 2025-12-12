import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { motion } from 'framer-motion';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';

/**
 * Rich Markdown Editor Component
 * Wraps @uiw/react-md-editor with luxury dark theme and preview controls
 *
 * @param {Object} props
 * @param {string} props.value - Markdown content
 * @param {Function} props.onChange - Change handler (value) => void
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.minHeight - Minimum editor height in pixels
 * @param {boolean} props.showHelp - Show markdown syntax help
 * @param {string} props.error - Error message to display
 */
export default function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Viết nội dung bài viết của bạn bằng Markdown...',
  minHeight = 400,
  showHelp = true,
  error,
}) {
  const [previewMode, setPreviewMode] = useState('edit'); // 'edit', 'live', 'preview'
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);

  const handleChange = (val) => {
    onChange?.(val || '');
  };

  const togglePreview = () => {
    const modes = ['edit', 'live', 'preview'];
    const currentIndex = modes.indexOf(previewMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setPreviewMode(nextMode);
  };

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePreview}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-gray-800/50"
          >
            {previewMode === 'edit' && (
              <>
                <Eye className="w-4 h-4" />
                <span>Chỉ chỉnh sửa</span>
              </>
            )}
            {previewMode === 'live' && (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Chỉnh sửa & xem trước</span>
              </>
            )}
            {previewMode === 'preview' && (
              <>
                <Eye className="w-4 h-4" />
                <span>Chỉ xem trước</span>
              </>
            )}
          </button>

          {showHelp && (
            <button
              type="button"
              onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Trợ giúp Markdown</span>
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          {value.length} ký tự
        </div>
      </div>

      {/* Markdown Syntax Help */}
      {showSyntaxHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
        >
          <h4 className="text-sm font-medium text-[#D4AF37] mb-3">
            Cú pháp Markdown
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div>
                <code className="text-gray-400"># Tiêu đề 1</code>
                <p className="text-gray-500">Tiêu đề cấp 1</p>
              </div>
              <div>
                <code className="text-gray-400">**in đậm**</code>
                <p className="text-gray-500">Văn bản in đậm</p>
              </div>
              <div>
                <code className="text-gray-400">*in nghiêng*</code>
                <p className="text-gray-500">Văn bản in nghiêng</p>
              </div>
              <div>
                <code className="text-gray-400">[link](url)</code>
                <p className="text-gray-500">Tạo liên kết</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <code className="text-gray-400">- Mục danh sách</code>
                <p className="text-gray-500">Danh sách không thứ tự</p>
              </div>
              <div>
                <code className="text-gray-400">1. Mục danh sách</code>
                <p className="text-gray-500">Danh sách có thứ tự</p>
              </div>
              <div>
                <code className="text-gray-400">![alt](url)</code>
                <p className="text-gray-500">Chèn hình ảnh</p>
              </div>
              <div>
                <code className="text-gray-400">`code`</code>
                <p className="text-gray-500">Inline code</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Editor */}
      <div
        data-color-mode="dark"
        className="markdown-editor-wrapper"
        style={{ minHeight }}
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          preview={previewMode}
          height={minHeight}
          visibleDragbar={false}
          textareaProps={{
            placeholder,
          }}
          previewOptions={{
            className: 'markdown-preview',
          }}
        />
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

      {/* Custom Styles */}
      <style jsx global>{`
        .markdown-editor-wrapper {
          --md-editor-bg: #0a0a0a;
          --md-editor-border: #1a1a1a;
          --md-editor-text: #e5e5e5;
          --md-editor-toolbar-bg: #141414;
          --md-editor-toolbar-hover: #D4AF37;
        }

        .w-md-editor {
          background-color: var(--md-editor-bg) !important;
          border: 1px solid var(--md-editor-border) !important;
          border-radius: 0.5rem !important;
          color: var(--md-editor-text) !important;
          box-shadow: none !important;
        }

        .w-md-editor-toolbar {
          background-color: var(--md-editor-toolbar-bg) !important;
          border-bottom: 1px solid var(--md-editor-border) !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
          padding: 8px !important;
        }

        .w-md-editor-toolbar button,
        .w-md-editor-toolbar-divider {
          color: #9ca3af !important;
          border-color: var(--md-editor-border) !important;
        }

        .w-md-editor-toolbar button:hover {
          color: var(--md-editor-toolbar-hover) !important;
          background-color: rgba(212, 175, 55, 0.1) !important;
        }

        .w-md-editor-toolbar button[data-active="true"] {
          color: var(--md-editor-toolbar-hover) !important;
        }

        .w-md-editor-text-pre,
        .w-md-editor-text-input {
          background-color: var(--md-editor-bg) !important;
          color: var(--md-editor-text) !important;
          font-family: 'Fira Code', 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }

        .w-md-editor-text-pre::placeholder,
        .w-md-editor-text-input::placeholder {
          color: #6b7280 !important;
        }

        /* Preview Styles */
        .markdown-preview {
          background-color: var(--md-editor-bg) !important;
          color: var(--md-editor-text) !important;
          padding: 16px !important;
        }

        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          color: #D4AF37 !important;
          margin-top: 24px !important;
          margin-bottom: 16px !important;
          font-weight: 600 !important;
          border-bottom: 1px solid #1a1a1a !important;
          padding-bottom: 8px !important;
        }

        .markdown-preview h1 {
          font-size: 2em !important;
        }

        .markdown-preview h2 {
          font-size: 1.5em !important;
        }

        .markdown-preview h3 {
          font-size: 1.25em !important;
        }

        .markdown-preview a {
          color: #D4AF37 !important;
          text-decoration: none !important;
          border-bottom: 1px solid transparent !important;
          transition: border-color 0.2s !important;
        }

        .markdown-preview a:hover {
          border-bottom-color: #D4AF37 !important;
        }

        .markdown-preview code {
          background-color: #1a1a1a !important;
          color: #D4AF37 !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-family: 'Fira Code', 'Courier New', monospace !important;
          font-size: 0.9em !important;
        }

        .markdown-preview pre {
          background-color: #1a1a1a !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 8px !important;
          padding: 16px !important;
          overflow-x: auto !important;
        }

        .markdown-preview pre code {
          background-color: transparent !important;
          padding: 0 !important;
          color: #e5e5e5 !important;
        }

        .markdown-preview blockquote {
          border-left: 4px solid #D4AF37 !important;
          padding-left: 16px !important;
          margin-left: 0 !important;
          color: #9ca3af !important;
          font-style: italic !important;
        }

        .markdown-preview ul,
        .markdown-preview ol {
          padding-left: 24px !important;
          margin: 16px 0 !important;
        }

        .markdown-preview li {
          margin: 8px 0 !important;
        }

        .markdown-preview img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px !important;
          margin: 16px 0 !important;
        }

        .markdown-preview table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 16px 0 !important;
        }

        .markdown-preview table th,
        .markdown-preview table td {
          border: 1px solid #2a2a2a !important;
          padding: 8px 12px !important;
          text-align: left !important;
        }

        .markdown-preview table th {
          background-color: #1a1a1a !important;
          color: #D4AF37 !important;
          font-weight: 600 !important;
        }

        .markdown-preview hr {
          border: none !important;
          border-top: 1px solid #2a2a2a !important;
          margin: 24px 0 !important;
        }

        /* Scrollbar Styling */
        .w-md-editor-text::-webkit-scrollbar,
        .markdown-preview::-webkit-scrollbar {
          width: 8px !important;
          height: 8px !important;
        }

        .w-md-editor-text::-webkit-scrollbar-track,
        .markdown-preview::-webkit-scrollbar-track {
          background: #0a0a0a !important;
        }

        .w-md-editor-text::-webkit-scrollbar-thumb,
        .markdown-preview::-webkit-scrollbar-thumb {
          background: #2a2a2a !important;
          border-radius: 4px !important;
        }

        .w-md-editor-text::-webkit-scrollbar-thumb:hover,
        .markdown-preview::-webkit-scrollbar-thumb:hover {
          background: #D4AF37 !important;
        }
      `}</style>
    </div>
  );
}
