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
import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { CosignRemoval } from "@/components/CosignRemoval";
import { RemovalCeremony } from "@/components/RemovalCeremony";
import { RemovalGateNotice, useRemovalGate } from "@/components/useRemovalGate";
import { deriveRemovedKeys } from "@/lib/memberRemoval";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { BackLink } from "@/components/BackLink";
import { useToast } from "@/state/ToastContext";
import { formatHours, formatRelativeTime, shortKey } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { closeProposal } from "@/db/proposals";
import {
  executeAdoptionProposal,
  withdrawAdoptionAsPresent,
} from "@/db/adoption";
import { castVote } from "@/db/votes";
import { TrustGateCard } from "@/components/InviteTrustGateCard";
import { trustedMemberSet } from "@/lib/vouch";
import { currentMemberVote, tallyVotes, type Tally } from "@/lib/votes";
import {
  autoCloseEligibility,
  type AutoCloseEligibility,
} from "@/lib/autoCloseProposals";
import { usePendingAction } from "@/lib/usePendingAction";
import { humanizeError } from "@/lib/humanizeError";
import type {
  DisputePayload,
  ImpactReflection,
  Proposal,
  ProjectAdoptionPayload,
  ProposalStatus,
  Vote,
  VoteChoice,
} from "@/types";

// The Decisions surface. Proposals, votes, and closures are signed
// federated records since docs/proposal-federation.md G1/G2: ballots
// are open (attributed, re-castable — the newest version tallies),
// any TRUSTED member may record the community's outcome (threat-model
// §7 — a pending proposer may still withdraw their own), and a passed
// closure whose merged ballot shows standing blocks renders as
// contested rather than being silently honored. Legacy rows made
// before federation stay on the device that recorded them, marked
// with a local-only note. Removal/reinstatement records and the
// co-sign ceremony entry points live here too.

const STATUS_FILTERS: Array<ProposalStatus | "all"> = [
  "open",
  "all",
  "passed",
  "rejected",
  "withdrawn",
];

