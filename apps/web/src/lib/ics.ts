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

import { escapeIcsText, foldIcsLine, formatIcsUtc } from "@/lib/eventIcs";

// iCalendar (RFC 5545) writer for the "put it on my calendar"
// affordance on a private planned day — an ALL-DAY event, unlike the
// timed community-event/shift exports in `lib/eventIcs.ts`, whose
// escaping/folding/UTC primitives this module reuses. This is the
// ethos-clean bridge across time blindness: Understoria itself never
// schedules, pushes, or reminds (`no-notifications`), but a member
// may hand their OWN calendar app a plain file and let a tool they
// already control do the reminding — their choice, their tool, their
// data. The file is generated entirely on-device and downloaded
// locally; nothing crosses the wire, and the app keeps no record
// that it was made. Same deliberate absences as eventIcs: no VALARM,
// no ATTENDEE/ORGANIZER.

/** "YYYY-MM-DD" → "YYYYMMDD". Assumes the input already passed the
 *  taskPlans day-shape guard. */
function dayToIcsDate(day: string): string {
  return day.replaceAll("-", "");
}

/** The calendar day AFTER `day` — an all-day VEVENT's DTEND is
 *  exclusive (§3.6.1). Date math via the Date object so month/year
 *  rollovers are correct. */
function nextDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const next = new Date(y, m - 1, d + 1);
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${next.getFullYear()}${mm}${dd}`;
}

export interface PlannedDayEvent {
  /** Stable id source — the taskId; re-importing an updated file then
   *  replaces the earlier event instead of duplicating it. */
  uidKey: string;
  /** Event title, e.g. the task title. */
  summary: string;
  /** Local "YYYY-MM-DD" planned day. */
  day: string;
  /** Free-text body — where this came from and what it is. */
  description: string;
  /** Deep link back to the task page. */
  url: string;
}

/** Build a single all-day VEVENT calendar for a planned day. */
export function plannedDayIcs(event: PlannedDayEvent, now: Date = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Understoria//Planned day//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:understoria-plan-${event.uidKey}@local`,
    `DTSTAMP:${formatIcsUtc(now.getTime())}`,
    `DTSTART;VALUE=DATE:${dayToIcsDate(event.day)}`,
    `DTEND;VALUE=DATE:${nextDay(event.day)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `URL:${escapeIcsText(event.url)}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** Trigger a local download of an .ics file — same Blob/anchor shape
 *  as `exportData`. */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
