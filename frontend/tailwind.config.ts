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
        bg: {
          DEFAULT: "var(--bg)",
          subtle: "var(--bg-subtle)",
          muted: "var(--bg-muted)",
        },
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          soft: "var(--border)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--bg)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--bg)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "#FFFFFF",
          subtle: "#F0FDF4",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "#FFFFFF",
          subtle: "#FEFCE8",
        },
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
          subtle: "#FEF2F2",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "#FFFFFF",
          subtle: "#EFF6FF",
        },

        // Legacy compatibility mappings
        canvas: { DEFAULT: "var(--bg)", alt: "var(--bg-subtle)" },
        surface: { DEFAULT: "var(--bg)" },
        ink: {
          DEFAULT: "var(--text)",
          700: "var(--text-secondary)",
          500: "var(--text-secondary)",
          400: "var(--text-tertiary)",
          300: "var(--text-muted)",
        },
        sage: {
          DEFAULT: "var(--accent)",
          dark: "#222222",
          bg: "var(--bg-subtle)",
        },
        amber: {
          DEFAULT: "var(--accent)",
          dark: "#222222",
          bg: "var(--bg-subtle)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        full: "9999px",
        btn: "8px",
        card: "8px",
        pill: "9999px",
      },
      boxShadow: {
        none: "none",
        card: "none",
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        dropdown: "0 4px 16px 0 rgba(0, 0, 0, 0.08)",
        modal: "0 12px 32px 0 rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
}
export default config
