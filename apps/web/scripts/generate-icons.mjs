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

// Rasterizes public/icons/icon.svg into the PNG manifest icons.
// Run from apps/web:  node scripts/generate-icons.mjs
//
// Outputs (all committed — regeneration is for when the mark changes):
//   icon-192.png           192x192, purpose "any"
//   icon-512.png           512x512, purpose "any"
//   icon-512-maskable.png  512x512, purpose "maskable"
//
// The source SVG is a rounded rect (rx=36/192) on a transparent
// canvas, so it is NOT full-bleed — Android's maskable crop would
// expose the transparent corners. The maskable variant therefore
// renders the mark at 80% scale centered on a square canvas filled
// with the SVG's own background green (#14532d) so the rounded rect
// blends invisibly into the safe-zone padding.

import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(here, "..", "public", "icons");
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

await plain(192, "icon-192.png");
await plain(512, "icon-512.png");
await maskable(512, "icon-512-maskable.png");
