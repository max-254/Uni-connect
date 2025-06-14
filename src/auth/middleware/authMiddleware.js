const { findSessionByToken } = require('../models/sessionModel');
const { findUserById } = require('../models/userModel');
const { verifyCsrfToken } = require('../utils/tokenUtils');
const { updateSessionActivity } = require('../models/sessionModel');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies.session;
    
    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Find session
    const session = await findSessionByToken(sessionToken);
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }

    // Check session expiration
    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session has expired' 
      });
    }

    // Find user
    const user = await findUserById(session.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Attach user and session to request
    req.user = user;
    req.session = session;

    // Update session last activity
    await updateSessionActivity(session.id);

    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during authentication' 
    });
  }
};

/**
 * CSRF protection middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const storedCsrfToken = req.session?.csrfToken;

  if (!csrfToken || !storedCsrfToken || !verifyCsrfToken(csrfToken, storedCsrfToken)) {
    logger.security.warn('CSRF token validation failed', { 
      ip: req.ip, 
      path: req.path, 
      method: req.method 
    });
    
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or missing CSRF token' 
    });
  }

  next();
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Allowed roles
 * @returns {Function} Middleware function
 */
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.security.warn('Unauthorized access attempt', { 
        userId: req.user.id, 
        role: req.user.role, 
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this resource' 
      });
    }

    next();
  };
};