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
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Real i18n. We assert against actual English copy so a careless
// edit to en.json that strips the both-must-confirm framing trips
// the test rather than silently shipping.
import "@/i18n";
import {
  ExchangeStateNarrative,
  type ViewerRole,
} from "./ExchangeStateNarrative";
import type { Post } from "@/types";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

function render(node: ReactNode) {
  act(() => {
    root = createRoot(container);
    // MemoryRouter so the disputed branch's <Link> can render. The
    // other branches don't render any Link but the wrapper is cheap
    // and keeps the test scaffold uniform.
    root.render(<MemoryRouter>{node}</MemoryRouter>);
  });
}

interface Case {
  status: Post["status"];
  viewerRole: ViewerRole;
  alreadyConfirmed?: boolean;
  otherPartyName?: string;
  autoConfirmHours?: number;
  disputeProposalId?: string | null;
}

function renderCase({
  status,
  viewerRole,
  alreadyConfirmed = false,
  otherPartyName = "Maple",
  autoConfirmHours = 168,
  disputeProposalId = null,
}: Case) {
  render(
    <ExchangeStateNarrative
      post={{ status }}
      viewerRole={viewerRole}
      alreadyConfirmed={alreadyConfirmed}
      otherPartyName={otherPartyName}
      autoConfirmHours={autoConfirmHours}
      disputeProposalId={disputeProposalId}
    />,
  );
}

