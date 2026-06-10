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
import { describe, expect, it } from "vitest";
import {
  daysSinceClaim,
  daysUntilCheckIn,
  taskCheckInState,
} from "./taskCheckInState";
import type { ProjectTask } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-23T12:00:00Z").getTime();
const CONFIG = {
  taskCheckInDays: 7,
  taskNeedsHelpDays: 14,
  taskCheckInGraceDays: 2,
};

function task(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "T",
    description: "",
    category: "other",
    estimatedHours: 1,
    urgency: "low",
    requiredSkills: [],
    assignedTo: "alice",
    status: "claimed",
    dependencies: [],
    orderIndex: 0,
    createdAt: NOW - 30 * DAY,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: NOW - 3 * DAY,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

describe("taskCheckInState", () => {
  it("returns 'fresh' for non-claimed statuses", () => {
    for (const status of [
      "open",
      "awaiting_confirmation",
      "completed",
      "blocked",
    ] as const) {
      expect(taskCheckInState(task({ status }), CONFIG, NOW)).toBe("fresh");
    }
  });

  it("returns 'fresh' when claimedAt is null (legacy row)", () => {
    expect(taskCheckInState(task({ claimedAt: null }), CONFIG, NOW)).toBe(
      "fresh",
    );
  });

  it("returns 'fresh' inside the check-in window", () => {
    expect(taskCheckInState(task({ claimedAt: NOW - 3 * DAY }), CONFIG, NOW)).toBe(
      "fresh",
    );
  });

  it("returns 'check_in_due' between check-in and needs-help windows", () => {
    expect(taskCheckInState(task({ claimedAt: NOW - 8 * DAY }), CONFIG, NOW)).toBe(
      "check_in_due",
    );
  });

  it("acknowledging within the window resets the private clock", () => {
    expect(
      taskCheckInState(
        task({
          claimedAt: NOW - 10 * DAY,
          checkInAcknowledgedAt: NOW - 1 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("fresh");
  });

  it("returns 'needs_more_hands' once claim floor + grace have both lapsed with no ack", () => {
    expect(
      taskCheckInState(
        task({
          claimedAt: NOW - 20 * DAY,
          checkInAcknowledgedAt: null,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("needs_more_hands");
  });

  it("a recent ack suppresses the public chip even past the claim floor", () => {
    // Claim is 20 days old (well past needsHelpDays=14), but the
    // claimer acknowledged 1 day ago — under the grace window
    // (graceDays=2) the public signal stays suppressed and the
    // private nudge re-shows.
    expect(
      taskCheckInState(
        task({
          claimedAt: NOW - 20 * DAY,
          checkInAcknowledgedAt: NOW - 1 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("fresh");
  });

  it("an old ack stops suppressing once the grace window has lapsed", () => {
    // Claim 20 days ago, last ack 10 days ago. Last ack +
    // checkInDays + graceDays = 10 - 7 - 2 = past. Public fires.
    expect(
      taskCheckInState(
        task({
          claimedAt: NOW - 20 * DAY,
          checkInAcknowledgedAt: NOW - 10 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("needs_more_hands");
  });

  it("past private window but inside grace stays 'check_in_due' (private nudge only)", () => {
    // Claim 20 days ago, ack 8 days ago. Private clock has rolled
    // again (8 > checkInDays=7), so private nudge re-shows. But
    // 8 < checkInDays + graceDays (9), so no public chip yet.
    expect(
      taskCheckInState(
        task({
          claimedAt: NOW - 20 * DAY,
          checkInAcknowledgedAt: NOW - 8 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("check_in_due");
  });

  it("treats the check-in boundary as inclusive (>= triggers)", () => {
    expect(
      taskCheckInState(task({ claimedAt: NOW - 7 * DAY }), CONFIG, NOW),
    ).toBe("check_in_due");
  });

  it("stays 'check_in_due' at needsHelpDays if the claimer acked within grace", () => {
    // 14 days post-claim, but the claimer acked 1 day ago.
    // Silence-since-ack = 1 day < (checkInDays=7 + graceDays=2).
    // Public chip suppressed; private nudge stays.
    expect(
      taskCheckInState(
        task({
          claimedAt: NOW - 14 * DAY,
          checkInAcknowledgedAt: NOW - 1 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("fresh");
  });

  it("fires the public chip at the combined inclusive boundary", () => {
    // With no ack, silence = days-since-claim. Needs both:
    //   days-since-claim >= taskNeedsHelpDays (14), AND
    //   days-since-claim >= taskCheckInDays + taskCheckInGraceDays (9)
    // The former is the binding constraint, so 16 days fires.
    expect(
      taskCheckInState(
        task({ claimedAt: NOW - 16 * DAY, checkInAcknowledgedAt: null }),
        CONFIG,
        NOW,
      ),
    ).toBe("needs_more_hands");
  });

  it("respects configured thresholds", () => {
    expect(
      taskCheckInState(
        task({ claimedAt: NOW - 5 * DAY }),
        { taskCheckInDays: 3, taskNeedsHelpDays: 7, taskCheckInGraceDays: 1 },
        NOW,
      ),
    ).toBe("check_in_due");
  });
});

describe("daysUntilCheckIn", () => {
  it("returns 0 for non-claimed or null-claimedAt tasks", () => {
    expect(daysUntilCheckIn(task({ status: "open" }), CONFIG, NOW)).toBe(0);
    expect(daysUntilCheckIn(task({ claimedAt: null }), CONFIG, NOW)).toBe(0);
  });

  it("counts down from claim time", () => {
    expect(daysUntilCheckIn(task({ claimedAt: NOW - 3 * DAY }), CONFIG, NOW)).toBe(
      4,
    );
  });

  it("counts down from ack when ack is newer", () => {
    expect(
      daysUntilCheckIn(
        task({
          claimedAt: NOW - 10 * DAY,
          checkInAcknowledgedAt: NOW - 1 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe(6);
  });

  it("returns 0 when already past due", () => {
    expect(
      daysUntilCheckIn(task({ claimedAt: NOW - 10 * DAY }), CONFIG, NOW),
    ).toBe(0);
  });
});

describe("daysSinceClaim", () => {
  it("returns 0 when claimedAt is null", () => {
    expect(daysSinceClaim(task({ claimedAt: null }), NOW)).toBe(0);
  });

  it("floors to whole days", () => {
    expect(daysSinceClaim(task({ claimedAt: NOW - 3.7 * DAY }), NOW)).toBe(3);
  });
});
