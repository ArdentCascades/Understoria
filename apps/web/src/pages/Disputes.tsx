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
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  formatHours,
  formatRelativeTime,
  shortKey,
} from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import type {
  CommentDisputePayload,
  DisputePayload,
  Proposal,
} from "@/types";

// Agent 13 + 14 unified Decisions surface: disputes are now
// stored as Proposal rows with `kind: "dispute"`. This page keeps
// the same URL (`/disputes`) and the same card layout for
// continuity, but reads from `proposals` instead of mapping
// dispute state on `posts`. The post-level
// `status === "disputed"` field stays — it's still the source of
// truth for the exchange lifecycle.
//
// Once we have a single Decisions URL that handles both kinds via
// a filter, this page can redirect there. For now it's the
// dispute-only slice.

export default function DisputesPage() {
  const { proposals, governanceHiddenKeys } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // PR F: dispute proposals authored by a member with the per-block
  // `hideGovernance: true` flag are filtered out for this blocker.
  // System default (hideGovernance: false) leaves them visible —
  // see docs/blocking.md §6 row "Dispute / Proposal comments" +
  // §11.10. When the opt-in set is empty, the dispute list is
  // unchanged (load-bearing no-silent-disenfranchisement invariant).
  const disputes = useMemo(
    () =>
      proposals
        .filter((p) => p.kind === "dispute")
        .filter((p) => !governanceHiddenKeys.has(p.proposerKey))
        .sort((a, b) => b.createdAt - a.createdAt),
    [proposals, governanceHiddenKeys],
  );

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-6">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <h1 className="page-title mt-2">
          {t("disputes.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("disputes.subtitle")}
        </p>
      </header>

      {disputes.length === 0 ? (
        <EmptyState
          illustration="basket"
          title={t("disputes.emptyTitle")}
          message={t("disputes.empty")}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {disputes.map((d) => (
            // id={d.id} enables the operational pointer on PostDetail
            // (ExchangeStateNarrative's `disputed` branch) to deep-link
            // straight to this dispute's card via /disputes#{id}.
            // Cheap, no router change needed — the browser handles the
            // anchor scroll on navigation.
            <li key={d.id} id={d.id} className="scroll-mt-20">
              <DisputeCard proposal={d} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("disputes.footer")}
      </p>
    </div>
  );
}

function DisputeCard({ proposal }: { proposal: Proposal }) {
  const { members } = useApp();
  const nameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  // Parse once, then discriminate on subjectType. Comment-flag
  // payloads carry subjectType="task_comment"; legacy exchange-flag
  // payloads have no subjectType field at all (they pre-date the
  // discriminator). Either kind dispatches to its own renderer.
  let parsed: { subjectType?: string } | null = null;
  try {
    parsed = JSON.parse(proposal.payload) as { subjectType?: string };
  } catch {
    parsed = null;
  }
  if (!parsed) return null;

  if (parsed.subjectType === "task_comment") {
    return (
      <CommentDisputeCard
        proposal={proposal}
        payload={parsed as unknown as CommentDisputePayload}
        nameByKey={nameByKey}
      />
    );
  }
  return (
    <ExchangeDisputeCard
      proposal={proposal}
      payload={parsed as unknown as DisputePayload}
      nameByKey={nameByKey}
    />
  );
}

function ExchangeDisputeCard({
  proposal,
  payload,
  nameByKey,
}: {
  proposal: Proposal;
  payload: DisputePayload;
  nameByKey: Map<string, string>;
}) {
  const { t } = useTranslation();

  const helperName = payload.helperKey
    ? (nameByKey.get(payload.helperKey) ?? null)
    : null;
  const recipientName =
    nameByKey.get(payload.recipientKey) ?? null;
  return (
    <article className="card">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="chip bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
          {t("disputes.flagChip")}
        </span>
        <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
          {payload.postType === "NEED"
            ? t("disputes.typeNeed")
            : t("disputes.typeOffer")}
        </span>
        <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
          {formatHours(payload.hours)}
        </span>
      </div>
      <h2 className="text-lg font-semibold leading-snug">
        {payload.postTitle}
      </h2>
      {proposal.description && (
        <blockquote className="mt-3 border-l-4 border-rose-300 bg-rose-50 px-3 py-2 text-sm italic text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100">
          {proposal.description}
        </blockquote>
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("disputes.helperLabel")}
          </dt>
          <dd className="mt-0.5">
            {helperName && payload.helperKey
              ? `${helperName} (${shortKey(payload.helperKey)})`
              : t("common.memberFallback")}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("disputes.recipientLabel")}
          </dt>
          <dd className="mt-0.5">
            {recipientName
              ? `${recipientName} (${shortKey(payload.recipientKey)})`
              : t("common.memberFallback")}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("disputes.postedLabel")}
          </dt>
          <dd className="mt-0.5">
            {formatRelativeTime(payload.postCreatedAt)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex justify-end gap-2">
        {proposal.disputePostId && (
          <Link
            to={`/post/${proposal.disputePostId}`}
            className="btn-secondary text-sm"
          >
            {t("disputes.viewPost")}
          </Link>
        )}
        <Link to="/proposals" className="btn-primary text-sm">
          {t("disputes.openInDecisions")}
        </Link>
      </div>
    </article>
  );
}

function CommentDisputeCard({
  proposal,
  payload,
  nameByKey,
}: {
  proposal: Proposal;
  payload: CommentDisputePayload;
  nameByKey: Map<string, string>;
}) {
  const { t } = useTranslation();
  const authorName = nameByKey.get(payload.authorKey) ?? null;
  return (
    <article className="card">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="chip bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
          {t("disputes.flagChip")}
        </span>
        <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
          {t("disputes.commentSubjectChip")}
        </span>
      </div>
      <h2 className="text-lg font-semibold leading-snug">
        {t("disputes.commentTitle")}
      </h2>
      <blockquote className="mt-3 border-l-4 border-bark-300 bg-bark-50 px-3 py-2 text-sm italic text-bark-800 dark:border-moss-700 dark:bg-moss-900/40 dark:text-moss-100">
        {payload.body}
      </blockquote>
      {proposal.description && (
        <blockquote className="mt-3 border-l-4 border-rose-300 bg-rose-50 px-3 py-2 text-sm italic text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100">
          {proposal.description}
        </blockquote>
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("disputes.commentAuthorLabel")}
          </dt>
          <dd className="mt-0.5">
            {authorName
              ? `${authorName} (${shortKey(payload.authorKey)})`
              : t("common.memberFallback")}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("disputes.postedLabel")}
          </dt>
          <dd className="mt-0.5">
            {formatRelativeTime(payload.createdAt)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex justify-end gap-2">
        <Link
          to={`/project/${payload.projectId}`}
          className="btn-secondary text-sm"
        >
          {t("disputes.viewTask")}
        </Link>
        <Link to="/proposals" className="btn-primary text-sm">
          {t("disputes.openInDecisions")}
        </Link>
      </div>
    </article>
  );
}
