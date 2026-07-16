/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import {
  createServer,
  request as httpRequest,
  type Server,
} from "node:http";
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
import { suggestNodeUrlFromOrigin } from "@/lib/nodeOriginSuggest";
import {
  communityNodeIdSet,
  isOurNode,
  readNodeIdAliases,
} from "@/lib/nodeIdentity";
import { inviteTokenHash } from "@understoria/shared/crypto";

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
  const serverEntry = join(__dirname, "../../../server/dist/index.js");
  if (!existsSync(serverEntry)) {
    throw new Error(
      "server binary not built — run `npm run build:server` from the repo root first",
    );
  }
  const base = `http://127.0.0.1:${port}`;
  dataDir = mkdtempSync(join(tmpdir(), "understoria-e2e-"));
  server = spawn(
    process.execPath,
    [serverEntry],
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

let proxy: Server | null = null;

/** A Caddy-shaped reverse proxy (deploy/Caddyfile): requests to
 *  `/api/*` forward to the node with the `/api` prefix STRIPPED —
 *  everything else is where the PWA shell would be. This is the
 *  topology every member device actually talks to in production. */
function startApiProxy(port: number, targetPort: number): Promise<string> {
  return new Promise((resolve, reject) => {
    proxy = createServer((req, res) => {
      const url = req.url ?? "";
      if (url !== "/api" && !url.startsWith("/api/")) {
        res.statusCode = 200;
        res.setHeader("content-type", "text/html");
        res.end("<!doctype html><title>PWA shell</title>");
        return;
      }
      const stripped = url.slice("/api".length) || "/";
      const upstream = httpRequest(
        {
          host: "127.0.0.1",
          port: targetPort,
          path: stripped,
          method: req.method,
          headers: { ...req.headers, host: `127.0.0.1:${targetPort}` },
        },
        (up) => {
          res.writeHead(up.statusCode ?? 502, up.headers);
          up.pipe(res);
        },
      );
      upstream.on("error", () => {
        res.statusCode = 502;
        res.end();
      });
      req.pipe(upstream);
    });
    proxy.once("error", reject);
    proxy.listen(port, "127.0.0.1", () =>
      resolve(`http://127.0.0.1:${port}`),
    );
  });
}

afterEach(async () => {
  if (proxy) {
    await new Promise((r) => proxy!.close(r));
    proxy = null;
  }
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
async function createFounderContent(
  founderKey: string,
  nodeId: string = COMMUNITY_NODE_ID,
) {
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
    nodeId,
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
    nodeId,
  });
  await createPost(founderKey, "North", {
    type: "OFFER",
    category: "other",
    title: "Ladder to lend",
    description: "8ft, sturdy",
    estimatedHours: 1,
    urgency: "low",
    expiresAt: null,
  }, nodeId);
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

  it("FULL DEPLOYMENT SHAPE: /api reverse proxy + device-random ids + the §5.3 consent journey — the invite ACTUALLY joins the community", async () => {
    // The production topology exactly (deploy/Caddyfile): PWA and API
    // on one origin, API under /api with the prefix stripped; the
    // founder's device minted its own random community id at Welcome
    // (it never saw the server's NODE_ID); the invitee goes through
    // the REAL page-level journey — redeem, the origin-derived §5.3
    // suggestion (the consent card), confirm, sync. The invitee must
    // end up a MEMBER whose screens SHOW the community — the "island
    // account" report is this test failing.
    await startServer(8799);
    const proxyOrigin = await startApiProxy(8899, 8799);
    const apiUrl = `${proxyOrigin}/api`;

    // Founder: connected + claimed via the /api URL, content authored
    // under the device-random community id.
    await freshDevice();
    const FOUNDER_DEVICE_ID = "node_founder_device_random";
    const founder = await createMember(
      { displayName: "Founder" },
      FOUNDER_DEVICE_ID,
    );
    await setSetting(SETTING_KEYS.currentMember, founder.publicKey);
    await setSetting(SETTING_KEYS.nodeId, FOUNDER_DEVICE_ID);
    await writeSubmitConfig({ url: apiUrl, enabled: true });
    expect(
      await claimFounder({
        url: apiUrl,
        setupToken: SETUP_CODE,
        publicKey: founder.publicKey,
      }),
    ).toEqual({ ok: true });
    await createFounderContent(founder.publicKey, FOUNDER_DEVICE_ID);
    await drainOutbox();
    expect(
      (await db.outbox.filter((o) => o.status !== "delivered").toArray()).map(
        (o) => `${o.kind}:${o.status}:${o.lastError ?? ""}`,
      ),
      "founder content must reach the node through the /api proxy",
    ).toEqual([]);

    const invite = await issueInvite({
      inviterKey: founder.publicKey,
      inviterName: "Founder",
      nodeId:
        (await getSetting(SETTING_KEYS.nodeId)) ?? FOUNDER_DEVICE_ID,
    });
    // Server registration (operator ruling 2026-07): issuing the
    // invite queues a hash-only announcement for the node; after a
    // drain the server must KNOW this invite and show it open.
    await drainOutbox();
    const tokenHash = inviteTokenHash(invite.row.token);
    const announced = (await (
      await authorizedFetch(`${apiUrl}/invite-announcements`, apiUrl)
    ).json()) as {
      inviteAnnouncements: Array<{ tokenHash: string; status: string }>;
    };
    expect(
      announced.inviteAnnouncements.find((a) => a.tokenHash === tokenHash),
      "the invite must be registered on the server at issue time",
    ).toMatchObject({ status: "open" });

    // INVITEE — the page's own steps, in the page's own order.
    await freshDevice();
    await setSetting(SETTING_KEYS.nodeId, "node_fresh_device_random");
    const redeemed = await redeemInvite(
      invite.row.encoded!,
      "Invitee",
      "node_fresh_device_random",
    );
    expect(redeemed.ok).toBe(true);
    if (!redeemed.ok) throw new Error("unreachable");
    await setSetting(
      SETTING_KEYS.currentMember,
      redeemed.value.member.publicKey,
    );

    // The origin-derived join URL must resolve — redeeming an invite
    // JOINS the server automatically (operator ruling, 2026-07), and a
    // null suggestion would strand the invitee as a standalone
    // account. The suggest gate excludes loopback origins by design
    // (dev protection), so we present it a production-shaped hostname
    // whose fetches the wrapper maps onto the local proxy.
    const PROD_ORIGIN = "https://community.example";
    const rewriteFetch: typeof fetch = (input, init) =>
      globalThis.fetch(
        String(input).replace(PROD_ORIGIN, proxyOrigin),
        init,
      );
    const suggestion = await suggestNodeUrlFromOrigin({
      origin: PROD_ORIGIN,
      fetchImpl: rewriteFetch,
      isDev: false,
    });
    expect(
      suggestion,
      "the origin-derived join URL must resolve on the invite success path",
    ).toBe(`${PROD_ORIGIN}/api`);

    // The invite page auto-connects with exactly this call — no card,
    // no extra tap. In the test we persist the reachable address the
    // fake host maps to; production persists the suggestion itself.
    await writeSubmitConfig({ url: apiUrl, enabled: true });
    await drainOutbox();

    // Membership: the redemption receipt must have made the invitee a
    // member — signed reads answer 200, not 403.
    expect(
      await signedReadStatus(apiUrl, "/posts?limit=1"),
      "invitee must be a MEMBER after the receipt lands — not an island",
    ).toBe(200);

    // One sync cycle, exactly what the app's loop runs.
    await pullFederatedRedemptions();
    await pullFederatedPosts();
    await pullFederatedEvents();
    await pullFederatedProjectStates();
    await pullFederatedTaskStates();

    // THE UI TRUTH: what the invitee's screens actually render —
    // records filtered through the app's own "is this record ours?"
    // predicate (Dashboard, Board, stats all use it). Content that is
    // in Dexie but outside this scope is invisible: the island.
    const communityIds = communityNodeIdSet(
      (await getSetting(SETTING_KEYS.nodeId)) ?? "",
      await readNodeIdAliases(),
      (await db.invites.toArray()).map((i) => i.nodeId),
    );
    const visible = {
      projects: (await db.projects.toArray())
        .filter((p) => isOurNode(p.nodeId, communityIds))
        .map((p) => p.title),
      events: (await db.events.toArray())
        .filter((e) => isOurNode(e.nodeId, communityIds))
        .map((e) => e.title),
      posts: (await db.posts.toArray())
        .filter((p) => isOurNode(p.nodeId, communityIds))
        .map((p) => p.title),
    };
    expect(visible, "the invitee's screens must SHOW the community").toEqual({
      projects: ["Tool library"],
      events: ["Opening day"],
      posts: ["Ladder to lend"],
    });

    // And the server-side record flipped: the community node knows
    // this invite was used, and by whom.
    const after = (await (
      await authorizedFetch(`${apiUrl}/invite-announcements`, apiUrl)
    ).json()) as {
      inviteAnnouncements: Array<{
        tokenHash: string;
        status: string;
        redeemedBy: string;
      }>;
    };
    expect(
      after.inviteAnnouncements.find((a) => a.tokenHash === tokenHash),
      "acceptance must mark the server-side invite redeemed",
    ).toMatchObject({
      status: "redeemed",
      redeemedBy: redeemed.value.member.publicKey,
    });
  }, 60_000);
});
