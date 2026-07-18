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
// Whitespace-trimmed, FORGIVING substring match. Both the needle and
// the haystack are folded through `normalizeForSearch` at match time:
//
//   - curly quotes/apostrophes → straight (phone keyboards insert
//     U+2019 in "don’t"; older messages hold ASCII "don't" — the
//     2026-07 usability run showed the mismatch finds nothing);
//   - diacritics stripped (NFD + drop combining marks) so "cafe"
//     finds "café" and vice versa;
//   - lowercased.
//
// EXCEPTION — ñ/Ñ stays a distinct letter and is NOT folded to n.
// Spanish users are first-class here and ñ is a separate letter of
// the Spanish alphabet, not an accented n: folding it would make
// "ano" match "año" (a famously unfortunate false hit) and teach
// members that search mangles their language. "año" typed with ñ
// still matches "año" however it was composed (NFC or n+combining
// tilde), which is the case that actually occurs on real keyboards.
//
// Still no regex operators, no fuzzy matching — keeps user
// expectations simple and avoids ReDoS-style attack surface on
// locale-foldable strings.
//
// FOLLOW-UP (deliberately out of scope for this pass): board search
// (lib/boardFilter.ts), template search (lib/templateFilter.ts) and
// the help/command palette (lib/commandPalette.ts) are separate
// matchers and still compare un-folded text. When they adopt
// forgiveness they should reuse `normalizeForSearch` from here, not
// grow their own folding rules.

/** Curly/typographic quote folds applied before decomposition. */
const SINGLE_QUOTES = /[‘’‚‛′ʼ]/g;
const DOUBLE_QUOTES = /[“”„‟″]/g;
/** Any Unicode combining mark (covers U+0300–U+036F and beyond). */
const COMBINING_MARKS = /\p{M}/gu;

function isCombiningMark(cp: number): boolean {
  return /\p{M}/u.test(String.fromCodePoint(cp));
}

/** Fold ONE original-text cluster (base code point + its combining
 *  marks) to its search form. May return more or fewer code units
 *  than it was given (e.g. "ﬁ"→"fi" via NFKD is NOT done here; but
 *  "İ"→"i" shrinks and "n"+U+0303 → "ñ" recomposes). */
function normalizeCluster(cluster: string): string {
  const straight = cluster
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"');
  // Compose first so ñ is recognized whether the text carried U+00F1
  // or n + U+0303 (combining tilde); lowercase folds Ñ into the same
  // branch.
  const composed = straight.normalize("NFC").toLowerCase();
  if (composed === "ñ") return "ñ"; // ñ stays ñ — see header.
  // Decompose, drop the marks, lowercase again (İ lowercases to
  // i + U+0307, so a second strip pass keeps the fold total).
  return composed
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "");
}

interface NormalizedMap {
  /** The folded string that matching runs against. */
  norm: string;
  /** For each code unit of `norm`: the ORIGINAL index its source
   *  cluster starts at… */
  starts: number[];
  /** …and the original index just past that cluster. Highlighting
   *  maps a match in `norm` back to real original substrings with
   *  these, so <mark> never drifts even when folding changes
   *  lengths ("café" NFD, "İ", curly quotes). */
  ends: number[];
}

/** Walk the original string cluster-by-cluster (code point + trailing
 *  combining marks), folding each and recording, per produced code
 *  unit, which original span it came from. */
function normalizeWithMap(text: string): NormalizedMap {
  let norm = "";
  const starts: number[] = [];
  const ends: number[] = [];
  let i = 0;
  while (i < text.length) {
    const cp = text.codePointAt(i) as number;
    let len = cp > 0xffff ? 2 : 1;
    while (i + len < text.length) {
      const nextCp = text.codePointAt(i + len) as number;
      if (!isCombiningMark(nextCp)) break;
      len += nextCp > 0xffff ? 2 : 1;
    }
    const folded = normalizeCluster(text.slice(i, i + len));
    for (let k = 0; k < folded.length; k++) {
      norm += folded[k];
      starts.push(i);
      ends.push(i + len);
    }
    i += len;
  }
  return { norm, starts, ends };
}

/**
 * Fold a string to its search form: curly quotes/apostrophes →
 * straight, diacritics stripped (ñ kept — see header), lowercased.
 * Applied to BOTH needle and haystack so either spelling finds the
 * other.
 */
export function normalizeForSearch(text: string): string {
  return normalizeWithMap(text).norm;
}

/** A literal-string match on the folded forms. Empty query never
 *  matches (avoids the degenerate "every message is a hit" UI on
 *  every keystroke). */
export function matchesQuery(
  plain: string | null,
  query: string,
): boolean {
  if (plain === null) return false;
  const q = normalizeForSearch(query.trim());
  if (q === "") return false;
  return normalizeForSearch(plain).includes(q);
}

export interface HighlightRange {
  start: number;
  end: number;
}

/** Returns every non-overlapping range of `query` within `plain` so
 *  the renderer can wrap each match in <mark>. Ranges are indices
 *  into the ORIGINAL string — matching happens on the folded forms,
 *  and the per-code-unit index map translates back, so the highlight
 *  wraps the real substring ("Don’t" for a "don't" query) without
 *  drifting. Empty query → []. */
export function highlightRanges(
  plain: string,
  query: string,
): HighlightRange[] {
  const q = normalizeForSearch(query.trim());
  if (q === "") return [];
  const { norm, starts, ends } = normalizeWithMap(plain);
  const ranges: HighlightRange[] = [];
  let from = 0;
  while (from + q.length <= norm.length) {
    const i = norm.indexOf(q, from);
    if (i === -1) break;
    ranges.push({ start: starts[i], end: ends[i + q.length - 1] });
    from = i + q.length;
  }
  return ranges;
}
