/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { plannedDayIcs } from "./ics";

// The planned-day calendar file (the no-notifications bridge: the
// member's OWN calendar does any reminding). All-day VEVENT with an
// exclusive DTEND, RFC 5545 text escaping, CRLF line endings.

function build(over: Partial<Parameters<typeof plannedDayIcs>[0]> = {}) {
  return plannedDayIcs(
    {
      uidKey: "task-1",
      summary: "Find a host site",
      day: "2026-07-14",
      description: "Your planned day.",
      url: "https://node.example/project/p1/task/task-1",
      ...over,
    },
    new Date(Date.UTC(2026, 6, 11, 12, 0, 0)),
  );
}

describe("plannedDayIcs", () => {
  it("emits a single all-day VEVENT with the planned day", () => {
    const ics = build();
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260714");
    // DTEND is EXCLUSIVE for all-day events → the next day.
    expect(ics).toContain("DTEND;VALUE=DATE:20260715");
    expect(ics).toContain("SUMMARY:Find a host site");
    expect(ics).toContain("UID:understoria-plan-task-1@local");
    expect(ics).toContain("DTSTAMP:20260711T120000Z");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("rolls DTEND across month and year boundaries", () => {
    expect(build({ day: "2026-07-31" })).toContain(
      "DTEND;VALUE=DATE:20260801",
    );
    expect(build({ day: "2026-12-31" })).toContain(
      "DTEND;VALUE=DATE:20270101",
    );
    // Leap-year February.
    expect(build({ day: "2028-02-29" })).toContain(
      "DTEND;VALUE=DATE:20280301",
    );
  });

  it("escapes RFC 5545 special characters in text fields", () => {
    const ics = build({
      summary: "Fix hinges; oil, paint\nand tidy \\ sweep",
    });
    expect(ics).toContain("Fix hinges\\; oil\\, paint\\nand tidy \\\\ sweep");
  });

  it("uses CRLF line endings and folds long lines with a leading space", () => {
    const ics = build({ summary: "x".repeat(200) });
    // Every line ends with \r\n…
    expect(ics.split("\r\n").some((l) => l.includes("\n"))).toBe(false);
    // …and no unfolded line exceeds the 75-octet RFC ceiling.
    for (const line of ics.split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
    // Continuation lines start with a space.
    expect(ics).toMatch(/\r\n x/);
  });
});
