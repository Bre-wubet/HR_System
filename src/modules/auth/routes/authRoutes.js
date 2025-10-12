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

// Maintenance routes (require system admin permissions)
router.post('/clean-expired-tokens', requirePermission('admin:manage_system'), authController.cleanExpiredTokens.bind(authController));

export default router;
