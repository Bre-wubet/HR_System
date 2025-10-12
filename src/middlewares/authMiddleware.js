import { AuthService } from '../modules/auth/services/authService.js';
import { response } from '../utils/response.js';

const authService = new AuthService();

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(response.error('Access token is required', 401));
    }

    // Verify token and get user data
    const tokenData = await authService.verifyToken(token);

    // Attach user data to request
    req.user = {
      userId: tokenData.userId,
      user: tokenData.user,
      permissions: tokenData.permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json(response.error('Invalid or expired token', 401));
  }
};

/**
 * Middleware to require specific permission
 */
export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const hasPermission = req.user.permissions.includes(permissionName);

      if (!hasPermission) {
        return res.status(403).json(response.error(`Permission '${permissionName}' is required`, 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Permission check failed', 500));
    }
  };
};

/**
 * Middleware to require any of the specified permissions
 */
export const requireAnyPermission = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const hasAnyPermission = permissionNames.some(permission => 
        req.user.permissions.includes(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json(response.error(`One of these permissions is required: ${permissionNames.join(', ')}`, 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Permission check failed', 500));
    }
  };
};

/**
 * Middleware to require all of the specified permissions
 */
export const requireAllPermissions = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const hasAllPermissions = permissionNames.every(permission => 
        req.user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json(response.error(`All of these permissions are required: ${permissionNames.join(', ')}`, 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Permission check failed', 500));
    }
  };
};

/**
 * Middleware to require specific role
 */
export const requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const userRoles = req.user.user.roles.map(userRole => userRole.role.name);
      const hasRole = userRoles.includes(roleName);

      if (!hasRole) {
        return res.status(403).json(response.error(`Role '${roleName}' is required`, 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Role check failed', 500));
    }
  };
};

/**
 * Middleware to require any of the specified roles
 */
export const requireAnyRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const userRoles = req.user.user.roles.map(userRole => userRole.role.name);
      const hasAnyRole = roleNames.some(role => userRoles.includes(role));

      if (!hasAnyRole) {
        return res.status(403).json(response.error(`One of these roles is required: ${roleNames.join(', ')}`, 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Role check failed', 500));
    }
  };
};

/**
 * Middleware to check if user owns the resource or has admin permissions
 */
export const requireOwnershipOrPermission = (resourceIdParam, permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.userId;

      // Check if user has the required permission
      const hasPermission = req.user.permissions.includes(permissionName);

      // Check if user owns the resource (assuming resource has userId field)
      const isOwner = resourceId === userId;

      if (!hasPermission && !isOwner) {
        return res.status(403).json(response.error('Access denied: You must own this resource or have the required permission', 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Ownership check failed', 500));
    }
  };
};

/**
 * Middleware to check if user is accessing their own employee data or has HR permissions
 */
export const requireEmployeeAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(response.error('Authentication required', 401));
      }

      const employeeId = req.params.id || req.params.employeeId;
      const userId = req.user.userId;
      const userEmployeeId = req.user.user.employeeId;

      // Check if user has HR permissions
      const hasHrPermission = req.user.permissions.some(permission => 
        permission.startsWith('employee:') || permission.startsWith('hr:')
      );

      // Check if user is accessing their own employee data
      const isOwnEmployee = employeeId === userEmployeeId;

      if (!hasHrPermission && !isOwnEmployee) {
        return res.status(403).json(response.error('Access denied: You can only access your own employee data or need HR permissions', 403));
      }

      next();
    } catch (error) {
      return res.status(500).json(response.error('Employee access check failed', 500));
    }
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const tokenData = await authService.verifyToken(token);
        req.user = {
          userId: tokenData.userId,
          user: tokenData.user,
          permissions: tokenData.permissions,
        };
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Optional auth: Invalid token provided');
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Middleware to extract user context for logging
 */
export const addUserContext = (req, res, next) => {
  if (req.user) {
    req.logContext = {
      userId: req.user.userId,
      userEmail: req.user.user.email,
      userRoles: req.user.user.roles.map(ur => ur.role.name),
    };
  }
  next();
};
