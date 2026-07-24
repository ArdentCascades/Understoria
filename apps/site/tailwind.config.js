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
        // Stock families pinned to their Tailwind 3 hex values —
        // mirrors apps/web/tailwind.config.js (see
        // docs/tailwind-4-plan.md). No-op under v3.
        amber: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        red: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
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
        // shadow-sm pinned to its Tailwind 3 value (see
        // docs/tailwind-4-plan.md). No-op under v3.
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      // rounded-sm pinned to its Tailwind 3 value. No-op under v3.
      borderRadius: {
        sm: "0.125rem",
      },
    },
  },
  plugins: [],
};
