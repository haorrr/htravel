import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, forwardRef } from 'react'; // 1. Import forwardRef

// 2. Bọc component trong forwardRef
const LuxuryInput = forwardRef(({
  label,
  error,
  className = '',
  // Lấy các props riêng, còn lại đẩy vào ...props
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div className={`relative ${className}`}>
      {label && (
        <label className="block text-luxury-gray-100 text-sm font-philosopher uppercase tracking-wider mb-2">
          {label} {props.required && <span className="text-luxury-gold">*</span>}
        </label>
      )}
      
      <input
        // 3. QUAN TRỌNG NHẤT: Gắn ref nhận được vào đây
        ref={ref}
        
        // 4. Rải toàn bộ props từ react-hook-form (onChange, onBlur, name...) vào đây
        {...props}

        // Xử lý focus (giữ nguyên logic cũ nhưng gộp với onFocus/onBlur nếu có từ bên ngoài)
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur && props.onBlur(e);
        }}

        className="w-full bg-transparent border-b-2 border-luxury-gray-400 text-white
                  placeholder-luxury-gray-200 focus:outline-none
                  px-0 py-3 transition-colors duration-300
                  focus:border-luxury-gold"
      />

      {/* Đường kẻ animation */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold origin-left"
        transition={{ duration: 0.3 }}
      />

      {/* Hiển thị lỗi */}
      {error && (
        <p className="text-red-400 text-sm mt-1 font-philosopher">{error}</p>
      )}
    </motion.div>
  );
});

// Thêm displayName để dễ debug trong React DevTools
LuxuryInput.displayName = 'LuxuryInput';

LuxuryInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  // Các props khác sẽ được tự động check, không cần khai báo quá chi tiết
};

export default LuxuryInput;