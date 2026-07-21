// The share-origin contract (docs/desktop-appimage.md §4): on the
// web, shareOrigin() is exactly window.location.origin; in the
// desktop shell it is the community's public origin derived from the
// configured node URL — the inverse of nodeOriginSuggest's
// `${origin}/api` derivation.
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deriveAppOriginFromNodeUrl,
  primeShareOrigin,
  shareOrigin,
} from "./appOrigin";
import * as desktop from "./desktop";

afterEach(() => {
  primeShareOrigin(null);
  vi.restoreAllMocks();
});

describe("deriveAppOriginFromNodeUrl", () => {
  it("strips a single trailing /api (the Caddyfile deployment shape)", () => {
    expect(deriveAppOriginFromNodeUrl("https://commons.example/api")).toBe(
      "https://commons.example",
    );
    expect(deriveAppOriginFromNodeUrl("https://commons.example/api/")).toBe(
      "https://commons.example",
    );
  });

  it("keeps a bare LAN node URL as-is", () => {
    expect(deriveAppOriginFromNodeUrl("http://192.168.1.20:8080")).toBe(
      "http://192.168.1.20:8080",
    );
  });

  it("keeps non-api path prefixes (a node behind a subpath)", () => {
    expect(
      deriveAppOriginFromNodeUrl("https://coop.example/understoria/api"),
    ).toBe("https://coop.example/understoria");
  });

  it("rejects unparsable and non-http(s) values", () => {
    expect(deriveAppOriginFromNodeUrl("")).toBeNull();
    expect(deriveAppOriginFromNodeUrl("not a url")).toBeNull();
    expect(deriveAppOriginFromNodeUrl("file:///etc")).toBeNull();
    expect(deriveAppOriginFromNodeUrl("app://understoria/api")).toBeNull();
  });
});

describe("shareOrigin", () => {
  it("is window.location.origin on the web, regardless of priming", () => {
    primeShareOrigin("https://elsewhere.example/api");
    expect(shareOrigin()).toBe(window.location.origin);
  });

  it("uses the derived node origin in the desktop shell", () => {
    vi.spyOn(desktop, "isDesktopShell").mockReturnValue(true);
    primeShareOrigin("https://commons.example/api");
    expect(shareOrigin()).toBe("https://commons.example");
  });

  it("falls back to location.origin in an unconnected desktop shell", () => {
    vi.spyOn(desktop, "isDesktopShell").mockReturnValue(true);
    primeShareOrigin(null);
    expect(shareOrigin()).toBe(window.location.origin);
  });

  it("clears the cache when the node URL is removed or invalid", () => {
    vi.spyOn(desktop, "isDesktopShell").mockReturnValue(true);
    primeShareOrigin("https://commons.example/api");
    primeShareOrigin("");
    expect(shareOrigin()).toBe(window.location.origin);
  });
});
