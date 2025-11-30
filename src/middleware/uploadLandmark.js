/**
 * Landmark Image Upload Middleware
 * Handles image uploads for landmark recognition
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { ValidationError } = require('../utils/errorTypes');

// Configure multer storage for landmark images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'landmarks');

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
    cb(null, `landmark-${userId}-${timestamp}${ext}`);
  },
});

// File filter for landmark images
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
    fileSize: 10 * 1024 * 1024, // 10MB limit for landmark images
    files: 1,
  },
});

module.exports = {
  uploadLandmark: upload.single('image'),
};
