# Quick Reference: Google Image Generation APIs

**Purpose:** Quick lookup for image generation capabilities and correct approaches

---

## The Right Way vs Wrong Way

### ❌ WRONG: Using Gemini SDK for Image Generation
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

// This WILL NOT work - SDK doesn't support image generation
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
const response = await model.generateContent(prompt);
// Returns: text, NOT images
// Runtime error: inlineData field doesn't exist
```

### ✅ RIGHT: Using Imagen 4 via REST API
```javascript
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');

const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const client = await auth.getClient();

const response = await client.request({
  url: `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/publishers/google/models/imagen-4-fast-generate-001:predict`,
  method: 'POST',
  data: {
    instances: [{ prompt: 'Your prompt here' }],
    parameters: { sampleCount: 4, aspectRatio: '16:9' }
  }
});

const images = response.data.predictions.map(p =>
  Buffer.from(p.bytesBase64Encoded, 'base64')
);
```

---

## Models & Capabilities

### Gemini Models (for understanding, NOT generation)
| Model | Vision | Text | **Image Gen** | Status |
|-------|--------|------|---|---|
| gemini-2.5-flash | ✅ | ✅ | ❌ | Stable |
| gemini-2.5-flash-image | ✅ | ✅ | ⚠️ REST only | Stable |
| gemini-3-pro | ✅ | ✅ | ❌ | Preview |
| gemini-3-pro-image | ✅ | ✅ | ⚠️ REST only | Preview |

### Imagen Models (for image generation)
| Model | Best For | Cost | Speed | Status |
|-------|----------|------|-------|--------|
| **imagen-4-fast** | Virtual tours | $0.02 | Fast | ✅ Recommended |
| **imagen-4** | High quality | $0.04 | Medium | ✅ Stable |
| **imagen-4-ultra** | Best quality | $0.06 | Slow | ✅ Available |

---

## API Endpoints

### ❌ WRONG: Gemini SDK
```
Not suitable for image generation
```

### ✅ RIGHT: Vertex AI REST API
```
https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/publishers/google/models/{MODEL}:predict
```

**Example:**
```
https://us-central1-aiplatform.googleapis.com/v1/projects/my-project/locations/us-central1/publishers/google/models/imagen-4-fast-generate-001:predict
```

---

## Request Format Comparison

### ❌ WRONG (SDK Format)
```javascript
{
  contents: [{
    role: 'user',
    parts: [
      { text: 'prompt' },
      { inlineData: { mimeType: 'image/jpeg', data: base64 } }
    ]
  }]
}
```

### ✅ RIGHT (Vertex AI Format)
```javascript
{
  instances: [
    { prompt: 'Your text prompt' }
    // Note: No image input for free API tier
  ],
  parameters: {
    sampleCount: 4,
    aspectRatio: '16:9',
    seed: 12345,
    addWatermark: false
  }
}
```

---

## Response Format Comparison

### ❌ WRONG Response Structure
```javascript
{
  candidates: [{
    content: {
      parts: [{
        inlineData: { data: 'base64...' }
      }]
    }
  }]
}
// This structure doesn't exist for Imagen
```

### ✅ RIGHT Response Structure
```javascript
{
  predictions: [
    { mimeType: 'image/png', bytesBase64Encoded: 'iVBORw...' },
    { mimeType: 'image/png', bytesBase64Encoded: 'iVBORw...' }
  ]
}
```

---

## Setup Checklist

- [ ] Enable Vertex AI API in Google Cloud Console
- [ ] Create service account with "Vertex AI User" role
- [ ] Download service account key (JSON file)
- [ ] Set `GCP_PROJECT_ID` environment variable
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS` for local dev
- [ ] Install: `npm install google-auth-library axios`
- [ ] Test authentication: Run `test-imagen-api.js`
- [ ] Test API call: Verify response has `predictions` array

---

## Cost Calculation

```javascript
// Cost per image
const imagenFastCost = 0.02;     // $0.02
const imagenStandardCost = 0.04; // $0.04
const imagenUltraCost = 0.06;    // $0.06

// Per request (4 images)
const costPerGeneration = imagenFastCost * 4; // $0.08

// Per user per day (5 generations max)
const costPerUserPerDay = costPerGeneration * 5; // $0.40

// Monthly (1000 users)
const monthlyUsers = 1000;
const monthlyCost = costPerUserPerDay * 30 * monthlyUsers; // $12,000

// NOTE: With daily limit of 5 = $6,000/month for 1000 users
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'inlineData'` | Using SDK response format | Use Vertex AI REST API |
| `generateImages is not a function` | SDK doesn't support it | Use REST API directly |
| `403 Forbidden` | Service account lacks permissions | Add "Vertex AI User" role |
| `404 Not Found` | Wrong endpoint or project ID | Verify project ID and region |
| `429 Rate Limited` | Too many requests | Implement rate limiting |
| `Empty predictions array` | Bad prompt or API issue | Retry with different prompt |

