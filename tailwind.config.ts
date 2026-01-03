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
        // Updated Azure Palette: Lebih segar, bersih, dan kontras
        'azure-bg': '#E0F2FE', // Sky-100: Base background yang lebih terang/dingin
        'azure-surface': '#EAF6FF', // Surface yang sedikit lebih terang dari bg
        
        // Shadow Colors (Disetel manual untuk konsistensi di Utility)
        'azure-shadow-dark': '#BDCFE0', // Shadow yang lebih soft (blue-grey tone)
        'azure-shadow-light': '#FFFFFF', // Highlight murni
        
        // Typography
        'text-primary': '#1E293B', // Slate-800: Lebih tajam dan modern daripada dark blue biasa
        'text-secondary': '#64748B', // Slate-500: Untuk subtitle/label
        'text-muted': '#94A3B8',     // Slate-400: Untuk placeholder/disabled
        
        // Accents - Fresh & Lively
        'accent-primary': '#0EA5E9', // Sky-500: Azure utama yang vivid
        'accent-hover': '#0284C7',   // Sky-600: State hover
        'accent-secondary': '#6366F1', // Indigo-500: Variasi untuk elemen sekunder
        'accent-success': '#10B981', // Emerald-500: Hijau yang lebih fresh
        
        // Functional Colors (Status)
        'warning-bg': '#FEF2F2',
        'warning-accent': '#EF4444',
        'warning-text': '#991B1B',
        'caution-bg': '#FFFBEB',
        'caution-accent': '#F59E0B',
        'caution-text': '#92400E',
        'success-bg': '#ECFDF5',
        'success-text': '#065F46',
      },
      boxShadow: {
        // Modern Neumorphic Shadows (Soft & Deep)
        'neumorphic': '10px 10px 20px #BDCFE0, -10px -10px 20px #FFFFFF',
        'neumorphic-sm': '6px 6px 12px #BDCFE0, -6px -6px 12px #FFFFFF',
        'neumorphic-lg': '16px 16px 32px #BDCFE0, -16px -16px 32px #FFFFFF',
        
        // Interaction Shadows
        'neumorphic-hover': '14px 14px 28px #BDCFE0, -14px -14px 28px #FFFFFF',
        'neumorphic-pressed': 'inset 6px 6px 12px #BDCFE0, inset -6px -6px 12px #FFFFFF',
        'neumorphic-inset': 'inset 4px 4px 8px #BDCFE0, inset -4px -4px 8px #FFFFFF',
        
        // Floating / Overlay
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'nm': '1.5rem', // Standard radius untuk komponen neumorphic
        'nm-sm': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', // Bouncy effect
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config