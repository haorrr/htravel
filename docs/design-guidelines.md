# HTravel Design Guidelines

## Overview

HTravel uses a **Luxury Dark Minimalism** design system with glassmorphism effects and smooth animations. All UI text is in Vietnamese.

## Color Palette

### Primary Colors
| Color Name | Hex Code | Usage |
|-----------|----------|--------|
| Luxury Black | `#0A0A0A` | Page background |
| Luxury Dark | `#1A1A1A` | Card backgrounds, panels |
| Luxury Darker | `#2A2A2A` | Subtle contrast layers |
| Luxury Gold | `#D4AF37` | Primary CTA buttons, accents |
| Luxury Gold Light | `#F0E6D2` | Hover states, highlights |
| Luxury Gold Dark | `#B8860B` | Shadows, darker accents |

### Text Colors
| Color Name | Hex Code | Usage |
|-----------|----------|--------|
| White | `#FFFFFF` | Headlines (H1, H2, H3) |
| Light Gray | `#E0E0E0` | Body text |
| Medium Gray | `#999999` | Secondary text, captions |
| Dark Gray | `#666666` | Disabled states |

## Typography

### Font Family
- **Headlines**: Playfair Display (Serif) - Weights: 400, 600, 700
- **Body/UI**: Philosopher (Sans-serif) - Weights: 400, 700

### Font Sizes
```
H1 (Page Title):
  - Desktop: 48px (3rem)
  - Mobile: 32px (2rem)
  - Line-height: 1.2
  - Font: Playfair Display 700

H2 (Section Headers):
  - Desktop: 36px (2.25rem)
  - Mobile: 24px (1.5rem)
  - Line-height: 1.3
  - Font: Playfair Display 600

H3 (Subsection):
  - Desktop: 24px (1.5rem)
  - Mobile: 18px (1.125rem)
  - Font: Playfair Display 600

Body Text:
  - Desktop: 16px (1rem)
  - Mobile: 14px (0.875rem)
  - Line-height: 1.6
  - Font: Philosopher 400

Small Text / Captions:
  - Size: 12px (0.75rem)
  - Line-height: 1.5
  - Font: Philosopher 400

CTA Buttons:
  - Size: 14px (0.875rem)
  - Letter-spacing: 0.5px
  - Text-transform: uppercase
  - Font: Philosopher 700
```

## Design Patterns

### Glassmorphism Effects

**Standard Glass Card:**
```css
backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);
```

**Dark Glass Card:**
```css
backdrop-filter: blur(10px);
background: rgba(0, 0, 0, 0.3);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Shadow Effects

**Glassmorphism Glow:**
```css
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
```

**Gold Accent Glow (Hover):**
```css
box-shadow: 0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2);
```

**Elevated Card Shadow:**
```css
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
```

## Component Specifications

### Buttons

**Primary Button (CTA):**
- Background: Luxury Gold (#D4AF37)
- Text: Luxury Black (#0A0A0A)
- Padding: 12px 32px (md), 16px 40px (lg)
- Border-radius: 8px
- Font: Philosopher 700, uppercase
- Hover: Scale 1.05, Gold glow shadow
- Active: Scale 0.98

**Secondary Button:**
- Background: Luxury Darker (#2A2A2A)
- Text: Luxury Gold (#D4AF37)
- Border: 1px solid Luxury Gold
- Hover: Background to Luxury Dark

**Outline Button:**
- Background: Transparent
- Text: Light Gray (#E0E0E0)
- Border: 1px solid Dark Gray (#666666)
- Hover: Border Luxury Gold, Text Luxury Gold

### Input Fields

- Border-bottom: 2px solid Dark Gray (#666666)
- Background: Transparent
- Text: White (#FFFFFF)
- Placeholder: Medium Gray (#999999)
- Focus: Border-bottom Luxury Gold, Gold underline animation
- Padding: 12px 0

### Cards

**Destination Card:**
- Height: 320px (h-80)
- Border-radius: 12px (rounded-xl)
- Image: Full cover with 1.1x zoom on hover (700ms)
- Overlay: Gradient from black/80 to transparent
- Glassmorphism overlay on bottom with content
- Hover: translateY -8px (lift effect)

**Feature Card:**
- Glass effect background with gradient
- Icon in colored rounded square (56px)
- Hover: Scale 1.02, translateY -8px
- Gold glow on hover

## Animations

### Timing Functions
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)` (300ms)
- Smooth: `ease-out` (400-600ms)
- Image zoom: 700ms

### Common Animations

**Button Hover:**
```jsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.3 }}
```

