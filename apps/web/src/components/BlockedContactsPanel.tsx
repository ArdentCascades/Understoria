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
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { WhyTooltip } from "@/components/WhyTooltip";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UnblockConfirmDialog } from "@/components/UnblockConfirmDialog";
import {
  clearPreviouslyBlocked,
  listBlocks,
  listPreviouslyBlocked,
  NEVER_UNBLOCKED,
  updateBlockScope,
} from "@/db/blocks";
import {
  formatAbsoluteDate,
  formatRelativeTime,
  shortKey,
} from "@/lib/format";
import type { BlockRow, PreviouslyBlockedRow } from "@/types";

/**
 * Settings → Blocked contacts panel. Two subsections (active +
 * history) per design doc §13 PR E, with the tap-to-reveal posture
 * from §6 "Block-list rendering" — every row obscured by default,
 * a generic-avatar SVG + the literal copy "Blocked contact" + the
 * date.
 *
 * Reveal state is per-row + ephemeral (component state, never
 * persisted). Tapping again re-obscures. This is privacy-from-over-
 * the-shoulder, NOT a security boundary — the data is in Dexie,
 * accessible to any code with storage access (named explicitly in
 * design doc §6.2).
 *
 * No federation, no outbox. Every action calls a db/blocks helper
 * which is a pure local Dexie write.
 */
