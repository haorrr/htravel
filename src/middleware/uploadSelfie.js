/**
 * Selfie Upload Middleware
 * Handles selfie uploads for virtual travel photo generation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ValidationError } = require('../utils/errorTypes');

// Configure multer storage for selfie images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'selfies');

    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      return cb(error);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `selfie-${userId}-${timestamp}${ext}`);
  },
});

// File filter for selfie images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new ValidationError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`),
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
    fileSize: 10 * 1024 * 1024, // 10MB limit for selfies
    files: 1,
  },
});

module.exports = {
  uploadSelfie: upload.single('selfie'),
};
