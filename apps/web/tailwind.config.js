/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
        // Warm accent. Reserved for reciprocity moments only — a
        // thank-you, a fulfilled need, an exchange confirmation.
        // Never used for status, rank, urgency, or judgment.
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
        // Warm neutral. Pairs with moss/canopy for body text and
        // soft borders — keeps the all-green palette from reading
        // clinical without introducing a second hue.
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
        // Reserved for page-level titles only. See design/README.md.
        serif: [
          "'Source Serif 4 Variable'",
          "'Source Serif 4'",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      // 5-step type scale (1.25 ratio). Use these tokens instead of
      // raw text-{xl,2xl,…} so hierarchy stays consistent across
      // pages. See design/README.md for when to use each.
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        title: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        heading: ["1.125rem", { lineHeight: "1.35" }],
        body: ["1rem", { lineHeight: "1.6" }],
        caption: ["0.8125rem", { lineHeight: "1.45" }],
      },
      // Vertical rhythm tokens. Prefer these over arbitrary
      // gap-3/mt-4/py-6 so spacing is consistent.
      spacing: {
        "stack-xs": "0.5rem",
        "stack-sm": "0.75rem",
        "stack-md": "1.25rem",
        "stack-lg": "2rem",
        "stack-xl": "3rem",
      },
      boxShadow: {
        // Soft dual-layer shadow tinted with canopy green. Use for
        // cards instead of shadow-sm; blends with the woodland palette.
        leaf: "0 1px 2px rgb(20 83 45 / 0.04), 0 4px 12px rgb(20 83 45 / 0.05)",
      },
      animation: {
        "milestone-pop": "milestone-pop 600ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        "fade-in": "fade-in 200ms ease-out",
        // The calendar's docked event panel entering from the right.
        "slide-in": "slide-in 200ms ease-out",
      },
      keyframes: {
        "milestone-pop": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [
    // Phone held sideways: width is abundant, height is scarce — nav moves to a rail (Layout.tsx).
    plugin(({ addVariant }) => {
      addVariant(
        "landscape-short",
        "@media (orientation: landscape) and (max-height: 500px)",
      );
    }),
  ],
};
