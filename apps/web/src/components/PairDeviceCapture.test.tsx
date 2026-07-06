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

const ENVELOPE = "dGVzdC1lbnZlbG9wZS1ieXRlcw";

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
