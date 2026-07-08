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
  detectDesktopBrowser,
  detectDevice,
  detectInstallEnvironment,
  getDeferredPrompt,
  initInstallCapture,
  isIos,
  isSafari,
  type DeviceId,
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
  firefoxDesktop:
    "Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0",
  safariDesktop:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
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
      name: "iPhone Chrome (CriOS) → ios-other (only Safari installs on iOS)",
      in: input({ ua: UA.iphoneChrome }),
      expect: { kind: "ios-other" },
    },
    {
      name: "iPhone Firefox (FxiOS) → ios-other",
      in: input({ ua: UA.iphoneFirefox }),
      expect: { kind: "ios-other" },
    },
    {
      name: "iPhone Edge (EdgiOS) → ios-other",
      in: input({ ua: UA.iphoneEdge }),
      expect: { kind: "ios-other" },
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
      name: "Chrome Android without prompt → manual android",
      in: input({ ua: UA.chromeAndroid }),
      expect: { kind: "manual", device: "android" },
    },
    {
      name: "Samsung Internet → manual android",
      in: input({ ua: UA.samsungAndroid }),
      expect: { kind: "manual", device: "android" },
    },
    {
      name: "Firefox Android → manual android",
      in: input({ ua: UA.firefoxAndroid }),
      expect: { kind: "manual", device: "android" },
    },
    {
      name: "Chrome desktop → manual desktop, chromium-like",
      in: input({ ua: UA.chromeDesktop }),
      expect: { kind: "manual", device: "desktop", desktopBrowser: "chromium-like" },
    },
    {
      name: "Edge desktop → manual desktop, chromium-like",
      in: input({ ua: UA.edgeDesktop }),
      expect: { kind: "manual", device: "desktop", desktopBrowser: "chromium-like" },
    },
    {
      name: "Firefox desktop → manual desktop, firefox (no install icon exists — the honest-copy branch)",
      in: input({ ua: UA.firefoxDesktop }),
      expect: { kind: "manual", device: "desktop", desktopBrowser: "firefox" },
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
      name: "unrecognized UA → manual desktop (the catch-all device + family)",
      in: input({ ua: "SomeRandomCrawler/1.0" }),
      expect: { kind: "manual", device: "desktop", desktopBrowser: "chromium-like" },
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

describe("detectDevice", () => {
  // [ua, platform, maxTouchPoints, expected]. iOS wins first via isIos,
  // then an Android token, else the desktop catch-all.
  const expectations: Array<[string, string, number, DeviceId]> = [
    [UA.iphoneSafari, "iPhone", 5, "ios"],
    [UA.ipadOsAsMac, "MacIntel", 5, "ios"], // iPadOS-as-Mac is still iOS
    [UA.chromeAndroid, "", 0, "android"],
    [UA.samsungAndroid, "", 0, "android"],
    [UA.firefoxAndroid, "", 0, "android"],
    [UA.chromeDesktop, "Win32", 0, "desktop"],
    [UA.edgeDesktop, "Win32", 0, "desktop"],
  ];
  for (const [ua, platform, touch, expected] of expectations) {
    it(`returns ${expected}`, () => {
      expect(detectDevice(ua, platform, touch)).toBe(expected);
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

describe("detectDesktopBrowser", () => {
  it("Firefox desktop → firefox (Mozilla removed desktop web-app install)", () => {
    expect(detectDesktopBrowser(UA.firefoxDesktop)).toBe("firefox");
  });
  it("Safari on macOS → safari (File → Add to Dock, no address-bar icon)", () => {
    expect(detectDesktopBrowser(UA.safariDesktop)).toBe("safari");
  });
  it("Chrome desktop → chromium-like (the address-bar icon family)", () => {
    expect(detectDesktopBrowser(UA.chromeDesktop)).toBe("chromium-like");
  });
  it("Edge desktop → chromium-like (its UA carries Edg/ and Chrome)", () => {
    expect(detectDesktopBrowser(UA.edgeDesktop)).toBe("chromium-like");
  });
});
