/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F5FC',
        ink: '#12172B',
        slate: '#5B6472',
        border: '#E7E6F3',
        blue: '#4F6EF7',
        violet: '#8B5CF6',
        magenta: '#E0399A',
        forest: '#1F9D55',
        amber: '#C89A2E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Source Sans 3"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        brand: 'linear-gradient(90deg, #4F6EF7 0%, #8B5CF6 55%, #E0399A 100%)',
        'brand-soft': 'linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(224,57,154,0.08) 100%)',
      },
    },
  },
  plugins: [],
}
