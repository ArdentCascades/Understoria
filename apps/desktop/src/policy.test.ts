import { describe, expect, it } from "vitest";
import {
  decideWindowOpen,
  isExternalOpenable,
  isInternalNavigation,
  isPermissionAllowed,
} from "./policy.js";

describe("isPermissionAllowed", () => {
  it("allows exactly the named capabilities", () => {
    for (const p of [
      "media",
      "clipboard-read",
      "clipboard-sanitized-write",
      "screen-wake-lock",
    ]) {
      expect(isPermissionAllowed(p)).toBe(true);
    }
  });

  it("denies everything else by default", () => {
    for (const p of [
      "geolocation",
      "notifications",
      "midi",
      "pointerLock",
      "fullscreen",
      "openExternal",
      "unknown-future-permission",
    ]) {
      expect(isPermissionAllowed(p)).toBe(false);
    }
  });
});

describe("decideWindowOpen", () => {
  it("allows the about:blank print popup", () => {
    expect(decideWindowOpen("about:blank")).toBe("allow-blank");
    expect(decideWindowOpen("")).toBe("allow-blank");
  });

  it("sends web links to the system browser", () => {
    expect(decideWindowOpen("https://example.coop/help")).toBe("external");
    expect(decideWindowOpen("http://192.168.1.20/invite")).toBe("external");
    expect(decideWindowOpen("mailto:op@example.coop")).toBe("external");
  });

  it("denies everything else, including app:// child windows", () => {
    expect(decideWindowOpen("app://understoria/board")).toBe("deny");
    expect(decideWindowOpen("file:///etc/passwd")).toBe("deny");
    expect(decideWindowOpen("understoria://x")).toBe("deny");
    expect(decideWindowOpen("javascript:alert(1)")).toBe("deny");
  });
});

describe("isInternalNavigation", () => {
  it("accepts only the app scheme", () => {
    expect(isInternalNavigation("app://understoria/calendar")).toBe(true);
    expect(isInternalNavigation("https://example.coop")).toBe(false);
    expect(isInternalNavigation("file:///x")).toBe(false);
    expect(isInternalNavigation("not a url")).toBe(false);
  });
});

describe("isExternalOpenable", () => {
  it("opens only web and mail links", () => {
    expect(isExternalOpenable("https://example.coop")).toBe(true);
    expect(isExternalOpenable("http://10.0.0.5:8080")).toBe(true);
    expect(isExternalOpenable("mailto:a@b.c")).toBe(true);
  });

  it("never hands file: or foreign custom schemes to the OS", () => {
    expect(isExternalOpenable("file:///etc/passwd")).toBe(false);
    expect(isExternalOpenable("smb://server/share")).toBe(false);
    expect(isExternalOpenable("vscode://open")).toBe(false);
    expect(isExternalOpenable("garbage")).toBe(false);
  });
});
