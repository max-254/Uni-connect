const redis = require('../../config/redis');
const logger = require('../utils/logger');

/**
 * Rate limiter middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.rateLimiterMiddleware = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 60,             // 60 requests per minute
    keyGenerator = (req) => `${req.ip}:${req.path}`,
    handler = (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
    }
  } = options;

  return async (req, res, next) => {
    try {
      const key = `ratelimit:${keyGenerator(req)}`;
      const current = await redis.incr(key);
      
      // Set expiry on first request
      if (current === 1) {
        await redis.expire(key, Math.floor(windowMs / 1000));
      }
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      
      // Get TTL for the key
      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Reset', ttl);
      
      if (current > max) {
        logger.warn('Rate limit exceeded', { 
          ip: req.ip, 
          path: req.path, 
          method: req.method,
          current,
          max
        });
        
        return handler(req, res);
      }
      
      next();
    } catch (error) {
      logger.error('Rate limiter error', { error: error.message });
      next(); // Continue on error to prevent blocking requests
    }
  };
};

/**
 * Function-based rate limiter for internal use
 * @param {Object} req - Express request object
 * @param {string} action - Action name
 * @param {number} limit - Maximum number of requests
 * @param {number} period - Time period in seconds
 * @returns {Object} Result object with success flag
 */
exports.rateLimit = async (req, action, limit, period) => {
  try {
    const key = `ratelimit:${action}:${req.ip}`;
    const current = await redis.incr(key);
    
    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, period);
    }
    
    if (current > limit) {
      logger.warn('Rate limit exceeded', { 
        ip: req.ip, 
        action,
        current,
        limit
      });
      
      return { 
        success: false, 
        current, 
        limit, 
        ttl: await redis.ttl(key) 
      };
    }
    
    return { 
      success: true, 
      current, 
      limit, 
      ttl: await redis.ttl(key) 
    };
  } catch (error) {
    logger.error('Rate limiter error', { error: error.message, action });
    return { success: true }; // Continue on error to prevent blocking requests
  }
};