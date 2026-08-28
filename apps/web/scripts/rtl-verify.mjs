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
//
// RTL R3: the mirrored-surface verification pass (docs/rtl-plan.md).
//
// Builds the app with the demo seed AND the RTL preview pseudo-locale
// (VITE_DEMO=1 VITE_RTL_PSEUDO=1), serves the bundle, and walks the
// member-facing surfaces at phone width twice — once in English (LTR)
// and once in the "rtl" pseudo-locale (English text, mirrored layout).
// For every route in both directions it asserts:
//
//   1. <html dir> is what the language says it should be, and
//   2. nothing overflows horizontally (scrollWidth stays inside the
//      375px viewport — the classic symptom of a stranded surface).
//
// Plus two pointed mirroring probes on the board:
//
//   3. the first bottom-nav tab renders in the start half of the bar
//      (left in LTR, right in RTL), and
//   4. the me-menu drawer anchors to the reading END edge (right in
//      LTR, left in RTL).
//
// Screenshots land in --out (default: ./rtl-r3-shots), one per
// route+direction, plus contact-sheet.png with every pair side by
// side for human review. Exit code is non-zero when any assertion
// fails, so this can gate a release candidate; it is NOT wired into
// CI by default because it builds the whole app (~a minute).
//
// Usage, from apps/web:
//   node scripts/rtl-verify.mjs             # build + verify
//   node scripts/rtl-verify.mjs --skip-build  # reuse existing dist/
//   node scripts/rtl-verify.mjs --out /tmp/shots
//
// Playwright resolves from the workspace root (apps/site depends on
// it); the runner's chromium comes from PLAYWRIGHT_BROWSERS_PATH.

import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const WEB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(WEB_ROOT, "dist");
const OUT = resolve(
  process.argv.includes("--out")
    ? process.argv[process.argv.indexOf("--out") + 1]
    : join(WEB_ROOT, "rtl-r3-shots"),
);

const ROUTES = [
  ["board", "/"],
  ["dashboard", "/dashboard"],
  ["calendar", "/calendar"],
  ["messages", "/messages"],
  ["profile", "/profile"],
  ["settings", "/settings"],
  ["help", "/help"],
  ["print-board", "/print/board"],
];

const VIEWPORT = { width: 375, height: 812 };

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

function build() {
  console.log("building (VITE_DEMO=1 VITE_RTL_PSEUDO=1)…");
  execFileSync("npx", ["vite", "build"], {
    cwd: WEB_ROOT,
    stdio: "inherit",
    env: { ...process.env, VITE_DEMO: "1", VITE_RTL_PSEUDO: "1" },
  });
}

/** Static server over dist/ with the SPA fallback the PWA expects. */
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(DIST, path);
    if (!existsSync(file) || path === "/") file = join(DIST, "index.html");
    try {
      const body = readFileSync(file);
      res.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((ok) =>
    server.listen(0, "127.0.0.1", () => ok(server)),
  );
}

const failures = [];
function check(label, cond, detail = "") {
  if (cond) return;
  failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
}

