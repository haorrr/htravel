/**
 * Image Processor Utility
 * Handles image preprocessing for AI analysis
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

class ImageProcessor {
  /**
   * Preprocess image for Gemini Vision API
   * - Resize to optimal dimensions (768-1024px)
   * - Convert to JPEG with 85% quality
   * - Remove EXIF metadata
   */
  async preprocessForGemini(inputPath) {
    try {
      const metadata = await sharp(inputPath).metadata();
      logger.info('Image metadata:', { width: metadata.width, height: metadata.height, format: metadata.format });

      // Determine target size based on aspect ratio
      const isLandscape = metadata.width > metadata.height;
      const targetSize = isLandscape ? 1024 : 768;

      const processedPath = inputPath.replace(
        path.extname(inputPath),
        '-processed.jpg'
      );

      await sharp(inputPath)
        .resize(targetSize, targetSize, {
          fit: 'cover',
          position: 'center',
        })
        .withMetadata(false) // Remove EXIF data
        .jpeg({ quality: 85, progressive: true })
        .toFile(processedPath);

      logger.info('Image preprocessed:', { original: inputPath, processed: processedPath });
      return processedPath;
    } catch (error) {
      logger.error('Image preprocessing failed:', error);
      throw error;
    }
  }

  /**
   * Convert image to base64 for API transmission
   */
  async toBase64(imagePath) {
    try {
      const buffer = await fs.readFile(imagePath);
      return buffer.toString('base64');
    } catch (error) {
      logger.error('Base64 conversion failed:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(filePath) {
    try {
      await fs.unlink(filePath);
      logger.debug('Cleaned up file:', filePath);
    } catch (error) {
      // Ignore errors (file might not exist)
      logger.debug('Cleanup skipped:', filePath);
    }
  }

  /**
   * Validate image file
   */
  async validate(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();

      // Check dimensions (not too small)
      if (metadata.width < 200 || metadata.height < 200) {
        throw new Error('Image too small (minimum 200x200px)');
      }

      // Check file size (already handled by Multer, but double-check)
      const stats = await fs.stat(filePath);
      if (stats.size > 10 * 1024 * 1024) {
        throw new Error('Image too large (maximum 10MB)');
      }

      return true;
    } catch (error) {
      logger.error('Image validation failed:', error);
      throw error;
    }
  }
}

module.exports = new ImageProcessor();
