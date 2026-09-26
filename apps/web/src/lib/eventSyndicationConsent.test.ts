/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// Event syndication consents (docs/calendar.md §10.6 — the
// organizer-consented calendar feed). What these pin: only the
// event's organizer can flip the flag from this device (the node
// and every puller re-check), retraction replaces a still-pending
// allow in the queue, and absence reads as OFF — the default an
// event can only leave by its own organizer's signature.
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair, verifyStateRecord } from "@understoria/shared/crypto";
import type { Event } from "@understoria/shared/types";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import {
  getEventSyndicationConsent,
  setEventSyndicationConsent,
} from "./eventSyndicationConsent";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

beforeEach(wipe);

async function beMember(name: string) {
  const kp = generateKeyPair();
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test/api");
  return kp;
}

let seq = 0;
async function seedEvent(createdBy: string): Promise<Event> {
  const event: Event = {
    id: `ev_${++seq}`,
    kind: "event",
    title: "Seed swap",
    description: "",
    category: "food",
    startsAt: Date.now() + 86_400_000,
    endsAt: null,
    location: "The pavilion",
    capacity: null,
    templateId: null,
    createdAt: Date.now(),
    createdBy,
    nodeId: "node_t",
    signature: "sig-local",
  };
  await db.events.put(event);
  return event;
}

describe("event syndication consents — the organizer's flag", () => {
  it("signs, stores, and queues the flag; retraction replaces it in the queue", async () => {
    const me = await beMember("Orla");
    const event = await seedEvent(me.publicKey);

    const result = await setEventSyndicationConsent(event.id, true);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(verifyStateRecord(result.consent)).toBe(true);
    expect(result.consent.signerKey).toBe(me.publicKey);
    expect((await getEventSyndicationConsent(event.id))?.allow).toBe(true);

    const retract = await setEventSyndicationConsent(event.id, false);
    expect(retract.ok).toBe(true);
    expect((await getEventSyndicationConsent(event.id))?.allow).toBe(false);
    // Same natural dedupe key: the retraction replaced the pending
    // allow — an organizer can't race their own withdrawal.
    const queued = await db.outbox
      .filter((r) => r.kind === "event_syndication_consent")
      .toArray();
    expect(queued).toHaveLength(1);
  });

  it("refuses anyone but the event's organizer, and absence reads as OFF", async () => {
    const me = await beMember("Orla");
    const other = generateKeyPair();
    const event = await seedEvent(other.publicKey);
    expect(await setEventSyndicationConsent(event.id, true)).toEqual({
      ok: false,
      error: "not_organizer",
    });
    expect(await getEventSyndicationConsent(event.id)).toBeNull();
    // Unknown event: same refusal — never a signed record for
    // something this device can't attribute.
    expect(await setEventSyndicationConsent("ev_missing", true)).toEqual({
      ok: false,
      error: "not_organizer",
    });
    // And with no identity at all:
    await setSetting(SETTING_KEYS.currentMember, "");
    expect(await setEventSyndicationConsent(event.id, true)).toEqual({
      ok: false,
      error: "no_identity",
    });
    void me;
  });
});
