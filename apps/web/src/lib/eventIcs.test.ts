/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Single-event .ics generator (`docs/community-events.md` §11.5a).
 * Beyond shape/escaping/UTC correctness, two tests exist purely to
 * lock settled design decisions in code: NO VALARM (the member's own
 * calendar app owns reminders) and NO ATTENDEE/ORGANIZER (member
 * keys/identities never enter third-party calendar sync).
 */
import { describe, expect, it } from "vitest";
import type { Event } from "@/types";
import {
  buildEventIcs,
  escapeIcsText,
  foldIcsLine,
  formatIcsUtc,
  icsFilename,
} from "./eventIcs";

const APP_URL = "https://node.example";

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: "evt-1",
    kind: "event",
    title: "Community garden work day",
    description: "Bring gloves.",
    category: "infrastructure",
    // 2023-11-14T22:13:20.000Z
    startsAt: 1_700_000_000_000,
    endsAt: null,
    location: "Community room, 3rd floor",
    capacity: null,
    templateId: null,
    createdAt: 0,
    createdBy: "organizer-key",
    nodeId: "node_test",
    signature: "sig",
    ...overrides,
  };
}

/** Unfold (CRLF + single space → nothing) and split into logical
 *  content lines — the reverse of RFC 5545 §3.1 folding, which is how
 *  a consuming calendar app reads the file. */
function logicalLines(ics: string): string[] {
  return ics
    .replace(/\r\n[ \t]/g, "")
    .split("\r\n")
    .filter((l) => l.length > 0);
}

