/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { defineConfig } from "vite";

// Where the "See the live demo" links point. The demo is a build of
// apps/web produced with VITE_DEMO=1 (see apps/web `build:demo`). Its
// home is the deployer's choice, so this is overridable at build time:
//
//   VITE_DEMO_URL=https://demo.understoria.example npm run build
//
// Default `./demo/` assumes the demo build is dropped alongside this
// site under a /demo/ path (the zero-DNS option). For a dedicated
// subdomain, pass the absolute URL as above. See apps/site/README.md.
const DEMO_URL = process.env.VITE_DEMO_URL || "./demo/";

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
  plugins: [
    {
      // Substitute the demo URL into the static HTML at build time.
      // A dev-server (`transformIndexHtml`) and build both run this.
      name: "understoria-demo-url",
      transformIndexHtml(html) {
        return html.replaceAll("%DEMO_URL%", DEMO_URL);
      },
    },
  ],
});
