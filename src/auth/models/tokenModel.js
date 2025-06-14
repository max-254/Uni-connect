const { pool } = require('../../config/database');
const logger = require('../utils/logger');

/**
 * Create a password reset token
 * @param {Object} tokenData - Token data
 * @returns {Promise<Object>} Created token object
 */
exports.createPasswordResetToken = async (tokenData) => {
  const { userId, token, expiresAt } = tokenData;

  try {
    // First, invalidate any existing tokens for this user
    await exports.invalidateUserResetTokens(userId);

    // Then create new token
    const query = `
      INSERT INTO password_reset_tokens (
        user_id, 
        token, 
        expires_at, 
        created_at
      ) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING id, expires_at
    `;

    const values = [userId, token, expiresAt];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    logger.error('Database error creating password reset token', { error: error.message, userId });
    throw new Error('Failed to create password reset token');
  }
};

/**
 * Find password reset token
 * @param {string} token - Hashed token
 * @returns {Promise<Object|null>} Token object or null if not found
 */
exports.findPasswordResetToken = async (token) => {
  try {
    const query = `
      SELECT id, user_id, expires_at
      FROM password_reset_tokens 
      WHERE token = $1 AND expires_at > NOW()
    `;
    
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Database error finding password reset token', { error: error.message });
    throw new Error('Failed to find password reset token');
  }
};

/**
 * Delete password reset token
 * @param {string} tokenId - Token ID
 * @returns {Promise<void>}
 */
exports.deletePasswordResetToken = async (tokenId) => {
  try {
    const query = `
      DELETE FROM password_reset_tokens 
      WHERE id = $1
    `;
    
    await pool.query(query, [tokenId]);
  } catch (error) {
    logger.error('Database error deleting password reset token', { error: error.message, tokenId });
    throw new Error('Failed to delete password reset token');
  }
};

/**
 * Invalidate all reset tokens for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
exports.invalidateUserResetTokens = async (userId) => {
  try {
    const query = `
      DELETE FROM password_reset_tokens 
      WHERE user_id = $1
    `;
    
    await pool.query(query, [userId]);
  } catch (error) {
    logger.error('Database error invalidating user reset tokens', { error: error.message, userId });
    throw new Error('Failed to invalidate user reset tokens');
  }
};