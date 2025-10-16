import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../../config/db.js';
import { AuthRepository } from '../repositories/authRepositories.js';
import { env } from '../../../config/env.js';

const authRepository = new AuthRepository();

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { email, password, firstName, lastName, employeeId } = userData;

    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await authRepository.createUser({
      email,
      password,
      firstName,
      lastName,
      employeeId,
    });

    // If employeeId is provided, link user to employee
    if (employeeId) {
      await authRepository.linkUserToEmployee(user.id, employeeId);
    }

    return {
      user: this.sanitizeUser(user),
      tokens: await this.generateTokens(user.id),
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await authRepository.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Get user roles and permissions
    const rolesAndPermissions = await this.getUserRolesAndPermissions(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens: await this.generateTokens(user.id),
      roles: rolesAndPermissions.roles.map(role => role.name),
      permissions: rolesAndPermissions.permissions, // permissions is already an array of strings
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    // Find refresh token
    const tokenData = await authRepository.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw new Error('Invalid refresh token');
    }

    // Check if token is revoked or expired
    if (tokenData.isRevoked || tokenData.expiresAt < new Date()) {
      throw new Error('Refresh token is invalid or expired');
    }

    // Check if user is still active
    if (!tokenData.user.isActive) {
      throw new Error('User account is deactivated');
    }

    // Generate new tokens
    return await this.generateTokens(tokenData.user.id);
  }

  /**
   * Logout user
   */
  async logout(refreshToken) {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(userId) {
    await authRepository.revokeAllUserRefreshTokens(userId);
    return { message: 'Logged out from all devices successfully' };
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await authRepository.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await authRepository.updatePassword(userId, newPassword);

    // Revoke all refresh tokens (force re-login)
    await authRepository.revokeAllUserRefreshTokens(userId);

    return { message: 'Password changed successfully' };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    const { password, ...safeUpdateData } = updateData;
    
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user (password changes should use changePassword method)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: safeUpdateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
        employeeId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      
      // Get fresh user data
      const user = await authRepository.findUserById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        userId: decoded.userId,
        user: this.sanitizeUser(user),
        permissions: await authRepository.getUserPermissions(decoded.userId),
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Check if user has permission
   */
  async checkPermission(userId, permissionName) {
    return await authRepository.userHasPermission(userId, permissionName);
  }

  /**
   * Get user roles and permissions
   */
  async getUserRolesAndPermissions(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = user.roles.map(userRole => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description,
    }));

    const permissions = await authRepository.getUserPermissions(userId);

    return { roles, permissions };
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await authRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    try {
      return await authRepository.assignRoleToUser(userId, roleId);
    } catch (error) {
      if (error.message.includes('already has role')) {
        throw new Error(`User already has the role "${role.name}"`);
      }
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await authRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    try {
      return await authRepository.removeRoleFromUser(userId, roleId);
    } catch (error) {
      if (error.message.includes('User role relationship not found')) {
        throw new Error(`User does not have the role "${role.name}"`);
      }
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  async generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      env.jwtSecret,
      { expiresIn: env.jwtAccessExpiresIn }
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenExpiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    await authRepository.createRefreshToken(userId, refreshToken, refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.jwtAccessExpiresIn,
    };
  }

  /**
   * Sanitize user data (remove sensitive information)
   */
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Clean expired refresh tokens (maintenance task)
   */
  async cleanExpiredTokens() {
    return await authRepository.cleanExpiredRefreshTokens();
  }

  /**
   * Create default roles and permissions (seed data)
   */
  async createDefaultRolesAndPermissions() {
    // Create permissions
    const permissions = [
      // Employee permissions
      { name: 'employee:create', description: 'Create employees', resource: 'employee', action: 'create' },
      { name: 'employee:read', description: 'View employees', resource: 'employee', action: 'read' },
      { name: 'employee:update', description: 'Update employees', resource: 'employee', action: 'update' },
      { name: 'employee:delete', description: 'Delete employees', resource: 'employee', action: 'delete' },
      
      // Recruitment permissions
      { name: 'recruitment:create', description: 'Create job postings', resource: 'recruitment', action: 'create' },
      { name: 'recruitment:read', description: 'View recruitment data', resource: 'recruitment', action: 'read' },
      { name: 'recruitment:update', description: 'Update recruitment data', resource: 'recruitment', action: 'update' },
      { name: 'recruitment:delete', description: 'Delete recruitment data', resource: 'recruitment', action: 'delete' },
      
      // Attendance permissions
      { name: 'attendance:create', description: 'Create attendance records', resource: 'attendance', action: 'create' },
      { name: 'attendance:read', description: 'View attendance data', resource: 'attendance', action: 'read' },
      { name: 'attendance:update', description: 'Update attendance data', resource: 'attendance', action: 'update' },
      { name: 'attendance:delete', description: 'Delete attendance data', resource: 'attendance', action: 'delete' },
      
      // Admin permissions
      { name: 'admin:manage_users', description: 'Manage users and roles', resource: 'admin', action: 'manage_users' },
      { name: 'admin:manage_system', description: 'System administration', resource: 'admin', action: 'manage_system' },
    ];

    for (const permissionData of permissions) {
      try {
        await authRepository.createPermission(permissionData);
      } catch (error) {
        // Permission might already exist
        console.log(`Permission ${permissionData.name} might already exist`);
      }
    }

    // Create roles
    const roles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with all permissions',
      },
      {
        name: 'hr_admin',
        description: 'HR Administrator with full HR access',
      },
      {
        name: 'hr_manager',
        description: 'HR Manager with management permissions',
      },
      {
        name: 'hr_employee',
        description: 'HR Employee with basic HR access',
      },
      {
        name: 'employee',
        description: 'Regular employee with limited access',
      },
    ];

    for (const roleData of roles) {
      try {
        await authRepository.createRole(roleData);
      } catch (error) {
        // Role might already exist
        console.log(`Role ${roleData.name} might already exist`);
      }
    }

    // Assign permissions to roles
    const rolePermissions = {
      super_admin: [
        'employee:create', 'employee:read', 'employee:update', 'employee:delete',
        'recruitment:create', 'recruitment:read', 'recruitment:update', 'recruitment:delete',
        'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
        'admin:manage_users', 'admin:manage_system',
      ],
      hr_admin: [
        'employee:create', 'employee:read', 'employee:update', 'employee:delete',
        'recruitment:create', 'recruitment:read', 'recruitment:update', 'recruitment:delete',
        'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
      ],
      hr_manager: [
        'employee:read', 'employee:update',
        'recruitment:create', 'recruitment:read', 'recruitment:update',
        'attendance:read', 'attendance:update',
      ],
      hr_employee: [
        'employee:read',
        'recruitment:read',
        'attendance:read',
      ],
      employee: [
        'employee:read', // Can view own profile
        'attendance:read', // Can view own attendance
      ],
    };

    // Get all roles and permissions
    const allRoles = await authRepository.getAllRoles();
    const allPermissions = await authRepository.getAllPermissions();

    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = allRoles.find(r => r.name === roleName);
      if (role) {
        for (const permissionName of permissionNames) {
          const permission = allPermissions.find(p => p.name === permissionName);
          if (permission) {
            try {
              await authRepository.assignPermissionToRole(role.id, permission.id);
            } catch (error) {
              // Permission might already be assigned
              console.log(`Permission ${permissionName} might already be assigned to role ${roleName}`);
            }
          }
        }
      }
    }

    return { message: 'Default roles and permissions created successfully' };
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(query) {
    const { take, skip, search, status, roleId } = query || {};
    const users = await authRepository.getAllUsers({ take, skip, search, status, roleId });
    const total = await authRepository.getUserCount({ search, status, roleId });
    
    return {
      users: users.map(user => this.sanitizeUser(user)),
      total,
      hasMore: (skip || 0) + users.length < total,
    };
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId, isActive) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await authRepository.updateUserStatus(userId, isActive);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await authRepository.deleteUser(userId);
  }

  /**
   * Create role (admin only)
   */
  async createRole(roleData) {
    const existingRole = await authRepository.findRoleByName(roleData.name);
    if (existingRole) {
      throw new Error('Role with this name already exists');
    }

    return await authRepository.createRole(roleData);
  }

  /**
   * Update role (admin only)
   */
  async updateRole(roleId, roleData) {
    const role = await authRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return await authRepository.updateRole(roleId, roleData);
  }

  /**
   * Delete role (admin only)
   */
  async deleteRole(roleId) {
    const role = await authRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return await authRepository.deleteRole(roleId);
  }

  /**
   * Create permission (admin only)
   */
  async createPermission(permissionData) {
    const existingPermission = await authRepository.findPermissionByName(permissionData.name);
    if (existingPermission) {
      throw new Error('Permission with this name already exists');
    }

    return await authRepository.createPermission(permissionData);
  }

  /**
   * Assign permission to role (admin only)
   */
  async assignPermissionToRole(roleId, permissionId) {
    const role = await authRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permission = await authRepository.findPermissionById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    return await authRepository.assignPermissionToRole(roleId, permissionId);
  }

  /**
   * Remove permission from role (admin only)
   */
  async removePermissionFromRole(roleId, permissionId) {
    return await authRepository.removePermissionFromRole(roleId, permissionId);
  }

  /**
   * Get all roles (admin only)
   */
  async getAllRoles() {
    return await authRepository.getAllRoles();
  }

  /**
   * Get all permissions (admin only)
   */
  async getAllPermissions() {
    return await authRepository.getAllPermissions();
  }
}
