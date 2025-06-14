/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with success flag and message
 */
exports.validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      success: false,
      message: 'Password is required'
    };
  }

  // Check length
  if (password.length < 12) {
    return {
      success: false,
      message: 'Password must be at least 12 characters long'
    };
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one number'
    };
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      success: false,
      message: 'Password must contain at least one special character'
    };
  }

  // Check for common passwords
  const commonPasswords = [
    'password123', 'qwerty123', '123456789', 'admin123', 'welcome123',
    'letmein123', 'monkey123', 'sunshine123', 'princess123', 'football123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      success: false,
      message: 'Password is too common. Please choose a more secure password.'
    };
  }

  // Check for sequential characters
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    return {
      success: false,
      message: 'Password contains sequential characters. Please choose a more secure password.'
    };
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    return {
      success: false,
      message: 'Password contains repeated characters. Please choose a more secure password.'
    };
  }

  return {
    success: true,
    message: 'Password meets strength requirements'
  };
};

/**
 * Calculate password strength score
 * @param {string} password - Password to evaluate
 * @returns {number} Score from 0-100
 */
exports.calculatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return 0;
  }

  let score = 0;

  // Length score (up to 25 points)
  score += Math.min(25, password.length * 2);

  // Character variety (up to 25 points)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  score += (hasUppercase ? 6 : 0);
  score += (hasLowercase ? 6 : 0);
  score += (hasNumbers ? 6 : 0);
  score += (hasSpecialChars ? 7 : 0);

  // Complexity (up to 25 points)
  const uniqueChars = new Set(password).size;
  score += Math.min(25, uniqueChars * 2);

  // Penalize common patterns (up to -25 points)
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    score -= 10;
  }
  
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
  }
  
  if (/12345|23456|34567|45678|56789|67890/.test(password)) {
    score -= 10;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};