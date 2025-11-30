/**
 * Check-In Controller
 * Handles location check-in CRUD operations
 */

const { CheckIn } = require('../models');
const geocodingService = require('../services/geocodingService');
const { successResponse } = require('../utils/responseFormatter');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const { PAGINATION } = require('../config/constants');
const logger = require('../utils/logger');

class CheckInController {
  /**
   * Create new check-in
   * POST /api/user/check-in
   */
  async createCheckIn(req, res, next) {
    try {
      const { locationName, latitude, longitude, visitDate, province: providedProvince } = req.body;

      if (!latitude || !longitude) {
        throw new ValidationError('Latitude and longitude are required');
      }

      // Auto-extract province if not provided
      let province = providedProvince;
      if (!province) {
        try {
          province = await geocodingService.getProvince(latitude, longitude);
          logger.info(`Province extracted: ${province}`, {
            userId: req.user.id,
            coordinates: { latitude, longitude },
          });
        } catch (error) {
          logger.error('Failed to extract province:', error);
          // Fallback to Unknown if geocoding fails
          province = 'Unknown';
        }
      }

      const checkIn = await CheckIn.create({
        userId: req.user.id,
        locationName: locationName || 'Unknown Location',
        latitude,
        longitude,
        province,
        visitDate: visitDate || new Date(),
      });

      logger.info('Check-in created:', {
        checkInId: checkIn.id,
        userId: req.user.id,
        province,
      });

      successResponse(res, checkIn, 'Check-in created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated check-ins for current user
   * GET /api/user/check-ins?page=1&limit=10
   */
  async getCheckIns(req, res, next) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(
        parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
        PAGINATION.MAX_LIMIT
      );
      const offset = (page - 1) * limit;

      const { count, rows } = await CheckIn.findAndCountAll({
        where: { userId: req.user.id },
        order: [
          ['visitDate', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        limit,
        offset,
      });

      successResponse(res, {
        checkIns: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      }, 'Check-ins retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get map history (unique provinces visited)
   * GET /api/user/map-history
   */
  async getMapHistory(req, res, next) {
    try {
      // Get unique provinces using Sequelize
      const checkIns = await CheckIn.findAll({
        where: { userId: req.user.id },
        attributes: ['province'],
        group: ['province'],
        raw: true,
      });

      const provinces = checkIns
        .map(c => c.province)
        .filter(p => p && p !== 'Unknown'); // Filter out null and "Unknown"

      const uniqueProvinces = [...new Set(provinces)];

      logger.info('Map history retrieved:', {
        userId: req.user.id,
        provinceCount: uniqueProvinces.length,
      });

      successResponse(res, {
        provinces: uniqueProvinces,
        count: uniqueProvinces.length,
      }, 'Map history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete specific check-in
   * DELETE /api/user/check-in/:id
   */
  async deleteCheckIn(req, res, next) {
    try {
      const { id } = req.params;

      const checkIn = await CheckIn.findOne({
        where: {
          id,
          userId: req.user.id, // Ensure user owns this check-in
        },
      });

      if (!checkIn) {
        throw new NotFoundError('Check-in not found or you do not have permission to delete it');
      }

      await checkIn.destroy();

      logger.info('Check-in deleted:', {
        checkInId: id,
        userId: req.user.id,
      });

      successResponse(res, null, 'Check-in deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get check-in statistics
   * GET /api/user/check-in-stats
   */
  async getStats(req, res, next) {
    try {
      const totalCheckIns = await CheckIn.count({
        where: { userId: req.user.id },
      });

      const uniqueProvinces = await CheckIn.findAll({
        where: { userId: req.user.id },
        attributes: ['province'],
        group: ['province'],
        raw: true,
      });

      const provinceCount = uniqueProvinces.filter(
        p => p.province && p.province !== 'Unknown'
      ).length;

      successResponse(res, {
        totalCheckIns,
        provincesVisited: provinceCount,
      }, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckInController();
