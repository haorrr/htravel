import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function LuxuryButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) {
  const sizeClasses = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light',
    secondary: 'bg-luxury-darker text-luxury-gold border border-luxury-gold hover:bg-luxury-dark',
    outline: 'border border-luxury-gray-400 text-luxury-gray-100 hover:border-luxury-gold hover:text-luxury-gold'
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        font-philosopher font-bold uppercase tracking-wider
        rounded-lg transition-all duration-300
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

LuxuryButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};
