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
import type { FastifyInstance } from "fastify";
import type { NudgeBus } from "../nudgeBus.js";

interface Deps {
  bus: NudgeBus;
  /** Heartbeat cadence; keeps reverse proxies from idling the socket
   *  out. Injectable for tests. */
  heartbeatMs?: number;
}

/**
 * GET /nudges — the live-delivery stream (docs/sync-liveness.md,
 * "server push"). A long-lived Server-Sent-Events response that emits
 * one content-free `nudge` event whenever this node ACCEPTS a
 * federation write. The client reacts by running the exact sync pull
 * a focus-kick would run — so messages, posts, RSVPs, and project
 * updates all land within ~a second while the app is open, instead
 * of waiting out the poll cadence.
 *
 * Privacy posture: no record data, no kind, no author ever crosses
 * this stream — just "something changed". E2E message envelopes stay
 * exactly as private as before; the recipient still PULLS them over
 * the authenticated feed.
 *
 * Auth: covered by the deny-by-default member-read guard
 * (readAuth.ts) the moment it is registered — under READ_AUTH=on the
 * request must carry a member's signed read headers, which the PWA's
 * fetch-based reader sends (EventSource can't set headers, so the
 * client deliberately doesn't use it).
 */
export async function registerNudgeRoutes(
  app: FastifyInstance,
  { bus, heartbeatMs = 25_000 }: Deps,
): Promise<void> {
  app.get("/nudges", (req, reply) => {
    // The response is owned by the raw socket from here on; tell
    // Fastify before the first write so it never tries to serialize.
    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
      // Belt-and-braces for buffering proxies; Caddy streams
      // text/event-stream by default.
      "x-accel-buffering": "no",
    });
    raw.write(`: connected\n\n`);

    const send = () => {
      raw.write(`event: nudge\ndata: {}\n\n`);
    };
    const unsubscribe = bus.subscribe(send);
    const heartbeat = setInterval(() => {
      raw.write(`: hb\n\n`);
    }, heartbeatMs);
    // Never let the heartbeat keep a test process (or a draining
    // server) alive on its own.
    heartbeat.unref?.();

    const cleanup = () => {
      clearInterval(heartbeat);
      unsubscribe();
    };
    req.raw.on("close", cleanup);
    raw.on("close", cleanup);
  });
}
