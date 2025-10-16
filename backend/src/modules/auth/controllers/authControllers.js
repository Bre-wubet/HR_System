import { AuthService } from '../services/authService.js';
import { response } from '../../../utils/response.js';

const authService = new AuthService();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, employeeId } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json(response.error('Missing required fields', 400));
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        employeeId,
      });

      res.status(201).json(response.success(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json(response.error('Email and password are required', 400));
      }

      const result = await authService.login(email, password);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(response.success({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
        roles: result.roles,
        permissions: result.permissions,
      }, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json(response.error('Refresh token is required', 401));
      }

      const result = await authService.refreshToken(refreshToken);

      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json(response.success({
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      }, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      await authService.logout(refreshToken);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json(response.success(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(req, res, next) {
    try {
      const { userId } = req.user;

      await authService.logoutAllDevices(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json(response.success(null, 'Logged out from all devices successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json(response.error('Current password and new password are required', 400));
      }

      if (newPassword.length < 8) {
        return res.status(400).json(response.error('New password must be at least 8 characters long', 400));
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.json(response.success(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;

      const user = await authService.getUserProfile(userId);

      res.json(response.success(user, 'Profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated through profile
      const { password, email, isActive, emailVerified, ...safeUpdateData } = updateData;

      const user = await authService.updateUserProfile(userId, safeUpdateData);

      res.json(response.success(user, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user roles and permissions
   */
  async getUserRolesAndPermissions(req, res, next) {
    try {
      const { userId } = req.user;

      const result = await authService.getUserRolesAndPermissions(userId);

      res.json(response.success(result, 'Roles and permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign role to user (Admin only)
   */
  async assignRoleToUser(req, res, next) {
    try {
      const { userId, roleId } = req.body;

      // Validation
      if (!userId || !roleId) {
        return res.status(400).json(response.error('User ID and Role ID are required', 400));
      }

      const result = await authService.assignRoleToUser(userId, roleId);

      res.json(response.success(result, 'Role assigned successfully'));
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes('User not found')) {
        return res.status(404).json(response.error('User not found', 404));
      }
      if (error.message.includes('Role not found')) {
        return res.status(404).json(response.error('Role not found', 404));
      }
      if (error.message.includes('already has the role')) {
        return res.status(409).json(response.error(error.message, 409));
      }
      next(error);
    }
  }

  /**
   * Remove role from user (Admin only)
   */
  async removeRoleFromUser(req, res, next) {
    try {
      const { userId, roleId } = req.body;

      // Validation
      if (!userId || !roleId) {
        return res.status(400).json(response.error('User ID and Role ID are required', 400));
      }

      await authService.removeRoleFromUser(userId, roleId);

      res.json(response.success(null, 'Role removed successfully'));
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes('User not found')) {
        return res.status(404).json(response.error('User not found', 404));
      }
      if (error.message.includes('Role not found')) {
        return res.status(404).json(response.error('Role not found', 404));
      }
      if (error.message.includes('does not have the role')) {
        return res.status(404).json(response.error(error.message, 404));
      }
      next(error);
    }
  }

  /**
   * Verify token (for other services)
   */
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json(response.error('Token is required', 401));
      }

      const result = await authService.verifyToken(token);

      res.json(response.success(result, 'Token verified successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check permission (for other services)
   */
  async checkPermission(req, res, next) {
    try {
      const { userId } = req.user;
      const { permission } = req.body;

      if (!permission) {
        return res.status(400).json(response.error('Permission name is required', 400));
      }

      const hasPermission = await authService.checkPermission(userId, permission);

      res.json(response.success({ hasPermission }, 'Permission check completed'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create default roles and permissions (Admin only)
   */
  async createDefaultRolesAndPermissions(req, res, next) {
    try {
      const result = await authService.createDefaultRolesAndPermissions();

      res.json(response.success(null, result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clean expired tokens (Maintenance endpoint)
   */
  async cleanExpiredTokens(req, res, next) {
    try {
      const result = await authService.cleanExpiredTokens();

      res.json(response.success({ cleanedCount: result.count }, 'Expired tokens cleaned successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const result = await authService.getAllUsers(req.query);
      res.json(response.success(result, 'Users retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json(response.error('isActive must be a boolean', 400));
      }

      const user = await authService.updateUserStatus(userId, isActive);
      res.json(response.success(user, 'User status updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      await authService.deleteUser(userId);
      res.json(response.success(null, 'User deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all roles (Admin only)
   */
  async getAllRoles(req, res, next) {
    try {
      const roles = await authService.getAllRoles();
      res.json(response.success(roles, 'Roles retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create role (Admin only)
   */
  async createRole(req, res, next) {
    try {
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json(response.error('Name and description are required', 400));
      }

      const role = await authService.createRole({ name, description });
      res.status(201).json(response.success(role, 'Role created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update role (Admin only)
   */
  async updateRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const updateData = req.body;

      const role = await authService.updateRole(roleId, updateData);
      res.json(response.success(role, 'Role updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete role (Admin only)
   */
  async deleteRole(req, res, next) {
    try {
      const { roleId } = req.params;
      await authService.deleteRole(roleId);
      res.json(response.success(null, 'Role deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all permissions (Admin only)
   */
  async getAllPermissions(req, res, next) {
    try {
      const permissions = await authService.getAllPermissions();
      res.json(response.success(permissions, 'Permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create permission (Admin only)
   */
  async createPermission(req, res, next) {
    try {
      const { name, description, resource, action } = req.body;

      if (!name || !description || !resource || !action) {
        return res.status(400).json(response.error('Name, description, resource, and action are required', 400));
      }

      const permission = await authService.createPermission({ name, description, resource, action });
      res.status(201).json(response.success(permission, 'Permission created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign permission to role (Admin only)
   */
  async assignPermissionToRole(req, res, next) {
    try {
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId) {
        return res.status(400).json(response.error('Role ID and Permission ID are required', 400));
      }

      const result = await authService.assignPermissionToRole(roleId, permissionId);
      res.json(response.success(result, 'Permission assigned to role successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove permission from role (Admin only)
   */
  async removePermissionFromRole(req, res, next) {
    try {
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId) {
        return res.status(400).json(response.error('Role ID and Permission ID are required', 400));
      }

      await authService.removePermissionFromRole(roleId, permissionId);
      res.json(response.success(null, 'Permission removed from role successfully'));
    } catch (error) {
      next(error);
    }
  }
}
