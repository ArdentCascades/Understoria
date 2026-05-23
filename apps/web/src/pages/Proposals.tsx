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
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { formatRelativeTime, shortKey } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { closeProposal } from "@/db/proposals";
import { usePendingAction } from "@/lib/usePendingAction";
import type { Proposal, ProposalStatus } from "@/types";

// Agent 13 task 1 — Decisions surface (proposals only for v1; the
// dispute table will fold in here once the resolution lifecycle
// design has settled per docs/roadmap.md).
//
// View-only browsing + a simple "record outcome" affordance. No
// voting yet; the community still reaches decisions out-of-band
// (their usual call / thread / doc) and any member can record the
// outcome here so the proposal closes and the historical record
// reflects reality.

const STATUS_FILTERS: Array<ProposalStatus | "all"> = [
  "open",
  "all",
  "passed",
  "rejected",
  "withdrawn",
];

export default function ProposalsPage() {
  const { proposals, members, currentMember } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProposalStatus | "all">("open");

  const filtered = useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [proposals, filter]);

  const nameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {t("proposals.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("proposals.subtitle")}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
          icon={"\u{1F33F}"}
          message={t(
            filter === "open"
              ? "proposals.emptyOpen"
              : "proposals.emptyFiltered",
          )}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProposalCard
                proposal={p}
                proposerName={nameByKey.get(p.proposerKey) ?? null}
                canCloseOpen={Boolean(currentMember)}
              />
            </li>
          ))}
        </ul>
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
}: {
  proposal: Proposal;
  proposerName: string | null;
  canCloseOpen: boolean;
}) {
  const { t } = useTranslation();
  const [closing, setClosing] = useState<
    "passed" | "rejected" | "withdrawn" | null
  >(null);
  const [reason, setReason] = useState("");
  const { pending, run } = usePendingAction();

  async function handleClose() {
    if (!closing) return;
    await run(() => closeProposal(proposal.id, closing, reason));
    setClosing(null);
    setReason("");
  }

  return (
    <article className="card">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusChip status={proposal.status} />
        <ReversibilityChip tier={proposal.reversibilityTier} />
        <CategoryChip category={proposal.category} />
      </div>
      <h2 className="text-lg font-semibold leading-snug">{proposal.title}</h2>
      {proposal.description && (
        <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
          {proposal.description}
        </p>
      )}
      {proposal.category === "config_change" && (
        <ConfigChangePayload payload={proposal.payload} />
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500">
            {t("proposals.proposerLabel")}
          </dt>
          <dd className="mt-0.5">
            {proposerName ?? t("common.memberFallback")}{" "}
            <span className="font-mono text-xs text-moss-500">
              ({shortKey(proposal.proposerKey)})
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-moss-500">
            {t("proposals.proposedLabel")}
          </dt>
          <dd className="mt-0.5">{formatRelativeTime(proposal.createdAt)}</dd>
        </div>
        {proposal.closedAt && (
          <>
            <div>
              <dt className="text-xs uppercase tracking-wide text-moss-500">
                {t("proposals.closedLabel")}
              </dt>
              <dd className="mt-0.5">
                {formatRelativeTime(proposal.closedAt)}
              </dd>
            </div>
            {proposal.closedReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-moss-500">
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

      {proposal.status === "open" && canCloseOpen && (
        <div className="mt-4 border-t border-moss-100 pt-3 dark:border-moss-800">
          {closing === null ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-moss-500 dark:text-moss-400">
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

function CategoryChip({ category }: { category: "config_change" }) {
  const { t } = useTranslation();
  return (
    <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
      {t(`proposals.category.${category}`)}
    </span>
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
            <span className="text-moss-600 dark:text-moss-400">{k}:</span>{" "}
            <span className="text-moss-900 dark:text-moss-100">{String(v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
