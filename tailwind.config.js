/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      fontFamily: {
        primary: ['Inter Tight', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        secondary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        cosmic: {
          void: '#0A0E14',
          gray: '#1C2128',
          dust: '#2D3748',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}