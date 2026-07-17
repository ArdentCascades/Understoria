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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Post } from "@/types";

/**
 * The viewer's relationship to a post determines which narrative
 * sentence is true for them. "Owes" and "alreadyConfirmed" are only
 * meaningful for parties; non-parties get the neutral observer copy.
 */
export type ViewerRole = "poster" | "claimer" | "third-party";

interface ExchangeStateNarrativeProps {
  /** The post whose state we are narrating. We read `status` and
   *  the names of the helper/helped via the props below; the post
   *  is passed in directly so this component can be moved to other
   *  surfaces without rewiring. */
  post: Pick<Post, "status">;
  viewerRole: ViewerRole;
  /** Whether the viewer (only meaningful for parties) has already
   *  signed `confirmedBy`. Drives the awaiting-confirmation copy. */
  alreadyConfirmed: boolean;
  /** The other party's display name as shown to the viewer. For the
   *  poster it's the claimer; for the claimer it's the poster; for
   *  a third party it's unused (left undefined is fine). */
  otherPartyName: string | undefined;
  /** Read straight from `nodeConfig.autoConfirmHours`. When > 0 the
   *  community node auto-confirms the helped side after this many
   *  hours; when <= 0 the sweep is disabled and we never promise
   *  one. Matches PR #221's BalanceCard reading exactly. */
  autoConfirmHours: number;
  /** For `disputed` posts only: the id of the matching dispute
   *  Proposal (kind="dispute", disputePostId===post.id). When
   *  provided, the disputed-state pointer deep-links to that
   *  card on /disputes via an anchor (#{proposalId}); when not
   *  resolvable (e.g. the dispute row hasn't synced locally yet
   *  on the consuming surface), the pointer falls back to the
   *  plain list at /disputes. Other states ignore this prop. */
  disputeProposalId?: string | null;
}

/**
 * Plain-language narrative of where this exchange is and what (if
 * anything) the viewer should do. Lives ABOVE the existing confirm
 * CTA in PostDetail — it never replaces or buries the action.
 *
 * Why a component instead of inline conditionals: the audit's
 * critical finding was that the both-parties-must-confirm
 * requirement was never stated in plain language anywhere members
 * actually look. Pulling the matrix into one place makes it
 * easier to keep the copy honest and consistent with the Profile
 * surface that PR #221 already shipped — same vocabulary ("credit
 * moves when both sides have confirmed", auto-confirm window
 * phrased identically), same muted/no-alarm styling.
 *
 * Solidarity-not-shame: waiting is "in motion", never "stuck";
 * the auto-confirm line is a safety net, not a deadline.
 */
export function ExchangeStateNarrative({
  post,
  viewerRole,
  alreadyConfirmed,
  otherPartyName,
  autoConfirmHours,
  disputeProposalId,
}: ExchangeStateNarrativeProps) {
  const { t } = useTranslation();

  // Disputed posts get a wayfinding pointer to where the conversation
  // is actually happening (the /disputes surface), not a prompt to
  // start one. The dispute is already filed by the time the post is
  // `disputed` — this routes someone who LANDED here to the existing
  // conversation. Same copy regardless of viewer role: the operator
  // settled on "operational reference, not inviting prompt" — what
  // the viewer should do is read the discussion, not be told to act.
  if (post.status === "disputed") {
    const href = disputeProposalId
      ? `/disputes#${disputeProposalId}`
      : "/disputes";
    return (
      <div
        className="rounded-xl bg-moss-50 p-3 text-sm text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
        data-testid="exchange-state-narrative"
      >
        <p className="font-medium">
          {t("postDetail.exchangeState.disputedTitle")}
        </p>
        <p className="mt-1.5">
          {t("postDetail.exchangeState.disputedBody")}
        </p>
        <p className="mt-1.5">
          <Link
            to={href}
            className="underline decoration-moss-400 underline-offset-2 hover:decoration-moss-700 dark:decoration-moss-500 dark:hover:decoration-moss-200"
          >
            {t("postDetail.exchangeState.disputedLink")}
          </Link>
        </p>
      </div>
    );
  }

  const lines = narrativeLines({
    status: post.status,
    viewerRole,
    alreadyConfirmed,
    otherPartyName: otherPartyName ?? t("common.memberFallback"),
    autoConfirmHours,
    t,
  });
  if (lines.length === 0) return null;
  // Muted card surface to match the rest of PostDetail's hint
  // language (cf. `actionsClaimedBy`'s muted text) — no alarm tone,
  // no color-only signal. Card padding kept light so the narrative
  // sits visually next to the action, not as a separate banner.
  return (
    <div
      className="rounded-xl bg-moss-50 p-3 text-sm text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
      data-testid="exchange-state-narrative"
    >
      {lines.map((line, i) => (
        <p key={i} className={i === 0 ? "" : "mt-1.5"}>
          {line}
        </p>
      ))}
    </div>
  );
}

