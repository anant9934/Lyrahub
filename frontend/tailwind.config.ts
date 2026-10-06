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
          soft: "var(--border-soft)",
        },
        accent:  { DEFAULT: "var(--accent)",  foreground: "var(--bg)" },
        primary: { DEFAULT: "var(--accent)",  foreground: "var(--bg)" },

        success: { DEFAULT: "var(--success)", foreground: "#FFFFFF", subtle: "var(--success-bg)" },
        warning: { DEFAULT: "var(--warning)", foreground: "#FFFFFF", subtle: "var(--warning-bg)" },
        danger:  { DEFAULT: "var(--danger)",  foreground: "#FFFFFF", subtle: "var(--danger-bg)"  },
        info:    { DEFAULT: "var(--info)",    foreground: "#FFFFFF", subtle: "var(--info-bg)"    },

        canvas:  { DEFAULT: "var(--canvas)",  alt: "var(--canvas-alt)" },
        surface: { DEFAULT: "var(--surface)", raised: "var(--surface-raised)" },

        ink: {
          DEFAULT: "var(--ink)",
          700: "var(--ink-700)",
          500: "var(--ink-500)",
          400: "var(--ink-400)",
          300: "var(--ink-300)",
        },
        sage:  { DEFAULT: "var(--sage)",  dark: "var(--sage-dark)",  bg: "var(--sage-bg)"  },
        amber: { DEFAULT: "var(--amber)", dark: "var(--amber-dark)", bg: "var(--amber-bg)" },

        brand: {
          navy:   "var(--brand-navy)",
          blue:   "var(--brand-blue)",
          sky:    "var(--brand-sky)",
          yellow: "var(--brand-yellow)",
          amber:  "var(--brand-amber)",
          purple: "var(--brand-purple)",
          teal:   "var(--brand-teal)",
          coral:  "var(--brand-coral)",
        },
      },

      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      borderRadius: {
        sm:    "4px",
        md:    "8px",
        lg:    "12px",
        xl:    "16px",
        "2xl": "24px",
        "3xl": "32px",
        full:  "9999px",
        btn:   "10px",
        card:  "16px",
        pill:  "9999px",
      },

      boxShadow: {
        none:        "none",
        xs:          "0 1px 2px rgba(9,25,54,0.04)",
        card:        "0 1px 3px rgba(9,25,54,0.06), 0 4px 12px rgba(9,25,54,0.04)",
        subtle:      "0 1px 3px rgba(9,25,54,0.06)",
        dropdown:    "0 4px 16px rgba(9,25,54,0.10)",
        modal:       "0 8px 32px rgba(9,25,54,0.14), 0 2px 8px rgba(9,25,54,0.08)",
        hero:        "0 20px 60px rgba(9,25,54,0.12)",
        nav:         "0 1px 0 rgba(9,25,54,0.08)",
        glow:        "0 0 24px rgba(20,120,239,0.25)",
        "glow-amber":"0 0 24px rgba(255,207,54,0.35)",
      },

      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%"   },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)"  },
          "50%":      { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)"    },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)"    },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(20,120,239,0)"    },
          "50%":      { boxShadow: "0 0 0 8px rgba(20,120,239,0.12)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)"    },
        },
      },

      animation: {
        shimmer:       "shimmer 1.5s ease-in-out infinite",
        float:         "float 4s ease-in-out infinite",
        "fade-up":     "fadeUp 0.3s ease-out",
        "slide-right": "slideInRight 0.25s ease-out",
        "pulse-glow":  "pulseGlow 2.5s ease-in-out infinite",
        "scale-in":    "scaleIn 0.2s ease-out",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-mesh":       "radial-gradient(ellipse at 95% 0%, rgba(20,120,239,0.08) 0%, transparent 400px), radial-gradient(ellipse at 5% 100%, rgba(255,207,54,0.06) 0%, transparent 300px)",
      },
    },
  },
  plugins: [],
}

export default config
