import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
