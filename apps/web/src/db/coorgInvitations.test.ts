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
import { beforeEach, describe, expect, it } from "vitest";
import {
  CoOrganizerInvitationError,
  effectiveCoOrganizerKeys,
  issueCoOrganizerInvitation,
  issueInvitationsForClone,
  materializeAcceptedCoOrganizer,
  respondToCoOrganizerInvitation,
  revokeCoOrganizerInvitation,
} from "./coorgInvitations";
import { db } from "./database";
import { createMember } from "./seed";
import { createProject, isOrganizer, removeCoOrganizer } from "./projects";
import {
  canonicalCoOrganizerInvitationPayload,
  canonicalCoOrganizerInvitationResponsePayload,
  canonicalCoOrganizerInvitationRevocationPayload,
  generateKeyPair,
  sign,
  verifyCoOrganizerInvitation,
  verifyCoOrganizerInvitationResponse,
  verifyCoOrganizerInvitationRevocation,
} from "@/lib/crypto";

const NODE = "node_coorg_test";

async function reset() {
  await Promise.all([
    db.members.clear(),
    db.posts.clear(),
    db.exchanges.clear(),
    db.achievements.clear(),
    db.settings.clear(),
    db.secretKeys.clear(),
    db.invites.clear(),
    db.vouches.clear(),
    db.outbox.clear(),
    db.projects.clear(),
    db.projectTasks.clear(),
    db.projectActivity.clear(),
    db.pairingLog.clear(),
    db.coorgInvitations.clear(),
    db.coorgInvitationResponses.clear(),
    db.coorgInvitationRevocations.clear(),
    db.blocks.clear(),
    db.previouslyBlocked.clear(),
  ]);
}

async function setupOrganizerAndInvitee() {
  const organizer = await createMember({ displayName: "Rosa" }, NODE);
  const invitee = await createMember({ displayName: "Sam" }, NODE);
  const organizerSecret = (await db.secretKeys.get(organizer.publicKey))!
    .secretKey!;
  const inviteeSecret = (await db.secretKeys.get(invitee.publicKey))!
    .secretKey!;
  const project = await createProject(
    organizer.publicKey,
    {
      title: "Community fridge",
      description: "Keep the fridge alive through winter",
      category: "infrastructure",
      targetHours: 20,
      deadline: null,
      locationZone: "north",
      tags: [],
      templateId: null,
    },
    NODE,
  );
  return { organizer, organizerSecret, invitee, inviteeSecret, project };
}

describe("canonical payload stability", () => {
  it("produces the same bytes for the same input across calls", () => {
    const a = canonicalCoOrganizerInvitationPayload({
      projectId: "p1",
      inviterKey: "ik",
      inviteeKey: "ek",
      createdAt: 1000,
      expiresAt: 2000,
      nodeId: "n1",
    });
    const b = canonicalCoOrganizerInvitationPayload({
      projectId: "p1",
      inviterKey: "ik",
      inviteeKey: "ek",
      createdAt: 1000,
      expiresAt: 2000,
      nodeId: "n1",
    });
    expect(a).toBe(b);
  });

  it("the response payload is independent of caller-supplied field order", () => {
    const a = canonicalCoOrganizerInvitationResponsePayload({
      invitationId: "i1",
      inviteeKey: "ek",
      decision: "accept",
      decidedAt: 5000,
      nodeId: "n1",
    });
    // Spread-rebuild in scrambled order — the canonical serializer
    // re-orders to the fixed sequence, so output bytes must match.
    const scrambled = {
      nodeId: "n1",
      decidedAt: 5000,
      decision: "accept" as const,
      inviteeKey: "ek",
      invitationId: "i1",
    };
    const b = canonicalCoOrganizerInvitationResponsePayload(scrambled);
    expect(a).toBe(b);
  });

  it("the revocation payload is stable", () => {
    const a = canonicalCoOrganizerInvitationRevocationPayload({
      invitationId: "i1",
      inviterKey: "ik",
      revokedAt: 9000,
      nodeId: "n1",
    });
    const b = canonicalCoOrganizerInvitationRevocationPayload({
      invitationId: "i1",
      inviterKey: "ik",
      revokedAt: 9000,
      nodeId: "n1",
    });
    expect(a).toBe(b);
  });
});

