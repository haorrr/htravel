/**
 * Sequelize database configuration and connection
 * Connects to MySQL database with connection pooling
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg), // Log SQL queries at debug level
    pool: {
      max: 20,        // Maximum connections in pool
      min: 0,         // Minimum connections
      acquire: 30000, // Maximum time (ms) to get connection
      idle: 10000,    // Maximum idle time (ms) before releasing
    },
    define: {
      timestamps: true,      // Adds createdAt & updatedAt automatically
      underscored: true,     // Use snake_case for DB columns (user_id vs userId)
    },
  }
);

// Test database connection
sequelize.authenticate()
  .then(() => logger.info('✅ Database connected successfully'))
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    logger.warn('⚠️  Server will continue running, but database operations will fail');
    logger.warn('⚠️  Please configure MySQL credentials in .env file');
    // Don't exit in development to allow setup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

module.exports = sequelize;