export default function ProposalsPage() {
  const {
    proposals,
    members,
    currentMember,
    votes,
    nodeId,
    nodeConfig,
    governanceHiddenKeys,
    invites,
    founderRoots,
  } = useApp();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ProposalStatus | "all">("open");

  // PR F: governance-content filter is per-block opt-in only. System
  // default is to leave governance visible (docs/blocking.md §3.2 +
  // §11.10 — no silent disenfranchisement). When governanceHiddenKeys
  // is empty (the typical case, including the default-block path),
  // listProposals returns the same set for any blocker — the
  // load-bearing system invariant from blocking.consumers.test.ts.
  const governanceFilteredProposals = useMemo(() => {
    if (governanceHiddenKeys.size === 0) return proposals;
    const myKey = currentMember?.publicKey ?? null;
    return proposals.filter((p) => {
      if (!governanceHiddenKeys.has(p.proposerKey)) return true;
      // Never governance-hide an adoption proposal that targets the
      // VIEWER'S OWN project (Round-4 review, L6). The attention rail
      // deep-links here to warn a sitting primary that a stewardship
      // transfer is open "over their head"; hiding it because they
      // blocked the proposer would blind them to a role transfer they
      // must be able to read and contest — the notice window is
      // load-bearing (docs/project-adoption.md). Its author is exposed
      // only for this one proposal about the viewer.
      if (p.category === "project_adoption" && myKey) {
        try {
          const payload = JSON.parse(p.payload) as { sittingPrimaryKey?: string };
          if (payload.sittingPrimaryKey === myKey) return true;
        } catch {
          // fall through to the hide
        }
      }
      return false;
    });
  }, [proposals, governanceHiddenKeys, currentMember]);

  const filtered = useMemo(() => {
    if (filter === "all") return governanceFilteredProposals;
    return governanceFilteredProposals.filter((p) => p.status === filter);
  }, [governanceFilteredProposals, filter]);

  // docs/member-removal.md M1: the community's removal /
  // reinstatement records render here — public inside the community,
  // permanently attributed. Secret expulsions are how communities
  // rot; this list is the opposite.
  const memberRemovals = useLiveQuery(
    () => db.memberRemovals.toArray(),
    [],
    [],
  );
  const memberReinstatements = useLiveQuery(
    () => db.memberReinstatements.toArray(),
    [],
    [],
  );
  const [cosigning, setCosigning] = useState(false);
  const [reinstating, setReinstating] = useState<string | null>(null);
  // Co-signing and reinstating are trusted-member powers (the node
  // refuses quorums with untrusted signers); the gate announces
  // itself in place of each affordance below.
  const removalGate = useRemovalGate();
  const removedNow = useMemo(
    () => deriveRemovedKeys(memberRemovals, memberReinstatements),
    [memberRemovals, memberReinstatements],
  );
  const nameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  // Index votes by proposal so each card can pluck its own slice
  // in O(1) at render time. PR F: votes by a member in
  // governanceHiddenKeys are filtered from the blocker's view per
  // docs/blocking.md §6 row "Proposal votes (a, only if
  // hideGovernance: true)". When the set is empty (system default),
  // every vote remains visible.
  const votesByProposal = useMemo(() => {
    const map = new Map<string, Vote[]>();
    for (const v of votes) {
      if (governanceHiddenKeys.has(v.voterKey)) continue;
      const arr = map.get(v.proposalId) ?? [];
      arr.push(v);
      map.set(v.proposalId, arr);
    }
    return map;
  }, [votes, governanceHiddenKeys]);

  // The DECISION vote set is UNFILTERED (Round-4 review). The
  // governance-hide filter above is a per-viewer DISPLAY concern; it
  // must never drive `autoCloseEligibility`, or a blocker could hide a
  // block vote from their own view and then close the proposal as
  // passed over it. A block changes what you SEE, not what you can
  // ENACT (docs/blocking.md §6.3). `closeProposal` re-checks this
  // server-of-record too.
  const decisionVotesByProposal = useMemo(() => {
    const map = new Map<string, Vote[]>();
    for (const v of votes) {
      const arr = map.get(v.proposalId) ?? [];
      arr.push(v);
      map.set(v.proposalId, arr);
    }
    return map;
  }, [votes]);

  // DECISION trust context (threat-model §7): built from UNFILTERED
  // db.vouches, same discipline as decisionVotesByProposal — a viewer
  // who blocks one of a voter's vouchers must not thereby stop that
  // voter's affirm from counting, or see a different consensus state
  // than everyone else. Null without a founder capture: the rooted
  // computation has no anchor, so this device keeps legacy flat
  // counting and the node enforces closure signing.
  const decisionVouches = useLiveQuery(() => db.vouches.toArray(), [], []);
  const trustedKeys = useMemo(
    () =>
      trustedMemberSet({ vouches: decisionVouches, invites, founderRoots }),
    [decisionVouches, invites, founderRoots],
  );

  // Enactment is a trusted-member power: the consensus close and the
  // manual record-outcome buttons render only for a trusted viewer
  // (no capture ⇒ legacy allow — the node enforces). Seeing is not
  // gated: a pending member reads every proposal, tally, and honest
  // waiting state.
  const canEnact =
    currentMember !== null &&
    (trustedKeys === null || trustedKeys.has(currentMember.publicKey));

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4 landscape-short:mb-2">
        {/* Reached from Profile's governance cluster (and from
            cross-links between the governance pages), so back follows
            in-app history when there is any and falls back to
            /profile on a cold entry — where navigate(-1) used to be
            a dead button. */}
        <BackLink
          to="/profile"
          label={t("common.back")}
          preferHistory
          className="btn-ghost -ml-2 text-sm"
        />
        <h1 className="page-title mt-2">
          {t("proposals.title")}
        </h1>
        <p className="page-subtitle text-sm text-moss-600 dark:text-moss-300">
          {t("proposals.subtitle")}
        </p>
      </header>

      {/* Phase 3.2 (Proposals): the page has no list+detail split
          (each ProposalCard is self-contained inline) so the plan's
          two-pane treatment doesn't apply. Smaller reflow that fits
          the structure: pin the filter row + "Start new" to the top
          of the scroll context so members keep the filter controls
          and the start-new affordance visible as they scroll through
          long proposal lists. backdrop-blur + 95%-opaque background
          keep content underneath legible while the bar sticks. */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-moss-950/95 dark:supports-[backdrop-filter]:bg-moss-950/70">
        <div
          role="tablist"
          aria-label={t("proposals.filterAriaLabel")}
          className="flex flex-wrap gap-1 rounded-full bg-moss-100 p-1 dark:bg-moss-900"
        >
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              role="tab"
              type="button"
              aria-selected={filter === s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === s
                  ? "bg-white text-canopy-800 shadow-sm dark:bg-moss-950 dark:text-canopy-200"
                  : "text-moss-700 dark:text-moss-300"
              }`}
            >
              {t(`proposals.filter.${s}`)}
            </button>
          ))}
        </div>
        {currentMember && (
          <Link to="/proposals/new" className="btn-primary text-sm">
            {t("proposals.startNew")}
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration="basket"
          title={t(
            filter === "open"
              ? "proposals.emptyTitleOpen"
              : "proposals.emptyTitleFiltered",
          )}
          message={t(
            filter === "open"
              ? "proposals.emptyOpen"
              : "proposals.emptyFiltered",
          )}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((p) => {
            const proposalVotes = votesByProposal.get(p.id) ?? [];
            // Eligibility is computed from the UNFILTERED decision set,
            // never the viewer's display-filtered slice (Round-4).
            const eligibility = autoCloseEligibility({
              proposal: p,
              votes: decisionVotesByProposal.get(p.id) ?? [],
              config: nodeConfig,
              trustedKeys,
            });
            // Phase G2 (docs/proposal-federation.md §2): a closure
            // that slipped past a node whose vote set lacked a block
            // displays as CONTESTED here — computed on the merged,
            // unfiltered set, never the viewer's slice.
            const contested =
              p.status === "passed" &&
              tallyVotes(decisionVotesByProposal.get(p.id) ?? []).blocks
                .length > 0;
            return (
              <li key={p.id}>
                <ProposalCard
                  proposal={p}
                  proposerName={nameByKey.get(p.proposerKey) ?? null}
                  canCloseOpen={Boolean(currentMember)}
                  canEnact={canEnact}
                  trustedKeys={trustedKeys}
                  proposalVotes={proposalVotes}
                  currentMemberKey={currentMember?.publicKey ?? null}
                  nodeId={nodeId}
                  nameByKey={nameByKey}
                  eligibility={eligibility}
                  contested={contested}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* M2: any member can co-sign a proposed removal /
          reinstatement here — the proposer shows their draft QR and
          this captures it. */}
      {currentMember && (
        <section className="mt-6 card">
          {/* Trust gate only — a short circle doesn't stop co-signing
              (the proposer side already can't mint a submittable
              draft there). CosignRemoval re-checks the gate itself. */}
          {removalGate.kind === "pending_trust" ? (
            <RemovalGateNotice gate={removalGate} />
          ) : !cosigning ? (
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => setCosigning(true)}
            >
              {t("removals.cosignButton")}
            </button>
          ) : (
            <CosignRemoval onDone={() => setCosigning(false)} />
          )}
        </section>
      )}

      {(memberRemovals.length > 0 || memberReinstatements.length > 0) && (
        <section className="mt-6" aria-labelledby="removals-title">
          <h2
            id="removals-title"
            className="mb-1 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
          >
            {t("removals.title")}
          </h2>
          <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
            {t("removals.intro")}
          </p>
          <ul className="flex flex-col gap-2">
            {[
              ...memberRemovals.map((r) => ({
                id: r.id,
                key: r.removedKey,
                reason: r.reason,
                decidedAt: r.decidedAt,
                signatures: r.signatures,
                removal: true,
              })),
              ...memberReinstatements.map((r) => ({
                id: r.id,
                key: r.reinstatedKey,
                reason: r.reason,
                decidedAt: r.decidedAt,
                signatures: r.signatures,
                removal: false,
              })),
            ]
              .sort((a, b) => b.decidedAt - a.decidedAt)
              .map((r) => (
                <li key={r.id} className="card">
                  <p className="text-sm font-medium">
                    {t(r.removal ? "removals.removedLine" : "removals.reinstatedLine", {
                      name: nameByKey.get(r.key) ?? shortKey(r.key),
                      when: formatRelativeTime(r.decidedAt),
                    })}
                  </p>
                  {r.reason && (
                    <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
                      {r.reason}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
                    {t("removals.signedBy", {
                      names: r.signatures
                        .map((sig) => nameByKey.get(sig.signerKey) ?? shortKey(sig.signerKey))
                        .join(", "),
                    })}
                  </p>
                  {/* M3: the door can reopen — start a reinstatement
                      ceremony for a currently-removed member. Same
                      trusted-member gate (and circle-short honesty)
                      as proposing a removal: reinstatement takes the
                      same quorum of trusted signatures. */}
                  {r.removal && removedNow.has(r.key) && currentMember && (
                    removalGate.kind !== "allowed" ? (
                      <div className="mt-2">
                        <RemovalGateNotice gate={removalGate} />
                      </div>
                    ) : reinstating === r.key ? (
                      <div className="mt-2">
                        <RemovalCeremony
                          recordKind="reinstatement"
                          subjectKey={r.key}
                          subjectName={nameByKey.get(r.key) ?? shortKey(r.key)}
                          onCancel={() => setReinstating(null)}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost mt-2 text-xs"
                        onClick={() => setReinstating(r.key)}
                      >
                        {t("removals.reinstateButton")}
                      </button>
                    )
                  )}
                </li>
              ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("proposals.footer")}
      </p>
    </div>
  );
}

function ProposalCard({
  proposal,
  proposerName,
  canCloseOpen,
  canEnact,
  trustedKeys,
  proposalVotes,
  currentMemberKey,
  nodeId,
  nameByKey,
  eligibility,
  contested,
}: {
  proposal: Proposal;
  proposerName: string | null;
  canCloseOpen: boolean;
  /** The viewer may record outcomes (trusted, or no capture). */
  canEnact: boolean;
  /** The founder-rooted trusted set (null = no capture) — feeds the
   *  dual-count tally and the point-of-action vote note. */
  trustedKeys: ReadonlySet<string> | null;
  proposalVotes: readonly Vote[];
  currentMemberKey: string | null;
  nodeId: string;
  nameByKey: Map<string, string>;
  contested: boolean;
  eligibility: AutoCloseEligibility;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [closing, setClosing] = useState<
    "passed" | "rejected" | "withdrawn" | null
  >(null);
  const [reason, setReason] = useState("");
  const { pending, run } = usePendingAction();

  const tally = useMemo(() => tallyVotes(proposalVotes), [proposalVotes]);
  const myChoice = currentMemberKey
    ? currentMemberVote(currentMemberKey, proposalVotes)
    : null;

  const isAdoption = proposal.category === "project_adoption";
  const adoptionPayload = useMemo<ProjectAdoptionPayload | null>(() => {
    if (!isAdoption) return null;
    try {
      return JSON.parse(proposal.payload) as ProjectAdoptionPayload;
    } catch {
      return null;
    }
  }, [isAdoption, proposal.payload]);
  // The sitting primary's one-tap cancel is shown to them on the open
  // card (mirrors the attention-rail action). Reading is untracked, so
  // this is how a returning organizer registers presence here.
  const showImStillHere =
    proposal.status === "open" &&
    adoptionPayload !== null &&
    currentMemberKey === adoptionPayload.sittingPrimaryKey;

  // A "passed" outcome on an adoption proposal must flip the project,
  // not just stamp the row — so both the consensus banner and the manual
  // record-outcome path route through `executeAdoptionProposal`.
  // Governance state and project state can then never diverge. The
  // presence re-check inside may "void" instead, which is a kind outcome,
  // not an error.
  async function executePassed(consensusReason: string) {
    if (isAdoption) {
      const result = await executeAdoptionProposal(
        proposal.id,
        currentMemberKey ?? "",
      );
      showToast(
        result.kind === "voided"
          ? t("adoption.toast.voided")
          : t("adoption.toast.executed"),
      );
      return result;
    }
    return closeProposal(proposal.id, "passed", consensusReason);
  }

  async function handleClose() {
    if (!closing) return;
    try {
      if (closing === "passed") {
        await run(() =>
          executePassed(reason || t("proposals.closedReason.consensus")),
        );
      } else {
        await run(() => closeProposal(proposal.id, closing, reason));
      }
    } catch (err) {
      showToast(humanizeError(err), "error");
    }
    setClosing(null);
    setReason("");
  }

  async function handleConsensusPass() {
    try {
      await run(() => executePassed(t("proposals.closedReason.consensus")));
    } catch (err) {
      showToast(humanizeError(err), "error");
    }
  }

  async function handleImStillHere() {
    if (!currentMemberKey) return;
    try {
      await run(() =>
        withdrawAdoptionAsPresent(proposal.id, currentMemberKey),
      );
      showToast(t("adoption.toast.voided"));
    } catch (err) {
      showToast(humanizeError(err), "error");
    }
  }

  return (
    <article className="card">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusChip status={proposal.status} />
        <ReversibilityChip tier={proposal.reversibilityTier} />
        <CategoryChip category={proposal.category} />
      </div>
      {!proposal.signature && (
        <p className="mb-1 text-xs text-moss-600 dark:text-moss-300">
          {t("proposals.localOnly")}
        </p>
      )}
      {contested && (
        <p className="mb-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {t("proposals.contested")}
        </p>
      )}
      <h2 className="text-lg font-semibold leading-snug">{proposal.title}</h2>
      {proposal.description && (
        <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
          {proposal.description}
        </p>
      )}
      {proposal.status === "open" && (
        <EligibilityBanner eligibility={eligibility} />
      )}
      {proposal.category === "config_change" && (
        <ConfigChangePayload payload={proposal.payload} />
      )}
      {proposal.kind === "dispute" && proposal.disputePostId && (
        <DisputePayloadView
          payload={proposal.payload}
          postId={proposal.disputePostId}
          nameByKey={nameByKey}
        />
      )}
      {adoptionPayload && (
        <ProjectAdoptionPayloadView
          payload={adoptionPayload}
          nameByKey={nameByKey}
        />
      )}
      {proposal.impactReflection && (
        <ImpactReflectionDisplay raw={proposal.impactReflection} />
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("proposals.proposerLabel")}
          </dt>
          <dd className="mt-0.5">
            {proposal.proposerKey === "system_backfill" ? (
              <span className="italic text-moss-600 dark:text-moss-300">
                {t("proposals.backfillProposer")}
              </span>
            ) : (
              <>
                {proposerName ?? t("common.memberFallback")}{" "}
                <span className="font-mono text-xs text-moss-600 dark:text-moss-300">
                  ({shortKey(proposal.proposerKey)})
                </span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("proposals.proposedLabel")}
          </dt>
          <dd className="mt-0.5">{formatRelativeTime(proposal.createdAt)}</dd>
        </div>
        {proposal.closedAt && (
          <>
            <div>
              <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
                {t("proposals.closedLabel")}
              </dt>
              <dd className="mt-0.5">
                {formatRelativeTime(proposal.closedAt)}
              </dd>
            </div>
            {proposal.closedReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("proposals.outcomeReasonLabel")}
                </dt>
                <dd className="mt-0.5 italic text-moss-700 dark:text-moss-200">
                  {proposal.closedReason}
                </dd>
              </div>
            )}
          </>
        )}
      </dl>

      {proposal.status === "open" && (
        <VoteSection
          proposalId={proposal.id}
          tally={tally}
          myChoice={myChoice}
          currentMemberKey={currentMemberKey}
          trustedKeys={trustedKeys}
          nodeId={nodeId}
          nameByKey={nameByKey}
        />
      )}

      {proposal.status === "open" &&
        canCloseOpen &&
        eligibility.kind === "passes" && (
          <div className="mt-4 rounded-xl border border-canopy-200 bg-canopy-50/60 p-3 dark:border-canopy-800 dark:bg-canopy-950/30">
            <p className="mb-2 text-sm font-medium text-canopy-900 dark:text-canopy-100">
              {t("proposals.consensusReached", {
                affirms: tally.affirms.length,
                blocks: tally.blocks.length,
              })}
            </p>
            {/* Enactment is trusted-only (threat-model §7). A pending
                viewer at consensus sees the honest state instead of a
                dead button: nothing is stuck, the close is waiting
                for a vouched hand. */}
            {canEnact ? (
              <button
                type="button"
                className="btn-primary text-sm"
                disabled={pending}
                aria-busy={pending}
                onClick={() => void handleConsensusPass()}
              >
                {pending
                  ? isAdoption
                    ? t("adoption.card.executing")
                    : t("common.working")
                  : isAdoption
                    ? t("adoption.card.execute")
                    : t("proposals.closeAsPassed")}
              </button>
            ) : (
              <p className="text-xs text-canopy-800 dark:text-canopy-200">
                {t("proposals.consensusPendingViewer")}
              </p>
            )}
          </div>
        )}

      {showImStillHere && (
        <div className="mt-4 rounded-xl border border-canopy-200 bg-canopy-50/60 p-3 dark:border-canopy-800 dark:bg-canopy-950/30">
          <p className="mb-2 text-xs text-canopy-900 dark:text-canopy-100">
            {t("adoption.card.imHereHint")}
          </p>
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={pending}
            aria-busy={pending}
            onClick={() => void handleImStillHere()}
          >
            {t("adoption.card.imHere")}
          </button>
        </div>
      )}

      {proposal.status === "open" && canCloseOpen && (
        <div className="mt-4 border-t border-moss-100 pt-3 dark:border-moss-800">
          {/* Recording an outcome is a trusted-member power — the
              shared gate card (no numeric progress: this surface
              shows other members' content) replaces the buttons for
              a pending viewer. The Withdrawn affordance survives for
              the pending PROPOSER only, mirroring the server's one
              exemption exactly. */}
          {!canEnact && closing === null ? (
            <div className="flex flex-col gap-2">
              <TrustGateCard i18nBase="proposals.gate" />
              {currentMemberKey === proposal.proposerKey && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-moss-600 dark:text-moss-300">
                    {t("proposals.gate.withdrawOwnHint")}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => setClosing("withdrawn")}
                  >
                    {t("proposals.outcomeWithdrawn")}
                  </button>
                </div>
              )}
            </div>
          ) : closing === null ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-moss-600 dark:text-moss-300">
                {t("proposals.recordOutcomeHint")}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => setClosing("passed")}
                >
                  {t("proposals.outcomePassed")}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => setClosing("rejected")}
                >
                  {t("proposals.outcomeRejected")}
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setClosing("withdrawn")}
                >
                  {t("proposals.outcomeWithdrawn")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("proposals.outcomeReasonLabel")}
                </span>
                <textarea
                  className="input min-h-16"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder={t("proposals.outcomeReasonPlaceholder")}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => {
                    setClosing(null);
                    setReason("");
                  }}
                  disabled={pending}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={() => void handleClose()}
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending
                    ? t("common.working")
                    : t(`proposals.confirmClose.${closing}`)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function StatusChip({ status }: { status: ProposalStatus }) {
  const { t } = useTranslation();
  const cls =
    status === "open"
      ? "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100"
      : status === "passed"
        ? "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
        : status === "rejected"
          ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
          : "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200";
  return <span className={`chip ${cls}`}>{t(`proposals.status.${status}`)}</span>;
}

function ReversibilityChip({
  tier,
}: {
  tier: "easy" | "moderate" | "hard";
}) {
  const { t } = useTranslation();
  const cls =
    tier === "easy"
      ? "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
      : tier === "moderate"
        ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100";
  return (
    <span
      className={`chip ${cls}`}
      title={t(`proposals.reversibility.${tier}Tooltip`)}
    >
      {t(`proposals.reversibility.${tier}`)}
    </span>
  );
}

function CategoryChip({
  category,
}: {
  category: Proposal["category"];
}) {
  const { t } = useTranslation();
  const cls =
    category === "dispute"
      ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
      : "bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100";
  return (
    <span className={`chip ${cls}`}>
      {t(`proposals.category.${category}`)}
    </span>
  );
}

function EligibilityBanner({
  eligibility,
}: {
  eligibility: AutoCloseEligibility;
}) {
  const { t } = useTranslation();
  if (eligibility.kind === "not_open" || eligibility.kind === "passes") {
    // "passes" disappears as soon as the auto-close effect runs;
    // showing it would just blink before the status flips.
    return null;
  }
  const cls =
    eligibility.kind === "blocked"
      ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100"
      : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100";
  let message: string;
  if (eligibility.kind === "blocked") {
    message = t("proposals.eligibility.blocked", {
      count: eligibility.blockCount,
    });
  } else if (eligibility.kind === "wait_deliberation") {
    message = t("proposals.eligibility.waitDeliberation", {
      when: formatRelativeTime(eligibility.readyAt),
    });
  } else if (eligibility.notYetCounted > 0) {
    // The honest dual-count state: affirms exist that don't count
    // yet because their voters aren't fully vouched.
    message = t("proposals.eligibility.waitAffirmsPending", {
      have: eligibility.have,
      need: eligibility.need,
      pending: eligibility.notYetCounted,
    });
  } else {
    message = t("proposals.eligibility.waitAffirms", {
      have: eligibility.have,
      need: eligibility.need,
    });
  }
  return (
    <div
      className={`mt-3 rounded-lg border px-3 py-2 text-xs ${cls}`}
      role="status"
    >
      {message}
    </div>
  );
}

function VoteSection({
  proposalId,
  tally,
  myChoice,
  currentMemberKey,
  trustedKeys,
  nodeId,
  nameByKey,
}: {
  proposalId: string;
  tally: Tally;
  myChoice: VoteChoice | null;
  currentMemberKey: string | null;
  trustedKeys: ReadonlySet<string> | null;
  nodeId: string;
  nameByKey: Map<string, string>;
}) {
  const { t } = useTranslation();
  const [pendingBlock, setPendingBlock] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const { pending, run } = usePendingAction();

  async function vote(choice: VoteChoice, reason: string | null = null) {
    if (!currentMemberKey) return;
    await run(() =>
      castVote({
        proposalId,
        voterKey: currentMemberKey,
        choice,
        reason,
        nodeId,
      }),
    );
    setPendingBlock(false);
    setBlockReason("");
  }

  return (
    <div className="mt-4 border-t border-moss-100 pt-3 dark:border-moss-800">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t(
          tally.totalVoters === 0
            ? "proposals.vote.headingNone"
            : tally.totalVoters === 1
              ? "proposals.vote.headingOne"
              : "proposals.vote.headingOther",
          { count: tally.totalVoters },
        )}
      </h3>

      <TallyDisplay
        tally={tally}
        trustedKeys={trustedKeys}
        nameByKey={nameByKey}
      />

      {/* Point-of-action honesty for a pending-trust voter: the vote
          is recorded and visible now; the affirm counts once they're
          vouched; a block always counts. */}
      {currentMemberKey &&
        trustedKeys !== null &&
        !trustedKeys.has(currentMemberKey) && (
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("proposals.vote.pendingAffirmNote")}
          </p>
        )}

      {currentMemberKey && (
        <div className="mt-3 flex flex-col gap-2">
          {pendingBlock ? (
            <div className="flex flex-col gap-2 rounded-lg bg-rose-50 p-2 dark:bg-rose-950/40">
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-rose-900 dark:text-rose-100">
                  {t("proposals.vote.blockReasonLabel")}
                </span>
                <textarea
                  className="input min-h-16"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  maxLength={500}
                  placeholder={t("proposals.vote.blockReasonPlaceholder")}
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => {
                    setPendingBlock(false);
                    setBlockReason("");
                  }}
                  disabled={pending}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={() => void vote("block", blockReason)}
                  disabled={pending}
                  aria-busy={pending}
                >
                  {pending
                    ? t("common.working")
                    : t("proposals.vote.confirmBlock")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-moss-600 dark:text-moss-300">
                {myChoice
                  ? t("proposals.vote.changeChoice", {
                      choice: t(`proposals.vote.choice.${myChoice}`),
                    })
                  : t("proposals.vote.castPrompt")}
              </span>
              <VoteButton
                label={t("proposals.vote.affirm")}
                onClick={() => void vote("affirm")}
                active={myChoice === "affirm"}
                disabled={pending}
                tone="affirm"
              />
              <VoteButton
                label={t("proposals.vote.block")}
                onClick={() => setPendingBlock(true)}
                active={myChoice === "block"}
                disabled={pending}
                tone="block"
              />
              <VoteButton
                label={t("proposals.vote.abstain")}
                onClick={() => void vote("abstain")}
                active={myChoice === "abstain"}
                disabled={pending}
                tone="neutral"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TallyDisplay({
  tally,
  trustedKeys,
  nameByKey,
}: {
  tally: Tally;
  trustedKeys: ReadonlySet<string> | null;
  nameByKey: Map<string, string>;
}) {
  const { t } = useTranslation();
  const renderNames = (entries: readonly { voterKey: string }[]) =>
    entries
      .map((e) => nameByKey.get(e.voterKey) ?? t("common.memberFallback"))
      .join(", ");
  // Dual count (threat-model §7): when some affirms don't count yet
  // (voter not fully vouched), the tally says so instead of showing
  // a number that consensus math will disagree with. The contested
  // chip stays BLOCK-based only — this line is the honesty surface
  // for trust lag, and it never names who is pending.
  const countedAffirms = trustedKeys
    ? tally.affirms.filter((a) => trustedKeys.has(a.voterKey)).length
    : tally.affirms.length;
  return (
    <div className="flex flex-col gap-1 text-xs text-moss-700 dark:text-moss-200">
      <div>
        <span className="font-semibold">
          {countedAffirms < tally.affirms.length
            ? t("proposals.vote.tally.affirmsCounted", {
                counted: countedAffirms,
                total: tally.affirms.length,
              })
            : t("proposals.vote.tally.affirms", {
                count: tally.affirms.length,
              })}
        </span>
        {tally.affirms.length > 0 && (
          <span className="ml-1 text-moss-600 dark:text-moss-300">
            ({renderNames(tally.affirms)})
          </span>
        )}
      </div>
      <div>
        <span className="font-semibold text-rose-800 dark:text-rose-200">
          {t("proposals.vote.tally.blocks", { count: tally.blocks.length })}
        </span>
        {tally.blocks.length > 0 && (
          <span className="ml-1 text-moss-600 dark:text-moss-300">
            ({renderNames(tally.blocks)})
          </span>
        )}
      </div>
      {tally.blocks
        .filter((b) => b.reason)
        .map((b) => (
          <blockquote
            key={b.voterKey}
            className="ml-3 border-l-2 border-rose-300 pl-2 italic text-rose-800 dark:border-rose-700 dark:text-rose-200"
          >
            {nameByKey.get(b.voterKey) ?? t("common.memberFallback")}:{" "}
            {b.reason}
          </blockquote>
        ))}
      <div>
        <span className="font-semibold">
          {t("proposals.vote.tally.abstains", {
            count: tally.abstains.length,
          })}
        </span>
        {tally.abstains.length > 0 && (
          <span className="ml-1 text-moss-600 dark:text-moss-300">
            ({renderNames(tally.abstains)})
          </span>
        )}
      </div>
    </div>
  );
}

function VoteButton({
  label,
  onClick,
  active,
  disabled,
  tone,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  disabled: boolean;
  tone: "affirm" | "block" | "neutral";
}) {
  const base = "rounded-full px-3 py-1 text-xs font-semibold transition-colors";
  const activeCls =
    tone === "affirm"
      ? "bg-canopy-700 text-canopy-50 dark:bg-canopy-600"
      : tone === "block"
        ? "bg-rose-700 text-rose-50 dark:bg-rose-800"
        : "bg-moss-700 text-moss-50";
  const inactiveCls =
    tone === "affirm"
      ? "bg-canopy-50 text-canopy-800 hover:bg-canopy-100 dark:bg-canopy-950/40 dark:text-canopy-100"
      : tone === "block"
        ? "bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-100"
        : "bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`${base} ${active ? activeCls : inactiveCls} disabled:opacity-50`}
    >
      {label}
    </button>
  );
}

function ConfigChangePayload({ payload }: { payload: string }) {
  const { t } = useTranslation();
  let parsed: Record<string, number> | null = null;
  try {
    parsed = JSON.parse(payload) as Record<string, number>;
  } catch {
    return null;
  }
  const entries = Object.entries(parsed);
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 rounded-xl bg-moss-50 px-3 py-2 text-xs dark:bg-moss-900/50">
      <div className="mb-1 font-semibold text-moss-700 dark:text-moss-200">
        {t("proposals.payloadHeader")}
      </div>
      <ul className="flex flex-col gap-0.5 font-mono">
        {entries.map(([k, v]) => (
          <li key={k}>
            <span className="text-moss-600 dark:text-moss-300">{k}:</span>{" "}
            <span className="text-moss-900 dark:text-moss-100">{String(v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectAdoptionPayloadView({
  payload,
  nameByKey,
}: {
  payload: ProjectAdoptionPayload;
  nameByKey: Map<string, string>;
}) {
  const { t } = useTranslation();
  const stewardName =
    nameByKey.get(payload.proposedPrimaryKey) ?? t("common.memberFallback");
  return (
    <div className="mt-3 rounded-xl border border-canopy-200 bg-canopy-50/50 px-3 py-2 text-xs dark:border-canopy-900 dark:bg-canopy-950/20">
      <p className="font-semibold text-canopy-900 dark:text-canopy-100">
        {t("adoption.card.proposedSteward", { name: stewardName })}
      </p>
      {payload.lastOrganizerActivityAt !== null && (
        <p className="mt-1 text-canopy-800 dark:text-canopy-200">
          {t("adoption.card.quietSince", {
            when: formatRelativeTime(payload.lastOrganizerActivityAt),
          })}
        </p>
      )}
      <Link
        to={`/project/${payload.projectId}`}
        className="mt-1 inline-block text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
      >
        {payload.projectTitle}
      </Link>
      {/* The reassurance that this carries no penalty if the organizer
          returns — the cancel is "I'm still here," never "justify your
          absence." */}
      <p className="mt-2 italic text-canopy-700 dark:text-canopy-300">
        {t("adoption.card.voidNote")}
      </p>
    </div>
  );
}

function DisputePayloadView({
  payload,
  postId,
  nameByKey,
}: {
  payload: string;
  postId: string;
  nameByKey: Map<string, string>;
}) {
  const { t } = useTranslation();
  let parsed: DisputePayload | null = null;
  try {
    parsed = JSON.parse(payload) as DisputePayload;
  } catch {
    return null;
  }
  const helperName = parsed.helperKey
    ? (nameByKey.get(parsed.helperKey) ?? t("common.memberFallback"))
    : t("common.memberFallback");
  const recipientName =
    nameByKey.get(parsed.recipientKey) ?? t("common.memberFallback");
  return (
    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2 text-xs dark:border-rose-900 dark:bg-rose-950/20">
      <div className="mb-1 flex flex-wrap items-center gap-2 text-rose-900 dark:text-rose-100">
        <span className="font-semibold">
          {parsed.postType === "NEED"
            ? t("disputes.typeNeed")
            : parsed.postType === "direct"
              ? t("disputes.typeDirect")
              : t("disputes.typeOffer")}
        </span>
        <span>·</span>
        <span>{formatHours(parsed.hours)}</span>
        {/* No post page exists behind a direct exchange. */}
        {parsed.postType !== "direct" && (
          <>
            <span>·</span>
            <Link
              to={`/post/${postId}`}
              className="underline-offset-2 hover:underline"
            >
              {t("disputes.viewPost")}
            </Link>
          </>
        )}
      </div>
      <div className="text-rose-800 dark:text-rose-200">
        {t("disputes.helperLabel")}:{" "}
        {parsed.helperKey
          ? `${helperName} (${shortKey(parsed.helperKey)})`
          : t("common.memberFallback")}
        {" — "}
        {t("disputes.recipientLabel")}: {`${recipientName} (${shortKey(parsed.recipientKey)})`}
      </div>
    </div>
  );
}

function ImpactReflectionDisplay({ raw }: { raw: string }) {
  const { t } = useTranslation();
  let parsed: ImpactReflection | null = null;
  try {
    parsed = JSON.parse(raw) as ImpactReflection;
  } catch {
    return null;
  }
  const fields: Array<{ key: keyof ImpactReflection; labelKey: string }> = [
    { key: "yearOne", labelKey: "proposals.impact.yearOne" },
    { key: "fiveYear", labelKey: "proposals.impact.fiveYear" },
    { key: "reversalPath", labelKey: "proposals.impact.reversalPath" },
    {
      key: "vulnerableImpact",
      labelKey: "proposals.impact.vulnerableImpact",
    },
  ];
  const filled = fields.filter((f) => parsed![f.key]?.trim().length > 0);
  if (filled.length === 0) return null;
  return (
    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 p-3 text-xs dark:border-rose-900 dark:bg-rose-950/20">
      <div className="mb-2 font-semibold text-rose-900 dark:text-rose-100">
        {t("proposals.impact.heading")}
      </div>
      <dl className="space-y-2">
        {filled.map((f) => (
          <div key={f.key}>
            <dt className="text-xs uppercase tracking-wide text-rose-700 dark:text-rose-300">
              {t(f.labelKey)}
            </dt>
            <dd className="mt-0.5 text-rose-900 dark:text-rose-100">
              {parsed![f.key]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
