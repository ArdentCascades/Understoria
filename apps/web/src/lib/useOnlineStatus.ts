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
import { useEffect, useState } from "react";

// Tracks whether the device believes it has network connectivity.
// Wraps `navigator.onLine` plus the window `online` / `offline`
// events so components re-render when connectivity changes.
//
// Caveat: `navigator.onLine` is a liar sometimes. It reports the
// state of the network *interface*, not actual reachability — a
// captive portal or "lie-fi" connection reads as online even though
// nothing gets through. That's acceptable for v1: a false "online"
// just means no banner (the outbox keeps retrying regardless), and
// a false "offline" is rare. A future refinement could verify real
// reachability from outbox delivery results — but NOT by actively
// pinging the node on a timer, which is chatty and battery-hostile
// for exactly the members this indicator exists to serve.
//
// SSR / pre-mount default is `true` (no banner) — better to briefly
// miss the banner than to flash "you're offline" at someone who isn't.

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
