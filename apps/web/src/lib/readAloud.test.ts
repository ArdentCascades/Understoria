/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(() => true),
  stopSpeaking: vi.fn(),
}));

import {
  initReadAloud,
  isReadAloudEnabled,
  labelFor,
  setReadAloudEnabled,
  startReadAloud,
} from "./readAloud";
import { speak, stopSpeaking } from "@/lib/speak";

// Read-aloud mode (#473): interactive controls speak their label on
// focus/press, on-device, additive to the untouched visual UI.

afterEach(() => {
  setReadAloudEnabled(false);
  document.body.innerHTML = "";
  vi.clearAllMocks();
});

describe("labelFor", () => {
  it("prefers aria-label, falls back to text, uses input labels/placeholders", () => {
    const btn = document.createElement("button");
    btn.setAttribute("aria-label", "Record a voice note");
    btn.textContent = "🎙️";
    expect(labelFor(btn)).toBe("Record a voice note");

    const link = document.createElement("a");
    link.textContent = "  Community   board ";
    expect(labelFor(link)).toBe("Community board");

    const input = document.createElement("input");
    input.setAttribute("placeholder", "Search posts");
    expect(labelFor(input)).toBe("Search posts");
  });
});

describe("startReadAloud", () => {
  it("speaks a control's label on focusin and pointerdown; ignores plain text", () => {
    const stop = startReadAloud(() => "en");
    const btn = document.createElement("button");
    btn.textContent = "Send";
    const p = document.createElement("p");
    p.textContent = "just words";
    document.body.append(btn, p);

    btn.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(speak).toHaveBeenCalledWith("Send", "en");
    p.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(speak).toHaveBeenCalledTimes(1);

    stop();
    expect(stopSpeaking).toHaveBeenCalled();
    btn.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(speak).toHaveBeenCalledTimes(1); // detached
  });
});

describe("initReadAloud + the toggle", () => {
  it("persists the preference and attaches/detaches live on toggle", () => {
    expect(isReadAloudEnabled()).toBe(false);
    const teardown = initReadAloud(() => "es");
    const btn = document.createElement("button");
    btn.textContent = "Confirmar";
    document.body.append(btn);

    // Off by default — silence.
    btn.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(speak).not.toHaveBeenCalled();

    setReadAloudEnabled(true);
    expect(isReadAloudEnabled()).toBe(true);
    btn.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(speak).toHaveBeenCalledWith("Confirmar", "es");

    setReadAloudEnabled(false);
    btn.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(speak).toHaveBeenCalledTimes(1);

    teardown();
  });
});
