import type { Config } from 'tailwindcss';

/**
 * Kaizen · 5-Day (Peri)Menopause Reset Challenge.
 *
 * Warm cream is the environment, brand navy is the structure, gold is the one
 * accent, and coral (the dot in the logo) is the spark used more scarcely than
 * the accent. See design-system.project.md for the derivation and the contrast
 * maths behind every value here.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#FFFDF8', alt: '#F6F4F1' },
        ink: { DEFAULT: '#1F325C', soft: '#5A6786', deep: '#16264A' },
        gold: {
          DEFAULT: '#F2DDB6',
          pale: '#F2F1EE',
          wash: '#F9F0DE',
          mid: '#D9B571',
          deep: '#A87C33',
          ink: '#8A6424',
          cta: '#EBC98D',
        },
        coral: { DEFAULT: '#EE7778', bed: '#FDECEA', ink: '#B84447' },
        line: { DEFAULT: '#E7E4DF', strong: '#D6D2CB' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { pill: '999px' },
      boxShadow: {
        /* Layered and tinted toward the brand navy, never a flat grey (C4). */
        soft: '0 4px 20px -10px rgba(31,50,92,0.14)',
        card: '0 18px 44px -26px rgba(31,50,92,0.26)',
        lift: '0 2px 0 0 rgba(217,181,113,0.30), 0 22px 42px -22px rgba(31,50,92,0.34)',
      },
    },
  },
  plugins: [],
};

export default config;
