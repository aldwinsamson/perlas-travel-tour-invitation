/** @type {import('tailwindcss').Config} */
// colours live in css variables (src/styles/index.css) so light/dark swap in one place
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        navy: 'rgb(var(--c-navy) / <alpha-value>)',
        royal: 'rgb(var(--c-royal) / <alpha-value>)',
        sky: 'rgb(var(--c-sky) / <alpha-value>)',
        gold: 'rgb(var(--c-gold) / <alpha-value>)',
        ember: 'rgb(var(--c-ember) / <alpha-value>)',
        ivory: 'rgb(var(--c-ivory) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        mute: 'rgb(var(--c-mute) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', '"Cormorant Garamond"', 'cursive'],
        ui: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { wider2: '0.22em', wider3: '0.32em' },
      screens: { xs: '420px' },
    },
  },
  plugins: [],
};
