const winston = require('winston');
const config = require('../../config/config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.app.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''} ${
            Object.keys(info).filter(key => 
              !['timestamp', 'level', 'message', 'stack', 'service'].includes(key)
            ).length > 0 
              ? JSON.stringify(Object.fromEntries(
                  Object.entries(info).filter(([key]) => 
                    !['timestamp', 'level', 'message', 'stack', 'service'].includes(key)
                  )
                ))
              : ''
          }`
        )
      )
    }),
    
    // Write to file in production
    ...(config.app.env === 'production' ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ] : [])
  ]
});

// Create a separate logger for security events
const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'security-service' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message} ${
            Object.keys(info).filter(key => 
              !['timestamp', 'level', 'message', 'service'].includes(key)
            ).length > 0 
              ? JSON.stringify(Object.fromEntries(
                  Object.entries(info).filter(([key]) => 
                    !['timestamp', 'level', 'message', 'service'].includes(key)
                  )
                ))
              : ''
          }`
        )
      )
    }),
    
    // Always write security logs to file
    new winston.transports.File({ 
      filename: 'logs/security.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ]
});

// Add security logging methods to main logger
logger.security = {
  info: (message, meta) => securityLogger.info(message, meta),
  warn: (message, meta) => securityLogger.warn(message, meta),
  error: (message, meta) => securityLogger.error(message, meta)
};

// If we're not in production, also log to the console with colorized output
if (config.app.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;