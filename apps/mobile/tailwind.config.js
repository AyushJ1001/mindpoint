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
        background: "#faf7f2",
        foreground: "#2d2a26",
        card: "#ffffff",
        "card-foreground": "#2d2a26",
        popover: "#ffffff",
        "popover-foreground": "#2d2a26",
        primary: "#5b7a5e",
        "primary-foreground": "#ffffff",
        secondary: "#f0ebe3",
        "secondary-foreground": "#5a544d",
        muted: "#f5f0e8",
        "muted-foreground": "#8a8279",
        accent: "#e8ddd0",
        "accent-foreground": "#3d3732",
        destructive: "#c45a4a",
        "destructive-foreground": "#ffffff",
        border: "#e2dcd4",
        input: "#f5f0e8",
        ring: "#7a9a7d",
        // Extended palette
        "sage-light": "#e8f0e8",
        "sage-dark": "#4a6a4d",
        terracotta: "#c47a5a",
        "terracotta-light": "#faf0ea",
        "warm-pink": "#e8a0a0",
        "warm-pink-light": "#fdf0ef",
        cream: "#f5efe6",
        "cream-dark": "#e8ddd0",
      },
      borderRadius: {
        sm: "0.875rem",
        md: "1rem",
        lg: "1.25rem",
        xl: "1.5rem",
      },
      fontFamily: {
        mono: ["SpaceMono"],
      },
    },
  },
  plugins: [],
};