describe("sign + verify roundtrip", () => {
  it("verifies an invitation signed by the inviter", () => {
    const kp = generateKeyPair();
    const payload = {
      projectId: "p1",
      inviterKey: kp.publicKey,
      inviteeKey: "ek",
      createdAt: 1000,
      expiresAt: 2000,
      nodeId: "n1",
    };
    const signature = sign(
      canonicalCoOrganizerInvitationPayload(payload),
      kp.secretKey,
    );
    expect(
      verifyCoOrganizerInvitation({ id: "x", ...payload, signature }),
    ).toBe(true);
  });

  it("rejects an invitation whose signature was produced by the wrong key", () => {
    const inviter = generateKeyPair();
    const stranger = generateKeyPair();
    const payload = {
      projectId: "p1",
      inviterKey: inviter.publicKey,
      inviteeKey: "ek",
      createdAt: 1000,
      expiresAt: 2000,
      nodeId: "n1",
    };
    const signature = sign(
      canonicalCoOrganizerInvitationPayload(payload),
      stranger.secretKey,
    );
    expect(
      verifyCoOrganizerInvitation({ id: "x", ...payload, signature }),
    ).toBe(false);
  });

  it("verifies a response signed by the invitee", () => {
    const kp = generateKeyPair();
    const payload = {
      invitationId: "i1",
      inviteeKey: kp.publicKey,
      decision: "accept" as const,
      decidedAt: 100,
      nodeId: "n1",
    };
    const signature = sign(
      canonicalCoOrganizerInvitationResponsePayload(payload),
      kp.secretKey,
    );
    expect(
      verifyCoOrganizerInvitationResponse({ id: "x", ...payload, signature }),
    ).toBe(true);
  });

  it("verifies a revocation signed by the inviter", () => {
    const kp = generateKeyPair();
    const payload = {
      invitationId: "i1",
      inviterKey: kp.publicKey,
      revokedAt: 200,
      nodeId: "n1",
    };
    const signature = sign(
      canonicalCoOrganizerInvitationRevocationPayload(payload),
      kp.secretKey,
    );
    expect(
      verifyCoOrganizerInvitationRevocation({ id: "x", ...payload, signature }),
    ).toBe(true);
  });

  it("rejects records with an empty signature (e.g. grandfathered rows)", () => {
    expect(
      verifyCoOrganizerInvitation({
        id: "x",
        projectId: "p1",
        inviterKey: "ik",
        inviteeKey: "ek",
        createdAt: 1,
        expiresAt: 2,
        nodeId: "n1",
        signature: "",
      }),
    ).toBe(false);
  });
});

describe("issueCoOrganizerInvitation", () => {
  beforeEach(reset);

  it("persists a signed invitation that verifies against the inviter key", async () => {
    const { organizer, organizerSecret, invitee, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
      now: 1_000_000,
    });
    expect(invitation.inviteeKey).toBe(invitee.publicKey);
    expect(invitation.inviterKey).toBe(organizer.publicKey);
    expect(invitation.expiresAt - invitation.createdAt).toBe(
      14 * 24 * 60 * 60 * 1000,
    );
    expect(verifyCoOrganizerInvitation(invitation)).toBe(true);
    const stored = await db.coorgInvitations.get(invitation.id);
    expect(stored?.signature).toBe(invitation.signature);
    // Grandfathered flag must NOT be set on a real signed row.
    expect(stored?.grandfathered).toBeFalsy();
  });

  it("rejects callers who are not the primary organizer", async () => {
    const { organizer, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    await expect(
      issueCoOrganizerInvitation({
        projectId: project.id,
        // Invitee tries to invite themselves — they're not primary.
        inviterKey: invitee.publicKey,
        inviterSecretKey: inviteeSecret,
        inviteeKey: organizer.publicKey,
        nodeId: NODE,
      }),
    ).rejects.toThrow(/primary organizer/);
  });

  it("rejects a secret key that doesn't match the claimed inviter pubkey", async () => {
    const { organizer, inviteeSecret, invitee, project } =
      await setupOrganizerAndInvitee();
    await expect(
      issueCoOrganizerInvitation({
        projectId: project.id,
        inviterKey: organizer.publicKey,
        // Pass invitee's secret while claiming to be the organizer.
        inviterSecretKey: inviteeSecret,
        inviteeKey: invitee.publicKey,
        nodeId: NODE,
      }),
    ).rejects.toThrow(/secret key/);
  });
});

