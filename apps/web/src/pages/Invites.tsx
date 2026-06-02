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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { humanizeError } from "@/lib/humanizeError";
import { formatDeadline, formatRelativeTime } from "@/lib/format";
import { revokeInvite } from "@/db/invites";
import type { InviteRow } from "@/db/database";
import { EmptyState } from "@/components/EmptyState";
import { InviteShareSheet } from "@/components/InviteShareSheet";

// Dedicated management surface for the member's issued invites.
// Extracted from Profile's InvitesSection so the historical list
// doesn't blow out the Profile card's height when an organizer has
// issued many invites — Profile keeps the Generate flow + a one-line
// summary; this page holds the list, sorted open-first, with per-row
// Copy / Show QR / Revoke actions.
//
// The Show QR per row re-opens the existing InviteShareSheet with its
// "look around" privacy gate (PR #134) — same affordance as the
// fresh-share banner on Profile, available for any open invite at any
// time so members don't lose access to the QR after navigating away
// from the Generate flow.

const STATUS_TIER: Record<InviteRow["status"], number> = {
  open: 1,
  redeemed: 2,
  revoked: 3,
  expired: 4,
};

const INVITE_STATUS_KEY: Record<InviteRow["status"], string> = {
  open: "profile.invites.statusOpen",
  redeemed: "profile.invites.statusRedeemed",
  revoked: "profile.invites.statusRevoked",
  expired: "profile.invites.statusExpired",
};

export default function InvitesPage() {
  const { currentMember, invites } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  // QR re-display state. `qrUrl` is the invite URL to show; null
  // closes the sheet. Per-row Show QR sets it; the sheet's onClose
  // clears it.
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const myInvites = useMemo(
    () =>
      currentMember
        ? invites.filter((inv) => inv.inviterKey === currentMember.publicKey)
        : [],
    [invites, currentMember],
  );

  // Sort: tier 1 (open) first, then redeemed, revoked, expired.
  // Within each tier, newest createdAt first so members see what
  // they just issued at the top.
  const sortedInvites = useMemo(() => {
    return [...myInvites].sort((a, b) => {
      const tierDelta = STATUS_TIER[a.status] - STATUS_TIER[b.status];
      if (tierDelta !== 0) return tierDelta;
      return b.createdAt - a.createdAt;
    });
  }, [myInvites]);

  if (!currentMember) return null;

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus(t("common.copied"));
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(t("common.copyFailed"));
    }
  }

  async function handleRevoke(token: string) {
    setError(null);
    setRevokingToken(token);
    try {
      await revokeInvite(currentMember!.publicKey, token);
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setRevokingToken(null);
    }
  }

  function inviteUrl(inv: InviteRow): string {
    return `${window.location.origin}/invite#${inv.encoded}`;
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("invitesPage.back")}
        </button>
        <h1 className="page-title mt-2">{t("invitesPage.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("invitesPage.intro")}
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}

      {copyStatus && (
        <p className="mb-3 text-sm text-canopy-800 dark:text-canopy-200">
          {copyStatus}
        </p>
      )}

      {sortedInvites.length === 0 ? (
        <EmptyState
          illustration="none"
          variant="inset"
          title={t("invitesPage.empty.title")}
          message={t("invitesPage.empty.message")}
          action={{ label: t("invitesPage.empty.cta"), to: "/profile" }}
        />
      ) : (
        <ul className="card flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
          {sortedInvites.map((inv) => (
            <li
              key={inv.token}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {t(INVITE_STATUS_KEY[inv.status])}
                </div>
                <div className="text-xs text-moss-500">
                  {inv.status === "redeemed"
                    ? t("profile.invites.redeemed", {
                        when: formatRelativeTime(inv.redeemedAt ?? 0),
                      })
                    : t("profile.invites.expires", {
                        date: formatDeadline(inv.expiresAt),
                      })}
                </div>
              </div>
              {inv.status === "open" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => handleCopy(inviteUrl(inv))}
                  >
                    {t("common.copy")}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    onClick={() => setQrUrl(inviteUrl(inv))}
                  >
                    {t("profile.invites.showShareSheet")}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost text-xs text-rose-700 dark:text-rose-300"
                    onClick={() => handleRevoke(inv.token)}
                    disabled={revokingToken === inv.token}
                    aria-busy={revokingToken === inv.token}
                  >
                    {revokingToken === inv.token
                      ? t("common.working")
                      : t("profile.invites.revoke")}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <InviteShareSheet
        open={qrUrl !== null}
        url={qrUrl ?? ""}
        shareTitle={t("profile.invites.shareSheet.shareTitle")}
        shareText={t("profile.invites.shareSheet.shareText")}
        onClose={() => setQrUrl(null)}
      />
    </div>
  );
}
