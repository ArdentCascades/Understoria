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
import type {
  Event,
  EventCancellation,
  EventShiftRow,
  Post,
  ShiftSignupRow,
} from "@/types";

// The two commitment kinds the My-work tab was missing (the page
// billed itself as "what you've claimed and what you organize" while
// only showing project tasks and projects): shift signups and claimed
// NEED posts. Same scope rules as `myTasks` / `myProjects`:
//
// - SELF-ONLY. Callers pass the viewing member's own key; there is no
//   "member X's commitments" variant. Pure reads over local rows.
//
// - Pull-only, display-only. Nothing here feeds a badge, a count on
//   the tab, or any comparison. In particular the shift view is the
//   member's own signups and nothing else — the never-compare rule
//   (`docs/shift-signups.md` §9: signups are intent, not attendance)
//   is untouched because no other member's rows are even read.
//
// - Read-only surface. Withdrawing a signup or releasing a claimed
//   post stays on the event / post page where the consequence framing
//   lives, same as task actions.

export interface UpcomingShift {
  shift: EventShiftRow;
  event: Event;
}

export interface MyUpcomingShiftsInput {
  memberKey: string;
  signups: readonly ShiftSignupRow[];
  shifts: readonly EventShiftRow[];
  events: readonly Event[];
  eventCancellations?: readonly EventCancellation[];
  now?: number;
}

/**
 * The member's own shift signups that are still ahead (a shift is
 * "ahead" until it ENDS — someone mid-shift is still on it), on
 * events that still exist and aren't cancelled, soonest first.
 */
export function myUpcomingShifts(
  input: MyUpcomingShiftsInput,
): UpcomingShift[] {
  const now = input.now ?? Date.now();
  const shiftById = new Map(input.shifts.map((s) => [s.id, s]));
  const eventById = new Map(input.events.map((e) => [e.id, e]));
  const cancelled = new Set(
    (input.eventCancellations ?? []).map((c) => c.eventId),
  );
  const out: UpcomingShift[] = [];
  for (const signup of input.signups) {
    if (signup.memberKey !== input.memberKey) continue;
    const shift = shiftById.get(signup.shiftId);
    if (!shift) continue;
    if (shift.endsAt <= now) continue;
    const event = eventById.get(shift.eventId);
    if (!event) continue;
    if (cancelled.has(event.id)) continue;
    out.push({ shift, event });
  }
  out.sort((a, b) => a.shift.startsAt - b.shift.startsAt);
  return out;
}

export interface MyClaimedPostsInput {
  memberKey: string;
  posts: readonly Post[];
  blockedKeys?: ReadonlySet<string>;
}

/**
 * NEED posts the member claimed and hasn't finished — help they're on
 * their way to GIVE. Deliberately one-directional: an OFFER the member
 * claimed is help they'll RECEIVE, which is a plan, not work, and the
 * My-work page only inventories work. Both live states show
 * ("claimed" and "awaiting_confirmation" — the commitment isn't
 * resolved until the credit moves). Blocked authors are suppressed,
 * mirroring the attention rail (`docs/blocking.md` §6).
 */
export function myClaimedPosts(input: MyClaimedPostsInput): Post[] {
  const blockedKeys = input.blockedKeys ?? new Set<string>();
  return input.posts
    .filter(
      (p) =>
        p.type === "NEED" &&
        p.claimedBy === input.memberKey &&
        (p.status === "claimed" || p.status === "awaiting_confirmation") &&
        !blockedKeys.has(p.postedBy),
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}
