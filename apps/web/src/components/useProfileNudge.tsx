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
import type { BoardNudgeStatus } from "@/lib/boardNudge";
import {
  dismissProfileNudge,
  isProfileNudgeDismissed,
  profileIsBare,
} from "@/lib/profileNudge";

// One-time, dismissible nudge that surfaces on Board when the
// member never filled in zone / skills / availability — either
// because they left those (optional) fields blank at the
// profile-setup step during onboarding or because they joined
// before that step existed. (Only the display name is required
// there; everything else can legitimately arrive empty.)
//
// Disappears automatically once any of the fields is set; the
// dismissed-setting only matters for members who want to ignore
// the nudge forever without ever filling in their profile.
//
// Dismissal is permanent by design — re-showing a dismissed nudge
// is ambient urgency theater (no-notifications). The member said
// no; we heard them. The "Got it" flag persists in the Dexie
// settings table, and filling in any profile field writes the same
// flag so the nudge never resurfaces even if the member later
// clears those fields again.
//
// The gating lives in this hook (returning a BoardNudgeStatus so the
// Board orchestrator can show at most one prompt at a time); the JSX
// lives in ProfileNudgeCard below.

export function useProfileNudge(): BoardNudgeStatus {
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

  const profileFilled =
    currentMember !== null && !profileIsBare(currentMember);

  // Self-retire permanently the moment a filled-in profile is
  // observed. Without this write the nudge would come back if the
  // member later emptied those fields — emptying a profile is a
  // choice, not an invitation to be nudged again
  // (solidarity-not-shame).
  useEffect(() => {
    if (profileFilled && dismissed === false) {
      setDismissed(true);
      void dismissProfileNudge();
    }
  }, [profileFilled, dismissed]);

  async function handleDismiss() {
    await dismissProfileNudge();
    setDismissed(true);
  }

  // ready once the dismiss flag resolves (render-nothing-until-known);
  // visible is the negation of the old `return null` guards.
  const ready = dismissed !== null;
  const visible = dismissed === false && profileIsBare(currentMember);

  return {
    ready,
    visible,
    node: <ProfileNudgeCard onDismiss={handleDismiss} />,
  };
}

function ProfileNudgeCard({
  onDismiss,
}: {
  onDismiss: () => Promise<void>;
}) {
  const { t } = useTranslation();
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
          onClick={() => void onDismiss()}
        >
          {t("profileNudge.dismiss")}
        </button>
        {/* `?edit=1` lands the member INSIDE the editor — Profile
            scrolls the About section into view and focuses the first
            field — instead of dropping them at the top of a long page
            to find the form themselves. Profile strips the param
            after handling (history.replace), so refresh/back don't
            re-trigger the scroll. */}
        <Link to="/profile?edit=1" className="btn-primary text-xs">
          {t("profileNudge.cta")}
        </Link>
      </div>
    </div>
  );
}
