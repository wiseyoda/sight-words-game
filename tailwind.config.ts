import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors will be customized per-theme via CSS variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
      },
      // Child-friendly touch targets (64px minimum, 80px preferred)
      spacing: {
        'touch': '4rem',      // 64px - minimum touch target
        'touch-lg': '5rem',   // 80px - preferred touch target
      },
      // Font sizes for readability
      fontSize: {
        'child': ['1.5rem', { lineHeight: '2rem' }],
        'child-lg': ['2rem', { lineHeight: '2.5rem' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
