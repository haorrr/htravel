import PropTypes from 'prop-types';
import { Shield, User } from 'lucide-react';

/**
 * RoleBadge Component
 * Visual badge displaying user role with icon
 *
 * @param {string} role - User role ('admin' or 'user')
 * @param {string} size - Badge size ('sm' or 'md')
 */
const RoleBadge = ({ role, size = 'md' }) => {
  const isAdmin = role === 'admin';

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    },
  };

  const Icon = isAdmin ? Shield : User;
  const classes = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-philosopher font-semibold ${classes.badge} ${
        isAdmin
          ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30'
          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      }`}
    >
      <Icon className={classes.icon} />
      {isAdmin ? 'Quản trị viên' : 'Người dùng'}
    </span>
  );
};

RoleBadge.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
};

export default RoleBadge;
