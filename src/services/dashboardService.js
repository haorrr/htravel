/**
 * Dashboard Service
 * Business logic for admin dashboard statistics and analytics
 */

const { Op } = require('sequelize');
const { User, Article, Category, CheckIn, sequelize } = require('../models');
const { USER_ROLES } = require('../config/constants');

class DashboardService {
  /**
   * Get overview statistics for dashboard KPI cards
   * @returns {Object} Aggregated statistics
   */
  async getStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for performance
    const [
      totalUsers,
      adminCount,
      newToday,
      newThisWeek,
      newLastWeek,
      totalArticles,
      newArticlesThisMonth,
      totalCategories,
      categoriesWithArticles,
      totalCheckIns,
      uniqueProvinces,
      checkInsThisMonth
    ] = await Promise.all([
      // User stats
      User.count(),
      User.count({ where: { role: USER_ROLES.ADMIN } }),
      User.count({ where: { createdAt: { [Op.gte]: today } } }),
      User.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
      User.count({
        where: {
          createdAt: {
            [Op.between]: [twoWeeksAgo, weekAgo]
          }
        }
      }),

      // Article stats
      Article.count(),
      Article.count({ where: { createdAt: { [Op.gte]: monthAgo } } }),

      // Category stats
      Category.count(),
      sequelize.query(
        `SELECT COUNT(DISTINCT c.id) as count
         FROM categories c
         INNER JOIN articles a ON a.category_id = c.id`,
        { type: sequelize.QueryTypes.SELECT }
      ).then(result => result[0]?.count || 0),

      // Check-in stats
      CheckIn.count(),
      CheckIn.count({ distinct: true, col: 'province' }),
      CheckIn.count({ where: { createdAt: { [Op.gte]: monthAgo } } })
    ]);

    // Calculate growth rate (week-over-week)
    const growthRate = newLastWeek > 0
      ? parseFloat((((newThisWeek - newLastWeek) / newLastWeek) * 100).toFixed(1))
      : 0;

    return {
      users: {
        total: totalUsers,
        admins: adminCount,
        newToday,
        newThisWeek,
        growthRate
      },
      articles: {
        total: totalArticles,
        newThisMonth: newArticlesThisMonth
      },
      categories: {
        total: totalCategories,
        withArticles: categoriesWithArticles
      },
      checkIns: {
        total: totalCheckIns,
        uniqueProvinces,
        thisMonth: checkInsThisMonth
      }
    };
  }

  /**
   * Get time-series trends for charts
   * @param {String} period - '7d', '30d', or '90d'
   * @returns {Object} Trend data for charts
   */
  async getTrends(period = '30d') {
    const days = parseInt(period.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Parallel queries for different trend data
    const [userGrowthRaw, articlesByCategoryRaw, checkInsByProvinceRaw] = await Promise.all([
      // User growth over time (cumulative)
      sequelize.query(
        `SELECT DATE(created_at) as date, COUNT(*) as newUsers
         FROM users
         WHERE created_at >= :startDate
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        {
          replacements: { startDate: startDate.toISOString().split('T')[0] },
          type: sequelize.QueryTypes.SELECT
        }
      ),

      // Articles by category
      sequelize.query(
        `SELECT c.name, COUNT(a.id) as count
         FROM categories c
         LEFT JOIN articles a ON a.category_id = c.id
         GROUP BY c.id, c.name
         HAVING count > 0
         ORDER BY count DESC`,
        { type: sequelize.QueryTypes.SELECT }
      ),

      // Top 10 provinces by check-ins
      sequelize.query(
        `SELECT province, COUNT(*) as count
         FROM check_ins
         WHERE province IS NOT NULL AND province != ''
         GROUP BY province
         ORDER BY count DESC
         LIMIT 10`,
        { type: sequelize.QueryTypes.SELECT }
      )
    ]);

    // Calculate cumulative user count for growth chart
    let cumulative = await User.count({
      where: { createdAt: { [Op.lt]: startDate } }
    });

    const userGrowth = userGrowthRaw.map(row => {
      cumulative += parseInt(row.newUsers);
      return {
        date: row.date,
        users: cumulative
      };
    });

    // Calculate percentages for articles by category
    const totalArticles = articlesByCategoryRaw.reduce(
      (sum, cat) => sum + parseInt(cat.count),
      0
    );

    const articlesByCategory = articlesByCategoryRaw.map(cat => ({
      name: cat.name,
      count: parseInt(cat.count),
      percentage: totalArticles > 0
        ? parseFloat(((parseInt(cat.count) / totalArticles) * 100).toFixed(1))
        : 0
    }));

    const checkInsByProvince = checkInsByProvinceRaw.map(p => ({
      province: p.province,
      count: parseInt(p.count)
    }));

    return {
      userGrowth,
      articlesByCategory,
      checkInsByProvince
    };
  }

  /**
   * Get recent activity timeline
   * @param {Number} limit - Max number of activities to return
   * @returns {Object} Recent activities
   */
  async getRecentActivity(limit = 20) {
    const halfLimit = Math.floor(limit / 2);

    // Fetch recent users and check-ins in parallel
    const [recentUsers, recentCheckIns] = await Promise.all([
      User.findAll({
        attributes: ['id', 'name', 'email', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: halfLimit,
        raw: true
      }),

      CheckIn.findAll({
        attributes: ['id', 'userId', 'province', 'locationName', 'createdAt'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }],
        order: [['createdAt', 'DESC']],
        limit: halfLimit
      })
    ]);

    // Combine and format activities
    const activities = [
      ...recentUsers.map(u => ({
        id: `user-${u.id}`,
        type: 'user_registered',
        user: {
          id: u.id,
          name: u.name,
          email: u.email
        },
        timestamp: u.createdAt
      })),
      ...recentCheckIns.map(c => ({
        id: `checkin-${c.id}`,
        type: 'check_in',
        user: {
          id: c.user.id,
          name: c.user.name
        },
        metadata: {
          province: c.province,
          locationName: c.locationName
        },
        timestamp: c.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return { activities };
  }
}

module.exports = new DashboardService();
