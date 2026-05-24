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
  taskStaleness,
} from "./taskStaleness";
import type { ProjectTask } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-23T12:00:00Z").getTime();
const CONFIG = { taskCheckInDays: 7, taskNeedsHelpDays: 14 };

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
    createdAt: NOW - 30 * DAY,
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: NOW - 3 * DAY,
    checkInAcknowledgedAt: null,
    ...overrides,
  };
}

describe("taskStaleness", () => {
  it("returns 'fresh' for non-claimed statuses", () => {
    for (const status of [
      "open",
      "awaiting_confirmation",
      "completed",
      "blocked",
    ] as const) {
      expect(taskStaleness(task({ status }), CONFIG, NOW)).toBe("fresh");
    }
  });

  it("returns 'fresh' when claimedAt is null (legacy row)", () => {
    expect(taskStaleness(task({ claimedAt: null }), CONFIG, NOW)).toBe(
      "fresh",
    );
  });

  it("returns 'fresh' inside the check-in window", () => {
    expect(taskStaleness(task({ claimedAt: NOW - 3 * DAY }), CONFIG, NOW)).toBe(
      "fresh",
    );
  });

  it("returns 'check_in_due' between check-in and needs-help windows", () => {
    expect(taskStaleness(task({ claimedAt: NOW - 8 * DAY }), CONFIG, NOW)).toBe(
      "check_in_due",
    );
  });

  it("acknowledging within the window resets the private clock", () => {
    expect(
      taskStaleness(
        task({
          claimedAt: NOW - 10 * DAY,
          checkInAcknowledgedAt: NOW - 1 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("fresh");
  });

  it("returns 'needs_more_hands' past the public threshold (regardless of ack)", () => {
    expect(
      taskStaleness(
        task({
          claimedAt: NOW - 15 * DAY,
          checkInAcknowledgedAt: NOW - 1 * DAY,
        }),
        CONFIG,
        NOW,
      ),
    ).toBe("needs_more_hands");
  });

  it("treats the check-in boundary as inclusive (>= triggers)", () => {
    expect(
      taskStaleness(task({ claimedAt: NOW - 7 * DAY }), CONFIG, NOW),
    ).toBe("check_in_due");
  });

  it("treats the needs-help boundary as inclusive (>= triggers)", () => {
    expect(
      taskStaleness(task({ claimedAt: NOW - 14 * DAY }), CONFIG, NOW),
    ).toBe("needs_more_hands");
  });

  it("respects configured thresholds", () => {
    expect(
      taskStaleness(
        task({ claimedAt: NOW - 5 * DAY }),
        { taskCheckInDays: 3, taskNeedsHelpDays: 7 },
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
