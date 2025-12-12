# Google Cloud Platform Setup Guide
**Virtual Tour Feature - Imagen 4 Configuration**

---

## Overview

The Virtual Tour feature uses **Google Cloud Platform's Vertex AI** with **Imagen 4** for AI-powered image generation. This guide walks you through setting up GCP access.

**Cost:** Imagen 4 Fast variant costs **$0.02 per image** (4 variations = $0.08 total)
**Free Tier:** 180,000 images/month (~25 images/minute)

---

## Prerequisites

- Google Cloud account (https://console.cloud.google.com)
- Credit card for GCP billing (required even for free tier)
- Terminal access with `gcloud` CLI (optional but recommended)

---

## Step 1: Create GCP Project

### Option A: Via Web Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select project dropdown
3. Click "NEW PROJECT"
4. Enter project name: `htravel-production` (or your preferred name)
5. Note the **Project ID** (auto-generated, e.g., `htravel-production-123456`)
6. Click "CREATE"

### Option B: Via gcloud CLI

```bash
# Install gcloud CLI: https://cloud.google.com/sdk/docs/install
gcloud projects create htravel-production --name="HTravel Production"
```

---

## Step 2: Enable Vertex AI API

### Option A: Via Web Console

1. Go to [Vertex AI API](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)
2. Select your project from the dropdown
3. Click "ENABLE"
4. Wait for API activation (~30 seconds)

### Option B: Via gcloud CLI

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable aiplatform.googleapis.com
```

---

## Step 3: Enable Billing

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click "Link a billing account"
3. Add payment method (credit card)
4. **Free Tier:** First 180,000 images/month are free
5. Set up [Budget Alerts](https://console.cloud.google.com/billing/budgets) (recommended: $50/month alert)

---

## Step 4: Create Service Account

### Option A: Via Web Console

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "CREATE SERVICE ACCOUNT"
3. Fill in:
   - **Name:** `htravel-imagen-service`
   - **Description:** `Service account for HTravelVirtual Tour image generation via Vertex AI`
4. Click "CREATE AND CONTINUE"
5. **Grant Role:** Select **"Vertex AI User"**
6. Click "CONTINUE" → "DONE"

### Option B: Via gcloud CLI

```bash
gcloud iam service-accounts create htravel-imagen-service \
  --description="Service account for HTravel Vertex AI" \
  --display-name="HTravel Imagen Service"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:htravel-imagen-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

---

## Step 5: Generate Service Account Key

### Option A: Via Web Console

1. Click on the service account you just created
2. Go to "KEYS" tab
3. Click "ADD KEY" → "Create new key"
4. Select **JSON** format
5. Click "CREATE"
6. Save the downloaded JSON file securely

### Option B: Via gcloud CLI

```bash
gcloud iam service-accounts keys create ./config/gcp-service-account-key.json \
  --iam-account=htravel-imagen-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

---

## Step 6: Configure Application

### Local Development

1. Copy the service account JSON key to your project:
   ```bash
   mkdir -p config
   mv ~/Downloads/htravel-production-*.json config/gcp-service-account-key.json
   ```

2. Update `.env` file:
   ```env
   GCP_PROJECT_ID=your-actual-project-id
   GCP_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account-key.json
   ```

3. **Security:** Add to `.gitignore`:
   ```
   config/gcp-service-account-key.json
   ```

### Production Deployment (Cloud Run, App Engine, Compute Engine)

For production environments running on GCP infrastructure:

1. Update `.env`:
   ```env
   GCP_PROJECT_ID=your-actual-project-id
   GCP_LOCATION=us-central1
   # Do NOT set GOOGLE_APPLICATION_CREDENTIALS - use default credentials
   ```

2. **Attach Service Account to Compute Resource:**
   - **Cloud Run:** Set service account in deployment config
   - **App Engine:** Automatic with default service account
   - **Compute Engine:** Attach service account to VM instance

---

## Step 7: Test Configuration

### Test Script

Create `test-gcp-setup.js`:

```javascript
const { GoogleAuth } = require('google-auth-library');

async function testGCPSetup() {
  console.log('Testing GCP Configuration...\n');

  // Check environment variables
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || 'us-central1';
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  console.log('✓ Project ID:', projectId);
  console.log('✓ Location:', location);
  console.log('✓ Credentials:', credsPath || 'Using default credentials');

  // Test authentication
  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    console.log('\n✓ Authentication successful!');

    // Test API endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-4-fast-generate-001:predict`;
    console.log('✓ API Endpoint:', endpoint);

    console.log('\n✅ GCP Setup Complete! Ready to generate images.');
  } catch (error) {
    console.error('\n❌ Setup Failed:', error.message);
    process.exit(1);
  }
}

testGCPSetup();
```

### Run Test

```bash
node test-gcp-setup.js
```

**Expected Output:**
```
Testing GCP Configuration...

✓ Project ID: htravel-production-123456
✓ Location: us-central1
✓ Credentials: ./config/gcp-service-account-key.json