describe("respondToCoOrganizerInvitation", () => {
  beforeEach(reset);

  it("accept produces a verifiable response", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    const response = await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
    });
    expect(response.decision).toBe("accept");
    expect(verifyCoOrganizerInvitationResponse(response)).toBe(true);
  });

  it("rejects when the invitation has already been responded to", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
    });
    await expect(
      respondToCoOrganizerInvitation({
        invitationId: invitation.id,
        inviteeSecretKey: inviteeSecret,
        decision: "decline",
        nodeId: NODE,
      }),
    ).rejects.toMatchObject({ code: "already_responded" });
  });

  it("rejects when the invitation has been revoked", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await revokeCoOrganizerInvitation({
      invitationId: invitation.id,
      inviterSecretKey: organizerSecret,
      nodeId: NODE,
    });
    await expect(
      respondToCoOrganizerInvitation({
        invitationId: invitation.id,
        inviteeSecretKey: inviteeSecret,
        decision: "accept",
        nodeId: NODE,
      }),
    ).rejects.toMatchObject({ code: "already_revoked" });
  });

  it("rejects an expired invitation", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const issuedAt = 1_000_000;
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
      now: issuedAt,
      ttlMs: 1000,
    });
    await expect(
      respondToCoOrganizerInvitation({
        invitationId: invitation.id,
        inviteeSecretKey: inviteeSecret,
        decision: "accept",
        nodeId: NODE,
        now: issuedAt + 2000,
      }),
    ).rejects.toMatchObject({ code: "invitation_expired" });
  });
});

describe("revokeCoOrganizerInvitation", () => {
  beforeEach(reset);

  it("rejects when the invitation has already been responded to", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "decline",
      nodeId: NODE,
    });
    await expect(
      revokeCoOrganizerInvitation({
        invitationId: invitation.id,
        inviterSecretKey: organizerSecret,
        nodeId: NODE,
      }),
    ).rejects.toMatchObject({ code: "already_responded" });
  });

  it("rejects when the caller is not the original inviter", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await expect(
      revokeCoOrganizerInvitation({
        invitationId: invitation.id,
        // Pass invitee's secret — derives a pubkey that doesn't
        // match the invitation's inviterKey.
        inviterSecretKey: inviteeSecret,
        nodeId: NODE,
      }),
    ).rejects.toMatchObject({ code: "inviter_key_mismatch" });
  });
});

describe("effectiveCoOrganizerKeys", () => {
  beforeEach(reset);

  it("returns empty for a project with only-invited (no response)", async () => {
    const { organizer, organizerSecret, invitee, project } =
      await setupOrganizerAndInvitee();
    await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    expect(await effectiveCoOrganizerKeys(project.id)).toEqual([]);
  });

  it("includes accepted invitees", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
    });
    expect(await effectiveCoOrganizerKeys(project.id)).toEqual([
      invitee.publicKey,
    ]);
  });

  it("excludes declined invitees", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "decline",
      nodeId: NODE,
    });
    expect(await effectiveCoOrganizerKeys(project.id)).toEqual([]);
  });

  it("excludes revoked invitations even if a later accept attempt is ignored", async () => {
    // The state machine enforces revoked → cannot-accept at write
    // time, but the derived view must also defend itself — if a
    // stale acceptance somehow lands alongside a revocation, the
    // revocation wins.
    const { organizer, organizerSecret, invitee, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await revokeCoOrganizerInvitation({
      invitationId: invitation.id,
      inviterSecretKey: organizerSecret,
      nodeId: NODE,
    });
    // Manually plant an acceptance — the write-path would reject this
    // (we tested that above); here we plant it to assert the read-path
    // also refuses to count it.
    await db.coorgInvitationResponses.put({
      id: "synthetic_accept",
      invitationId: invitation.id,
      inviteeKey: invitee.publicKey,
      decision: "accept",
      decidedAt: Date.now(),
      nodeId: NODE,
      signature: "synthetic",
    });
    expect(await effectiveCoOrganizerKeys(project.id)).toEqual([]);
  });

  it("excludes expired invitations (no acceptance, expiry passed)", async () => {
    const { organizer, organizerSecret, invitee, project } =
      await setupOrganizerAndInvitee();
    const issuedAt = 1_000_000;
    await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
      now: issuedAt,
      ttlMs: 1000,
    });
    expect(await effectiveCoOrganizerKeys(project.id, issuedAt + 2000)).toEqual(
      [],
    );
  });

  it("keeps an acceptance signed before expiry, even if `now` is past expiry", async () => {
    // §4 rule: accept decidedAt ≤ invitation.expiresAt — wall-clock
    // drift after a valid in-window acceptance does NOT strip
    // authority.
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const issuedAt = 1_000_000;
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
      now: issuedAt,
      ttlMs: 1000,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
      now: issuedAt + 500, // Inside the window.
    });
    expect(await effectiveCoOrganizerKeys(project.id, issuedAt + 99_999)).toEqual(
      [invitee.publicKey],
    );
  });
});

