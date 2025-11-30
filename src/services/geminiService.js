/**
 * Gemini AI Service
 * Handles landmark recognition using Google Gemini Vision API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const imageProcessor = require('../utils/imageProcessor');
const CircuitBreaker = require('../utils/circuitBreaker');
const logger = require('../utils/logger');
const fs = require('fs').promises;

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not configured - AI features will be disabled');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.circuitBreaker = new CircuitBreaker(5, 60000);

    // Model fallback strategy: Use latest Gemini models
    // Based on https://ai.google.dev/gemini-api/docs
    this.models = [
      'gemini-2.5-flash', // Latest: Fast, balanced, 1M context window
      'gemini-2.5-pro',   // Fallback: Powerful reasoning model
    ];

    // Vietnamese prompt for landmark identification (CRITICAL REQUIREMENT)
    this.vietnamesePrompt = `Please analyze this image and identify the specific location shown. Then, provide a detailed description in Vietnamese, structured as follows:

Tên địa điểm: The exact name of the location/landmark.
Vị trí: The specific province/city and region.
Nét đặc trưng: Describe the unique architecture, landscape, or historical/cultural significance.
Điều thú vị: Share a few interesting facts or recommended experiences.
Important: If you cannot identify the location with certainty, please respond only with this exact Vietnamese sentence: 'Tôi chưa nhận ra được địa điểm này, bạn có thể chụp lại hoặc đưa ảnh địa điểm nổi tiếng hơn được không'.`;
  }

  /**
   * Identify landmark from image
   */
  async identifyLandmark(imagePath) {
    if (!this.enabled) {
      throw new Error('Gemini AI service is not configured');
    }

    let processedPath = null;

    try {
      // Validate image
      await imageProcessor.validate(imagePath);

      // Preprocess image for Gemini
      processedPath = await imageProcessor.preprocessForGemini(imagePath);

      // Read image file
      const imageBuffer = await fs.readFile(processedPath);

      // Try identification with circuit breaker protection
      const result = await this.circuitBreaker.call(async () => {
        return await this.identifyWithFallback(imageBuffer);
      });

      // Cleanup temporary files
      await imageProcessor.cleanup(processedPath);
      if (imagePath !== processedPath) {
        await imageProcessor.cleanup(imagePath);
      }

      return result;
    } catch (error) {
      // Cleanup on error
      if (processedPath) await imageProcessor.cleanup(processedPath);
      await imageProcessor.cleanup(imagePath);

      logger.error('Landmark identification failed:', { error: error.message });
      throw error;
    }
  }

  /**
   * Try identification with model fallback
   */
  async identifyWithFallback(imageBuffer) {
    const errors = [];

    for (const modelName of this.models) {
      try {
        logger.info(`Attempting landmark identification with ${modelName}`);
        const result = await this.identifyWithModel(modelName, imageBuffer);

        // Validate confidence threshold
        if (result.confidence < 0.5) {
          logger.warn(`Low confidence (${result.confidence}) from ${modelName}`);
          errors.push(new Error(`Low confidence: ${result.confidence}`));
          continue;
        }

        logger.info(`Landmark identified successfully with ${modelName}:`, result.name);
        return result;
      } catch (error) {
        logger.error(`${modelName} failed:`, { error: error.message });
        errors.push(error);

        // Don't retry on client errors (400)
        if (error.message.includes('400')) {
          break;
        }

        // Add delay between retries
        if (this.models.indexOf(modelName) < this.models.length - 1) {
          await this.delay(1000);
        }
      }
    }

    // All models failed - return unknown with Vietnamese message
    logger.warn('All identification attempts failed, returning unknown');
    return {
      name: 'Unknown',
      location: 'Unknown',
      description: 'Tôi chưa nhận ra được địa điểm này, bạn có thể chụp lại hoặc đưa ảnh địa điểm nổi tiếng hơn được không',
      characteristics: '',
      interestingFacts: '',
      confidence: 0,
    };
  }

  /**
   * Identify landmark using specific model
   */
  async identifyWithModel(modelName, imageBuffer) {
    const model = this.client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([this.vietnamesePrompt, imagePart]);
    const response = result.response;
    const text = response.text();

    // Parse Vietnamese response
    const landmarkData = this.parseVietnameseResponse(text);

    return landmarkData;
  }

  /**
   * Parse Vietnamese response format
   */
  parseVietnameseResponse(text) {
    // Check if response is the "unknown" fallback message
    if (text.includes('Tôi chưa nhận ra được địa điểm này')) {
      return {
        name: 'Unknown',
        location: 'Unknown',
        description: text.trim(),
        characteristics: '',
        interestingFacts: '',
        confidence: 0,
      };
    }

    // Extract fields using Vietnamese labels
    const nameMatch = text.match(/Tên địa điểm:\s*(.+?)(?:\n|$)/i);
    const locationMatch = text.match(/Vị trí:\s*(.+?)(?:\n|$)/i);
    const characteristicsMatch = text.match(/Nét đặc trưng:\s*(.+?)(?:\n(?:Điều thú vị|$))/is);
    const factsMatch = text.match(/Điều thú vị:\s*(.+?)$/is);

    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
    const location = locationMatch ? locationMatch[1].trim() : 'Unknown';
    const characteristics = characteristicsMatch ? characteristicsMatch[1].trim() : '';
    const interestingFacts = factsMatch ? factsMatch[1].trim() : '';

    // Calculate confidence based on response completeness
    let confidence = 0;
    if (name !== 'Unknown' && location !== 'Unknown') {
      confidence = 0.8; // High confidence if both name and location identified
      if (characteristics && interestingFacts) {
        confidence = 0.95; // Very high confidence if all details provided
      }
    }

    return {
      name,
      location,
      description: characteristics || 'Không có thông tin chi tiết',
      characteristics,
      interestingFacts,
      confidence,
    };
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      circuitBreaker: this.circuitBreaker.getState(),
    };
  }
}

module.exports = new GeminiService();
