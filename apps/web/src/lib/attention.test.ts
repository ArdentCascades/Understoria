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
import { describe, expect, it } from "vitest";
import { computeAttentionItems } from "./attention";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
  EventRsvpRow,
  Member,
  Post,
  Project,
  ProjectAdoptionPayload,
  ProjectTask,
  Proposal,
} from "@/types";
import type { SignedVouch } from "@/lib/vouch";

function adoptionProposal(
  over: Partial<Proposal> & { sittingPrimaryKey: string },
): Proposal {
  const payload: ProjectAdoptionPayload = {
    projectId: "proj-1",
    projectTitle: "Community Fridge",
    proposedPrimaryKey: "adoptee",
    sittingPrimaryKey: over.sittingPrimaryKey,
    rationale: "keeping it going",
    lastOrganizerActivityAt: null,
  };
  return {
    id: over.id ?? "adopt-1",
    nodeId,
    kind: "proposal",
    category: "project_adoption",
    reversibilityTier: "moderate",
    title: "Community Fridge",
    description: "keeping it going",
    payload: JSON.stringify(payload),
    proposerKey: "adoptee",
    status: over.status ?? "open",
    createdAt: 5000,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: null,
    ...over,
  };
}

const nodeId = "node_attn";

function member(publicKey: string, displayName = publicKey.toUpperCase()): Member {
  return {
    publicKey,
    displayName,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    nodeId,
    locationZone: "",
  };
}

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? `p_${Math.random().toString(36).slice(2)}`,
    type: "NEED",
    category: "other",
    title: "Help with thing",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "alice",
    claimedBy: null,
    status: "open",
    createdAt: 1000,
    expiresAt: null,
    locationZone: "",
    confirmedBy: [],
    nodeId,
    signature: "",
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: overrides.id ?? "proj_1",
    title: "Garden",
    description: "",
    category: "infrastructure",
    organizerKey: "alice",
    coOrganizerKeys: [],
    status: "active",
    targetHours: 10,
    contributedHours: 0,
    deadline: null,
    createdAt: 0,
    completedAt: null,
    pauseNote: null,
    locationZone: "",
    tags: [],
    nodeId,
    templateId: null,
    ...overrides,
  };
}

