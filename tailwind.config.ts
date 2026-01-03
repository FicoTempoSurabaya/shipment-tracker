import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- NEUMORPHISM BASE PALETTE ---
        'azure-bg': '#E6EEF6', 
        'azure-surface': '#E6EEF6', 
        
        // Shadow Colors
        'neu-shadow-dark': '#BDC7D9',
        'neu-shadow-light': '#FFFFFF',
        
        // Typography
        'text-primary': '#2D3748',
        'text-secondary': '#718096',
        'text-muted': '#A0AEC0',     
        
        // Accents
        'accent-primary': '#3182CE',
        'accent-hover': '#2C5282',
        'accent-gradient-start': '#4FACFE',
        'accent-gradient-end': '#00F2FE',
        
        // Status Colors
        'error-bg': '#FED7D7',
        'error-text': '#C53030',
      },
      boxShadow: {
        'neu-flat': '8px 8px 16px #BDC7D9, -8px -8px 16px #FFFFFF',
        'neu-sm': '5px 5px 10px #BDC7D9, -5px -5px 10px #FFFFFF',
        'neu-pressed': 'inset 6px 6px 12px #B1BCCF, inset -6px -6px 12px #FFFFFF',
        'neu-pressed-sm': 'inset 3px 3px 6px #B1BCCF, inset -3px -3px 6px #FFFFFF',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config