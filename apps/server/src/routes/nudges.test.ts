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
import { get, type IncomingMessage } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalInviteAnnouncementPayload,
  canonicalInvitePayload,
  generateKeyPair,
  inviteTokenHash,
  sign,
} from "@understoria/shared/crypto";
import type { InviteAnnouncement } from "@understoria/shared/types";
import { buildServer } from "../server.js";
import { readConfigFromEnv } from "../config.js";
import { openDatabase } from "../db.js";
import { createNudgeBus } from "../nudgeBus.js";
import { registerNudgeRoutes } from "./nudges.js";

// GET /nudges — the live-delivery SSE stream (docs/sync-liveness.md,
// "server push"). These tests hold a REAL socket open (inject can't
// model a hijacked never-ending response) and assert the stream
// contract: SSE headers, the connected preamble, one content-free
// `nudge` frame per broadcast, heartbeats, and subscriber cleanup on
// disconnect. The buildServer suite then proves the broadcast hook:
// an ACCEPTED federation POST wakes the stream, a rejected one stays
// silent.

interface StreamClient {
  res: IncomingMessage;
  /** Everything received so far. */
  buffer: () => string;
  close: () => void;
}

function openStream(port: number): Promise<StreamClient> {
  return new Promise((resolve, reject) => {
    const req = get(
      { host: "127.0.0.1", port, path: "/nudges" },
      (res) => {
        let buf = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => {
          buf += chunk;
        });
        resolve({
          res,
          buffer: () => buf,
          close: () => req.destroy(),
        });
      },
    );
    req.on("error", reject);
  });
}

async function waitFor(
  predicate: () => boolean,
  what: string,
  timeoutMs = 3_000,
): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`timed out waiting for ${what}`);
    }
    await new Promise((r) => setTimeout(r, 10));
  }
}

function listenPort(app: FastifyInstance): number {
  const addr = app.server.address();
  if (addr === null || typeof addr === "string") {
    throw new Error("server has no bound port");
  }
  return addr.port;
}

const cleanups: Array<() => Promise<void> | void> = [];
afterEach(async () => {
  while (cleanups.length > 0) await cleanups.pop()!();
});

describe("GET /nudges (bare route)", () => {
  async function bareApp(heartbeatMs?: number) {
    const bus = createNudgeBus();
    const app = Fastify({ logger: false });
    await registerNudgeRoutes(app, { bus, heartbeatMs });
    await app.listen({ port: 0, host: "127.0.0.1" });
    cleanups.push(() => app.close());
    return { app, bus, port: listenPort(app) };
  }

  it("answers with SSE headers and the connected preamble", async () => {
    const { port } = await bareApp();
    const client = await openStream(port);
    cleanups.push(() => client.close());
    expect(client.res.statusCode).toBe(200);
    expect(client.res.headers["content-type"]).toBe("text/event-stream");
    expect(client.res.headers["cache-control"]).toBe("no-cache");
    await waitFor(
      () => client.buffer().includes(": connected"),
      "connected preamble",
    );
  });

  it("delivers one content-free nudge frame per broadcast", async () => {
    const { bus, port } = await bareApp();
    const client = await openStream(port);
    cleanups.push(() => client.close());
    await waitFor(() => bus.size() === 1, "subscription");
    bus.broadcast();
    bus.broadcast();
    await waitFor(
      () =>
        client.buffer().split("event: nudge\ndata: {}\n\n").length === 3,
      "two nudge frames",
    );
    // Content-free is the privacy contract: nothing but the frame.
    const afterPreamble = client
      .buffer()
      .replace(": connected\n\n", "")
      .replaceAll("event: nudge\ndata: {}\n\n", "")
      .replaceAll(": hb\n\n", "");
    expect(afterPreamble).toBe("");
  });

  it("heartbeats keep the socket warm at the injected cadence", async () => {
    const { port } = await bareApp(20);
    const client = await openStream(port);
    cleanups.push(() => client.close());
    await waitFor(() => client.buffer().includes(": hb"), "heartbeat");
  });

  it("a disconnect unsubscribes the listener", async () => {
    const { bus, port } = await bareApp();
    const client = await openStream(port);
    await waitFor(() => bus.size() === 1, "subscription");
    client.close();
    await waitFor(() => bus.size() === 0, "cleanup after disconnect");
  });
});

describe("nudge broadcast hook (full server)", () => {
  function makeAnnouncement(): InviteAnnouncement {
    const inviter = generateKeyPair();
    const invitePayload = {
      token: `tok_${Math.random().toString(36).slice(2)}`,
      inviterKey: inviter.publicKey,
      inviterName: "Rosa",
      nodeId: "node_test",
      createdAt: Date.now(),
      expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
    };
    // Signing the invite mirrors the real flow; only the hash-only
    // announcement ever reaches the node.
    void sign(canonicalInvitePayload(invitePayload), inviter.secretKey);
    const payload = {
      tokenHash: inviteTokenHash(invitePayload.token),
      inviterKey: invitePayload.inviterKey,
      inviterName: invitePayload.inviterName,
      nodeId: invitePayload.nodeId,
      createdAt: invitePayload.createdAt,
      expiresAt: invitePayload.expiresAt,
    };
    return {
      ...payload,
      signature: sign(
        canonicalInviteAnnouncementPayload(payload),
        inviter.secretKey,
      ),
    };
  }

  it("an accepted federation POST wakes the stream; a rejected one does not", async () => {
    const db: DatabaseType = openDatabase(":memory:");
    const config = readConfigFromEnv({
      LOG_LEVEL: "fatal",
      READ_AUTH: "off",
      NODE_ID: "node_test",
    } as NodeJS.ProcessEnv);
    const { app } = await buildServer({ config, database: db });
    await app.listen({ port: 0, host: "127.0.0.1" });
    cleanups.push(async () => {
      await app.close();
      db.close();
    });

    const client = await openStream(listenPort(app));
    cleanups.push(() => client.close());
    await waitFor(
      () => client.buffer().includes(": connected"),
      "connected preamble",
    );

    // Rejected write (tampered signature) → 4xx → NO nudge.
    const bad = { ...makeAnnouncement(), signature: "not-a-signature" };
    const rejected = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: bad,
    });
    expect(rejected.statusCode).toBeGreaterThanOrEqual(400);
    await new Promise((r) => setTimeout(r, 50));
    expect(client.buffer()).not.toContain("event: nudge");

    // Accepted write → the stream wakes.
    const accepted = await app.inject({
      method: "POST",
      url: "/invite-announcements",
      payload: makeAnnouncement(),
    });
    expect(accepted.statusCode).toBe(201);
    await waitFor(
      () => client.buffer().includes("event: nudge\ndata: {}\n\n"),
      "nudge after accepted write",
    );
    // Still content-free: the record never rides the stream.
    expect(client.buffer()).not.toContain("tokenHash");
  });
});
