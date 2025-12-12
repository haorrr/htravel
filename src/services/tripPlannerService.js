/**
 * Trip Planner Service
 * Generates AI-powered travel itineraries using Google Gemini
 * All content in Vietnamese for Vietnamese users
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const CircuitBreaker = require('../utils/circuitBreaker');
const logger = require('../utils/logger');

class TripPlannerService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY not configured - Trip Planner will be disabled');
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.circuitBreaker = new CircuitBreaker(5, 60000);
    this.model = 'gemini-2.5-flash'; 

    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000;

    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgResponseTime: 0,
    };
  }

  async generateItinerary(destination, duration, budget, interests) {
    if (!this.enabled) throw new Error('Dịch vụ chưa được cấu hình');

    const startTime = Date.now();
    this.stats.totalRequests++;

    const cacheKey = this.getCacheKey(destination, duration, budget, interests);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    this.stats.cacheMisses++;

    try {
      const prompt = this.buildVietnamesePrompt(destination, duration, budget, interests);

      const result = await this.circuitBreaker.call(async () => {
        return await this.callGemini(prompt);
      });

      // Nếu kết quả trả về là đối tượng lỗi từ AI (do địa điểm sai)
      if (result.error) {
        throw new Error(result.error);
      }

      this.validateResponse(result, duration);
      this.addToCache(cacheKey, result);
      this.updateStats(Date.now() - startTime);

      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  buildVietnamesePrompt(destination, duration, budget, interests) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);

    const interestMap = {
      culture: 'văn hóa', food: 'ẩm thực', nature: 'thiên nhiên',
      history: 'lịch sử', adventure: 'phiêu lưu', shopping: 'mua sắm',
      beach: 'biển', mountain: 'núi', art: 'nghệ thuật',
      nightlife: 'đêm', spiritual: 'tâm linh', photography: 'nhiếp ảnh',
    };
    const vietnameseInterests = interests.map(i => interestMap[i] || i).join(', ');

    return `
Bạn là chuyên gia du lịch. Hãy tạo lịch trình ${duration} ngày đi ${destination}.

QUAN TRỌNG - KIỂM TRA ĐỊA ĐIỂM:
Bước 1: Xác thực xem "${destination}" có phải là một địa danh, thành phố, tỉnh thành hoặc điểm du lịch thực sự hay không.
Bước 2:
- NẾU KHÔNG PHẢI địa điểm hợp lệ (ví dụ: chuỗi ký tự vô nghĩa, câu chào, tên người không nổi tiếng, từ khóa rác...), hãy trả về JSON duy nhất:
  { "error": "Vui lòng nhập địa điểm chính xác, Hãy kiểm tra lại địa điểm của bạn" }
  
- NẾU LÀ địa điểm hợp lệ, hãy tạo lịch trình chi tiết và trả về JSON theo cấu trúc sau:

THÔNG TIN CHUYẾN ĐI:
- Điểm đến: ${destination}
- Thời gian: ${duration} ngày
- Ngân sách: ${budget}
- Sở thích: ${vietnameseInterests}

ĐỊNH DẠNG JSON YÊU CẦU (NẾU HỢP LỆ):
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "morning": { "time": "...", "activity": "...", "description": "...", "estimatedCost": "..." },
      "afternoon": { "time": "...", "activity": "...", "description": "...", "estimatedCost": "..." },
      "evening": { "time": "...", "activity": "...", "description": "...", "estimatedCost": "..." }
    }
  ],
  "totalEstimatedCost": "...",
  "tips": ["..."],
  "warnings": ["..."]
}

LƯU Ý: Chỉ trả về JSON thuần, không có markdown.
`.trim();
  }

  async callGemini(prompt) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      apiVersion: 'v1beta',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.parseResponse(text);
    } catch (error) {
      if (error.message.includes('429')) throw new Error('Hệ thống đang bận, vui lòng thử lại sau');
      throw error;
    }
  }

  parseResponse(text) {
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);
      
      // Kiểm tra xem AI có trả về lỗi địa điểm không
      if (data.error) {
        return { error: data.error }; // Trả về object lỗi để hàm gọi xử lý
      }

      return data;
    } catch (error) {
      logger.error('JSON Parse Error', { text });
      throw new Error('Lỗi xử lý dữ liệu từ AI');
    }
  }

  validateResponse(response, expectedDuration) {
    // Nếu là object lỗi thì bỏ qua validate
    if (response.error) return;

    if (!response.days || response.days.length !== expectedDuration) {
      // AI đôi khi tự cắt ngắn ngày nếu địa điểm nhỏ, ta chấp nhận nhưng log warning
      logger.warn(`AI trả về ${response.days?.length} ngày thay vì ${expectedDuration}`);
    }
  }

  // --- Cache & Utils (Giữ nguyên) ---
  getCacheKey(destination, duration, budget, interests) {
    return JSON.stringify({ d: destination.toLowerCase().trim(), t: duration, b: budget, i: interests.sort() });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  addToCache(key, data) {
    // Không cache kết quả lỗi
    if (data.error) return;
    
    this.cache.set(key, { data, timestamp: Date.now() });
    if (this.cache.size > 100) this.cache.delete(this.cache.keys().next().value);
  }

  updateStats(time) {
    this.stats.avgResponseTime = (this.stats.avgResponseTime * (this.stats.totalRequests - 1) + time) / this.stats.totalRequests;
  }

  getStatus() {
    return { enabled: this.enabled, model: this.model, stats: this.stats };
  }
}

module.exports = new TripPlannerService();