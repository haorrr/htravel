/**
 * Imagen AI Service
 * Handles virtual travel photo generation using Google Imagen 4.0 API
 */

const axios = require('axios');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const CircuitBreaker = require('../utils/circuitBreaker');

class ImagenService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not configured - Imagen features will be disabled');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'imagen-4.0-generate-001';
    this.circuitBreaker = new CircuitBreaker(5, 60000);
  }

  /**
   * Generate virtual travel photo
   * @param {string} selfiePath - Path to user's selfie image
   * @param {string} destination - Destination name in Vietnamese
   * @returns {Promise<Buffer[]>} Array of generated image buffers
   */
  async generateVirtualTravel(selfiePath, destination) {
    if (!this.enabled) {
      throw new Error('Imagen AI service is not configured');
    }

    try {
      // Read and encode selfie image
      const imageBuffer = await fs.readFile(selfiePath);
      const base64Image = imageBuffer.toString('base64');

      // Create Vietnamese prompt
      const prompt = this.createVietnamesePrompt(destination);

      logger.info('Generating virtual travel photo:', {
        destination,
        imageSize: imageBuffer.length,
      });

      // Call Imagen API with circuit breaker protection
      const result = await this.circuitBreaker.call(async () => {
        return await this.callImagenAPI(base64Image, prompt);
      });

      logger.info('Virtual travel photo generated successfully:', {
        destination,
        imageCount: result.length,
      });

      return result;
    } catch (error) {
      logger.error('Virtual travel generation failed:', {
        error: error.message,
        destination,
      });
      throw error;
    }
  }

  /**
   * Create Vietnamese prompt for virtual travel
   */
  createVietnamesePrompt(destination) {
    return `Một bức ảnh phong cảnh góc rộng với người trong ảnh đứng tại ${destination}.
Khuôn mặt và hình dáng của người phải giống y hệt với ảnh gốc.
Bố cục ảnh mang tính điện ảnh và hoành tráng, thể hiện quy mô của môi trường xung quanh.
Ánh sáng điện ảnh phù hợp với thời gian trong ngày, màu sắc tự nhiên đẹp mắt,
sự pha trộn hài hòa giữa người và bối cảnh, chân thực, chất lượng điện ảnh đạt giải thưởng.`;
  }

  /**
   * Call Imagen 4.0 API
   */
  async callImagenAPI(base64Image, prompt) {
    const url = `${this.baseUrl}/models/${this.model}:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
          image: {
            bytesBase64Encoded: base64Image,
          },
        },
      ],
      parameters: {
        sampleCount: 4, // Generate 4 variations
        aspectRatio: '16:9', // Landscape format
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult', // Allow adult face generation
      },
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'x-goog-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minutes timeout (image generation takes time)
      });

      // Parse response and extract generated images
      const predictions = response.data.predictions || [];

      if (predictions.length === 0) {
        throw new Error('No images generated from Imagen API');
      }

      // Convert base64 images to buffers
      const imageBuffers = predictions.map((prediction) => {
        const imageBase64 = prediction.bytesBase64Encoded;
        if (!imageBase64) {
          logger.warn('Missing image data in prediction');
          return null;
        }
        return Buffer.from(imageBase64, 'base64');
      }).filter(Boolean);

      return imageBuffers;
    } catch (error) {
      if (error.response) {
        logger.error('Imagen API error:', {
          status: error.response.status,
          data: error.response.data,
        });

        // Handle specific error cases
        if (error.response.status === 400) {
          throw new Error('Invalid request to Imagen API - check image format or prompt');
        }
        if (error.response.status === 403) {
          throw new Error('Imagen API access denied - check API key permissions');
        }
        if (error.response.status === 429) {
          throw new Error('Imagen API rate limit exceeded - please try again later');
        }

        throw new Error(`Imagen API error: ${error.response.status}`);
      }

      throw error;
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      model: this.model,
      circuitBreaker: this.circuitBreaker.getState(),
    };
  }
}

module.exports = new ImagenService();
