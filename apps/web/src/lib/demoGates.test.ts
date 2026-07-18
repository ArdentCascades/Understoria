/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// The demo build's banner promises "nothing is sent anywhere". That
// promise is structural, enforced at three chokepoints every network
// path funnels through — readSubmitConfig (direct submits),
// enqueueOutbox (deferred submits), listNodeEndpoints (the entire
// read/sync path) — NOT by hoping no code path ever configures a node
// URL. These tests flip the demo flag via the mockable function form
// (the IS_DEMO constant is inlined at build time and can't be
// stubbed), configure a node URL anyway, and assert every chokepoint
// still refuses.
vi.mock("@/lib/demo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/demo")>();
  return { ...actual, isDemoBuild: () => true };
});

import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { readSubmitConfig } from "@/lib/nodeSubmit";
import { listNodeEndpoints } from "@/lib/nodeEndpoints";
import { isNotJoined } from "@/lib/notJoinedNudge";
import {
  enqueueVouchOutbox,
  enqueueInviteRevocationOutbox,
} from "@/lib/outbox";
import type { InviteRevocation, SignedVouch } from "@/types";

describe("demo build federation lockdown", () => {
  beforeEach(async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    // A configured, ENABLED community node — the exact state the
    // chokepoints must ignore in a demo build.
    await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.example");
    await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  });

  it("readSubmitConfig reports disabled with no URL, whatever settings say", async () => {
    const cfg = await readSubmitConfig();
    expect(cfg.enabled).toBe(false);
    expect(cfg.url).toBe("");
    expect(cfg.fallbackUrls).toEqual([]);
  });

  it("listNodeEndpoints returns no endpoints, killing the whole sync/read path", async () => {
    const eps = await listNodeEndpoints();
    expect(eps.primary).toBeNull();
    expect(eps.endpoints).toEqual([]);
  });

  it("enqueueOutbox refuses ordinary kinds — nothing is queued for later", async () => {
    const row = await enqueueVouchOutbox({
      id: "vouch-1",
      voucherKey: "key-a",
      voucheeKey: "key-b",
    } as SignedVouch);
    expect(row).toBeNull();
    expect(await db.outbox.count()).toBe(0);
  });

  it("enqueueOutbox refuses even requireNodeUrl:false kinds (no dormant rows)", async () => {
    // Redemption receipts / invite revocations normally queue WITHOUT
    // a node URL and ship automatically the moment one appears. In a
    // demo build they must not even sit dormant.
    const row = await enqueueInviteRevocationOutbox({
      token: "tok-1",
    } as InviteRevocation);
    expect(row).toBeNull();
    expect(await db.outbox.count()).toBe(0);
  });

  it("suppresses the not-joined Board card — the demo's sample community IS the situation", () => {
    // The demo seeds a populated community locally with no node URL and
    // no redeemed invite rows — exactly the "orphan identity" input the
    // detection rule fires on. Showing "You haven't joined a community
    // yet" above a full sample board contradicts what the visitor sees;
    // the demo banner already explains it. Real builds are untouched
    // (see lib/notJoinedNudge.test.ts for the non-demo truth table).
    expect(
      isNotJoined({
        memberKey: "demo-member",
        invites: [],
        communityNodeUrl: "",
      }),
    ).toBe(false);
  });
});
