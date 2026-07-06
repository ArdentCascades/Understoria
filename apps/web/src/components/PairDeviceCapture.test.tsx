/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * PairDeviceCapture — the same-phone mode contract:
 *   - samePhone starts in copy/paste mode: numbered steps, a one-tap
 *     paste button, and NO camera request
 *   - the paste button reads the clipboard and hands the trimmed text
 *     to onCaptured; denial degrades to an honest hint (the manual
 *     paste box stays available)
 *   - both modes can switch to the other via a text link
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { PairDeviceCapture } from "./PairDeviceCapture";

// Structurally valid envelope — capture now validates with
// decodeEnvelope before advancing, so the fixture must decode.
const ENVELOPE = btoa(
  JSON.stringify({
    v: 1,
    alg: "test",
    salt: "c2FsdA==",
    nonce: "bm9uY2U=",
    ciphertext: "Y2lwaGVydGV4dA==",
    expiresAt: 4102444800000,
  }),
);

let container: HTMLDivElement;
let root: Root;
let readText: ReturnType<typeof vi.fn>;
let onCaptured: ReturnType<typeof vi.fn<(encoded: string) => void>>;
let onCancel: ReturnType<typeof vi.fn<() => void>>;

function renderCapture(samePhone: boolean) {
  act(() => {
    root.render(
      <PairDeviceCapture
        onCaptured={onCaptured}
        onCancel={onCancel}
        samePhone={samePhone}
      />,
    );
  });
}

function clickByText(text: string) {
  const el = Array.from(container.querySelectorAll("button")).find((b) =>
    (b.textContent ?? "").includes(text),
  );
  expect(el, `button containing "${text}"`).toBeDefined();
  act(() => {
    el!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

const flush = () => act(async () => {});

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  readText = vi.fn().mockResolvedValue(ENVELOPE);
  onCaptured = vi.fn();
  onCancel = vi.fn();
  Object.defineProperty(navigator, "clipboard", {
    value: { readText },
    configurable: true,
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("PairDeviceCapture — same-phone mode", () => {
  it("renders the same-phone steps and never asks for the camera", () => {
    renderCapture(true);
    expect(container.textContent).toContain(
      "Bring your identity over from this phone's browser",
    );
    // Four numbered steps, browser-first.
    const items = container.querySelectorAll("ol li");
    expect(items.length).toBe(4);
    // No camera surface in any of its three states.
    expect(container.textContent).not.toContain("camera");
    expect(container.textContent).not.toContain("Camera");
    expect(container.querySelector("video")).toBeNull();
  });

  it("one-tap paste reads the clipboard and captures the trimmed text", async () => {
    readText.mockResolvedValue(`  ${ENVELOPE}\n`);
    renderCapture(true);
    clickByText("Paste pairing code");
    await flush();
    expect(onCaptured).toHaveBeenCalledTimes(1);
    expect(onCaptured).toHaveBeenCalledWith(ENVELOPE);
  });

  it("clipboard denial shows the manual-paste hint instead of failing silently", async () => {
    readText.mockRejectedValue(new Error("denied"));
    renderCapture(true);
    clickByText("Paste pairing code");
    await flush();
    expect(onCaptured).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Couldn't read the clipboard");
    // The manual paste box is right there as the fallback.
    expect(container.querySelector("textarea#pair-paste")).not.toBeNull();
  });

  it("an empty clipboard counts as a failure, not an empty capture", async () => {
    readText.mockResolvedValue("   ");
    renderCapture(true);
    clickByText("Paste pairing code");
    await flush();
    expect(onCaptured).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Couldn't read the clipboard");
  });

  it("clipboard text that isn't a pairing code shows the invalid-code error instead of advancing", async () => {
    readText.mockResolvedValue("https://example.com/some-link");
    renderCapture(true);
    clickByText("Paste pairing code");
    await flush();
    expect(onCaptured).not.toHaveBeenCalled();
    expect(container.textContent).toContain(
      "That doesn't look like a pairing code",
    );
  });

  it("a clipboard read that hangs (iOS standalone) times out into the manual-paste hint", async () => {
    vi.useFakeTimers();
    try {
      readText.mockImplementation(() => new Promise(() => {}));
      renderCapture(true);
      clickByText("Paste pairing code");
      // The button goes busy while the read is pending…
      expect(container.textContent).toContain("Working");
      // …and the 3s bound converts the hang into the visible fallback.
      await act(async () => {
        vi.advanceTimersByTime(3100);
      });
      expect(onCaptured).not.toHaveBeenCalled();
      expect(container.textContent).toContain("Couldn't read the clipboard");
      expect(container.textContent).not.toContain("Working");
    } finally {
      vi.useRealTimers();
    }
  });

  it("pasting a valid code into the box captures immediately — no Continue tap", () => {
    renderCapture(true);
    const textarea = container.querySelector(
      "textarea#pair-paste",
    ) as HTMLTextAreaElement;
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => `  ${ENVELOPE}\n` },
    });
    act(() => {
      textarea.dispatchEvent(event);
    });
    expect(onCaptured).toHaveBeenCalledTimes(1);
    expect(onCaptured).toHaveBeenCalledWith(ENVELOPE);
  });

  it("submitting garbage via Continue shows the invalid-code error", () => {
    renderCapture(true);
    const textarea = container.querySelector(
      "textarea#pair-paste",
    ) as HTMLTextAreaElement;
    act(() => {
      // React reads value through the native setter; simulate typing.
      const setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )!.set!;
      setter.call(textarea, "not-a-pairing-code");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    clickByText("Continue");
    expect(onCaptured).not.toHaveBeenCalled();
    expect(container.textContent).toContain(
      "That doesn't look like a pairing code",
    );
  });

  it("switches to scan mode via the link", () => {
    renderCapture(true);
    clickByText("Scan its QR instead");
    expect(container.textContent).toContain(
      "Need a QR? Get one from your other device.",
    );
  });
});

describe("PairDeviceCapture — scan mode", () => {
  it("defaults to scan mode with a link over to the same-phone steps", () => {
    renderCapture(false);
    expect(container.textContent).toContain(
      "Need a QR? Get one from your other device.",
    );
    clickByText("Follow the same-phone steps instead");
    expect(container.textContent).toContain(
      "Bring your identity over from this phone's browser",
    );
    expect(container.querySelector("video")).toBeNull();
  });
});
