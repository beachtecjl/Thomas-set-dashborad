export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        border: '#1f2937',
        accent: '#22d3ee',
      },
      boxShadow: {
        card: '0 10px 25px -10px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
