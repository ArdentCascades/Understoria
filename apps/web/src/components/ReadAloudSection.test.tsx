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
//
// The read-aloud settings card (#473) is the one control a non-reader
// must be able to operate BEFORE the mode exists — so its toggle
// speaks its own new state, and it never promises speech the device
// can't deliver: an engine-less browser gets the unsupported line, an
// engine with no voice for the member's language gets the honest
// no-voice note (the everyday reality for Tibetan, patchy for Urdu).
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockAvailability: "unknown" | "available" | "missing" = "available";
let voicesChangedCb: (() => void) | null = null;
const speakMock = vi.fn(() => true);

vi.mock("@/lib/speak", () => ({
  speak: (...args: unknown[]) => speakMock(...(args as [])),
  voiceAvailabilityFor: () => mockAvailability,
  onVoicesChanged: (cb: () => void) => {
    voicesChangedCb = cb;
    return () => {
      voicesChangedCb = null;
    };
  },
}));

import "@/i18n";
import i18n from "@/i18n";
import { isReadAloudEnabled, setReadAloudEnabled } from "@/lib/readAloud";
import { ReadAloudSection } from "./ReadAloudSection";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mockAvailability = "available";
  voicesChangedCb = null;
  setReadAloudEnabled(false);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setReadAloudEnabled(false);
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function render() {
  act(() => {
    root.render(<ReadAloudSection />);
  });
}

function toggleButton(): HTMLButtonElement | undefined {
  return [...container.querySelectorAll("button")].find(
    (b) =>
      b.textContent === i18n.t("profile.readAloud.turnOn") ||
      b.textContent === i18n.t("profile.readAloud.turnOff"),
  );
}

describe("ReadAloudSection", () => {
  it("toggles the mode, persists it, and speaks the new state", () => {
    vi.stubGlobal("speechSynthesis", { getVoices: () => [] });
    render();

    const button = toggleButton();
    expect(button).toBeDefined();
    expect(button!.getAttribute("aria-pressed")).toBe("false");
    expect(button!.textContent).toBe(i18n.t("profile.readAloud.turnOn"));

    act(() => button!.click());
    expect(isReadAloudEnabled()).toBe(true);
    expect(toggleButton()!.getAttribute("aria-pressed")).toBe("true");
    expect(speakMock).toHaveBeenCalledWith(
      i18n.t("profile.readAloud.spokenOn"),
      "en",
    );

    act(() => toggleButton()!.click());
    expect(isReadAloudEnabled()).toBe(false);
    expect(speakMock).toHaveBeenCalledWith(
      i18n.t("profile.readAloud.spokenOff"),
      "en",
    );
  });

  it("says so instead of offering a dead toggle where speech is missing", () => {
    // jsdom has no speechSynthesis — the honest degrade branch.
    render();
    expect(toggleButton()).toBeUndefined();
    expect(container.textContent).toContain(
      i18n.t("profile.readAloud.unsupported"),
    );
  });

  it("shows the no-voice note only when voices exist but none fits", () => {
    vi.stubGlobal("speechSynthesis", { getVoices: () => [] });
    const note = () =>
      i18n.t("profile.readAloud.noVoice", { language: "English" });

    mockAvailability = "available";
    render();
    expect(container.textContent).not.toContain(note());

    // Fresh mount — the probe runs at mount and on voiceschanged,
    // not on arbitrary re-renders.
    act(() => root.unmount());
    root = createRoot(container);
    mockAvailability = "missing";
    render();
    expect(container.textContent).toContain(note());
    // The toggle stays — the note informs, it doesn't gate.
    expect(toggleButton()).toBeDefined();
  });

  it("re-probes when the engine's voice list loads late", () => {
    vi.stubGlobal("speechSynthesis", { getVoices: () => [] });
    mockAvailability = "unknown";
    render();
    const note = i18n.t("profile.readAloud.noVoice", { language: "English" });
    // While the list hasn't populated: no false alarm.
    expect(container.textContent).not.toContain(note);
    expect(voicesChangedCb).not.toBeNull();

    mockAvailability = "missing";
    act(() => voicesChangedCb!());
    expect(container.textContent).toContain(note);
  });
});
