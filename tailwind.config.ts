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
        'azure-bg': '#E6F0FA',
        'azure-surface': '#EDF4FB',
        'azure-shadow-dark': '#C5D6E8',
        'azure-shadow-light': '#FFFFFF',
        'text-primary': '#1F2A44',
        'text-secondary': '#5F6F86',
        'accent-primary': '#3B82F6',
        'accent-secondary': '#22D3EE',
        'warning-bg': '#FEE2E2',
        'warning-accent': '#EF4444',
        'warning-text': '#991B1B',
        'warning-shadow': '#F5BABA',
        'caution-bg': '#FEF9C3',
        'caution-accent': '#F59E0B',
        'caution-text': '#92400E',
        'caution-shadow': '#F2D88A',
      },
      boxShadow: {
        'neumorphic': '12px 12px 24px var(--tw-shadow-color), -12px -12px 24px var(--tw-shadow-color)',
        'neumorphic-inset': 'inset 6px 6px 12px var(--tw-shadow-color), inset -6px -6px 12px var(--tw-shadow-color)',
      }
    },
  },
  plugins: [],
}
export default config