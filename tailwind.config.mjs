/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      heading: ['Space Grotesk', 'sans-serif'],
      body: ['JetBrains Mono', 'monospace'],
      sans: ['JetBrains Mono', 'monospace'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    extend: {
      boxShadow: {
        'neo': '4px 4px 0px 0px var(--shadow-color)',
        'neo-sm': '2px 2px 0px 0px var(--shadow-color)',
        'neo-lg': '6px 6px 0px 0px var(--shadow-color)',
      },
    },
  },
  plugins: [],
};
