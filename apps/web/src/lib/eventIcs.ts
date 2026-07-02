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
import type { Event } from "@/types";

/**
 * Single-event `.ics` export — the settled shape from
 * `docs/community-events.md` §11.5a.
 *
 * This module is deliberately pure string-building (no dependency, no
 * DOM, no server): the PWA already holds the event in Dexie, so the
 * whole export is client-side and on-demand. There is NO server route
 * for this, ever — a server-rendered `.ics`, even for one event,
 * recreates the standing-URL subscription shape that
 * `docs/calendar.md` §10.5 permanently rejected.
 *
 * What the file deliberately does NOT contain:
 *
 * - **No `VALARM`.** Settled design decision (§11.5a), not an
 *   omission: embedding an alarm would be the app scheduling a
 *   notification by proxy — deciding *for* the member that a reminder
 *   should fire — which flirts with the `no-notifications` principle.
 *   The member sets reminders in their own calendar app, on their own
 *   terms, or not at all.
 * - **No `ATTENDEE` / `ORGANIZER` properties.** Those would carry
 *   member keys / identities into third-party calendar infrastructure
 *   when the member's device calendar syncs. The file contains only
 *   what the member already reads on the event detail screen (title,
 *   time, location, description) — never RSVP data, never other
 *   members' data. Same minimization posture as §11.5a's
 *   `privacy-precondition` argument.
 */

/** RFC 5545 §3.1: content lines are delimited by CRLF. Calendar
 *  apps are picky about this; bare `\n` output breaks importers. */
const CRLF = "\r\n";

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
 * the escapes it introduces.
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
  return out.join(CRLF);
}

/** Epoch ms → RFC 5545 UTC basic format `YYYYMMDDTHHMMSSZ` (form #2
 *  of DATE-TIME, §3.3.5). Same UTC discipline as `lib/calendar.ts`:
 *  the federated record carries UTC epoch ms; the export keeps UTC
 *  and lets the member's calendar app localize. */
export function formatIcsUtc(epochMs: number): string {
  const d = new Date(epochMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/**
 * Conservative ASCII slug for the download filename. Diacritics are
 * stripped via NFD decomposition, anything outside [a-z0-9] collapses
 * to a single hyphen, and an empty result falls back to "event".
 */
export function icsFilename(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return `${slug || "event"}.ics`;
}

/**
 * Build a minimal RFC 5545 VCALENDAR wrapping one VEVENT for the
 * given event. Pure function — `appUrl` is passed in (derive it from
 * `window.location.origin` at the call site) so this stays testable
 * from vanilla vitest like the rest of `lib/`.
 */
export function buildEventIcs(
  event: Event,
  opts: { appUrl?: string } = {},
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Understoria//Community Events//EN",
    "BEGIN:VEVENT",
    // UID from event id + node id: globally unique across the
    // federation (event ids are canonical-hash-derived per node) and
    // stable, so re-downloading the same event updates rather than
    // duplicates in most calendar apps.
    `UID:${escapeIcsText(event.id)}@${escapeIcsText(event.nodeId)}`,
    `DTSTAMP:${formatIcsUtc(Date.now())}`,
    `DTSTART:${formatIcsUtc(event.startsAt)}`,
  ];

  // When `endsAt` is null the event is a single point in time with no
  // defined end. RFC 5545 §3.6.1 handles exactly this: a VEVENT with
  // a DATE-TIME DTSTART and neither DTEND nor DURATION "does not take
  // up any time" — it anchors to the start instant. Omitting DTEND is
  // therefore the standard-compliant encoding; a synthesized
  // zero-duration DTEND would assert an end the organizer never
  // stated.
  if (event.endsAt !== null) {
    lines.push(`DTEND:${formatIcsUtc(event.endsAt)}`);
  }

  lines.push(
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
  );

  // Description = the event's description plus a link back to the
  // event page, separated by a blank line. The link is plain data the
  // member already has (it's the page they exported from); nothing
  // about it is a standing feed.
  const linkBack = opts.appUrl ? `${opts.appUrl}/events/${event.id}` : "";
  const descriptionParts = [event.description, linkBack].filter(
    (part) => part.length > 0,
  );
  if (descriptionParts.length > 0) {
    lines.push(`DESCRIPTION:${escapeIcsText(descriptionParts.join("\n\n"))}`);
  }

  // Deliberately NO VALARM and NO ATTENDEE/ORGANIZER here — see the
  // module doc comment for the settled §11.5a reasoning.
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}
