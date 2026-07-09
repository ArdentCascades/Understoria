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
import { useCallback, useEffect, useState } from "react";

// Index math for the gathering-screen rotation, pulled out pure so it can
// be unit-tested without timers or a DOM. Wraps at both ends; a zero/one
// slide count never advances.
export function nextIndex(index: number, count: number): number {
  return count <= 0 ? 0 : (index + 1) % count;
}

export function prevIndex(index: number, count: number): number {
  return count <= 0 ? 0 : (index - 1 + count) % count;
}

export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

export interface Slideshow {
  index: number;
  next: () => void;
  prev: () => void;
}

// Auto-advancing index with pause + manual prev/next. The dwell timer is
// keyed on the current index, so any manual move (or a pause toggle)
// restarts the full dwell rather than cutting the next slide short. A
// single slide (or a paused show) never ticks.
export function useSlideshow(
  count: number,
  opts: { dwellMs: number; paused: boolean },
): Slideshow {
  const [index, setIndex] = useState(0);

  // Keep the index in range when the live rotation shrinks (a claimed
  // task or a past event dropping out mid-show).
  useEffect(() => {
    setIndex((i) => clampIndex(i, count));
  }, [count]);

  const next = useCallback(() => setIndex((i) => nextIndex(i, count)), [count]);
  const prev = useCallback(() => setIndex((i) => prevIndex(i, count)), [count]);

  useEffect(() => {
    if (opts.paused || count <= 1) return;
    const id = window.setTimeout(
      () => setIndex((i) => nextIndex(i, count)),
      opts.dwellMs,
    );
    return () => window.clearTimeout(id);
  }, [index, count, opts.paused, opts.dwellMs]);

  return { index: clampIndex(index, count), next, prev };
}
