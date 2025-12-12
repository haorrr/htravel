# 🚀 GCP Setup - Interactive Guided Walkthrough

**Estimated Time:** 20-30 minutes
**Cost:** Free (180,000 images/month free tier)

---

## Before You Start

**What you'll need:**
- [ ] Google account (Gmail)
- [ ] Credit card for billing verification (won't be charged for free tier)
- [ ] 30 minutes of time
- [ ] Browser access to Google Cloud Console

**What you'll get:**
- Virtual Tour feature fully operational
- Ability to generate 4 AI travel photos per request
- 180,000 free images per month (~6,000/day)

---

## 📍 Step 1: Create Google Cloud Account (5 minutes)

### 1.1 Sign Up

1. Go to: **https://console.cloud.google.com**
2. Click **"Get started for free"** (if first time)
3. Sign in with your Google account
4. Accept Terms of Service

### 1.2 Verify Identity & Add Payment

1. Select your country
2. Accept Terms of Service
3. **Add credit card** (required for verification)
   - ⚠️ You won't be charged during free tier
   - Free tier includes 180,000 images/month
4. Complete verification

✅ **Checkpoint:** You should now see the GCP Console dashboard

---

## 📍 Step 2: Create GCP Project (3 minutes)

### 2.1 Create New Project

1. In GCP Console, look for the **project dropdown** at the top
2. Click **"NEW PROJECT"**

3. Fill in project details:
   ```
   Project name: htravel-development
   ```
   - Note: Project ID will be auto-generated (e.g., `htravel-development-123456`)
   - **⚠️ IMPORTANT: Copy your Project ID!** You'll need it later.

4. Click **"CREATE"**
5. Wait ~10 seconds for project creation

### 2.2 Select Your Project

1. Click the project dropdown again
2. Select your new project: **htravel-development**

✅ **Checkpoint:** You should see your project name in the top bar

**📝 Write down your Project ID:**
```
My Project ID: _________________________________
```

---

## 📍 Step 3: Enable Vertex AI API (2 minutes)

### 3.1 Navigate to API Library

1. In GCP Console, click the **☰ hamburger menu** (top-left)
2. Scroll to **"APIs & Services"** → Click **"Library"**

### 3.2 Enable Vertex AI API

1. In the search bar, type: **"Vertex AI API"**
2. Click on **"Vertex AI API"** from results
3. Click the blue **"ENABLE"** button
4. Wait ~30 seconds for activation

✅ **Checkpoint:** You should see "API enabled" with a green checkmark

**Alternative method (using link):**
- Direct link: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
- Make sure your project is selected
- Click ENABLE

---

## 📍 Step 4: Enable Billing (3 minutes)

### 4.1 Link Billing Account

1. Go to: **☰ Menu** → **"Billing"**
2. If prompted, click **"Link a billing account"**
3. Add your payment method (if not already added)
4. Confirm billing is enabled

### 4.2 Set Budget Alert (Recommended)

1. Go to: **☰ Menu** → **"Billing"** → **"Budgets & alerts"**
2. Click **"CREATE BUDGET"**
3. Fill in:
   ```
   Budget name: Monthly Alert
   Projects: Select your project
   Budget amount: $50 USD
   Alert threshold: 50%, 90%, 100%
   ```
4. Add your email for notifications
5. Click **"FINISH"**

✅ **Checkpoint:** Budget alert created successfully

---

## 📍 Step 5: Create Service Account (5 minutes)

### 5.1 Navigate to Service Accounts

1. Go to: **☰ Menu** → **"IAM & Admin"** → **"Service Accounts"**
2. Or direct link: https://console.cloud.google.com/iam-admin/serviceaccounts

### 5.2 Create Service Account

1. Click **"+ CREATE SERVICE ACCOUNT"** (top of page)

2. **Step 1: Service account details**
   ```
   Service account name: htravel-imagen-service
   Service account ID: (auto-generated)
   Description: Service account for HTravel Virtual Tour image generation
   ```
   Click **"CREATE AND CONTINUE"**

3. **Step 2: Grant access**
   - Click the **"Select a role"** dropdown
   - Type: **"Vertex AI User"**
   - Select: **"Vertex AI User"**
   - Click **"CONTINUE"**

4. **Step 3: Grant users access** (optional)
   - Leave blank
   - Click **"DONE"**

✅ **Checkpoint:** Service account should appear in the list

**📝 Write down your Service Account Email:**
```
My Service Account: _________________________________@___________.iam.gserviceaccount.com
```

---

## 📍 Step 6: Download Service Account Key (3 minutes)

### 6.1 Create JSON Key

1. In the Service Accounts list, find **"htravel-imagen-service"**
2. Click the **three dots (⋮)** on the right → **"Manage keys"**
3. Click **"ADD KEY"** → **"Create new key"**
4. Select **"JSON"** format
5. Click **"CREATE"**

### 6.2 Save Key File

1. Your browser will download a JSON file automatically
2. The filename looks like: `htravel-development-123456-a1b2c3d4e5f6.json`

3. **Move the file to your project:**

   **Windows:**
   ```bash
   # Create config directory
   mkdir config

   # Move the downloaded file (replace with your actual filename)
   move "%USERPROFILE%\Downloads\htravel-*.json" config\gcp-service-account-key.json
   ```

   **Mac/Linux:**
   ```bash
   # Create config directory
   mkdir -p config

   # Move the downloaded file
   mv ~/Downloads/htravel-*.json config/gcp-service-account-key.json
   ```

### 6.3 Verify File Location

Run this command to check:
```bash
# Windows
dir config\gcp-service-account-key.json

# Mac/Linux
ls -la config/gcp-service-account-key.json
```

✅ **Checkpoint:** File should exist at `config/gcp-service-account-key.json`

---

## 📍 Step 7: Configure Application (5 minutes)

### 7.1 Update .env File

1. Open `.env` file in your project root
2. Find the GCP section
3. Update with your actual values:

```env
# Google Cloud Platform - Vertex AI Configuration
GCP_PROJECT_ID=htravel-development-123456  # ← Replace with YOUR Project ID
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./config/gcp-service-account-key.json
```

**⚠️ IMPORTANT:** Replace `htravel-development-123456` with **YOUR actual Project ID** from Step 2!

### 7.2 Update .gitignore

Add this line to `.gitignore` to prevent committing your key:

```
# GCP Service Account Keys
config/gcp-service-account-key.json
```

### 7.3 Verify Configuration

Run the test script:
```bash
node test-gcp-setup.js
```

**Expected output:**
```
═══════════════════════════════════════════════════════════
🧪 Testing GCP Configuration for Vertex AI
═══════════════════════════════════════════════════════════

📋 Step 1: Checking Environment Variables...

✅ GCP_PROJECT_ID: htravel-development-123456
✅ GCP_LOCATION: us-central1
✅ Credentials: ./config/gcp-service-account-key.json

📋 Step 2: Testing Authentication...

✅ Authentication successful!
✅ Authenticated Project ID: htravel-development-123456

📋 Step 3: Validating API Endpoint...

✅ API Endpoint constructed

📋 Step 4: Checking Vertex AI API Availability...

✅ Vertex AI API endpoint is reachable
✅ Authentication tokens are valid

═══════════════════════════════════════════════════════════
✅ GCP Setup Complete!
═══════════════════════════════════════════════════════════

🎉 Ready to generate virtual travel photos!
```

✅ **Checkpoint:** Test script passes all checks

---

## 📍 Step 8: Test Virtual Tour Feature (5 minutes)

### 8.1 Start Backend Server

```bash
npm run dev
```

Wait for:
```
Server running on port 3000
Virtual Travel Image Service initialized
```

### 8.2 Test via API (Option 1: Using curl)

**Step 1: Login to get token**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@htravel.com\",\"password\":\"admin123456\"}"
```

Copy the `accessToken` from response.

**Step 2: Generate virtual travel photo**
```bash
curl -X POST http://localhost:3000/api/ai/virtual-travel \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "selfie=@./test-images/selfie.jpg" \
  -F "destination=Vịnh Hạ Long, Việt Nam"
```

### 8.3 Test via Frontend (Option 2)

1. Start frontend:
   ```bash
   cd htravel-frontend
   npm run dev
   ```

2. Open browser: http://localhost:5173
3. Login with admin credentials
4. Navigate to **"AI Travel"** page
5. Upload a selfie photo
6. Select destination: **"Vịnh Hạ Long"**
7. Click **"Tạo Ảnh Du Lịch Ảo"**
8. Wait 30-60 seconds for generation

### 8.4 Expected Results

**Success response:**
```json
{
  "success": true,
  "message": "Virtual travel photo generated successfully",
  "data": {
    "id": "uuid-here",
    "destination": "Vịnh Hạ Long, Việt Nam",
    "generatedImages": [
      "/uploads/virtual-travel/virtual-uuid-timestamp-0.jpg",
      "/uploads/virtual-travel/virtual-uuid-timestamp-1.jpg",
      "/uploads/virtual-travel/virtual-uuid-timestamp-2.jpg",
      "/uploads/virtual-travel/virtual-uuid-timestamp-3.jpg"
    ],
    "primaryImage": "/uploads/virtual-travel/virtual-uuid-timestamp-0.jpg",
    "metadata": {
      "model": "imagen-4-fast-generate-001",
      "destination": "Vịnh Hạ Long, Việt Nam",
      "generatedAt": "2025-12-03T18:45:00.000Z",
      "imageCount": 4,
      "costPerImage": 0.02,
      "totalCost": 0.08
    }
  }
}
```

✅ **Checkpoint:** 4 AI-generated images created successfully

---

## 🎉 Success! What's Next?

### You Now Have:

✅ GCP account with Vertex AI enabled
✅ Service account with proper permissions
✅ Virtual Tour feature fully operational
✅ 180,000 free images/month

### Cost Monitoring:

**Check your usage:**
1. Go to: **☰ Menu** → **"Billing"** → **"Reports"**
2. Filter by: **"Vertex AI API"**
3. View daily/monthly costs

**Your current costs:**
- Free tier: 180,000 images/month
- Cost per generation: $0.08 (4 images × $0.02)
- Estimated monthly cost (100 generations): **$8.00**
- Estimated monthly cost (1000 generations): **$80.00**

### Tips:

1. **Monitor costs regularly** via GCP Console
2. **Set up budget alerts** (recommended: $50/month)
3. **Implement user limits** (5 generations/day for free users)
4. **Cache results** to avoid regenerating same images

---

## ❌ Troubleshooting

### Problem: "GCP_PROJECT_ID not configured"

**Solution:**
```bash
# Verify .env file
cat .env | grep GCP_PROJECT_ID

# Should show: GCP_PROJECT_ID=your-actual-project-id
```

### Problem: "Authentication failed" (403)

**Causes:**
1. Service account key file not found
2. Wrong file path in .env
3. Service account missing "Vertex AI User" role

**Solutions:**
```bash
# Check file exists
ls -la config/gcp-service-account-key.json

# Verify path in .env
cat .env | grep GOOGLE_APPLICATION_CREDENTIALS

# Re-download key from GCP Console if needed
```

### Problem: "API not enabled" (404)

**Solution:**
1. Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
2. Select your project
3. Click "ENABLE"

### Problem: "Rate limit exceeded" (429)

**Solution:**
- You've hit the 25 images/minute limit
- Wait 1 minute before trying again
- Consider implementing request throttling

### Problem: Test script fails

**Solution:**
```bash
# Check Node.js version (need v14+)
node --version

# Reinstall dependencies
npm install

# Check .env file syntax
cat .env

# Verify file permissions (Mac/Linux)
chmod 600 config/gcp-service-account-key.json
```

---

## 📞 Need Help?

1. **Check GCP Status:** https://status.cloud.google.com/
2. **Review logs:** `npm run dev` (check console output)
3. **Test authentication:** `node test-gcp-setup.js`
4. **GCP Support:** https://console.cloud.google.com/support

---

**Setup Complete! 🎉**

You're now ready to generate AI-powered virtual travel photos!
