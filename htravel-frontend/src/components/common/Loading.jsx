import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Loading component with spinner
 * @param {boolean} fullScreen - If true, takes full screen height
 * @param {string} message - Optional loading message
 * @param {string} size - Size of spinner: 'sm', 'md', 'lg'
 */
export default function Loading({ fullScreen = false, message = 'Đang tải...', size = 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerClasses = fullScreen
    ? 'min-h-screen bg-luxury-black flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className={`animate-spin rounded-full border-b-2 border-luxury-gold mx-auto mb-4 ${sizeClasses[size]}`} />
        {message && (
          <p className="text-luxury-gray-100 font-philosopher">{message}</p>
        )}
      </motion.div>
    </div>
  );
}

Loading.propTypes = {
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};
