import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/axiosClient';
import toast from 'react-hot-toast';

// Utility function to safely parse JSON from localStorage
const safeParseJSON = (value, defaultValue = null) => {
  if (!value || value === 'undefined' || value === 'null') {
    return defaultValue;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
      roles: [],

      // Actions
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', credentials);
          const { user, accessToken, refreshToken, permissions, roles } = response.data.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            permissions,
            roles,
            isLoading: false,
          });

          // Store tokens in localStorage for axios interceptor
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('permissions', JSON.stringify(permissions || []));
          localStorage.setItem('roles', JSON.stringify(roles || []));

          toast.success('Login successful!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          return { success: false, error: error.response?.data?.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/register', userData);
          const { user, accessToken, refreshToken, permissions, roles } = response.data.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            permissions,
            roles,
            isLoading: false,
          });

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          toast.success('Registration successful!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          return { success: false, error: error.response?.data?.message };
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await apiClient.post('/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            permissions: [],
            roles: [],
            isLoading: false,
          });

          // Clear localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
          localStorage.removeItem('roles');

          toast.success('Logged out successfully');
        }
      },

      refreshToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) throw new Error('No refresh token');

          const response = await apiClient.post('/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          set({
            accessToken,
            refreshToken: newRefreshToken,
          });

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          return { success: true };
        } catch (error) {
          get().logout();
          return { success: false };
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.put('/auth/profile', profileData);
          const { user } = response.data.data;

          set({
            user,
            isLoading: false,
          });

          toast.success('Profile updated successfully!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Profile update failed');
          return { success: false, error: error.response?.data?.message };
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true });
        try {
          await apiClient.post('/auth/change-password', passwordData);
          set({ isLoading: false });
          toast.success('Password changed successfully!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Password change failed');
          return { success: false, error: error.response?.data?.message };
        }
      },

      checkPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      hasAnyPermission: (permissionList) => {
        const { permissions } = get();
        return permissionList.some(permission => permissions.includes(permission));
      },

      hasRole: (role) => {
        const { roles } = get();
        return roles.includes(role);
      },

      hasAnyRole: (roleList) => {
        const { roles } = get();
        return roleList.some(role => roles.includes(role));
      },

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = localStorage.getItem('user');
        const permissions = localStorage.getItem('permissions');
        const roles = localStorage.getItem('roles');

        if (accessToken && refreshToken && user) {
          const parsedUser = safeParseJSON(user);
          const parsedPermissions = safeParseJSON(permissions, []);
          const parsedRoles = safeParseJSON(roles, []);

          if (parsedUser) {
            set({
              accessToken,
              refreshToken,
              user: parsedUser,
              isAuthenticated: true,
              permissions: parsedPermissions,
              roles: parsedRoles,
            });
          } else {
            // Clear corrupted data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            localStorage.removeItem('roles');
          }
        }
      },

      // Clear loading state
      clearLoading: () => set({ isLoading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        roles: state.roles,
      }),
    }
  )
);

export default useAuthStore;
