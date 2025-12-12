/**
 * Express application configuration
 * Sets up middleware stack and routes
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Security middleware - Helmet sets various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

// 2. CORS configuration - Allow frontend to access API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies
}));

// 3. HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// 4. Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
});
app.use(limiter);

// 5. Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================
// API Routes
// ==================

// Phase 03: Authentication & User routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Phase 04 & 07: AI features routes
app.use('/api/ai', require('./routes/aiRoutes'));

// Phase 05: Check-in & Map routes
app.use('/api/user', require('./routes/checkInRoutes'));

// Phase 06: Blog/Article routes
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));

// Phase 08: Google Maps Places routes
app.use('/api/places', require('./routes/placesRoutes'));

// Phase 09: AI Trip Planner routes
app.use('/api/planner', require('./routes/plannerRoutes'));

// Admin routes (user management)
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler (MUST be last middleware)
app.use(errorHandler);

module.exports = app;
