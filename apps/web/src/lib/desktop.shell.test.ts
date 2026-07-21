// The desktop-shell guards: the install guide must read "installed"
// and passkeys must read "unsupported" inside the AppImage shell
// (docs/desktop-appimage.md §4). isDesktopShell itself is trivially
// protocol-based; these tests pin the two behaviors that hang off it.
import { afterEach, describe, expect, it, vi } from "vitest";
import * as desktop from "./desktop";
import { currentInstallEnvironment } from "./installGuide";
import { supportsPasskeys } from "./passkeyUnlock";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isDesktopShell", () => {
  it("is false under jsdom's http origin", () => {
    expect(desktop.isDesktopShell()).toBe(false);
  });
});

describe("desktop-shell guards", () => {
  it("install environment short-circuits to installed in the shell", () => {
    vi.spyOn(desktop, "isDesktopShell").mockReturnValue(true);
    expect(currentInstallEnvironment()).toEqual({ kind: "installed" });
  });

  it("install environment is unchanged outside the shell", () => {
    // jsdom: no deferred prompt, not standalone → some non-installed
    // classification; the exact kind is installGuide.test.ts's job.
    expect(currentInstallEnvironment().kind).not.toBe("installed");
  });

  it("passkeys are unsupported in the shell even where WebAuthn exists", () => {
    vi.spyOn(desktop, "isDesktopShell").mockReturnValue(true);
    vi.stubGlobal("PublicKeyCredential", class {});
    expect(supportsPasskeys()).toBe(false);
    vi.unstubAllGlobals();
  });
});
