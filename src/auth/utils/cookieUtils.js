const config = require('../../config/config');

/**
 * Set session cookie
 * @param {Object} res - Express response object
 * @param {string} token - Session token
 * @param {Date} expiresAt - Expiration date
 * @param {boolean} rememberMe - Whether to set a long-lived cookie
 */
exports.setSessionCookie = (res, token, expiresAt, rememberMe = false) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.app.env === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/'
  };

  res.cookie('session', token, cookieOptions);
};

/**
 * Clear session cookie
 * @param {Object} res - Express response object
 */
exports.clearSessionCookie = (res) => {
  res.clearCookie('session', {
    httpOnly: true,
    secure: config.app.env === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

/**
 * Set CSRF cookie
 * @param {Object} res - Express response object
 * @param {string} token - CSRF token
 */
exports.setCsrfCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: false, // Must be accessible from JavaScript
    secure: config.app.env === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  };

  res.cookie('csrf-token', token, cookieOptions);
};