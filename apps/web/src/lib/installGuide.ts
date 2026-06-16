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
import { getSetting, SETTING_KEYS, setSetting } from "@/db/database";

// Detection + capture + dismiss helpers for the "Add to Home Screen"
// install guide. The human-facing affordance that turns an already-
// installable PWA into a thing a member can actually find and install.
//
// PRIVACY INVARIANT: every user-agent / display-mode / platform read
// in this module is client-side and synchronous. Nothing here is
// logged, sent over the wire, or persisted — the SOLE exception is the
// single local `installGuideDismissed` sentinel written to the Dexie
// settings table (per-device, never federated, cleared on hard purge).
// We never fingerprint, never record which browser a member uses, and
// never time how long the prompt sat unanswered.

/** Browsers we can give pictured manual steps for. `ios-safari` is
 *  detected separately (it gets the live Share-glyph copy) but is
 *  included here for the "different browser?" selector so an iOS member
 *  who somehow landed in the manual branch can still pick it. */
export type BrowserId =
  | "ios-safari"
  | "chrome-android"
  | "samsung"
  | "firefox-android"
  | "chrome-desktop"
  | "edge-desktop";

/** The detected install posture. First-match-wins, classified by
 *  `detectInstallEnvironment` below. `installed` always wins. */
export type InstallEnvironment =
  | { kind: "installed" }
  | { kind: "promptable" }
  | { kind: "ios-safari" }
  | { kind: "in-app-browser" }
  | { kind: "manual"; browser: BrowserId }
  | { kind: "unknown" };

// --- Pure predicates -------------------------------------------------
// Every predicate takes its inputs as parameters so it is unit-testable
// without a DOM. The thin `currentInstallEnvironment()` wrapper at the
// bottom reads the live globals and feeds them in.

/** Running as an installed app: Chromium/standard display-mode OR the
 *  non-standard iOS Safari `navigator.standalone` flag. */
export function isStandalone(
  displayModeStandalone: boolean,
  navigatorStandalone: boolean,
): boolean {
  return displayModeStandalone || navigatorStandalone;
}

/** iOS (or iPadOS). iPadOS 13+ reports as desktop Safari on a Mac, so
 *  we also treat `MacIntel` + a touch screen as iOS. */
export function isIos(
  ua: string,
  platform: string,
  maxTouchPoints: number,
): boolean {
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  // iPadOS-as-Mac: a touch-capable "MacIntel" is an iPad in disguise.
  return platform === "MacIntel" && maxTouchPoints > 1;
}

/** Real Safari — NOT one of the iOS browsers that wrap WebKit but
 *  can't drive the Add-to-Home-Screen Share flow (Chrome `CriOS`,
 *  Firefox `FxiOS`, Edge `EdgiOS`, Opera `OPiOS`/`OPT`). */
export function isSafari(ua: string): boolean {
  if (/CriOS|FxiOS|EdgiOS|OPiOS|OPT/.test(ua)) return false;
  return /Safari/.test(ua);
}

/** Rendering inside another app's embedded web view, where the host
 *  app owns the chrome and there is no Add-to-Home-Screen affordance.
 *  Case-insensitive token match — the member must open the page in a
 *  real browser first. */
export function isInAppBrowser(ua: string): boolean {
  return [
    "FBAN",
    "FBAV",
    "FB_IAB",
    "Instagram",
    "WhatsApp",
    "Line/",
    "Snapchat",
    "TikTok",
    "musical_ly",
    "Twitter",
    "; wv",
  ].some((token) => ua.toLowerCase().includes(token.toLowerCase()));
}

/** Best-effort browser identification for the manual-steps branch.
 *  Order matters: Samsung's UA also contains `Chrome`, and Edge's
 *  contains `Chrome` too, so the more specific token wins first. */
export function detectBrowser(ua: string): BrowserId {
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Firefox/.test(ua) && /Android|Mobile/.test(ua)) {
    return "firefox-android";
  }
  if (/Edg/.test(ua)) return "edge-desktop";
  if (/Android/.test(ua)) return "chrome-android";
  // Desktop Chromium (or anything else that fell through) gets the
  // address-bar-install steps.
  return "chrome-desktop";
}

/**
 * Classify the install posture. First match wins; `installed` always
 * wins over everything else (an installed app should never nag about
 * installing). See the per-branch comments for the ordering rationale.
 */
export function detectInstallEnvironment(input: {
  ua: string;
  platform: string;
  maxTouchPoints: number;
  hasDeferred: boolean;
  standalone: boolean;
}): InstallEnvironment {
  const { ua, platform, maxTouchPoints, hasDeferred, standalone } = input;

  // 1. Already installed — wins over all. Never prompt.
  if (standalone) return { kind: "installed" };

  // 2. In-app browser — beats `promptable` and `ios-safari` because the
  //    host app can't install regardless of what the engine reports.
  if (isInAppBrowser(ua)) return { kind: "in-app-browser" };

  // 3. A captured beforeinstallprompt means a one-tap install is live.
  if (hasDeferred) return { kind: "promptable" };

  // 4. iOS Safari — the manual Share flow (no beforeinstallprompt on
  //    iOS). Excludes the WebKit-wrapping iOS browsers via isSafari.
  if (isIos(ua, platform, maxTouchPoints) && isSafari(ua)) {
    return { kind: "ios-safari" };
  }

  // 5. Manual pictured steps for a recognized browser.
  if (
    /Android|Mobile|Edg|SamsungBrowser|Firefox|Chrome|CriOS|FxiOS/.test(ua) ||
    isIos(ua, platform, maxTouchPoints)
  ) {
    return { kind: "manual", browser: detectBrowser(ua) };
  }

  // 6. We couldn't tell — the selector becomes the primary affordance.
  return { kind: "unknown" };
}

