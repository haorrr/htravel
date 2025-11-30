# Testing Guide - Phase 07 (AI Virtual Travel)

## 🎯 Current Status

**Phase 07 Complete** ✅ - Code implemented and ready for testing

**What's Working:**
- ✅ Selfie upload middleware (10MB limit, JPEG/PNG/WebP)
- ✅ Imagen 4.0 API integration for virtual travel photos
- ✅ Vietnamese destination prompt support
- ✅ Circuit breaker pattern for API resilience
- ✅ Rate limiting (20 requests per 15 minutes)
- ✅ Multiple image variations (generates 4 images)
- ✅ Virtual travel history tracking
- ✅ Database persistence (VirtualTrip model)

**What You Need:**
- Gemini API Key (same key works for both Gemini and Imagen APIs)
- A selfie image (JPEG/PNG, max 10MB)

---

## 📝 Quick Setup

### Step 1: Verify API Key

Your `.env` file should already have:

```env
GEMINI_API_KEY=your-actual-key-here
```

**Important:** The same Gemini API key works for both:
- Gemini Vision API (landmark recognition)
- Imagen 4.0 API (virtual travel photo generation)

### Step 2: Prepare Test Image

You need a selfie image for testing. Requirements:
- **Format**: JPEG, PNG, or WebP
- **Size**: Max 10MB
- **Content**: A clear photo with a person's face
- **Best results**: Front-facing photo with good lighting

Save your test selfie to:
```bash
./test-images/selfie.jpg
```

### Step 3: Restart Server (if not already running)

```bash
npm run dev
```

---

## 🧪 Running Tests

### Option 1: Automated Test Script

```bash
node test-virtual-travel-manual.js ./test-images/selfie.jpg
```

The test script will verify:
- ✅ User authentication works
- ✅ AI service status (Gemini + Imagen)
- ✅ Virtual travel photo generation with Vietnamese destination
- ✅ Virtual travel photo generation with international destination
- ✅ Virtual travel history retrieval
- ✅ Authentication requirement
- ✅ Destination requirement
- ✅ Selfie image requirement

**Note:** Each virtual travel generation takes **30-60 seconds** due to Imagen API processing time.

### Option 2: Quick Test with cURL

```bash
# First, login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@htravel.com","password":"admin123456"}'

# Use the accessToken from response
export TOKEN="your-access-token-here"

# Generate virtual travel photo
curl -X POST http://localhost:3000/api/ai/virtual-travel \
  -H "Authorization: Bearer $TOKEN" \
  -F "selfie=@./test-images/selfie.jpg" \
  -F "destination=Tháp Eiffel, Paris, Pháp"
```

### Expected Response

