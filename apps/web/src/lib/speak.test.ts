/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { speak, stopSpeaking } from "./speak";

// On-device TTS wrapper (#476). jsdom has no speechSynthesis, which
// doubles as the soft-degrade test; a stub covers the happy path.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("speak", () => {
  it("soft-degrades to false where the API is missing (jsdom default)", () => {
    expect(speak("hello")).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();
  });

  it("cancels stale speech, speaks with the requested language", () => {
    const cancel = vi.fn();
    const spoken: Array<{ text: string; lang?: string }> = [];
    class FakeUtterance {
      lang?: string;
      constructor(public text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("speechSynthesis", {
      cancel,
      speak: (u: FakeUtterance) => spoken.push({ text: u.text, lang: u.lang }),
    });
    expect(speak("aviso importante", "es")).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(spoken).toEqual([{ text: "aviso importante", lang: "es" }]);
    stopSpeaking();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it("returns false when the platform throws mid-call", () => {
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(_t: string) {} });
    vi.stubGlobal("speechSynthesis", {
      cancel() {},
      speak() {
        throw new Error("no voices");
      },
    });
    expect(speak("x")).toBe(false);
  });
});
