import type { Config } from "tailwindcss";

// Tailwind theme mapped onto the design tokens in src/design-system/tokens.css
// (Requirement 9.1, 9.2). Components reference these token-backed utilities
// (bg-accent, p-2, text-muted) and never raw hex/px — enforced by ESLint.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
        },
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
        },
        danger: "var(--color-danger)",
      },
      spacing: {
        // Spacing scale 4/8/12/16/24/32 (Req 9.1)
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        6: "var(--space-6)",
        8: "var(--space-8)",
      },
      maxWidth: {
        app: "var(--app-max-width)",
      },
      borderRadius: {
        token: "var(--radius)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      transitionDuration: {
        token: "150ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
