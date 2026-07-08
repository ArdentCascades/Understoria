/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EventActionError,
  attendeeCount,
  cancelEvent,
  createEvent,
  getEvent,
  getMemberRsvp,
  listEvents,
  listRsvpsForEvent,
  rsvpToEvent,
} from "./events";
import { db, SETTING_KEYS, setSetting } from "./database";
import {
  canonicalEventPayload,
  generateKeyPair,
  sign,
  verifyEvent,
  verifyEventCancellation,
} from "@/lib/crypto";
import {
  pullFederatedEventCancellations,
  pullFederatedEvents,
} from "@/lib/federationSync";
import type { Event } from "@/types";

const NODE = "node_events_test";

async function reset() {
  await Promise.all([
    db.events.clear(),
    db.eventRsvps.clear(),
    db.eventCancellations.clear(),
    db.outbox.clear(),
    db.settings.clear(),
  ]);
  // The outbox enqueue helper no-ops when `communityNodeUrl` is unset.
  // Tests that care about the outbox-write path set the URL to a stub.
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
}

interface OrganizerFixture {
  organizerKey: string;
  organizerSecretKey: string;
}

function makeOrganizer(): OrganizerFixture {
  const kp = generateKeyPair();
  return {
    organizerKey: kp.publicKey,
    organizerSecretKey: kp.secretKey,
  };
}

async function makeEvent(
  organizer: OrganizerFixture,
  overrides: Partial<{
    title: string;
    description: string;
    category: string;
    startsAt: number;
    endsAt: number | null;
    location: string;
    capacity: number | null;
    templateId: string | null;
    now: number;
  }> = {},
): Promise<Event> {
  return createEvent({
    title: overrides.title ?? "Skillshare",
    description: overrides.description ?? "",
    category: overrides.category ?? "skills-exchange",
    startsAt: overrides.startsAt ?? 5_000_000,
    endsAt: overrides.endsAt ?? null,
    location: overrides.location ?? "Community room",
    capacity: overrides.capacity ?? null,
    templateId: overrides.templateId ?? null,
    organizerKey: organizer.organizerKey,
    organizerSecretKey: organizer.organizerSecretKey,
    nodeId: NODE,
    now: overrides.now ?? 1_000_000,
  });
}

// --------------------------------------------------------------------------
// The former type-level NEGATIVE tests here (rejecting "event_rsvp"
// from OutboxRow.kind, asserting no enqueue/pull helpers exist) were
// deliberately retired by participation federation Phase 2
// (docs/project-federation.md §6): the local-only stance they locked
// was reversed after field use showed an organizer could not see
// attendance from anyone else's phone. The same surfaces are now
// asserted POSITIVELY, and the reversal's adversary analysis lives in
// threat-model §7 ("Federated participation records").
// --------------------------------------------------------------------------

describe("OutboxRow.kind participation federation (Phase 2)", () => {
  it('accepts "event_rsvp" as an OutboxRow kind', () => {
    type OutboxKind = import("./database").OutboxRow["kind"];
    const ok: OutboxKind[] = ["event", "event_cancellation", "event_rsvp"];
    expect(ok).toContain("event_rsvp");
  });

  it("exports the RSVP enqueue + pull helpers", async () => {
    const outbox = await import("@/lib/outbox");
    expect(typeof outbox.enqueueEventRsvpOutbox).toBe("function");
    const fed = await import("@/lib/federationSync");
    expect(typeof fed.pullFederatedEventRsvps).toBe("function");
  });
});

// --------------------------------------------------------------------------

