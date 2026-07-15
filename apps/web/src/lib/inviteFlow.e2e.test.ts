/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { getSecretKey } from "@/db/secrets";
import {
  addProjectTask,
  createProject,
  launchProject,
} from "@/db/projects";
import { createEvent } from "@/db/events";
import { createPost } from "@/db/actions";
import { issueInvite, redeemInvite } from "@/db/invites";
import { claimFounder } from "@/lib/nodeClaim";
import { writeSubmitConfig } from "@/lib/nodeSubmit";
import { flushOutboxNow } from "@/lib/outbox";
import { authorizedFetch } from "@/lib/authorizedRead";
import {
  pullFederatedEvents,
  pullFederatedPosts,
  pullFederatedProjectStates,
  pullFederatedRedemptions,
  pullFederatedTaskStates,
} from "@/lib/federationSync";

// END-TO-END invite flow against a REAL server process — the exact
// production sequence reported broken (2026-07): founder claims the
// node and creates projects/events/posts; a fresh device redeems the
// founder's invite, connects, and syncs. The invitee MUST see the
// founder's content. Every step uses the real data layer and real
// HTTP; nothing is mocked.
//
// Two orderings, because the ORDER was the bug:
//  1. connect → claim → create → invite (the happy path);
//  2. create → connect → claim → invite (the production incident:
//     content authored before the device had a node URL was never
//     enqueued, and pre-claim flush attempts 403'd — this test locks
//     the backfill + retryable-403 fixes).

const COMMUNITY_NODE_ID = "node_e2e";
const SETUP_CODE = "e2e-setup-code-1234";

let server: ChildProcess | null = null;
let dataDir: string | null = null;

async function startServer(port: number): Promise<string> {
  const base = `http://127.0.0.1:${port}`;
  dataDir = mkdtempSync(join(tmpdir(), "understoria-e2e-"));
  server = spawn(
    process.execPath,
    [join(__dirname, "../../../server/dist/index.js")],
    {
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: String(port),
        NODE_ID: COMMUNITY_NODE_ID,
        SETUP_TOKEN: SETUP_CODE,
        DATABASE_PATH: join(dataDir, "e2e.db"),
        LOG_LEVEL: "fatal",
        RATE_LIMIT_MAX: "100000",
      },
      stdio: ["ignore", "ignore", "ignore"],
    },
  );
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) return base;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("server did not become healthy");
}

afterEach(async () => {
  if (server) {
    server.kill("SIGTERM");
    server = null;
    await new Promise((r) => setTimeout(r, 300));
  }
  if (dataDir) {
    rmSync(dataDir, { recursive: true, force: true });
    dataDir = null;
  }
});

async function freshDevice() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

/** Flush until the queue drains, fast-forwarding the retry backoff
 *  (4s × 2^attempts) between passes — the production worker does the
 *  same retries, just on its own clock. Multiple passes are expected:
 *  e.g. a task_state answered 409 unknown_project until its project
 *  record lands, then succeeds on the next attempt. */
async function drainOutbox(maxPasses = 5) {
  for (let pass = 0; pass < maxPasses; pass++) {
    await db.outbox
      .where("status")
      .equals("pending")
      .modify({ nextAttemptAt: Date.now() });
    await flushOutboxNow();
    const remaining = await db.outbox
      .filter((o) => o.status !== "delivered")
      .count();
    if (remaining === 0) return;
  }
}

async function signedReadStatus(base: string, path: string): Promise<number> {
  const res = await authorizedFetch(`${base}${path}`, base);
  return res.status;
}

/** The founder's content set, mirroring the production community. */
async function createFounderContent(founderKey: string) {
  const project = await createProject(
    founderKey,
    {
      title: "Tool library",
      description: "Shared tools for the block",
      category: "infrastructure",
      targetHours: 10,
      deadline: null,
      locationZone: "North",
      tags: [],
      templateId: null,
    },
    COMMUNITY_NODE_ID,
  );
  await launchProject(project.id, founderKey);
  await addProjectTask(project.id, founderKey, {
    title: "Build the shelves",
    description: "",
    category: "infrastructure",
    estimatedHours: 3,
    urgency: "low",
    requiredSkills: [],
    dependencies: [],
  });
  await createEvent({
    title: "Opening day",
    description: "Come see the library",
    category: "gathering",
    startsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    endsAt: null,
    location: "The garage",
    capacity: null,
    templateId: null,
    organizerKey: founderKey,
    organizerSecretKey: await getSecretKey(founderKey),
    nodeId: COMMUNITY_NODE_ID,
  });
  await createPost(founderKey, "North", {
    type: "OFFER",
    category: "other",
    title: "Ladder to lend",
    description: "8ft, sturdy",
    estimatedHours: 1,
    urgency: "low",
    expiresAt: null,
  }, COMMUNITY_NODE_ID);
}

/** The invitee's whole journey, shared by both orderings: redeem on a
 *  brand-new device, connect (the consent card), deliver the receipt,
 *  and pull one sync cycle. Returns what the invitee can see. */
