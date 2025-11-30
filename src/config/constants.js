/**
 * Application-wide constants and configuration values
 */

module.exports = {
  /**
   * User role enumeration
   */
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  /**
   * File upload limits (5MB maximum)
   */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  /**
   * Allowed image MIME types for uploads
   */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  /**
   * Pagination defaults
   */
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  /**
   * Cache TTL values (in seconds)
   */
  CACHE_TTL: {
    GOOGLE_MAPS: 30 * 24 * 60 * 60, // 30 days (Google Maps terms allow this)
    LANDMARK: 7 * 24 * 60 * 60,     // 7 days
  },

  /**
   * Rate limiting quotas per user
   */
  QUOTAS: {
    VIRTUAL_TRAVEL_DAILY: 5,       // AI image generation quota
    PLACES_SEARCH_DAILY: 50,       // Google Places search quota
  },
};