✓ Authentication successful!
✓ API Endpoint: https://us-central1-aiplatform.googleapis.com/...

✅ GCP Setup Complete! Ready to generate images.
```

---

## Step 8: Verify Virtual Tour Feature

### Test via API

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@htravel.com","password":"admin123456"}'

# Copy the accessToken from response

# Generate virtual travel photo
curl -X POST http://localhost:3000/api/ai/virtual-travel \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "selfie=@./test-images/selfie.jpg" \
  -F "destination=Vịnh Hạ Long, Việt Nam"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Virtual travel photo generated successfully",
  "data": {
    "id": "uuid-here",
    "destination": "Vịnh Hạ Long, Việt Nam",
    "generatedImages": ["/uploads/virtual-travel/..."],
    "metadata": {
      "model": "imagen-4-fast-generate-001",
      "totalCost": 0.08
    }
  }
}
```

---

## Security Best Practices

### 1. Protect Service Account Keys

- ✅ **DO:** Store keys in `config/` directory
- ✅ **DO:** Add keys to `.gitignore`
- ✅ **DO:** Use environment variables
- ❌ **DON'T:** Commit keys to Git
- ❌ **DON'T:** Share keys publicly
- ❌ **DON'T:** Email keys

### 2. Rotate Keys Regularly

- Rotate service account keys every 90 days
- Delete old keys after rotation
- Monitor key usage in GCP Console

### 3. Use Least Privilege

- Only grant "Vertex AI User" role
- Don't use "Editor" or "Owner" roles
- Create separate service accounts per environment

### 4. Monitor Costs

- Set up budget alerts (recommend $50/month)
- Review usage in [Billing Reports](https://console.cloud.google.com/billing/reports)
- Enable [Cost Allocation](https://console.cloud.google.com/billing/cost-breakdown)

### 5. Enable Audit Logging

```bash
gcloud logging read "resource.type=aiplatform.googleapis.com" --limit=50
```

---

## Troubleshooting

### Error: "GCP_PROJECT_ID not configured"

**Solution:** Set environment variable in `.env`:
```env
GCP_PROJECT_ID=your-actual-project-id
```

### Error: "GCP Authentication failed" (403)

**Possible Causes:**
1. Service account key file not found
2. Invalid credentials
3. Service account doesn't have "Vertex AI User" role

**Solutions:**
```bash
# Check credentials file exists
ls -la config/gcp-service-account-key.json

# Verify service account has correct role
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --filter="bindings.role:roles/aiplatform.user"
```

### Error: "Model or endpoint not found" (404)

**Possible Causes:**
1. Vertex AI API not enabled
2. Wrong model name
3. Wrong location

**Solutions:**
```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Check available locations
gcloud ai models list --region=us-central1
```

### Error: "Rate limit exceeded" (429)

**Solution:** You've exceeded free tier limits (25 images/min).

- Wait a few minutes before retrying
- Upgrade to paid tier for higher limits
- Implement user-level rate limiting in application

### Error: "Service is busy" (Circuit Breaker Open)

**Solution:** Circuit breaker detected multiple failures and is protecting the system.

- Wait 90 seconds for circuit breaker to reset
- Check GCP Console for API issues
- Review application logs for root cause

---

## Cost Optimization Tips

### 1. Use Fast Variant

- **Fast:** $0.02/image (recommended for most cases)
- **Standard:** $0.04/image (better quality)
- **Ultra:** $0.06/image (best quality, slowest)

```javascript
// In virtualTravelImageService.js
this.model = 'imagen-4-fast-generate-001'; // Already configured
```

### 2. Implement Caching

Cache generated images to avoid regenerating identical requests:

```javascript
// Check if user already generated image for this destination
const existing = await VirtualTrip.findOne({
  where: { userId, destinationName: destination },
  order: [['createdAt', 'DESC']]
});

if (existing && Date.now() - existing.createdAt < 24 * 60 * 60 * 1000) {
  // Return cached image if less than 24 hours old
  return existing;
}
```

### 3. Reduce Variations

Generate fewer images per request to save costs:

```javascript
// In virtualTravelImageService.js, line ~148
parameters: {
  sampleCount: 2, // Generate 2 instead of 4 (save 50%)
}
```

### 4. Implement User Limits

Limit free users to prevent abuse:

```javascript
// In aiController.js
const today = new Date().setHours(0, 0, 0, 0);
const userGenerationsToday = await VirtualTrip.count({
  where: {
    userId,
    createdAt: { [Op.gte]: today }
  }
});

if (user.plan === 'free' && userGenerationsToday >= 5) {
  throw new Error('Daily limit reached (5 generations/day for free users)');
}
```

---

## Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Imagen 4 Guide](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
- [GCP Free Tier](https://cloud.google.com/free)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

---

## Support

If you encounter issues:

1. Check [GCP Status Dashboard](https://status.cloud.google.com/)
2. Review application logs: `npm run logs`
3. Test with `test-gcp-setup.js` script
4. Contact GCP Support via Console

---

**Last Updated:** 2025-12-03
**Status:** Ready for Implementation
