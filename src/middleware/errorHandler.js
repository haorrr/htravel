/**
 * Global error handler middleware
 * Catches all errors and returns consistent JSON responses
 * MUST be used as the last middleware in Express app
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/errorTypes');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: req.body,
  });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    error = new AppError(messages.join(', '), 400);
  }

  // Sequelize unique constraint errors (duplicate email, etc.)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    error = new AppError(`${field} already exists`, 400);
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new AppError('Invalid reference to related resource', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File size exceeds maximum limit', 400);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new AppError('Too many files uploaded', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field', 400);
  }

  // Busboy/Multer parsing errors (e.g., empty multipart form)
  if (err.message && err.message.includes('Unexpected end of form')) {
    error = new AppError('No file uploaded or invalid multipart form data', 400);
  }

  if (err.message && err.message.includes('Missing boundary')) {
    error = new AppError('Invalid multipart form data', 400);
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    error = new AppError(messages.join(', '), 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
