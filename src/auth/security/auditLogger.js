const { pool } = require('../../config/database');
const logger = require('../utils/logger');

/**
 * Log authentication event for audit
 * @param {Object} eventData - Event data
 * @returns {Promise<void>}
 */
exports.logAuthEvent = async (eventData) => {
  const { 
    userId, 
    event, 
    details = {}, 
    ip, 
    userAgent, 
    success = true 
  } = eventData;

  try {
    const query = `
      INSERT INTO security_logs (
        user_id, 
        event_type, 
        description, 
        ip_address, 
        user_agent, 
        success, 
        created_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;

    const description = typeof details === 'string' 
      ? details 
      : JSON.stringify(details);

    const values = [
      userId, 
      event, 
      description, 
      ip, 
      userAgent, 
      success
    ];

    await pool.query(query, values);

    // Also log to security logger
    const logLevel = success ? 'info' : 'warn';
    logger.security[logLevel](event, { 
      userId, 
      ip, 
      userAgent, 
      success, 
      ...details 
    });
  } catch (error) {
    logger.error('Error logging auth event', { error: error.message, event, userId });
    // Don't throw error to prevent disrupting the main flow
  }
};

/**
 * Get audit logs for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Audit logs
 */
exports.getUserAuditLogs = async (userId, options = {}) => {
  const { 
    limit = 50, 
    offset = 0, 
    startDate, 
    endDate, 
    eventTypes = [] 
  } = options;

  try {
    let query = `
      SELECT id, event_type, description, ip_address, user_agent, success, created_at
      FROM security_logs
      WHERE user_id = $1
    `;

    const queryParams = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (eventTypes.length > 0) {
      query += ` AND event_type = ANY($${paramIndex})`;
      queryParams.push(eventTypes);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    return result.rows;
  } catch (error) {
    logger.error('Error getting user audit logs', { error: error.message, userId });
    throw new Error('Failed to retrieve audit logs');
  }
};

/**
 * Get all audit logs (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Audit logs
 */
exports.getAllAuditLogs = async (options = {}) => {
  const { 
    limit = 100, 
    offset = 0, 
    startDate, 
    endDate, 
    eventTypes = [],
    userId
  } = options;

  try {
    let query = `
      SELECT s.id, s.user_id, s.event_type, s.description, s.ip_address, 
             s.user_agent, s.success, s.created_at, u.email as user_email
      FROM security_logs s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND s.user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND s.created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND s.created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (eventTypes.length > 0) {
      query += ` AND s.event_type = ANY($${paramIndex})`;
      queryParams.push(eventTypes);
      paramIndex++;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    return result.rows;
  } catch (error) {
    logger.error('Error getting all audit logs', { error: error.message });
    throw new Error('Failed to retrieve audit logs');
  }
};