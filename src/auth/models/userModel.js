const { pool } = require('../../config/database');
const logger = require('../utils/logger');

/**
 * Create a new user in the database
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user object
 */
exports.createUser = async (userData) => {
  const { 
    email, 
    password, 
    name, 
    preferredLanguage, 
    verificationToken, 
    verificationTokenExpiry, 
    isVerified 
  } = userData;

  try {
    const query = `
      INSERT INTO users (
        email, 
        password, 
        name, 
        preferred_language, 
        verification_token, 
        verification_token_expiry, 
        is_verified,
        created_at,
        updated_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
      RETURNING id, email, name, preferred_language, role, is_verified, created_at
    `;

    const values = [
      email, 
      password, 
      name, 
      preferredLanguage, 
      verificationToken, 
      verificationTokenExpiry, 
      isVerified
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Database error creating user', { error: error.message });
    throw new Error('Failed to create user');
  }
};

/**
 * Find a user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.findUserByEmail = async (email) => {
  try {
    const query = `
      SELECT id, email, password, name, role, preferred_language, is_verified, 
             verification_token, verification_token_expiry, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Database error finding user by email', { error: error.message, email });
    throw new Error('Failed to find user');
  }
};

/**
 * Find a user by verification token
 * @param {string} token - Hashed verification token
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.findUserByVerificationToken = async (token) => {
  try {
    const query = `
      SELECT id, email, verification_token_expiry
      FROM users 
      WHERE verification_token = $1
    `;
    
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Database error finding user by verification token', { error: error.message });
    throw new Error('Failed to find user by verification token');
  }
};

/**
 * Update user verification status
 * @param {string} userId - User ID
 * @param {boolean} isVerified - Verification status
 * @returns {Promise<void>}
 */
exports.updateUserVerification = async (userId, isVerified) => {
  try {
    const query = `
      UPDATE users 
      SET is_verified = $1, 
          verification_token = NULL, 
          verification_token_expiry = NULL,
          updated_at = NOW()
      WHERE id = $2
    `;
    
    await pool.query(query, [isVerified, userId]);
  } catch (error) {
    logger.error('Database error updating user verification', { error: error.message, userId });
    throw new Error('Failed to update user verification status');
  }
};

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} hashedPassword - New hashed password
 * @returns {Promise<void>}
 */
exports.updateUserPassword = async (userId, hashedPassword) => {
  try {
    const query = `
      UPDATE users 
      SET password = $1, 
          password_changed_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
    `;
    
    await pool.query(query, [hashedPassword, userId]);
  } catch (error) {
    logger.error('Database error updating user password', { error: error.message, userId });
    throw new Error('Failed to update user password');
  }
};

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
exports.findUserById = async (userId) => {
  try {
    const query = `
      SELECT id, email, name, role, preferred_language, is_verified, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Database error finding user by ID', { error: error.message, userId });
    throw new Error('Failed to find user');
  }
};