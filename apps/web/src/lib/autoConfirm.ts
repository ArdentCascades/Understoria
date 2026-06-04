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
/**
 * Pure eligibility predicate for the node-system-key auto-confirm
 * sweep. See `docs/auto-confirm-key.md` §4 (the four bounds) and §5
 * (the abuse model). This is the single source of truth shared by
 * the post sweep and the project-task sweep — both call this and
 * skip on `false`.
 *
 * Pure. No Dexie, no fetch, no `Date.now()` — `now` is injected so
 * the sweep and the test suite share one truth table. Same shape as
 * `lib/mirrorConsent.ts`.
 */
import type { Post, ProjectTask } from "@/types";

/**
 * Inputs the eligibility predicate needs from each candidate row. A
 * Post and a ProjectTask both reach `awaiting_confirmation` and both
 * carry a "when did the waiting start" timestamp — modeling these as
 * a discriminated union keeps the shape narrow: callers can't pass
 * an open post or a completed task by mistake.
 */
export type AutoConfirmCandidate =
  | {
      kind: "post";
      status: Post["status"];
      /** ms epoch — when the post entered `awaiting_confirmation`.
       *  The caller computes this (the post row doesn't store it
       *  explicitly; the sweep derives it from the latest
       *  `confirmedBy` write). */
      awaitingSince: number;
    }
  | {
      kind: "task";
      status: ProjectTask["status"];
      /** ms epoch — when the task transitioned to
       *  `awaiting_confirmation`. Today the row carries this as
       *  `completedAt` (the moment the helper marked done and
       *  waited for organizer confirmation). The sweep is the only
       *  caller and supplies whichever ms-epoch matches that
       *  semantic on the row. */
      awaitingSince: number;
    };

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * True iff this candidate row is eligible for system-key
 * auto-confirm. Hard contracts from the design doc (§4 / §5):
 *
 *  - `autoConfirmHours <= 0` disables the sweep entirely. The
 *    system key signs NOTHING in this mode — a community that has
 *    not opted in (or has opted out) gets the pre-PR behaviour.
 *  - Status MUST be `"awaiting_confirmation"`. The sweep never
 *    touches `completed`, `cancelled`, `disputed`, `claimed`,
 *    `open`, or `blocked` rows. This bounds the system key's reach
 *    to the state where the helper has already done their signing
 *    work and only the helped-side signature is missing.
 *  - The waiting window must have elapsed: `now - awaitingSince`
 *    must be at least `autoConfirmHours * 3600 * 1000`. `>=`, so a
 *    row at exactly the threshold is eligible (early-fire
 *    detection in §5 is signed-timestamp based, not millisecond-
 *    precise; a one-ms boundary is acceptable noise).
 *  - A negative-age row (future awaitingSince) is rejected.
 *    Clock-skew detection is post-hoc per §5; we don't try to
 *    pre-emptively guess it, but we also don't sign records we
 *    cannot reason about timing-wise.
 *
 * The eligibility decision is local — it does NOT contact the
 * server or verify any signature. Signature verification is the
 * server's job before signing the helped-side signature; this
 * helper only decides which rows the sweep asks the server about.
 */
export function shouldAutoConfirm(
  candidate: AutoConfirmCandidate,
  now: number,
  autoConfirmHours: number,
): boolean {
  if (autoConfirmHours <= 0) return false;
  if (candidate.status !== "awaiting_confirmation") return false;
  if (
    !Number.isFinite(candidate.awaitingSince) ||
    candidate.awaitingSince <= 0
  ) {
    return false;
  }
  const ageMs = now - candidate.awaitingSince;
  if (ageMs < 0) return false;
  return ageMs >= autoConfirmHours * MS_PER_HOUR;
}
