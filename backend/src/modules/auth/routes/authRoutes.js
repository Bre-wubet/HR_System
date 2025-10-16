import express from 'express';
import { AuthController } from '../controllers/authControllers.js';
import { authenticateToken, requirePermission } from '../../../middlewares/authMiddleware.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes (require authentication)
router.use(authenticateToken);

// User profile routes
router.get('/profile', authController.getProfile.bind(authController));
router.put('/profile', authController.updateProfile.bind(authController));
router.get('/roles-permissions', authController.getUserRolesAndPermissions.bind(authController));
router.post('/change-password', authController.changePassword.bind(authController));
router.post('/logout-all', authController.logoutAllDevices.bind(authController));

// Token verification (for other services)
router.post('/verify-token', authController.verifyToken.bind(authController));
router.post('/check-permission', authController.checkPermission.bind(authController));

// Admin routes (require admin permissions)
router.post('/assign-role', requirePermission('admin:manage_users'), authController.assignRoleToUser.bind(authController));
router.post('/remove-role', requirePermission('admin:manage_users'), authController.removeRoleFromUser.bind(authController));
router.post('/create-default-roles', requirePermission('admin:manage_system'), authController.createDefaultRolesAndPermissions.bind(authController));

// User management routes (require admin permissions)
router.get('/users', requirePermission('admin:manage_users'), authController.getAllUsers.bind(authController));
router.put('/users/:userId/status', requirePermission('admin:manage_users'), authController.updateUserStatus.bind(authController));
router.delete('/users/:userId', requirePermission('admin:manage_users'), authController.deleteUser.bind(authController));

// Role management routes (require admin permissions)
router.get('/roles', requirePermission('admin:manage_users'), authController.getAllRoles.bind(authController));
router.post('/roles', requirePermission('admin:manage_users'), authController.createRole.bind(authController));
router.put('/roles/:roleId', requirePermission('admin:manage_users'), authController.updateRole.bind(authController));
router.delete('/roles/:roleId', requirePermission('admin:manage_users'), authController.deleteRole.bind(authController));

// Permission management routes (require admin permissions)
router.get('/permissions', requirePermission('admin:manage_users'), authController.getAllPermissions.bind(authController));
router.post('/permissions', requirePermission('admin:manage_users'), authController.createPermission.bind(authController));
router.post('/roles/:roleId/permissions', requirePermission('admin:manage_users'), authController.assignPermissionToRole.bind(authController));
router.delete('/roles/:roleId/permissions', requirePermission('admin:manage_users'), authController.removePermissionFromRole.bind(authController));

// Maintenance routes (require system admin permissions)
router.post('/clean-expired-tokens', requirePermission('admin:manage_system'), authController.cleanExpiredTokens.bind(authController));

export default router;
