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
import { speak, stopSpeaking } from "@/lib/speak";

/**
 * Read-aloud mode (spoken interface #473, TTS-first): when enabled,
 * every interactive control SPEAKS its label as it is focused or
 * pressed, using the device's own on-device speech — no cloud, no
 * model, nothing leaves the phone. Paired with the category icon set
 * (lib/categories.ts CATEGORY_META), a non-reader can find their way
 * by ear and icon while the visual UI stays exactly as it is.
 *
 * The preference is per-device (localStorage — it must be readable
 * BEFORE the member can navigate a settings screen, and it survives
 * a locked session). Toggling dispatches CHANGE_EVENT so the running
 * listener attaches/detaches live, no reload.
 */

const STORAGE_KEY = "understoria:readAloud";
export const READ_ALOUD_CHANGE_EVENT = "understoria:read-aloud-changed";

const INTERACTIVE =
  'button, a[href], input, select, textarea, [role="button"], ' +
  '[role="menuitem"], [role="radio"], [role="tab"], [role="link"], summary';

export function isReadAloudEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setReadAloudEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — the toggle simply won't persist.
  }
  window.dispatchEvent(new Event(READ_ALOUD_CHANGE_EVENT));
}

/** Best available spoken label for a control, aria-first. */
export function labelFor(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria && aria.trim() !== "") return aria.trim().slice(0, 200);
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    const label = el.labels?.[0]?.textContent?.trim();
    if (label) return label.slice(0, 200);
    const placeholder = el.getAttribute("placeholder");
    if (placeholder && placeholder.trim() !== "") {
      return placeholder.trim().slice(0, 200);
    }
  }
  return (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 200);
}

/**
 * Start speaking labels. Listens on focusin (keyboard / screen-
 * reader-less navigation) and pointerdown (touch, where mobile
 * Safari never focuses buttons); an activation proceeds normally —
 * speech is additive, never a gate. Returns the detach function.
 */
export function startReadAloud(lang?: () => string): () => void {
  const handle = (e: Event) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const control = target.closest(INTERACTIVE);
    if (!control) return;
    const label = labelFor(control);
    if (label) speak(label, lang?.());
  };
  document.addEventListener("focusin", handle, true);
  document.addEventListener("pointerdown", handle, true);
  return () => {
    document.removeEventListener("focusin", handle, true);
    document.removeEventListener("pointerdown", handle, true);
    stopSpeaking();
  };
}

/**
 * Boot wiring (called once from the app shell): honors the stored
 * preference now and follows every later toggle. Returns a teardown.
 */
export function initReadAloud(lang?: () => string): () => void {
  let stop: (() => void) | null = null;
  const apply = () => {
    if (isReadAloudEnabled() && stop === null) {
      stop = startReadAloud(lang);
    } else if (!isReadAloudEnabled() && stop !== null) {
      stop();
      stop = null;
    }
  };
  apply();
  window.addEventListener(READ_ALOUD_CHANGE_EVENT, apply);
  return () => {
    window.removeEventListener(READ_ALOUD_CHANGE_EVENT, apply);
    stop?.();
    stop = null;
  };
}
