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

// The "only fully-vouched members can invite" explainer — rendered in
// place of the Generate control (Profile's Invites card, the /invites
// empty state) when the current member is still pending trust and the
// device holds a founder capture (db/invites.ts
// `inviteIssuanceAllowed`). Pattern-matches the GrowRoot gate screen:
// plain-language why, have/need progress, and how to get there — a
// door that opens with trust, never a wall. Viewing existing/past
// invites is deliberately NOT gated; only generation is.
export function InviteTrustGateCard({ have }: { have: number }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl bg-moss-50 p-3 dark:bg-moss-900">
      <h3 className="text-sm font-semibold text-moss-900 dark:text-moss-50">
        {t("invites.gate.title")}
      </h3>
      <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
        {t("invites.gate.body")}
      </p>
      <p className="mt-2 text-sm font-medium text-canopy-800 dark:text-canopy-200">
        {t("invites.gate.progress", {
          have,
          need: MINIMUM_VOUCHES_FOR_TRUST,
        })}
      </p>
      <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
        {t("invites.gate.howTo")}
      </p>
    </div>
  );
}
