import { authenticateToken, optionalAuth } from './authMiddleware.js';
import { response } from '../utils/response.js';

/**
 * API Gateway middleware for request routing and authentication
 */
export const apiGateway = (options = {}) => {
  const {
    publicRoutes = [],
    protectedRoutes = [],
    serviceRoutes = {},
    defaultAuth = true,
  } = options;

  return async (req, res, next) => {
    try {
      const path = req.path;
      const method = req.method;

      // Check if route is public
      const isPublicRoute = publicRoutes.some(route => {
        if (typeof route === 'string') {
          return path.startsWith(route);
        }
        if (route instanceof RegExp) {
          return route.test(path);
        }
        if (typeof route === 'object' && route.path) {
          const pathMatch = typeof route.path === 'string' 
            ? path.startsWith(route.path)
            : route.path.test(path);
          const methodMatch = !route.method || route.method === method;
          return pathMatch && methodMatch;
        }
        return false;
      });

      // Check if route is explicitly protected
      const isProtectedRoute = protectedRoutes.some(route => {
        if (typeof route === 'string') {
          return path.startsWith(route);
        }
        if (route instanceof RegExp) {
          return route.test(path);
        }
        if (typeof route === 'object' && route.path) {
          const pathMatch = typeof route.path === 'string' 
            ? path.startsWith(route.path)
            : route.path.test(path);
          const methodMatch = !route.method || route.method === method;
          return pathMatch && methodMatch;
        }
        return false;
      });

      // Determine authentication requirement
      let requiresAuth = defaultAuth;
      if (isPublicRoute) {
        requiresAuth = false;
      } else if (isProtectedRoute) {
        requiresAuth = true;
      }

      // Apply authentication middleware
      if (requiresAuth) {
        await authenticateToken(req, res, (err) => {
          if (err) {
            return res.status(401).json(response.error('Authentication required', 401));
          }
          next();
        });
      } else {
        // Use optional auth for public routes to get user context if available
        await optionalAuth(req, res, next);
      }
    } catch (error) {
      return res.status(500).json(response.error('API Gateway error', 500));
    }
  };
};

/**
 * Service-specific routing middleware
 */
export const serviceRouter = (serviceConfig) => {
  return (req, res, next) => {
    const path = req.path;
    
    // Find matching service
    for (const [serviceName, config] of Object.entries(serviceConfig)) {
      if (path.startsWith(config.prefix)) {
        req.service = serviceName;
        req.serviceConfig = config;
        
        // Add service-specific headers
        if (config.headers) {
          Object.assign(req.headers, config.headers);
        }
        
        // Add service context to request
        req.serviceContext = {
          name: serviceName,
          prefix: config.prefix,
          version: config.version,
        };
        
        break;
      }
    }
    
    next();
  };
};

/**
 * Rate limiting middleware (basic implementation)
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v.windowStart < windowStart) {
        requests.delete(k);
      }
    }

    // Get or create request counter
    let requestData = requests.get(key);
    if (!requestData || requestData.windowStart < windowStart) {
      requestData = {
        count: 0,
        windowStart: now,
      };
      requests.set(key, requestData);
    }

    // Check rate limit
    if (requestData.count >= maxRequests) {
      return res.status(429).json(response.error('Too many requests', 429));
    }

    // Increment counter
    requestData.count++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - requestData.count,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
    });

    // Track successful requests if needed
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode < 400) {
          requestData.count = Math.max(0, requestData.count - 1);
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
};

/**
 * CORS middleware with service-specific configuration
 */
export const corsWithServices = (serviceConfig) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    const service = req.service;

    // Get CORS config for the service
    const corsConfig = serviceConfig[service]?.cors || serviceConfig.default?.cors || {};

    const {
      allowedOrigins = ['*'],
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders = ['Content-Type', 'Authorization'],
      credentials = true,
    } = corsConfig;

    // Check if origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', credentials.toString());

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  };
};

/**
 * Request logging middleware with service context
 */
export const requestLogger = (logger) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      service: req.service,
      userId: req.user?.userId,
    });

    // Log response
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        service: req.service,
        userId: req.user?.userId,
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Health check middleware for services
 */
export const healthCheck = (serviceConfig) => {
  return (req, res, next) => {
    if (req.path === '/health' || req.path === '/api/health') {
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {},
      };

      // Add service-specific health checks
      for (const [serviceName, config] of Object.entries(serviceConfig)) {
        health.services[serviceName] = {
          status: 'ok',
          version: config.version,
          uptime: process.uptime(),
        };
      }

      return res.json(health);
    }

    next();
  };
};