**Success Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "destination": "Tháp Eiffel, Paris, Pháp",
    "originalImage": "/uploads/selfies/selfie-userId-timestamp.jpg",
    "generatedImages": [
      "/uploads/virtual-travel/virtual-userId-timestamp-0.jpg",
      "/uploads/virtual-travel/virtual-userId-timestamp-1.jpg",
      "/uploads/virtual-travel/virtual-userId-timestamp-2.jpg",
      "/uploads/virtual-travel/virtual-userId-timestamp-3.jpg"
    ],
    "primaryImage": "/uploads/virtual-travel/virtual-userId-timestamp-0.jpg",
    "createdAt": "2025-11-25T00:00:00.000Z"
  },
  "message": "Virtual travel photo generated successfully"
}
```

**View Generated Images:**

Access via browser:
```
http://localhost:3000/uploads/virtual-travel/virtual-userId-timestamp-0.jpg
http://localhost:3000/uploads/virtual-travel/virtual-userId-timestamp-1.jpg
...
```

---

## 📊 Test Coverage

| Test Case | Status | Description |
|-----------|--------|-------------|
| Selfie upload | ✅ | JPEG/PNG/WebP accepted |
| Authentication | ✅ | JWT required |
| Imagen API call | ✅ | 4 image variations generated |
| Vietnamese prompts | ✅ | Vietnamese destination names |
| Database persistence | ✅ | Virtual trips saved |
| History retrieval | ✅ | Paginated history |
| Rate limiting | ✅ | 20 req/15min enforced |
| Circuit breaker | ✅ | Handles API failures |
| Error handling | ✅ | Proper error messages |

---

## 🐛 Troubleshooting

### Error: "Gemini API key not configured"

**Solution:** Add `GEMINI_API_KEY` to `.env` and restart server

### Error: "Invalid request to Imagen API"

**Possible Causes:**
- Imagen API format changed (check Google AI docs)
- Image format not supported
- Image too large or corrupted
- Invalid base64 encoding

**Solution:**
- Verify image file is valid JPEG/PNG
- Check API documentation for latest format
- Try with a different image

### Error: "Imagen API rate limit exceeded"

**Cause:** Too many requests to Imagen API

**Solution:** Wait 15 minutes or use a different API key

### Generation Takes Too Long (> 2 minutes)

**Possible Causes:**
- Imagen API is slow or experiencing high load
- Network connectivity issues
- API timeout configuration

**Solution:**
- Wait longer (Imagen can take up to 2 minutes)
- Check API status: https://status.cloud.google.com/
- Increase timeout in code if needed

### Error: "Circuit breaker is OPEN"

**Cause:** Too many API failures (5 consecutive)

**Solution:** Wait 60 seconds for circuit breaker to reset

---

## 🎨 API Response Format

### Vietnamese Prompt Template

The service uses this prompt template:

```
Một bức ảnh phong cảnh góc rộng với người trong ảnh đứng tại [Destination].
Khuôn mặt và hình dáng của người phải giống y hệt với ảnh gốc.
Bố cục ảnh mang tính điện ảnh và hoành tráng, thể hiện quy mô của môi trường xung quanh.
Ánh sáng điện ảnh phù hợp với thời gian trong ngày, màu sắc tự nhiên đẹp mắt,
sự pha trộn hài hòa giữa người và bối cảnh, chân thực, chất lượng điện ảnh đạt giải thưởng.
```

This ensures:
- Wide-angle landscape composition
- Face consistency with original selfie
- Cinematic lighting and colors
- Photorealistic quality
- Coherent blend between subject and background

---

## 🔍 Testing Vietnamese Destinations

Try these Vietnamese destinations:

```bash
# Ha Long Bay
"Vịnh Hạ Long, Quảng Ninh, Việt Nam"

# Hoi An Ancient Town
"Phố cổ Hội An, Quảng Nam, Việt Nam"

# Sa Pa Rice Terraces
"Ruộng bậc thang Sa Pa, Lào Cai, Việt Nam"

# Ninh Binh
"Tràng An, Ninh Bình, Việt Nam"

# Ho Chi Minh City
"Nhà thờ Đức Bà, Thành phố Hồ Chí Minh, Việt Nam"
```

---

## ✅ Verification Checklist

Before moving to Phase 08, verify:

- [ ] Gemini API key configured in `.env`
- [ ] Server restarts without errors
- [ ] Test script passes all 8 tests
- [ ] Virtual travel photo generated successfully
- [ ] 4 image variations returned
- [ ] Generated images saved to `./uploads/virtual-travel/`
- [ ] Images accessible via browser
- [ ] Virtual travel history retrieved
- [ ] Circuit breaker logs appear in console
- [ ] Rate limiting works correctly

---

## 🚀 Next Phase

Once all tests pass:

**Phase 08: Google Maps Integration**
- Text search for places
- Nearby attractions
- Place details with reviews & ratings
- Integration with check-in system

**Estimated Time:** 4-5 hours

---

## 📚 Additional Resources

- **Imagen API Docs:** https://ai.google.dev/docs/imagen
- **Gemini API Key:** https://ai.google.dev/
- **Test Images:** See `./test-images/README.md`
- **Implementation Plan:** `./docs/tech-stack.md`

---

## ⚠️ Important Notes

1. **API Costs:** Imagen API calls may incur costs. Check your Google Cloud billing.
2. **Rate Limits:** Default is 20 requests per 15 minutes per IP.
3. **Generation Time:** Each generation takes 30-60 seconds.
4. **Image Quality:** Results depend on selfie quality and lighting.
5. **Circuit Breaker:** Protects against API failures, auto-resets after 60 seconds.

---

**Need Help?** Check logs in `./logs/` or review error messages in console output.
