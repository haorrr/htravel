/**
 * Geocoding Service
 * Handles reverse geocoding with Google Maps API
 * Includes caching and retry logic for rate limit handling
 */

const axios = require('axios');
const cacheManager = require('../utils/cacheManager');
const logger = require('../utils/logger');

class GeocodingService {
  constructor() {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      logger.warn('GOOGLE_MAPS_API_KEY not configured - geocoding will be disabled');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.cacheTtl = 30 * 24 * 60 * 60; // 30 days in seconds (Google ToS compliant)
  }

  /**
   * Generate cache key from coordinates (rounded to 4 decimals ~11m accuracy)
   */
  getCacheKey(lat, lng) {
    return `geocode:${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  /**
   * Retry function with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const isRateLimit = error.response?.data?.status === 'OVER_QUERY_LIMIT';

        if (isRateLimit && i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
          logger.warn(`Geocoding rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (!isRateLimit) {
          throw error;
        }
      }
    }
    throw lastError;
  }

  /**
   * Extract province from geocoding result
   * Priority: administrative_area_level_1 > locality > country
   */
  extractProvince(result) {
    const components = result.address_components || [];

    // Priority 1: Province/State level (e.g., "Hồ Chí Minh", "Hà Nội")
    const province = components.find(c =>
      c.types.includes('administrative_area_level_1')
    );
    if (province) return province.long_name;

    // Priority 2: City/Locality
    const locality = components.find(c => c.types.includes('locality'));
    if (locality) return locality.long_name;

    // Priority 3: Country (fallback)
    const country = components.find(c => c.types.includes('country'));
    return country?.long_name || 'Unknown';
  }

  /**
   * Perform reverse geocoding
   */
  async reverseGeocode(latitude, longitude) {
    if (!this.enabled) {
      throw new Error('Geocoding service is not configured');
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }

    const cacheKey = this.getCacheKey(latitude, longitude);

    // Check cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Geocoding cache hit: ${cacheKey}`);
      return cached;
    }

    // Call Google Geocoding API with retry logic
    logger.info(`Geocoding API call for: ${latitude},${longitude}`);
    const result = await this.retryWithBackoff(async () => {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
          language: 'vi', // Get Vietnamese names
        },
        timeout: 5000,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
      }

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('No geocoding results found');
      }

      return response.data.results[0];
    });

    const province = this.extractProvince(result);
    const formattedAddress = result.formatted_address;

    const data = {
      province,
      formattedAddress,
      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    };

    // Cache the result
    cacheManager.set(cacheKey, data, this.cacheTtl);
    logger.info(`Geocoding cached: ${cacheKey} -> ${province}`);

    return data;
  }

  /**
   * Get only province name (convenience method)
   */
  async getProvince(latitude, longitude) {
    const { province } = await this.reverseGeocode(latitude, longitude);
    return province;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      cacheSize: cacheManager.size(),
    };
  }
}

module.exports = new GeocodingService();
