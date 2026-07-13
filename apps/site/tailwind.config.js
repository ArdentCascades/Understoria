/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/** @type {import('tailwindcss').Config} */
// Mirrors apps/web/tailwind.config.js so the showcase site reads as the
// same product — the woodland moss/canopy palette, the ember
// reciprocity accent, the bark neutral, and the serif-for-titles rule.
// Kept as its own copy (not imported) so the site builds without a
// dependency on the app package.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,js}"],
  theme: {
    extend: {
      colors: {
        canopy: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        moss: {
          50: "#f5f7f3",
          100: "#e7ede1",
          200: "#cfdbc4",
          300: "#adc09e",
          400: "#87a275",
          500: "#688657",
          600: "#506b43",
          700: "#3f5537",
          800: "#34452e",
          900: "#2c3a28",
          950: "#161f13",
        },
        ember: {
          50: "#fdf6ec",
          100: "#fae8cf",
          200: "#f4d3a1",
          300: "#e9b977",
          400: "#dc9c4d",
          500: "#c97f1e",
          600: "#a96618",
          700: "#8a5212",
          800: "#65380c",
          900: "#4a2c08",
        },
        bark: {
          50: "#f7f4ef",
          100: "#ede7dc",
          200: "#d9cfbe",
          300: "#bfb097",
          400: "#9a886b",
          500: "#7a6a52",
          600: "#5e5040",
          700: "#473d31",
          800: "#3a3225",
          900: "#241f18",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["'Source Serif 4'", "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        leaf: "0 1px 2px rgb(20 83 45 / 0.04), 0 4px 12px rgb(20 83 45 / 0.05)",
        "leaf-lg":
          "0 2px 4px rgb(20 83 45 / 0.05), 0 12px 32px rgb(20 83 45 / 0.10)",
      },
    },
  },
  plugins: [],
};