/**
 * Per-browser instruction table, keyed by i18n message keys (NOT
 * literal prose) so every string flows through the parity-checked
 * locale files. The component renders `t(labelKey)` / `t(introKey)`
 * and maps `stepKeys` through `t`.
 */
export const BROWSER_INSTRUCTIONS: Record<
  BrowserId,
  { labelKey: string; introKey: string; stepKeys: string[] }
> = {
  "ios-safari": {
    labelKey: "install.selector.browsers.iosSafari",
    introKey: "install.ios.intro",
    stepKeys: ["install.ios.step1", "install.ios.step2", "install.ios.step3"],
  },
  "chrome-android": {
    labelKey: "install.selector.browsers.chromeAndroid",
    introKey: "install.steps.chromeAndroid.intro",
    stepKeys: [
      "install.steps.chromeAndroid.step1",
      "install.steps.chromeAndroid.step2",
      "install.steps.chromeAndroid.step3",
    ],
  },
  samsung: {
    labelKey: "install.selector.browsers.samsung",
    introKey: "install.steps.samsung.intro",
    stepKeys: [
      "install.steps.samsung.step1",
      "install.steps.samsung.step2",
      "install.steps.samsung.step3",
    ],
  },
  "firefox-android": {
    labelKey: "install.selector.browsers.firefoxAndroid",
    introKey: "install.steps.firefoxAndroid.intro",
    stepKeys: [
      "install.steps.firefoxAndroid.step1",
      "install.steps.firefoxAndroid.step2",
      "install.steps.firefoxAndroid.step3",
    ],
  },
  "chrome-desktop": {
    labelKey: "install.selector.browsers.chromeDesktop",
    introKey: "install.steps.chromeDesktop.intro",
    stepKeys: [
      "install.steps.chromeDesktop.step1",
      "install.steps.chromeDesktop.step2",
      "install.steps.chromeDesktop.step3",
    ],
  },
  "edge-desktop": {
    labelKey: "install.selector.browsers.edgeDesktop",
    introKey: "install.steps.edgeDesktop.intro",
    stepKeys: [
      "install.steps.edgeDesktop.step1",
      "install.steps.edgeDesktop.step2",
      "install.steps.edgeDesktop.step3",
    ],
  },
};

/** The selectable browsers, in display order, for the "different
 *  browser?" picker. */
export const SELECTABLE_BROWSERS: readonly BrowserId[] = [
  "ios-safari",
  "chrome-android",
  "samsung",
  "firefox-android",
  "chrome-desktop",
  "edge-desktop",
] as const;

// --- Module-scope beforeinstallprompt capture ------------------------
// Chromium fires `beforeinstallprompt` early — often before any React
// tree that cares about it has mounted. So capture lives at module
// scope, installed once from main.tsx via `initInstallCapture()`, and
// the hook subscribes to changes. The captured event is replayed by
// the one-tap button.

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let captureInstalled = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const cb of listeners) cb();
}

/** Install the global `beforeinstallprompt` / `appinstalled` listeners
 *  exactly once. Safe to call in a non-DOM context (no-op). */
export function initInstallCapture(): void {
  if (typeof window === "undefined") return;
  if (captureInstalled) return;
  captureInstalled = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    // Suppress Chromium's default mini-infobar so the install moment
    // happens on the member's terms (in-app one-tap button), not as an
    // ambient browser nag.
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
    // They installed it — close the encouragement chapter permanently
    // so the card never resurfaces. Mirrors the nudges' self-retire.
    void dismissInstallGuide();
  });
}

/** The captured install event, or null if none is pending. */
export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

/** Forget the captured event (after it's been replayed — a prompt can
 *  only be used once). */
export function clearDeferredPrompt(): void {
  deferredPrompt = null;
  notify();
}

/** Subscribe to capture/clear changes. Returns an unsubscribe fn. */
export function subscribeInstallPrompt(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Subscribe to display-mode-standalone changes (e.g. the page becomes
 *  installed mid-session). Same shape as `theme.ts` `subscribeSystemTheme`.
 *  Returns an unsubscribe fn; no-op in non-DOM contexts. */
export function subscribeStandalone(cb: (standalone: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia("(display-mode: standalone)");
  const handler = (e: MediaQueryListEvent) => cb(e.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

// --- Live-globals wrapper --------------------------------------------

/** Read the live display-mode + navigator.standalone safely. */
function readStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayMode =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  // `navigator.standalone` is non-standard (iOS only) — narrow via cast
  // to stay strict-clean rather than widening the global Navigator type.
  const navStandalone =
    typeof navigator !== "undefined" &&
    (navigator as Navigator & NavigatorStandalone).standalone === true;
  return isStandalone(displayMode, navStandalone);
}

/** Detect the install environment from the live browser globals.
 *  Returns `unknown` in a non-DOM context so callers don't need to
 *  guard. */
export function currentInstallEnvironment(): InstallEnvironment {
  if (typeof navigator === "undefined") return { kind: "unknown" };
  return detectInstallEnvironment({
    ua: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    hasDeferred: getDeferredPrompt() !== null,
    standalone: readStandalone(),
  });
}

// --- Dexie dismiss sentinel ------------------------------------------
// Mirrors firstActionNudge.ts: a single per-device flag. The card on
// Board honors it for permanent dismissal; the panel in Learn ignores
// it (it's a re-findable reference, not a nag).

const DISMISSED_VALUE = "1";

export async function isInstallGuideDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.installGuideDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissInstallGuide(): Promise<void> {
  await setSetting(SETTING_KEYS.installGuideDismissed, DISMISSED_VALUE);
}
