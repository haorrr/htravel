import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SearchBar Component
 * Real-time search input with debouncing for user management
 *
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when search value changes (debounced)
 * @param {string} placeholder - Placeholder text
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Tìm kiếm theo tên hoặc email...',
  debounceMs = 500
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce onChange callback
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gray-200">
        <Search className="w-5 h-5" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-luxury-gold/30 rounded-lg text-white placeholder-luxury-gray-200 font-philosopher focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 focus:border-luxury-gold transition-all"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-gray-200 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
};

export default SearchBar;
