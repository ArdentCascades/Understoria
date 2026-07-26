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
          50: "rgb(var(--canopy-50) / <alpha-value>)",
          100: "rgb(var(--canopy-100) / <alpha-value>)",
          200: "rgb(var(--canopy-200) / <alpha-value>)",
          300: "rgb(var(--canopy-300) / <alpha-value>)",
          400: "rgb(var(--canopy-400) / <alpha-value>)",
          500: "rgb(var(--canopy-500) / <alpha-value>)",
          600: "rgb(var(--canopy-600) / <alpha-value>)",
          700: "rgb(var(--canopy-700) / <alpha-value>)",
          800: "rgb(var(--canopy-800) / <alpha-value>)",
          900: "rgb(var(--canopy-900) / <alpha-value>)",
          950: "rgb(var(--canopy-950) / <alpha-value>)",
        },
        moss: {
          50: "rgb(var(--moss-50) / <alpha-value>)",
          100: "rgb(var(--moss-100) / <alpha-value>)",
          200: "rgb(var(--moss-200) / <alpha-value>)",
          300: "rgb(var(--moss-300) / <alpha-value>)",
          400: "rgb(var(--moss-400) / <alpha-value>)",
          500: "rgb(var(--moss-500) / <alpha-value>)",
          600: "rgb(var(--moss-600) / <alpha-value>)",
          700: "rgb(var(--moss-700) / <alpha-value>)",
          800: "rgb(var(--moss-800) / <alpha-value>)",
          900: "rgb(var(--moss-900) / <alpha-value>)",
          950: "rgb(var(--moss-950) / <alpha-value>)",
        },
        // Warm accent. Reserved for reciprocity moments only — a
        // thank-you, a fulfilled need, an exchange confirmation.
        // Never used for status, rank, urgency, or judgment.
        ember: {
          50: "rgb(var(--ember-50) / <alpha-value>)",
          100: "rgb(var(--ember-100) / <alpha-value>)",
          200: "rgb(var(--ember-200) / <alpha-value>)",
          300: "rgb(var(--ember-300) / <alpha-value>)",
          400: "rgb(var(--ember-400) / <alpha-value>)",
          500: "rgb(var(--ember-500) / <alpha-value>)",
          600: "rgb(var(--ember-600) / <alpha-value>)",
          700: "rgb(var(--ember-700) / <alpha-value>)",
          800: "rgb(var(--ember-800) / <alpha-value>)",
          900: "rgb(var(--ember-900) / <alpha-value>)",
        },
        // Warm neutral. Pairs with moss/canopy for body text and
        // soft borders — keeps the all-green palette from reading
        // clinical without introducing a second hue.
        bark: {
          50: "rgb(var(--bark-50) / <alpha-value>)",
          100: "rgb(var(--bark-100) / <alpha-value>)",
          200: "rgb(var(--bark-200) / <alpha-value>)",
          300: "rgb(var(--bark-300) / <alpha-value>)",
          400: "rgb(var(--bark-400) / <alpha-value>)",
          500: "rgb(var(--bark-500) / <alpha-value>)",
          600: "rgb(var(--bark-600) / <alpha-value>)",
          700: "rgb(var(--bark-700) / <alpha-value>)",
          800: "rgb(var(--bark-800) / <alpha-value>)",
          900: "rgb(var(--bark-900) / <alpha-value>)",
        },
        // Stock families pinned to their Tailwind 3 hex values. Under
        // v3 these equal the defaults (no-op); under v4 they defeat
        // the oklch default palette so rendered colors stay equal to
        // the hexes lib/a11y/palette-contrast.test.ts certifies. See
        // docs/tailwind-4-plan.md.
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
        leaf: "0 1px 2px rgb(var(--canopy-900) / 0.04), 0 4px 12px rgb(var(--canopy-900) / 0.05)",
        // shadow-sm pinned to its Tailwind 3 value (v4 renames the
        // scale so sm would mean the old DEFAULT). No-op under v3.
        // See docs/tailwind-4-plan.md.
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      // rounded-sm pinned to its Tailwind 3 value (v4 shifts it to
      // 0.25rem). No-op under v3. See docs/tailwind-4-plan.md.
      borderRadius: {
        sm: "0.125rem",
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
