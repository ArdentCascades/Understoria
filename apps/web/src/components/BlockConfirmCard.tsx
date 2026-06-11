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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { WhyTooltip } from "@/components/WhyTooltip";
import {
  BLOCK_NOTE_MAX_LENGTH,
  BlockActionError,
  blockMember,
} from "@/db/blocks";

export interface BlockConfirmCardProps {
  open: boolean;
  blockedKey: string;
  blockedDisplayName: string;
  onClose: () => void;
  onBlocked?: () => void;
}

/**
 * Comparison-card modal for member blocking — the "name the
 * consequences before signing" UX (mirrors the co-organizer accept
 * card in `AttentionSection.tsx` and the device-pairing comparison
 * card). Two render states, gated on a `hideGovernance` toggle the
 * blocker flips BEFORE confirming:
 *
 *   - default (`hideGovernance: false`): the body lists what the
 *     block does + does not commit to per design doc §3.1.
 *   - opt-in (`hideGovernance: true`):  the "What this means" list
 *     gets one additional row covering the governance-visibility
 *     consequence per design doc §3.2.
 *
 * Block is rose-themed because it's a personal-safety action — same
 * caution tone as the destructive paths in ConfirmDialog. The
 * surface is NOT obscured here: when the blocker is actively
 * choosing whom to block, they have explicitly chosen the target —
 * the obscured-by-default pattern in Settings is for incidental
 * exposure, not for the explicit confirm path (see design doc §6
 * "Block-list rendering" note).
 */
export function BlockConfirmCard({
  open,
  blockedKey,
  blockedDisplayName,
  onClose,
  onBlocked,
}: BlockConfirmCardProps) {
  const { t } = useTranslation();
  const { currentMember } = useApp();
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hideGovernance, setHideGovernance] = useState(false);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusTrap(cardRef, open);

  // Reset internal state every time the dialog opens so a previous
  // session's draft note / toggle doesn't leak into a fresh block.
  useEffect(() => {
    if (open) {
      setHideGovernance(false);
      setNote("");
      setError(null);
      setPending(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pending]);

  if (!open) return null;

  async function handleConfirm() {
    if (!currentMember) return;
    setPending(true);
    setError(null);
    try {
      await blockMember({
        blockerKey: currentMember.publicKey,
        blockedKey,
        hideGovernance,
        note: note.trim().length > 0 ? note.trim() : null,
      });
      showToast(t("block.confirm.success"), "success");
      onBlocked?.();
      onClose();
    } catch (err) {
      if (err instanceof BlockActionError) {
        if (err.code === "self_block") {
          setError(t("block.error.cannotBlockSelf"));
        } else if (err.code === "note_too_long") {
          setError(t("block.error.noteTooLong"));
        } else {
          setError(t("block.confirm.errorGeneric"));
        }
      } else {
        setError(t("block.confirm.errorGeneric"));
      }
    } finally {
      setPending(false);
    }
  }

  const title = hideGovernance
    ? t("block.confirm.titleWithGovernance")
    : t("block.confirm.titleDefault");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-confirm-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-moss-950/40 p-4 sm:items-center"
    >
      <div
        ref={cardRef}
        className="card w-full max-w-md animate-fade-in overflow-y-auto"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-baseline gap-1.5">
          <h2
            id="block-confirm-title"
            className="text-lg font-semibold text-rose-800 dark:text-rose-200"
          >
            {title}
          </h2>
          <WhyTooltip principleId="privacy-precondition" />
        </div>
        <p className="mt-1 text-xs text-moss-500 dark:text-moss-300">
          {blockedDisplayName}
        </p>

        {/* What this means */}
        <section className="mt-4 rounded-lg border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/50 dark:bg-rose-950/30">
          <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-100">
            {t("block.confirm.commitsHeading")}
          </h3>
          <ul className="mt-1.5 list-disc pl-5 text-xs leading-snug text-moss-700 dark:text-moss-200">
            <li>
              {t("block.confirm.commits.cannotReach", {
                name: blockedDisplayName,
              })}
            </li>
            <li>{t("block.confirm.commits.youWontSee")}</li>
            <li>{t("block.confirm.commits.shadow")}</li>
            {hideGovernance && (
              <li>{t("block.confirm.commits.governanceExtra")}</li>
            )}
          </ul>
        </section>

        {/* What this does NOT mean */}
        <section className="mt-3 rounded-lg border border-moss-200 bg-moss-50/60 p-3 dark:border-moss-800 dark:bg-moss-900/30">
          <h3 className="text-sm font-semibold text-moss-800 dark:text-moss-100">
            {t("block.confirm.notCommitsHeading")}
          </h3>
          <ul className="mt-1.5 list-disc pl-5 text-xs leading-snug text-moss-700 dark:text-moss-200">
            <li>{t("block.confirm.notCommits.dispute")}</li>
            <li>{t("block.confirm.notCommits.deletion")}</li>
            <li>{t("block.confirm.notCommits.otherNodes")}</li>
          </ul>
        </section>

        {/* Hide governance opt-in */}
        <label className="mt-4 flex items-start gap-2 text-xs text-moss-700 dark:text-moss-200">
          <input
            type="checkbox"
            checked={hideGovernance}
            onChange={(e) => setHideGovernance(e.target.checked)}
            className="mt-0.5 min-h-[20px] min-w-[20px]"
            disabled={pending}
          />
          <span className="flex-1">
            {t("block.confirm.hideGovernanceCheckbox")}
            <WhyTooltip principleId="community-authority" />
            <span className="mt-1 block text-[11px] text-moss-500 dark:text-moss-300">
              {t("block.confirm.hideGovernanceWhy")}
            </span>
          </span>
        </label>

        {/* Private note */}
        <label className="mt-3 flex flex-col gap-1 text-xs">
          <span className="text-moss-700 dark:text-moss-200">
            {t("block.confirm.notePlaceholder")}
          </span>
          <textarea
            className="input min-h-[60px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={BLOCK_NOTE_MAX_LENGTH}
            disabled={pending}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary min-h-[44px]"
            onClick={onClose}
            disabled={pending}
          >
            {t("block.confirm.cancel")}
          </button>
          <button
            type="button"
            className="btn min-h-[44px] bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
            onClick={() => void handleConfirm()}
            disabled={pending}
            aria-busy={pending}
          >
            {pending
              ? t("block.confirm.buttonPending")
              : t("block.confirm.button")}
          </button>
        </div>
      </div>
    </div>
  );
}
