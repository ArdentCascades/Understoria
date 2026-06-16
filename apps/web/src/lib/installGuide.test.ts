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
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearDeferredPrompt,
  detectBrowser,
  detectInstallEnvironment,
  getDeferredPrompt,
  initInstallCapture,
  isIos,
  isSafari,
  type BrowserId,
  type InstallEnvironment,
} from "./installGuide";

// Representative real-world UA strings. Kept here so the matrix below
// reads as "this device → this posture" rather than burying intent in
// inline literals.
const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.111 Mobile/15E148 Safari/604.1",
  iphoneFirefox:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/126.0 Mobile/15E148 Safari/605.1.15",
  iphoneEdge:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 EdgiOS/124.0.2478.89 Mobile/15E148 Safari/604.1",
  ipadOsAsMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  chromeAndroid:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  samsungAndroid:
    "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/117.0.0.0 Mobile Safari/537.36",
  firefoxAndroid:
    "Mozilla/5.0 (Android 14; Mobile; rv:126.0) Gecko/126.0 Firefox/126.0",
  chromeDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  edgeDesktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80",
  facebook:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/456.0.0]",
  instagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 320.0.0.0",
  whatsapp:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36 WhatsApp/2.24",
  androidWebView:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36",
} as const;

/** Build a `detectInstallEnvironment` input with sensible defaults so
 *  each case only states what it cares about. */
function input(
  overrides: Partial<Parameters<typeof detectInstallEnvironment>[0]> & {
    ua: string;
  },
): Parameters<typeof detectInstallEnvironment>[0] {
  return {
    platform: "",
    maxTouchPoints: 0,
    hasDeferred: false,
    standalone: false,
    ...overrides,
  };
}

describe("detectInstallEnvironment", () => {
  const cases: Array<{
    name: string;
    in: Parameters<typeof detectInstallEnvironment>[0];
    expect: InstallEnvironment;
  }> = [
    {
      name: "iPhone Safari → ios-safari",
      in: input({ ua: UA.iphoneSafari }),
      expect: { kind: "ios-safari" },
    },
    {
      name: "iPhone Chrome (CriOS) → NOT ios-safari (manual)",
      in: input({ ua: UA.iphoneChrome }),
      expect: { kind: "manual", browser: "chrome-desktop" },
    },
    {
      name: "iPhone Firefox (FxiOS) → NOT ios-safari (manual)",
      in: input({ ua: UA.iphoneFirefox }),
      expect: { kind: "manual", browser: "chrome-desktop" },
    },
    {
      name: "iPhone Edge (EdgiOS) → NOT ios-safari (Edg → edge-desktop)",
      in: input({ ua: UA.iphoneEdge }),
      expect: { kind: "manual", browser: "edge-desktop" },
    },
    {
      name: "iPadOS-as-Mac (MacIntel + touch) Safari → ios-safari",
      in: input({
        ua: UA.ipadOsAsMac,
        platform: "MacIntel",
        maxTouchPoints: 5,
      }),
      expect: { kind: "ios-safari" },
    },
    {
      name: "Chrome Android with deferred prompt → promptable",
      in: input({ ua: UA.chromeAndroid, hasDeferred: true }),
      expect: { kind: "promptable" },
    },
    {
      name: "Chrome Android without prompt → manual chrome-android",
      in: input({ ua: UA.chromeAndroid }),
      expect: { kind: "manual", browser: "chrome-android" },
    },
    {
      name: "Samsung Internet → manual samsung",
      in: input({ ua: UA.samsungAndroid }),
      expect: { kind: "manual", browser: "samsung" },
    },
    {
      name: "Firefox Android → manual firefox-android",
      in: input({ ua: UA.firefoxAndroid }),
      expect: { kind: "manual", browser: "firefox-android" },
    },
    {
      name: "Chrome desktop → manual chrome-desktop",
      in: input({ ua: UA.chromeDesktop }),
      expect: { kind: "manual", browser: "chrome-desktop" },
    },
    {
      name: "Edge desktop → manual edge-desktop",
      in: input({ ua: UA.edgeDesktop }),
      expect: { kind: "manual", browser: "edge-desktop" },
    },
    {
      name: "Facebook in-app (FBAN) → in-app-browser",
      in: input({ ua: UA.facebook }),
      expect: { kind: "in-app-browser" },
    },
    {
      name: "Instagram in-app → in-app-browser",
      in: input({ ua: UA.instagram }),
      expect: { kind: "in-app-browser" },
    },
    {
      name: "WhatsApp in-app → in-app-browser",
      in: input({ ua: UA.whatsapp }),
      expect: { kind: "in-app-browser" },
    },
    {
      name: "generic Android WebView (; wv) → in-app-browser",
      in: input({ ua: UA.androidWebView }),
      expect: { kind: "in-app-browser" },
    },
    {
      name: "unrecognized UA → unknown",
      in: input({ ua: "SomeRandomCrawler/1.0" }),
      expect: { kind: "unknown" },
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      expect(detectInstallEnvironment(c.in)).toEqual(c.expect);
    });
  }

  it("in-app-browser BEATS promptable", () => {
    expect(
      detectInstallEnvironment(
        input({ ua: UA.whatsapp, hasDeferred: true }),
      ),
    ).toEqual({ kind: "in-app-browser" });
  });

  it("in-app-browser BEATS ios-safari (Instagram on iOS)", () => {
    expect(detectInstallEnvironment(input({ ua: UA.instagram }))).toEqual({
      kind: "in-app-browser",
    });
  });

  it("standalone=true → installed regardless of UA", () => {
    expect(
      detectInstallEnvironment(
        input({ ua: UA.iphoneSafari, standalone: true }),
      ),
    ).toEqual({ kind: "installed" });
    expect(
      detectInstallEnvironment(
        // Even inside an in-app browser with a deferred prompt, an
        // already-installed display-mode wins over everything.
        input({ ua: UA.whatsapp, hasDeferred: true, standalone: true }),
      ),
    ).toEqual({ kind: "installed" });
  });
});

