import { prisma } from '../../../config/db.js';
import bcrypt from 'bcrypt';


export class AuthRepository {
  /**
   * Create a new user
   */
  async createUser(userData) {
    const { password, ...userDataWithoutPassword } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return await prisma.user.create({
      data: {
        ...userDataWithoutPassword,
        password: hashedPassword,
      },
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
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        employee: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        employee: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(userId, token, expiresAt) {
    return await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Find refresh token
   */
  async findRefreshToken(token) {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token) {
    return await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all user refresh tokens
   */
  async revokeAllUserRefreshTokens(userId) {
    return await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Clean expired refresh tokens
   */
  async cleanExpiredRefreshTokens() {
    return await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Get all roles
   */
  async getAllRoles() {
    return await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Get all permissions
   */
  async getAllPermissions() {
    return await prisma.permission.findMany();
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers({ take = 50, skip = 0, search, status, roleId } = {}) {
    const where = {
      AND: [
        search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        status ? { isActive: status === 'active' } : {},
        roleId ? { roles: { some: { roleId } } } : {},
      ],
    };

    return await prisma.user.findMany({
      where,
      take: Number(take),
      skip: Number(skip),
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        employee: {
          include: {
            department: true,
          },
        },
      },
    });
  }

  /**
   * Get user count (admin only)
   */
  async getUserCount({ search, status, roleId } = {}) {
    const where = {
      AND: [
        search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        status ? { isActive: status === 'active' } : {},
        roleId ? { roles: { some: { roleId } } } : {},
      ],
    };

    return await prisma.user.count({ where });
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId, isActive) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
        employeeId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    // First remove all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Then remove all user roles
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    // Finally delete the user
    return await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Create role (admin only)
   */
  async createRole(roleData) {
    return await prisma.role.create({
      data: roleData,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Update role (admin only)
   */
  async updateRole(roleId, roleData) {
    return await prisma.role.update({
      where: { id: roleId },
      data: roleData,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Delete role (admin only)
   */
  async deleteRole(roleId) {
    // First remove all role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Then remove all user roles
    await prisma.userRole.deleteMany({
      where: { roleId },
    });

    // Finally delete the role
    return await prisma.role.delete({
      where: { id: roleId },
    });
  }

  /**
   * Create permission (admin only)
   */
  async createPermission(permissionData) {
    return await prisma.permission.create({
      data: permissionData,
    });
  }

  /**
   * Assign permission to role (admin only)
   */
  async assignPermissionToRole(roleId, permissionId) {
    return await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        permission: true,
      },
    });
  }

  /**
   * Remove permission from role (admin only)
   */
  async removePermissionFromRole(roleId, permissionId) {
    return await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * Find role by name
   */
  async findRoleByName(name) {
    return await prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Find role by ID
   */
  async findRoleById(id) {
    return await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Find permission by name
   */
  async findPermissionByName(name) {
    return await prisma.permission.findUnique({
      where: { name },
    });
  }

  /**
   * Find permission by ID
   */
  async findPermissionById(id) {
    return await prisma.permission.findUnique({
      where: { id },
    });
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId) {
    return await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId) {
    return await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return [];

    const permissions = new Set();
    user.roles.forEach(userRole => {
      userRole.role.permissions.forEach(rolePermission => {
        permissions.add(rolePermission.permission.name);
      });
    });

    return Array.from(permissions);
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(userId, permissionName) {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionName);
  }

  /**
   * Create role
   */
  async createRole(roleData) {
    return await prisma.role.create({
      data: roleData,
    });
  }

  /**
   * Create permission
   */
  async createPermission(permissionData) {
    return await prisma.permission.create({
      data: permissionData,
    });
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId, permissionId) {
    return await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * Link user to employee
   */
  async linkUserToEmployee(userId, employeeId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { employeeId },
      include: {
        employee: true,
      },
    });
  }
}
