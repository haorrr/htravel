import PropTypes from 'prop-types';
import UserRow from './UserRow';
import { Users as UsersIcon } from 'lucide-react';

/**
 * UserTable Component
 * Table displaying list of users
 *
 * @param {Array} users - Array of user objects
 * @param {Boolean} isLoading - Loading state
 * @param {Function} onRoleChange - Callback when role change is requested
 * @param {Function} onDelete - Callback when delete is requested
 */
const UserTable = ({ users = [], isLoading, onRoleChange, onDelete }) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white/5 border border-luxury-gold/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-gold/20 bg-white/5">
                <th className="px-6 py-4 text-left">
                  <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                    Người dùng
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                    Vai trò
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                    Ngày tham gia
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                    Thao tác
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-luxury-gold/10">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                      <div>
                        <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-40 bg-white/10 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="bg-white/5 border border-luxury-gold/30 rounded-lg overflow-hidden">
        <div className="py-16 text-center">
          <UsersIcon className="w-16 h-16 text-luxury-gray-200 mx-auto mb-4" />
          <p className="text-luxury-gray-100 font-philosopher text-lg mb-2">
            Không tìm thấy người dùng nào
          </p>
          <p className="text-luxury-gray-200 font-philosopher text-sm">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      </div>
    );
  }

  // User table
  return (
    <div className="bg-white/5 border border-luxury-gold/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-luxury-gold/20 bg-white/5">
              <th className="px-6 py-4 text-left">
                <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                  Người dùng
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                  Vai trò
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                  Ngày tham gia
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-luxury-gray-100 font-philosopher font-semibold uppercase text-sm">
                  Thao tác
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onRoleChange={onRoleChange}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.oneOf(['admin', 'user']).isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ),
  isLoading: PropTypes.bool,
  onRoleChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserTable;
