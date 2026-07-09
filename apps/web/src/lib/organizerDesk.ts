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
import type { Event, EventShiftRow, ShiftSignupRow } from "@/types";

/**
 * Organizer's desk selectors (docs/desktop-power-tools.md plan 2).
 *
 * Only the genuinely NEW selector lives here: shift coverage gaps.
 * The desk's other sections reuse selectors that already exist with
 * all their careful predicates — `myOrganizedProjects`
 * (lib/myProjects: per-project confirm queue + open-task counts,
 * blocked-completer exclusions) and `pendingBalanceFor`
 * (lib/timebank: exchanges awaiting the viewer's own signature).
 * The desk is a lens over the member's OWN responsibilities — it
 * computes nothing about anyone else's diligence.
 */

export interface ShiftGap {
  event: Event;
  shift: EventShiftRow;
  signedUp: number;
  /** Always a number here — capacity-less shifts can't have a gap. */
  capacity: number;
}

export interface ShiftGapsInput {
  memberKey: string;
  events: Event[];
  /** Ids of events with a standing cancellation record. */
  cancelledEventIds: Set<string>;
  shifts: EventShiftRow[];
  signups: ShiftSignupRow[];
  now: number;
}

/**
 * Shifts still short of hands, in events the viewer organizes:
 * future (not yet ended), not deleted, in a non-cancelled event the
 * viewer created, with a numeric capacity that active signups
 * haven't met. Soonest first — the gap that needs solving next is
 * the one at the top.
 */
export function shiftGaps(input: ShiftGapsInput): ShiftGap[] {
  const myEventById = new Map<string, Event>();
  for (const ev of input.events) {
    if (ev.createdBy === input.memberKey && !input.cancelledEventIds.has(ev.id)) {
      myEventById.set(ev.id, ev);
    }
  }

  // Local shift/signup rows are hard-deleted (no tombstones - the
  // docs/shift-signups.md local-only posture), so presence = active.
  const activeSignupsByShift = new Map<string, number>();
  for (const s of input.signups) {
    activeSignupsByShift.set(
      s.shiftId,
      (activeSignupsByShift.get(s.shiftId) ?? 0) + 1,
    );
  }

  const gaps: ShiftGap[] = [];
  for (const shift of input.shifts) {
    if (shift.capacity === null) continue;
    if (shift.endsAt < input.now) continue;
    const event = myEventById.get(shift.eventId);
    if (!event) continue;
    const signedUp = activeSignupsByShift.get(shift.id) ?? 0;
    if (signedUp >= shift.capacity) continue;
    gaps.push({ event, shift, signedUp, capacity: shift.capacity });
  }
  gaps.sort((a, b) => a.shift.startsAt - b.shift.startsAt);
  return gaps;
}
