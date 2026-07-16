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
import { authorizedFetch } from "@/lib/authorizedRead";
import { isDemoBuild } from "@/lib/demo";
import { listNodeEndpoints } from "@/lib/nodeEndpoints";
import { SYNC_KICK_EVENT } from "@/lib/syncLoop";

/**
 * The nudge stream, client half (docs/sync-liveness.md, "server
 * push"). Holds one long-lived `GET /nudges` Server-Sent-Events
 * connection to the community node while the app is open and
 * foregrounded; every content-free `nudge` event dispatches
 * SYNC_KICK_EVENT, which the sync loop treats exactly like a focus
 * kick — a full pull, coalesced. Net effect: messages, posts, RSVPs,
 * and project updates land within ~a second of the server accepting
 * them, instead of waiting out the 12s–3min poll cadence.
 *
 * Uses fetch (not EventSource): the member-read guard wants signed
 * headers, which EventSource cannot send and `authorizedFetch`
 * already produces.
 *
 * Lifecycle discipline:
 *  - hidden tab → stream closed (battery, server sockets); visible
 *    again → reconnect immediately.
 *  - errors/disconnects → exponential backoff 2s → 60s, reset by any
 *    successful event. The regular poll cadence keeps running
 *    underneath, so a broken stream degrades to today's behavior —
 *    never worse.
 *  - unconfigured node / demo build → checks again every RETRY_MAX.
 */

const RETRY_MIN_MS = 2_000;
const RETRY_MAX_MS = 60_000;

export function startNudgeStream(): () => void {
  let stopped = false;
  let controller: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let backoff = RETRY_MIN_MS;

  const visible = () =>
    typeof document === "undefined" ||
    document.visibilityState === "visible";

  const schedule = (delayMs: number) => {
    if (stopped) return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => void connect(), delayMs);
  };

  async function connect(): Promise<void> {
    if (stopped) return;
    if (isDemoBuild()) return; // no node, ever — don't even poll for one
    if (!visible()) return; // visibilitychange below reconnects us
    const { primary } = await listNodeEndpoints();
    if (!primary) {
      schedule(RETRY_MAX_MS);
      return;
    }
    controller = new AbortController();
    try {
      const res = await authorizedFetch(`${primary}/nudges`, primary, {
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        schedule(backoff);
        backoff = Math.min(backoff * 2, RETRY_MAX_MS);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE frames are separated by a blank line.
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (frame.split("\n").some((l) => l === "event: nudge")) {
            backoff = RETRY_MIN_MS; // the stream is healthy
            window.dispatchEvent(new Event(SYNC_KICK_EVENT));
          }
        }
      }
      // Server closed cleanly (restart, deploy) — reconnect politely.
      schedule(backoff);
      backoff = Math.min(backoff * 2, RETRY_MAX_MS);
    } catch {
      // Abort (stop/hidden) or network error. Reconnect unless
      // stopped; the visibility handler owns the hidden case.
      if (!stopped && visible()) {
        schedule(backoff);
        backoff = Math.min(backoff * 2, RETRY_MAX_MS);
      }
    } finally {
      controller = null;
    }
  }

  const onVisibility = () => {
    if (stopped) return;
    if (visible()) {
      backoff = RETRY_MIN_MS;
      void connect();
    } else {
      controller?.abort();
      if (timer !== null) clearTimeout(timer);
    }
  };
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibility);
  }

  void connect();

  return () => {
    stopped = true;
    controller?.abort();
    if (timer !== null) clearTimeout(timer);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}
