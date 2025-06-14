/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with success flag and message
 */
exports.validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      success: false,
      message: 'Email is required'
    };
  }

  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email format'
    };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    'mailinator.com', 'tempmail.com', 'throwawaymail.com', 'yopmail.com',
    'guerrillamail.com', '10minutemail.com', 'trashmail.com', 'sharklasers.com'
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  if (disposableDomains.includes(domain)) {
    return {
      success: false,
      message: 'Disposable email addresses are not allowed'
    };
  }

  // Check for common typos in email domains
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com'
  };
  
  if (commonTypos[domain]) {
    return {
      success: false,
      message: `Did you mean ${email.split('@')[0]}@${commonTypos[domain]}?`
    };
  }

  return {
    success: true,
    message: 'Email format is valid'
  };
};

/**
 * Normalize email address
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email
 */
exports.normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return email;
  }

  // Convert to lowercase
  let normalizedEmail = email.toLowerCase();
  
  // Handle Gmail dots and plus addressing
  if (normalizedEmail.endsWith('@gmail.com')) {
    // Remove dots from username part
    const [username, domain] = normalizedEmail.split('@');
    const normalizedUsername = username.replace(/\./g, '');
    
    // Remove everything after + in username
    const plusIndex = normalizedUsername.indexOf('+');
    const finalUsername = plusIndex !== -1 
      ? normalizedUsername.substring(0, plusIndex) 
      : normalizedUsername;
    
    normalizedEmail = `${finalUsername}@${domain}`;
  }
  
  return normalizedEmail;
};