describe("createEvent", () => {
  beforeEach(reset);

  it("persists a signed event whose signature verifies and enqueues an outbox row", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);

    expect(event.createdBy).toBe(organizer.organizerKey);
    expect(event.kind).toBe("event");
    expect(event.createdAt).toBe(1_000_000);
    expect(verifyEvent(event)).toBe(true);

    const stored = await getEvent(event.id);
    expect(stored?.id).toBe(event.id);
    expect(stored?.signature).toBe(event.signature);

    const outboxRows = await db.outbox.toArray();
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0].kind).toBe("event");
    expect(outboxRows[0].recordId).toBe(event.id);
    const wire = JSON.parse(outboxRows[0].payload) as Event;
    expect(wire.signature).toBe(event.signature);
    expect(verifyEvent(wire)).toBe(true);
  });

  it("accepts a valid templateId, persists and enqueues it, and the signature verifies", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer, { templateId: "potluck" });
    expect(event.templateId).toBe("potluck");
    expect(verifyEvent(event)).toBe(true);
    expect((await getEvent(event.id))?.templateId).toBe("potluck");
    const outboxRows = await db.outbox.toArray();
    expect(outboxRows).toHaveLength(1);
    const wire = JSON.parse(outboxRows[0].payload) as Event;
    expect(wire.templateId).toBe("potluck");
    expect(verifyEvent(wire)).toBe(true);
  });

  it("round-trips a free-text category outside the legacy nine", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer, { category: "social" });
    expect(event.category).toBe("social");
    expect((await getEvent(event.id))?.category).toBe("social");
    expect(verifyEvent(event)).toBe(true);
  });

  it("rejects an empty templateId and persists nothing", async () => {
    const organizer = makeOrganizer();
    await expect(
      makeEvent(organizer, { templateId: "" }),
    ).rejects.toMatchObject({ code: "invalid_template_id" });
    expect(await db.events.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
  });

  it("rejects an over-length templateId and persists nothing", async () => {
    const organizer = makeOrganizer();
    await expect(
      makeEvent(organizer, { templateId: "a".repeat(51) }),
    ).rejects.toMatchObject({ code: "invalid_template_id" });
    expect(await db.events.count()).toBe(0);
  });

  it("accepts a 50-character templateId (inclusive upper bound)", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer, { templateId: "a".repeat(50) });
    expect(event.templateId).toBe("a".repeat(50));
  });

  describe("startsAt grace window", () => {
    const GRACE_MS = 5 * 60 * 1000;

    it("rejects when startsAt is more than 5 minutes before now", async () => {
      const organizer = makeOrganizer();
      await expect(
        makeEvent(organizer, {
          startsAt: 1_000_000,
          now: 1_000_000 + GRACE_MS + 1,
        }),
      ).rejects.toMatchObject({ code: "start_in_past" });
      expect(await db.events.count()).toBe(0);
      expect(await db.outbox.count()).toBe(0);
    });

    it("accepts startsAt within the 5-minute grace window", async () => {
      const organizer = makeOrganizer();
      const ev = await makeEvent(organizer, {
        startsAt: 1_000_000,
        now: 1_000_000 + GRACE_MS - 1,
      });
      expect(ev.id).toBeTruthy();
    });

    it("accepts startsAt exactly at now", async () => {
      const organizer = makeOrganizer();
      const ev = await makeEvent(organizer, {
        startsAt: 1_000_000,
        now: 1_000_000,
      });
      expect(ev.id).toBeTruthy();
    });

    it("accepts startsAt in the future", async () => {
      const organizer = makeOrganizer();
      const ev = await makeEvent(organizer, {
        startsAt: 2_000_000,
        now: 1_000_000,
      });
      expect(ev.id).toBeTruthy();
    });
  });

  it("rejects when the signature does not verify (mismatched secret key)", async () => {
    const organizer = makeOrganizer();
    const stranger = generateKeyPair();
    // Claim to be the organizer but sign with someone else's secret.
    await expect(
      createEvent({
        title: "Skillshare",
        description: "",
        category: "skills-exchange",
        startsAt: 5_000_000,
        endsAt: null,
        location: "Community room",
        capacity: null,
        templateId: null,
        organizerKey: organizer.organizerKey,
        organizerSecretKey: stranger.secretKey,
        nodeId: NODE,
        now: 1_000_000,
      }),
    ).rejects.toMatchObject({ code: "signing_failed" });
    // Nothing persisted.
    expect(await db.events.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
  });
});