async function inviteeJourney(base: string, encoded: string) {
  await freshDevice();
  const DEVICE_NODE_ID = "node_fresh_device_random";
  await setSetting(SETTING_KEYS.nodeId, DEVICE_NODE_ID);

  const redeemed = await redeemInvite(encoded, "Invitee", DEVICE_NODE_ID);
  expect(redeemed.ok).toBe(true);
  if (!redeemed.ok) throw new Error("unreachable");
  await setSetting(
    SETTING_KEYS.currentMember,
    redeemed.value.member.publicKey,
  );
  await writeSubmitConfig({ url: base, enabled: true });
  await flushOutboxNow();

  expect(await signedReadStatus(base, "/posts?limit=1")).toBe(200);

  await pullFederatedRedemptions();
  await pullFederatedPosts();
  await pullFederatedEvents();
  await pullFederatedProjectStates();
  await pullFederatedTaskStates();

  return {
    projects: (await db.projects.toArray()).map((p) => p.title),
    tasks: (await db.projectTasks.toArray()).map((t) => t.title),
    events: (await db.events.toArray()).map((e) => e.title),
    posts: (await db.posts.toArray()).map((p) => p.title),
    adoptedNodeId: await getSetting(SETTING_KEYS.nodeId),
  };
}

const EXPECTED = {
  projects: ["Tool library"],
  tasks: ["Build the shelves"],
  events: ["Opening day"],
  posts: ["Ladder to lend"],
  adoptedNodeId: COMMUNITY_NODE_ID,
};

describe("invite flow, end to end (real server, real HTTP)", () => {
  it("happy path: connect → claim → create → invite → the invitee sees everything", async () => {
    const base = await startServer(8797);

    await freshDevice();
    const founder = await createMember(
      { displayName: "Founder" },
      COMMUNITY_NODE_ID,
    );
    await setSetting(SETTING_KEYS.currentMember, founder.publicKey);
    await setSetting(SETTING_KEYS.nodeId, COMMUNITY_NODE_ID);
    await writeSubmitConfig({ url: base, enabled: true });
    expect(
      await claimFounder({
        url: base,
        setupToken: SETUP_CODE,
        publicKey: founder.publicKey,
      }),
    ).toEqual({ ok: true });

    await createFounderContent(founder.publicKey);
    await flushOutboxNow();
    const undelivered = await db.outbox
      .filter((o) => o.status !== "delivered")
      .toArray();
    expect(
      undelivered.map((o) => `${o.kind}:${o.status}:${o.lastError ?? ""}`),
    ).toEqual([]);

    const invite = await issueInvite({
      inviterKey: founder.publicKey,
      inviterName: "Founder",
      nodeId: COMMUNITY_NODE_ID,
    });

    expect(await inviteeJourney(base, invite.row.encoded!)).toMatchObject(
      EXPECTED,
    );
  }, 60_000);

  it("PRODUCTION SEQUENCE: create BEFORE connecting, claim after first flush — backfill + retryable 403 carry everything through", async () => {
    const base = await startServer(8798);

    // Founder authors everything with NO node configured — exactly
    // what a local-first founder does while their server isn't up
    // yet (or points at an abandoned URL). Before the backfill fix,
    // none of this ever reached any server.
    await freshDevice();
    const founder = await createMember(
      { displayName: "Founder" },
      COMMUNITY_NODE_ID,
    );
    await setSetting(SETTING_KEYS.currentMember, founder.publicKey);
    await setSetting(SETTING_KEYS.nodeId, COMMUNITY_NODE_ID);
    await createFounderContent(founder.publicKey);

    // Connect. The backfill must re-enqueue the pre-connection
    // records (writeSubmitConfig triggers it).
    await writeSubmitConfig({ url: base, enabled: true });

    // First flush runs against the still-UNCLAIMED node: member-gated
    // writes answer 403. Before the fix those rows were POISONED
    // forever; now they must survive as pending retries.
    await flushOutboxNow();
    const poisoned = await db.outbox
      .filter((o) => o.status === "poisoned")
      .toArray();
    expect(
      poisoned.map((o) => `${o.kind}:${o.lastError ?? ""}`),
      "pre-claim 403s must not poison the queue",
    ).toEqual([]);

    // The founder claims — the ceremony that makes them a member —
    // and the queue drains on the following retries. What matters is
    // that retries AFTER the claim succeed.
    expect(
      await claimFounder({
        url: base,
        setupToken: SETUP_CODE,
        publicKey: founder.publicKey,
      }),
    ).toEqual({ ok: true });
    await drainOutbox();
    const undelivered = await db.outbox
      .filter((o) => o.status !== "delivered")
      .toArray();
    expect(
      undelivered.map((o) => `${o.kind}:${o.status}:${o.lastError ?? ""}`),
      "every pre-connection record must reach the node after the claim",
    ).toEqual([]);

    const invite = await issueInvite({
      inviterKey: founder.publicKey,
      inviterName: "Founder",
      nodeId: COMMUNITY_NODE_ID,
    });

    expect(await inviteeJourney(base, invite.row.encoded!)).toMatchObject(
      EXPECTED,
    );
  }, 60_000);
});
