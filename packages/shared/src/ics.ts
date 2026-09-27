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

/*
 * RFC 5545 (iCalendar) string-building primitives, shared between the
 * web app's client-side single-event export (`apps/web/src/lib/
 * eventIcs.ts`, the settled docs/community-events.md §11.5a shape)
 * and the server's organizer-consented calendar feed
 * (docs/calendar.md §10.6).
 *
 * ONE implementation on purpose: event titles, locations and
 * descriptions are member-controlled free text, and ICS is a
 * line-oriented format — an unescaped newline in a title would let a
 * member inject calendar properties (a forged ATTENDEE, a smuggled
 * VALARM) into anything that renders it. The escaping and folding
 * below are that injection boundary, tested once, used everywhere.
 * A second hand-rolled copy is how the two drift apart.
 */

/** RFC 5545 §3.1: content lines are delimited by CRLF. Calendar
 *  apps are picky about this; bare `\n` output breaks importers. */
export const ICS_CRLF = "\r\n";

/** RFC 5545 §3.1: "Lines of text SHOULD NOT be longer than 75
 *  octets, excluding the line break." Octets, not characters — the
 *  limit counts UTF-8 bytes, and a fold must never split a
 *  multi-byte character. */
const MAX_LINE_OCTETS = 75;

const utf8 = new TextEncoder();

/**
 * RFC 5545 §3.3.11 TEXT escaping: backslash, semicolon, and comma
 * are escaped with a backslash; newlines become the literal `\n`
 * sequence. Backslash must be escaped first so it doesn't double up
 * the escapes it introduces. This is the boundary that keeps
 * member-controlled text from injecting ICS properties — every
 * value interpolated into a content line goes through here.
 */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n/g, "\\n")
    .replace(/[\r\n]/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * RFC 5545 §3.1 line folding: a content line longer than 75 octets
 * is split into multiple lines, each continuation prefixed with a
 * single space (CRLF + SP). We measure octets (UTF-8 bytes) and
 * break character-by-character so a fold never lands inside a
 * multi-byte sequence. The continuation's leading space counts
 * toward its 75-octet budget.
 */
export function foldIcsLine(line: string): string {
  if (utf8.encode(line).length <= MAX_LINE_OCTETS) return line;
  const out: string[] = [];
  let current = "";
  let currentOctets = 0;
  // First physical line gets the full 75 octets; continuations lose
  // one octet to the leading space.
  let budget = MAX_LINE_OCTETS;
  for (const ch of line) {
    const chOctets = utf8.encode(ch).length;
    if (currentOctets + chOctets > budget) {
      out.push(current);
      current = " ";
      currentOctets = 1;
      budget = MAX_LINE_OCTETS;
    }
    current += ch;
    currentOctets += chOctets;
  }
  out.push(current);
  return out.join(ICS_CRLF);
}

/** Epoch ms → RFC 5545 UTC basic format `YYYYMMDDTHHMMSSZ` (form #2
 *  of DATE-TIME, §3.3.5). The federated record carries UTC epoch ms;
 *  the output keeps UTC and lets the reader's calendar app
 *  localize. */
export function formatIcsUtc(epochMs: number): string {
  const d = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Fold every content line and join the finished VCALENDAR with the
 *  mandatory CRLF delimiters (including the trailing one). */
export function joinIcsLines(lines: readonly string[]): string {
  return lines.map(foldIcsLine).join(ICS_CRLF) + ICS_CRLF;
}

/** The fields a VEVENT built here may carry — and, as importantly,
 *  the ones it may not: no VALARM (a reminder by proxy — the
 *  `no-notifications` line), no ATTENDEE/ORGANIZER (member identity
 *  in third-party calendar infrastructure), no RSVP data of any
 *  kind. Both call sites (§11.5a export, §10.6 feed) inherit these
 *  absences from the shape itself. */
export interface IcsVEventInput {
  /** Globally unique, stable id (event id + "@" + node id) so a
   *  re-download or the next feed poll updates rather than
   *  duplicates. */
  uid: string;
  /** ms epoch the file/feed was generated. */
  stampMs: number;
  startsAtMs: number;
  /** null = a point in time with no stated end. RFC 5545 §3.6.1: a
   *  VEVENT with a DATE-TIME DTSTART and no DTEND/DURATION "does not
   *  take up any time" — omitting DTEND is the compliant encoding;
   *  a synthesized zero-duration end would assert an end the
   *  organizer never stated. */
  endsAtMs: number | null;
  summary: string;
  location: string;
  /** Omitted from the output when empty. */
  description: string;
  /** RFC 5545 §3.8.1.11 STATUS — "CANCELLED" keeps a cancelled event
   *  visibly cancelled on subscribers' calendars instead of silently
   *  vanishing. Omitted when undefined (confirmed is the default). */
  status?: "CANCELLED";
}

/** Build one VEVENT's content lines (unfolded — callers assemble a
 *  VCALENDAR and finish with `joinIcsLines`). */
export function buildVEventLines(input: IcsVEventInput): string[] {
  const lines: string[] = [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(input.uid)}`,
    `DTSTAMP:${formatIcsUtc(input.stampMs)}`,
    `DTSTART:${formatIcsUtc(input.startsAtMs)}`,
  ];
  if (input.endsAtMs !== null) {
    lines.push(`DTEND:${formatIcsUtc(input.endsAtMs)}`);
  }
  lines.push(
    `SUMMARY:${escapeIcsText(input.summary)}`,
    `LOCATION:${escapeIcsText(input.location)}`,
  );
  if (input.description.length > 0) {
    lines.push(`DESCRIPTION:${escapeIcsText(input.description)}`);
  }
  if (input.status) {
    lines.push(`STATUS:${input.status}`);
  }
  lines.push("END:VEVENT");
  return lines;
}