describe("v21 grandfather migration", () => {
  beforeEach(reset);

  it("synthesizes paired (invitation, accepted-response) rows when a project already has coOrganizerKeys", async () => {
    // The Dexie schema is set up on first call — opening the db
    // here triggers v21 if it hasn't run yet. But the in-memory
    // fake-indexeddb instance has already run all upgrades by the
    // time the tests start; so we mimic the grandfather case by
    // putting a project with a populated coOrganizerKeys array
    // directly, then asserting the derived view matches via the
    // pre-existing synthesis pathway. To get the migration to fire
    // for these rows we simulate the upgrade callback directly.
    const organizer = await createMember({ displayName: "Rosa" }, NODE);
    const grandfathered = await createMember(
      { displayName: "Theo" },
      NODE,
    );
    const project = await createProject(
      organizer.publicKey,
      {
        title: "Long-running mutual aid",
        description: "",
        category: "infrastructure",
        targetHours: 10,
        deadline: null,
        locationZone: "",
        tags: [],
        templateId: null,
      },
      NODE,
    );
    // Simulate the pre-feature state: a co-organizer was added
    // unilaterally and lives only in the static array.
    await db.projects.put({
      ...project,
      coOrganizerKeys: [grandfathered.publicKey],
    });
    // Run the same synthesis the v21 upgrade callback does. We
    // copy the logic verbatim here so the assertion is meaningful
    // even when the db opened without an upgrade step (fake-
    // indexeddb starts at the latest version).
    const { uuid } = await import("@/lib/id");
    const invitationId = uuid();
    const createdAt = project.createdAt;
    await db.coorgInvitations.put({
      id: invitationId,
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviteeKey: grandfathered.publicKey,
      createdAt,
      expiresAt: createdAt + 100 * 365 * 24 * 60 * 60 * 1000,
      nodeId: NODE,
      signature: "grandfathered",
      grandfathered: true,
    });
    await db.coorgInvitationResponses.put({
      id: uuid(),
      invitationId,
      inviteeKey: grandfathered.publicKey,
      decision: "accept",
      decidedAt: createdAt,
      nodeId: NODE,
      signature: "grandfathered",
      grandfathered: true,
    });
    expect(await effectiveCoOrganizerKeys(project.id)).toEqual([
      grandfathered.publicKey,
    ]);
    const row = await db.coorgInvitations
      .where("projectId")
      .equals(project.id)
      .first();
    expect(row?.grandfathered).toBe(true);
    expect(row?.signature).toBe("grandfathered");
  });
});

describe("CoOrganizerInvitationError", () => {
  it("carries the error code on the thrown instance", async () => {
    await reset();
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await revokeCoOrganizerInvitation({
      invitationId: invitation.id,
      inviterSecretKey: organizerSecret,
      nodeId: NODE,
    });
    try {
      await respondToCoOrganizerInvitation({
        invitationId: invitation.id,
        inviteeSecretKey: inviteeSecret,
        decision: "accept",
        nodeId: NODE,
      });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CoOrganizerInvitationError);
      expect((err as CoOrganizerInvitationError).code).toBe("already_revoked");
    }
  });
});

