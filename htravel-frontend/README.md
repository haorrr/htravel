# HTravel Frontend - Luxury Travel Experience with AI

Production-ready React frontend for the HTravel Backend API with stunning dark luxury design.

## Features

- 🎨 **Luxury Dark Theme** - Sophisticated dark design with gold accents and glassmorphism effects
- ✨ **Smooth Animations** - Framer Motion animations for premium user experience
- 🔐 **Authentication** - JWT-based login and registration
- 🤖 **AI Features** - Landmark recognition and virtual travel photo generation
- 🗺️ **Interactive Elements** - Destination cards, features grid, and more
- 📱 **Responsive Design** - Mobile-first approach, works on all devices
- ♿ **Accessible** - WCAG AA compliant with proper contrast and focus states

## Design System

### Colors
- **Background**: `#0A0A0A` (luxury-black)
- **Cards**: `#1A1A1A` (luxury-dark)
- **Accent**: `#D4AF37` (luxury-gold)
- **Text**: `#E0E0E0` (luxury-gray-100)

### Typography
- **Headlines**: Playfair Display (serif)
- **Body/UI**: Philosopher (sans-serif)

### Effects
- **Glassmorphism**: Frosted glass cards with backdrop blur
- **Animations**: Smooth transitions and hover effects
- **Gold Glow**: Accent shadows on interactive elements

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm or yarn
- HTravel Backend API running on `http://localhost:3000`

### Installation

1. **Navigate to frontend directory**:
```bash
cd htravel-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
# Copy the example env file
cp .env.example .env

# The default API URL is http://localhost:3000/api
# Modify if your backend is running on a different port
```

4. **Start development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
htravel-frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   ├── GlassCard.jsx
│   │   │   ├── LuxuryButton.jsx
│   │   │   └── LuxuryInput.jsx
│   │   ├── layout/           # Layout components
│   │   │   └── Navbar.jsx
│   │   └── features/         # Feature-specific components
│   │       ├── HeroSection.jsx
│   │       ├── FeaturesGrid.jsx
│   │       └── DestinationCard.jsx
│   ├── pages/                # Page components
│   │   ├── Homepage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── AIFeatures.jsx
│   ├── services/             # API services
│   │   ├── api.js           # Axios instance with interceptors
│   │   ├── auth.js          # Authentication services
│   │   └── ai.js            # AI features services
│   ├── App.jsx              # Main app with routing
│   ├── index.css            # Global styles
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── package.json
```

## Available Routes

- `/` - Homepage with hero, features grid, and destinations
- `/login` - User login page
- `/register` - User registration page
- `/ai-features` - AI landmark recognition and virtual travel

## Components

### Reusable Components

#### GlassCard
Glassmorphism card component with frosted glass effect.

```jsx
<GlassCard className="p-8" hover={true}>
  <h3>Content</h3>
</GlassCard>
```

#### LuxuryButton
Styled button with variants and animations.

```jsx
<LuxuryButton
  variant="primary"
  size="lg"
  onClick={handleClick}
>
  Click Me
</LuxuryButton>
```

#### LuxuryInput
Form input with gold underline animation.

```jsx
<LuxuryInput
  label="Email"
  type="email"
  placeholder="email@example.com"
  required
  error={errors.email?.message}
/>
```

---

**Status**: Core Features Complete ✅
**Last Updated**: November 28, 2025
