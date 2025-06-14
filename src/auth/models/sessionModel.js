const { pool } = require('../../config/database');
const { generateSecureToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');
const redisClient = require('../../config/redis');

/**
 * Create a new session
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} Created session object
 */
exports.createSession = async (sessionData) => {
  const { userId, expiresAt, ipAddress, userAgent } = sessionData;
  const sessionToken = generateSecureToken(32);

  try {
    // Store session in database for persistence
    const query = `
      INSERT INTO user_sessions (
        user_id, 
        session_token, 
        expires_at, 
        ip_address, 
        user_agent, 
        created_at
      ) 
      VALUES ($1, $2, $3, $4, $5, NOW()) 
      RETURNING id, session_token, expires_at
    `;

    const values = [userId, sessionToken, expiresAt, ipAddress, userAgent];
    const result = await pool.query(query, values);
    const session = result.rows[0];

    // Also store in Redis for faster access
    const sessionData = {
      id: session.id,
      userId,
      expiresAt: expiresAt.toISOString()
    };

    // Calculate TTL in seconds
    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    
    // Store in Redis with expiration
    await redisClient.set(
      `session:${sessionToken}`, 
      JSON.stringify(sessionData),
      'EX',
      ttlSeconds
    );

    return {
      id: session.id,
      token: sessionToken,
      expiresAt: session.expires_at
    };
  } catch (error) {
    logger.error('Database error creating session', { error: error.message, userId });
    throw new Error('Failed to create session');
  }
};

/**
 * Find session by token
 * @param {string} token - Session token
 * @returns {Promise<Object|null>} Session object or null if not found
 */
exports.findSessionByToken = async (token) => {
  try {
    // First try to get from Redis for performance
    const cachedSession = await redisClient.get(`session:${token}`);
    
    if (cachedSession) {
      return JSON.parse(cachedSession);
    }

    // If not in Redis, check database
    const query = `
      SELECT s.id, s.user_id, s.expires_at, u.role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW()
    `;
    
    const result = await pool.query(query, [token]);
    const session = result.rows[0];
    
    if (!session) {
      return null;
    }

    // Store in Redis for future requests
    const sessionData = {
      id: session.id,
      userId: session.user_id,
      role: session.role,
      expiresAt: session.expires_at.toISOString()
    };

    // Calculate TTL in seconds
    const ttlSeconds = Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000);
    
    if (ttlSeconds > 0) {
      await redisClient.set(
        `session:${token}`, 
        JSON.stringify(sessionData),
        'EX',
        ttlSeconds
      );
    }

    return sessionData;
  } catch (error) {
    logger.error('Error finding session by token', { error: error.message });
    throw new Error('Failed to find session');
  }
};

/**
 * Invalidate a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
exports.invalidateSession = async (sessionId) => {
  try {
    // Get session token first to remove from Redis
    const tokenQuery = `
      SELECT session_token FROM user_sessions WHERE id = $1
    `;
    const tokenResult = await pool.query(tokenQuery, [sessionId]);
    const sessionToken = tokenResult.rows[0]?.session_token;

    // Delete from database
    const query = `
      DELETE FROM user_sessions WHERE id = $1
    `;
    await pool.query(query, [sessionId]);

    // Also remove from Redis if token was found
    if (sessionToken) {
      await redisClient.del(`session:${sessionToken}`);
    }
  } catch (error) {
    logger.error('Database error invalidating session', { error: error.message, sessionId });
    throw new Error('Failed to invalidate session');
  }
};

/**
 * Invalidate all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
exports.invalidateUserSessions = async (userId) => {
  try {
    // Get all session tokens for this user to remove from Redis
    const tokensQuery = `
      SELECT session_token FROM user_sessions WHERE user_id = $1
    `;
    const tokensResult = await pool.query(tokensQuery, [userId]);
    const sessionTokens = tokensResult.rows.map(row => row.session_token);

    // Delete from database
    const query = `
      DELETE FROM user_sessions WHERE user_id = $1
    `;
    await pool.query(query, [userId]);

    // Also remove from Redis
    for (const token of sessionTokens) {
      await redisClient.del(`session:${token}`);
    }
  } catch (error) {
    logger.error('Database error invalidating user sessions', { error: error.message, userId });
    throw new Error('Failed to invalidate user sessions');
  }
};

/**
 * Update session last activity
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
exports.updateSessionActivity = async (sessionId) => {
  try {
    const query = `
      UPDATE user_sessions 
      SET last_activity = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [sessionId]);
  } catch (error) {
    logger.error('Database error updating session activity', { error: error.message, sessionId });
    // Don't throw error for activity updates to prevent disrupting user experience
  }
};