import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ConfirmModal from './ConfirmModal';
import RoleBadge from './RoleBadge';
import { Shield, User } from 'lucide-react';

/**
 * RoleChangeModal Component
 * Modal for changing user role with role selection
 *
 * @param {Boolean} isOpen - Modal open state
 * @param {Function} onClose - Close callback
 * @param {Object} user - User to change role
 * @param {Function} onConfirm - Confirm callback with new role
 * @param {Boolean} isLoading - Loading state
 */
const RoleChangeModal = ({ isOpen, onClose, user, onConfirm, isLoading = false }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'user');

  // Reset selected role when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  if (!user) return null;

  const newRole = selectedRole === 'admin' ? 'user' : 'admin';
  const isRoleChanged = selectedRole !== user.role;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thay đổi vai trò"
      description={`Bạn đang thay đổi vai trò của ${user.name}`}
      confirmText={isRoleChanged ? 'Xác nhận thay đổi' : 'Đóng'}
      cancelText="Hủy"
      onConfirm={isRoleChanged ? handleConfirm : onClose}
      isLoading={isLoading}
      variant="warning"
    >
      <div className="space-y-4">
        {/* Current Role */}
        <div>
          <p className="text-luxury-gray-200 font-philosopher text-sm mb-2">
            Vai trò hiện tại:
          </p>
          <RoleBadge role={user.role} size="md" />
        </div>

        {/* Role Selection */}
        <div>
          <p className="text-luxury-gray-200 font-philosopher text-sm mb-3">
            Chọn vai trò mới:
          </p>
          <div className="space-y-2">
            {/* Admin Option */}
            <button
              onClick={() => setSelectedRole('admin')}
              disabled={isLoading}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRole === 'admin'
                  ? 'border-luxury-gold bg-luxury-gold/10'
                  : 'border-luxury-gold/20 bg-white/5 hover:border-luxury-gold/40 hover:bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'admin'
                    ? 'border-luxury-gold'
                    : 'border-luxury-gray-200'
                }`}
              >
                {selectedRole === 'admin' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-luxury-gold"></div>
                )}
              </div>
              <Shield className="w-5 h-5 text-luxury-gold" />
              <div className="flex-1 text-left">
                <p className="text-white font-philosopher font-semibold">
                  Quản trị viên
                </p>
                <p className="text-luxury-gray-200 text-xs font-philosopher mt-0.5">
                  Toàn quyền quản lý hệ thống
                </p>
              </div>
            </button>

            {/* User Option */}
            <button
              onClick={() => setSelectedRole('user')}
              disabled={isLoading}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRole === 'user'
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-blue-500/20 bg-white/5 hover:border-blue-500/40 hover:bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === 'user' ? 'border-blue-400' : 'border-luxury-gray-200'
                }`}
              >
                {selectedRole === 'user' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                )}
              </div>
              <User className="w-5 h-5 text-blue-400" />
              <div className="flex-1 text-left">
                <p className="text-white font-philosopher font-semibold">
                  Người dùng
                </p>
                <p className="text-luxury-gray-200 text-xs font-philosopher mt-0.5">
                  Quyền sử dụng cơ bản
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Warning */}
        {isRoleChanged && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-200 font-philosopher text-sm">
              ⚠️ {user.name} sẽ{' '}
              {selectedRole === 'admin'
                ? 'có toàn quyền quản lý hệ thống'
                : 'mất quyền quản trị viên'}
            </p>
          </div>
        )}
      </div>
    </ConfirmModal>
  );
};

RoleChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default RoleChangeModal;
