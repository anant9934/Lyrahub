import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: '#F2F2F1', alt: '#EAEAE8' },
        surface: { DEFAULT: '#FFFFFF' },
        ink: { DEFAULT: '#1E1E1E', 700: '#3A3A3A', 500: '#5C5C5C',
               400: '#7A7A7A', 300: '#9A9A9A' },
        border: { DEFAULT: '#D6D6D6', soft: '#E5E5E4' },
        sage: { DEFAULT: '#94BD88', dark: '#7AA36E', bg: '#EAF2E7' },
        amber: { DEFAULT: '#EE8E1E', dark: '#D67A0E', bg: '#FDF2E3' },
        success: { DEFAULT: '#7A9A7E', bg: '#EEF3EE' },
        warning: { DEFAULT: '#D9A441', bg: '#FAF3E2' },
        danger: { DEFAULT: '#B85C5C', bg: '#F5EAEA' },
        info: { DEFAULT: '#6B8FA3', bg: '#EAF0F3' },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        btn: '8px', card: '12px', pill: '9999px', modal: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,30,30,0.04)',
        dropdown: '0 4px 12px rgba(30,30,30,0.08)',
        modal: '0 12px 32px rgba(30,30,30,0.12)',
        hero: '0 24px 64px rgba(30,30,30,0.12)',
      },
    },
  },
  plugins: [],
}
export default config
