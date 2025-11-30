/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luxury-black': '#0A0A0A',
        'luxury-dark': '#1A1A1A',
        'luxury-darker': '#2A2A2A',
        'luxury-gold': '#D4AF37',
        'luxury-gold-light': '#F0E6D2',
        'luxury-gold-dark': '#B8860B',
        'luxury-gray': {
          '50': '#F9F9F9',
          '100': '#E0E0E0',
          '200': '#999999',
          '300': '#666666',
          '400': '#333333',
        },
        'luxury-navy': '#003D5B',
        'luxury-burgundy': '#8B3A3A',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'philosopher': ['Philosopher', 'sans-serif'],
      },
      backgroundColor: {
        'dark-luxury': '#0A0A0A',
        'card-luxury': '#1A1A1A',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
