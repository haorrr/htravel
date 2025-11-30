/**
 * Google Places Service
 * Handles place search, nearby search, and place details
 * Uses Google Maps Platform Places API
 */

const axios = require('axios');
const cacheManager = require('../utils/cacheManager');
const logger = require('../utils/logger');

class PlacesService {
  constructor() {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      logger.warn('GOOGLE_MAPS_API_KEY not configured - Places API will be disabled');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    this.cacheTtl = 24 * 60 * 60; // 24 hours in seconds
  }

  /**
   * Text search for places
   * @param {string} query - Search query (e.g., "restaurants in Hanoi")
   * @param {number} latitude - Optional: user's latitude for location bias
   * @param {number} longitude - Optional: user's longitude for location bias
   * @param {number} radius - Optional: search radius in meters (max 50000)
   * @param {string} type - Optional: place type filter (restaurant, cafe, etc.)
   */
  async textSearch(query, { latitude, longitude, radius, type } = {}) {
    if (!this.enabled) {
      throw new Error('Places service is not configured');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    const cacheKey = `places:text:${query}:${latitude}:${longitude}:${radius}:${type}`;

    // Check cache
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Places cache hit: ${cacheKey}`);
      return cached;
    }

    logger.info('Places API text search:', { query, latitude, longitude });

    const params = {
      query,
      key: this.apiKey,
      language: 'vi', // Vietnamese results
    };

    // Add location bias if provided
    if (latitude && longitude) {
      params.location = `${latitude},${longitude}`;
      if (radius) {
        params.radius = Math.min(radius, 50000); // Max 50km
      }
    }

    // Add type filter if provided
    if (type) {
      params.type = type;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/textsearch/json`, {
        params,
        timeout: 10000,
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }

      const results = this.formatPlacesResults(response.data.results || []);

      // Cache results
      cacheManager.set(cacheKey, results, this.cacheTtl);

      return results;
    } catch (error) {
      logger.error('Places text search failed:', {
        error: error.message,
        query,
      });
      throw error;
    }
  }

  /**
   * Nearby search for places
   * @param {number} latitude - Center latitude
   * @param {number} longitude - Center longitude
   * @param {number} radius - Search radius in meters (max 50000)
   * @param {string} type - Optional: place type (restaurant, tourist_attraction, etc.)
   * @param {string} keyword - Optional: keyword to search
   */
  async nearbySearch(latitude, longitude, radius, { type, keyword } = {}) {
    if (!this.enabled) {
      throw new Error('Places service is not configured');
    }

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    if (!radius || radius <= 0) {
      throw new Error('Valid radius is required');
    }

    // Limit radius to 50km (Google Maps API limit)
    radius = Math.min(radius, 50000);

    const cacheKey = `places:nearby:${latitude}:${longitude}:${radius}:${type}:${keyword}`;

    // Check cache
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Places cache hit: ${cacheKey}`);
      return cached;
    }

    logger.info('Places API nearby search:', {
      location: `${latitude},${longitude}`,
      radius,
      type,
      keyword,
    });

    const params = {
      location: `${latitude},${longitude}`,
      radius,
      key: this.apiKey,
      language: 'vi',
    };

    if (type) {
      params.type = type;
    }

    if (keyword) {
      params.keyword = keyword;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
        params,
        timeout: 10000,
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }

      const results = this.formatPlacesResults(response.data.results || []);

      // Cache results
      cacheManager.set(cacheKey, results, this.cacheTtl);

      return results;
    } catch (error) {
      logger.error('Places nearby search failed:', {
        error: error.message,
        location: `${latitude},${longitude}`,
        radius,
      });
      throw error;
    }
  }

  /**
   * Get place details by place ID
   * @param {string} placeId - Google Place ID
   * @param {Array<string>} fields - Optional: specific fields to retrieve
   */
  async getPlaceDetails(placeId, fields = null) {
    if (!this.enabled) {
      throw new Error('Places service is not configured');
    }

    if (!placeId) {
      throw new Error('Place ID is required');
    }

    const cacheKey = `places:details:${placeId}`;

    // Check cache
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Places cache hit: ${cacheKey}`);
      return cached;
    }

    logger.info('Places API details:', { placeId });

    const params = {
      place_id: placeId,
      key: this.apiKey,
      language: 'vi',
    };

    // If specific fields requested, use them (reduces API costs)
    if (fields && fields.length > 0) {
      params.fields = fields.join(',');
    } else {
      // Default fields for comprehensive details
      params.fields = [
        'place_id',
        'name',
        'formatted_address',
        'geometry',
        'rating',
        'user_ratings_total',
        'reviews',
        'opening_hours',
        'formatted_phone_number',
        'website',
        'photos',
        'types',
        'price_level',
      ].join(',');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params,
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Places API error: ${response.data.status}`);
      }

      const details = this.formatPlaceDetails(response.data.result);

      // Cache for longer (place details don't change often)
      cacheManager.set(cacheKey, details, this.cacheTtl * 7); // 7 days

      return details;
    } catch (error) {
      logger.error('Places details failed:', {
        error: error.message,
        placeId,
      });
      throw error;
    }
  }

  /**
   * Format places results for consistent API response
   */
  formatPlacesResults(places) {
    return places.map(place => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      rating: place.rating || null,
      ratingsCount: place.user_ratings_total || 0,
      priceLevel: place.price_level || null, // 0-4 scale
      types: place.types || [],
      openNow: place.opening_hours?.open_now || null,
      photos: place.photos?.slice(0, 3).map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        // URL to get photo (requires another API call)
        url: `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`,
      })) || [],
    }));
  }

  /**
   * Format place details for comprehensive information
   */
  formatPlaceDetails(place) {
    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      rating: place.rating || null,
      ratingsCount: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      types: place.types || [],
      phoneNumber: place.formatted_phone_number || null,
      website: place.website || null,
      openingHours: place.opening_hours ? {
        openNow: place.opening_hours.open_now,
        weekdayText: place.opening_hours.weekday_text || [],
      } : null,
      reviews: (place.reviews || []).slice(0, 5).map(review => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relativeTime: review.relative_time_description,
      })),
      photos: (place.photos || []).slice(0, 5).map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        url: `${this.baseUrl}/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.apiKey}`,
      })),
    };
  }

  /**
   * Get popular place types
   */
  getPlaceTypes() {
    return [
      'restaurant',
      'cafe',
      'bar',
      'tourist_attraction',
      'museum',
      'park',
      'shopping_mall',
      'hotel',
      'spa',
      'night_club',
      'movie_theater',
      'gym',
      'library',
      'church',
      'temple',
      'mosque',
      'beach',
    ];
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      cacheSize: cacheManager.size(),
      availableTypes: this.getPlaceTypes().length,
    };
  }
}

module.exports = new PlacesService();
