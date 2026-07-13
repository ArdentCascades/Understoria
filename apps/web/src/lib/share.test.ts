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

  it("navigator.share resolves → 'shared' (url-only → shares the bare url as text)", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: undefined,
      text: "https://example.test/x",
    });
  });

  it("folds the url into the shared text so 'Copy' can't drop the link", async () => {
    // Regression guard: passing a separate `url` field alongside `text`
    // let some platforms' share-sheet "Copy" copy only the message and
    // drop the link. The URL must be embedded in the text, and no bare
    // `url` field should be passed for a target to discard.
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share });
    const result = await shareUrl({
      url: "https://example.test/invite#abc",
      title: "Join my community",
      text: "I'm inviting you to join my community.",
    });
    expect(result).toBe("shared");
    const arg = share.mock.calls[0][0] as ShareData;
    expect(arg.url).toBeUndefined();
    expect(arg.title).toBe("Join my community");
    expect(arg.text).toContain("I'm inviting you to join my community.");
    expect(arg.text).toContain("https://example.test/invite#abc");
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
