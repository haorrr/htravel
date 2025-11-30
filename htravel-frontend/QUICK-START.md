# HTravel Frontend - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Navigate to Frontend
```bash
cd htravel-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

**That's it!** Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎨 What You'll See

### Homepage (/)
- Full-screen hero with glassmorphism overlay
- "Khám Phá Việt Nam Cùng Công Nghệ AI" headline
- 4 feature cards (AI Landmark, Virtual Travel, Map, Blog)
- Featured destinations grid
- CTA section

### Login (/login)
- Glassmorphism login form
- Email + password fields
- "Chào Mừng Trở Lại" headline

### Register (/register)
- Glassmorphism registration form
- Name, email, password, confirm password
- Terms checkbox

### AI Features (/ai-features)
- Landmark recognition section
- Virtual travel photo generation
- Image upload interfaces

---

## 🔧 Configuration

The frontend is pre-configured to connect to:
```
Backend API: http://localhost:3000/api
```

To change this, edit `.env`:
```env
VITE_API_URL=http://your-backend-url/api
```

---

## 📱 Test on Mobile

### Using Local Network
```bash
npm run dev -- --host
```

Then access via:
```
http://YOUR_LOCAL_IP:5173
```

---

## 🏗️ Build for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

Output: `dist/` folder

---

## 🎯 Quick Navigation

**Pages:**
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/ai-features` - AI features

**Components:**
- `src/components/common/` - Reusable components
- `src/components/layout/` - Layout components
- `src/components/features/` - Feature components
- `src/pages/` - Page components
- `src/services/` - API services

---

## 🐛 Troubleshooting

### Issue: Dependencies not installed
```bash
npm install
```

### Issue: Port 5173 already in use
```bash
npm run dev -- --port 3001
```

### Issue: Backend API not reachable
1. Ensure backend is running on `http://localhost:3000`
2. Check `.env` file has correct `VITE_API_URL`

### Issue: Styles not loading
```bash
# Rebuild Tailwind
npm run dev
```

---

## ✨ Key Features to Test

1. **Navigation**: Click hamburger menu on mobile
2. **Hero Section**: Scroll down to see scroll indicator
3. **Feature Cards**: Hover to see animations
4. **Destination Cards**: Hover to see image zoom
5. **Login Form**: Try validation (empty email, short password)
6. **Register Form**: Test password confirmation
7. **AI Features**: Upload an image (requires backend)

---

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Design Guidelines**: See `../docs/design-guidelines.md`
- **Implementation Summary**: See `../FRONTEND-IMPLEMENTATION-SUMMARY.md`
- **Design Research**: See `../docs/design-research-luxury-travel-2024-2025.md`

---

## 🎨 Design System Quick Reference

**Colors:**
- Background: `#0A0A0A`
- Cards: `#1A1A1A`
- Gold: `#D4AF37`
- Text: `#E0E0E0`

**Fonts:**
- Headlines: Playfair Display
- Body: Philosopher

**Effects:**
- Glassmorphism on cards
- Gold glow on hover
- Smooth animations

---

**Happy coding! 🚀**
