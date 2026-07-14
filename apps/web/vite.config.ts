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
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// The build stamp shown in Settings (docs/operator-guide.md §6).
// Resolution order: an explicit VITE_BUILD_STAMP (the Docker build
// passes the short commit hash this way — the build context has no
// .git), then a live git short hash (local/dev builds), then "" so
// the client falls back to "dev". Failure to read git is never fatal.
function resolveBuildStamp(): string {
  const fromEnv = process.env.VITE_BUILD_STAMP?.trim();
  if (fromEnv) return fromEnv;
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}
const BUILD_STAMP = resolveBuildStamp();

// A demo build disconnects federation entirely (readSubmitConfig /
// enqueueOutbox / listNodeEndpoints are hard-disabled) and shows the
// demo banner — deployed as a real community it would silently never
// sync. The plain `build` script pins VITE_DEMO to empty so a stray
// shell export or .env line can't flip a production build; this
// banner makes the mode unmissable when it IS set (build:demo).
if (process.env.VITE_DEMO === "1") {
  console.warn(
    "\n⚠ VITE_DEMO=1 — building the CLIENT-ONLY DEMO bundle. " +
      "Federation is disabled in this build; do not deploy it as a " +
      "real community app.\n",
  );
}

export default defineConfig({
  define: {
    __UNDERSTORIA_BUILD_STAMP__: JSON.stringify(BUILD_STAMP),
  },
  plugins: [
    react(),
    VitePWA({
      // "prompt": a new deploy does NOT silently swap the code out from
      // under an open session. The waiting service worker activates only
      // when the member taps Refresh in <UpdatePrompt /> (or on the next
      // full app open). Members were silently running stale builds for
      // days under autoUpdate's in-place refresh-on-navigation model.
      registerType: "prompt",
      includeAssets: ["favicon.svg", "icons/*.svg"],
      manifest: {
        name: "Understoria",
        short_name: "Understoria",
        description:
          "A federated, privacy-first mutual aid timebank. One hour of help = one hour of help.",
        theme_color: "#15803d",
        // Matches the iOS splash canvas (#14532d) and the maskable
        // icon background so Chrome / Android's PWA splash uses the
        // same green our iOS apple-touch-startup-image PNGs use.
        // iOS ignores this; index.html splash links carry that load.
        background_color: "#14532d",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: { cacheName: "understoria-pages" },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Authored content (templates, tips, starter steps) is pure
            // data and grew the main chunk past workbox's 2 MiB per-file
            // precache limit. Its own chunk keeps every file precachable
            // and stops content edits from invalidating the app chunk.
            { name: "content", test: /src[\\/]content[\\/]/ },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
