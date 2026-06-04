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
import { shouldAutoConfirm } from "./autoConfirm";
import type { Post, ProjectTask } from "@/types";

const HOUR = 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

describe("shouldAutoConfirm — hard contracts from docs/auto-confirm-key.md", () => {
  describe("contract 5: autoConfirmHours = 0 disables the sweep entirely", () => {
    // An OTHERWISE-eligible row is the right shape to assert this with —
    // if the only reason it's rejected is the 0 knob, the test proves
    // the knob short-circuits everything else.
    it("returns false for a row that would otherwise be eligible", () => {
      expect(
        shouldAutoConfirm(
          {
            kind: "post",
            status: "awaiting_confirmation",
            awaitingSince: NOW - 8 * 24 * HOUR, // 8 days, past 7d default
          },
          NOW,
          0,
        ),
      ).toBe(false);
    });

    it("returns false even for ancient rows (no off-by-one trick)", () => {
      expect(
        shouldAutoConfirm(
          {
            kind: "task",
            status: "awaiting_confirmation",
            awaitingSince: 1,
          },
          NOW,
          0,
        ),
      ).toBe(false);
    });

    it("negative hours is treated the same as 0 (defensive)", () => {
      expect(
        shouldAutoConfirm(
          {
            kind: "post",
            status: "awaiting_confirmation",
            awaitingSince: NOW - 8 * 24 * HOUR,
          },
          NOW,
          -1,
        ),
      ).toBe(false);
    });
  });

  describe("contract 6: operates only on awaiting_confirmation rows", () => {
    const eligibleAge = NOW - 8 * 24 * HOUR;
    const POST_STATUSES: Post["status"][] = [
      "open",
      "claimed",
      "completed",
      "cancelled",
      "disputed",
    ];
    for (const status of POST_STATUSES) {
      it(`post in status "${status}" is skipped`, () => {
        expect(
          shouldAutoConfirm(
            { kind: "post", status, awaitingSince: eligibleAge },
            NOW,
            168,
          ),
        ).toBe(false);
      });
    }
    const TASK_STATUSES: ProjectTask["status"][] = [
      "open",
      "claimed",
      "completed",
      "blocked",
    ];
    for (const status of TASK_STATUSES) {
      it(`task in status "${status}" is skipped`, () => {
        expect(
          shouldAutoConfirm(
            { kind: "task", status, awaitingSince: eligibleAge },
            NOW,
            168,
          ),
        ).toBe(false);
      });
    }
  });

  describe("contract 4: cannot fire below `autoConfirmHours`", () => {
    // The doc's explicit framing: an awaiting record older than
    // `now − (autoConfirmHours − 1h)` must be a no-op. We construct
    // exactly that case and assert false.
    it("a row 1h younger than the threshold is ineligible", () => {
      const hours = 168;
      const youngerThanThreshold = NOW - (hours - 1) * HOUR;
      expect(
        shouldAutoConfirm(
          {
            kind: "post",
            status: "awaiting_confirmation",
            awaitingSince: youngerThanThreshold,
          },
          NOW,
          hours,
        ),
      ).toBe(false);
    });

    it("a row exactly at the threshold is eligible (>=)", () => {
      const hours = 168;
      const atThreshold = NOW - hours * HOUR;
      expect(
        shouldAutoConfirm(
          {
            kind: "post",
            status: "awaiting_confirmation",
            awaitingSince: atThreshold,
          },
          NOW,
          hours,
        ),
      ).toBe(true);
    });

    it("a row older than the threshold is eligible", () => {
      const hours = 168;
      const past = NOW - (hours + 24) * HOUR;
      expect(
        shouldAutoConfirm(
          {
            kind: "task",
            status: "awaiting_confirmation",
            awaitingSince: past,
          },
          NOW,
          hours,
        ),
      ).toBe(true);
    });

    it("clock skew (future awaitingSince) is rejected", () => {
      // An awaitingSince in the future means either a clock skew
      // or a peer-imported row with a wrong timestamp. The honest
      // move is to not auto-confirm — a row we can't reason about
      // timing-wise is the wrong place to spend the system key's
      // signature.
      expect(
        shouldAutoConfirm(
          {
            kind: "post",
            status: "awaiting_confirmation",
            awaitingSince: NOW + HOUR,
          },
          NOW,
          168,
        ),
      ).toBe(false);
    });

    it("zero or negative `awaitingSince` is rejected", () => {
      expect(
        shouldAutoConfirm(
          {
            kind: "post",
            status: "awaiting_confirmation",
            awaitingSince: 0,
          },
          NOW,
          168,
        ),
      ).toBe(false);
    });
  });
});