describe("rsvpToEvent", () => {
  beforeEach(reset);

  it("creates a row on first RSVP and updates in place on the second", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const initialOutbox = await db.outbox.count();

    const member = generateKeyPair();
    const first = await rsvpToEvent({
      eventId: event.id,
      memberKey: member.publicKey,
      status: "going",
      now: 2_000_000,
    });
    expect(first.status).toBe("going");
    expect(first.respondedAt).toBe(2_000_000);

    const second = await rsvpToEvent({
      eventId: event.id,
      memberKey: member.publicKey,
      status: "maybe",
      now: 3_000_000,
    });
    expect(second.id).toBe(first.id); // same row updated
    expect(second.status).toBe("maybe");
    expect(second.respondedAt).toBe(3_000_000);

    expect(await db.eventRsvps.count()).toBe(1);

    // LOAD-BEARING: RSVPs are local-only. The outbox length is
    // unchanged across RSVP writes — see docs/community-events.md
    // §4 + §7.
    expect(await db.outbox.count()).toBe(initialOutbox);
  });

  it("transitions going → maybe → not_going, each updating respondedAt", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const member = generateKeyPair();

    await rsvpToEvent({
      eventId: event.id,
      memberKey: member.publicKey,
      status: "going",
      now: 100,
    });
    let row = await getMemberRsvp(event.id, member.publicKey);
    expect(row?.status).toBe("going");
    expect(row?.respondedAt).toBe(100);

    await rsvpToEvent({
      eventId: event.id,
      memberKey: member.publicKey,
      status: "maybe",
      now: 200,
    });
    row = await getMemberRsvp(event.id, member.publicKey);
    expect(row?.status).toBe("maybe");
    expect(row?.respondedAt).toBe(200);

    await rsvpToEvent({
      eventId: event.id,
      memberKey: member.publicKey,
      status: "not_going",
      now: 300,
    });
    row = await getMemberRsvp(event.id, member.publicKey);
    expect(row?.status).toBe("not_going");
    expect(row?.respondedAt).toBe(300);
  });
});

describe("listRsvpsForEvent + attendeeCount", () => {
  beforeEach(reset);

  it("returns the right subsets when filtered by status; counts match the total", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);

    const going = [generateKeyPair(), generateKeyPair(), generateKeyPair()];
    const maybe = [generateKeyPair()];
    const not = [generateKeyPair(), generateKeyPair()];

    for (const kp of going) {
      await rsvpToEvent({
        eventId: event.id,
        memberKey: kp.publicKey,
        status: "going",
      });
    }
    for (const kp of maybe) {
      await rsvpToEvent({
        eventId: event.id,
        memberKey: kp.publicKey,
        status: "maybe",
      });
    }
    for (const kp of not) {
      await rsvpToEvent({
        eventId: event.id,
        memberKey: kp.publicKey,
        status: "not_going",
      });
    }

    expect((await listRsvpsForEvent(event.id, ["going"])).length).toBe(3);
    expect((await listRsvpsForEvent(event.id, ["maybe"])).length).toBe(1);
    expect((await listRsvpsForEvent(event.id, ["not_going"])).length).toBe(2);
    expect((await listRsvpsForEvent(event.id)).length).toBe(6);

    const total = (await listRsvpsForEvent(event.id)).length;
    const sumViaCounts =
      (await attendeeCount(event.id, "going")) +
      (await attendeeCount(event.id, "maybe")) +
      (await listRsvpsForEvent(event.id, ["not_going"])).length;
    expect(sumViaCounts).toBe(total);
  });
});

