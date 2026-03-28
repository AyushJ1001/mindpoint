/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8f9fd",
        foreground: "#303853",
        card: "#ffffff",
        "card-foreground": "#2d3550",
        popover: "#ffffff",
        "popover-foreground": "#2d3550",
        primary: "#635bff",
        "primary-foreground": "#f8f9fd",
        secondary: "#eef1fa",
        "secondary-foreground": "#394260",
        muted: "#f3f5fb",
        "muted-foreground": "#717a93",
        accent: "#e9eef9",
        "accent-foreground": "#34405e",
        destructive: "#df4f4f",
        "destructive-foreground": "#ffffff",
        border: "#dde3f0",
        input: "#f7f8fc",
        ring: "#7a72ff",
      },
      borderRadius: {
        sm: "0.75rem",
        md: "0.875rem",
        lg: "1rem",
        xl: "1.25rem",
      },
      fontFamily: {
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
