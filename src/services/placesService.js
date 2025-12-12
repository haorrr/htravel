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
    
    // URL của Backend Server để phục vụ ảnh proxy
    // Hãy đảm bảo process.env.API_BASE_URL khớp với domain/port server của bạn (VD: http://localhost:5000)
    this.appBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000'; 
  }

  /**
   * Text search for places
   */
  async textSearch(query, { latitude, longitude, radius, type } = {}) {
    if (!this.enabled) throw new Error('Places service is not configured');
    if (!query || query.trim().length === 0) throw new Error('Search query is required');

    const cacheKey = `places:text:${query}:${latitude}:${longitude}:${radius}:${type}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Places cache hit: ${cacheKey}`);
      return cached;
    }

    logger.info('Places API text search:', { query, latitude, longitude });

    const params = { query, key: this.apiKey, language: 'vi' };
    if (latitude && longitude) {
      params.location = `${latitude},${longitude}`;
      if (radius) params.radius = Math.min(radius, 50000);
    }
    if (type) params.type = type;

    try {
      const response = await axios.get(`${this.baseUrl}/place/textsearch/json`, { params, timeout: 10000 });
      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }
      const results = this.formatPlacesResults(response.data.results || []);
      cacheManager.set(cacheKey, results, this.cacheTtl);
      return results;
    } catch (error) {
      logger.error('Places text search failed:', { error: error.message, query });
      throw error;
    }
  }

  /**
   * Nearby search for places
   */
  async nearbySearch(latitude, longitude, radius, { type, keyword } = {}) {
    if (!this.enabled) throw new Error('Places service is not configured');
    if (!latitude || !longitude) throw new Error('Latitude and longitude are required');
    if (!radius || radius <= 0) throw new Error('Valid radius is required');

    radius = Math.min(radius, 50000);
    const cacheKey = `places:nearby:${latitude}:${longitude}:${radius}:${type}:${keyword}`;
    
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Places cache hit: ${cacheKey}`);
      return cached;
    }

    logger.info('Places API nearby search:', { location: `${latitude},${longitude}`, radius });

    const params = { location: `${latitude},${longitude}`, radius, key: this.apiKey, language: 'vi' };
    if (type) params.type = type;
    if (keyword) params.keyword = keyword;

    try {
      const response = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, { params, timeout: 10000 });
      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API error: ${response.data.status}`);
      }
      const results = this.formatPlacesResults(response.data.results || []);
      cacheManager.set(cacheKey, results, this.cacheTtl);
      return results;
    } catch (error) {
      logger.error('Places nearby search failed:', { error: error.message });
      throw error;
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId, fields = null) {
    if (!this.enabled) throw new Error('Places service is not configured');
    if (!placeId) throw new Error('Place ID is required');

    const cacheKey = `places:details:${placeId}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      logger.info(`Places cache hit: ${cacheKey}`);
      return cached;
    }

    logger.info('Places API details:', { placeId });

    const params = { place_id: placeId, key: this.apiKey, language: 'vi' };
    
    if (fields && fields.length > 0) {
      params.fields = fields.join(',');
    } else {
      params.fields = [
        'place_id', 'name', 'formatted_address', 'geometry', 'rating', 
        'user_ratings_total', 'reviews', 'opening_hours', 
        'formatted_phone_number', 'website', 'photos', 'types', 'price_level'
      ].join(',');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, { params, timeout: 10000 });
      if (response.data.status !== 'OK') {
        throw new Error(`Places API error: ${response.data.status}`);
      }
      const details = this.formatPlaceDetails(response.data.result);
      cacheManager.set(cacheKey, details, this.cacheTtl * 7);
      return details;
    } catch (error) {
      logger.error('Places details failed:', { error: error.message, placeId });
      throw error;
    }
  }

  /**
   * New Method: Get Photo Stream Proxy
   */
  async getPlacePhoto(photoReference) {
    if (!this.enabled) throw new Error('Places service is not configured');

    try {
      const response = await axios.get(`${this.baseUrl}/place/photo`, {
        params: {
          maxwidth: 800,
          photoreference: photoReference,
          key: this.apiKey,
        },
        responseType: 'stream', // Quan trọng: lấy stream để pipe về FE
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      logger.error('Get place photo proxy failed:', { error: error.message });
      throw error;
    }
  }

  /**
   * Format places results
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
      priceLevel: place.price_level || null,
      types: place.types || [],
      openNow: place.opening_hours?.open_now || null,
      photos: place.photos?.slice(0, 3).map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        // SỬA: URL trỏ về Server của mình
        url: `${this.appBaseUrl}/api/places/photos/${photo.photo_reference}`,
      })) || [],
    }));
  }

  /**
   * Format place details
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
        // SỬA: URL trỏ về Server của mình
        url: `${this.appBaseUrl}/api/places/photos/${photo.photo_reference}`,
      })),
    };
  }

  getPlaceTypes() {
    return [ 'restaurant', 'cafe', 'bar', 'tourist_attraction', 'museum', 'park', 'shopping_mall', 'hotel', 'spa', 'night_club', 'movie_theater', 'gym', 'library', 'church', 'temple', 'mosque', 'beach' ];
  }

  getStatus() {
    return { enabled: this.enabled, cacheSize: cacheManager.size(), availableTypes: this.getPlaceTypes().length };
  }
}

module.exports = new PlacesService();