describe("materializeAcceptedCoOrganizer", () => {
  beforeEach(reset);

  it("accept lands the invitee in Project.coOrganizerKeys and isOrganizer agrees", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
    });
    const reloaded = (await db.projects.get(project.id))!;
    expect(reloaded.coOrganizerKeys).toContain(invitee.publicKey);
    expect(isOrganizer(reloaded, invitee.publicKey)).toBe(true);
  });

  it("decline leaves the static array untouched", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "decline",
      nodeId: NODE,
    });
    const reloaded = (await db.projects.get(project.id))!;
    expect(reloaded.coOrganizerKeys).toEqual([]);
  });

  it("a materialized co-organizer can step down through removeCoOrganizer", async () => {
    // The user-visible loop the missing materialization broke: accept
    // the role, then later leave it. Step-down reads the static
    // array, so before this fix it threw "not in role" for every
    // signed-flow co-organizer.
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
    });
    const updated = await removeCoOrganizer(
      project.id,
      invitee.publicKey,
      invitee.publicKey,
    );
    expect(updated.coOrganizerKeys).toEqual([]);
  });

  it("is idempotent — re-running after a completed accept keeps a single entry", async () => {
    const { organizer, organizerSecret, invitee, inviteeSecret, project } =
      await setupOrganizerAndInvitee();
    const invitation = await issueCoOrganizerInvitation({
      projectId: project.id,
      inviterKey: organizer.publicKey,
      inviterSecretKey: organizerSecret,
      inviteeKey: invitee.publicKey,
      nodeId: NODE,
    });
    await respondToCoOrganizerInvitation({
      invitationId: invitation.id,
      inviteeSecretKey: inviteeSecret,
      decision: "accept",
      nodeId: NODE,
    });
    await materializeAcceptedCoOrganizer(invitation.id);
    const reloaded = (await db.projects.get(project.id))!;
    expect(
      reloaded.coOrganizerKeys.filter((k) => k === invitee.publicKey),
    ).toHaveLength(1);
  });

  it("quietly no-ops when the invitation or its project is missing", async () => {
    await expect(
      materializeAcceptedCoOrganizer("no-such-invitation"),
    ).resolves.toBeUndefined();
  });

  // The guard tests below write rows directly. Signatures are
  // sentinels: materialization deliberately does not re-verify them —
  // every ingest path (local write or federation pull) has already
  // verified before the rows exist.
  function rawRows(opts: {
    inviteeKey: string;
    responseInviteeKey?: string;
    decidedAt: number;
    expiresAt: number;
    revoked?: boolean;
    projectId: string;
  }) {
    const invitation = {
      id: "inv_raw",
      projectId: opts.projectId,
      inviterKey: "inviter_key",
      inviteeKey: opts.inviteeKey,
      createdAt: 0,
      expiresAt: opts.expiresAt,
      nodeId: NODE,
      signature: "test",
    };
    const response = {
      id: "resp_raw",
      invitationId: "inv_raw",
      inviteeKey: opts.responseInviteeKey ?? opts.inviteeKey,
      decision: "accept" as const,
      decidedAt: opts.decidedAt,
      nodeId: NODE,
      signature: "test",
    };
    const revocation = opts.revoked
      ? {
          id: "rev_raw",
          invitationId: "inv_raw",
          inviterKey: "inviter_key",
          revokedAt: opts.decidedAt,
          nodeId: NODE,
          signature: "test",
        }
      : null;
    return { invitation, response, revocation };
  }

  it("does not materialize a revoked invitation", async () => {
    const { project } = await setupOrganizerAndInvitee();
    const { invitation, response, revocation } = rawRows({
      inviteeKey: "key_bob",
      decidedAt: Date.now(),
      expiresAt: Date.now() + 1000_000,
      revoked: true,
      projectId: project.id,
    });
    await db.coorgInvitations.put(invitation);
    await db.coorgInvitationResponses.put(response);
    await db.coorgInvitationRevocations.put(revocation!);
    await materializeAcceptedCoOrganizer(invitation.id);
    const reloaded = (await db.projects.get(project.id))!;
    expect(reloaded.coOrganizerKeys).toEqual([]);
  });

  it("does not materialize an acceptance signed after expiry once the window is past", async () => {
    const { project } = await setupOrganizerAndInvitee();
    const expiresAt = Date.now() - 1000;
    const { invitation, response } = rawRows({
      inviteeKey: "key_bob",
      decidedAt: expiresAt + 500, // late signature, window already past
      expiresAt,
      projectId: project.id,
    });
    await db.coorgInvitations.put(invitation);
    await db.coorgInvitationResponses.put(response);
    await materializeAcceptedCoOrganizer(invitation.id);
    const reloaded = (await db.projects.get(project.id))!;
    expect(reloaded.coOrganizerKeys).toEqual([]);
  });

  it("does not materialize a response whose inviteeKey differs from the invitation's", async () => {
    // Federation ingest verifies a response's self-signature only;
    // a forged "acceptance" naming someone else's invitation must
    // not push the named invitee (or the forger) into the role.
    const { project } = await setupOrganizerAndInvitee();
    const { invitation, response } = rawRows({
      inviteeKey: "key_bob",
      responseInviteeKey: "key_mallory",
      decidedAt: Date.now(),
      expiresAt: Date.now() + 1000_000,
      projectId: project.id,
    });
    await db.coorgInvitations.put(invitation);
    await db.coorgInvitationResponses.put(response);
    await materializeAcceptedCoOrganizer(invitation.id);
    const reloaded = (await db.projects.get(project.id))!;
    expect(reloaded.coOrganizerKeys).toEqual([]);
  });
});

