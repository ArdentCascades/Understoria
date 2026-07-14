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
import { WhyTooltip } from "@/components/WhyTooltip";
import type { BoardNudgeStatus } from "@/lib/boardNudge";
import {
  dismissVouchDiscoveryNudge,
  isVouchDiscoveryNudgeDismissed,
  memberHasVouchedForSomeone,
  memberIsTrusted,
} from "@/lib/vouchDiscoveryNudge";

// This nudge fires at most once, for one moment: when the member
// has just been welcomed into trust by someone vouching for them.
// It points at the action without asking for it. Dismissal is
// permanent (no-notifications: the member said no, we heard them).
// Self-retires if the member vouches for someone before dismissing.
// We never re-prompt, never count vouches, never gamify trust —
// see solidarity-not-shame.
//
// The gating lives in this hook (returning a BoardNudgeStatus so the
// Board orchestrator can show at most one prompt at a time); the JSX
// lives in VouchDiscoveryNudgeCard below.

export function useVouchDiscoveryNudge(): BoardNudgeStatus {
  const { currentMember, vouches, invites, founderRoots } = useApp();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void isVouchDiscoveryNudgeDismissed().then((v) => {
      if (!cancelled) setDismissed(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const trusted =
    currentMember !== null &&
    memberIsTrusted(currentMember.publicKey, vouches, invites, founderRoots);

  const alreadyVouched =
    currentMember !== null &&
    memberHasVouchedForSomeone(currentMember.publicKey, vouches);

  // Self-retire permanently the moment the member is observed to
  // have vouched for someone. Without this write the nudge would
  // come back if that vouch's evidence ever disappeared (e.g. a
  // local DB clear that doesn't touch settings). The action the
  // nudge points at has been performed — solidarity-not-shame: the
  // encouragement chapter is closed.
  useEffect(() => {
    if (alreadyVouched && dismissed === false) {
      setDismissed(true);
      void dismissVouchDiscoveryNudge();
    }
  }, [alreadyVouched, dismissed]);

  async function handleDismiss() {
    await dismissVouchDiscoveryNudge();
    setDismissed(true);
  }

  // ready once the dismiss flag resolves (render-nothing-until-known);
  // visible is the negation of the old `return null` guards.
  const ready = dismissed !== null;
  const visible =
    dismissed === false &&
    currentMember !== null &&
    trusted &&
    !alreadyVouched;

  return {
    ready,
    visible,
    node: <VouchDiscoveryNudgeCard onDismiss={handleDismiss} />,
  };
}

function VouchDiscoveryNudgeCard({
  onDismiss,
}: {
  onDismiss: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="region"
      aria-label={t("vouchNudge.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="font-medium text-canopy-900 dark:text-canopy-100">
        {t("vouchNudge.title")}
        <WhyTooltip principleId="community-authority" />
      </p>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("vouchNudge.body")}
      </p>
      {/* The full actor-side answer (what vouching commits, where the
          button lives, when it appears) is the `how-vouching-works`
          FAQ entry — re-findable on Help after this one-shot nudge is
          dismissed. The body deliberately stops over-promising a
          Vouch button on "any member's profile"; the button shows
          only where a vouch would actually add trust. */}
      <Link
        to="/help#how-vouching-works"
        className="touch-target inline-flex items-center self-start text-xs
                   font-medium text-canopy-700 underline-offset-2
                   hover:underline dark:text-canopy-300"
      >
        {t("vouchNudge.learnMore")} →
      </Link>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void onDismiss()}
        >
          {t("vouchNudge.dismiss")}
        </button>
      </div>
    </div>
  );
}
