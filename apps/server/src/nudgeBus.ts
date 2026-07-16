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
 * In-process nudge bus for the live-delivery stream
 * (docs/sync-liveness.md, "server push"). One instance per server
 * process; `GET /nudges` subscribers register a listener, and an
 * onResponse hook broadcasts after every ACCEPTED federation write.
 *
 * Deliberately content-free: a nudge carries no record, no kind, no
 * author — just "something changed, pull when you like". That keeps
 * the stream outside every privacy boundary (E2E message envelopes
 * included) and makes the client trivially correct: a nudge maps to
 * the exact same sync cycle a focus-kick runs.
 */

export interface NudgeBus {
  /** Register a listener; returns its unsubscribe. */
  subscribe(listener: () => void): () => void;
  /** Wake every current subscriber. Never throws — one listener's
   *  failure must not starve the rest. */
  broadcast(): void;
  /** Current subscriber count (telemetry / tests). */
  size(): number;
}

export function createNudgeBus(): NudgeBus {
  const listeners = new Set<() => void>();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    broadcast() {
      for (const listener of listeners) {
        try {
          listener();
        } catch {
          // A broken subscriber cleans itself up on socket close.
        }
      }
    },
    size() {
      return listeners.size;
    },
  };
}
