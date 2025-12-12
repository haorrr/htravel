/**
 * Dashboard Controller
 * HTTP request handlers for admin dashboard statistics
 */

const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * Get dashboard overview statistics
 * GET /api/admin/dashboard/stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get trends data for charts
 * GET /api/admin/dashboard/trends
 */
const getTrends = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;

    // Validate period
    if (!['7d', '30d', '90d'].includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period. Must be 7d, 30d, or 90d'
      });
    }

    const trends = await dashboardService.getTrends(period);
    return successResponse(res, trends, 'Trends data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity timeline
 * GET /api/admin/dashboard/activity
 */
const getActivity = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50
    const activity = await dashboardService.getRecentActivity(limit);
    return successResponse(res, activity, 'Recent activity retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getTrends,
  getActivity
};
