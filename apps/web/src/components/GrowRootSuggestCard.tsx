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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setSetting, SETTING_KEYS } from "@/db/database";

// The no-nag "grow another root" suggest card (docs/capacity-forecast.md
// §5.2). Shown on the Board to a TRUSTED member when the community's
// node reports RED capacity pressure and no healthy mirror has failed
// over yet. Same informed-consent posture as MirrorSuggestCard: nothing
// happens until the member decides, and declining persists so it never
// re-asks. Accepting just opens the existing /grow-root wizard — this
// card only surfaces the moment; it does not itself stand up a node.
//
// Deliberately says NOTHING about who hosts: the copy addresses "our
// community's node" and offers the horizontal response (grow a root)
// the app can actually help with, per §5.1's menu.
export function GrowRootSuggestCard({
  onDone,
}: {
  /** Called after the member decides either way. */
  onDone: (accepted: boolean) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleDecline() {
    setBusy(true);
    try {
      await setSetting(SETTING_KEYS.growRootSuggestDismissed, "1");
      onDone(false);
    } finally {
      setBusy(false);
    }
  }

  function handleConfirm() {
    onDone(true);
    navigate("/grow-root");
  }

  return (
    <div
      role="region"
      aria-label={t("growRootSuggest.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="font-medium text-canopy-900 dark:text-canopy-100">
        {t("growRootSuggest.title")}
      </p>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("growRootSuggest.body")}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDecline()}
          disabled={busy}
        >
          {t("growRootSuggest.decline")}
        </button>
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={handleConfirm}
          disabled={busy}
        >
          {t("growRootSuggest.confirm")}
        </button>
      </div>
    </div>
  );
}
