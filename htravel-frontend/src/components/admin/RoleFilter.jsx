import PropTypes from 'prop-types';
import { Filter } from 'lucide-react';

/**
 * RoleFilter Component
 * Filter dropdown for user roles
 *
 * @param {string} value - Currently selected role ('all', 'admin', 'user')
 * @param {function} onChange - Callback when role filter changes
 */
const RoleFilter = ({ value = 'all', onChange }) => {
  const options = [
    { value: 'all', label: 'Tất cả vai trò' },
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'user', label: 'Người dùng' },
  ];

  return (
    <div className="relative">
      {/* Filter Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gray-200 pointer-events-none">
        <Filter className="w-5 h-5" />
      </div>

      {/* Select Dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-6 py-3 bg-white/5 border border-luxury-gold/30 rounded-lg text-white font-philosopher focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 focus:border-luxury-gold transition-all cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1.25rem',
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-luxury-black text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

RoleFilter.propTypes = {
  value: PropTypes.oneOf(['all', 'admin', 'user']),
  onChange: PropTypes.func.isRequired,
};

export default RoleFilter;
