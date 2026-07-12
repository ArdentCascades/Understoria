/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineConfig } from "vite";

// The showcase site is a plain static build: one HTML entry, Tailwind
// via PostCSS, and a few KB of vanilla JS for the theme toggle. No
// framework and no app code — it is the project's front door, not the
// app itself (which is apps/web, a self-hosted PWA per community).
export default defineConfig({
  // Relative base so the built site works whether it's served from a
  // domain root (understoria.<domain>) or a subpath.
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
