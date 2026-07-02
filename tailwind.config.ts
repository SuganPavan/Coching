import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        navy: {
          50: "#eef2f7",
          100: "#d3deea",
          200: "#a7bdd5",
          300: "#7a9bc0",
          400: "#4e7aab",
          500: "#2c5a8c",
          600: "#1e3a5f",
          700: "#172e4b",
          800: "#102137",
          900: "#0a1524",
        },
        saffron: {
          50: "#fff8eb",
          100: "#ffecc6",
          200: "#ffd98d",
          300: "#ffc154",
          400: "#fda82b",
          500: "#f5870f",
          600: "#d3650a",
          700: "#a8480c",
          800: "#883a10",
          900: "#702f12",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scroll-hint": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.5" },
          "50%": { transform: "translateY(6px)", opacity: "1" },
        },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.96)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "scroll-hint": "scroll-hint 2s ease-in-out infinite",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(16,33,55,0.08), 0 1px 2px rgba(16,33,55,0.04)",
        premium: "0 20px 40px -16px rgba(16,33,55,0.22), 0 4px 12px -4px rgba(16,33,55,0.1)",
        "glow-accent": "0 12px 32px -12px rgba(245,135,15,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
