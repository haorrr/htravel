/**
 * AI Controller
 * Handles AI-powered features (landmark recognition, virtual travel)
 */

const geminiService = require('../services/geminiService');
const imagenService = require('../services/imagenService');
const { successResponse } = require('../utils/responseFormatter');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');
const VirtualTrip = require('../models/VirtualTrip');
const fs = require('fs').promises;
const path = require('path');

/**
 * POST /api/ai/identify-landmark
 * Identify landmark from uploaded image
 */
const identifyLandmark = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No image file uploaded');
    }

    const userId = req.user?.id || 'anonymous';
    logger.info('Landmark identification request:', {
      userId,
      filename: req.file.filename,
      size: req.file.size,
    });

    // Identify landmark using Gemini Vision API
    const result = await geminiService.identifyLandmark(req.file.path);

    logger.info('Landmark identification complete:', {
      userId,
      landmark: result.name,
      confidence: result.confidence,
    });

    // Transform Vietnamese response to API specification
    const response = {
      name: result.name,
      confidence: result.confidence,
      description: result.description || result.characteristics || 'Không có thông tin chi tiết',
      location: parseLocation(result.location),
      category: categorizelandmark(result.name, result.location),
      characteristics: result.characteristics || '',
      interestingFacts: result.interestingFacts || '',
    };

    return successResponse(
      res,
      response,
      'Landmark identified successfully',
      200
    );
  } catch (error) {
    logger.error('Landmark identification failed:', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * Parse location string into structured object
 */
function parseLocation(locationStr) {
  if (!locationStr || locationStr === 'Unknown') {
    return {
      city: 'Unknown',
      country: 'Unknown',
      coordinates: null,
    };
  }

  // Try to parse "City, Country" format
  const parts = locationStr.split(',').map(s => s.trim());

  return {
    city: parts[0] || 'Unknown',
    country: parts[1] || parts[0] || 'Unknown',
    coordinates: null, // Coordinates would require geocoding API
  };
}

/**
 * Categorize landmark based on name and location
 */
function categorizelandmark(name, location) {
  if (!name || name === 'Unknown') {
    return 'unknown';
  }

  const nameLower = name.toLowerCase();
  const locationLower = (location || '').toLowerCase();

  // Check for common landmark types
  if (nameLower.includes('tower') || nameLower.includes('skyscraper')) {
    return 'tower';
  }
  if (nameLower.includes('bridge')) {
    return 'bridge';
  }
  if (nameLower.includes('temple') || nameLower.includes('church') ||
      nameLower.includes('cathedral') || nameLower.includes('mosque') ||
      nameLower.includes('pagoda')) {
    return 'religious';
  }
  if (nameLower.includes('palace') || nameLower.includes('castle')) {
    return 'palace';
  }
  if (nameLower.includes('museum') || nameLower.includes('gallery')) {
    return 'museum';
  }
  if (nameLower.includes('statue') || nameLower.includes('monument')) {
    return 'monument';
  }
  if (nameLower.includes('park') || nameLower.includes('garden')) {
    return 'park';
  }
  if (nameLower.includes('beach') || nameLower.includes('bay') ||
      locationLower.includes('island')) {
    return 'natural';
  }
  if (nameLower.includes('stadium') || nameLower.includes('arena')) {
    return 'stadium';
  }

  // Default category
  return 'building';
}

/**
 * POST /api/ai/virtual-travel
 * Generate virtual travel photo with selfie and destination
 */
const generateVirtualTravel = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No selfie image uploaded');
    }

    const { destination } = req.body;
    if (!destination) {
      throw new ValidationError('Destination name is required');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Authentication required for virtual travel');
    }

    logger.info('Virtual travel generation request:', {
      userId,
      destination,
      filename: req.file.filename,
      size: req.file.size,
    });

    // Generate virtual travel photos using Imagen
    const generatedImages = await imagenService.generateVirtualTravel(
      req.file.path,
      destination
    );

    if (!generatedImages || generatedImages.length === 0) {
      throw new Error('Failed to generate virtual travel images');
    }

    // Save generated images to disk
    const savedImages = [];
    const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'virtual-travel');
    await fs.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < generatedImages.length; i++) {
      const outputFilename = `virtual-${userId}-${Date.now()}-${i}.jpg`;
      const outputPath = path.join(outputDir, outputFilename);
      await fs.writeFile(outputPath, generatedImages[i]);
      savedImages.push(`/uploads/virtual-travel/${outputFilename}`);
    }

    // Save first generated image to database
    const virtualTrip = await VirtualTrip.create({
      userId,
      originalImageUrl: `/uploads/selfies/${req.file.filename}`,
      generatedImageUrl: savedImages[0], // Use first generated image as primary
      destinationName: destination,
    });

    logger.info('Virtual travel photo generated successfully:', {
      userId,
      destination,
      tripId: virtualTrip.id,
      imageCount: savedImages.length,
    });

    // Return all generated variations
    const response = {
      id: virtualTrip.id,
      destination,
      originalImage: virtualTrip.originalImageUrl,
      generatedImages: savedImages, // Return all 4 variations
      primaryImage: savedImages[0],
      createdAt: virtualTrip.createdAt,
    };

    return successResponse(
      res,
      response,
      'Virtual travel photo generated successfully',
      201
    );
  } catch (error) {
    logger.error('Virtual travel generation failed:', {
      error: error.message,
      userId: req.user?.id,
    });

    // Cleanup uploaded file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
};

/**
 * GET /api/ai/virtual-travel/history
 * Get user's virtual travel history
 */
const getVirtualTravelHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Authentication required');
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await VirtualTrip.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return successResponse(
      res,
      {
        trips: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
      'Virtual travel history retrieved successfully',
      200
    );
  } catch (error) {
    logger.error('Failed to get virtual travel history:', error);
    next(error);
  }
};

/**
 * GET /api/ai/status
 * Get AI service status
 */
const getStatus = async (req, res, next) => {
  try {
    const geminiStatus = geminiService.getStatus();
    const imagenStatus = imagenService.getStatus();

    return successResponse(
      res,
      {
        gemini: geminiStatus,
        imagen: imagenStatus,
      },
      'AI service status retrieved',
      200
    );
  } catch (error) {
    logger.error('Failed to get AI status:', error);
    next(error);
  }
};

module.exports = {
  identifyLandmark,
  generateVirtualTravel,
  getVirtualTravelHistory,
  getStatus,
};
