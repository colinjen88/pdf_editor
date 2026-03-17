import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        vibe: {
          bg: '#0F1117',
          surface: '#1E212B',
          accent: '#6366F1',
          text: '#E2E8F0',
          border: '#2D3748'
        }
      }
    }
  },
  plugins: []
} satisfies Config
