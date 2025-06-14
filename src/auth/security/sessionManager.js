const { 
  createSession, 
  findSessionByToken, 
  invalidateSession, 
  updateSessionActivity 
} = require('../models/sessionModel');
const { setSessionCookie, clearSessionCookie } = require('../utils/cookieUtils');
const { generateSecureToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');

/**
 * Create a new user session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 * @param {boolean} rememberMe - Whether to set a long-lived session
 * @returns {Promise<Object>} Session object
 */
exports.createUserSession = async (req, res, user, rememberMe = false) => {
  try {
    // Determine session expiration
    const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // 30 days or 2 hours
    const sessionExpiry = new Date(Date.now() + sessionDuration);

    // Create session
    const session = await createSession({
      userId: user.id,
      expiresAt: sessionExpiry,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Generate CSRF token
    const csrfToken = generateSecureToken(32);

    // Set session cookie
    setSessionCookie(res, session.token, sessionExpiry, rememberMe);

    // Return session data
    return {
      id: session.id,
      csrfToken,
      expiresAt: session.expiresAt
    };
  } catch (error) {
    logger.error('Error creating user session', { error: error.message, userId: user.id });
    throw new Error('Failed to create session');
  }
};

/**
 * Validate user session
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object|null>} Session data or null if invalid
 */
exports.validateSession = async (sessionToken) => {
  try {
    if (!sessionToken) {
      return null;
    }

    // Find session
    const session = await findSessionByToken(sessionToken);
    
    if (!session) {
      return null;
    }

    // Check session expiration
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    // Update session activity
    await updateSessionActivity(session.id);

    return session;
  } catch (error) {
    logger.error('Error validating session', { error: error.message });
    return null;
  }
};

/**
 * End user session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<boolean>} Success flag
 */
exports.endUserSession = async (req, res) => {
  try {
    // Get session token from cookie
    const sessionToken = req.cookies.session;
    
    if (!sessionToken) {
      return false;
    }

    // Find session
    const session = await findSessionByToken(sessionToken);
    
    if (!session) {
      return false;
    }

    // Invalidate session
    await invalidateSession(session.id);

    // Clear session cookie
    clearSessionCookie(res);

    return true;
  } catch (error) {
    logger.error('Error ending user session', { error: error.message });
    return false;
  }
};