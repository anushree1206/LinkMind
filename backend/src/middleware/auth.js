import { verifyToken } from '../utils/jwtUtils.js';
import User from '../models/User.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to req.user
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'NO_TOKEN_PROVIDED'
      });
    }

    try {
      // Verify the token
      const decoded = verifyToken(token);
      
      // Check if token has required fields
      if (!decoded.userId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format',
          error: 'INVALID_TOKEN_FORMAT'
        });
      }

      // Find user in database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
          error: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Attach user to request object
      req.user = user;
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      next();
    } catch (tokenError) {
      if (tokenError.message === 'Token has expired') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          error: 'TOKEN_EXPIRED'
        });
      } else if (tokenError.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          error: 'INVALID_TOKEN'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed',
          error: 'TOKEN_VERIFICATION_FAILED'
        });
      }
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTHENTICATION_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't fail if no token is provided
 * Useful for routes that can work with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyToken(token);
      
      if (!decoded.userId) {
        req.user = null;
        return next();
      }

      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        req.user = null;
        return next();
      }

      req.user = user;
      next();
    } catch (tokenError) {
      // Token verification failed, continue without authentication
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    req.user = null;
    next();
  }
};

/**
 * Role-based access control middleware
 * Checks if user has required role(s)
 * @param {string|Array} requiredRoles - Role(s) required to access the route
 */
export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Convert single role to array for consistent handling
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // For now, all authenticated users have access
    // You can extend this to include actual role checking when you implement roles
    if (roles.includes('user') || roles.includes('admin')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
      error: 'INSUFFICIENT_PERMISSIONS'
    });
  };
};

/**
 * Admin-only middleware
 * Checks if user is an admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'AUTHENTICATION_REQUIRED'
    });
  }

  // For now, all authenticated users have access
  // You can extend this to include actual admin checking when you implement roles
  return next();
};

/**
 * Self-access middleware
 * Ensures user can only access their own resources
 * @param {string} resourceUserIdField - Field name containing the user ID to check
 */
export const requireSelfAccess = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not provided',
        error: 'RESOURCE_USER_ID_MISSING'
      });
    }

    // Check if user is accessing their own resource
    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this resource',
        error: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

export default {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireSelfAccess
};
