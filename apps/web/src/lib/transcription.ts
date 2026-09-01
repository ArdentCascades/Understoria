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
 * On-device transcription — preference + capability
 * (docs/transcription-plan.md, V7 #477 Phase 1).
 *
 * The preference is per-device localStorage, same shape as
 * read-aloud's: an accessibility choice about THIS device's
 * abilities and storage, nothing the community should sync.
 *
 * The capability probe is honest about the two distinct ways a
 * device can't transcribe: the platform APIs are missing (old
 * browser, jsdom), or WASM compilation is refused — which is what
 * an Understoria deployment whose operator hasn't applied the CSP
 * update looks like (docs/transcription-plan.md D5). Probing with a
 * real 8-byte module compile catches both; assuming would lie.
 */

const STORAGE_KEY = "understoria:transcription";
export const TRANSCRIPTION_CHANGE_EVENT = "understoria:transcription-changed";

export function isTranscriptionEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setTranscriptionEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — the toggle simply won't persist.
  }
  window.dispatchEvent(new Event(TRANSCRIPTION_CHANGE_EVENT));
}

/** The smallest valid WASM module: magic + version. Compiling it is
 *  the probe — `WebAssembly.validate` would pass even where the CSP
 *  blocks compilation, so it can't be trusted to answer this. */
const WASM_PROBE = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);

/** Can this device run the transcription engine at all? False when
 *  the APIs are missing OR when WASM compilation is refused (a CSP
 *  without 'wasm-unsafe-eval' — deployments predating the V7
 *  Caddyfile update). Cheap and synchronous; safe to call in render. */
export function canRunTranscription(): boolean {
  try {
    if (
      typeof WebAssembly === "undefined" ||
      typeof WebAssembly.Module !== "function" ||
      typeof Worker === "undefined"
    ) {
      return false;
    }
    new WebAssembly.Module(WASM_PROBE);
    return true;
  } catch {
    return false;
  }
}