describe("issueInvitationsForClone", () => {
  beforeEach(reset);

  const DAY = 24 * 60 * 60 * 1000;

  async function setupClone() {
    const cloner = await createMember({ displayName: "Cloner" }, NODE);
    const aya = await createMember({ displayName: "Aya" }, NODE);
    const bo = await createMember({ displayName: "Bo" }, NODE);
    const clonerSecret = (await db.secretKeys.get(cloner.publicKey))!.secretKey!;
    const clone = await createProject(
      cloner.publicKey,
      {
        title: "Community fridge (copy)",
        description: "",
        category: "infrastructure",
        targetHours: 20,
        deadline: null,
        locationZone: "north",
        tags: [],
        templateId: null,
      },
      NODE,
    );
    return { cloner, clonerSecret, aya, bo, clone };
  }

  it("issues one invitation per invitee against the clone, from the cloner, with a 14-day TTL", async () => {
    const { cloner, clonerSecret, aya, bo, clone } = await setupClone();
    const result = await issueInvitationsForClone({
      projectId: clone.id,
      inviterKey: cloner.publicKey,
      inviterSecretKey: clonerSecret,
      inviteeKeys: [aya.publicKey, bo.publicKey],
      nodeId: NODE,
      now: 1000,
    });
    expect(new Set(result.sent)).toEqual(
      new Set([aya.publicKey, bo.publicKey]),
    );
    expect(result.failed).toEqual([]);

    const rows = await db.coorgInvitations
      .where("projectId")
      .equals(clone.id)
      .toArray();
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.inviterKey).toBe(cloner.publicKey);
      expect(row.expiresAt).toBe(1000 + 14 * DAY);
    }
  });

  it("collects a mutually-blocked invitee in `failed` while the rest are sent", async () => {
    const { cloner, clonerSecret, aya, bo, clone } = await setupClone();
    // The cloner has blocked Bo — the invitation must fail quietly.
    await db.blocks.put({
      id: "blk-1",
      blockerKey: cloner.publicKey,
      blockedKey: bo.publicKey,
      createdAt: 1,
      hideGovernance: false,
      note: null,
    });
    const result = await issueInvitationsForClone({
      projectId: clone.id,
      inviterKey: cloner.publicKey,
      inviterSecretKey: clonerSecret,
      inviteeKeys: [aya.publicKey, bo.publicKey],
      nodeId: NODE,
      now: 1000,
    });
    expect(result.sent).toEqual([aya.publicKey]);
    expect(result.failed).toEqual([bo.publicKey]);
    // Only one row written — the blocked pair produced nothing.
    expect(
      await db.coorgInvitations.where("projectId").equals(clone.id).count(),
    ).toBe(1);
  });

  it("collects a self-invite (clone primary) in `failed` without aborting the rest", async () => {
    const { cloner, clonerSecret, aya, clone } = await setupClone();
    const result = await issueInvitationsForClone({
      projectId: clone.id,
      inviterKey: cloner.publicKey,
      inviterSecretKey: clonerSecret,
      // The cloner themselves slipped in — the existing guard rejects it.
      inviteeKeys: [cloner.publicKey, aya.publicKey],
      nodeId: NODE,
      now: 1000,
    });
    expect(result.sent).toEqual([aya.publicKey]);
    expect(result.failed).toEqual([cloner.publicKey]);
  });
});
