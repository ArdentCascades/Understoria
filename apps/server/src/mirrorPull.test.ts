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

/**
 * Mirror replication (docs/community-resilience.md §B.1) — two REAL
 * in-memory servers: `local` runs the worker, `mirror` is the remote
 * being replicated. The injected fetcher proxies the worker's GETs to
 * the mirror's Fastify instance, so both ends run the production
 * route code; nothing is mocked but the network.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  canonicalEventPayload,
  canonicalExchangePayload,
  canonicalInvitePayload,
  canonicalPostPayload,
  canonicalRedemptionPayload,
  generateKeyPair,
  sign,
  signStateRecord,
  type KeyPair,
} from "@understoria/shared/crypto";
import type {
  CapacityPosture,
  Event,
  EventPayload,
  EventRsvpState,
  EventShiftState,
  Exchange,
  Post,
  ProjectState,
  ProjectTaskState,
  RedemptionReceipt,
  ShiftSignupState,
} from "@understoria/shared/types";
import { buildServer, type BuiltServer } from "./server.js";
import { readConfigFromEnv } from "./config.js";
import {
  createEventShiftStateStore,
  createCapacityPostureStore,
  createExchangeStore,
  createMirrorPullStore,
  createRedemptionStore,
  createShiftSignupStateStore,
  openDatabase,
} from "./db.js";
import {
  MAX_AUTHORITY_RETRIES,
  MIRROR_KINDS,
  startMirrorPullWorker,
  type MirrorFetcher,
  type MirrorPullWorkerOptions,
} from "./mirrorPull.js";

const MIRROR_URL = "https://mirror.example";

let local: BuiltServer;
let mirror: BuiltServer;
let dbLocal: DatabaseType;
let dbMirror: DatabaseType;

async function build(
  nodeId: string,
  extraEnv: Record<string, string> = {},
): Promise<{ built: BuiltServer; db: DatabaseType }> {
  const db = openDatabase(":memory:");
  const config = readConfigFromEnv({
    LOG_LEVEL: "fatal",
    NODE_ID: nodeId,
    RATE_LIMIT_MAX: "10000",
    ...extraEnv,
  } as NodeJS.ProcessEnv);
  const built = await buildServer({ config, database: db });
  await built.app.ready();
  return { built, db };
}

beforeEach(async () => {
  ({ built: local, db: dbLocal } = await build("node_local"));
  ({ built: mirror, db: dbMirror } = await build("node_mirror"));
});

afterEach(async () => {
  await local.app.close();
  await mirror.app.close();
  dbLocal.close();
  dbMirror.close();
});

/** Proxy the worker's HTTP GETs into the mirror server's inject. */
function proxyFetcher(target: () => BuiltServer): MirrorFetcher {
  return async (url, headers) => {
    const u = new URL(url);
    const res = await target().app.inject({
      method: "GET",
      url: u.pathname + u.search,
      headers,
    });
    return {
      ok: res.statusCode >= 200 && res.statusCode < 300,
      status: res.statusCode,
      json: async () => res.json() as unknown,
    };
  };
}

function makeWorker(overrides: Partial<MirrorPullWorkerOptions> = {}) {
  return startMirrorPullWorker({
    app: local.app,
    internalToken: local.internalBypassToken,
    mirrorUrls: [MIRROR_URL],
    readTokens: {},
    intervalMs: 0, // tests drive cycles manually
    cursorStore: createMirrorPullStore(dbLocal),
    exchangeStore: createExchangeStore(dbLocal),
    capacityPostureStore: createCapacityPostureStore(dbLocal),
    onError: () => {},
    ...overrides,
  });
}

// --- record builders -------------------------------------------------

let seq = 0;

