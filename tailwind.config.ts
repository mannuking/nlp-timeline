import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          base: '#E0E5EC',
          light: '#F4F8FC',
          dark: '#A3B1C6',
          text: '#2D3748',
          muted: '#718096',
          // Maroon accent palette — warm, scholarly, distinctive
          maroon: {
            50: '#FBF3F3',
            100: '#F5E2E2',
            200: '#E8BFBF',
            300: '#D49090',
            400: '#B76262',
            500: '#8B2C2C',  // primary maroon
            600: '#7A2222',
            700: '#621919',
            800: '#4A1212',
            900: '#330C0C',
          },
        },
      },
      boxShadow: {
        // Standardized single-direction lighting: top-left BRIGHT highlight, bottom-right DARK shadow.
        // This is the canonical neumorphic look. All shadows now use the same angle and proportion.
        'neu-out': '8px 8px 16px rgba(163, 177, 198, 0.55), -8px -8px 16px rgba(255, 255, 255, 0.85)',
        'neu-out-sm': '4px 4px 8px rgba(163, 177, 198, 0.50), -4px -4px 8px rgba(255, 255, 255, 0.75)',
        'neu-out-xs': '2px 2px 4px rgba(163, 177, 198, 0.45), -2px -2px 4px rgba(255, 255, 255, 0.70)',
        'neu-in': 'inset 6px 6px 12px rgba(163, 177, 198, 0.55), inset -6px -6px 12px rgba(255, 255, 255, 0.85)',
        'neu-in-sm': 'inset 3px 3px 6px rgba(163, 177, 198, 0.50), inset -3px -3px 6px rgba(255, 255, 255, 0.75)',
        'neu-pressed': 'inset 4px 4px 8px rgba(163, 177, 198, 0.55), inset -4px -4px 8px rgba(255, 255, 255, 0.80)',
        // Maroon-tinted variants for accent elements
        'neu-out-maroon': '8px 8px 16px rgba(163, 177, 198, 0.55), -8px -8px 16px rgba(255, 255, 255, 0.85), inset 0 0 0 1px rgba(139, 44, 44, 0.15)',
        'neu-in-maroon': 'inset 4px 4px 8px rgba(163, 177, 198, 0.55), inset -4px -4px 8px rgba(255, 255, 255, 0.80), inset 0 0 0 1px rgba(139, 44, 44, 0.30)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'maroon-glow': 'maroon-glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'maroon-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 44, 44, 0.0)' },
          '50%': { boxShadow: '0 0 0 4px rgba(139, 44, 44, 0.15)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;