export function BlockedContactsPanel() {
  const { t } = useTranslation();
  const { currentMember, members } = useApp();
  const { showToast } = useToast();
  const blockerKey = currentMember?.publicKey;

  const blocks = useLiveQuery(
    async () => (blockerKey ? await listBlocks(blockerKey) : []),
    [blockerKey],
    [] as BlockRow[],
  );
  const history = useLiveQuery(
    async () =>
      blockerKey ? await listPreviouslyBlocked(blockerKey) : [],
    [blockerKey],
    [] as PreviouslyBlockedRow[],
  );

  // Filter out history rows for currently-blocked pairs — those are
  // surfaced in the Active subsection. NEVER_UNBLOCKED is the
  // sentinel from PR C meaning "this pair has been blocked but never
  // yet unblocked," which the doc says belongs in Active, not
  // history.
  const filteredHistory = useMemo(
    () => history.filter((r) => r.lastUnblockedAt !== NEVER_UNBLOCKED),
    [history],
  );

  // Resolve a pubkey to a display name from the local members
  // table. Falls back to a truncated pubkey when the member isn't
  // known on this node (the cross-node case — blocking a member you
  // met through federation but never saw a Member row for locally).
  const displayNameFor = useMemo(() => {
    const byKey = new Map(members.map((m) => [m.publicKey, m.displayName]));
    return (pubkey: string) => byKey.get(pubkey) ?? shortKey(pubkey);
  }, [members]);

  const [revealedRows, setRevealedRows] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [unblockTarget, setUnblockTarget] = useState<{
    blockedKey: string;
    displayName: string;
  } | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  function toggleReveal(id: string) {
    setRevealedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleToggleHideGovernance(row: BlockRow, next: boolean) {
    try {
      await updateBlockScope({
        blockerKey: row.blockerKey,
        blockedKey: row.blockedKey,
        hideGovernance: next,
        note: row.note,
      });
    } catch {
      showToast(t("block.confirm.errorGeneric"), "error");
    }
  }

  async function handleClearHistory() {
    if (!blockerKey) return;
    try {
      await clearPreviouslyBlocked(blockerKey);
      showToast(t("block.settings.clearHistorySuccess"), "success");
      setClearOpen(false);
    } catch {
      showToast(t("block.confirm.errorGeneric"), "error");
    }
  }

  if (!currentMember) return null;

  return (
    <section
      className="card mb-4"
      aria-labelledby="blocked-contacts-section-title"
    >
      <div className="flex items-baseline gap-1.5">
        <h2
          id="blocked-contacts-section-title"
          className="text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300"
        >
          {t("block.settings.sectionTitle")}
        </h2>
        <WhyTooltip principleId="privacy-precondition" />
      </div>
      <p className="mt-2 mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("block.settings.sectionIntro")}
      </p>

      {/* Active blocks */}
      <h3 className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
        {t("block.settings.activeHeading")}
      </h3>
      {blocks.length === 0 ? (
        <p className="text-sm text-moss-500 dark:text-moss-300">
          {t("block.settings.activeEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {blocks.map((row) => {
            const revealed = revealedRows.has(row.id);
            const displayName = displayNameFor(row.blockedKey);
            return (
              <li
                key={row.id}
                className="rounded-lg bg-moss-50/60 px-3 py-2 dark:bg-moss-900/30"
              >
                <button
                  type="button"
                  onClick={() => toggleReveal(row.id)}
                  aria-expanded={revealed}
                  aria-label={
                    revealed
                      ? t("block.settings.collapse")
                      : t("block.settings.tapToReveal")
                  }
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-1 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:hover:bg-moss-900/60"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-moss-200 text-xs font-semibold text-moss-700 dark:bg-moss-800 dark:text-moss-200"
                  >
                    ?
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium">
                      {revealed
                        ? displayName
                        : t("block.settings.obscuredRowLabel")}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("block.settings.blockedAtLabel", {
                        date: formatAbsoluteDate(row.createdAt),
                      })}
                      {revealed && (
                        <>
                          {" · "}
                          {t("block.settings.pubkeyLabel", {
                            shortKey: shortKey(row.blockedKey),
                          })}
                        </>
                      )}
                    </span>
                  </span>
                  <span aria-hidden="true" className="ml-auto text-moss-400 dark:text-moss-300">
                    {revealed ? "▲" : "▼"}
                  </span>
                </button>
                {revealed && (
                  <div className="mt-2 flex flex-col gap-2 px-1">
                    <label className="flex min-h-[44px] items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={row.hideGovernance}
                        onChange={(e) =>
                          void handleToggleHideGovernance(
                            row,
                            e.target.checked,
                          )
                        }
                        className="min-h-[20px] min-w-[20px]"
                      />
                      <span>
                        {t("block.settings.hideGovernanceToggle")}
                        <WhyTooltip principleId="community-authority" />
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn-secondary min-h-[44px] self-start"
                      onClick={() =>
                        setUnblockTarget({
                          blockedKey: row.blockedKey,
                          displayName,
                        })
                      }
                    >
                      {t("block.settings.unblockButton")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Previously blocked */}
      <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
        {t("block.settings.historyHeading")}
      </h3>
      {filteredHistory.length === 0 ? (
        <p className="text-sm text-moss-500 dark:text-moss-300">
          {t("block.settings.historyEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {filteredHistory.map((row) => {
            const revealed = revealedRows.has(row.id);
            const displayName = displayNameFor(row.blockedKey);
            return (
              <li
                key={row.id}
                className="rounded-lg bg-moss-50/60 px-3 py-2 dark:bg-moss-900/30"
              >
                <button
                  type="button"
                  onClick={() => toggleReveal(row.id)}
                  aria-expanded={revealed}
                  aria-label={
                    revealed
                      ? t("block.settings.collapse")
                      : t("block.settings.tapToReveal")
                  }
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-1 transition-colors hover:bg-moss-50 focus-visible:bg-moss-50 dark:hover:bg-moss-900/60"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-moss-200 text-xs font-semibold text-moss-700 dark:bg-moss-800 dark:text-moss-200"
                  >
                    ?
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium">
                      {revealed
                        ? displayName
                        : t("block.settings.obscuredRowLabel")}
                    </span>
                    <span className="block text-xs text-moss-500 dark:text-moss-300">
                      {t("block.settings.unblockedAtLabel", {
                        when: formatRelativeTime(row.lastUnblockedAt),
                      })}
                      {revealed && (
                        <>
                          {" · "}
                          {t("block.settings.firstBlockedAtLabel", {
                            when: formatRelativeTime(row.firstBlockedAt),
                          })}
                          {" · "}
                          {t("block.settings.pubkeyLabel", {
                            shortKey: shortKey(row.blockedKey),
                          })}
                        </>
                      )}
                    </span>
                  </span>
                  <span aria-hidden="true" className="ml-auto text-moss-400 dark:text-moss-300">
                    {revealed ? "▲" : "▼"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {filteredHistory.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            className="btn-ghost min-h-[44px] w-full text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
            onClick={() => setClearOpen(true)}
          >
            {t("block.settings.clearHistoryButton")}
          </button>
        </div>
      )}

      {/* Cross-device fine print — design doc §14.1 gap named not
          papered over. */}
      <p className="mt-5 text-xs text-moss-500 dark:text-moss-300">
        {t("block.settings.crossDeviceWarning")}
      </p>

      {/* Unblock confirm */}
      {unblockTarget && (
        <UnblockConfirmDialog
          open={true}
          blockedKey={unblockTarget.blockedKey}
          blockedDisplayName={unblockTarget.displayName}
          onClose={() => setUnblockTarget(null)}
          onUnblocked={() => {
            // No-op; the live query refreshes the list.
          }}
        />
      )}

      {/* Clear history confirm */}
      <ConfirmDialog
        open={clearOpen}
        title={t("block.settings.clearHistoryConfirmTitle")}
        description={t("block.settings.clearHistoryConfirmBody")}
        confirmLabel={t("block.settings.clearHistoryConfirmButton")}
        cancelLabel={t("block.confirm.cancel")}
        tone="caution"
        onConfirm={() => handleClearHistory()}
        onCancel={() => setClearOpen(false)}
      />
    </section>
  );
}
