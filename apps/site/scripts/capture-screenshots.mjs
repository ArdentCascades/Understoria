/*
 * Understoria — SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Capture realistic showcase screenshots from the REAL app running in
 * dev mode, where `seedDemoCommunityIfDev` populates a sample community
 * (You + Rosa, Marcus, Imani, Theo, with posts, projects, and events).
 * So every screenshot shows the app as it looks in active use, with
 * placeholder members — never an empty first-run state.
 *
 * Prereqs (see README): the web dev server must be running on
 * $SITE_APP_URL (default http://localhost:5173). Run with `npm run shots`.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const APP_URL = process.env.SITE_APP_URL ?? "http://localhost:5173";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "screenshots",
);

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Wait for the app shell + seeded content to settle. The seed writes
 *  to IndexedDB on mount and live queries repaint, so we wait for a
 *  stable app-shell element plus a short settle. */
async function settle(page) {
  await page
    .waitForLoadState("networkidle", { timeout: 15000 })
    .catch(() => {});
  // The bottom nav / app shell is present once past onboarding.
  await page
    .waitForSelector("nav, [role='navigation'], main", { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
  // Dismiss the first-run nudge stack so the showcase reflects a settled,
  // in-use community rather than an onboarding moment. These nudges appear
  // one at a time (join-a-community banner, "two ways in" hint, keep-a-
  // spare-copy backup nudge, install-as-an-app card), so dismissing one
  // reveals the next — loop until the hero is clear or we hit the cap.
  const dismissLabels = /^(dismiss|got it|maybe later|not now)$/i;
  for (let i = 0; i < 6; i += 1) {
    const btn = page.getByRole("button", { name: dismissLabels }).first();
    if (!(await btn.isVisible().catch(() => false))) break;
    await btn.click().catch(() => {});
    await page.waitForTimeout(400);
  }
}

async function shoot(context, { name, path = "/", clickFirstProject = false }) {
  const page = await context.newPage();
  try {
    await page.goto(`${APP_URL}${path}`, { waitUntil: "domcontentloaded" });
    await settle(page);
    if (clickFirstProject) {
      const link = page.locator("a[href^='/project/']").first();
      const href = await link.getAttribute("href").catch(() => null);
      if (href) {
        await page.goto(`${APP_URL}${href}`, { waitUntil: "domcontentloaded" });
        await settle(page);
      }
    }
    await page.screenshot({ path: resolve(OUT, `${name}.png`) });
    console.log(`✓ ${name}.png`);
  } catch (err) {
    console.error(`✗ ${name}:`, err.message);
  } finally {
    await page.close();
  }
}

// Use the environment's pre-installed Chromium rather than downloading
// one (the browser revision Playwright's npm build wants may differ).
// Override with PLAYWRIGHT_CHROMIUM_EXECUTABLE if your setup differs.
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const desktop = await browser.newContext({
  viewport: DESKTOP,
  deviceScaleFactor: 2,
  colorScheme: "light",
});
await shoot(desktop, { name: "board", path: "/?tab=needs" });
await shoot(desktop, { name: "dashboard", path: "/dashboard" });
await shoot(desktop, { name: "calendar", path: "/calendar" });
await shoot(desktop, {
  name: "project",
  path: "/?tab=projects",
  clickFirstProject: true,
});
await desktop.close();

const mobile = await browser.newContext({
  viewport: MOBILE,
  deviceScaleFactor: 3,
  colorScheme: "light",
  isMobile: true,
  hasTouch: true,
});
await shoot(mobile, { name: "board-mobile", path: "/?tab=needs" });
await mobile.close();

await browser.close();
console.log(`\nScreenshots written to ${OUT}`);
