const { generateSecureToken, verifyCsrfToken } = require('../utils/tokenUtils');
const { setCsrfCookie } = require('../utils/cookieUtils');
const logger = require('../utils/logger');

/**
 * Generate CSRF token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.generateCsrfToken = (req, res, next) => {
  // Only generate token for authenticated users
  if (req.user) {
    const csrfToken = generateSecureToken(32);
    
    // Store token in session
    req.session.csrfToken = csrfToken;
    
    // Set CSRF cookie
    setCsrfCookie(res, csrfToken);
  }
  
  next();
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