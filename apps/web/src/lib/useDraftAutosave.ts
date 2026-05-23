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
import { useEffect, useRef } from "react";
import { saveDraft } from "@/db/drafts";

// Debounced "write this form state to the drafts table" hook. The
// caller owns the value (no internal copying) and the decision of
// whether saving is appropriate right now — typically:
//   - disable while the restore banner is pending (otherwise the
//     autosave overwrites the draft we're about to offer back),
//   - disable while submitting (we're about to clear the draft
//     anyway and don't want a race),
//   - disable when the form is at its untouched defaults (no point
//     persisting empty state).

interface UseDraftAutosaveOptions {
  /** When false, the hook neither saves nor schedules a save. */
  enabled: boolean;
  /** Debounce window in ms. Default 600 — long enough that a typing
   *  burst lands as one write, short enough that a quick navigate
   *  still flushes recent edits. */
  debounceMs?: number;
}

export function useDraftAutosave<T>(
  key: string,
  value: T,
  { enabled, debounceMs = 600 }: UseDraftAutosaveOptions,
): void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      return;
    }
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void saveDraft(key, value);
      timer.current = null;
    }, debounceMs);
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [key, value, enabled, debounceMs]);
}
