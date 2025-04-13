import type { Config } from "tailwindcss";

export default {
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
      colors: {
        // Soft blue and green color palette
        primary: {
          DEFAULT: "#1EAEDB", // Bright Blue
          50: "#D3E4FD", // Soft Blue
          100: "#33C3F0", // Sky Blue
          200: "#0FA0CE", // Bright Blue
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2ECC71", // Soft Green
          50: "#F2FCE2", // Soft Green
          100: "#58D68D", // Bright Green
          200: "#45B39D", // Teal Green
          foreground: "#FFFFFF",
        },
        background: {
          DEFAULT: "#F0F4F8", // Light Blue-Gray
          foreground: "#1A1A1A",
        },
        muted: {
          DEFAULT: "#E6F2F0", // Very Light Mint Green
          foreground: "#2C3E50",
        },
        accent: {
          DEFAULT: "#48C774", // Vibrant Green
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF3860", // Bright Red (for contrast)
          foreground: "#FFFFFF",
        },
        border: "#A0D8EF", // Light Blue Border
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
