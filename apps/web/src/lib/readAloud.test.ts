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

describe("capture-phase contract", () => {
  it("still speaks when a component stops pointerdown propagation", () => {
    // Conversation's long-press bubbles call stopPropagation() on
    // pointerdown (bubble phase, Conversation.tsx); read-aloud
    // listens in CAPTURE phase on document, so the label has already
    // been spoken by the time any component handler runs. This locks
    // that ordering — read-aloud must never go quiet on exactly the
    // controls that manage their own pointer events.
    const stop = startReadAloud(() => "en");
    const btn = document.createElement("button");
    btn.textContent = "Speak this message";
    document.body.append(btn);
    btn.addEventListener("pointerdown", (e) => e.stopPropagation());

    btn.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(speak).toHaveBeenCalledWith("Speak this message", "en");

    stop();
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
