import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  Database, 
  Server, 
  Bell, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Lock,
  Key,
  UserCheck,
  UserX,
  Crown,
  Building,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAdminStore } from '../../stores/useAdminStore';
import useAuthStore from '../../stores/useAuthStore';
import useNotificationStore, { NOTIFICATION_TYPES } from '../../stores/useNotificationStore';

/**
 * AdminDashboard Component
 * Comprehensive admin dashboard with all administrative functions
 */
const AdminDashboard = () => {
  const { user: currentUser, permissions, roles } = useAuthStore();
  const {
    users,
    roles: availableRoles,
    permissions: availablePermissions,
    isLoading,
    error,
    pagination,
    fetchUsers,
    fetchRoles,
    fetchPermissions,
    updateUserStatus,
    deleteUser,
    assignRoleToUser,
    removeRoleFromUser,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    assignPermissionToRole,
    removePermissionFromRole,
    createDefaultRolesAndPermissions,
    cleanExpiredTokens,
    clearError
  } = useAdminStore();

  const { addSystemNotification } = useNotificationStore();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    systemHealth: 'healthy',
    lastBackup: null,
    uptime: '99.9%'
  });

  // Check permissions
  const canManageUsers = permissions?.includes('admin:manage_users') || 
                        roles?.includes('super_admin') || 
                        roles?.includes('admin');
  const canManageSystem = permissions?.includes('admin:manage_system') || 
                         roles?.includes('super_admin') || 
                         roles?.includes('admin');

  // Load initial data
  useEffect(() => {
    if (canManageUsers || canManageSystem) {
      loadAllData();
    }
  }, [canManageUsers, canManageSystem]);

  const loadAllData = async () => {
    try {
      const promises = [];
      
      if (canManageUsers) {
        promises.push(
          fetchUsers({ page: 1, limit: 20 }),
          fetchRoles(),
          fetchPermissions()
        );
      }

      await Promise.all(promises);
      updateSystemMetrics();
    } catch (error) {
      console.error('Error loading admin data:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Admin Data Load Error',
        message: 'Failed to load admin dashboard data',
        priority: 'high'
      });
    }
  };

  const updateSystemMetrics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const totalRoles = availableRoles.length;
    const totalPermissions = availablePermissions.length;

    setSystemMetrics(prev => ({
      ...prev,
      totalUsers,
      activeUsers,
      totalRoles,
      totalPermissions
    }));
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor }
  ];

  // User actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      await updateUserStatus(userId, !currentStatus);
      addSystemNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'User Status Updated',
        message: `User status changed to ${!currentStatus ? 'active' : 'inactive'}`,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'User Status Update Failed',
        message: 'Failed to update user status',
        priority: 'high'
      });
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
      addSystemNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'User Deleted',
        message: 'User has been successfully deleted',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'User Deletion Failed',
        message: 'Failed to delete user',
        priority: 'high'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      setActionLoading(true);
      await assignRoleToUser(userId, roleId);
      addSystemNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Role Assigned',
        message: 'Role has been successfully assigned to user',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Role Assignment Failed',
        message: 'Failed to assign role to user',
        priority: 'high'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    try {
      setActionLoading(true);
      await removeRoleFromUser(userId, roleId);
      addSystemNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Role Removed',
        message: 'Role has been successfully removed from user',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error removing role:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Role Removal Failed',
        message: 'Failed to remove role from user',
        priority: 'high'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // System actions
  const handleCleanExpiredTokens = async () => {
    try {
      setActionLoading(true);
      await cleanExpiredTokens();
      addSystemNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Tokens Cleaned',
        message: 'Expired tokens have been successfully cleaned',
        priority: 'low'
      });
    } catch (error) {
      console.error('Error cleaning tokens:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Token Cleanup Failed',
        message: 'Failed to clean expired tokens',
        priority: 'medium'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDefaultRoles = async () => {
    try {
      setActionLoading(true);
      await createDefaultRolesAndPermissions();
      addSystemNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Default Roles Created',
        message: 'Default roles and permissions have been created',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating default roles:', error);
      addSystemNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Role Creation Failed',
        message: 'Failed to create default roles',
        priority: 'high'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">
              {systemMetrics.activeUsers} active
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalRoles}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {availableRoles.length} configured
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalPermissions}</p>
            </div>
            <Key className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {availablePermissions.length} available
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              Uptime: {systemMetrics.uptime}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Server</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Running</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notifications</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleCreateDefaultRoles}
            disabled={actionLoading}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Default Roles</span>
          </Button>
          <Button
            onClick={handleCleanExpiredTokens}
            disabled={actionLoading}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clean Expired Tokens</span>
          </Button>
          <Button
            onClick={loadAllData}
            disabled={isLoading}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );

  // Users Tab Component
  const UsersTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Search className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <Button onClick={() => setShowUserModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role) => (
                        <span key={role.id} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {role.role?.name || role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        disabled={actionLoading}
                      >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Roles Tab Component
  const RolesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
          <Button onClick={() => setShowRoleModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRoles.map((role) => (
            <div key={role.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{role.name}</h4>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 3).map((permission) => (
                    <span key={permission.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {permission.permission?.name || permission.name}
                    </span>
                  ))}
                  {role.permissions?.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Permissions Tab Component
  const PermissionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Permission Management</h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePermissions.map((permission) => (
            <div key={permission.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900">{permission.name}</h4>
                <div className="flex items-center space-x-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-600">{permission.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // System Tab Component
  const SystemTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-medium text-gray-900">Development</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-gray-900">PostgreSQL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
          <div className="space-y-3">
            <Button
              onClick={handleCleanExpiredTokens}
              disabled={actionLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Expired Tokens
            </Button>
            <Button
              onClick={handleCreateDefaultRoles}
              disabled={actionLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Default Roles
            </Button>
            <Button
              onClick={loadAllData}
              disabled={isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All Data
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  // Monitoring Tab Component
  const MonitoringTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">45%</p>
            </div>
            <Cpu className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">62%</p>
            </div>
            <MemoryStick className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disk Usage</p>
              <p className="text-2xl font-bold text-gray-900">38%</p>
            </div>
            <HardDrive className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-soft p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Logs</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">System started successfully</span>
            <span className="text-xs text-gray-400 ml-auto">2 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">User authentication successful</span>
            <span className="text-xs text-gray-400 ml-auto">5 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">High memory usage detected</span>
            <span className="text-xs text-gray-400 ml-auto">10 minutes ago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Render appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'users':
        return <UsersTab />;
      case 'roles':
        return <RolesTab />;
      case 'permissions':
        return <PermissionsTab />;
      case 'system':
        return <SystemTab />;
      case 'monitoring':
        return <MonitoringTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (!canManageUsers && !canManageSystem) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive system administration and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={loadAllData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Crown className="h-6 w-6 text-purple-600" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Modals */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete user "{selectedUser?.firstName} {selectedUser?.lastName}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(selectedUser?.id)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminDashboard