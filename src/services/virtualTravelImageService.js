/**
 * Virtual Travel Image Service (Gemini 2.5 Flash Image - Optimized)
 * Model: gemini-2.5-flash-image
 * Feature: Multimodal Input (Selfie + Prompt) -> Image Output
 */

const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const CircuitBreaker = require('../utils/circuitBreaker');
const axios = require('axios'); // Dùng cho fallback

class VirtualTravelImageService {
  constructor() {
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || 'us-central1';

    if (!projectId) {
      logger.warn('GCP_PROJECT_ID chưa cấu hình.');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    
    // Khởi tạo Vertex AI SDK
    this.vertexAI = new VertexAI({ project: projectId, location: location });

    // SỬ DỤNG ĐÚNG TÊN MODEL BẠN ĐÃ CHECK TRÊN CONSOLE
    this.modelName = 'gemini-2.5-flash-image'; 
    
    this.generativeModel = this.vertexAI.preview.getGenerativeModel({
      model: this.modelName
    });

    this.circuitBreaker = new CircuitBreaker(3, 90000); 
  }

  async generateVirtualTravel(selfiePath, destination) {
    if (!this.enabled) throw new Error('Dịch vụ chưa được cấu hình.');

    try {
      // 1. Đọc file ảnh Selfie
      const imageBuffer = await fs.readFile(selfiePath);
      const base64Image = imageBuffer.toString('base64');

      logger.info(`Đang gọi model ${this.modelName} để tạo ảnh du lịch...`, { destination });

      // 2. Gọi API qua Circuit Breaker
      const result = await this.circuitBreaker.call(async () => {
        return await this.callGeminiSDK(base64Image, destination);
      });

      return result;

    } catch (error) {
      logger.error('Gemini 2.5 Generation thất bại:', error.message);
      
      // Fallback Unsplash (Cứu cánh khi demo nếu model mới bị lỗi)
      logger.warn('⚠️ Chuyển sang ảnh dự phòng Unsplash');
      const mockImages = await this.getMockImage(destination);
      return {
        images: mockImages,
        metadata: { model: 'fallback-unsplash', destination }
      };
    }
  }

  async callGeminiSDK(base64Image, destination) {
    // Prompt được tối ưu cho model tạo ảnh của Gemini
    // Yêu cầu rõ ràng: "Generate an image" thay vì "Describe"
    const prompt = `Generate a high-quality, photorealistic travel photo based on the input image.
    ACTION: Place the person from the input image into a new background.
    BACKGROUND: A famous, breathtaking landmark of ${destination}, Vietnam.
    SUBJECT: Keep the person's facial features and upper body clothing exactly as they are.
    STYLE: Cinematic lighting, 8k resolution, professional travel photography.
    OUTPUT: A single image file.`;

    const request = {
      contents: [{
        role: 'user',
        parts: [
          // Input 1: Ảnh gốc (Selfie)
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          // Input 2: Lệnh tạo ảnh
          { text: prompt }
        ]
      }],
      // Cấu hình quan trọng để nhận về ẢNH
      generationConfig: {
        temperature: 0.4, // Giữ nguyên bản dạng người, ít sáng tạo lung tung
        // Ép kiểu trả về là ảnh (nếu SDK hỗ trợ tham số này cho model image)
        // Nếu không hỗ trợ, model sẽ tự trả về inlineData mặc định
      }
    };

    const result = await this.generativeModel.generateContent(request);
    const response = await result.response;
    
    // --- XỬ LÝ KẾT QUẢ ---
    // Gemini trả về ảnh dưới dạng inlineData trong mảng parts
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    let imageBuffer = null;

    for (const part of parts) {
      // Kiểm tra xem có dữ liệu ảnh trả về không
      if (part.inlineData && part.inlineData.data) {
        imageBuffer = Buffer.from(part.inlineData.data, 'base64');
        logger.info('✅ Đã nhận được ảnh từ Gemini!');
        break;
      }
    }

    if (!imageBuffer) {
      // Nếu model từ chối tạo ảnh (trả về text giải thích), ta log ra để biết
      const textResponse = parts.map(p => p.text).join(' ');
      logger.warn('Gemini không trả về ảnh, phản hồi text:', textResponse);
      throw new Error("Model Gemini chỉ trả về văn bản, không có ảnh. (Có thể do Safety Filter)");
    }

    return {
      images: [imageBuffer],
      metadata: {
        model: this.modelName,
        destination,
        generatedAt: new Date().toISOString(),
        imageCount: 1
      }
    };
  }

  async getMockImage(destination) {
     try {
       const res = await axios.get(`https://source.unsplash.com/random/1920x1080/?${encodeURIComponent(destination)},travel`, { responseType: 'arraybuffer' });
       return [Buffer.from(res.data)];
     } catch (e) { return []; }
  }

  getStatus() {
    return { enabled: this.enabled, model: this.modelName };
  }
}

module.exports = new VirtualTravelImageService();