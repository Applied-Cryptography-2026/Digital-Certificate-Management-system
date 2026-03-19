/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: { accent: '#BFFF00' },
        surface: '#111111',
        border: '#1A1A1A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#999999',
        'text-tertiary': '#6e6e6e',
        'text-muted': '#404040',
        error: '#FF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
