const { validatePasswordStrength } = require('../validators/passwordValidator');

/**
 * Password policy configuration
 */
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventSequentialChars: true,
  preventRepeatedChars: true,
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  historySize: 5 // Number of previous passwords to remember
};

/**
 * Validate password against policy
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
exports.validatePassword = (password) => {
  return validatePasswordStrength(password);
};

/**
 * Check if password needs to be changed
 * @param {Date} passwordChangedAt - Date when password was last changed
 * @returns {boolean} Whether password needs to be changed
 */
exports.isPasswordChangeRequired = (passwordChangedAt) => {
  if (!passwordChangedAt) {
    return true;
  }
  
  const now = new Date();
  const lastChanged = new Date(passwordChangedAt);
  const diffTime = now.getTime() - lastChanged.getTime();
  
  return diffTime > passwordPolicy.maxAge;
};

/**
 * Check if password is in history
 * @param {string} newPassword - New password (hashed)
 * @param {Array} passwordHistory - Array of previous passwords (hashed)
 * @returns {boolean} Whether password is in history
 */
exports.isPasswordInHistory = async (newPassword, passwordHistory) => {
  if (!passwordHistory || !Array.isArray(passwordHistory)) {
    return false;
  }
  
  // This would need to be implemented based on your password hashing algorithm
  // For Argon2, you would need to use argon2.verify for each password in history
  
  return false;
};

module.exports.passwordPolicy = passwordPolicy;