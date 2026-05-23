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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  dismissFirstActionNudge,
  isFirstActionNudgeDismissed,
  memberHasTakenFirstAction,
} from "@/lib/firstActionNudge";

// One-time orientation banner for brand-new members who haven't
// posted or claimed anything yet. Names both directions ("browse"
// and "publish") explicitly because new members often don't
// realize lurking is welcome — and explicitly so they don't feel
// pressured to post first.
//
// Disappears automatically once they post or claim anything;
// the dismiss flag only matters for members who want to lurk
// forever without ever taking action.

export function FirstActionNudge() {
  const { t } = useTranslation();
  const { currentMember, posts } = useApp();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void isFirstActionNudgeDismissed().then((v) => {
      if (!cancelled) setDismissed(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing until we know dismissed state — avoids a
  // flash-then-hide on every page load.
  if (dismissed !== false) return null;
  if (!currentMember) return null;
  if (memberHasTakenFirstAction(currentMember.publicKey, posts)) return null;

  async function handleDismiss() {
    await dismissFirstActionNudge();
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label={t("firstActionNudge.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("firstActionNudge.message")}
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDismiss()}
        >
          {t("firstActionNudge.dismiss")}
        </button>
      </div>
    </div>
  );
}
