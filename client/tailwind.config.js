/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nova: {
          ink: '#070707',
          panel: '#242424',
          panelSoft: '#2d2d2d',
          line: '#555555',
          cream: '#e8ddd4',
          muted: '#b8b3b0',
          indigo: '#4F46E5',
          cyan: '#06B6D4',
          green: '#22C55E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        panel: '0 28px 70px rgba(0, 0, 0, 0.45)'
      }
    }
  },
  plugins: []
};
