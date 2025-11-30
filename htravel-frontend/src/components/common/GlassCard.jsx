import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? {
        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.2)'
      } : {}}
      className={`
        glass-effect rounded-lg p-6 transition-all duration-300
        ${hover ? 'hover:bg-white/15 hover:border-white/30' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
};