function makeEvent(organizer: KeyPair): Event {
  const createdAt = Date.now() - 5_000 + ++seq;
  const payload: EventPayload = {
    id: `ev_${seq}`,
    kind: "event",
    title: "Community potluck",
    description: "",
    category: "food",
    startsAt: createdAt + 86_400_000,
    endsAt: null,
    location: "The park pavilion",
    capacity: null,
    templateId: null,
    createdAt,
    createdBy: organizer.publicKey,
    nodeId: "node_mirror",
  };
  return {
    ...payload,
    signature: sign(canonicalEventPayload(payload), organizer.secretKey),
  };
}

function makeShift(
  signer: KeyPair,
  eventId: string,
  overrides: Partial<EventShiftState> = {},
): EventShiftState {
  const now = Date.now();
  const unsigned: Omit<EventShiftState, "signature"> = {
    id: `shift_${++seq}`,
    eventId,
    label: "Setup crew",
    startsAt: now + 80_000_000,
    endsAt: now + 90_000_000,
    capacity: 4,
    createdBy: signer.publicKey,
    createdAt: now,
    deletedAt: null,
    updatedAt: now + seq,
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature: signStateRecord<EventShiftState>(unsigned, signer.secretKey),
  };
}

function makeSignup(
  member: KeyPair,
  shiftId: string,
  eventId: string,
  overrides: Partial<ShiftSignupState> = {},
): ShiftSignupState {
  const now = Date.now();
  const unsigned: Omit<ShiftSignupState, "signature"> = {
    id: `signup_${++seq}`,
    shiftId,
    eventId,
    memberKey: member.publicKey,
    signedUpAt: now,
    deletedAt: null,
    updatedAt: now + seq,
    signerKey: member.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature: signStateRecord<ShiftSignupState>(unsigned, member.secretKey),
  };
}

function makeRsvp(
  member: KeyPair,
  eventId: string,
  overrides: Partial<EventRsvpState> = {},
): EventRsvpState {
  const now = Date.now();
  const unsigned: Omit<EventRsvpState, "signature"> = {
    id: `rsvp_${++seq}`,
    eventId,
    memberKey: member.publicKey,
    status: "going",
    respondedAt: now,
    updatedAt: now + seq,
    signerKey: member.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature: signStateRecord<EventRsvpState>(unsigned, member.secretKey),
  };
}

function makeProjectState(
  signer: KeyPair,
  overrides: Partial<ProjectState> = {},
): ProjectState {
  const unsigned: Omit<ProjectState, "signature"> = {
    id: `proj_${++seq}`,
    title: "Community fridge",
    description: "Keep the fridge stocked and clean.",
    category: "mutual_aid_drive",
    organizerKey: signer.publicKey,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 40,
    contributedHours: 0,
    deadline: null,
    createdAt: Date.now() - 60_000,
    completedAt: null,
    pauseNote: null,
    pausedAt: null,
    locationZone: "North side",
    tags: [],
    nodeId: "node_mirror",
    templateId: null,
    updatedAt: Date.now() + ++seq,
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature: signStateRecord<ProjectState>(unsigned, signer.secretKey),
  };
}

function makeTaskState(
  signer: KeyPair,
  projectId: string,
  overrides: Partial<ProjectTaskState> = {},
): ProjectTaskState {
  const unsigned: Omit<ProjectTaskState, "signature"> = {
    id: `task_${++seq}`,
    projectId,
    title: "Restock shelf",
    description: "",
    estimatedHours: 2,
    status: "open",
    assignedTo: null,
    completedBy: null,
    createdAt: Date.now() - 30_000,
    completedAt: null,
    recurrence: null,
    updatedAt: Date.now() + seq,
    signerKey: signer.publicKey,
    ...overrides,
  };
  return {
    ...unsigned,
    signature: signStateRecord<ProjectTaskState>(unsigned, signer.secretKey),
  };
}

function makePost(author: KeyPair): Post {
  const createdAt = Date.now() - 10_000 + ++seq;
  const payload = {
    id: `post_${seq}`,
    type: "OFFER" as const,
    category: "other" as const,
    title: "Bike repair",
    description: "Flats fixed, brakes adjusted.",
    estimatedHours: 1,
    urgency: "low" as const,
    postedBy: author.publicKey,
    createdAt,
    expiresAt: null,
    locationZone: "North side",
    nodeId: "node_mirror",
  };
  return {
    ...payload,
    claimedBy: null,
    status: "open",
    confirmedBy: [],
    signature: sign(canonicalPostPayload(payload), author.secretKey),
  };
}

