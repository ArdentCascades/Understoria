/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The splash's honest-timeout behavior (the eternal-"Growing your
// community…" field report): patience first, and past the stuck
// threshold the recovery guidance appears — the fully-close-the-app
// instruction and a retry button — while the growing line stays, so
// a boot that completes late still reads coherently.
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { Splash } from "./Splash";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.useRealTimers();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
}

describe("Splash", () => {
  it("shows only the growing line at first", () => {
    render(<Splash />);
    expect(container.textContent).toContain("Growing your community...");
    expect(container.querySelector("button")).toBeNull();
    expect(container.textContent).not.toContain("storage isn't answering");
  });

  it("stays patient just under the threshold", () => {
    render(<Splash />);
    act(() => {
      vi.advanceTimersByTime(9_500);
    });
    expect(container.querySelector("button")).toBeNull();
  });

  it("turns honest after ten quiet seconds", () => {
    render(<Splash />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(container.textContent).toContain(
      "The device's storage isn't answering.",
    );
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect((button!.textContent ?? "").trim()).toBe("Try again");
    // The growing line stays — a boot that finishes late still reads
    // coherently, and the parent unmounts us on ready either way.
    expect(container.textContent).toContain("Growing your community...");
  });
});
