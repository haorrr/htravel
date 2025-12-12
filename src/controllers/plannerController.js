/**
 * Planner Controller
 * Handles AI trip planning (Vietnamese language)
 */

const tripPlannerService = require('../services/tripPlannerService');
const { Itinerary } = require('../models');
const { successResponse } = require('../utils/responseFormatter');
const { ValidationError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * POST /api/planner/generate
 * Generate trip itinerary using AI
 */
const generateItinerary = async (req, res, next) => {
  try {
    const { destination, duration, budget, interests } = req.body;

    // Validate inputs
    if (!destination || typeof destination !== 'string') {
      throw new ValidationError('Điểm đến là bắt buộc');
    }

    if (!duration || typeof duration !== 'number' || duration < 1 || duration > 14) {
      throw new ValidationError('Thời gian phải từ 1-14 ngày');
    }

    if (!['budget', 'moderate', 'luxury'].includes(budget)) {
      throw new ValidationError('Ngân sách phải là: budget, moderate, hoặc luxury');
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      throw new ValidationError('Phải có ít nhất một sở thích');
    }

    const userId = req.user?.id;
    logger.info('Trip itinerary generation request', {
      userId,
      destination,
      duration,
      budget,
      interests,
    });

    // Generate itinerary using AI service
    const tripData = await tripPlannerService.generateItinerary(
      destination,
      duration,
      budget,
      interests
    );

    logger.info('Trip itinerary generated successfully', {
      userId,
      destination,
      daysCount: tripData.days.length,
    });

    return successResponse(
      res,
      {
        destination,
        duration,
        budget,
        interests,
        tripData,
      },
      'Đã tạo lịch trình thành công',
      200
    );
  } catch (error) {
    logger.error('Failed to generate itinerary', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * POST /api/planner/save
 * Save generated itinerary to database
 */
const saveItinerary = async (req, res, next) => {
  try {
    const { destination, duration, budget, interests, tripData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('Yêu cầu xác thực');
    }

    // Validate required fields
    if (!destination || !duration || !budget || !interests || !tripData) {
      throw new ValidationError('Thiếu thông tin bắt buộc');
    }

    // Create itinerary
    const itinerary = await Itinerary.create({
      userId,
      destination,
      duration,
      budget,
      interests,
      tripData,
    });

    logger.info('Itinerary saved successfully', {
      userId,
      itineraryId: itinerary.id,
      destination,
    });

    return successResponse(
      res,
      itinerary,
      'Đã lưu lịch trình thành công',
      201
    );
  } catch (error) {
    logger.error('Failed to save itinerary', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * GET /api/planner/my-trips
 * Get user's saved itineraries (paginated)
 */
const getMyTrips = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ValidationError('Yêu cầu xác thực');
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Itinerary.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    logger.info('User trips retrieved', {
      userId,
      count,
      page,
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
      'Lấy danh sách chuyến đi thành công',
      200
    );
  } catch (error) {
    logger.error('Failed to get user trips', {
      error: error.message,
      userId: req.user?.id,
    });
    next(error);
  }
};

/**
 * GET /api/planner/trips/:id
 * Get single itinerary by ID (with ownership check)
 */
const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('Yêu cầu xác thực');
    }

    const itinerary = await Itinerary.findOne({
      where: { id, userId },
    });

    if (!itinerary) {
      throw new ValidationError('Không tìm thấy lịch trình hoặc bạn không có quyền truy cập');
    }

    logger.info('Trip retrieved', {
      userId,
      itineraryId: id,
    });

    return successResponse(
      res,
      itinerary,
      'Lấy lịch trình thành công',
      200
    );
  } catch (error) {
    logger.error('Failed to get trip', {
      error: error.message,
      userId: req.user?.id,
      tripId: req.params.id,
    });
    next(error);
  }
};

/**
 * DELETE /api/planner/trips/:id
 * Delete itinerary (with ownership check)
 */
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ValidationError('Yêu cầu xác thực');
    }

    const itinerary = await Itinerary.findOne({
      where: { id, userId },
    });

    if (!itinerary) {
      throw new ValidationError('Không tìm thấy lịch trình hoặc bạn không có quyền xóa');
    }

    await itinerary.destroy();

    logger.info('Trip deleted', {
      userId,
      itineraryId: id,
    });

    return successResponse(
      res,
      null,
      'Đã xóa lịch trình thành công',
      200
    );
  } catch (error) {
    logger.error('Failed to delete trip', {
      error: error.message,
      userId: req.user?.id,
      tripId: req.params.id,
    });
    next(error);
  }
};

/**
 * GET /api/planner/status
 * Get trip planner service status
 */
const getStatus = async (req, res, next) => {
  try {
    const status = tripPlannerService.getStatus();

    return successResponse(
      res,
      status,
      'Trạng thái dịch vụ',
      200
    );
  } catch (error) {
    logger.error('Failed to get status', error);
    next(error);
  }
};

module.exports = {
  generateItinerary,
  saveItinerary,
  getMyTrips,
  getTripById,
  deleteTrip,
  getStatus,
};
