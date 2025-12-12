/**
 * Places Controller
 * Handles Google Maps Places API requests
 */

const placesService = require('../services/placesService');
const { successResponse } = require('../utils/responseFormatter');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * GET /api/places/search
 * Text search for places
 * Query params: query (required), lat, lng, radius, type
 */
const textSearch = async (req, res, next) => {
  try {
    const { query, lat, lng, radius, type } = req.query;

    if (!query) {
      throw new ValidationError('Query parameter is required');
    }

    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lng ? parseFloat(lng) : undefined;
    const searchRadius = radius ? parseInt(radius) : undefined;

    logger.info('Places text search request:', {
      query,
      userId: req.user?.id,
    });

    const results = await placesService.textSearch(query, {
      latitude,
      longitude,
      radius: searchRadius,
      type,
    });

    return successResponse(
      res,
      {
        query,
        results,
        count: results.length,
      },
      'Places found successfully',
      200
    );
  } catch (error) {
    logger.error('Places text search failed:', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * GET /api/places/nearby
 * Search for places nearby a location
 * Query params: lat (required), lng (required), radius (required), type, keyword
 */
const nearbySearch = async (req, res, next) => {
  try {
    const { lat, lng, radius, type, keyword } = req.query;

    if (!lat || !lng) {
      throw new ValidationError('Latitude and longitude are required');
    }

    if (!radius) {
      throw new ValidationError('Radius is required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const searchRadius = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new ValidationError('Invalid latitude or longitude');
    }

    if (isNaN(searchRadius) || searchRadius <= 0) {
      throw new ValidationError('Invalid radius');
    }

    logger.info('Places nearby search request:', {
      location: `${latitude},${longitude}`,
      radius: searchRadius,
      userId: req.user?.id,
    });

    const results = await placesService.nearbySearch(latitude, longitude, searchRadius, {
      type,
      keyword,
    });

    return successResponse(
      res,
      {
        location: {
          lat: latitude,
          lng: longitude,
        },
        radius: searchRadius,
        results,
        count: results.length,
      },
      'Nearby places found successfully',
      200
    );
  } catch (error) {
    logger.error('Places nearby search failed:', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * GET /api/places/details/:placeId
 * Get detailed information about a specific place
 */
const getPlaceDetails = async (req, res, next) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      throw new ValidationError('Place ID is required');
    }

    logger.info('Places details request:', {
      placeId,
      userId: req.user?.id,
    });

    const details = await placesService.getPlaceDetails(placeId);

    return successResponse(
      res,
      details,
      'Place details retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Places details failed:', {
      error: error.message,
      placeId: req.params.placeId,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * GET /api/places/photos/:photoReference
 * Proxy method to serve images
 */
const getPlacePhoto = async (req, res, next) => {
  try {
    const { photoReference } = req.params;
    
    if (!photoReference) {
      return res.status(404).send('Photo reference required');
    }

    // Lấy stream ảnh từ service
    const imageStream = await placesService.getPlacePhoto(photoReference);

    // Set header content type (Google thường trả về image/jpeg)
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày

    // Pipe stream về client
    imageStream.pipe(res);
  } catch (error) {
    logger.error('Get place photo failed:', { error: error.message });
    // Nếu lỗi, trả về 404 hoặc ảnh placeholder
    res.status(404).send('Photo not found');
  }
};

/**
 * GET /api/places/types
 * Get list of available place types
 */
const getPlaceTypes = async (req, res, next) => {
  try {
    const types = placesService.getPlaceTypes();

    return successResponse(
      res,
      { types },
      'Place types retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Get place types failed:', error);
    next(error);
  }
};

/**
 * GET /api/places/status
 * Get Places service status
 */
const getStatus = async (req, res, next) => {
  try {
    const status = placesService.getStatus();

    return successResponse(
      res,
      status,
      'Places service status retrieved',
      200
    );
  } catch (error) {
    logger.error('Failed to get Places status:', error);
    next(error);
  }
};

module.exports = {
  textSearch,
  nearbySearch,
  getPlaceDetails,
  getPlaceTypes,
  getStatus,
  getPlacePhoto,
};
