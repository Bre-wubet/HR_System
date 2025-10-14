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
}
