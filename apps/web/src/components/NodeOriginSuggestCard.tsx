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
import { writeSubmitConfig } from "@/lib/nodeSubmit";
import { dismissNodeSuggest } from "@/lib/nodeOriginSuggest";

// The informed-consent card for the origin-derived community-node
// suggestion (`docs/invite-redemption.md` §5.3). Shown on the
// invite-accept success path and as a Board card when the device
// loaded the PWA from a community-node origin and has no node
// configured yet.
//
// This card IS the consent moment (mirrorConsent.ts posture): it names
// the origin and what will be sent, and nothing is persisted until the
// member taps confirm. Prefill + explicit confirm — never silent
// (operator ruling §15.2). Declining persists a device-wide "asked and
// answered" flag so the suggestion never nags; Settings remains the
// manual path.
export function NodeOriginSuggestCard({
  candidateUrl,
  onDone,
}: {
  /** The derived `${origin}/api` URL, already health-probed. */
  candidateUrl: string;
  /** Called after the member decides either way. `confirmed` tells the
   *  host surface whether config was written (e.g. to toast). */
  onDone: (confirmed: boolean) => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  // Naming the ORIGIN, not the /api path — that's what the member can
  // recognize from their address bar. Falls back to the raw URL if it
  // somehow doesn't parse (it always should; it was derived from one).
  let origin = candidateUrl;
  try {
    origin = new URL(candidateUrl).origin;
  } catch {
    /* keep the raw URL */
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      // The explicit confirm on this card is the informed consent —
      // the same gate NodeSection's ConfirmDialog provides for manual
      // edits — so we persist directly.
      await writeSubmitConfig({ url: candidateUrl, enabled: true });
      onDone(true);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    setBusy(true);
    try {
      await dismissNodeSuggest();
      onDone(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="region"
      aria-label={t("nodeSuggest.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="font-medium text-canopy-900 dark:text-canopy-100">
        {t("nodeSuggest.title")}
      </p>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("nodeSuggest.body", { origin })}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDecline()}
          disabled={busy}
        >
          {t("nodeSuggest.decline")}
        </button>
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={() => void handleConfirm()}
          disabled={busy}
        >
          {t("nodeSuggest.confirm", { origin })}
        </button>
      </div>
    </div>
  );
}
