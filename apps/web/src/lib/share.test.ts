/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canShareUrl, copyTextToClipboard, shareUrl } from "./share";

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

  it("url-only callers keep the original typed-url shape (no text to shadow it)", async () => {
    // Post/event/project/task links pass only url+title. The typed
    // `url` field is what iOS URL-consuming targets and PWA
    // share_target manifests bind to — it must be present, and no
    // redundant text copy should be added (targets that concatenate
    // both would render the link twice).
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share });
    const result = await shareUrl({ url: "https://example.test/x" });
    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: undefined,
      url: "https://example.test/x",
    });
  });

  it("with a message, the link rides in BOTH text and the typed url field", async () => {
    // The invariant is "the link always survives", not any particular
    // field shape: embedding the url in text defeats the share-sheet
    // Copy actions that read only `text` (desktop Chrome/Edge), while
    // the typed `url` field keeps link previews and url-only share
    // targets working. Asserting the absence of `url` here previously
    // hard-coded a platform regression — never do that again.
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigator({ share });
    const result = await shareUrl({
      url: "https://example.test/invite#abc",
      title: "Join my community",
      text: "I'm inviting you to join my community.",
    });
    expect(result).toBe("shared");
    const arg = share.mock.calls[0][0] as ShareData;
    expect(arg.url).toBe("https://example.test/invite#abc");
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

describe("share — copyTextToClipboard", () => {
  // jsdom never implements document.execCommand, so the sync path is
  // exercised by defining it explicitly and removed again after.
  function setExecCommand(impl: (() => boolean) | undefined) {
    if (impl) {
      Object.defineProperty(document, "execCommand", {
        value: impl,
        configurable: true,
        writable: true,
      });
    } else {
      delete (document as { execCommand?: unknown }).execCommand;
    }
  }

  afterEach(() => {
    setExecCommand(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: ORIGINAL_NAVIGATOR,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it("prefers the synchronous execCommand path — the async Clipboard API can lie on iOS PWAs", async () => {
    // The 2026-07 field report: navigator.clipboard.writeText resolves
    // OK on iOS installed-PWA builds WITHOUT writing anything, so the
    // app said "copied" while the clipboard held stale content. The
    // honest execCommand boolean must win when it's available.
    const exec = vi.fn(() => true);
    setExecCommand(exec);
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });

    expect(await copyTextToClipboard("https://example.test/invite#t")).toBe(
      "copied",
    );
    expect(exec).toHaveBeenCalledWith("copy");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to the async Clipboard API when execCommand refuses", async () => {
    setExecCommand(() => false);
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });

    expect(await copyTextToClipboard("hello")).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("reports failure honestly when every path is gone", async () => {
    setExecCommand(undefined);
    setNavigator({});
    expect(await copyTextToClipboard("hello")).toBe("failed");
  });

  it("puts the text into the selection textarea (what execCommand copies)", async () => {
    let selectedValue: string | null = null;
    setExecCommand(function (this: Document) {
      selectedValue =
        document.activeElement instanceof HTMLTextAreaElement
          ? document.activeElement.value
          : null;
      return true;
    });
    setNavigator({});
    await copyTextToClipboard("https://example.test/invite#tok");
    expect(selectedValue).toBe("https://example.test/invite#tok");
    // The scratch textarea must not linger in the DOM.
    expect(document.querySelector("textarea")).toBeNull();
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
