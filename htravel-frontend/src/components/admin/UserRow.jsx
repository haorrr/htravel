import PropTypes from 'prop-types';
import { MoreVertical, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleBadge from './RoleBadge';
import { useAuth } from '../../hooks';

/**
 * UserRow Component
 * Table row for a single user with actions
 *
 * @param {Object} user - User object
 * @param {Function} onRoleChange - Callback when role change is requested
 * @param {Function} onDelete - Callback when delete is requested
 */
const UserRow = ({ user, onRoleChange, onDelete }) => {
  const { user: currentUser } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  const isCurrentUser = currentUser?.id === user.id;
  const canChangeRole = !isCurrentUser;
  const canDelete = !isCurrentUser;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <tr className="border-b border-luxury-gold/10 hover:bg-white/5 transition-colors">
      {/* User Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center">
            <span className="text-luxury-gold font-philosopher font-semibold">
              {getInitials(user.name)}
            </span>
          </div>
          {/* Name and Email */}
          <div>
            <div className="text-white font-philosopher font-semibold">
              {user.name}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-luxury-gray-200">(Bạn)</span>
              )}
            </div>
            <div className="text-luxury-gray-200 text-sm font-philosopher">
              {user.email}
            </div>
          </div>
        </div>
      </td>

      {/* Role Badge */}
      <td className="px-6 py-4">
        <RoleBadge role={user.role} size="sm" />
      </td>

      {/* Join Date */}
      <td className="px-6 py-4">
        <span className="text-luxury-gray-100 font-philosopher text-sm">
          {formatDate(user.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="relative" ref={actionsRef}>
          {/* Actions Button */}
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="User actions"
          >
            <MoreVertical className="w-5 h-5 text-luxury-gray-200" />
          </button>

          {/* Actions Dropdown */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-luxury-black border border-luxury-gold/30 rounded-lg shadow-xl overflow-hidden z-10"
              >
                {/* Change Role */}
                <button
                  onClick={() => {
                    setShowActions(false);
                    onRoleChange(user);
                  }}
                  disabled={!canChangeRole}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    canChangeRole
                      ? 'hover:bg-white/10 text-white'
                      : 'opacity-50 cursor-not-allowed text-luxury-gray-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span className="font-philosopher text-sm">Đổi vai trò</span>
                </button>

                {/* Delete User */}
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete(user);
                  }}
                  disabled={!canDelete}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    canDelete
                      ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                      : 'opacity-50 cursor-not-allowed text-luxury-gray-200'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-philosopher text-sm">Xóa người dùng</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );
};

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onRoleChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;