type TFn = (key: string, opts?: Record<string, unknown>) => string;

interface MatrixInput {
  status: Post["status"];
  viewerRole: ViewerRole;
  alreadyConfirmed: boolean;
  otherPartyName: string;
  autoConfirmHours: number;
  t: TFn;
}

/**
 * Pure mapping from (state, viewerRole, alreadyConfirmed) -> one or
 * two i18n-resolved sentences. Exported only via the React wrapper;
 * keeping it a plain function makes the narrative matrix easy to
 * read and to unit-test (one assertion per cell).
 */
function narrativeLines({
  status,
  viewerRole,
  alreadyConfirmed,
  otherPartyName,
  autoConfirmHours,
  t,
}: MatrixInput): string[] {
  const isParty = viewerRole !== "third-party";

  if (status === "claimed") {
    if (viewerRole === "claimer") {
      // The viewer IS the claimer — naming the other party as the
      // claimer here ("{{name}} has claimed this") would tell them
      // someone beat them to it. Speak in second person instead.
      return [t("postDetail.exchangeState.claimed.viewerClaimed")];
    }
    if (isParty) {
      // Viewer is the poster: their counterpart (the claimer) is the
      // one who claimed it, so naming them is the true sentence.
      return [
        t("postDetail.exchangeState.claimed.party", {
          name: otherPartyName,
        }),
      ];
    }
    return [t("postDetail.exchangeState.claimed.thirdParty")];
  }

  if (status === "awaiting_confirmation") {
    if (!isParty) {
      return [t("postDetail.exchangeState.awaitingConfirmation.thirdParty")];
    }
    if (!alreadyConfirmed) {
      // The viewer is the one whose signature finishes the exchange.
      // Frame what just happened (the other side confirmed) and what
      // their confirm does (completes the move). The button itself
      // lives in PostDetail just below this panel.
      return [
        t("postDetail.exchangeState.awaitingConfirmation.viewerOwes", {
          name: otherPartyName,
        }),
      ];
    }
    // Viewer has confirmed — nothing for them to do. We tell them
    // who we're waiting on, and (only if the community has an
    // auto-confirm sweep configured) the safety-net line so they
    // never wonder whether credit can land at all.
    const lines = [
      t("postDetail.exchangeState.awaitingConfirmation.viewerConfirmed", {
        name: otherPartyName,
      }),
    ];
    if (autoConfirmHours > 0) {
      // PR #221's exact rounding: ceil hours/24, min 1. Keeps the
      // Profile breakdown and this narrative reading the same window.
      const days = Math.max(1, Math.ceil(autoConfirmHours / 24));
      lines.push(
        t("postDetail.exchangeState.awaitingConfirmation.autoConfirm", {
          count: days,
        }),
      );
    }
    return lines;
  }

  if (status === "completed") {
    // Quiet closure line — the ember banner above already does the
    // reciprocity moment for parties; this is just the plain-language
    // statement that the credit has moved. Shown to everyone.
    return [t("postDetail.exchangeState.completed")];
  }

  // open / cancelled: PostDetail already speaks well in these states
  // (the "still looking" hint, the cancelled chip). The `disputed`
  // branch is handled directly in the component above because it
  // renders a link to /disputes, not just a string.
  return [];
}
