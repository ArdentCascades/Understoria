/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// ESLint flat config, scoped to a11y rules only.
//
// This config exists to enforce the WCAG 2.1 AA standards floor
// documented in `docs/accessibility.md`. It does NOT try to enforce
// general code style — the project relies on `tsc --noEmit` for
// type checking and trusts contributors with the rest. Adding the
// full `@typescript-eslint` rule surface here would flood CI with
// findings on existing code that wasn't written under lint; that's
// a separate workstream.
//
// All a11y rules are at "error" severity — accessibility findings
// block the build the same way type errors do. Reviewers can
// disable a specific rule on a specific line with a clear comment
// if there's a real reason (rare).

import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    // Lint only source. Tests stay out of scope — they don't render
    // to real screens — and built output / vendored code is always
    // excluded.
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "src/test/**",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx,jsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    languageOptions: {
      // Use the TypeScript-aware parser so .ts/.tsx files parse;
      // we deliberately do NOT pull in @typescript-eslint's rules.
      // The project relies on `tsc --noEmit` for type checking and
      // this config is scoped to jsx-a11y rules only.
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];
