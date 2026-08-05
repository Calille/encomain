/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        "marketing-display": ["Fraunces", "Georgia", "serif"],
      },
      fontSize: {
        // Dense app UI scale (xs–2xl)
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        md: ["16px", { lineHeight: "24px" }],
        lg: ["20px", { lineHeight: "28px" }],
        xl: ["24px", { lineHeight: "32px" }],
        "2xl": ["32px", { lineHeight: "40px" }],
        // Classical marketing scale (separate from app densification)
        "marketing-xs": ["12px", { lineHeight: "16px" }],
        "marketing-sm": ["14px", { lineHeight: "20px" }],
        "marketing-base": ["16px", { lineHeight: "24px" }],
        "marketing-lg": ["18px", { lineHeight: "28px" }],
        "marketing-xl": ["20px", { lineHeight: "28px" }],
        "marketing-2xl": ["24px", { lineHeight: "32px" }],
        "marketing-3xl": ["30px", { lineHeight: "36px" }],
        "marketing-4xl": ["36px", { lineHeight: "40px" }],
        "marketing-5xl": ["48px", { lineHeight: "1.1" }],
        "marketing-6xl": ["60px", { lineHeight: "1.1" }],
        "marketing-7xl": ["72px", { lineHeight: "1.05" }],
        "marketing-8xl": ["96px", { lineHeight: "1" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "hsl(var(--accent-50))",
          100: "hsl(var(--accent-100))",
          200: "hsl(var(--accent-200))",
          300: "hsl(var(--accent-300))",
          400: "hsl(var(--accent-400))",
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          700: "hsl(var(--accent-700))",
          800: "hsl(var(--accent-800))",
          900: "hsl(var(--accent-900))",
          950: "hsl(var(--accent-950))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        marketing: {
          // Dark end of the scale
          "navy-950": "hsl(var(--marketing-navy-950))",
          "navy-900": "hsl(var(--marketing-navy-900))",
          "navy-800": "hsl(var(--marketing-navy-800))",
          "navy-700": "hsl(var(--marketing-navy-700))",
          // Brand blue, plus an accessible step for text/buttons on light backgrounds
          blue: "hsl(var(--marketing-blue))",
          "blue-deep": "hsl(var(--marketing-blue-deep))",
          "blue-bright": "hsl(var(--marketing-blue-bright))",
          sky: "hsl(var(--marketing-sky))",
          // Light end of the scale
          ice: "hsl(var(--marketing-ice))",
          mist: "hsl(var(--marketing-mist))",
          // Text and hairlines on light backgrounds
          ink: "hsl(var(--marketing-navy-900))",
          muted: "hsl(var(--marketing-muted))",
          border: "hsl(var(--marketing-border))",
          /*
            Deprecated green names, remapped onto the blue palette so the site
            still renders while pages are migrated. Removed once nothing uses them.
          */
          forest: "hsl(var(--marketing-blue-deep))",
          "forest-dark": "hsl(var(--marketing-navy-800))",
          sage: "hsl(var(--marketing-sky))",
          mint: "hsl(var(--marketing-mist))",
          cream: "hsl(var(--marketing-ice))",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        float: "0 8px 30px hsl(222 25% 8% / 0.12)",
        "float-dark": "0 8px 30px hsl(0 0% 0% / 0.45)",
        "marketing-card": "0 1px 2px hsl(var(--marketing-navy-900) / 0.04)",
        "marketing-lift":
          "0 18px 40px -18px hsl(var(--marketing-blue) / 0.35), 0 0 0 1px hsl(var(--marketing-blue) / 0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Hero entrance sequence: each step trails the previous one
        "fade-in": "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in-delayed":
          "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.14s both",
        "fade-in-delayed-2":
          "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both",
        "fade-in-delayed-3":
          "fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.42s both",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
