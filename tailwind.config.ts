import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette extracted from the My Home Budapest logo
        navy: {
          DEFAULT: '#0a1628',
          900: '#0a1628',
          800: '#0e1d34',
          700: '#142845',
          600: '#1c3556',
        },
        // Rose-gold — the exact tone from the logo lockup (#af8369)
        gold: {
          DEFAULT: '#af8369',
          light: '#c7a38c',
          dark: '#8f6952',
        },
        cream: '#F5F5F5',
      },
      borderRadius: {
        // Softer default corners on buttons, inputs, the search box and cards
        sm: '0.5rem',
      },
      fontFamily: {
        // Cormorant Garamond everywhere — headings and body share one typeface.
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest: '0.25em',
      },
      boxShadow: {
        luxe: '0 20px 60px -20px rgba(10, 22, 40, 0.45)',
        card: '0 10px 40px -15px rgba(10, 22, 40, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