describe("isIos", () => {
  it("detects iPhone UA", () => {
    expect(isIos(UA.iphoneSafari, "iPhone", 5)).toBe(true);
  });
  it("detects iPadOS-as-Mac (MacIntel + maxTouchPoints>1)", () => {
    expect(isIos(UA.ipadOsAsMac, "MacIntel", 5)).toBe(true);
  });
  it("does NOT treat a real Mac (no touch) as iOS", () => {
    expect(isIos(UA.ipadOsAsMac, "MacIntel", 0)).toBe(false);
  });
  it("does NOT treat Android as iOS", () => {
    expect(isIos(UA.chromeAndroid, "", 5)).toBe(false);
  });
});

describe("isSafari", () => {
  it("is true for real iPhone Safari", () => {
    expect(isSafari(UA.iphoneSafari)).toBe(true);
  });
  it("is false for CriOS / FxiOS / EdgiOS", () => {
    expect(isSafari(UA.iphoneChrome)).toBe(false);
    expect(isSafari(UA.iphoneFirefox)).toBe(false);
    expect(isSafari(UA.iphoneEdge)).toBe(false);
  });
});

describe("detectBrowser", () => {
  const expectations: Array<[string, BrowserId]> = [
    [UA.samsungAndroid, "samsung"],
    [UA.firefoxAndroid, "firefox-android"],
    [UA.chromeAndroid, "chrome-android"],
    [UA.chromeDesktop, "chrome-desktop"],
    [UA.edgeDesktop, "edge-desktop"],
  ];
  for (const [ua, expected] of expectations) {
    it(`returns ${expected}`, () => {
      expect(detectBrowser(ua)).toBe(expected);
    });
  }
});

describe("beforeinstallprompt capture", () => {
  afterEach(() => {
    clearDeferredPrompt();
    vi.restoreAllMocks();
  });

  it("captures the event and honors preventDefault", () => {
    initInstallCapture();
    expect(getDeferredPrompt()).toBeNull();

    const event = new Event("beforeinstallprompt");
    const preventDefault = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(getDeferredPrompt()).not.toBeNull();
  });

  it("clears the captured event on appinstalled", () => {
    initInstallCapture();
    window.dispatchEvent(new Event("beforeinstallprompt"));
    expect(getDeferredPrompt()).not.toBeNull();

    window.dispatchEvent(new Event("appinstalled"));
    expect(getDeferredPrompt()).toBeNull();
  });
});