describe("ExchangeStateNarrative", () => {
  describe("claimed", () => {
    it("for a party, says BOTH must confirm and names the other party", () => {
      renderCase({ status: "claimed", viewerRole: "poster" });
      const text = container.textContent ?? "";
      // The both-must-confirm requirement is the load-bearing
      // sentence the audit identified as missing. If this assertion
      // ever fails we've lost the fix.
      expect(text).toContain("both of you confirm");
      expect(text).toContain("when both sides have confirmed");
      expect(text).toContain("Maple");
    });

    it("for a third party, says only that the post is claimed", () => {
      renderCase({ status: "claimed", viewerRole: "third-party" });
      const text = container.textContent ?? "";
      expect(text).toBe("This post is claimed.");
    });

    it("works symmetrically for poster and claimer", () => {
      renderCase({ status: "claimed", viewerRole: "claimer" });
      const text = container.textContent ?? "";
      expect(text).toContain("both of you confirm");
      expect(text).toContain("Maple");
    });
  });

  describe("awaiting_confirmation — viewer owes", () => {
    it("tells them the other side confirmed and theirs completes it", () => {
      renderCase({
        status: "awaiting_confirmation",
        viewerRole: "claimer",
        alreadyConfirmed: false,
      });
      const text = container.textContent ?? "";
      expect(text).toContain("Maple confirmed");
      expect(text).toContain("Your confirmation completes the exchange");
      // Must NOT preemptively talk about auto-confirm to the
      // person who still has the action — that would soften the
      // ask into an indefinite "the node will handle it" framing.
      expect(text).not.toContain("node confirms automatically");
    });
  });

  describe("awaiting_confirmation — viewer has confirmed", () => {
    it("names who we're waiting on and reuses #221's mechanics phrasing", () => {
      renderCase({
        status: "awaiting_confirmation",
        viewerRole: "poster",
        alreadyConfirmed: true,
        autoConfirmHours: 168,
      });
      const text = container.textContent ?? "";
      expect(text).toContain("You've confirmed");
      expect(text).toContain("Waiting on Maple");
      expect(text).toContain("when both sides have confirmed");
      // 168h = 7 days, plural branch.
      expect(text).toContain("about 7 days");
    });

    it("uses the singular branch when auto-confirm rounds to 1 day", () => {
      renderCase({
        status: "awaiting_confirmation",
        viewerRole: "poster",
        alreadyConfirmed: true,
        autoConfirmHours: 12,
      });
      const text = container.textContent ?? "";
      // 12h ceil/24 = 1, min(1) = 1 — same arithmetic PR #221 uses
      // on the Profile breakdown so the windows always agree.
      expect(text).toContain("about 1 day");
      expect(text).not.toContain("1 days");
    });

    it("omits the auto-confirm line when the sweep is disabled", () => {
      renderCase({
        status: "awaiting_confirmation",
        viewerRole: "poster",
        alreadyConfirmed: true,
        autoConfirmHours: 0,
      });
      const text = container.textContent ?? "";
      expect(text).toContain("You've confirmed");
      expect(text).toContain("Waiting on Maple");
      // The community has turned off the auto-confirm sweep, so we
      // never promise one. Matches PR #221's BalanceCard contract.
      expect(text).not.toContain("node confirms");
      expect(text).not.toContain("automatically");
    });

    it("omits the auto-confirm line when the sweep is configured negative", () => {
      renderCase({
        status: "awaiting_confirmation",
        viewerRole: "claimer",
        alreadyConfirmed: true,
        autoConfirmHours: -1,
      });
      const text = container.textContent ?? "";
      expect(text).not.toContain("node confirms");
    });
  });

  describe("awaiting_confirmation — third party", () => {
    it("gives a neutral observer sentence without exposing who owes", () => {
      renderCase({
        status: "awaiting_confirmation",
        viewerRole: "third-party",
      });
      const text = container.textContent ?? "";
      // Third parties shouldn't be able to tell which member is
      // sitting on the confirmation — that's surveillance data.
      expect(text).toBe("Confirmed by one side; waiting on the other.");
    });
  });

  describe("completed and other states", () => {
    it.each(["open", "cancelled"] as const)(
      "renders nothing for status=%s",
      (status) => {
        renderCase({ status, viewerRole: "poster" });
        expect(
          container.querySelector('[data-testid="exchange-state-narrative"]'),
        ).toBeNull();
      },
    );

    it("renders a quiet closure line for completed", () => {
      // Defensive — PostDetail's completed surface already speaks,
      // so this rendering isn't currently consumed by that page.
      // The component still answers the state matrix honestly in
      // case another surface mounts it (member detail, history).
      renderCase({ status: "completed", viewerRole: "third-party" });
      const text = container.textContent ?? "";
      expect(text).toContain("credit has moved");
    });
  });

  describe("disputed", () => {
    // The operator-settled framing rule for the disputed branch:
    // operational reference, not inviting prompt. The dispute is
    // already filed by the time a post is `disputed`; the narrative
    // points to where the conversation is happening, never asks the
    // viewer to start one.

    it("renders the body copy describing where the conversation is", () => {
      renderCase({
        status: "disputed",
        viewerRole: "third-party",
        disputeProposalId: "prop_abc",
      });
      const text = container.textContent ?? "";
      // Body sentence: "The community is discussing this exchange."
      // — descriptive, not directive. Any drift toward an imperative
      // ("file a", "raise this", "consider…") trips this assertion.
      expect(text).toContain("community is discussing this exchange");
      // Forbidden framings (the operator's settled rule).
      expect(text).not.toMatch(/open a proposal/i);
      expect(text).not.toMatch(/file a dispute/i);
      expect(text).not.toMatch(/raise this/i);
      expect(text).not.toMatch(/is something wrong/i);
    });

    it("renders a link to the specific dispute when a proposal id is known", () => {
      renderCase({
        status: "disputed",
        viewerRole: "poster",
        disputeProposalId: "prop_abc",
      });
      const link = container.querySelector("a");
      expect(link).not.toBeNull();
      // Deep-link into the Disputes list anchored on the matching
      // proposal card. Falls back to plain /disputes when the id is
      // unknown (see next test).
      expect(link?.getAttribute("href")).toBe("/disputes#prop_abc");
      expect(link?.textContent).toContain("Disputes");
    });

    it("falls back to plain /disputes when no proposal id is resolvable", () => {
      renderCase({
        status: "disputed",
        viewerRole: "poster",
        disputeProposalId: null,
      });
      const link = container.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/disputes");
    });

    // Three viewer-role tests, one assertion each: the rendered text
    // is identical across poster / claimer / third-party. This is the
    // viewer-role-INDEPENDENT property — the pointer describes where
    // the conversation lives, never what the viewer should do, so
    // role can't change the copy.
    it("renders the same text for the poster as for any other viewer", () => {
      renderCase({
        status: "disputed",
        viewerRole: "poster",
        disputeProposalId: "prop_abc",
      });
      expect(container.textContent).toBe(
        "Under community review.The community is discussing this exchange.See Profile → Disputes",
      );
    });

    it("renders the same text for the claimer as for any other viewer", () => {
      renderCase({
        status: "disputed",
        viewerRole: "claimer",
        disputeProposalId: "prop_abc",
      });
      expect(container.textContent).toBe(
        "Under community review.The community is discussing this exchange.See Profile → Disputes",
      );
    });

    it("renders the same text for a third party as for any other viewer", () => {
      renderCase({
        status: "disputed",
        viewerRole: "third-party",
        disputeProposalId: "prop_abc",
      });
      expect(container.textContent).toBe(
        "Under community review.The community is discussing this exchange.See Profile → Disputes",
      );
    });
  });
});
