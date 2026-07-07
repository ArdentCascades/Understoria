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
import Dexie from "dexie";
import { db } from "./database";
import { getSecretKey } from "./secrets";
import { signStateRecord } from "@/lib/crypto";
import {
  enqueueEventRsvpOutbox,
  enqueueEventShiftOutbox,
  enqueueShiftSignupOutbox,
  flushOutboxNow,
} from "@/lib/outbox";
import type {
  EventRsvpState,
  EventShiftState,
  ShiftSignupState,
} from "@understoria/shared/types";
import type {
  EventRsvpRow,
  EventShiftRow,
  ShiftSignupRow,
} from "@/types";

/**
 * Participation federation Phase 2 publish helpers
 * (docs/project-federation.md §6) — the RSVP / shift / signup
 * counterpart of `publishProjectState` in `db/projects.ts`, with the
 * same contract:
 *
 *  - called AFTER the mutator's write transaction commits (the
 *    `Dexie.currentTransaction` guard makes nested-composition calls
 *    no-ops so the outermost mutator publishes once);
 *  - the LIVE record's stamped version (`updatedAt` / `signerKey` /
 *    `signature`) is persisted back onto the local row so pulls can
 *    LWW-merge against it;
 *  - soft-degrade on a locked device or a key this device doesn't
 *    hold: the local write has already landed, the publish is skipped
 *    silently, and the next mutation republishes;
 *  - TOMBSTONES (shift deletion, signup withdrawal) sign a captured
 *    copy of the row with `deletedAt` set — the local row is already
 *    gone by the time these run, which is why they take the row VALUE
 *    rather than an id.
 */

export async function publishEventRsvpState(
  eventId: string,
  memberKey: string,
): Promise<void> {
  if (Dexie.currentTransaction) return;
  try {
    const row = (await db.eventRsvps
      .where("[eventId+memberKey]")
      .equals([eventId, memberKey])
      .first()) as (EventRsvpRow & Partial<EventRsvpState>) | undefined;
    if (!row) return;
    const secret = await getSecretKey(memberKey);
    const { signature: _prev, ...rest } = row;
    const unsigned = {
      ...rest,
      updatedAt: Date.now(),
      signerKey: memberKey,
    } as Omit<EventRsvpState, "signature">;
    const record: EventRsvpState = {
      ...unsigned,
      signature: signStateRecord<EventRsvpState>(unsigned, secret),
    };
    await db.transaction(
      "rw",
      [db.eventRsvps, db.outbox, db.settings],
      async () => {
        await db.eventRsvps.put(record);
        await enqueueEventRsvpOutbox(record);
      },
    );
    void flushOutboxNow().catch(() => {});
  } catch {
    // Locked device / missing key — soft-degrade (see module doc).
  }
}

export async function publishEventShiftState(
  row: EventShiftRow & Partial<EventShiftState>,
  actorKey: string,
  deletedAt: number | null = null,
): Promise<void> {
  if (Dexie.currentTransaction) return;
  try {
    const secret = await getSecretKey(actorKey);
    const { signature: _prev, ...rest } = row;
    const unsigned = {
      ...rest,
      deletedAt,
      updatedAt: Date.now(),
      signerKey: actorKey,
    } as Omit<EventShiftState, "signature">;
    const record: EventShiftState = {
      ...unsigned,
      signature: signStateRecord<EventShiftState>(unsigned, secret),
    };
    await db.transaction(
      "rw",
      [db.eventShifts, db.outbox, db.settings],
      async () => {
        if (deletedAt === null) {
          await db.eventShifts.put(record);
        }
        // Tombstones never re-materialize the local row — deleteShift
        // already removed it; only the wire record carries the death.
        await enqueueEventShiftOutbox(record);
      },
    );
    void flushOutboxNow().catch(() => {});
  } catch {
    // Locked device / missing key — soft-degrade.
  }
}

export async function publishShiftSignupState(
  row: ShiftSignupRow & Partial<ShiftSignupState>,
  actorKey: string,
  deletedAt: number | null = null,
): Promise<void> {
  if (Dexie.currentTransaction) return;
  try {
    const secret = await getSecretKey(actorKey);
    const { signature: _prev, ...rest } = row;
    const unsigned = {
      ...rest,
      deletedAt,
      updatedAt: Date.now(),
      signerKey: actorKey,
    } as Omit<ShiftSignupState, "signature">;
    const record: ShiftSignupState = {
      ...unsigned,
      signature: signStateRecord<ShiftSignupState>(unsigned, secret),
    };
    await db.transaction(
      "rw",
      [db.shiftSignups, db.outbox, db.settings],
      async () => {
        if (deletedAt === null) {
          await db.shiftSignups.put(record);
        }
        await enqueueShiftSignupOutbox(record);
      },
    );
    void flushOutboxNow().catch(() => {});
  } catch {
    // Locked device / missing key — soft-degrade.
  }
}
