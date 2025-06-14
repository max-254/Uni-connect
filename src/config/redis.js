const redis = require('redis');
const { promisify } = require('util');
const config = require('./config');
const logger = require('../auth/utils/logger');

// Create Redis client
const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: config.redis.tls ? {} : undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

// Log Redis errors
client.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

// Promisify Redis methods
const asyncRedis = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  del: promisify(client.del).bind(client),
  incr: promisify(client.incr).bind(client),
  expire: promisify(client.expire).bind(client),
  ttl: promisify(client.ttl).bind(client),
  exists: promisify(client.exists).bind(client),
  keys: promisify(client.keys).bind(client),
  flushall: promisify(client.flushall).bind(client)
};

module.exports = asyncRedis;