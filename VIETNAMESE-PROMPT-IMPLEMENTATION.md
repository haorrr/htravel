# Vietnamese Prompt Implementation - Phase 04

## Critical Requirement Applied ✅

The Gemini Vision API has been configured to use **Vietnamese language responses** for landmark identification as per your critical requirement.

---

## 📋 Prompt Used (Exact)

```
Please analyze this image and identify the specific location shown. Then, provide a detailed description in Vietnamese, structured as follows:

Tên địa điểm: The exact name of the location/landmark.
Vị trí: The specific province/city and region.
Nét đặc trưng: Describe the unique architecture, landscape, or historical/cultural significance.
Điều thú vị: Share a few interesting facts or recommended experiences.
Important: If you cannot identify the location with certainty, please respond only with this exact Vietnamese sentence: 'Tôi chưa nhận ra được địa điểm này, bạn có thể chụp lại hoặc đưa ảnh địa điểm nổi tiếng hơn được không'.
```

---

## 🔄 Response Structure

### Successful Identification

```json
{
  "success": true,
  "data": {
    "name": "Tháp Eiffel",
    "confidence": 0.95,
    "description": "Kiến trúc kim loại đặc trưng...",
    "location": {
      "city": "Paris",
      "country": "France",
      "coordinates": null
    },
    "category": "tower",
    "characteristics": "Tháp Eiffel là một công trình kiến trúc bằng thép...",
    "interestingFacts": "Được xây dựng năm 1889 cho Hội chợ Thế giới..."
  },
  "message": "Landmark identified successfully"
}
```

### Unknown Landmark

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

## 🔧 Implementation Details

### 1. Gemini Service (`src/services/geminiService.js`)

**Vietnamese Prompt Storage:**
```javascript
this.vietnamesePrompt = `Please analyze this image and identify...`;
```

**Response Parser:**
```javascript
parseVietnameseResponse(text) {
  // Check for "unknown" fallback message
  if (text.includes('Tôi chưa nhận ra được địa điểm này')) {
    return { name: 'Unknown', confidence: 0, ... };
  }

  // Extract Vietnamese fields using regex
  const nameMatch = text.match(/Tên địa điểm:\s*(.+?)(?:\n|$)/i);
  const locationMatch = text.match(/Vị trí:\s*(.+?)(?:\n|$)/i);
  const characteristicsMatch = text.match(/Nét đặc trưng:\s*(.+?)(?:\n(?:Điều thú vị|$))/is);
  const factsMatch = text.match(/Điều thú vị:\s*(.+?)$/is);

  // Calculate confidence based on completeness
  let confidence = 0.8; // High if name + location
  if (characteristics && interestingFacts) confidence = 0.95;

  return { name, location, description, characteristics, interestingFacts, confidence };
}
```

### 2. AI Controller (`src/controllers/aiController.js`)

**Response Transformation:**
```javascript
const response = {
  name: result.name,
  confidence: result.confidence,
  description: result.description || result.characteristics || 'Không có thông tin chi tiết',
  location: parseLocation(result.location),
  category: categorizelandmark(result.name, result.location),
  characteristics: result.characteristics || '',
  interestingFacts: result.interestingFacts || '',
};
```

**Category Detection:**
- Automatically categorizes landmarks: tower, bridge, religious, palace, museum, monument, park, natural, stadium, building, unknown
- Based on keyword matching in Vietnamese or English names

### 3. Test Script Updated

**New Fields Validated:**
- `name` (string)
- `confidence` (number, 0-1)
- `description` (string, Vietnamese)
- `location` (object with city/country)
- `category` (string)
- `characteristics` (string, Vietnamese)
- `interestingFacts` (string, Vietnamese)

---

## 🧪 Testing the Implementation

### 1. Start Server

```bash
npm run dev
```

### 2. Run Tests

```bash
node test-landmark-manual.js ./test-images/your-landmark-photo.jpg
```

### 3. Expected Results

**For recognized landmarks:**
- All 6 tests should pass ✅
- Vietnamese text in `characteristics` and `interestingFacts`
- Confidence score between 0.8-0.95
- Proper category assignment

**For unknown images:**
- Response contains Vietnamese fallback message
- Confidence = 0
- Category = "unknown"

---

## 📝 Vietnamese Field Mapping

| Gemini Output (Vietnamese) | API Response Field | Type |
|----------------------------|-------------------|------|
| Tên địa điểm | `name` | string |
| Vị trí | `location.city`, `location.country` | object |
| Nét đặc trưng | `characteristics`, `description` | string |
| Điều thú vị | `interestingFacts` | string |
| Calculated | `confidence` | number |
| Auto-detected | `category` | string |

---

## 🔍 Error Handling

1. **Empty multipart form** → 400 error (fixed in errorHandler.js)
2. **Invalid file type** → 400 error with validation message
3. **Gemini API failure** → Circuit breaker + model fallback
4. **Low confidence (<0.5)** → Retry with fallback model
5. **All models fail** → Return Vietnamese "unknown" message

---

## ✅ Compliance Checklist

- [x] Uses exact Vietnamese prompt as specified
- [x] Returns Vietnamese responses for identified landmarks
- [x] Returns specific Vietnamese fallback for unknown landmarks
- [x] Parses Vietnamese field labels correctly
- [x] Calculates confidence based on response completeness
- [x] Maintains backward compatibility with API structure
- [x] All required fields present in response
- [x] Error handling for malformed responses
- [x] Test script validates Vietnamese format

---

## 🚀 Next Steps

1. Configure `GEMINI_API_KEY` in `.env`
2. Restart server
3. Test with Vietnamese landmark photos (Hạ Long Bay, Hội An, etc.)
4. Verify Vietnamese responses are generated correctly
5. Proceed to Phase 05 once tests pass

---

**Implementation Status:** ✅ Complete and ready for testing
