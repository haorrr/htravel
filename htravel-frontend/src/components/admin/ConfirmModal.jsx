import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import GlassCard from '../common/GlassCard';

/**
 * ConfirmModal Component
 * Base modal for confirmation dialogs
 *
 * @param {Boolean} isOpen - Modal open state
 * @param {Function} onClose - Close callback
 * @param {String} title - Modal title
 * @param {String} description - Modal description
 * @param {ReactNode} children - Modal content
 * @param {String} confirmText - Confirm button text
 * @param {String} cancelText - Cancel button text
 * @param {Function} onConfirm - Confirm callback
 * @param {Boolean} isLoading - Loading state
 * @param {String} variant - Modal variant ('danger' or 'warning')
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  isLoading = false,
  variant = 'warning',
}) => {
  const modalRef = useRef(null);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      firstElement?.focus();
      document.addEventListener('keydown', handleTab);

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const variantStyles = {
    danger: {
      confirmBg: 'bg-red-500 hover:bg-red-600',
      confirmText: 'text-white',
    },
    warning: {
      confirmBg: 'bg-luxury-gold hover:bg-luxury-gold/90',
      confirmText: 'text-luxury-black',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onClose()}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3
                    id="modal-title"
                    className="text-xl font-playfair text-white font-semibold"
                  >
                    {title}
                  </h3>
                  {description && (
                    <p
                      id="modal-description"
                      className="text-luxury-gray-200 font-philosopher text-sm mt-2"
                    >
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-luxury-gray-200" />
                </button>
              </div>

              {/* Content */}
              {children && <div className="mb-6">{children}</div>}

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-luxury-gold/30 rounded-lg text-white font-philosopher transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-philosopher font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmBg} ${styles.confirmText}`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(['danger', 'warning']),
};

export default ConfirmModal;