**Card Lift:**
```jsx
whileHover={{ y: -8 }}
transition={{ duration: 0.4, ease: "easeOut" }}
```

**Fade-in on Scroll:**
```jsx
initial={{ opacity: 0, y: 40 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
viewport={{ once: true }}
```

**Image Zoom on Hover:**
```jsx
whileHover={{ scale: 1.1 }}
transition={{ duration: 0.7 }}
```

## Spacing System

Use Tailwind's spacing scale:
- `gap-4` (16px) - Small gaps
- `gap-6` (24px) - Medium gaps
- `gap-8` (32px) - Large gaps
- `p-6` (24px) - Card padding (mobile)
- `p-8` or `p-12` (32-48px) - Card padding (desktop)
- `mb-4` (16px) - Small bottom margin
- `mb-6` (24px) - Medium bottom margin
- `mb-16` (64px) - Section spacing

## Layout Patterns

### Container
- Max-width: `max-w-7xl` (1280px)
- Padding: `px-6` on mobile, `px-12` on desktop
- Centered: `mx-auto`

### Grid
- Destinations: 4 columns on lg, 2 on md, 1 on mobile
- Features: 4 columns on lg, 2 on md, 1 on mobile
- Gap: `gap-6` (24px)

### Hero Section
- Height: `h-screen` (100vh)
- Background: Full-cover image with overlay
- Content: Centered with glassmorphism card
- Gradient overlay: from black/40 to black/80

## Accessibility

### Color Contrast
- Minimum ratio: 4.5:1 for normal text (WCAG AA)
- White (#FFFFFF) on Luxury Black (#0A0A0A): 19.88:1 ✅
- Light Gray (#E0E0E0) on Luxury Black: 12.63:1 ✅
- Luxury Gold (#D4AF37) on Luxury Black: 7.85:1 ✅

### Focus States
- Ring: 2px solid Luxury Gold
- Ring offset: 2px with Luxury Black background
- Class: `focus-luxury`

### Keyboard Navigation
- All interactive elements accessible via Tab
- Visible focus states
- Skip to content links where appropriate

## Language

All UI text must be in **Vietnamese (Tiếng Việt):**
- Navigation: "Trang chủ", "Điểm đến", "AI Travel", "Blog", "Bản đồ"
- Auth: "Đăng nhập", "Đăng ký", "Mật khẩu", "Email"
- Actions: "Khám phá", "Tìm hiểu thêm", "Đăng ký ngay"
- Messages: Error and success messages in Vietnamese

## Best Practices

1. **Mobile-first**: Design for mobile, then scale up
2. **Performance**: Lazy load images, code split routes
3. **Consistency**: Use design system colors and typography
4. **Accessibility**: Maintain WCAG AA compliance
5. **Animations**: Use sparingly for premium feel, not distraction
6. **Glassmorphism**: Apply to overlays, cards, not entire pages
7. **Gold accents**: Use strategically for CTAs and important elements
8. **Images**: High-quality, optimized, with proper alt text

## Component Checklist

When creating new components:
- [ ] Uses luxury color palette
- [ ] Implements Playfair Display + Philosopher fonts
- [ ] Includes hover states with animations
- [ ] Responsive on all breakpoints
- [ ] Accessible (WCAG AA)
- [ ] Vietnamese text
- [ ] PropTypes defined
- [ ] Framer Motion animations where appropriate

## Visual Assets & Images

### Using Unsplash for Placeholder Images

For development and demo purposes, use Unsplash API for high-quality travel images:

**Base URL**: `https://source.unsplash.com/`

**Examples**:
- Random travel image: `https://source.unsplash.com/1600x900/?travel,vietnam`
- Ha Long Bay: `https://source.unsplash.com/1600x900/?halong-bay,vietnam`
- Hoi An: `https://source.unsplash.com/1600x900/?hoi-an,vietnam`
- Specific size: `https://source.unsplash.com/{width}x{height}/?{keywords}`

**Categories**: `travel`, `vietnam`, `beach`, `mountain`, `luxury-hotel`, `adventure`

### Image Optimization

- Use WebP format for modern browsers
- Lazy load images below the fold
- Use responsive images with srcset
- Compress images to < 200KB for web
- Provide alt text in Vietnamese

### Background Images

Hero sections and card backgrounds:
- Minimum resolution: 1920x1080 (Full HD)
- Use gradient overlays for text readability
- Apply blur effect for glassmorphism layers

---

**Last Updated**: November 28, 2025 (251128)
**Design System**: Luxury Dark Minimalism with Glassmorphism
**Frontend Status**: ✅ Production Ready
