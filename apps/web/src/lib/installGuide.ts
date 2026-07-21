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
import { isDesktopShell } from "@/lib/desktop";

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

/** The three device buckets we give manual install steps for. We pick a
 *  device — not a browser — because the per-browser copy collapses: a
 *  Chromium browser already gets a one-tap button from feature detection
 *  (no copy needed), iOS can only install via Safari (so the iOS branch
 *  is a single device), and the residual Android/desktop steps are
 *  generic enough to be one instruction set each. `desktop` is the
 *  catch-all. */
export type DeviceId = "ios" | "android" | "desktop";

/** The detected install posture. First-match-wins, classified by
 *  `detectInstallEnvironment` below. `installed` always wins. The
 *  `manual` branch always carries a best-guess device; the panel's
 *  device toggle lets the member correct a misdetection. */
export type InstallEnvironment =
  | { kind: "installed" }
  // One-tap install is live. Carries the device bucket so surfaces can
  // phrase the moment for the hardware in hand — "home screen" on a
  // phone, "install as an app" on a computer (a promptable Android
  // Chrome member was reading desktop copy before this).
  | { kind: "promptable"; device: DeviceId }
  | { kind: "ios-safari" }
  | { kind: "ios-other" } // iOS on a non-Safari browser — only Safari can install on iOS
  | { kind: "in-app-browser" }
  // android/desktop generic steps. `desktopBrowser` is set on the
  // desktop bucket only, because desktop install support genuinely
  // FORKS by browser (pilot report: a Firefox user was told to find
  // an install icon that Firefox does not have):
  //   chromium-like — the address-bar install icon exists
  //   safari        — File → Add to Dock (macOS Sonoma+), no icon
  //   firefox       — no desktop web-app install at all; the honest
  //                   copy says so instead of sending them hunting
  | { kind: "manual"; device: DeviceId; desktopBrowser?: DesktopBrowser };

/** Desktop browser families whose install affordances differ. Only
 *  consulted for the desktop manual bucket — mobile copy is generic. */
export type DesktopBrowser = "chromium-like" | "safari" | "firefox";

/** Classify a DESKTOP user agent by install affordance. Firefox first
 *  (its UA also contains no Chrome token); Safari via the existing
 *  wrapped-engine-aware predicate plus a Chromium exclusion (Chrome's
 *  UA contains "Safari"); everything else is treated as
 *  chromium-like, the address-bar-icon family. */
