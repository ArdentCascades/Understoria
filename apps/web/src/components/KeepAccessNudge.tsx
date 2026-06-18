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
  dismissKeepAccessNudge,
  isKeepAccessNudgeDismissed,
  memberHasPairedDevice,
} from "@/lib/keepAccessNudge";

// Calm, post-onboarding reassurance: an account lives only on this
// device, and the ONLY thing that preserves access if the device is
// lost is a second paired device — there is no key export, recovery,
// or seed phrase. The onboarding identity screen plants the concern;
// this Board nudge delivers the actionable, unhurried answer (pair a
// second device) where the current member is guaranteed and
// /add-device actually works.
//
// Self-retires the moment a second device exists (a pairing-log row of
// either kind — the member already has a backup). Unlike the other
// Board nudges there's no self-retire *write*: a paired device is
// durable evidence (you can't un-pair without a Hard purge, which
// clears this nudge's dismiss flag too), so there's no "evidence
// vanished" case to defend against.
//
// Dismissal is permanent by design — re-showing a dismissed nudge is
// ambient urgency theater (no-notifications). The member said "maybe
// later"; we heard them. The flag persists in the Dexie settings
// table and clears only on Hard purge.

export function KeepAccessNudge() {
  const { t } = useTranslation();
  const { currentMember } = useApp();
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [hasPairedDevice, setHasPairedDevice] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void isKeepAccessNudgeDismissed().then((v) => {
      if (!cancelled) setDismissed(v);
    });
    void memberHasPairedDevice().then((v) => {
      if (!cancelled) setHasPairedDevice(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Render nothing until BOTH async checks resolve — avoids a
  // flash-then-hide on every page load for members who've dismissed
  // or already paired a second device.
  if (dismissed !== false) return null;
  if (hasPairedDevice !== false) return null;
  if (!currentMember) return null;

  async function handleDismiss() {
    await dismissKeepAccessNudge();
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label={t("keepAccessNudge.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="font-medium text-canopy-900 dark:text-canopy-100">
        {t("keepAccessNudge.title")}
      </p>
      <p className="text-canopy-900 dark:text-canopy-100">
        {t("keepAccessNudge.body")}
      </p>
      <details className="mt-1">
        <summary className="cursor-pointer text-xs font-medium text-canopy-700 marker:hidden hover:underline dark:text-canopy-300">
          {t("keepAccessNudge.why")}
        </summary>
        <p className="mt-2 whitespace-pre-wrap text-xs text-moss-600 dark:text-moss-300">
          {t("keepAccessNudge.learnMore")}
        </p>
      </details>
      <div className="flex gap-2 self-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDismiss()}
        >
          {t("keepAccessNudge.dismiss")}
        </button>
        <Link to="/add-device" className="btn-primary text-xs">
          {t("keepAccessNudge.cta")}
        </Link>
      </div>
    </div>
  );
}
