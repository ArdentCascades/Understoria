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
import { useEffect } from "react";

// Minimal Screen Wake Lock binding for the gathering screen: while a
// show is running, ask the OS to keep the display awake so a TV in the
// corner of a room never sleeps mid-gathering. The lock is dropped by
// the browser whenever the tab is hidden, so we re-acquire on
// `visibilitychange`. Everything is best-effort — unsupported browsers
// (and denied requests) are a soft no-op, never a thrown error.

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}
interface WakeLockLike {
  request: (type: "screen") => Promise<WakeLockSentinelLike>;
}

function wakeLock(): WakeLockLike | undefined {
  return (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const wl = wakeLock();
    if (!wl) return; // unsupported — soft no-op

    let sentinel: WakeLockSentinelLike | null = null;
    let released = false;

    const acquire = async () => {
      try {
        sentinel = await wl.request("screen");
      } catch {
        // Denied / not allowed (e.g. not visible) — ignore.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !released) void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
