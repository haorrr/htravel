import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users as UsersIcon } from 'lucide-react';
import {
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
} from '../../hooks';
import SearchBar from '../../components/admin/SearchBar';
import RoleFilter from '../../components/admin/RoleFilter';
import UserTable from '../../components/admin/UserTable';
import Pagination from '../../components/admin/Pagination';
import RoleChangeModal from '../../components/admin/RoleChangeModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

/**
 * Users Management Page (Admin)
 * Manage users with search, filters, role assignment, and deletion
 */
const AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state sync
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page')) || 1
  );

  // Modal states
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // Sync URL params with state
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
    if (currentPage > 1) params.page = currentPage.toString();

    setSearchParams(params, { replace: true });
  }, [search, roleFilter, currentPage, setSearchParams]);

  // Fetch users with current filters
  const queryParams = {
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    page: currentPage,
    limit: 20,
  };

  const {
    data,
    isLoading,
    error,
  } = useAdminUsers(queryParams);

  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  // Handlers
  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (user) => {
    setRoleChangeUser(user);
  };

  const handleRoleChangeConfirm = async (newRole) => {
    if (!roleChangeUser) return;

    try {
      await updateRoleMutation.mutateAsync({
        userId: roleChangeUser.id,
        role: newRole,
      });
      setRoleChangeUser(null);
    } catch (error) {
      // Error handled by mutation
      console.error('Role change failed:', error);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;

    try {
      await deleteMutation.mutateAsync(deleteUser.id);
      setDeleteUser(null);

      // If current page becomes empty after deletion, go to previous page
      if (data?.data?.users?.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      // Error handled by mutation
      console.error('Delete failed:', error);
    }
  };

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <UsersIcon className="w-8 h-8 text-luxury-gold" />
          <h1 className="text-4xl font-playfair text-white">
            Quản lý <span className="text-luxury-gold">Người dùng</span>
          </h1>
        </div>
        <p className="text-luxury-gray-100 font-philosopher">
          Tìm kiếm, phân vai trò và quản lý tài khoản người dùng
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Bar (2 columns on desktop) */}
        <div className="md:col-span-2">
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>

        {/* Role Filter (1 column on desktop) */}
        <div>
          <RoleFilter value={roleFilter} onChange={handleRoleFilterChange} />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-200 font-philosopher">
            ❌ Lỗi tải danh sách người dùng: {error.message}
          </p>
        </div>
      )}

      {/* User Table */}
      <div className="mb-6">
        <UserTable
          users={users}
          isLoading={isLoading}
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={!!roleChangeUser}
        onClose={() => setRoleChangeUser(null)}
        user={roleChangeUser}
        onConfirm={handleRoleChangeConfirm}
        isLoading={updateRoleMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        user={deleteUser}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminUsers;
