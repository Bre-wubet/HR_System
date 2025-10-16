import { apiGateway, serviceRouter, rateLimiter, corsWithServices, requestLogger, healthCheck } from '../middlewares/apiGateway.js';
import { logger } from './logger.js';

// Service configuration
export const serviceConfig = {
  auth: {
    prefix: '/api/auth',
    version: '1.0.0',
    cors: {
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },
  hr: {
    prefix: '/api/hr',
    version: '1.0.0',
    cors: {
      allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },
  default: {
    prefix: '/api',
    version: '1.0.0',
    cors: {
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    },
  },
};

// Public routes that don't require authentication
export const publicRoutes = [
  '/health',
  '/api/health',
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/register', method: 'POST' },
  { path: '/api/auth/refresh-token', method: 'POST' },
  { path: '/api/auth/logout', method: 'POST' },
];

// Protected routes that explicitly require authentication
export const protectedRoutes = [
  '/api/auth/profile',
  '/api/auth/change-password',
  '/api/auth/roles-permissions',
];

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.userId || req.ip;
  },
  skipSuccessfulRequests: false,
};

// API Gateway middleware setup
export const setupApiGateway = (app) => {
  // Health check middleware
  app.use(healthCheck(serviceConfig));

  // Service router middleware
  app.use(serviceRouter(serviceConfig));

  // CORS middleware with service-specific configuration
  app.use(corsWithServices(serviceConfig));

  // Request logging middleware
  app.use(requestLogger(logger));

  // Rate limiting middleware
  app.use(rateLimiter(rateLimitConfig));

  // Main API Gateway middleware
  app.use(apiGateway({
    publicRoutes,
    protectedRoutes,
    serviceRoutes: serviceConfig,
    defaultAuth: false, // Let individual routes handle their own authentication
  }));

  return app;
};

// Service-specific middleware configurations
export const serviceMiddlewares = {
  auth: {
    rateLimit: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 20, // More restrictive for auth endpoints
    },
  },
  hr: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 200, // Higher limit for HR operations
    },
  },
};

// Request validation middleware
export const validateServiceRequest = (serviceName) => {
  return (req, res, next) => {
    const service = serviceConfig[serviceName];
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        code: 404,
      });
    }

    // Add service context to request
    req.serviceContext = {
      name: serviceName,
      config: service,
    };

    next();
  };
};

// Error handling for API Gateway
export const apiGatewayErrorHandler = (err, req, res, next) => {
  // Log the error with service context
  logger.error('API Gateway Error', {
    error: err.message,
    stack: err.stack,
    service: req.service,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  // Return appropriate error response
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 401,
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      code: 403,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 500,
  });
};

// Service discovery helper
export const getServiceInfo = (serviceName) => {
  return serviceConfig[serviceName] || null;
};

// Request forwarding helper (for future microservice architecture)
export const forwardRequest = async (serviceName, path, options = {}) => {
  const service = serviceConfig[serviceName];
  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  // This would be implemented when moving to microservices
  // For now, it's a placeholder for future architecture
  console.log(`Forwarding request to ${serviceName}:${path}`, options);
  
  return {
    service: serviceName,
    path,
    options,
  };
};
