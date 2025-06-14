const { Pool } = require('pg');
const config = require('./config');
const logger = require('../auth/utils/logger');

// Create a connection pool
const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  ssl: config.db.ssl ? {
    rejectUnauthorized: config.db.rejectUnauthorized
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000 // How long to wait for a connection to become available
});

// Log pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err.message, stack: err.stack });
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    logger.info('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection error', { error: error.message, stack: error.stack });
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};