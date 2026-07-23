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
import { autoCloseEligibility } from "./autoCloseProposals";
import type { Proposal, Vote, VoteChoice } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-05-23T12:00:00Z").getTime();

const CONFIG = { proposalDeliberationDays: 3, proposalMinAffirms: 2 };

function proposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: "p1",
    nodeId: "n",
    kind: "proposal",
    category: "config_change",
    reversibilityTier: "easy",
    title: "T",
    description: "",
    payload: "{}",
    proposerKey: "proposer",
    status: "open",
    createdAt: NOW - 5 * DAY,
    closedAt: null,
    closedReason: null,
    impactReflection: null,
    disputePostId: null,
    ...overrides,
  };
}

function vote(voterKey: string, choice: VoteChoice, proposalId = "p1"): Vote {
  return {
    id: `${proposalId}|${voterKey}`,
    proposalId,
    voterKey,
    choice,
    reason: null,
    createdAt: NOW - 1000,
    nodeId: "n",
  };
}

describe("autoCloseEligibility", () => {
  it("returns 'not_open' for a closed proposal", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ status: "passed" }),
      votes: [],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("not_open");
  });

  it("returns 'wait_deliberation' when the period isn't satisfied", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: NOW - 1 * DAY }),
      votes: [vote("a", "affirm"), vote("b", "affirm")],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("wait_deliberation");
    if (result.kind === "wait_deliberation") {
      expect(result.readyAt).toBe(NOW - 1 * DAY + 3 * DAY);
    }
  });

  it("returns 'wait_affirms' when deliberation is done but not enough affirms", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: NOW - 5 * DAY }),
      votes: [vote("a", "affirm")],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("wait_affirms");
    if (result.kind === "wait_affirms") {
      expect(result.have).toBe(1);
      expect(result.need).toBe(2);
    }
  });

  it("returns 'blocked' whenever a block exists (even before deliberation)", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: NOW - 1 * DAY }),
      votes: [vote("a", "affirm"), vote("b", "block")],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("blocked");
    if (result.kind === "blocked") {
      expect(result.blockCount).toBe(1);
    }
  });

  it("returns 'passes' when all three conditions are met", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: NOW - 5 * DAY }),
      votes: [vote("a", "affirm"), vote("b", "affirm")],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("passes");
  });

  it("ignores abstains in the affirm count", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: NOW - 5 * DAY }),
      votes: [
        vote("a", "affirm"),
        vote("b", "abstain"),
        vote("c", "abstain"),
      ],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("wait_affirms");
  });

  it("ignores votes from other proposals", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ id: "p1", createdAt: NOW - 5 * DAY }),
      votes: [
        vote("a", "block", "p2"),
        vote("a", "affirm", "p1"),
        vote("b", "affirm", "p1"),
      ],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("passes");
  });

  it("treats deliberation boundary as 'just barely ready'", () => {
    const created = NOW - 3 * DAY;
    // Exactly at the boundary — should pass (>= satisfies the
    // "deliberation done" condition).
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: created }),
      votes: [vote("a", "affirm"), vote("b", "affirm")],
      config: CONFIG,
      now: NOW,
    });
    expect(result.kind).toBe("passes");
  });

  it("respects the configured deliberationDays + minAffirms", () => {
    const result = autoCloseEligibility({
      proposal: proposal({ createdAt: NOW - 8 * DAY }),
      votes: [vote("a", "affirm"), vote("b", "affirm"), vote("c", "affirm")],
      config: { proposalDeliberationDays: 7, proposalMinAffirms: 3 },
      now: NOW,
    });
    expect(result.kind).toBe("passes");
  });

  describe("trustedKeys — trusted-affirm counting (threat-model §7)", () => {
    const ripe = () => proposal({ createdAt: NOW - 5 * DAY });

    it("counts only trusted voters' affirms toward auto-pass", () => {
      const result = autoCloseEligibility({
        proposal: ripe(),
        votes: [vote("trusted-a", "affirm"), vote("pending-b", "affirm")],
        config: CONFIG,
        trustedKeys: new Set(["trusted-a"]),
        now: NOW,
      });
      expect(result.kind).toBe("wait_affirms");
      if (result.kind === "wait_affirms") {
        expect(result.have).toBe(1);
        expect(result.need).toBe(2);
        expect(result.notYetCounted).toBe(1);
      }
    });

    it("passes once the counted affirms alone satisfy the minimum", () => {
      const result = autoCloseEligibility({
        proposal: ripe(),
        votes: [
          vote("trusted-a", "affirm"),
          vote("trusted-b", "affirm"),
          vote("pending-c", "affirm"),
        ],
        config: CONFIG,
        trustedKeys: new Set(["trusted-a", "trusted-b"]),
        now: NOW,
      });
      expect(result.kind).toBe("passes");
    });

    it("a pending voter's BLOCK still blocks — blocks are never trust-filtered and are evaluated first", () => {
      const result = autoCloseEligibility({
        proposal: ripe(),
        votes: [
          vote("trusted-a", "affirm"),
          vote("trusted-b", "affirm"),
          vote("pending-c", "block"),
        ],
        config: CONFIG,
        trustedKeys: new Set(["trusted-a", "trusted-b"]),
        now: NOW,
      });
      expect(result.kind).toBe("blocked");
    });

    it("null trustedKeys keeps the legacy flat count (no founder capture — the node enforces)", () => {
      const result = autoCloseEligibility({
        proposal: ripe(),
        votes: [vote("a", "affirm"), vote("b", "affirm")],
        config: CONFIG,
        trustedKeys: null,
        now: NOW,
      });
      expect(result.kind).toBe("passes");
    });

    it("notYetCounted is 0 when every recorded affirm counts", () => {
      const result = autoCloseEligibility({
        proposal: ripe(),
        votes: [vote("trusted-a", "affirm")],
        config: CONFIG,
        trustedKeys: new Set(["trusted-a", "trusted-b"]),
        now: NOW,
      });
      expect(result.kind).toBe("wait_affirms");
      if (result.kind === "wait_affirms") {
        expect(result.have).toBe(1);
        expect(result.notYetCounted).toBe(0);
      }
    });
  });

  describe("project_adoption deliberation floor", () => {
    const affirms = [vote("a", "affirm"), vote("b", "affirm")];

    it("holds an adoption proposal to 14 days even when config says 3", () => {
      const created = NOW - 10 * DAY; // past the 3-day config, short of 14
      const result = autoCloseEligibility({
        proposal: proposal({ category: "project_adoption", createdAt: created }),
        votes: affirms,
        config: CONFIG,
        now: NOW,
      });
      expect(result.kind).toBe("wait_deliberation");
      if (result.kind === "wait_deliberation") {
        expect(result.readyAt).toBe(created + 14 * DAY);
      }
    });

    it("passes an adoption proposal once 14 days have elapsed", () => {
      const result = autoCloseEligibility({
        proposal: proposal({
          category: "project_adoption",
          createdAt: NOW - 15 * DAY,
        }),
        votes: affirms,
        config: CONFIG,
        now: NOW,
      });
      expect(result.kind).toBe("passes");
    });

    it("uses the longer of config and 14 days (config wins when larger)", () => {
      const result = autoCloseEligibility({
        proposal: proposal({
          category: "project_adoption",
          createdAt: NOW - 15 * DAY,
        }),
        votes: affirms,
        config: { proposalDeliberationDays: 20, proposalMinAffirms: 2 },
        now: NOW,
      });
      expect(result.kind).toBe("wait_deliberation");
    });

    it("does not apply the floor to other categories", () => {
      const result = autoCloseEligibility({
        proposal: proposal({ category: "config_change", createdAt: NOW - 4 * DAY }),
        votes: affirms,
        config: CONFIG,
        now: NOW,
      });
      expect(result.kind).toBe("passes");
    });
  });
});
