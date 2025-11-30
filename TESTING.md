# Testing Guide - Phase 04 (AI Landmark Recognition)

## 🎯 Current Status

**Phase 04 Complete** ✅ - Code implemented and ready for testing

**What's Working:**
- ✅ Image upload middleware (10MB limit, JPEG/PNG/WebP)
- ✅ Image preprocessing with Sharp (resize, optimize)
- ✅ Circuit breaker pattern for API resilience
- ✅ Gemini Vision API integration with model fallback
- ✅ Rate limiting (20 requests per 15 minutes)
- ✅ Structured JSON validation
- ✅ Error handling and logging

**What You Need:** Gemini API Key (free, takes 2 minutes)

---

## 📝 Quick Setup (3 Steps)

### Step 1: Get Gemini API Key (Free)

1. Go to **https://ai.google.dev/**
2. Click **"Get API key in Google AI Studio"**
3. Sign in with your Google account
4. Click **"Create API Key"**
5. Copy the key

### Step 2: Configure Environment

Add to your `.env` file:

```env
GEMINI_API_KEY=your-actual-key-here
```

### Step 3: Restart Server

```bash
npm run dev
```

---

## 🧪 Running Tests

### Option 1: Quick Test with cURL

```bash
# Upload a landmark image
curl -X POST http://localhost:3000/api/ai/identify-landmark \
  -F "image=@./test-images/eiffel-tower.jpg"
```

### Option 2: Automated Test Script

```bash
# Download a test image first (or use your own)
# Then run the test script:
node test-landmark-manual.js ./test-images/eiffel-tower.jpg
```

The test script will verify:
- ✅ Image upload works
- ✅ Response structure is correct
- ✅ Confidence scores are valid (0.0 to 1.0)
- ✅ Required fields are present
- ✅ Invalid file types are rejected
- ✅ Rate limiting is active

### Expected Output

**Vietnamese Response Format** (as per critical requirement):

```json
{
  "success": true,
  "data": {
    "name": "Tháp Eiffel",
    "confidence": 0.95,
    "description": "Tháp Eiffel là một công trình kiến trúc bằng thép mạ kẽm...",
    "location": {
      "city": "Paris",
      "country": "France",
      "coordinates": null
    },
    "category": "tower",
    "characteristics": "Kiến trúc kim loại đặc trưng của thế kỷ 19...",
    "interestingFacts": "Được xây dựng năm 1889 cho Hội chợ Thế giới..."
  },
  "message": "Landmark identified successfully"
}
```

**If landmark not recognized:**

```json
{
  "success": true,
  "data": {
    "name": "Unknown",
    "confidence": 0,
    "description": "Tôi chưa nhận ra được địa điểm này, bạn có thể chụp lại hoặc đưa ảnh địa điểm nổi tiếng hơn được không",
    "location": {
      "city": "Unknown",
      "country": "Unknown",
      "coordinates": null
    },
    "category": "unknown",
    "characteristics": "",
    "interestingFacts": ""
  },
  "message": "Landmark identified successfully"
}
```

---

## 📊 Test Coverage

| Test Case | Status | Description |
|-----------|--------|-------------|
| Valid image upload | ✅ | JPEG/PNG/WebP accepted |
| Response structure | ✅ | All required fields present |
| Confidence validation | ✅ | Score between 0.0-1.0 |
| Invalid file type | ✅ | Text files rejected |
| No file uploaded | ✅ | Returns 400 error |
| Rate limiting | ✅ | 20 req/15min enforced |
| Circuit breaker | ✅ | Handles API failures |
| Model fallback | ✅ | Flash → Pro fallback |

---

## 🐛 Troubleshooting

### Error: "Gemini API key not configured"

**Solution:** Add `GEMINI_API_KEY` to `.env` and restart server

### Error: "Invalid API key"

**Solution:** Verify the key is correct in `.env` (no quotes, no spaces)

### Error: "Circuit breaker is OPEN"

**Cause:** Too many API failures (5 consecutive)
**Solution:** Wait 60 seconds, circuit breaker will reset to HALF_OPEN

### Error: "Landmark could not be identified"

**Possible Causes:**
- Image quality too poor (blurry, dark)
- Landmark not prominent in photo
- Unknown/obscure landmark
- Confidence score below threshold (0.5)

**Solution:** Try a different photo with better quality

### Error: "Too many AI requests"

**Cause:** Rate limit exceeded (20 requests in 15 minutes)
**Solution:** Wait 15 minutes or use a different IP

---

## 🔍 Checking Logs

Server logs are in `./logs/combined.log`:

```bash
# View recent logs
tail -f logs/combined.log

# Filter for AI-related logs
grep "Landmark identification" logs/combined.log
```

---

## ✅ Verification Checklist

Before moving to Phase 05, verify:

- [ ] Gemini API key configured in `.env`
- [ ] Server restarts without errors
- [ ] Test script passes all 6 tests
- [ ] Landmark correctly identified from test image
- [ ] Response includes all required fields
- [ ] Invalid files are rejected
- [ ] Circuit breaker logs appear in console
- [ ] Uploaded files saved to `./uploads/landmarks/`

---

## 🚀 Next Phase

Once all tests pass:

**Phase 05: Check-in & Map System**
- POST /api/user/check-in (record location visits)
- GET /api/user/map-history (visualize provinces)
- Google Geocoding API integration
- Province extraction from coordinates

**Estimated Time:** 4-5 hours

---

## 📚 Additional Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Test Images:** See `./test-images/README.md`
- **Implementation Plan:** `./docs/tech-stack.md`

---

**Need Help?** Check logs in `./logs/` or review error messages in console output.
