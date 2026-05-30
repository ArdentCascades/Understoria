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

// Pure search helpers. No I/O — `db/messages.ts` owns decrypt-and-scan;
// these helpers are the substring matcher + the range builder for the
// highlight component. Kept pure so we can unit-test them without
// spinning up a crypto session or an IDB instance.
//
// Whitespace-trimmed, case-insensitive substring match. No regex
// operators, no fuzzy matching — keeps user expectations simple and
// avoids ReDoS-style attack surface on locale-foldable strings.

/** A literal-string match. Empty query never matches (avoids the
 *  degenerate "every message is a hit" UI on every keystroke). */
export function matchesQuery(
  plain: string | null,
  query: string,
): boolean {
  if (plain === null) return false;
  const q = query.trim().toLowerCase();
  if (q === "") return false;
  return plain.toLowerCase().includes(q);
}

export interface HighlightRange {
  start: number;
  end: number;
}

/** Returns every non-overlapping range of `query` within `plain` so
 *  the renderer can wrap each match in <mark>. Empty query → []. */
export function highlightRanges(
  plain: string,
  query: string,
): HighlightRange[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [];
  const lower = plain.toLowerCase();
  const ranges: HighlightRange[] = [];
  let from = 0;
  while (from <= lower.length - q.length) {
    const i = lower.indexOf(q, from);
    if (i === -1) break;
    ranges.push({ start: i, end: i + q.length });
    from = i + q.length;
  }
  return ranges;
}
