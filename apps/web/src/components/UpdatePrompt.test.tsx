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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the vite-plugin-pwa virtual module — there is no real service
// worker in jsdom. `mockNeedRefresh` drives what the hook reports;
// `onOfflineReadyCb` lets a test fire the offline-ready callback.
const { updateServiceWorkerMock, showToastMock } = vi.hoisted(() => ({
  updateServiceWorkerMock: vi.fn(async () => {}),
  showToastMock: vi.fn(),
}));

let mockNeedRefresh = false;
let onOfflineReadyCb: (() => void) | undefined;

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: (options?: { onOfflineReady?: () => void }) => {
    onOfflineReadyCb = options?.onOfflineReady;
    return {
      needRefresh: [mockNeedRefresh, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: updateServiceWorkerMock,
    };
  },
}));
vi.mock("@/state/ToastContext", () => ({
  useToast: () => ({
    showToast: showToastMock,
    dismissToast: vi.fn(),
    toast: null,
  }),
}));

import "@/i18n";
import { UpdatePrompt } from "./UpdatePrompt";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockNeedRefresh = false;
  onOfflineReadyCb = undefined;
  updateServiceWorkerMock.mockClear();
  showToastMock.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
}

function clickButton(label: string) {
  const buttons = Array.from(container.querySelectorAll("button"));
  const btn = buttons.find((b) => (b.textContent ?? "").trim() === label);
  if (!btn) throw new Error(`Button not found: ${label}`);
  act(() => {
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("UpdatePrompt", () => {
  it("renders nothing when no update is waiting", () => {
    mockNeedRefresh = false;
    render(<UpdatePrompt />);
    expect(container.textContent).toBe("");
    expect(container.querySelector("[role='status']")).toBeNull();
  });

  it("shows a polite notice with Refresh and Later when an update is waiting", () => {
    mockNeedRefresh = true;
    render(<UpdatePrompt />);
    const region = container.querySelector("[role='status']");
    expect(region).not.toBeNull();
    expect(region!.getAttribute("aria-live")).toBe("polite");
    expect(container.textContent).toContain("A new version is available.");
    const labels = Array.from(container.querySelectorAll("button")).map((b) =>
      (b.textContent ?? "").trim(),
    );
    expect(labels).toContain("Refresh");
    expect(labels).toContain("Later");
  });

  it("Refresh activates the waiting service worker (reloads)", () => {
    mockNeedRefresh = true;
    render(<UpdatePrompt />);
    clickButton("Refresh");
    expect(updateServiceWorkerMock).toHaveBeenCalledTimes(1);
    expect(updateServiceWorkerMock).toHaveBeenCalledWith(true);
  });

  it("Later dismisses for the session and does not reload", () => {
    mockNeedRefresh = true;
    render(<UpdatePrompt />);
    clickButton("Later");
    expect(container.textContent).toBe("");
    expect(container.querySelector("[role='status']")).toBeNull();
    expect(updateServiceWorkerMock).not.toHaveBeenCalled();
  });

  it("offline-ready fires a brief toast through the existing toast system", () => {
    mockNeedRefresh = false;
    render(<UpdatePrompt />);
    expect(onOfflineReadyCb).toBeDefined();
    act(() => {
      onOfflineReadyCb!();
    });
    expect(showToastMock).toHaveBeenCalledWith(
      "Ready to work offline.",
      "info",
    );
  });
});
