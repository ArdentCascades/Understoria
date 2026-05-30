/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canShareUrl, shareUrl } from "./share";

type NavigatorShape = {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText?: (text: string) => Promise<void> };
};

const ORIGINAL_NAVIGATOR = globalThis.navigator;

function setNavigator(shape: NavigatorShape) {
  Object.defineProperty(globalThis, "navigator", {
    value: shape,
    configurable: true,
    writable: true,
  });
}

describe("share — shareUrl", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: ORIGINAL_NAVIGATOR,
      configurable: true,
      writable: true,
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("navigator.share resolves → 'shared'", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledWith({
      url: "https://example.test/x",
      title: undefined,
      text: undefined,
    });
  });

  it("navigator.share rejects with AbortError → 'cancelled' (no fallback)", async () => {
    const abort = new Error("user dismissed");
    abort.name = "AbortError";
    const share = vi.fn().mockRejectedValue(abort);
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share, clipboard: { writeText } });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("navigator.share rejects with non-AbortError → falls back to clipboard → 'copied'", async () => {
    const share = vi.fn().mockRejectedValue(new Error("not allowed"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share, clipboard: { writeText } });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://example.test/x");
  });

  it("navigator.share undefined → falls back to clipboard → 'copied'", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://example.test/x");
  });

  it("clipboard rejects → 'failed'", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("blocked"));
    setNavigator({ clipboard: { writeText } });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("failed");
  });

  it("no clipboard available → 'failed'", async () => {
    setNavigator({});
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("failed");
  });
});

describe("share — canShareUrl", () => {
  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: ORIGINAL_NAVIGATOR,
      configurable: true,
      writable: true,
    });
  });

  it("returns true when navigator.share exists", () => {
    setNavigator({ share: vi.fn() });
    expect(canShareUrl()).toBe(true);
  });

  it("returns true when only clipboard.writeText exists", () => {
    setNavigator({ clipboard: { writeText: vi.fn() } });
    expect(canShareUrl()).toBe(true);
  });

  it("returns true when both exist", () => {
    setNavigator({ share: vi.fn(), clipboard: { writeText: vi.fn() } });
    expect(canShareUrl()).toBe(true);
  });

  it("returns false when neither exists", () => {
    setNavigator({});
    expect(canShareUrl()).toBe(false);
  });

  it("returns false when clipboard exists but writeText doesn't", () => {
    setNavigator({ clipboard: {} });
    expect(canShareUrl()).toBe(false);
  });
});
