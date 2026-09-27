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
import type { EventSyndicationConsent } from "@understoria/shared/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import {
  enqueueEventSyndicationConsentOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import { uuid } from "@/lib/id";

/*
 * Event syndication consents — docs/calendar.md §10.6, the
 * organizer-consented public calendar feed.
 *
 * An organizer's per-event "this event may appear on the public
 * community calendar feed" flag. Default OFF for every event (no
 * record = no): the event never enters the node's iCal feed. With
 * the flag on — and only where the operator has enabled the feed at
 * all — anyone holding the community's calendar link, including
 * people outside the community and their calendar providers, can
 * see the event's name, time, place and description. Retraction
 * takes effect on each subscriber's next poll; what was already
 * fetched stays fetched, which the UI copy says plainly.
 *
 * A separate LWW record rather than an event field for the same
 * reasons as the reminder disclosure: the event wire format is
 * closed (canonicalEventPayload), and an LWW record can be flipped
 * or retracted at any time after the immutable event is created.
 */

export type SetSyndicationResult =
  | { ok: true; consent: EventSyndicationConsent }
  | { ok: false; error: "no_identity" | "locked" | "not_organizer" };

/** Sign and store the organizer's flag for one event and enqueue it
 *  for the node. Refuses locally unless the current member is the
 *  event's organizer — the node and every puller re-check. */
export async function setEventSyndicationConsent(
  eventId: string,
  allow: boolean,
): Promise<SetSyndicationResult> {
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

  const unsigned: Omit<EventSyndicationConsent, "signature"> = {
    id: uuid(),
    eventId,
    allow,
    updatedAt: Date.now(),
    signerKey: me,
  };
  const consent: EventSyndicationConsent = {
    ...unsigned,
    signature: signStateRecord<EventSyndicationConsent>(unsigned, secret),
  };
  await db.transaction(
    "rw",
    [db.eventSyndicationConsents, db.outbox, db.settings],
    async () => {
      await db.eventSyndicationConsents.put(consent);
      await enqueueEventSyndicationConsentOutbox(consent);
    },
  );
  void flushOutboxNow().catch(() => {});
  return { ok: true, consent };
}

/** One event's consent row, if any (absence = OFF). */
export async function getEventSyndicationConsent(
  eventId: string,
): Promise<EventSyndicationConsent | null> {
  return (await db.eventSyndicationConsents.get(eventId)) ?? null;
}
