/**
 * Cache Middleware
 * Express middleware for caching API responses
 */

const cacheManager = require('../utils/cacheManager');
const logger = require('../utils/logger');

/**
 * Create cache middleware with configurable TTL
 * @param {Number} ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    // Check cache
    const cachedResponse = cacheManager.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return res.json(cachedResponse);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheManager.set(cacheKey, body, ttlSeconds);
        logger.debug(`Cache stored: ${cacheKey}, TTL: ${ttlSeconds}s`);
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = cacheMiddleware;
