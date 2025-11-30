# Luxury Travel Website Design - Quick Reference
## HTravel Design System Summary

---

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Luxury Black | `#0A0A0A` | Page background |
| Luxury Dark | `#1A1A1A` | Cards/panels |
| Luxury Gold | `#D4AF37` | Primary CTA buttons, accents |
| Light Gray | `#E0E0E0` | Body text |
| Medium Gray | `#999999` | Secondary text |

### Tailwind Config
```js
'luxury-black': '#0A0A0A',
'luxury-dark': '#1A1A1A',
'luxury-gold': '#D4AF37',
'luxury-gold-light': '#F0E6D2',
'luxury-gray': { '100': '#E0E0E0', '200': '#999999' }
```

---

## Typography (Google Fonts)

### Font Pairing
```
Headlines:    Playfair Display (700, 600)
Body/UI:      Philosopher (400, 700)
```

### Size Scale
```
H1:   48px (desktop), 32px (mobile), Playfair Display 700
H2:   36px (desktop), 24px (mobile), Playfair Display 600
H3:   24px (desktop), 18px (mobile), Playfair Display 600
Body: 16px (desktop), 14px (mobile), Philosopher 400
CTA:  14px, Philosopher 700, uppercase, letter-spacing 0.5px
```

---

## Design Styles

### Primary Style: Dark Luxury Minimalism
- Deep black background (#0A0A0A)
- White space for breathing room
- Editorial/cinematic imagery
- Gold accents sparingly used
- Minimal UI elements

### Glassmorphism (2025 Trend)
- Semi-transparent frosted glass cards
- Blur effect: `backdrop-filter: blur(10px)`
- Background: `rgba(255, 255, 255, 0.1)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Use on overlays, hero cards, pricing cards

### Shadow/Glow
```css
/* Glassmorphism shadow */
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);

/* Gold glow on hover */
box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);

/* Elevated card */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
```

---

## Component Patterns

### Button Styles
```tsx
// Primary (CTA)
bg-luxury-gold text-luxury-black px-8 py-3
hover:bg-luxury-gold-light scale-105 on hover

// Secondary
border border-luxury-gray-400 text-luxury-gray-100
hover:border-luxury-gold

// Link
text-luxury-gold-light hover:underline uppercase tracking-wider
```

### Card Component
```tsx
// Pattern: Image + Overlay + Glassmorphism Content
<div className="relative overflow-hidden rounded-lg h-80 group">
  <img className="group-hover:scale-110 duration-700" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80" />
  <div className="backdrop-blur-md bg-white/10 border border-white/20">
    {/* Content */}
  </div>
</div>
```

### Hero Section
```tsx
// Pattern: Video/Image + Dark Overlay + Glassmorphism Content
<video autoPlay muted loop />
<div className="absolute inset-0 bg-black/50" />
<div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl">
  {/* Hero text & CTA */}
</div>
```

---

## Animations (Framer Motion)

### Button Hover
```tsx
whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212,175,55,0.5)" }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.3 }}
```

### Card Lift
```tsx
whileHover={{ y: -8 }}
transition={{ duration: 0.4, ease: "easeOut" }}
```

### Fade-in on Scroll
```tsx
initial={{ opacity: 0, y: 40 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
viewport={{ once: true, amount: 0.3 }}
```

### Page Transition
```tsx
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.4 }}
```

### Image Zoom on Hover
```tsx
whileHover={{ scale: 1.1 }}
transition={{ duration: 0.7 }}
```

---

## Layout Patterns

### Homepage Structure
```
[Navigation - Fixed/Sticky, minimal]
[Hero Section - Full-width video + overlay]
[Featured Destinations - 3-4 column grid]
[Storytelling Section - Video + parallax text]
[Experience Cards - 3-column grid]
[Testimonials - Carousel]
[Newsletter CTA - Dark container]
[Footer - Dark with gold dividers]
```

### Spacing Guide
```
Container max-width: 1280px (7xl)
Padding: px-6 on mobile, px-12 on desktop
Gap between sections: 64px-96px (gap-16 to gap-24)
Inner padding: 24px-48px (p-6 to p-12)
```

---

## Visual Effects

### Gradient Overlays
```css
/* Dark overlay on images */
background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));

/* Gold accent */
background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.3));

/* Vignette */
background: radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
```

### Video Background
```tsx
<video autoPlay muted loop playsInline>
  <source src="/video.mp4" type="video/mp4" />
  <source src="/video.webm" type="video/webm" />
</video>
<div className="absolute inset-0 bg-black/50" /> {/* Overlay */}
```

### Parallax Scroll
```tsx
const y = useTransform(scrollY, [0, 1000], [0, 200]);
<motion.div style={{ y }}>Background Image</motion.div>
```

---

## Key Components to Build

1. **LuxuryButton** - Primary, secondary, outline variants
2. **LuxuryDestinationCard** - Image + overlay + glassmorphism
3. **LuxuryNav** - Fixed nav with scroll behavior
4. **GlassCard** - Reusable glassmorphism container
5. **LuxuryInput** - Form input with gold underline animation
6. **HeroSection** - Video background + overlay + CTA
7. **FeaturedDestinations** - Grid of destination cards
8. **TestimonialCarousel** - User reviews with smooth transitions

---

## Accessibility Notes

- Contrast ratio: 4.5:1 (WCAG AA) for normal text
- Focus states: `focus:ring-2 focus:ring-luxury-gold`
- Reduce motion: Check `prefers-reduced-motion`
- Alt text: All images must have descriptive alt text
- Semantic HTML: Use `<button>`, `<nav>`, `<section>` tags

---

## Performance Checklist

- [ ] Images optimized with `next/image`
- [ ] Dynamic imports for heavy components
- [ ] Lazy load off-screen images
- [ ] Minimize CSS-in-JS runtime
- [ ] Limit Framer Motion animations to key interactions
- [ ] Test Lighthouse score (target: >80)
- [ ] Enable compression for videos
- [ ] Preload critical fonts

---

## Common CSS Classes (Tailwind)

```
Backgrounds:
  bg-luxury-black, bg-luxury-dark, bg-luxury-gold

Text:
  text-white, text-luxury-gray-100, text-luxury-gold

Borders:
  border-white/20, border-luxury-gray-400

Spacing:
  p-6, p-12, gap-6, gap-8, mb-6

Rounded:
  rounded-lg, rounded-xl, rounded-2xl

Hover Effects:
  hover:scale-105, hover:bg-luxury-dark, hover:text-luxury-gold
```

---

## Installation Commands

```bash
# Install Framer Motion
npm install framer-motion

# Install Google Fonts (Next.js)
# Already included in next/font/google

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## References & Inspiration

- **Awwwards**: https://www.awwwards.com/inspiration/luxury-travel-agency-private-travel-designer-bespoke-tours
- **Dribbble**: https://dribbble.com/search/luxury-travel
- **Framer Motion**: https://www.framer.com/motion/
- **Aceternity UI**: https://www.aceternity.com/components
- **Hover.dev**: https://www.hover.dev/components

---

**Last Updated**: November 28, 2025
**For**: HTravel Luxury Travel Super-App

