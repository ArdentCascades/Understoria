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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FounderNomination } from "@understoria/shared/types";
import { useApp } from "@/state/AppContext";
import { MemberAvatar } from "@/components/MemberAvatar";
import {
  acceptNomination,
  clearIncomingNomination,
} from "@/lib/cofounder";
import { formatAbsoluteDateTime, shortKey } from "@/lib/format";
import { getActiveNodeUrl, pendingMirrorSuggestions } from "@/lib/nodeEndpoints";
import { isFounderRoot } from "@/lib/vouch";

// The nominee's half of the co-founder ceremony
// (docs/cofounder-ceremony-plan.md P3), surfaced in the attention
// rail. The PERMANENCE copy is load-bearing: the accept card is where
// "forever" gets said, before the only signature that makes it so.
//
// Lifecycle: Accept posts the dual-signed accession, then kicks a
// fresh /config capture + nodeConfig refresh so THIS device flips out
// of single-founder state in the same interaction; the card shows its
// accepted state until the member dismisses it (or the next slow-beat
// pull finds the shelf empty and clears the key). "Not now" clears
// the local key only — the nomination stays on the node until it
// expires, so a later pull may honestly re-surface it.
export function CofounderAcceptCard({
  nomination,
}: {
  nomination: FounderNomination;
}) {
  const { t } = useTranslation();
  const { members, founderRoots, refreshNodeConfig } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  // The accept flow's /config kick can outlive this card (the pull
  // that notices the emptied shelf unmounts it) — guard every
  // post-await setState (the useVouchDiscoveryNudge pattern).
  const cancelledRef = useRef(false);
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const nominator = members.find(
    (m) => m.publicKey === nomination.nominatorKey,
  );
  const nominatorName =
    nominator?.displayName || shortKey(nomination.nominatorKey);

  // A stale incoming key can outlive the ceremony (offline before the
  // clearing pull): once this member IS a root, only the accepted
  // state is honest — never a second "accept?" prompt.
  const alreadyRoot = isFounderRoot(nomination.nomineeKey, { founderRoots });

  async function handleAccept() {
    setBusy(true);
    setError(null);
    try {
      const active = await getActiveNodeUrl();
      if (!active) {
        if (!cancelledRef.current)
          setError(t("cofounder.errors.unreachable"));
        return;
      }
      const res = await acceptNomination({ url: active.url, nomination });
      if (!res.ok) {
        if (!cancelledRef.current)
          setError(t(`cofounder.errors.${res.reason}`));
        return;
      }
      // The config-refetch kick: pendingMirrorSuggestions IS the
      // /config fetch that captures the (now two) founder hashes, and
      // refreshNodeConfig re-reads the local config state — together
      // they flip this device out of single-founder in the same
      // interaction instead of waiting a capture cadence.
      await pendingMirrorSuggestions();
      await refreshNodeConfig();
      if (!cancelledRef.current) setAccepted(true);
    } finally {
      if (!cancelledRef.current) setBusy(false);
    }
  }

  if (accepted || alreadyRoot) {
    return (
      <div className="rounded-lg bg-canopy-50 px-3 py-2 dark:bg-canopy-950/40">
        <p className="text-sm font-semibold text-canopy-900 dark:text-canopy-100">
          {t("cofounder.accept.acceptedTitle")}
        </p>
        <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
          {t("cofounder.accept.acceptedBody")}
        </p>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => void clearIncomingNomination()}
          >
            {t("cofounder.accept.acceptedClose")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-canopy-50 px-3 py-2 dark:bg-canopy-950/40">
      <div className="flex items-center gap-2">
        <MemberAvatar publicKey={nomination.nominatorKey} size={32} />
        <p className="text-sm font-semibold text-canopy-900 dark:text-canopy-100">
          {t("cofounder.accept.title", { name: nominatorName })}
        </p>
      </div>
      {/* Load-bearing permanence copy — asserted verbatim in tests. */}
      <p className="mt-2 text-sm font-medium text-moss-900 dark:text-moss-50">
        {t("cofounder.accept.permanence")}
      </p>
      <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
        {t("cofounder.accept.body", { name: nominatorName })}
      </p>
      <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
        {t("cofounder.accept.expires", {
          when: formatAbsoluteDateTime(nomination.expiresAt),
        })}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center rounded-full bg-canopy-700 px-3 py-1 text-xs font-semibold text-canopy-50 hover:bg-canopy-800 disabled:opacity-50"
          disabled={busy}
          aria-busy={busy}
          onClick={() => void handleAccept()}
        >
          {busy
            ? t("cofounder.accept.accepting")
            : t("cofounder.accept.accept")}
        </button>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center rounded-full bg-moss-100 px-3 py-1 text-xs font-semibold text-moss-800 hover:bg-moss-200 disabled:opacity-50 dark:bg-moss-800 dark:text-moss-100"
          disabled={busy}
          onClick={() => void clearIncomingNomination()}
        >
          {t("cofounder.accept.notNow")}
        </button>
      </div>
      <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
        {t("cofounder.accept.notNowHint", { name: nominatorName })}
      </p>
    </div>
  );
}
