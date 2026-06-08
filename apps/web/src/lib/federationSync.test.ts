/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  canonicalCoOrganizerInvitationPayload,
  canonicalCoOrganizerInvitationResponsePayload,
  canonicalCoOrganizerInvitationRevocationPayload,
  canonicalExchangePayload,
  generateKeyPair,
  sign,
} from "@understoria/shared/crypto";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
} from "@understoria/shared/types";
import type { Exchange } from "@/types";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import {
  pullFederatedCoOrgInvitations,
  pullFederatedCoOrgResponses,
  pullFederatedCoOrgRevocations,
  pullFederatedExchanges,
} from "./federationSync";

async function reset() {
  await Promise.all([db.exchanges.clear(), db.settings.clear()]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

function makeSignedExchange(opts: {
  id: string;
  nodeId: string;
  completedAt: number;
  hours?: number;
}): Exchange {
  const helper = generateKeyPair();
  const helped = generateKeyPair();
  const payload = canonicalExchangePayload({
    postId: `p_${opts.id}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hours: opts.hours ?? 1,
    category: "other",
    completedAt: opts.completedAt,
  });
  return {
    id: opts.id,
    postId: `p_${opts.id}`,
    helperKey: helper.publicKey,
    helpedKey: helped.publicKey,
    hoursExchanged: opts.hours ?? 1,
    helperSignature: sign(payload, helper.secretKey),
    helpedSignature: sign(payload, helped.secretKey),
    completedAt: opts.completedAt,
    category: "other",
    nodeId: opts.nodeId,
  };
}

describe("pullFederatedExchanges", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    const result = await pullFederatedExchanges();
    expect(result).toBeNull();
  });

  it("inserts verified peer rows and advances the cursor", async () => {
    const peer = makeSignedExchange({
      id: "peer_1",
      nodeId: "peer_node",
      completedAt: 1000,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exchanges: [peer] }),
      }),
    );
    const result = await pullFederatedExchanges();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.exchanges.get("peer_1")).toMatchObject({
      nodeId: "peer_node",
    });
    expect(await getSetting(SETTING_KEYS.federationLastExchangePull)).toBe(
      "1000",
    );
  });

  it("skips rows whose helper signature does not verify", async () => {
    const bad = makeSignedExchange({
      id: "bad_1",
      nodeId: "peer_node",
      completedAt: 500,
    });
    bad.helperSignature = sign("tampered", generateKeyPair().secretKey);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exchanges: [bad] }),
      }),
    );
    const result = await pullFederatedExchanges();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.exchanges.get("bad_1")).toBeUndefined();
  });

  it("dedups on id across repeated pulls (idempotent)", async () => {
    const peer = makeSignedExchange({
      id: "peer_dup",
      nodeId: "peer_node",
      completedAt: 2000,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exchanges: [peer] }),
      }),
    );
    await pullFederatedExchanges();
    const second = await pullFederatedExchanges();
    expect(second).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.exchanges.count()).toBe(1);
  });

  it("sends the persisted cursor as ?since on subsequent pulls", async () => {
    await setSetting(SETTING_KEYS.federationLastExchangePull, "777");
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exchanges: [] }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    await pullFederatedExchanges();
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("since=777");
  });
});

async function resetCoOrg() {
  await Promise.all([
    db.coorgInvitations.clear(),
    db.coorgInvitationResponses.clear(),
    db.coorgInvitationRevocations.clear(),
    db.settings.clear(),
  ]);
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
}

function makeSignedCoOrgInvitation(opts: {
  id: string;
  createdAt: number;
}): CoOrganizerInvitation {
  const inviter = generateKeyPair();
  const invitee = generateKeyPair();
  const payload = {
    projectId: "proj_1",
    inviterKey: inviter.publicKey,
    inviteeKey: invitee.publicKey,
    createdAt: opts.createdAt,
    expiresAt: opts.createdAt + 14 * 24 * 60 * 60 * 1000,
    nodeId: "peer_node",
  };
  return {
    id: opts.id,
    ...payload,
    signature: sign(
      canonicalCoOrganizerInvitationPayload(payload),
      inviter.secretKey,
    ),
  };
}

function makeSignedCoOrgResponse(opts: {
  id: string;
  decidedAt: number;
}): CoOrganizerInvitationResponse {
  const invitee = generateKeyPair();
  const payload = {
    invitationId: `inv_${opts.id}`,
    inviteeKey: invitee.publicKey,
    decision: "accept" as const,
    decidedAt: opts.decidedAt,
    nodeId: "peer_node",
  };
  return {
    id: opts.id,
    ...payload,
    signature: sign(
      canonicalCoOrganizerInvitationResponsePayload(payload),
      invitee.secretKey,
    ),
  };
}

function makeSignedCoOrgRevocation(opts: {
  id: string;
  revokedAt: number;
}): CoOrganizerInvitationRevocation {
  const inviter = generateKeyPair();
  const payload = {
    invitationId: `inv_${opts.id}`,
    inviterKey: inviter.publicKey,
    revokedAt: opts.revokedAt,
    nodeId: "peer_node",
  };
  return {
    id: opts.id,
    ...payload,
    signature: sign(
      canonicalCoOrganizerInvitationRevocationPayload(payload),
      inviter.secretKey,
    ),
  };
}

describe("pullFederatedCoOrgInvitations", () => {
  beforeEach(resetCoOrg);
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when mirroring is disabled", async () => {
    await setSetting(SETTING_KEYS.communityNodeEnabled, "0");
    expect(await pullFederatedCoOrgInvitations()).toBeNull();
  });

  it("inserts verified rows and advances the cursor", async () => {
    const rec = makeSignedCoOrgInvitation({ id: "ci_1", createdAt: 1500 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitations: [rec] }),
      }),
    );
    const result = await pullFederatedCoOrgInvitations();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.coorgInvitations.get("ci_1")).toMatchObject({
      id: "ci_1",
    });
    expect(
      await getSetting(SETTING_KEYS.federationLastCoOrgInvitationPull),
    ).toBe("1500");
  });

  it("skips rows whose signature does not verify", async () => {
    const bad = makeSignedCoOrgInvitation({ id: "ci_bad", createdAt: 800 });
    bad.signature = sign("tampered", generateKeyPair().secretKey);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitations: [bad] }),
      }),
    );
    const result = await pullFederatedCoOrgInvitations();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.coorgInvitations.get("ci_bad")).toBeUndefined();
  });

  it("dedupes on id across repeated pulls", async () => {
    const rec = makeSignedCoOrgInvitation({ id: "ci_dup", createdAt: 2200 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitations: [rec] }),
      }),
    );
    await pullFederatedCoOrgInvitations();
    const second = await pullFederatedCoOrgInvitations();
    expect(second).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.coorgInvitations.count()).toBe(1);
  });

  it("sends the persisted cursor as ?since on subsequent pulls", async () => {
    await setSetting(
      SETTING_KEYS.federationLastCoOrgInvitationPull,
      "4242",
    );
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ coorgInvitations: [] }),
    });
    vi.stubGlobal("fetch", fetchSpy);
    await pullFederatedCoOrgInvitations();
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("since=4242");
  });
});

describe("pullFederatedCoOrgResponses", () => {
  beforeEach(resetCoOrg);
  afterEach(() => vi.unstubAllGlobals());

  it("inserts verified rows and advances the cursor by decidedAt", async () => {
    const rec = makeSignedCoOrgResponse({ id: "cr_1", decidedAt: 1200 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitationResponses: [rec] }),
      }),
    );
    const result = await pullFederatedCoOrgResponses();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.coorgInvitationResponses.get("cr_1")).toMatchObject({
      id: "cr_1",
    });
    expect(
      await getSetting(
        SETTING_KEYS.federationLastCoOrgInvitationResponsePull,
      ),
    ).toBe("1200");
  });

  it("skips rows whose signature does not verify", async () => {
    const bad = makeSignedCoOrgResponse({ id: "cr_bad", decidedAt: 600 });
    bad.signature = sign("tampered", generateKeyPair().secretKey);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitationResponses: [bad] }),
      }),
    );
    const result = await pullFederatedCoOrgResponses();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
  });
});

describe("pullFederatedCoOrgRevocations", () => {
  beforeEach(resetCoOrg);
  afterEach(() => vi.unstubAllGlobals());

  it("inserts verified rows and advances the cursor by revokedAt", async () => {
    const rec = makeSignedCoOrgRevocation({ id: "cv_1", revokedAt: 3300 });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitationRevocations: [rec] }),
      }),
    );
    const result = await pullFederatedCoOrgRevocations();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.coorgInvitationRevocations.get("cv_1")).toMatchObject({
      id: "cv_1",
    });
    expect(
      await getSetting(
        SETTING_KEYS.federationLastCoOrgInvitationRevocationPull,
      ),
    ).toBe("3300");
  });

  it("skips rows whose signature does not verify", async () => {
    const bad = makeSignedCoOrgRevocation({ id: "cv_bad", revokedAt: 900 });
    bad.signature = sign("tampered", generateKeyPair().secretKey);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ coorgInvitationRevocations: [bad] }),
      }),
    );
    const result = await pullFederatedCoOrgRevocations();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
  });
});
