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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { acceptMirror, dismissMirror } from "@/lib/nodeEndpoints";

// The informed-consent card for an announced MIRROR node
// (docs/community-resilience.md §B.2). The community's node published
// another same-community server in `GET /config.mirrors`; this card
// names it and asks before the app ever talks to it. Auto-suggest,
// never auto-enable — same posture as NodeOriginSuggestCard: nothing
// is persisted until the member decides, and declining persists so
// the suggestion never nags. Accepting adds the mirror to the
// failover list: pulls and pushes switch to it on their own whenever
// the primary is unreachable.
export function MirrorSuggestCard({
  mirrorUrl,
  onDone,
}: {
  /** The announced mirror URL (normalized, from /config.mirrors). */
  mirrorUrl: string;
  /** Called after the member decides either way. */
  onDone: (accepted: boolean) => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  // Name the ORIGIN — what a member can recognize — falling back to
  // the raw URL if it somehow doesn't parse.
  let origin = mirrorUrl;
  try {
    origin = new URL(mirrorUrl).origin;
  } catch {
    /* keep the raw URL */
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      await acceptMirror(mirrorUrl);
      onDone(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    setBusy(true);
    try {
      await dismissMirror(mirrorUrl);
      onDone(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="region"
      aria-label={t("mirrorSuggest.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="font-medium text-canopy-900 dark:text-canopy-100">
        {t("mirrorSuggest.title")}
      </p>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("mirrorSuggest.body", { origin })}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDecline()}
          disabled={busy}
        >
          {t("mirrorSuggest.decline")}
        </button>
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={() => void handleConfirm()}
          disabled={busy}
        >
          {t("mirrorSuggest.confirm")}
        </button>
      </div>
    </div>
  );
}
