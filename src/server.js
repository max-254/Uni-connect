const http = require('http');
const https = require('https');
const fs = require('fs');
const app = require('./app');
const config = require('./config/config');
const logger = require('./auth/utils/logger');

// Determine if we should use HTTPS
const useHttps = config.app.env === 'production' || process.env.USE_HTTPS === 'true';

let server;

if (useHttps) {
  try {
    // Read SSL certificates
    const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH || 'ssl/key.pem', 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERT_PATH || 'ssl/cert.pem', 'utf8');
    
    const credentials = { key: privateKey, cert: certificate };
    
    // Create HTTPS server
    server = https.createServer(credentials, app);
    
    logger.info('Starting server with HTTPS');
  } catch (error) {
    logger.error('Failed to read SSL certificates', { error: error.message });
    logger.info('Falling back to HTTP server');
    server = http.createServer(app);
  }
} else {
  // Create HTTP server
  server = http.createServer(app);
  logger.info('Starting server with HTTP');
}

// Start server
const PORT = config.app.port;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.app.env} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  // Don't exit the process in production, just log the error
  if (config.app.env !== 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  // Always exit on uncaught exceptions
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);