describe("cancelEvent", () => {
  beforeEach(reset);

  it("signs + persists a cancellation that verifies, and enqueues an outbox row", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const beforeOutbox = await db.outbox.count();

    const cancellation = await cancelEvent({
      eventId: event.id,
      reason: "Snow",
      organizerKey: organizer.organizerKey,
      organizerSecretKey: organizer.organizerSecretKey,
      nodeId: NODE,
      now: 9_000_000,
    });

    expect(cancellation.eventId).toBe(event.id);
    expect(cancellation.reason).toBe("Snow");
    expect(cancellation.cancelledAt).toBe(9_000_000);
    expect(verifyEventCancellation(cancellation)).toBe(true);

    const stored = await db.eventCancellations.get(cancellation.id);
    expect(stored?.signature).toBe(cancellation.signature);

    const after = await db.outbox
      .where("kind")
      .equals("event_cancellation")
      .toArray();
    expect(after).toHaveLength(1);
    expect(after[0].recordId).toBe(cancellation.id);
    expect((await db.outbox.count()) - beforeOutbox).toBe(1);
  });

  it("is idempotent — a second call returns the existing cancellation without re-signing or re-enqueueing", async () => {
    const organizer = makeOrganizer();
    const event = await makeEvent(organizer);
    const first = await cancelEvent({
      eventId: event.id,
      reason: "Snow",
      organizerKey: organizer.organizerKey,
      organizerSecretKey: organizer.organizerSecretKey,
      nodeId: NODE,
      now: 9_000_000,
    });
    const outboxBefore = await db.outbox
      .where("kind")
      .equals("event_cancellation")
      .count();
    const second = await cancelEvent({
      eventId: event.id,
      reason: "Different reason this time",
      organizerKey: organizer.organizerKey,
      organizerSecretKey: organizer.organizerSecretKey,
      nodeId: NODE,
      now: 9_999_999,
    });
    expect(second.id).toBe(first.id);
    expect(second.signature).toBe(first.signature);
    expect(second.reason).toBe("Snow"); // original kept
    const outboxAfter = await db.outbox
      .where("kind")
      .equals("event_cancellation")
      .count();
    expect(outboxAfter).toBe(outboxBefore);
  });

  it("rejects when the caller is not the original organizer", async () => {
    const organizer = makeOrganizer();
    const stranger = makeOrganizer();
    const event = await makeEvent(organizer);
    await expect(
      cancelEvent({
        eventId: event.id,
        reason: "Trying to hijack",
        organizerKey: stranger.organizerKey,
        organizerSecretKey: stranger.organizerSecretKey,
        nodeId: NODE,
      }),
    ).rejects.toMatchObject({ code: "not_organizer" });
    expect(await db.eventCancellations.count()).toBe(0);
  });

  it("rejects when the event does not exist", async () => {
    const organizer = makeOrganizer();
    await expect(
      cancelEvent({
        eventId: "no_such_id",
        reason: "",
        organizerKey: organizer.organizerKey,
        organizerSecretKey: organizer.organizerSecretKey,
        nodeId: NODE,
      }),
    ).rejects.toBeInstanceOf(EventActionError);
  });
});

describe("listEvents includeCancelled filter", () => {
  beforeEach(reset);

  it("excludes cancelled events by default; includes them when asked", async () => {
    const organizer = makeOrganizer();
    const live = await makeEvent(organizer, {
      title: "Live event",
      startsAt: 100,
      now: 1,
    });
    const cancelled = await makeEvent(organizer, {
      title: "Cancelled event",
      startsAt: 200,
      now: 2,
    });
    await cancelEvent({
      eventId: cancelled.id,
      reason: "",
      organizerKey: organizer.organizerKey,
      organizerSecretKey: organizer.organizerSecretKey,
      nodeId: NODE,
      now: 3,
    });

    const visible = await listEvents();
    expect(visible.map((e) => e.id)).toEqual([live.id]);

    const all = await listEvents({ includeCancelled: true });
    expect(all.map((e) => e.id).sort()).toEqual([live.id, cancelled.id].sort());
  });

  it("filters by startsAt window", async () => {
    const organizer = makeOrganizer();
    await makeEvent(organizer, { title: "early", startsAt: 100, now: 1 });
    await makeEvent(organizer, { title: "mid", startsAt: 500, now: 2 });
    await makeEvent(organizer, { title: "late", startsAt: 900, now: 3 });

    const mid = await listEvents({ fromStartsAt: 200, toStartsAt: 800 });
    expect(mid).toHaveLength(1);
    expect(mid[0].title).toBe("mid");
  });
});

// --------------------------------------------------------------------------
// Federation pull
// --------------------------------------------------------------------------

function makeFederatedEvent(
  organizer: OrganizerFixture,
  opts: {
    id: string;
    nodeId: string;
    createdAt: number;
    startsAt?: number;
    templateId?: string | null;
    category?: string;
  },
): Event {
  const payload = {
    id: opts.id,
    kind: "event" as const,
    title: "Federated",
    description: "",
    category: opts.category ?? "skills-exchange",
    startsAt: opts.startsAt ?? opts.createdAt + 1_000_000,
    endsAt: null,
    location: "Peer community room",
    capacity: null,
    templateId: opts.templateId ?? null,
    createdAt: opts.createdAt,
    createdBy: organizer.organizerKey,
    nodeId: opts.nodeId,
  };
  const signature = sign(
    canonicalEventPayload(payload),
    organizer.organizerSecretKey,
  );
  return { ...payload, signature };
}

