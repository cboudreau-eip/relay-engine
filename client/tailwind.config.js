/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#fdf0e9',
        card: {
          bg: '#ffffff',
          border: '#1a1a1a',
        },
        mint: '#c8f5e3',
        peach: '#ffe5d4',
        lavender: '#e8d4ff',
        yellow: '#fff9c4',
        pink: '#ffd6e0',
        status: {
          green: '#2e9e6e',
          'green-bg': '#d4f5e4',
          amber: '#c07a20',
          'amber-bg': '#fff3cd',
          red: '#d63031',
          'red-bg': '#ffe0e0',
          blue: '#1565c0',
          'blue-bg': '#d4e8ff',
          purple: '#7c3aed',
          'purple-bg': '#e8d4ff',
        },
      },
      borderWidth: {
        '2.5': '2.5px',
      },
    },
  },
  plugins: [],
};
