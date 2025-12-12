import PropTypes from 'prop-types';
import ConfirmModal from './ConfirmModal';
import { AlertTriangle } from 'lucide-react';
import RoleBadge from './RoleBadge';

/**
 * DeleteConfirmModal Component
 * Confirmation modal for deleting a user with warnings
 *
 * @param {Boolean} isOpen - Modal open state
 * @param {Function} onClose - Close callback
 * @param {Object} user - User to delete
 * @param {Function} onConfirm - Confirm callback
 * @param {Boolean} isLoading - Loading state
 */
const DeleteConfirmModal = ({ isOpen, onClose, user, onConfirm, isLoading = false }) => {
  if (!user) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Xóa người dùng"
      description="Bạn có chắc chắn muốn xóa người dùng này?"
      confirmText="Xóa người dùng"
      cancelText="Hủy"
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="danger"
    >
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-white/5 border border-luxury-gold/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-luxury-gold/20 flex items-center justify-center">
              <span className="text-luxury-gold font-philosopher font-semibold text-lg">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            {/* Name and Email */}
            <div className="flex-1">
              <p className="text-white font-philosopher font-semibold">
                {user.name}
              </p>
              <p className="text-luxury-gray-200 text-sm font-philosopher">
                {user.email}
              </p>
            </div>
            {/* Role Badge */}
            <RoleBadge role={user.role} size="sm" />
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-philosopher font-semibold mb-2">
                Cảnh báo: Hành động này không thể hoàn tác!
              </p>
              <ul className="text-red-200 font-philosopher text-sm space-y-1 list-disc list-inside">
                <li>Tài khoản người dùng sẽ bị xóa vĩnh viễn</li>
                <li>Tất cả dữ liệu liên quan sẽ bị mất</li>
                <li>Người dùng sẽ không thể đăng nhập lại</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Warning for Admin */}
        {user.role === 'admin' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-philosopher font-semibold mb-1">
                  Đang xóa tài khoản quản trị viên
                </p>
                <p className="text-yellow-200 font-philosopher text-sm">
                  Hãy đảm bảo có ít nhất một quản trị viên khác trước khi xóa.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Text */}
        <p className="text-luxury-gray-100 font-philosopher text-sm text-center">
          Nhấn <strong className="text-red-400">Xóa người dùng</strong> để xác nhận
        </p>
      </div>
    </ConfirmModal>
  );
};

DeleteConfirmModal.propTypes = {
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

export default DeleteConfirmModal;
