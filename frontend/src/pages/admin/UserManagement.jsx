import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Building
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAdminStore } from '../../stores/useAdminStore';
import useAuthStore from '../../stores/useAuthStore';

/**
 * UserManagement Component
 * User management dashboard for administrators
 */
const UserManagement = () => {
  const { user: currentUser, permissions, roles } = useAuthStore();
  const {
    users,
    roles: availableRoles,
    isLoading,
    error,
    pagination,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    assignRoleToUser,
    removeRoleFromUser,
    fetchRoles,
    clearError,
  } = useAdminStore();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Check permissions
  const canManageUsers = permissions?.includes('admin:manage_users') || 
                        roles?.includes('super_admin') || 
                        roles?.includes('admin');

  // Load initial data
  useEffect(() => {
    if (canManageUsers) {
      loadData();
    }
  }, [canManageUsers]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchUsers({ page: 1, limit: 20 }),
        fetchRoles(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Search and filter
  const handleSearch = async () => {
    try {
      await fetchUsers({
        page: 1,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter,
        roleId: roleFilter,
      });
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleFilterChange = async (filterType, value) => {
    try {
      if (filterType === 'status') setStatusFilter(value);
      if (filterType === 'role') setRoleFilter(value);
      
      await fetchUsers({
        page: 1,
        limit: pagination.limit,
        search: searchTerm,
        status: filterType === 'status' ? value : statusFilter,
        roleId: filterType === 'role' ? value : roleFilter,
      });
    } catch (error) {
      console.error('Error filtering users:', error);
    }
  };

  // User actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      await updateUserStatus(userId, !currentStatus);
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setActionLoading(true);
      await deleteUser(userId);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      setActionLoading(true);
      await assignRoleToUser(userId, roleId);
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      setActionLoading(true);
      await removeRoleFromUser(userId, roleId);
    } catch (error) {
      console.error('Error removing role:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Format user data
  const formatUserData = (user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    roles: user.roles?.map(ur => ur.role?.name).join(', ') || 'No roles',
    status: user.isActive ? 'Active' : 'Inactive',
    lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
    employeeInfo: user.employee ? {
      department: user.employee.department?.name || 'N/A',
      jobTitle: user.employee.jobTitle || 'N/A',
    } : null,
    createdAt: new Date(user.createdAt).toLocaleDateString(),
  });

  if (!canManageUsers) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">
          You don't have permission to manage users. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <Button size="sm" variant="outline" onClick={clearError} className="mt-2">
                Dismiss
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            System Users ({pagination.total})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 mx-auto text-gray-400 animate-spin mb-4" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter || roleFilter 
                ? 'Try adjusting your search criteria'
                : 'No users have been created yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const userData = formatUserData(user);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {userData.email}
                            </div>
                            {userData.employeeInfo && (
                              <div className="text-xs text-gray-400 flex items-center mt-1">
                                <Building className="h-3 w-3 mr-1" />
                                {userData.employeeInfo.department} • {userData.employeeInfo.jobTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {userData.roles}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {userData.lastLogin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            disabled={actionLoading}
                            className={user.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            disabled={user.id === currentUser?.id} // Prevent self-deletion
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => fetchUsers({ 
                page: pagination.page - 1, 
                limit: pagination.limit,
                search: searchTerm,
                status: statusFilter,
                roleId: roleFilter,
              })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasMore}
              onClick={() => fetchUsers({ 
                page: pagination.page + 1, 
                limit: pagination.limit,
                search: searchTerm,
                status: statusFilter,
                roleId: roleFilter,
              })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Roles</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedUser.roles?.map((userRole) => (
                  <span
                    key={userRole.id}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {userRole.role?.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserModal(false);
                  setShowRoleModal(true);
                }}
              >
                Manage Roles
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Role Management Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedUser(null);
        }}
        title="Manage User Roles"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Managing roles for: {selectedUser.firstName} {selectedUser.lastName}
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Roles</label>
              <div className="space-y-2">
                {selectedUser.roles?.map((userRole) => (
                  <div key={userRole.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{userRole.role?.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveRole(selectedUser.id, userRole.roleId)}
                      disabled={actionLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Roles</label>
              <div className="space-y-2">
                {availableRoles
                  .filter(role => !selectedUser.roles?.some(ur => ur.roleId === role.id))
                  .map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{role.name}</span>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignRole(selectedUser.id, role.id)}
                        disabled={actionLoading}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRoleModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Delete User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>?
              This action cannot be undone.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This will permanently delete the user account and all associated data.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeleteUser(selectedUser.id)}
                disabled={actionLoading}
                className="text-red-600 hover:text-red-700"
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default UserManagement;