async function walk(browser, origin, lang) {
  const expectDir = lang === "rtl" ? "rtl" : "ltr";
  const context = await browser.newContext({ viewport: VIEWPORT });
  await context.addInitScript((l) => {
    try {
      window.localStorage.setItem("understoria.language", l);
    } catch {
      /* first paint falls back to the detector; the assert catches it */
    }
  }, lang);

  const page = await context.newPage();
  for (const [slug, route] of ROUTES) {
    await page.goto(origin + route, { waitUntil: "networkidle" });
    // The app gates first render on i18nReady; #root gains children
    // once it mounts.
    await page.waitForSelector("#root > *", { timeout: 15000 });
    await page.waitForTimeout(250);

    const state = await page.evaluate(() => ({
      dir: document.documentElement.getAttribute("dir"),
      scrollWidth: Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      ),
      innerWidth: window.innerWidth,
    }));
    check(
      `${lang}:${slug} <html dir>`,
      state.dir === expectDir,
      `got ${JSON.stringify(state.dir)}`,
    );
    check(
      `${lang}:${slug} no horizontal overflow`,
      state.scrollWidth <= state.innerWidth,
      `scrollWidth ${state.scrollWidth} > viewport ${state.innerWidth}`,
    );
    await page.screenshot({ path: join(OUT, `${slug}.${lang}.png`) });
  }

  // Probe 3: the first bottom-nav tab sits in the reading-start half.
  await page.goto(origin + "/", { waitUntil: "networkidle" });
  await page.waitForSelector("nav ul a", { timeout: 15000 });
  const tab = await page.locator("nav ul a").first().boundingBox();
  const mid = VIEWPORT.width / 2;
  const tabCenter = tab.x + tab.width / 2;
  check(
    `${lang}: first nav tab at reading start`,
    expectDir === "rtl" ? tabCenter > mid : tabCenter < mid,
    `center x=${Math.round(tabCenter)}`,
  );

  // Probe 4: the me-menu drawer anchors to the reading END edge. The
  // trigger keeps its English aria-label in both modes (pseudo-locale
  // text is English).
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  // The drawer mounts offscreen at translate-x-[var(--slide-out)] and
  // slides in over 200ms; measure it settled, not mid-flight. (Its
  // offscreen START is itself direction-mirrored — x=+100% in LTR,
  // -100% in RTL — which is the custom property doing its job.)
  await page.waitForTimeout(500);
  const panel = await page.locator('[role="dialog"]').boundingBox();
  const anchoredRight = Math.abs(panel.x + panel.width - VIEWPORT.width) < 2;
  const anchoredLeft = Math.abs(panel.x) < 2;
  check(
    `${lang}: me-menu drawer anchors at reading end`,
    expectDir === "rtl" ? anchoredLeft : anchoredRight,
    `panel x=${Math.round(panel.x)} width=${Math.round(panel.width)}`,
  );
  await page.screenshot({ path: join(OUT, `me-menu.${lang}.png`) });

  await context.close();
}

async function contactSheet(browser) {
  const pairs = [...ROUTES.map(([slug]) => slug), "me-menu"];
  const rows = pairs
    .map(
      (slug) => `
      <figure>
        <figcaption>${slug}</figcaption>
        <img src="${slug}.en.png" alt="${slug} left-to-right" />
        <img src="${slug}.rtl.png" alt="${slug} right-to-left" />
      </figure>`,
    )
    .join("\n");
  const html = `<!doctype html><meta charset="utf-8">
  <style>
    body { margin: 16px; font: 14px system-ui; background: #fff; }
    figure { margin: 0 0 24px; }
    figcaption { font-weight: 600; margin-bottom: 6px; }
    img { width: 375px; border: 1px solid #ccc; vertical-align: top; }
    img + img { margin-left: 12px; }
  </style>
  <h1>RTL R3 — LTR (left) vs pseudo-locale RTL (right)</h1>
  ${rows}`;
  const sheetPath = join(OUT, "contact-sheet.html");
  writeFileSync(sheetPath, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(sheetPath).href);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(OUT, "contact-sheet.png"),
    fullPage: true,
  });
  await page.close();
}

if (!process.argv.includes("--skip-build")) build();
if (!existsSync(join(DIST, "index.html"))) {
  console.error("dist/index.html missing — build first");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const server = await serve();
const origin = `http://127.0.0.1:${server.address().port}`;
// PW_CHROMIUM escape hatch: a runner whose playwright version doesn't
// match its downloaded browser set (e.g. a preinstalled chromium at a
// fixed path) can point straight at an executable.
const browser = await chromium.launch(
  process.env.PW_CHROMIUM
    ? { executablePath: process.env.PW_CHROMIUM }
    : undefined,
);
try {
  await walk(browser, origin, "en");
  await walk(browser, origin, "rtl");
  await contactSheet(browser);
} finally {
  await browser.close();
  server.close();
}

const checks = 2 * (ROUTES.length * 2 + 2);
if (failures.length) {
  console.error(`\n${failures.length} of ${checks} checks FAILED`);
  process.exit(1);
}
console.log(`\nall ${checks} checks passed — screenshots in ${OUT}`);
