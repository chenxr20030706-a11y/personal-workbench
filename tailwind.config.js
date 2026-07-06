/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        dream: {
          blue: {
            50: "#F0F7FF",
            100: "#E0F0FF",
            200: "#BFDFFF",
            300: "#87CEEB",
            400: "#5BA8D6",
            500: "#4A90B8",
            600: "#3A78A0",
            700: "#2E6082",
          },
          cream: {
            50: "#FFFBF5",
            100: "#FFF5E6",
            200: "#FFEBC8",
            300: "#FFDBA0",
            400: "#FFC878",
            500: "#FFB450",
          },
          gold: {
            50: "#FFF9E6",
            100: "#FFF0C2",
            200: "#FFE499",
            300: "#FFD666",
            400: "#FFC833",
            500: "#FFB800",
            600: "#E6A000",
          },
          slate: {
            50: "#F8FAFB",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          },
          purple: {
            50: "#FAF5FF",
            100: "#F3E8FF",
            200: "#E9D5FF",
            300: "#D8B4FE",
            400: "#C084FC",
            500: "#A855F7",
            600: "#9333EA",
            700: "#7E22CE",
          },
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "twinkle": "twinkle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
      boxShadow: {
        "soft": "0 4px 20px -2px rgba(75, 168, 214, 0.12)",
        "soft-lg": "0 10px 40px -5px rgba(75, 168, 214, 0.15)",
        "glow": "0 0 30px rgba(75, 168, 214, 0.2)",
        "glow-soft": "0 0 20px rgba(135, 206, 235, 0.3)",
        "dream": "0 2px 12px rgba(75, 168, 214, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
