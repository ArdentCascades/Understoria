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
import type { BoardNudgeStatus } from "@/lib/boardNudge";
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
//
// Dismissal is permanent by design — re-showing a dismissed nudge
// is ambient urgency theater (no-notifications). The member said
// no; we heard them. The "Got it" flag persists in the Dexie
// settings table, and taking the first action writes the same flag
// so the nudge never resurfaces even if the evidence of the action
// later disappears (e.g. a claim that was later released).
//
// The gating lives in this hook (returning a BoardNudgeStatus so the
// Board orchestrator can show at most one prompt at a time); the JSX
// lives in FirstActionNudgeCard below. The card is built eagerly and
// only rendered when the status is `visible`.

export function useFirstActionNudge(): BoardNudgeStatus {
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

  const actionTaken =
    currentMember !== null &&
    memberHasTakenFirstAction(currentMember.publicKey, posts);

  // Self-retire permanently the moment the first action is observed.
  // Without this write the nudge would come back if the action's
  // evidence vanished later (a released claim) — which would be the
  // app un-hearing a thing the member already did. solidarity-not-
  // shame: once they've acted, the encouragement chapter is closed.
  useEffect(() => {
    if (actionTaken && dismissed === false) {
      setDismissed(true);
      void dismissFirstActionNudge();
    }
  }, [actionTaken, dismissed]);

  async function handleDismiss() {
    await dismissFirstActionNudge();
    setDismissed(true);
  }

  // ready once the dismiss flag resolves (render-nothing-until-known);
  // visible is the negation of the old `return null` guards.
  const ready = dismissed !== null;
  const visible = dismissed === false && currentMember !== null && !actionTaken;

  return {
    ready,
    visible,
    node: <FirstActionNudgeCard onDismiss={handleDismiss} />,
  };
}

function FirstActionNudgeCard({
  onDismiss,
}: {
  onDismiss: () => Promise<void>;
}) {
  const { t } = useTranslation();
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
      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-canopy-700 marker:hidden hover:underline dark:text-canopy-300">
          {t("common.learnMore")}
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-xs text-moss-600 dark:text-moss-300">
          {t("firstActionNudge.technical")}
        </p>
      </details>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void onDismiss()}
        >
          {t("firstActionNudge.dismiss")}
        </button>
      </div>
    </div>
  );
}
