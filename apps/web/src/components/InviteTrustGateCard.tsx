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
import { useTranslation } from "react-i18next";
import { MINIMUM_VOUCHES_FOR_TRUST } from "@/lib/vouch";

// The trust-gate explainer, rendered in place of a trust-gated
// control the moment a pending-trust member would reach for it.
// Pattern-matches the GrowRoot gate screen: plain-language why,
// optional have/need progress, and how to get there — a door that
// opens with trust, never a wall. One shared shape so every gated
// action explains itself the same way (operator ruling, 2026-07:
// "the system should be very clear as someone is trying to take an
// action, they need to be vouched").
//
// `i18nBase` picks the copy: `${base}.title`, `${base}.body`,
// `${base}.howTo`, and — only when `have` is provided —
// `${base}.progress` with {{have}}/{{need}}. Surfaces on ANOTHER
// member's page must omit `have`: a "N of 2 vouches" line there
// reads as that member's score (no-leaderboards), and
// MemberDetail's tripwire test forbids any digits-next-to-"vouches"
// on the page.
export function TrustGateCard({
  i18nBase,
  have,
}: {
  i18nBase: string;
  have?: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl bg-moss-50 p-3 dark:bg-moss-900">
      <h3 className="text-sm font-semibold text-moss-900 dark:text-moss-50">
        {t(`${i18nBase}.title`)}
      </h3>
      <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
        {t(`${i18nBase}.body`)}
      </p>
      {have !== undefined && (
        <p className="mt-2 text-sm font-medium text-canopy-800 dark:text-canopy-200">
          {t(`${i18nBase}.progress`, {
            have,
            need: MINIMUM_VOUCHES_FOR_TRUST,
          })}
        </p>
      )}
      <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
        {t(`${i18nBase}.howTo`)}
      </p>
    </div>
  );
}

/** The "only fully-vouched members can invite" instance — Profile's
 *  Invites card and the /invites empty state (db/invites.ts
 *  `inviteIssuanceAllowed`). Viewing existing/past invites is
 *  deliberately NOT gated; only generation is. */
export function InviteTrustGateCard({ have }: { have: number }) {
  return <TrustGateCard i18nBase="invites.gate" have={have} />;
}
