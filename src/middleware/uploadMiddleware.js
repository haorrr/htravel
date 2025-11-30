/**
 * File Upload Middleware (Multer + Sharp)
 * Handles avatar uploads with validation and image processing
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { ValidationError } = require('../utils/errorTypes');
const { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } = require('../config/constants');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'avatars');

    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      return cb(error);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp.ext
    const userId = req.user?.id || 'temp';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${ext}`);
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(
      new ValidationError(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`),
      false
    );
  }
  cb(null, true);
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 5MB
    files: 1, // Only one file per request
  },
});

/**
 * Process uploaded avatar image with Sharp
 * Resize to 512x512, convert to JPEG, compress
 */
const processAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(path.extname(inputPath), '.jpg');

    // Process image with Sharp
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toFile(outputPath);

    // Delete original file if different from output
    if (inputPath !== outputPath) {
      await fs.unlink(inputPath);
    }

    // Update req.file with processed image info
    req.file.path = outputPath;
    req.file.filename = path.basename(outputPath);

    next();
  } catch (error) {
    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// Thumbnail storage configuration
const thumbnailStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'thumbnails');

    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      return cb(error);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random.ext
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

// Thumbnail upload configuration
const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Process uploaded thumbnail image with Sharp
 * Resize to 1200x630 (social media card size), convert to JPEG
 */
const processThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(path.extname(inputPath), '.jpg');

    // Process image with Sharp
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 80,
        progressive: true,
      })
      .toFile(outputPath);

    // Delete original file if different from output
    if (inputPath !== outputPath) {
      await fs.unlink(inputPath);
    }

    // Update req.file with processed image info
    req.file.path = outputPath;
    req.file.filename = path.basename(outputPath);
    req.file.url = `/uploads/thumbnails/${req.file.filename}`;

    next();
  } catch (error) {
    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

module.exports = {
  uploadAvatar: upload.single('avatar'),
  processAvatar,
  uploadThumbnail: thumbnailUpload.single('thumbnail'),
  processThumbnail,
};
