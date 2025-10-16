import { create } from 'zustand';
import { adminApi } from '../api/adminApi';

/**
 * Admin Store - Zustand store for admin functionality
 */
export const useAdminStore = create((set, get) => ({
  // State
  users: [],
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },

  // User Management
  async fetchUsers(params = {}) {
    try {
      set({ isLoading: true, error: null });
      
      const { page = 1, limit = 20, search, status, roleId } = params;
      const skip = (page - 1) * limit;
      
      const response = await adminApi.getAllUsers({
        take: limit,
        skip,
        search,
        status,
        roleId,
      });

      set({
        users: response.data.users,
        pagination: {
          page,
          limit,
          total: response.data.total,
          hasMore: response.data.hasMore,
        },
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch users',
        isLoading: false 
      });
      throw error;
    }
  },

  async updateUserStatus(userId, isActive) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.updateUserStatus(userId, isActive);
      
      // Update user in local state
      set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, isActive } : user
        ),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update user status',
        isLoading: false 
      });
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      set({ isLoading: true, error: null });
      
      await adminApi.deleteUser(userId);
      
      // Remove user from local state
      set(state => ({
        users: state.users.filter(user => user.id !== userId),
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to delete user',
        isLoading: false 
      });
      throw error;
    }
  },

  async assignRoleToUser(userId, roleId) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.assignRoleToUser(userId, roleId);
      
      // Refresh users to get updated roles
      await get().fetchUsers({ 
        page: get().pagination.page,
        limit: get().pagination.limit 
      });

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to assign role to user',
        isLoading: false 
      });
      throw error;
    }
  },

  async removeRoleFromUser(userId, roleId) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.removeRoleFromUser(userId, roleId);
      
      // Refresh users to get updated roles
      await get().fetchUsers({ 
        page: get().pagination.page,
        limit: get().pagination.limit 
      });

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to remove role from user',
        isLoading: false 
      });
      throw error;
    }
  },

  // Role Management
  async fetchRoles() {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.getAllRoles();
      
      set({
        roles: response.data,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch roles',
        isLoading: false 
      });
      throw error;
    }
  },

  async createRole(roleData) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.createRole(roleData);
      
      // Add new role to local state
      set(state => ({
        roles: [...state.roles, response.data],
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create role',
        isLoading: false 
      });
      throw error;
    }
  },

  async updateRole(roleId, roleData) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.updateRole(roleId, roleData);
      
      // Update role in local state
      set(state => ({
        roles: state.roles.map(role => 
          role.id === roleId ? { ...role, ...response.data } : role
        ),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update role',
        isLoading: false 
      });
      throw error;
    }
  },

  async deleteRole(roleId) {
    try {
      set({ isLoading: true, error: null });
      
      await adminApi.deleteRole(roleId);
      
      // Remove role from local state
      set(state => ({
        roles: state.roles.filter(role => role.id !== roleId),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to delete role',
        isLoading: false 
      });
      throw error;
    }
  },

  // Permission Management
  async fetchPermissions() {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.getAllPermissions();
      
      set({
        permissions: response.data,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch permissions',
        isLoading: false 
      });
      throw error;
    }
  },

  async createPermission(permissionData) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.createPermission(permissionData);
      
      // Add new permission to local state
      set(state => ({
        permissions: [...state.permissions, response.data],
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      console.error('Error creating permission:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create permission',
        isLoading: false 
      });
      throw error;
    }
  },

  async assignPermissionToRole(roleId, permissionId) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.assignPermissionToRole(roleId, permissionId);
      
      // Refresh roles to get updated permissions
      await get().fetchRoles();

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to assign permission to role',
        isLoading: false 
      });
      throw error;
    }
  },

  async removePermissionFromRole(roleId, permissionId) {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.removePermissionFromRole(roleId, permissionId);
      
      // Refresh roles to get updated permissions
      await get().fetchRoles();

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error removing permission from role:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to remove permission from role',
        isLoading: false 
      });
      throw error;
    }
  },

  // System Management
  async createDefaultRolesAndPermissions() {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.createDefaultRolesAndPermissions();
      
      // Refresh roles and permissions
      await Promise.all([
        get().fetchRoles(),
        get().fetchPermissions(),
      ]);

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error creating default roles and permissions:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create default roles and permissions',
        isLoading: false 
      });
      throw error;
    }
  },

  async cleanExpiredTokens() {
    try {
      set({ isLoading: true, error: null });
      
      const response = await adminApi.cleanExpiredTokens();
      
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error cleaning expired tokens:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to clean expired tokens',
        isLoading: false 
      });
      throw error;
    }
  },

  // Utility methods
  clearError() {
    set({ error: null });
  },

  reset() {
    set({
      users: [],
      roles: [],
      permissions: [],
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false,
      },
    });
  },
}));
