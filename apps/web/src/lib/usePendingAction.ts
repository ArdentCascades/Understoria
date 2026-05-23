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
import { useCallback, useEffect, useRef, useState } from "react";

// Wraps a Promise-returning action with pending-state tracking, so
// the calling button can disable itself + show an in-flight label
// while the action runs. Mirrors the existing `run()` wrappers that
// several pages reinvent locally — except this one only owns the
// pending flag, leaving error handling to the caller (toast, inline
// alert, whatever they already do).
//
// The `mounted` ref guards against setState after unmount when the
// action resolves after navigation. React 18 silently no-ops this,
// but the guard keeps the intent explicit.

export interface PendingAction {
  pending: boolean;
  run: <R>(action: () => Promise<R>) => Promise<R | undefined>;
}

export function usePendingAction(): PendingAction {
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async <R>(action: () => Promise<R>) => {
    if (mounted.current) setPending(true);
    try {
      return await action();
    } finally {
      if (mounted.current) setPending(false);
    }
  }, []);

  return { pending, run };
}
