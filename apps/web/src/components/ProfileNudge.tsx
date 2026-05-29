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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  dismissProfileNudge,
  isProfileNudgeDismissed,
  profileIsBare,
} from "@/lib/profileNudge";

// One-time, dismissible nudge that surfaces on Board when the
// member never filled in zone / skills / availability — either
// because they Skipped the profile-setup step during onboarding
// or because they joined before that step existed.
//
// Disappears automatically once any of the fields is set; the
// dismissed-setting only matters for members who want to ignore
// the nudge forever without ever filling in their profile.

export function ProfileNudge() {
  const { t } = useTranslation();
  const { currentMember } = useApp();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void isProfileNudgeDismissed().then((v) => {
      if (!cancelled) setDismissed(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing until we know the dismissed state — avoids a
  // flash-then-hide on every page load for members who've already
  // dismissed.
  if (dismissed !== false) return null;
  if (!profileIsBare(currentMember)) return null;

  async function handleDismiss() {
    await dismissProfileNudge();
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label={t("profileNudge.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40
                 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("profileNudge.message")}
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-canopy-700 marker:hidden hover:underline dark:text-canopy-300">
          {t("common.learnMore")}
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-xs text-moss-600 dark:text-moss-300">
          {t("profileNudge.technical")}
        </p>
      </details>
      <div className="flex gap-2 self-end sm:self-auto">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDismiss()}
        >
          {t("profileNudge.dismiss")}
        </button>
        <Link to="/profile" className="btn-primary text-xs">
          {t("profileNudge.cta")}
        </Link>
      </div>
    </div>
  );
}