export function detectDesktopBrowser(ua: string): DesktopBrowser {
  if (/Firefox\//.test(ua)) return "firefox";
  if (isSafari(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return "safari";
  return "chromium-like";
}

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

/** Best-effort device bucket for the manual-steps branch. iOS (incl.
 *  iPadOS-as-Mac) wins first via `isIos`; then an explicit Android
 *  token; then a coarse-pointer catch: a browser whose UA claims
 *  desktop but whose PRIMARY pointer is a finger is a phone lying
 *  about itself ("Request desktop site" mode) — it must never be told
 *  to hunt for an address-bar install icon, so it lands in the
 *  `android` bucket, whose generic browser-menu steps are the honest
 *  fit (iOS was already caught above). Touch-screen laptops are safe:
 *  their primary pointer reports `fine`. Everything else is `desktop`,
 *  the catch-all; the panel's device toggle lets the member correct a
 *  misdetection. */
export function detectDevice(
  ua: string,
  platform: string,
  maxTouchPoints: number,
  coarsePointer = false,
): DeviceId {
  if (isIos(ua, platform, maxTouchPoints)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (coarsePointer) return "android";
  return "desktop";
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
  /** True when the primary pointer is a finger (`(pointer: coarse)`)
   *  — the UA-independent signal that unmasks a phone browsing in
   *  "desktop site" mode. Optional so non-DOM callers and older tests
   *  don't have to care; defaults to false (trust the UA). */
  coarsePointer?: boolean;
}): InstallEnvironment {
  const {
    ua,
    platform,
    maxTouchPoints,
    hasDeferred,
    standalone,
    coarsePointer = false,
  } = input;

  // 1. Already installed — wins over all. Never prompt.
  if (standalone) return { kind: "installed" };

  // 2. In-app browser — beats `promptable` and `ios-safari` because the
  //    host app can't install regardless of what the engine reports.
  if (isInAppBrowser(ua)) return { kind: "in-app-browser" };

  // 3. A captured beforeinstallprompt means a one-tap install is live.
  //    Carry the device bucket so the surfaces phrase the moment for
  //    the hardware in hand (home screen vs. install-as-an-app).
  if (hasDeferred) {
    return {
      kind: "promptable",
      device: detectDevice(ua, platform, maxTouchPoints, coarsePointer),
    };
  }

  // 4. iOS Safari — the manual Share flow (no beforeinstallprompt on
  //    iOS). Excludes the WebKit-wrapping iOS browsers via isSafari.
  if (isIos(ua, platform, maxTouchPoints) && isSafari(ua)) {
    return { kind: "ios-safari" };
  }

  // 5. iOS on a non-Safari browser — on iOS only Safari can add to the
  //    home screen, so there are no pictured steps to give; the only
  //    move is "open this in Safari".
  if (isIos(ua, platform, maxTouchPoints)) {
    return { kind: "ios-other" };
  }

  // 6. Everything else gets generic manual steps for its device bucket.
  //    iOS was handled above, so detectDevice resolves to android or
  //    desktop here; the panel's device toggle covers a misdetection.
  //    Desktop additionally carries the browser family, because the
  //    install affordance forks by browser there (see the type).
  const device = detectDevice(ua, platform, maxTouchPoints, coarsePointer);
  if (device === "desktop") {
    return { kind: "manual", device, desktopBrowser: detectDesktopBrowser(ua) };
  }
  return { kind: "manual", device };
}

/**
 * Per-device instruction table, keyed by i18n message keys (NOT literal
 * prose) so every string flows through the parity-checked locale files.
 * The component renders `t(labelKey)` / `t(introKey)` and maps
 * `stepKeys` through `t`. The `ios` entry reuses the Safari Share steps
 * (the only way to install on iOS).
 */
export const DEVICE_INSTRUCTIONS: Record<
  DeviceId,
  { labelKey: string; introKey: string; stepKeys: string[] }
> = {
  ios: {
    labelKey: "install.devicePicker.ios",
    introKey: "install.ios.intro",
    stepKeys: ["install.ios.step1", "install.ios.step2", "install.ios.step3"],
  },
  android: {
    labelKey: "install.devicePicker.android",
    introKey: "install.android.intro",
    stepKeys: [
      "install.android.step1",
      "install.android.step2",
      "install.android.step3",
    ],
  },
  desktop: {
    labelKey: "install.devicePicker.desktop",
    introKey: "install.desktop.intro",
    stepKeys: [
      "install.desktop.step1",
      "install.desktop.step2",
      "install.desktop.step3",
    ],
  },
};

/** The selectable devices, in display order, for the "different
 *  device?" toggle. */
export const SELECTABLE_DEVICES: readonly DeviceId[] = [
  "ios",
  "android",
  "desktop",
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
 *  Returns the desktop manual fallback in a non-DOM context (the
 *  catch-all device) so callers don't need to guard. */
export function currentInstallEnvironment(): InstallEnvironment {
  if (typeof navigator === "undefined") {
    return { kind: "manual", device: "desktop" };
  }
  // The desktop shell (AppImage) IS the installed app — it must never
  // classify as "desktop browser" and nag about installing itself.
  if (isDesktopShell()) return { kind: "installed" };
  return detectInstallEnvironment({
    ua: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    hasDeferred: getDeferredPrompt() !== null,
    standalone: readStandalone(),
    coarsePointer:
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches,
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
