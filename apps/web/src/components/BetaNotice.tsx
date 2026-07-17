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
import { dismissBetaNotice, isBetaNoticeDismissed } from "@/lib/betaNotice";

// The beta / AI-assisted-code disclosure card. Shown inline on the
// three doors into the app — the Welcome tour, invite acceptance,
// and the founder's node-setup screen — so nobody starts using
// Understoria without having been told, in plain language, what
// they're using and what not to put in it.
//
// Non-blocking, and dismissible with one tap: "Got it" hides the
// card on every door, permanently, on this device (the
// keepAccessNudge posture — the member read it, we heard them; a
// re-appearing notice is nagging). There's still no forced "I
// understand" gate: it's a disclosure, not a consent ceremony. The
// permanent copies live in Help (FAQ "beta-status") and Settings,
// where a member can re-read it any time.
//
// Renders nothing until the dismissed flag resolves (the
// render-nothing-until-known pattern) so the card never flashes in
// and vanishes for a member who already dismissed it.
//
// Amber, matching the app's other stakes-raising notices (the
// unclaimed-node card, the unconnected-redemption alert). role="note"
// not role="alert": it's standing context, not an event.
export function BetaNotice({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void isBetaNoticeDismissed().then((v) => {
      if (!cancelled) setDismissed(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed !== false) return null;

  async function handleDismiss() {
    await dismissBetaNotice();
    setDismissed(true);
  }

  return (
    <div
      role="note"
      className={`rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 ${className}`.trim()}
    >
      <p className="font-semibold">{t("betaNotice.title")}</p>
      <p className="mt-1">{t("betaNotice.body1")}</p>
      <p className="mt-2">{t("betaNotice.body2")}</p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => void handleDismiss()}
        >
          {t("betaNotice.dismiss")}
        </button>
      </div>
    </div>
  );
}
