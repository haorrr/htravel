/**
 * Cache Manager
 * In-memory cache with TTL support for geocoding results
 */

const logger = require('./logger');

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.setupCleanupInterval();
  }

  /**
   * Store value with expiry
   */
  set(key, value, ttlSeconds) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
    logger.debug(`Cache set: ${key}, TTL: ${ttlSeconds}s`);
  }

  /**
   * Retrieve value if not expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    return item.value;
  }

  /**
   * Delete specific key
   */
  delete(key) {
    this.cache.delete(key);
    logger.debug(`Cache deleted: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries every hour
   */
  setupCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cache cleanup: removed ${cleanedCount} expired entries`);
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

module.exports = new CacheManager();
