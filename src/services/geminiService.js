/**
 * Gemini AI Service (UPDATED FOR GEMINI 3 PRO)
 * Handles landmark recognition using Google Gemini Vision API
 * Documentation: https://ai.google.dev/gemini-api/docs/models?hl=vi#gemini-2.5-flash
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

    // CẬP NHẬT: Sử dụng model Gemini 3 Pro Preview mới nhất (12/2025)
    this.models = [
      'gemini-2.5-flash', // Model thông minh nhất hiện nay (Reasoning Model)
      'gemini-2.5-flash',     // Fallback: Model tốc độ cao, ổn định
    ];

    // Prompt tối ưu cho JSON Output
    this.vietnamesePrompt = `
      Analyze this image and identify the landmark. 
      Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
      {
        "name": "Exact name of the location",
        "location": "City/Province, Region",
        "description": "Unique architecture or history (in Vietnamese)",
        "fun_fact": "Interesting fact (in Vietnamese)",
        "confidence": "High/Medium/Low"
      }
      
      If you cannot identify the location with certainty, return exactly:
      {
        "name": "Unknown",
        "location": "Unknown",
        "description": "Tôi chưa nhận ra được địa điểm này, bạn có thể chụp lại hoặc đưa ảnh địa điểm nổi tiếng hơn được không",
        "fun_fact": "",
        "confidence": "None"
      }
    `;
  }

  async identifyLandmark(imagePath) {
    if (!this.enabled) throw new Error('Gemini AI service is not configured');

    let processedPath = null;
    try {
      await imageProcessor.validate(imagePath);
      processedPath = await imageProcessor.preprocessForGemini(imagePath);
      const imageBuffer = await fs.readFile(processedPath);

      const result = await this.circuitBreaker.call(async () => {
        return await this.identifyWithFallback(imageBuffer);
      });

      // Cleanup
      await imageProcessor.cleanup(processedPath);
      if (imagePath !== processedPath) await imageProcessor.cleanup(imagePath);

      return result;
    } catch (error) {
      if (processedPath) await imageProcessor.cleanup(processedPath);
      await imageProcessor.cleanup(imagePath);
      logger.error('Landmark identification failed:', { error: error.message });
      throw error;
    }
  }

  async identifyWithFallback(imageBuffer) {
    const errors = [];

    for (const modelName of this.models) {
      try {
        logger.info(`Attempting landmark identification with ${modelName}`);
        const result = await this.identifyWithModel(modelName, imageBuffer);
        return result;
      } catch (error) {
        logger.error(`${modelName} failed:`, { error: error.message });
        errors.push(error);

        // Không retry nếu lỗi từ phía client (400, 404 - sai tên model hoặc bad request)
        if (error.message.includes('400') || error.message.includes('404')) {
          // Nếu model 3.0 chưa khả dụng với Key hiện tại, thử tiếp model sau
          continue; 
        }

        if (this.models.indexOf(modelName) < this.models.length - 1) {
          await this.delay(1000);
        }
      }
    }

    // Fallback response
    return {
      name: 'Unknown',
      location: 'Unknown',
      description: 'Hệ thống đang bận hoặc không nhận diện được ảnh.',
      characteristics: '',
      interestingFacts: '',
      confidence: 0,
    };
  }

  async identifyWithModel(modelName, imageBuffer) {
    // CẤU HÌNH QUAN TRỌNG CHO GEMINI 3
    const model = this.client.getGenerativeModel({
      model: modelName,
      apiVersion: 'v1beta', // Bắt buộc dùng v1beta cho các model preview
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 1024,
        responseMimeType: "application/json" // Ép kiểu trả về JSON chuẩn
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

    return this.parseResponse(text);
  }

  parseResponse(text) {
    try {
      // Làm sạch chuỗi JSON nếu AI trả về kèm markdown
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);

      if (data.name === 'Unknown') {
        return {
          name: 'Unknown',
          location: 'Unknown',
          description: data.description,
          characteristics: '',
          interestingFacts: '',
          confidence: 0
        };
      }

      return {
        name: data.name,
        location: data.location,
        description: data.description,
        characteristics: data.description,
        interestingFacts: data.fun_fact,
        confidence: 0.95
      };
    } catch (error) {
      logger.error('Failed to parse AI JSON response:', text);
      return {
        name: 'Unknown',
        location: 'Unknown',
        description: 'Lỗi xử lý dữ liệu từ AI.',
        confidence: 0
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      enabled: this.enabled,
      circuitBreaker: this.circuitBreaker.getState(),
    };
  }
}

module.exports = new GeminiService();