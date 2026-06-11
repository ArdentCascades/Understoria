/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Rasterizes public/icons/icon.svg into the PNG manifest icons and
// the iOS apple-touch-startup-image splash screens.
// Run from apps/web:  node scripts/generate-icons.mjs
//
// Outputs (all committed — regeneration is for when the mark changes):
//   icons/icon-192.png           192x192, purpose "any"
//   icons/icon-512.png           512x512, purpose "any"
//   icons/icon-512-maskable.png  512x512, purpose "maskable"
//   splash/splash-<device>-<orientation>.png  iOS PWA splash screens
//
// The source SVG is a rounded rect (rx=36/192) on a transparent
// canvas, so it is NOT full-bleed — Android's maskable crop would
// expose the transparent corners. The maskable variant therefore
// renders the mark at 80% scale centered on a square canvas filled
// with the SVG's own background green (#14532d) so the rounded rect
// blends invisibly into the safe-zone padding.
//
// iOS splash screens (apple-touch-startup-image) likewise place the
// mark on the same #14532d canvas — at ~27% of the smaller dimension
// so it reads as an identity mark, not a full-bleed illustration.
// iOS expects distinct portrait and landscape files even though the
// mark is centered in both. Device-size matrix sourced from
// onderceylan/pwa-asset-generator's well-tested device list.

import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "..", "public");
const iconsDir = path.join(publicDir, "icons");
const splashDir = path.join(publicDir, "splash");
const src = path.join(iconsDir, "icon.svg");

// Matches the <rect fill> in icon.svg — keep in sync if the mark's
// background ever changes.
const CANVAS_GREEN = "#14532d";

async function plain(size, file) {
  await sharp(src, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

async function maskable(size, file) {
  const inner = Math.round(size * 0.8); // ~80% = mark inside the safe zone
  const mark = await sharp(src, { density: 300 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: CANVAS_GREEN,
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, file));
  console.log(`wrote ${file} (${size}x${size}, maskable)`);
}

// Device matrix for apple-touch-startup-image. Sizes are in PHYSICAL
// pixels (what the PNG must be); the matching index.html media query
// uses CSS device-width/device-height + -webkit-device-pixel-ratio.
// Source: https://github.com/onderceylan/pwa-asset-generator (device
// list cross-checked against Apple's published display specs).
const DEVICES = [
  {
    slug: "iphone-se",
    label: "iPhone SE / 8",
    portrait: { w: 750, h: 1334 },
    cssW: 375,
    cssH: 667,
    dpr: 2,
  },
  {
    slug: "iphone-14",
    label: "iPhone X / 11 / 12 / 13 / 14",
    portrait: { w: 1170, h: 2532 },
    cssW: 390,
    cssH: 844,
    dpr: 3,
  },
  {
    slug: "iphone-14-pro",
    label: "iPhone 14 Pro / 15 Pro",
    portrait: { w: 1179, h: 2556 },
    cssW: 393,
    cssH: 852,
    dpr: 3,
  },
  {
    slug: "iphone-14-pro-max",
    label: "iPhone 14 Pro Max / 15 Pro Max",
    portrait: { w: 1290, h: 2796 },
    cssW: 430,
    cssH: 932,
    dpr: 3,
  },
  {
    slug: "ipad-11",
    label: 'iPad Pro 11"',
    portrait: { w: 1668, h: 2388 },
    cssW: 834,
    cssH: 1194,
    dpr: 2,
  },
  {
    slug: "ipad-12-9",
    label: 'iPad Pro 12.9"',
    portrait: { w: 2048, h: 2732 },
    cssW: 1024,
    cssH: 1366,
    dpr: 2,
  },
];

// Mark is ~27% of the smaller dimension — large enough to read as an
// identity mark on a phone, small enough not to dominate on iPad.
const MARK_FRACTION = 0.27;

async function splash(width, height, file) {
  const inner = Math.round(Math.min(width, height) * MARK_FRACTION);
  const mark = await sharp(src, { density: 300 })
    .resize(inner, inner)
    .png()
    .toBuffer();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: CANVAS_GREEN,
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    // compressionLevel 9 + palette quantization keeps files small —
    // a flat-color canvas with a tiny mark compresses to a few KB.
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(splashDir, file));
  console.log(`wrote splash/${file} (${width}x${height})`);
}

await mkdir(splashDir, { recursive: true });

await plain(192, "icon-192.png");
await plain(512, "icon-512.png");
await maskable(512, "icon-512-maskable.png");

for (const d of DEVICES) {
  const { w, h } = d.portrait;
  await splash(w, h, `splash-${d.slug}-portrait.png`);
  await splash(h, w, `splash-${d.slug}-landscape.png`);
}