---

## Decision Tree: Which API to Use?

```
Do you need to generate images?
├─ YES → Use Imagen 4 via Vertex AI REST API ✅
├─ NO, I just need vision analysis → Use Gemini SDK ✅
└─ NO, I just need text → Use Gemini SDK ✅

Is it for virtual travel photos?
├─ YES → Use Imagen 4 Fast ($0.02/image) ✅
├─ NEED HIGH QUALITY → Use Imagen 4 Standard ($0.04/image) ✅
└─ NEED BEST QUALITY → Use Imagen 4 Ultra ($0.06/image) ✅

Is it for a side project with no budget?
├─ YES → Use free tier (25 images/min, ~180k/month) ✅
├─ NO → Use paid tier (300 images/min, unlimited)
└─ ENTERPRISE → Custom quota and pricing
```

---

## Code Templates

### Template 1: Basic Image Generation
```javascript
const result = await client.request({
  url: endpoint,
  method: 'POST',
  data: {
    instances: [{ prompt: userPrompt }],
    parameters: { sampleCount: 4 }
  }
});

const images = result.data.predictions.map(p =>
  Buffer.from(p.bytesBase64Encoded, 'base64')
);
```

### Template 2: With Error Handling
```javascript
try {
  const response = await client.request({...});
  return response.data.predictions;
} catch (error) {
  if (error.response?.status === 403) {
    throw new Error('GCP auth failed');
  }
  if (error.response?.status === 429) {
    throw new Error('Rate limited');
  }
  throw error;
}
```

### Template 3: With Circuit Breaker
```javascript
const result = await circuitBreaker.execute(async () => {
  const response = await client.request({...});
  return response.data.predictions;
});
```

---

## Environment Variables

```env
# Required for Imagen API
GCP_PROJECT_ID=your-gcp-project-id

# Optional
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json  # Local dev only

# NOT needed (Gemini SDK uses different auth)
GEMINI_API_KEY=...  # Keep for other Gemini features
```

---

## Rate Limits

### Free Tier
- 25 requests/minute
- ~180,000 images/month
- Cost: $0
- Duration: Indefinite

### Paid Tier
- 300 requests/minute
- Unlimited
- Cost: $0.02-$0.06 per image
- Usage-based billing

### Quotas to Monitor
```bash
# Check in Google Cloud Console
gcloud compute project-info describe --project=PROJECT_ID

# Monitor usage
gcloud billing accounts list
gcloud services usage describe aiplatform.googleapis.com
```

---

## What Works & What Doesn't

| Feature | Gemini SDK | Imagen REST API |
|---------|---|---|
| Text to image | ❌ | ✅ |
| Image understanding | ✅ | ❌ |
| Vision landmarks | ✅ | ❌ |
| Image editing | ❌ | ✅ (enterprise) |
| Fast generation | ❌ | ✅ |
| Batch processing | ✅ | ❌ |
| Structured output | ✅ | ❌ |

---

## Key Insight

> **The `@google/generative-ai` SDK is for understanding and generating text. Image GENERATION requires the Vertex AI REST API.**

This is the #1 reason projects fail with image generation - developers try to use the wrong API.

---

## When to Use What

| Use Case | API | Why |
|----------|-----|-----|
| Landmark recognition | Gemini SDK | Vision capability |
| Virtual travel photos | Imagen REST | Image generation |
| Analyze screenshot | Gemini SDK | Vision analysis |
| Generate landscape | Imagen REST | Image generation |
| Travel blog content | Gemini SDK | Text + vision |
| Composite selfies | Imagen REST | Image generation |

---

## Quick Verification

Run this to verify your setup works:

```javascript
// test-quick.js
const { GoogleAuth } = require('google-auth-library');

async function test() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const creds = await auth.getApplicationDefault();
  console.log('✅ Auth works');

  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  console.log(`✅ Project: ${projectId}`);

  // Try API call
  const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-4-fast-generate-001:predict`;
  const response = await client.request({
    url,
    method: 'POST',
    data: { instances: [{ prompt: 'test' }], parameters: { sampleCount: 1 } }
  });
  console.log(`✅ API works - ${response.data.predictions.length} image(s)`);
}

test().catch(console.error);
```

---

**Last Updated:** 2025-12-03
**Confidence:** High (backed by official Google documentation)
**Status:** Ready for production use
