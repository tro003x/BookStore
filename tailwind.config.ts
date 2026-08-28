import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1A1D1E',
        parchment: '#EFE9DC',
        moss: '#4B5D45',
        clay: '#A85C32',
        rule: '#C9BFA8',
      },
    },
  },
  plugins: [],
};
export default config;