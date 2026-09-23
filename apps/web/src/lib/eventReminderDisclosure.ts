/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { signStateRecord } from "@understoria/shared/crypto";
import type { EventReminderDisclosure } from "@understoria/shared/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import {
  enqueueEventReminderDisclosureOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import { uuid } from "@/lib/id";

/*
 * Event reminder disclosures — docs/notifications.md v2, "named
 * event reminders".
 *
 * An organizer's per-event "reminders may name this event" flag.
 * Default OFF for every event (no record = no): reminders say only
 * that AN event is coming up. With the flag on, the named
 * lock-screen level — which each recipient chose for themselves,
 * with the shoulder-surfing warning — may carry the event's title,
 * read from the (already public, already signed) event at send
 * time. Two consents, ANDed: the organizer's about the event's
 * name, the recipient's about their own lock screen.
 *
 * A separate LWW record rather than an event field because the
 * event wire format is closed (canonicalEventPayload) — and
 * usefully so: the flag can be flipped or retracted at any time
 * after the immutable event is created, and a retraction takes
 * effect on the sweep's very next pass.
 */

export type SetDisclosureResult =
  | { ok: true; disclosure: EventReminderDisclosure }
  | { ok: false; error: "no_identity" | "locked" | "not_organizer" };

/** Sign and store the organizer's flag for one event and enqueue it
 *  for the node. Refuses locally unless the current member is the
 *  event's organizer — the node and every puller re-check. */
export async function setEventReminderDisclosure(
  eventId: string,
  allow: boolean,
): Promise<SetDisclosureResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  const event = await db.events.get(eventId);
  if (!event || event.createdBy !== me) {
    return { ok: false, error: "not_organizer" };
  }
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }

  const unsigned: Omit<EventReminderDisclosure, "signature"> = {
    id: uuid(),
    eventId,
    allow,
    updatedAt: Date.now(),
    signerKey: me,
  };
  const disclosure: EventReminderDisclosure = {
    ...unsigned,
    signature: signStateRecord<EventReminderDisclosure>(unsigned, secret),
  };
  await db.transaction(
    "rw",
    [db.eventReminderDisclosures, db.outbox, db.settings],
    async () => {
      await db.eventReminderDisclosures.put(disclosure);
      await enqueueEventReminderDisclosureOutbox(disclosure);
    },
  );
  void flushOutboxNow().catch(() => {});
  return { ok: true, disclosure };
}

/** One event's disclosure row, if any (absence = OFF). */
export async function getEventReminderDisclosure(
  eventId: string,
): Promise<EventReminderDisclosure | null> {
  return (await db.eventReminderDisclosures.get(eventId)) ?? null;
}