function task(overrides: Partial<ProjectTask>): ProjectTask {
  return {
    id: overrides.id ?? "t_1",
    projectId: overrides.projectId ?? "proj_1",
    title: "Haul soil",
    description: "",
    category: "infrastructure",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: 0,
    createdAt: 500,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

describe("computeAttentionItems", () => {
  const alice = member("alice");
  const bob = member("bob", "Bob");
  const carmen = member("carmen", "Carmen");

  it("returns empty when there's no current member", () => {
    const items = computeAttentionItems({
      currentMember: null,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [],
    });
    expect(items).toEqual([]);
  });

  it("returns empty when nothing needs the current member's action", () => {
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [post()],
      projects: [project()],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toEqual([]);
  });

  it("surfaces an exchange the current member still needs to confirm", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "bob",
      status: "awaiting_confirmation",
      confirmedBy: ["bob"],
      title: "Ride to clinic",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "confirm_exchange",
      postId: p.id,
      counterpartyName: "Bob",
    });
  });

  it("does NOT surface an exchange the current member has already confirmed", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "bob",
      status: "awaiting_confirmation",
      confirmedBy: ["alice"],
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toEqual([]);
  });

  it("does NOT surface exchanges the current member isn't a party to", () => {
    const p = post({
      postedBy: "bob",
      claimedBy: "carmen",
      status: "awaiting_confirmation",
      confirmedBy: ["bob"],
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob, carmen],
    });
    expect(items).toEqual([]);
  });

  it("surfaces a project task the organizer needs to confirm", () => {
    const proj = project({ organizerKey: "alice" });
    const t = task({
      projectId: proj.id,
      status: "awaiting_confirmation",
      completedBy: "bob",
      title: "Haul soil",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [proj],
      projectTasks: [t],
      members: [alice, bob],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "confirm_task",
      projectId: proj.id,
      taskId: t.id,
      taskTitle: "Haul soil",
      completerName: "Bob",
    });
  });

  it("does NOT surface tasks where the organizer was also the completer", () => {
    // Self-confirm is rejected by confirmProjectTaskCompletion; it
    // needs ANOTHER project member, so surfacing it to the
    // organizer would be misleading.
    const proj = project({ organizerKey: "alice" });
    const t = task({
      projectId: proj.id,
      status: "awaiting_confirmation",
      completedBy: "alice",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [proj],
      projectTasks: [t],
      members: [alice],
    });
    expect(items).toEqual([]);
  });

  it("does NOT surface tasks on projects the current member doesn't organize", () => {
    const proj = project({ organizerKey: "carmen" });
    const t = task({
      projectId: proj.id,
      status: "awaiting_confirmation",
      completedBy: "bob",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [proj],
      projectTasks: [t],
      members: [alice, bob, carmen],
    });
    expect(items).toEqual([]);
  });

  it("orders items newest-first by createdAt", () => {
    const older = post({
      id: "older",
      postedBy: "alice",
      claimedBy: "bob",
      status: "awaiting_confirmation",
      confirmedBy: ["bob"],
      createdAt: 1000,
    });
    const newer = post({
      id: "newer",
      postedBy: "alice",
      claimedBy: "carmen",
      status: "awaiting_confirmation",
      confirmedBy: ["carmen"],
      createdAt: 2000,
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [older, newer],
      projects: [],
      projectTasks: [],
      members: [alice, bob, carmen],
    });
    expect(items.map((i) => i.kind === "confirm_exchange" && i.postId)).toEqual([
      "newer",
      "older",
    ]);
  });

  describe("actionability ordering (KIND_PRIORITY tiers)", () => {
    const now = 1_000_000_000;
    const DAY = 24 * 60 * 60 * 1000;

    it("ranks an OLDER confirm_exchange above a NEWER vouch_received", () => {
      // The exchange confirmation blocks Bob's credit; the vouch is
      // purely informational. Recency must not outrank actionability.
      const oldExchange = post({
        id: "old_exchange",
        postedBy: "alice",
        claimedBy: "bob",
        status: "awaiting_confirmation",
        confirmedBy: ["bob"],
        createdAt: now - 6 * DAY, // much older...
      });
      const freshVouch: SignedVouch = {
        id: "v_fresh",
        voucherKey: "carmen",
        voucheeKey: "alice",
        kind: "manual",
        createdAt: now - 1000, // ...than this
        signature: "sig",
      };
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [oldExchange],
        projects: [],
        projectTasks: [],
        members: [alice, bob, carmen],
        vouches: [freshVouch],
        now,
      });
      expect(items.map((i) => i.kind)).toEqual([
        "confirm_exchange",
        "vouch_received",
      ]);
    });

    it("orders across tiers: blocking > decision > informational", () => {
      const proj = project({
        id: "proj_tier",
        title: "Tool library",
        organizerKey: "bob",
      });
      const invitation: CoOrganizerInvitation = {
        id: "inv_tier",
        projectId: proj.id,
        inviterKey: "bob",
        inviteeKey: alice.publicKey,
        createdAt: now - 2 * DAY,
        expiresAt: now + 14 * DAY,
        nodeId,
        signature: "sig",
      };
      const oldExchange = post({
        id: "tier_exchange",
        postedBy: "alice",
        claimedBy: "bob",
        status: "awaiting_confirmation",
        confirmedBy: ["bob"],
        createdAt: now - 6 * DAY, // oldest of the three
      });
      const freshClaim = post({
        id: "tier_claimed",
        postedBy: "alice",
        claimedBy: "carmen",
        status: "claimed",
        createdAt: now - 1000, // newest of the three
      });
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [oldExchange, freshClaim],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob, carmen],
        coorgInvitations: [invitation],
        now,
      });
      expect(items.map((i) => i.kind)).toEqual([
        "confirm_exchange",
        "coorganizer_invitation_received",
        "post_claimed",
      ]);
    });

    it("keeps newest-first WITHIN a tier while tiers still lead", () => {
      const olderExchange = post({
        id: "within_older",
        postedBy: "alice",
        claimedBy: "bob",
        status: "awaiting_confirmation",
        confirmedBy: ["bob"],
        createdAt: now - 5 * DAY,
      });
      const newerExchange = post({
        id: "within_newer",
        postedBy: "alice",
        claimedBy: "carmen",
        status: "awaiting_confirmation",
        confirmedBy: ["carmen"],
        createdAt: now - 2 * DAY,
      });
      const olderVouch: SignedVouch = {
        id: "v_older",
        voucherKey: "bob",
        voucheeKey: "alice",
        kind: "manual",
        createdAt: now - 3 * DAY,
        signature: "sig",
      };
      const newerVouch: SignedVouch = {
        id: "v_newer",
        voucherKey: "carmen",
        voucheeKey: "alice",
        kind: "manual",
        createdAt: now - 1 * DAY,
        signature: "sig",
      };
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [olderExchange, newerExchange],
        projects: [],
        projectTasks: [],
        members: [alice, bob, carmen],
        vouches: [olderVouch, newerVouch],
        now,
      });
      expect(
        items.map((i) =>
          i.kind === "confirm_exchange" ? i.postId : i.kind === "vouch_received" ? i.voucherName : i.kind,
        ),
      ).toEqual(["within_newer", "within_older", "Carmen", "Bob"]);
    });
  });

  it("falls back to a generic counterparty label when the name isn't known", () => {
    // Could happen on a freshly-redeemed invite where the inviter's
    // Member row is local but the counterparty isn't yet — or in a
    // future cross-node case.
    const p = post({
      postedBy: "alice",
      claimedBy: "unknown_key",
      status: "awaiting_confirmation",
      confirmedBy: ["unknown_key"],
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice], // no record for unknown_key
    });
    expect(items).toHaveLength(1);
    if (items[0].kind === "confirm_exchange") {
      expect(items[0].counterpartyName).toBe("another community member");
    }
  });

  it("surfaces 'post_claimed' when a NEED the member posted is claimed", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "bob",
      status: "claimed",
      type: "NEED",
      title: "Fix fence",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "post_claimed",
      postType: "NEED",
      claimerName: "Bob",
      postTitle: "Fix fence",
    });
  });

  it("surfaces 'post_claimed' when an OFFER the member posted is accepted", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "carmen",
      status: "claimed",
      type: "OFFER",
      title: "Spanish tutoring",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, carmen],
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "post_claimed",
      postType: "OFFER",
      claimerName: "Carmen",
    });
  });

  it("does NOT surface 'post_claimed' for posts the member didn't author", () => {
    const p = post({
      postedBy: "bob",
      claimedBy: "carmen",
      status: "claimed",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice, bob, carmen],
    });
    expect(items).toEqual([]);
  });

  it("does NOT surface 'post_claimed' when the poster claimed their own post", () => {
    const p = post({
      postedBy: "alice",
      claimedBy: "alice",
      status: "claimed",
    });
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [p],
      projects: [],
      projectTasks: [],
      members: [alice],
    });
    expect(items).toEqual([]);
  });

  it("surfaces 'vouch_received' for vouches within the 7-day window", () => {
    const now = 1_000_000;
    const vouch: SignedVouch = {
      id: "v1",
      voucherKey: "bob",
      voucheeKey: "alice",
      kind: "manual",
      createdAt: now - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      signature: "sig",
    };
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
      vouches: [vouch],
      now,
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "vouch_received",
      voucherName: "Bob",
    });
  });

  it("does NOT surface vouches older than 7 days", () => {
    const now = 1_000_000;
    const vouch: SignedVouch = {
      id: "v1",
      voucherKey: "bob",
      voucheeKey: "alice",
      kind: "manual",
      createdAt: now - 8 * 24 * 60 * 60 * 1000, // 8 days ago
      signature: "sig",
    };
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [alice, bob],
      vouches: [vouch],
      now,
    });
    expect(items).toEqual([]);
  });

  it("does NOT surface vouches for other members", () => {
    const now = 1_000_000;
    const vouch: SignedVouch = {
      id: "v1",
      voucherKey: "alice",
      voucheeKey: "carmen",
      kind: "manual",
      createdAt: now - 1 * 24 * 60 * 60 * 1000,
      signature: "sig",
    };
    const items = computeAttentionItems({
      currentMember: alice,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [alice, carmen],
      vouches: [vouch],
      now,
    });
    expect(items).toEqual([]);
  });

  describe("co-organizer invitations", () => {
    const now = 1_000_000;
    const future = now + 14 * 24 * 60 * 60 * 1000;
    const proj = project({
      id: "proj_coorg",
      title: "Garden expansion",
      organizerKey: "bob",
    });
    function inv(
      overrides: Partial<CoOrganizerInvitation>,
    ): CoOrganizerInvitation {
      return {
        id: "inv_1",
        projectId: proj.id,
        inviterKey: "bob",
        inviteeKey: alice.publicKey,
        createdAt: now - 1000,
        expiresAt: future,
        nodeId,
        signature: "sig",
        ...overrides,
      };
    }

    it("surfaces an outstanding invitation addressed to the current member", () => {
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        coorgInvitations: [inv({})],
        now,
      });
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        kind: "coorganizer_invitation_received",
        invitationId: "inv_1",
        projectId: proj.id,
        projectTitle: proj.title,
        inviterName: "Bob",
        inviterKey: "bob",
        expiresAt: future,
      });
    });

    it("does NOT surface invitations addressed to other members", () => {
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob, carmen],
        coorgInvitations: [inv({ inviteeKey: carmen.publicKey })],
        now,
      });
      expect(items).toEqual([]);
    });

    it("drops an invitation that already has a response", () => {
      const response: CoOrganizerInvitationResponse = {
        id: "r1",
        invitationId: "inv_1",
        inviteeKey: alice.publicKey,
        decision: "accept",
        decidedAt: now - 100,
        nodeId,
        signature: "sig",
      };
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        coorgInvitations: [inv({})],
        coorgInvitationResponses: [response],
        now,
      });
      expect(items).toEqual([]);
    });

    it("drops a revoked invitation", () => {
      const revocation: CoOrganizerInvitationRevocation = {
        id: "rv1",
        invitationId: "inv_1",
        inviterKey: "bob",
        revokedAt: now - 100,
        nodeId,
        signature: "sig",
      };
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        coorgInvitations: [inv({})],
        coorgInvitationRevocations: [revocation],
        now,
      });
      expect(items).toEqual([]);
    });

    it("drops an expired invitation", () => {
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        coorgInvitations: [inv({ expiresAt: now - 1 })],
        now,
      });
      expect(items).toEqual([]);
    });

    it("falls back to a generic inviter name when the member cache lacks the inviter", () => {
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice], // bob deliberately omitted
        coorgInvitations: [inv({})],
        now,
      });
      expect(items).toHaveLength(1);
      expect(
        (items[0] as { inviterName: string }).inviterName,
      ).toBe("another community member");
    });
  });

  describe("community events", () => {
    // Anchor "now" at noon UTC on a fixed day so today-range checks
    // are deterministic regardless of when the test runs.
    const NOW = Date.UTC(2026, 10, 15, 12, 0, 0);
    const DAY = 24 * 60 * 60 * 1000;

    function ev(overrides: Partial<Event> & { id: string }): Event {
      const defaults: Event = {
        id: overrides.id,
        kind: "event",
        title: `Event ${overrides.id}`,
        description: "",
        category: "skills",
        startsAt: NOW + 60_000,
        endsAt: null,
        location: "the bench",
        capacity: null,
        templateId: null,
        createdAt: NOW - 7 * DAY,
        createdBy: "bob", // not the current member by default
        nodeId,
        signature: "sig",
      };
      return { ...defaults, ...overrides };
    }

    function rsvp(
      overrides: Partial<EventRsvpRow> & {
        eventId: string;
        memberKey: string;
        status: "going" | "maybe" | "not_going";
      },
    ): EventRsvpRow {
      const defaults = {
        id: `r_${overrides.eventId}_${overrides.memberKey}`,
        respondedAt: NOW - DAY,
      };
      return { ...defaults, ...overrides };
    }

    function cancel(
      overrides: Partial<EventCancellation> & { eventId: string },
    ): EventCancellation {
      const defaults: EventCancellation = {
        id: `c_${overrides.eventId}`,
        kind: "event_cancellation",
        eventId: overrides.eventId,
        reason: "",
        cancelledAt: NOW - DAY,
        createdBy: "bob",
        nodeId,
        signature: "sig",
      };
      return { ...defaults, ...overrides };
    }

    describe("event_today", () => {
      it("surfaces to a member RSVP'd 'going' for an event starting today", () => {
        const e = ev({ id: "ev_today", startsAt: NOW + 3 * 3_600_000 });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "going",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          now: NOW,
        });
        const today = items.find((i) => i.kind === "event_today");
        expect(today).toBeDefined();
        if (today && today.kind === "event_today") {
          expect(today.eventId).toBe("ev_today");
          expect(today.deepLink).toBe("/events/ev_today");
        }
      });

      it("surfaces to a member RSVP'd 'maybe'", () => {
        const e = ev({ id: "ev_today", startsAt: NOW + 3_600_000 });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "maybe",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_today")).toBe(true);
      });

      it("does NOT surface to a member RSVP'd 'not_going'", () => {
        const e = ev({ id: "ev_today", startsAt: NOW + 3_600_000 });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "not_going",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_today")).toBe(false);
      });

      it("does NOT surface for events on other days", () => {
        const e = ev({ id: "ev_tomorrow", startsAt: NOW + 2 * DAY });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "going",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_today")).toBe(false);
      });

      it("does NOT surface for cancelled events", () => {
        const e = ev({ id: "ev_today", startsAt: NOW + 3_600_000 });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "going",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          eventCancellations: [cancel({ eventId: e.id })],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_today")).toBe(false);
      });
    });

    describe("event_cancelled", () => {
      it("surfaces to RSVP'd members when a cancellation lands", () => {
        const e = ev({ id: "ev_cancel", startsAt: NOW + 5 * DAY, title: "Cleanup day" });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "going",
        });
        const c = cancel({
          eventId: e.id,
          reason: "rain",
          cancelledAt: NOW - 2 * DAY,
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          eventCancellations: [c],
          now: NOW,
        });
        const cancelled = items.find((i) => i.kind === "event_cancelled");
        expect(cancelled).toBeDefined();
        if (cancelled && cancelled.kind === "event_cancelled") {
          expect(cancelled.eventTitle).toBe("Cleanup day");
          expect(cancelled.reason).toBe("rain");
        }
      });

      it("rolls off after 7 days", () => {
        const e = ev({ id: "ev_cancel", startsAt: NOW - 10 * DAY });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "going",
        });
        const c = cancel({
          eventId: e.id,
          cancelledAt: NOW - 8 * DAY,
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          eventCancellations: [c],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_cancelled")).toBe(false);
      });

      it("does NOT surface to members who RSVP'd 'not_going'", () => {
        const e = ev({ id: "ev_cancel", startsAt: NOW + 5 * DAY });
        const r = rsvp({
          eventId: e.id,
          memberKey: alice.publicKey,
          status: "not_going",
        });
        const c = cancel({ eventId: e.id, cancelledAt: NOW - DAY });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [r],
          eventCancellations: [c],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_cancelled")).toBe(false);
      });
    });

    describe("event_capacity_reached", () => {
      it("surfaces to the organizer when going-count reaches capacity", () => {
        const e = ev({
          id: "ev_full",
          startsAt: NOW + 5 * DAY,
          capacity: 2,
          createdBy: alice.publicKey,
          title: "Skillshare",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice, bob, carmen],
          events: [e],
          eventRsvps: [
            rsvp({ eventId: e.id, memberKey: "bob", status: "going" }),
            rsvp({ eventId: e.id, memberKey: "carmen", status: "going" }),
          ],
          now: NOW,
        });
        const cap = items.find((i) => i.kind === "event_capacity_reached");
        expect(cap).toBeDefined();
        if (cap && cap.kind === "event_capacity_reached") {
          expect(cap.capacity).toBe(2);
          expect(cap.title).toBe("Skillshare");
        }
      });

      it("does NOT surface to non-organizers", () => {
        const e = ev({
          id: "ev_full",
          capacity: 1,
          createdBy: "bob",
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice, bob],
          events: [e],
          eventRsvps: [
            rsvp({ eventId: e.id, memberKey: "carmen", status: "going" }),
          ],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_capacity_reached")).toBe(
          false,
        );
      });

      it("does NOT surface when capacity is null", () => {
        const e = ev({
          id: "ev_uncapped",
          capacity: null,
          createdBy: alice.publicKey,
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [
            rsvp({ eventId: e.id, memberKey: "bob", status: "going" }),
            rsvp({ eventId: e.id, memberKey: "carmen", status: "going" }),
          ],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_capacity_reached")).toBe(
          false,
        );
      });

      it("does NOT surface when going count is below capacity", () => {
        const e = ev({
          id: "ev_underfilled",
          capacity: 5,
          createdBy: alice.publicKey,
        });
        const items = computeAttentionItems({
          currentMember: alice,
          posts: [],
          projects: [],
          projectTasks: [],
          members: [alice],
          events: [e],
          eventRsvps: [
            rsvp({ eventId: e.id, memberKey: "bob", status: "going" }),
            rsvp({ eventId: e.id, memberKey: "carmen", status: "maybe" }),
          ],
          now: NOW,
        });
        expect(items.some((i) => i.kind === "event_capacity_reached")).toBe(
          false,
        );
      });
    });
  });

  // Bug fix: paused duration was being computed from `Project.createdAt`,
  // which mis-fires on a year-old project paused yesterday ("paused 365
  // days"). The fix wires `Project.pausedAt` and thresholds against it.
  describe("project_paused_long uses pausedAt, not createdAt", () => {
    const NOW = 10_000_000_000;
    const DAY = 24 * 60 * 60 * 1000;

    it("does NOT surface a long-lived project paused only yesterday", () => {
      // A year-old project paused 1 day ago — under the old code this
      // would have read `daysPaused: 365` because the threshold ran
      // against createdAt. With pausedAt wired, it correctly stays
      // silent until 7 days after the pause.
      const proj = project({
        id: "proj_recent_pause",
        status: "paused",
        organizerKey: "alice",
        createdAt: NOW - 365 * DAY,
        pausedAt: NOW - 1 * DAY,
      });
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice],
        now: NOW,
      });
      expect(items.some((i) => i.kind === "project_paused_long")).toBe(false);
    });

    it("surfaces once pausedAt is more than 7 days old", () => {
      const proj = project({
        id: "proj_old_pause",
        status: "paused",
        organizerKey: "alice",
        createdAt: NOW - 365 * DAY,
        pausedAt: NOW - 8 * DAY,
      });
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice],
        now: NOW,
      });
      const paused = items.find((i) => i.kind === "project_paused_long");
      expect(paused).toBeDefined();
      if (paused?.kind === "project_paused_long") {
        // 8 days exactly — uses pausedAt, NOT the 365-day createdAt.
        expect(paused.daysPaused).toBe(8);
      }
    });

    it("legacy paused row without pausedAt still surfaces but with no day count", () => {
      // Pre-feature project that was already in status: "paused" when
      // the field was added — `pausedAt` is undefined. We do not fake
      // a duration against createdAt; we surface the item with the
      // day-count-free copy variant (the existing
      // `attention.projectPaused.line` already omits days).
      const proj = project({
        id: "proj_legacy_paused",
        status: "paused",
        organizerKey: "alice",
        createdAt: NOW - 365 * DAY,
        // pausedAt deliberately omitted
      });
      const items = computeAttentionItems({
        currentMember: alice,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice],
        now: NOW,
      });
      const paused = items.find((i) => i.kind === "project_paused_long");
      expect(paused).toBeDefined();
      if (paused?.kind === "project_paused_long") {
        expect(paused.daysPaused).toBeUndefined();
      }
    });
  });

  // PR #NNN: organizer-targeted attention items read authority from
  // `Project.coOrganizerKeys` via `isOrganizer` — the live list
  // materialized on every grant AND removal since PR #238. This
  // replaced the rows-derived view PR #235 threaded through, which
  // diverged from every action gate on the two transitions the signed
  // rows can't express: handoff demotion (under-grant) and step-down /
  // removal (over-grant). See `docs/co-organizer-invitations.md` §5.
  describe("organizer authority reads the materialized live list", () => {
    const NOW = 10_000_000_000;
    const DAY = 24 * 60 * 60 * 1000;

    function inv(
      overrides: Partial<CoOrganizerInvitation> & { id: string },
    ): CoOrganizerInvitation {
      return {
        projectId: "proj_auth",
        inviterKey: "alice",
        inviteeKey: "bob",
        createdAt: NOW - 2 * DAY,
        expiresAt: NOW + 14 * DAY,
        nodeId,
        signature: "sig",
        ...overrides,
      };
    }
    function accept(
      invitationId: string,
      inviteeKey: string,
    ): CoOrganizerInvitationResponse {
      return {
        id: `r_${invitationId}`,
        invitationId,
        inviteeKey,
        decision: "accept",
        decidedAt: NOW - DAY,
        nodeId,
        signature: "sig",
      };
    }

    it("surfaces confirm_task to a member in the materialized coOrganizerKeys array", () => {
      // Bob's acceptance has been materialized into the array (PR #238
      // does this on accept). Authority reads the array, so he gets the
      // confirm_task item for Carmen's completed task.
      const proj = project({
        id: "proj_auth",
        organizerKey: "alice",
        coOrganizerKeys: [bob.publicKey],
      });
      const t = task({
        id: "t_auth",
        projectId: proj.id,
        status: "awaiting_confirmation",
        completedBy: "carmen",
        title: "Set up tool wall",
      });
      const items = computeAttentionItems({
        currentMember: bob,
        posts: [],
        projects: [proj],
        projectTasks: [t],
        members: [alice, bob, carmen],
        now: NOW,
      });
      const confirm = items.find((i) => i.kind === "confirm_task");
      expect(confirm).toBeDefined();
      if (confirm?.kind === "confirm_task") {
        expect(confirm.taskId).toBe(t.id);
      }
    });

    it("surfaces project_deadline_approaching to a member in the array", () => {
      const proj = project({
        id: "proj_auth",
        organizerKey: "alice",
        coOrganizerKeys: [bob.publicKey],
        status: "active",
        deadline: NOW + 2 * DAY,
      });
      const items = computeAttentionItems({
        currentMember: bob,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        now: NOW,
      });
      expect(
        items.some((i) => i.kind === "project_deadline_approaching"),
      ).toBe(true);
    });

    it("over-grant regression: does NOT surface to a stepped-down member whose accept rows linger but the array was cleared", () => {
      // Bob accepted, then stepped down. `removeCoOrganizer` cleared the
      // array but the signed invitation + acceptance rows persist (there
      // is no step-down record type). The rows-derived view kept him
      // "in role" forever; reading the array correctly drops him.
      const proj = project({
        id: "proj_auth",
        organizerKey: "alice",
        coOrganizerKeys: [], // stepped down — array cleared
        status: "active",
        deadline: NOW + 2 * DAY,
      });
      const invitation = inv({ id: "inv_steppeddown", inviteeKey: bob.publicKey });
      const response = accept(invitation.id, bob.publicKey);
      const items = computeAttentionItems({
        currentMember: bob,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        coorgInvitations: [invitation],
        coorgInvitationResponses: [response],
        now: NOW,
      });
      expect(
        items.some((i) => i.kind === "project_deadline_approaching"),
      ).toBe(false);
    });

    it("under-grant regression: surfaces to a handoff demotee present only in the array (no coorg rows)", () => {
      // Bob was the primary, handed off to Alice, and was demoted into
      // `coOrganizerKeys`. Handoff writes no invitation/acceptance rows,
      // so the rows-derived view would never see Bob's standing; the
      // array carries it, so he keeps organizer attention items.
      const proj = project({
        id: "proj_auth",
        organizerKey: "alice",
        coOrganizerKeys: [bob.publicKey],
        status: "active",
        deadline: NOW + 2 * DAY,
      });
      const items = computeAttentionItems({
        currentMember: bob,
        posts: [],
        projects: [proj],
        projectTasks: [],
        members: [alice, bob],
        // No coorg rows at all — the handoff demotion left none.
        now: NOW,
      });
      expect(
        items.some((i) => i.kind === "project_deadline_approaching"),
      ).toBe(true);
    });
  });
});