describe("buildEventIcs", () => {
  it("emits a well-formed VCALENDAR/VEVENT envelope with required properties", () => {
    const ics = buildEventIcs(event(), { appUrl: APP_URL });
    const lines = logicalLines(ics);
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines[lines.length - 1]).toBe("END:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines.some((l) => l.startsWith("PRODID:-//Understoria//"))).toBe(
      true,
    );
    expect(lines).toContain("BEGIN:VEVENT");
    expect(lines).toContain("END:VEVENT");
    expect(lines.some((l) => l.startsWith("DTSTAMP:"))).toBe(true);
    expect(lines.some((l) => l.startsWith("DTSTART:"))).toBe(true);
    expect(lines.some((l) => l.startsWith("SUMMARY:"))).toBe(true);
    expect(lines.some((l) => l.startsWith("LOCATION:"))).toBe(true);
  });

  it("uses CRLF line endings exclusively (RFC 5545 §3.1)", () => {
    const ics = buildEventIcs(event(), { appUrl: APP_URL });
    // Every \n is preceded by \r, every \r followed by \n.
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("builds the UID as <event.id>@<event.nodeId>", () => {
    const ics = buildEventIcs(event(), { appUrl: APP_URL });
    expect(logicalLines(ics)).toContain("UID:evt-1@node_test");
  });

  it("formats DTSTART in UTC basic format for a known epoch", () => {
    // 1_700_000_000_000 ms = 2023-11-14T22:13:20Z
    const ics = buildEventIcs(event({ startsAt: 1_700_000_000_000 }), {
      appUrl: APP_URL,
    });
    expect(logicalLines(ics)).toContain("DTSTART:20231114T221320Z");
  });

  it("omits DTEND entirely when endsAt is null (RFC 5545 §3.6.1 point event)", () => {
    const ics = buildEventIcs(event({ endsAt: null }), { appUrl: APP_URL });
    // §3.6.1: DTSTART with neither DTEND nor DURATION = an event that
    // takes up no time. That matches "no defined end" honestly; a
    // synthesized zero-duration DTEND would assert an end the
    // organizer never stated.
    expect(ics).not.toContain("DTEND");
    expect(ics).not.toContain("DURATION");
  });

  it("emits DTEND in UTC when endsAt is set", () => {
    const ics = buildEventIcs(
      event({ endsAt: 1_700_000_000_000 + 3_600_000 }),
      { appUrl: APP_URL },
    );
    expect(logicalLines(ics)).toContain("DTEND:20231114T231320Z");
  });

  it("escapes commas, semicolons, and newlines in text fields", () => {
    const ics = buildEventIcs(
      event({
        title: "Potluck; bring one, take one",
        location: "Room 3; back\\door",
        description: "Line one\nLine two, with commas; and semicolons",
      }),
      { appUrl: APP_URL },
    );
    const lines = logicalLines(ics);
    expect(lines).toContain("SUMMARY:Potluck\\; bring one\\, take one");
    expect(lines).toContain("LOCATION:Room 3\\; back\\\\door");
    const description = lines.find((l) => l.startsWith("DESCRIPTION:"));
    expect(description).toBeDefined();
    expect(description).toContain(
      "Line one\\nLine two\\, with commas\\; and semicolons",
    );
    // No raw (unescaped) newline survives inside any logical line.
    for (const line of lines) expect(line).not.toMatch(/[\r\n]/);
  });

  it("folds long lines at 75 octets with CRLF + space continuations", () => {
    const long = "x".repeat(400);
    const ics = buildEventIcs(event({ description: long }), {
      appUrl: APP_URL,
    });
    const physical = ics.split("\r\n");
    const utf8 = new TextEncoder();
    for (const line of physical) {
      expect(utf8.encode(line).length).toBeLessThanOrEqual(75);
    }
    // The folded description unfolds back to the original content.
    const description = logicalLines(ics).find((l) =>
      l.startsWith("DESCRIPTION:"),
    );
    expect(description).toContain(long);
    // And at least one continuation line exists (starts with a space).
    expect(physical.some((l) => l.startsWith(" "))).toBe(true);
  });

  it("never splits a multi-byte character across a fold", () => {
    const ics = buildEventIcs(event({ description: "é".repeat(200) }), {
      appUrl: APP_URL,
    });
    // If a fold landed mid-character, unfolding would not round-trip
    // and the string would contain replacement-char garbage. Re-encode
    // each physical line to prove every one is valid on its own.
    const utf8 = new TextEncoder();
    for (const line of ics.split("\r\n")) {
      expect(utf8.encode(line).length).toBeLessThanOrEqual(75);
    }
    const description = logicalLines(ics).find((l) =>
      l.startsWith("DESCRIPTION:"),
    );
    expect(description).toContain("é".repeat(200));
  });

  it("contains NO VALARM — settled §11.5a decision, locked here", () => {
    // Embedding an alarm would be the app scheduling a notification by
    // proxy. The member sets reminders in their own calendar app.
    const ics = buildEventIcs(event(), { appUrl: APP_URL });
    expect(ics).not.toContain("VALARM");
  });

  it("contains NO ATTENDEE/ORGANIZER properties — minimization, locked here", () => {
    // Those properties would carry member keys/identities into
    // third-party calendar infrastructure on sync.
    const ics = buildEventIcs(event(), { appUrl: APP_URL });
    expect(ics).not.toContain("ATTENDEE");
    expect(ics).not.toContain("ORGANIZER");
  });

  it("appends the link-back URL to the description", () => {
    const ics = buildEventIcs(event(), { appUrl: APP_URL });
    const description = logicalLines(ics).find((l) =>
      l.startsWith("DESCRIPTION:"),
    );
    expect(description).toContain("Bring gloves.\\n\\nhttps://node.example/events/evt-1");
  });

  it("still emits the link-back when the description is empty", () => {
    const ics = buildEventIcs(event({ description: "" }), {
      appUrl: APP_URL,
    });
    const description = logicalLines(ics).find((l) =>
      l.startsWith("DESCRIPTION:"),
    );
    expect(description).toBe("DESCRIPTION:https://node.example/events/evt-1");
  });
});

describe("formatIcsUtc", () => {
  it("renders epoch ms as YYYYMMDDTHHMMSSZ in UTC", () => {
    expect(formatIcsUtc(0)).toBe("19700101T000000Z");
    expect(formatIcsUtc(1_700_000_000_000)).toBe("20231114T221320Z");
  });
});

describe("escapeIcsText", () => {
  it("escapes backslash first so introduced escapes are not doubled", () => {
    expect(escapeIcsText("a\\nb")).toBe("a\\\\nb");
    expect(escapeIcsText("a\nb")).toBe("a\\nb");
    expect(escapeIcsText("a\r\nb")).toBe("a\\nb");
  });
});

describe("foldIcsLine", () => {
  it("leaves short lines untouched", () => {
    expect(foldIcsLine("SUMMARY:short")).toBe("SUMMARY:short");
  });
});

describe("icsFilename", () => {
  it("slugifies conservatively to ascii", () => {
    expect(icsFilename("Community garden work day")).toBe(
      "community-garden-work-day.ics",
    );
    expect(icsFilename("Café & Charla: ¡Sí!")).toBe("cafe-charla-si.ics");
  });

  it("falls back to event.ics when nothing survives", () => {
    expect(icsFilename("☂☂☂")).toBe("event.ics");
    expect(icsFilename("")).toBe("event.ics");
  });
});
