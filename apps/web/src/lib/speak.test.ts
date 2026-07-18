/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SPEAK_START_TIMEOUT_MS,
  isSpeechAvailable,
  speak,
  stopSpeaking,
} from "./speak";

// On-device TTS wrapper (#476). jsdom has no speechSynthesis, which
// doubles as the soft-degrade test; a stub covers the happy path.
// The start watchdog exists for phones whose speech engine has zero
// voices installed: the utterance queues and then NOTHING ever fires.

class FakeUtterance {
  lang?: string;
  onstart?: () => void;
  onend?: () => void;
  onerror?: () => void;
  constructor(public text: string) {}
}

/** Stub a synthesis whose speak() swallows the utterance silently —
 *  the zero-voices engine shape — while capturing it for the test. */
function stubSilentEngine() {
  const cancel = vi.fn();
  let last: FakeUtterance | undefined;
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  vi.stubGlobal("speechSynthesis", {
    cancel,
    speak: (u: FakeUtterance) => {
      last = u;
    },
  });
  return { cancel, utterance: () => last! };
}

afterEach(() => {
  // Settle any watchdog a test left pending before tearing the
  // stubbed platform down — tests must not leak timers or module
  // state into their neighbors.
  stopSpeaking();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("speak", () => {
  it("soft-degrades to false where the API is missing (jsdom default)", () => {
    expect(speak("hello")).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();
  });

  it("cancels stale speech, speaks with the requested language", () => {
    const cancel = vi.fn();
    const spoken: Array<{ text: string; lang?: string }> = [];
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("speechSynthesis", {
      cancel,
      speak: (u: FakeUtterance) => spoken.push({ text: u.text, lang: u.lang }),
    });
    expect(speak("aviso importante", "es")).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(spoken).toEqual([
      expect.objectContaining({ text: "aviso importante", lang: "es" }),
    ]);
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

  it("calls onDone once whether the utterance ends OR errors", () => {
    vi.useFakeTimers();
    const { utterance } = stubSilentEngine();
    const onDone = vi.fn();
    expect(speak("hello", "en", onDone)).toBe(true);
    expect(onDone).not.toHaveBeenCalled();
    // A platform may fire error then end (or vice versa) — the
    // caller's "speaking…" state must clear exactly once.
    utterance().onerror!();
    utterance().onend!();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("calls onDone(false) when speech is missing or throws", () => {
    const missing = vi.fn();
    expect(speak("x", undefined, missing)).toBe(false);
    expect(missing).toHaveBeenCalledTimes(1);
    expect(missing).toHaveBeenCalledWith(false);

    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(_t: string) {} });
    vi.stubGlobal("speechSynthesis", {
      cancel() {},
      speak() {
        throw new Error("no voices");
      },
    });
    const threw = vi.fn();
    expect(speak("x", undefined, threw)).toBe(false);
    expect(threw).toHaveBeenCalledTimes(1);
    expect(threw).toHaveBeenCalledWith(false);
  });

  it("watchdog: an engine that never fires start gets cancelled and reports onDone(false) once", () => {
    vi.useFakeTimers();
    const { cancel } = stubSilentEngine();
    const onDone = vi.fn();
    // The call itself still "succeeds" — the queue accepted it.
    expect(speak("hello", "en", onDone)).toBe(true);
    // Just before the deadline: still hoping for `start`.
    vi.advanceTimersByTime(SPEAK_START_TIMEOUT_MS - 1);
    expect(onDone).not.toHaveBeenCalled();
    // Deadline: cancel the zombie (initial stale-cancel + this one)
    // and report failure — exactly once, ever.
    vi.advanceTimersByTime(1);
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith(false);
    vi.advanceTimersByTime(SPEAK_START_TIMEOUT_MS * 2);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("watchdog stands down once `start` fires; onDone(true) on end", () => {
    vi.useFakeTimers();
    const { cancel, utterance } = stubSilentEngine();
    const onDone = vi.fn();
    expect(speak("hello", "en", onDone)).toBe(true);
    utterance().onstart!();
    // Way past the deadline: no watchdog cancel, no false alarm.
    vi.advanceTimersByTime(SPEAK_START_TIMEOUT_MS * 3);
    expect(cancel).toHaveBeenCalledTimes(1); // only the initial stale-cancel
    expect(onDone).not.toHaveBeenCalled();
    utterance().onend!();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith(true);
  });

  it("onStart fires exactly when the utterance audibly starts — never for a swallowed one", () => {
    vi.useFakeTimers();
    const { utterance } = stubSilentEngine();
    const onDone = vi.fn();
    const onStart = vi.fn();
    expect(speak("hello", "en", onDone, onStart)).toBe(true);
    // Queued but not yet audible: no start signal.
    expect(onStart).not.toHaveBeenCalled();
    utterance().onstart!();
    expect(onStart).toHaveBeenCalledTimes(1);
    // …and the swallowed-utterance path: a fresh call whose start
    // never comes only ever reports through onDone(false).
    const neverStarts = vi.fn();
    speak("again", "en", onDone, neverStarts);
    vi.advanceTimersByTime(SPEAK_START_TIMEOUT_MS);
    expect(neverStarts).not.toHaveBeenCalled();
  });

  it("an error BEFORE start reports false; an error AFTER start reports true", () => {
    vi.useFakeTimers();
    const engine = stubSilentEngine();
    const early = vi.fn();
    speak("a", undefined, early);
    engine.utterance().onerror!();
    expect(early).toHaveBeenCalledWith(false);

    // Started speaking, then got interrupted: the device CAN speak —
    // the UI must not tell the member it can't.
    const late = vi.fn();
    speak("b", undefined, late);
    engine.utterance().onstart!();
    engine.utterance().onerror!();
    expect(late).toHaveBeenCalledTimes(1);
    expect(late).toHaveBeenCalledWith(true);
  });

  it("stopSpeaking settles a pending utterance as ok and kills its watchdog", () => {
    vi.useFakeTimers();
    const { cancel } = stubSilentEngine();
    const onDone = vi.fn();
    speak("hello", "en", onDone);
    // Member stopped it on purpose (menu closed, screen left): that
    // is not a device failure, and the timer dies right here.
    stopSpeaking();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith(true);
    expect(cancel).toHaveBeenCalledTimes(2); // stale-cancel + stop
    vi.advanceTimersByTime(SPEAK_START_TIMEOUT_MS * 2);
    expect(cancel).toHaveBeenCalledTimes(2); // watchdog never fired
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("a newer speak() settles the previous one as ok — its watchdog must not cancel the new utterance", () => {
    vi.useFakeTimers();
    const { cancel } = stubSilentEngine();
    const first = vi.fn();
    const second = vi.fn();
    speak("first", "en", first);
    speak("second", "en", second);
    // The replaced call is over (deliberately), not failed.
    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(true);
    expect(second).not.toHaveBeenCalled();
    // Only the SECOND call's watchdog remains; when it fires, the
    // second caller (and only the second) learns the truth.
    vi.advanceTimersByTime(SPEAK_START_TIMEOUT_MS);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(false);
    expect(cancel).toHaveBeenCalledTimes(3); // 2 stale-cancels + 1 watchdog
  });
});

describe("isSpeechAvailable", () => {
  it("is false in jsdom (no speechSynthesis) and true once the API exists", () => {
    expect(isSpeechAvailable()).toBe(false);
    vi.stubGlobal("speechSynthesis", { cancel() {}, speak() {} });
    expect(isSpeechAvailable()).toBe(true);
  });
});