describe("project_adoption_proposed", () => {
  const me = member("primary");

  it("surfaces only for the sitting primary of the project", () => {
    const items = computeAttentionItems({
      currentMember: me,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [me],
      proposals: [adoptionProposal({ sittingPrimaryKey: "primary" })],
    });
    const adoption = items.filter(
      (i) => i.kind === "project_adoption_proposed",
    );
    expect(adoption).toHaveLength(1);
    if (adoption[0].kind === "project_adoption_proposed") {
      expect(adoption[0].projectTitle).toBe("Community Fridge");
      expect(adoption[0].deepLink).toBe("/proposals");
    }
  });

  it("does not surface for a member who is not the sitting primary", () => {
    const items = computeAttentionItems({
      currentMember: member("someone-else"),
      posts: [],
      projects: [],
      projectTasks: [],
      members: [],
      proposals: [adoptionProposal({ sittingPrimaryKey: "primary" })],
    });
    expect(
      items.some((i) => i.kind === "project_adoption_proposed"),
    ).toBe(false);
  });

  it("drops once the proposal is closed", () => {
    const items = computeAttentionItems({
      currentMember: me,
      posts: [],
      projects: [],
      projectTasks: [],
      members: [me],
      proposals: [
        adoptionProposal({ sittingPrimaryKey: "primary", status: "withdrawn" }),
      ],
    });
    expect(
      items.some((i) => i.kind === "project_adoption_proposed"),
    ).toBe(false);
  });
});
