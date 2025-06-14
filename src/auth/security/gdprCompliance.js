const { pool } = require('../../config/database');
const logger = require('../utils/logger');

/**
 * Export user data for GDPR compliance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data export
 */
exports.exportUserData = async (userId) => {
  try {
    // Get user data
    const userQuery = `
      SELECT id, email, name, role, preferred_language, is_verified, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];
    
    if (!user) {
      throw new Error('User not found');
    }

    // Get user sessions
    const sessionsQuery = `
      SELECT id, ip_address, user_agent, created_at, last_activity
      FROM user_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const sessionsResult = await pool.query(sessionsQuery, [userId]);
    const sessions = sessionsResult.rows;

    // Get security logs
    const logsQuery = `
      SELECT event_type, description, ip_address, user_agent, success, created_at
      FROM security_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const logsResult = await pool.query(logsQuery, [userId]);
    const logs = logsResult.rows;

    // Compile data export
    const dataExport = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferredLanguage: user.preferred_language,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      sessions: sessions.map(session => ({
        id: session.id,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        createdAt: session.created_at,
        lastActivity: session.last_activity
      })),
      securityLogs: logs.map(log => ({
        eventType: log.event_type,
        description: log.description,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        success: log.success,
        createdAt: log.created_at
      }))
    };

    // Log data export
    logger.security.info('User data exported', { userId });

    return dataExport;
  } catch (error) {
    logger.error('Error exporting user data', { error: error.message, userId });
    throw new Error('Failed to export user data');
  }
};

/**
 * Delete user data for GDPR compliance
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success flag
 */
exports.deleteUserData = async (userId) => {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    // Delete user sessions
    await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

    // Delete password reset tokens
    await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);

    // Anonymize security logs
    await client.query(`
      UPDATE security_logs 
      SET user_id = NULL, 
          ip_address = NULL, 
          user_agent = NULL
      WHERE user_id = $1
    `, [userId]);

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    // Commit transaction
    await client.query('COMMIT');

    // Log user deletion
    logger.security.info('User data deleted', { userId });

    return true;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    logger.error('Error deleting user data', { error: error.message, userId });
    throw new Error('Failed to delete user data');
  } finally {
    client.release();
  }
};

/**
 * Update user consent
 * @param {string} userId - User ID
 * @param {Object} consentData - Consent data
 * @returns {Promise<boolean>} Success flag
 */
exports.updateUserConsent = async (userId, consentData) => {
  try {
    const { marketingConsent, dataProcessingConsent, thirdPartyConsent } = consentData;
    
    const query = `
      UPDATE users 
      SET 
        marketing_consent = $1,
        data_processing_consent = $2,
        third_party_consent = $3,
        consent_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = $4
    `;
    
    const values = [
      marketingConsent, 
      dataProcessingConsent, 
      thirdPartyConsent, 
      userId
    ];
    
    await pool.query(query, values);
    
    // Log consent update
    logger.security.info('User consent updated', { 
      userId, 
      marketingConsent, 
      dataProcessingConsent, 
      thirdPartyConsent 
    });
    
    return true;
  } catch (error) {
    logger.error('Error updating user consent', { error: error.message, userId });
    throw new Error('Failed to update user consent');
  }
};