describe("pullFederatedEvents", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("inserts verified peer rows, dedups on id, and advances the cursor on success only", async () => {
    const peerOrganizer = makeOrganizer();
    const good = makeFederatedEvent(peerOrganizer, {
      id: "peer_good",
      nodeId: "peer_node",
      createdAt: 5_000,
    });
    // Tamper a copy to produce a bad-signature row.
    const bad = makeFederatedEvent(peerOrganizer, {
      id: "peer_bad",
      nodeId: "peer_node",
      createdAt: 10_000,
    });
    const badTampered: Event = { ...bad, title: "tampered after sign" };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ events: [good, badTampered] }),
      }),
    );
    const result = await pullFederatedEvents();
    expect(result).toEqual({ inserted: 1, skipped: 1 });
    expect(await db.events.get("peer_good")).toMatchObject({
      nodeId: "peer_node",
    });
    expect(await db.events.get("peer_bad")).toBeUndefined();

    // Cursor advanced to the verified row's (createdAt, id) pair — not
    // past the rejected row.
    expect(
      await db.settings
        .get(SETTING_KEYS.federationLastEventPull)
        .then((r) => r?.value),
    ).toBe("5000:peer_good");

    // Idempotent: second pull skips the already-stored row.
    const second = await pullFederatedEvents();
    expect(second).toEqual({ inserted: 0, skipped: 2 });
    expect(await db.events.count()).toBe(1);
  });

  it("ingests a templated, social-category peer event — unknown templateId and category both round-trip", async () => {
    const peerOrganizer = makeOrganizer();
    const templated = makeFederatedEvent(peerOrganizer, {
      id: "peer_templated",
      nodeId: "peer_node",
      createdAt: 5_000,
      templateId: "game-night",
      category: "social",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ events: [templated] }),
      }),
    );
    const result = await pullFederatedEvents();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    const stored = await db.events.get("peer_templated");
    expect(stored?.templateId).toBe("game-night");
    expect(stored?.category).toBe("social");
  });

  it("does NOT expose a pullFederatedEventRsvps function (RSVPs never federate)", async () => {
    // Federation-pull form of the load-bearing negative — even when
    // a hostile / malformed RSVP-shaped row arrives in an `events`
    // response body, there is no code path that would write it as
    // an RSVP. The matching outbox kind would not exist either.
    const malformedRsvp = {
      id: "rsvp_attempt",
      kind: "event_rsvp",
      eventId: "some_event",
      memberKey: "some_key",
      status: "going",
      respondedAt: 1,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ events: [malformedRsvp] }),
      }),
    );
    const result = await pullFederatedEvents();
    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(await db.eventRsvps.count()).toBe(0);
    // And no outbox row of any RSVP-shaped kind exists.
    const rows = await db.outbox.toArray();
    expect(rows.every((r) => r.kind !== ("event_rsvp" as never))).toBe(true);
  });
});

describe("pullFederatedEventCancellations", () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllGlobals());

  it("inserts a verified cancellation and advances the cursor", async () => {
    const peerOrganizer = makeOrganizer();
    // Build the cancellation in canonical order and sign.
    const payload = {
      id: "peer_cancel_1",
      kind: "event_cancellation" as const,
      eventId: "peer_event_1",
      reason: "Snow",
      cancelledAt: 12_345,
      createdBy: peerOrganizer.organizerKey,
      nodeId: "peer_node",
    };
    const { canonicalEventCancellationPayload } = await import(
      "@/lib/crypto"
    );
    const signature = sign(
      canonicalEventCancellationPayload(payload),
      peerOrganizer.organizerSecretKey,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          eventCancellations: [{ ...payload, signature }],
        }),
      }),
    );
    const result = await pullFederatedEventCancellations();
    expect(result).toEqual({ inserted: 1, skipped: 0 });
    expect(await db.eventCancellations.get("peer_cancel_1")).toMatchObject({
      eventId: "peer_event_1",
    });
    expect(
      await db.settings
        .get(SETTING_KEYS.federationLastEventCancellationPull)
        .then((r) => r?.value),
    ).toBe("12345:peer_cancel_1");
  });
});