function makeMemberExchange(): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    id: `x_${++seq}`,
    postId: `post_x_${seq}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 1,
    category: "other" as const,
    completedAt: Date.now() - 1_000 + seq,
    nodeId: "node_mirror",
  };
  const payload = canonicalExchangePayload({
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hours: base.hoursExchanged,
    category: base.category,
    completedAt: base.completedAt,
  });
  return {
    ...base,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
  };
}

function makeSystemSignedExchange(opts: {
  systemSecretKey: string;
  nodeId: string;
}): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const base = {
    id: `xa_${++seq}`,
    postId: `post_xa_${seq}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: 1,
    category: "other" as const,
    completedAt: Date.now() - 1_000 + seq,
    nodeId: opts.nodeId,
  };
  const payload = canonicalExchangePayload({
    postId: base.postId,
    helperKey: base.helperKey,
    helpedKey: base.helpedKey,
    hours: base.hoursExchanged,
    category: base.category,
    completedAt: base.completedAt,
  });
  return {
    ...base,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, opts.systemSecretKey),
    autoConfirmed: true,
    autoConfirmedBy: `system:${opts.nodeId}`,
    autoConfirmedAt: base.completedAt,
  };
}

function makeReceipt(
  inviter: KeyPair,
  redeemer: KeyPair,
  overrides: { createdAt?: number; expiresAt?: number; redeemedAt?: number } = {},
): RedemptionReceipt {
  const invitePayload = {
    token: `tok_${++seq}_${redeemer.publicKey.slice(0, 8)}`,
    inviterKey: inviter.publicKey,
    inviterName: "Inviter",
    nodeId: "node_mirror",
    createdAt: overrides.createdAt ?? Date.now() - 1000,
    expiresAt: overrides.expiresAt ?? Date.now() + 86_400_000,
  };
  const invite = {
    ...invitePayload,
    signature: sign(canonicalInvitePayload(invitePayload), inviter.secretKey),
  };
  const payload = {
    invite,
    redeemedBy: redeemer.publicKey,
    displayName: "New Member",
    redeemedAt: overrides.redeemedAt ?? Date.now(),
  };
  return {
    ...payload,
    signature: sign(canonicalRedemptionPayload(payload), redeemer.secretKey),
  };
}

async function postToMirror(url: string, payload: unknown): Promise<void> {
  const res = await mirror.app.inject({ method: "POST", url, payload });
  if (res.statusCode !== 200 && res.statusCode !== 201) {
    throw new Error(`seed POST ${url} → ${res.statusCode} ${res.body}`);
  }
}

// ---------------------------------------------------------------------

describe("MIRROR_KINDS completeness", () => {
  it("every spec matches a live feed: the GET path exists and serves the bodyKey array", async () => {
    for (const spec of MIRROR_KINDS) {
      const res = await local.app.inject({
        method: "GET",
        url: `${spec.path}?limit=1`,
      });
      expect(res.statusCode, spec.path).toBe(200);
      const body = res.json() as Record<string, unknown>;
      expect(Array.isArray(body[spec.bodyKey]), `${spec.path} → ${spec.bodyKey}`).toBe(
        true,
      );
    }
  });
});

