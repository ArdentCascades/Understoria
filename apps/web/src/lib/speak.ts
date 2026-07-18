/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * On-device text-to-speech (voice workstream — first used by the
 * accessible panic flow, #476; the spoken interface #473 builds on
 * the same helper). `speechSynthesis` runs locally on every modern
 * platform: no cloud, no model download, nothing leaves the device —
 * which is why this is allowed where cloud speech never would be.
 *
 * Soft-degrade contract: returns false (and does nothing) where the
 * API is missing, so callers layer speech ON TOP of a visual path
 * that must already work by itself.
 */

/** How long a queued utterance may wait for its `start` event before
 *  we conclude the engine will never speak it. Some phones ship a
 *  speech engine with ZERO voices installed: `speechSynthesis`
 *  exists, `speak()` accepts the utterance — and then nothing ever
 *  fires, not `start`, not `end`, not `error`. Long enough for a
 *  real engine to warm up (on many phones `getVoices()` is empty at
 *  first and fills in later — that's normal, not broken); short
 *  enough that the member still connects the feedback to their tap. */
export const SPEAK_START_TIMEOUT_MS = 2000;

// The in-flight speak() call's settle hook. Module-level because
// stopSpeaking() and a superseding speak() must be able to reach the
// previous call's watchdog: a deliberate stop settles it as "done,
// ok" (not a device failure) and clears the timer — no watchdog may
// outlive the speech it was guarding, or worse, fire late and
// cancel() a newer utterance.
let settleActive: ((ok: boolean) => void) | null = null;

export function speak(
  text: string,
  lang?: string,
  onDone?: (ok: boolean) => void,
): boolean {
  // `onDone` fires exactly once — a caller rendering a "speaking…"
  // state must never get stuck in it just because the platform
  // failed mid-utterance. `ok=false` has exactly one meaning: this
  // device never spoke the text (API missing, the call threw, the
  // utterance errored before starting, or it sat queued past the
  // start watchdog). Everything after real speech began — `end`,
  // and even `error` from an interruption — reports `ok=true`: the
  // device CAN speak, so a UI must not claim otherwise. Callers
  // that don't care simply ignore the flag.
  let notified = false;
  let started = false;
  let watchdog: number | undefined;
  const clearWatchdog = () => {
    if (watchdog !== undefined) {
      clearTimeout(watchdog);
      watchdog = undefined;
    }
  };
  const notify = (ok: boolean) => {
    clearWatchdog();
    if (settleActive === notify) settleActive = null;
    if (notified) return;
    notified = true;
    onDone?.(ok);
  };
  try {
    if (
      typeof speechSynthesis === "undefined" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      notify(false);
      return false;
    }
    // One utterance at a time — a newer prompt replaces a stale one.
    // Settle the stale call first (a deliberate replacement, not a
    // device failure) so its watchdog dies before it can fire and
    // cancel the utterance we're about to queue.
    settleActive?.(true);
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang) utterance.lang = lang;
    utterance.onstart = () => {
      // It's audibly speaking — the watchdog's question is answered.
      started = true;
      clearWatchdog();
    };
    utterance.onend = () => notify(true);
    utterance.onerror = () => notify(started);
    settleActive = notify;
    speechSynthesis.speak(utterance);
    // Did-it-actually-start watchdog: a zero-voices engine swallows
    // the utterance and fires nothing, forever. If `start` hasn't
    // arrived in time (and nothing settled us synchronously), cancel
    // the zombie and report the truth.
    if (!notified) {
      watchdog = window.setTimeout(() => {
        watchdog = undefined;
        try {
          speechSynthesis.cancel();
        } catch {
          // The engine is beyond help; reporting still matters.
        }
        notify(false);
      }, SPEAK_START_TIMEOUT_MS);
    }
    return true;
  } catch {
    notify(false);
    return false;
  }
}

/** Whether this device can speak at all — so a UI can SAY it can't
 *  (a disabled control that explains itself) instead of offering a
 *  button that silently does nothing. */
export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Stop any in-flight speech (dialog closed, action taken). Settles
 *  the pending speak() as ok — stopping on purpose is not a device
 *  failure — and kills its watchdog, so no timer outlives the screen
 *  that armed it. */
export function stopSpeaking(): void {
  settleActive?.(true);
  try {
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  } catch {
    // Nothing to stop.
  }
}
