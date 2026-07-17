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
export function speak(text: string, lang?: string): boolean {
  try {
    if (
      typeof speechSynthesis === "undefined" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return false;
    }
    // One utterance at a time — a newer prompt replaces a stale one.
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang) utterance.lang = lang;
    speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/** Stop any in-flight speech (dialog closed, action taken). */
export function stopSpeaking(): void {
  try {
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  } catch {
    // Nothing to stop.
  }
}
