const crypto = require('crypto');

/**
 * Generate a secure random token
 * @param {number} bytes - Number of bytes for the token
 * @returns {string} Hex-encoded token
 */
exports.generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a token using SHA-256
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
exports.hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Generate a CSRF token
 * @returns {string} CSRF token
 */
exports.generateCsrfToken = () => {
  return exports.generateSecureToken(32);
};

/**
 * Verify CSRF token
 * @param {string} token - Token from request
 * @param {string} storedToken - Token from session
 * @returns {boolean} Whether token is valid
 */
exports.verifyCsrfToken = (token, storedToken) => {
  if (!token || !storedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'), 
    Buffer.from(storedToken, 'hex')
  );
};