describe("mirror replication end-to-end", () => {
  it("replicates a representative record of every family, including LWW state and receipts", async () => {
    const organizer = generateKeyPair();
    const member = generateKeyPair();

    const event = makeEvent(organizer);
    await postToMirror("/events", event);
    const shift = makeShift(organizer, event.id);
    await postToMirror("/event-shifts", shift);
    await postToMirror("/shift-signups", makeSignup(member, shift.id, event.id));
    await postToMirror("/event-rsvps", makeRsvp(member, event.id));
    const project = makeProjectState(organizer);
    await postToMirror("/project-states", project);
    await postToMirror("/task-states", makeTaskState(organizer, project.id));
    const post = makePost(member);
    await postToMirror("/posts", post);
    await postToMirror("/claims", {
      postId: post.id,
      claimerKey: member.publicKey,
      claimedAt: Date.now(),
      nodeId: "node_mirror",
    });
    await postToMirror("/exchanges", makeMemberExchange());
    const receipt = makeReceipt(organizer, member);
    await postToMirror("/redemptions", receipt);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();

    expect(results.every((r) => !r.halted)).toBe(true);
    const feeds: [string, string, number][] = [
      ["/events", "events", 1],
      ["/event-shifts", "eventShifts", 1],
      ["/shift-signups", "shiftSignups", 1],
      ["/event-rsvps", "eventRsvps", 1],
      ["/project-states", "projectStates", 1],
      ["/task-states", "taskStates", 1],
      ["/posts", "posts", 1],
      ["/claims", "claims", 1],
      ["/exchanges", "exchanges", 1],
      ["/redemptions", "redemptions", 1],
    ];
    for (const [path, key, count] of feeds) {
      const res = await local.app.inject({ method: "GET", url: path });
      const rows = (res.json() as Record<string, unknown[]>)[key];
      expect(rows.length, path).toBe(count);
    }

    // The receipt keeps the ORIGIN node's receivedAt (the feed cursor)
    // instead of being re-stamped on the replica.
    const mirrorRow = (
      (await mirror.app.inject({ method: "GET", url: "/redemptions" })).json() as {
        redemptions: { receivedAt: number }[];
      }
    ).redemptions[0];
    const localRow = (
      (await local.app.inject({ method: "GET", url: "/redemptions" })).json() as {
        redemptions: { receivedAt: number }[];
      }
    ).redemptions[0];
    expect(localRow.receivedAt).toBe(mirrorRow.receivedAt);
  });

  it("second cycle applies nothing — the per-kind cursor persisted", async () => {
    const organizer = generateKeyPair();
    await postToMirror("/events", makeEvent(organizer));
    await postToMirror("/posts", makePost(organizer));

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const first = await worker.pullAllOnce();
    expect(first.reduce((n, r) => n + r.applied, 0)).toBe(2);
    const second = await worker.pullAllOnce();
    worker.stop();
    expect(second.reduce((n, r) => n + r.applied, 0)).toBe(0);
    expect(second.reduce((n, r) => n + r.refused, 0)).toBe(0);
  });

  it("replicates a receipt from far outside the delivery-grace window (catch-up must not orphan membership)", async () => {
    const inviter = generateKeyPair();
    const redeemer = generateKeyPair();
    const MONTH = 30 * 24 * 60 * 60 * 1000;
    const receipt = makeReceipt(inviter, redeemer, {
      createdAt: Date.now() - 2 * MONTH,
      expiresAt: Date.now() - MONTH,
      redeemedAt: Date.now() - MONTH - 1000,
    });
    const originalReceivedAt = Date.now() - MONTH - 500;
    // Seed the mirror's store directly — the receipt was accepted
    // back when it was fresh; only this replica is late.
    createRedemptionStore(dbMirror).insert(receipt, originalReceivedAt);

    // Sanity: a REGULAR submission of this receipt is refused (the
    // grace window is intact for non-mirror callers).
    const direct = await local.app.inject({
      method: "POST",
      url: "/redemptions",
      payload: receipt,
    });
    expect(direct.statusCode).toBe(409);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    const kind = results.find((r) => r.kind === "/redemptions");
    expect(kind?.applied).toBe(1);
    const row = (
      (await local.app.inject({ method: "GET", url: "/redemptions" })).json() as {
        redemptions: { receivedAt: number }[];
      }
    ).redemptions[0];
    expect(row.receivedAt).toBe(originalReceivedAt);
  });

  it("LWW: a stale mirror copy never clobbers a newer local row, and a tombstone wins", async () => {
    const organizer = generateKeyPair();
    const member = generateKeyPair();
    const event = makeEvent(organizer);
    await postToMirror("/events", event);
    await local.app.inject({ method: "POST", url: "/events", payload: event });

    // Local holds the NEWER rsvp; the mirror serves an older one.
    const older = makeRsvp(member, event.id, { updatedAt: Date.now() - 60_000 });
    const newer = makeRsvp(member, event.id, {
      status: "not_going",
      updatedAt: Date.now(),
    });
    await postToMirror("/event-rsvps", older);
    await local.app.inject({
      method: "POST",
      url: "/event-rsvps",
      payload: newer,
    });

    // The mirror also serves a tombstoned shift NEWER than the live
    // local copy.
    const shiftLive = makeShift(organizer, event.id, {
      updatedAt: Date.now() - 60_000,
    });
    await local.app.inject({
      method: "POST",
      url: "/event-shifts",
      payload: shiftLive,
    });
    const shiftGone = makeShift(organizer, event.id, {
      id: shiftLive.id,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    await postToMirror("/event-shifts", shiftGone);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results.every((r) => !r.halted)).toBe(true);

    const rsvps = (
      (await local.app.inject({ method: "GET", url: "/event-rsvps" })).json() as {
        eventRsvps: EventRsvpState[];
      }
    ).eventRsvps;
    expect(rsvps).toHaveLength(1);
    expect(rsvps[0].status).toBe("not_going");

    const shifts = (
      (await local.app.inject({ method: "GET", url: "/event-shifts" })).json() as {
        eventShifts: EventShiftState[];
      }
    ).eventShifts;
    expect(shifts).toHaveLength(1);
    expect(shifts[0].deletedAt).not.toBeNull();
  });

  it("heals a referent race: signup halts on unknown shift, applies once the shift arrives", async () => {
    const organizer = generateKeyPair();
    const member = generateKeyPair();
    const event = makeEvent(organizer);
    await postToMirror("/events", event);

    // The signup is on the mirror while its shift is not (seeded
    // around the route to simulate feed lag between mirrors).
    const shift = makeShift(organizer, event.id);
    const signup = makeSignup(member, shift.id, event.id);
    createShiftSignupStateStore(dbMirror).upsert(signup);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const first = await worker.pullAllOnce();
    const signupResult1 = first.find((r) => r.kind === "/shift-signups");
    expect(signupResult1?.halted).toBe(true);
    expect(signupResult1?.applied).toBe(0);

    // Next cycle the shift has replicated between mirrors.
    await postToMirror("/event-shifts", shift);
    const second = await worker.pullAllOnce();
    worker.stop();
    const signupResult2 = second.find((r) => r.kind === "/shift-signups");
    expect(signupResult2?.halted).toBe(false);
    expect(signupResult2?.applied).toBe(1);
  });

  it("bounds 403 retries: a permanently unauthorized row is skipped after the budget, unwedging the kind", async () => {
    const organizer = generateKeyPair();
    const rando = generateKeyPair();
    const event = makeEvent(organizer);
    await postToMirror("/events", event);

    // Validly signed but not by the event organizer → local 403,
    // permanent (authority never changes for events).
    const rogue = makeShift(rando, event.id);
    createEventShiftStateStore(dbMirror).upsert(rogue);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    for (let i = 1; i < MAX_AUTHORITY_RETRIES; i++) {
      const results = await worker.pullAllOnce();
      const r = results.find((x) => x.kind === "/event-shifts");
      expect(r?.halted, `cycle ${i}`).toBe(true);
    }
    const final = await worker.pullAllOnce();
    const r = final.find((x) => x.kind === "/event-shifts");
    expect(r?.halted).toBe(false);
    expect(r?.refused).toBe(1);

    // The kind is not wedged: a legitimate shift now replicates.
    await postToMirror("/event-shifts", makeShift(organizer, event.id));
    const after = await worker.pullAllOnce();
    worker.stop();
    expect(after.find((x) => x.kind === "/event-shifts")?.applied).toBe(1);
  });

  it("bypasses the local rate limit for its own applies", async () => {
    // Rebuild the LOCAL server with a rate limit far below the number
    // of rows the worker will apply in one burst.
    await local.app.close();
    dbLocal.close();
    ({ built: local, db: dbLocal } = await build("node_local", {
      RATE_LIMIT_MAX: "2",
    }));

    const author = generateKeyPair();
    for (let i = 0; i < 6; i++) {
      await postToMirror("/posts", makePost(author));
    }
    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    const posts = results.find((r) => r.kind === "/posts");
    expect(posts?.halted).toBe(false);
    expect(posts?.applied).toBe(6);
  });
});

describe("auto-confirmed exchanges (§4 via mirrors)", () => {
  it("verifies a system-signed row against the mirror's published /config key", async () => {
    // Rebuild the MIRROR with a system key so its /config publishes it.
    await mirror.app.close();
    dbMirror.close();
    const systemKp = generateKeyPair();
    ({ built: mirror, db: dbMirror } = await build("node_mirror", {
      NODE_SYSTEM_SECRET_KEY: systemKp.secretKey,
    }));

    const row = makeSystemSignedExchange({
      systemSecretKey: systemKp.secretKey,
      nodeId: "node_mirror",
    });
    createExchangeStore(dbMirror).insert(row);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    const exchanges = results.find((r) => r.kind === "/exchanges");
    expect(exchanges?.halted).toBe(false);
    expect(exchanges?.applied).toBe(1);
    expect(createExchangeStore(dbLocal).has(row.id)).toBe(true);
  });

  it("halts (never skips) a row whose confirming node's key is unresolvable", async () => {
    const strangerKp = generateKeyPair();
    const row = makeSystemSignedExchange({
      systemSecretKey: strangerKp.secretKey,
      nodeId: "node_elsewhere",
    });
    createExchangeStore(dbMirror).insert(row);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    const exchanges = results.find((r) => r.kind === "/exchanges");
    expect(exchanges?.halted).toBe(true);
    expect(exchanges?.applied).toBe(0);
    expect(exchanges?.refused).toBe(0);
    expect(createExchangeStore(dbLocal).has(row.id)).toBe(false);
    worker.stop();
  });

  it("verifies a row this node auto-confirmed itself via ownSystemKey", async () => {
    const ownKp = generateKeyPair();
    const row = makeSystemSignedExchange({
      systemSecretKey: ownKp.secretKey,
      nodeId: "node_local",
    });
    createExchangeStore(dbMirror).insert(row);

    const worker = makeWorker({
      fetcher: proxyFetcher(() => mirror),
      ownSystemKey: {
        nodeId: "node_local",
        current: ownKp.publicKey,
        history: [],
      },
    });
    const results = await worker.pullAllOnce();
    worker.stop();
    expect(results.find((r) => r.kind === "/exchanges")?.applied).toBe(1);
  });
});

function makeSignedPosture(opts: {
  signSecretKey: string;
  signerKey: string;
  nodeId: string;
  pressure?: CapacityPosture["pressure"];
  updatedAt?: number;
}): CapacityPosture {
  const unsigned: Omit<CapacityPosture, "signature"> = {
    nodeId: opts.nodeId,
    pressure: opts.pressure ?? "red",
    horizon: "weeks",
    growthRecommended: (opts.pressure ?? "red") === "red",
    updatedAt: opts.updatedAt ?? 1_700_000_000_000,
    signerKey: opts.signerKey,
  };
  return {
    ...unsigned,
    signature: signStateRecord<CapacityPosture>(unsigned, opts.signSecretKey),
  };
}

describe("capacity postures (§6 node-system-key, via mirrors)", () => {
  it("replicates a posture signed by the mirror's published system key", async () => {
    await mirror.app.close();
    dbMirror.close();
    const systemKp = generateKeyPair();
    ({ built: mirror, db: dbMirror } = await build("node_mirror", {
      NODE_SYSTEM_SECRET_KEY: systemKp.secretKey,
    }));

    const posture = makeSignedPosture({
      signSecretKey: systemKp.secretKey,
      signerKey: systemKp.publicKey,
      nodeId: "node_mirror",
    });
    createCapacityPostureStore(dbMirror).upsert(posture);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    const kind = results.find((r) => r.kind === "/capacity-postures");
    expect(kind?.halted).toBe(false);
    expect(kind?.applied).toBe(1);
    const local = createCapacityPostureStore(dbLocal).get("node_mirror");
    expect(local?.pressure).toBe("red");
  });

  it("refuses a posture whose signer is not the node's system key", async () => {
    await mirror.app.close();
    dbMirror.close();
    const systemKp = generateKeyPair();
    ({ built: mirror, db: dbMirror } = await build("node_mirror", {
      NODE_SYSTEM_SECRET_KEY: systemKp.secretKey,
    }));

    // Internally-valid signature, but by a stranger key — not the key
    // node_mirror advertises. Authority fails: refused, cursor advances.
    const stranger = generateKeyPair();
    const posture = makeSignedPosture({
      signSecretKey: stranger.secretKey,
      signerKey: stranger.publicKey,
      nodeId: "node_mirror",
    });
    createCapacityPostureStore(dbMirror).upsert(posture);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    const kind = results.find((r) => r.kind === "/capacity-postures");
    expect(kind?.halted).toBe(false);
    expect(kind?.applied).toBe(0);
    expect(kind?.refused).toBe(1);
    expect(createCapacityPostureStore(dbLocal).get("node_mirror")).toBeNull();
  });

  it("halts (never skips) a posture for a node whose key is unresolvable", async () => {
    const stranger = generateKeyPair();
    const posture = makeSignedPosture({
      signSecretKey: stranger.secretKey,
      signerKey: stranger.publicKey,
      nodeId: "node_elsewhere",
    });
    createCapacityPostureStore(dbMirror).upsert(posture);

    const worker = makeWorker({ fetcher: proxyFetcher(() => mirror) });
    const results = await worker.pullAllOnce();
    worker.stop();
    const kind = results.find((r) => r.kind === "/capacity-postures");
    expect(kind?.halted).toBe(true);
    expect(kind?.applied).toBe(0);
    expect(kind?.refused).toBe(0);
    expect(createCapacityPostureStore(dbLocal).get("node_elsewhere")).toBeNull();
  });
});

describe("worker safety rails", () => {
  it("halts a kind on an implausibly future cursor stamp instead of poisoning the cursor", async () => {
    const author = generateKeyPair();
    const good = makePost(author);
    await postToMirror("/posts", good);

    const fetcher: MirrorFetcher = async (url, headers) => {
      const u = new URL(url);
      if (u.pathname === "/posts") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            count: 1,
            posts: [{ ...good, createdAt: Date.now() + 7 * 86_400_000 }],
          }),
        };
      }
      return proxyFetcher(() => mirror)(url, headers);
    };
    const worker = makeWorker({ fetcher });
    const results = await worker.pullAllOnce();
    worker.stop();
    const posts = results.find((r) => r.kind === "/posts");
    expect(posts?.halted).toBe(true);
    expect(createMirrorPullStore(dbLocal).get(MIRROR_URL, "/posts")).toBeNull();
  });

  it("sends the configured bearer token on mirror reads", async () => {
    const seen: (string | undefined)[] = [];
    const fetcher: MirrorFetcher = async (url, headers) => {
      seen.push(headers?.authorization);
      return proxyFetcher(() => mirror)(url, headers);
    };
    const worker = makeWorker({
      fetcher,
      readTokens: { [MIRROR_URL]: "sixteen-char-token" },
    });
    await worker.pullAllOnce();
    worker.stop();
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((h) => h === "Bearer sixteen-char-token")).toBe(true);
  });
});
