/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { nominationExpired, readPendingNomination } from "@/lib/cofounder";
import { isSoleFounder } from "@/lib/singleFounder";
import { shortKey } from "@/lib/format";
import { trustedCircleSize } from "@/lib/vouch";

// The sole founder's standing warning (docs/cofounder-ceremony-plan.md
// P4): a one-root community can never promote anyone, so the ONE
// person who can fix that gets told plainly — with the doorway — and
// with the "your own invites still work" line so the warning never
// reads as "you're stuck". Renders nothing for everyone else, and
// nothing on founderless nodes (isSoleFounder's no-capture rule).
// While a nomination is pending it swaps to the pending state instead
// of repeating a warning the founder has already acted on.
export function SoleFounderCard() {
  const { t } = useTranslation();
  const {
    currentMember,
    members,
    vouches,
    invites,
    founderRoots,
    founderHashCapture,
  } = useApp();

  // Live-queried so Withdraw / Done on /add-cofounder flips this card
  // without a reload (the settings table backs the pending key).
  const pending = useLiveQuery(readPendingNomination, [], null);

  if (
    !currentMember ||
    !isSoleFounder(
      currentMember.publicKey,
      founderHashCapture ?? null,
      founderRoots,
      trustedCircleSize({ vouches, invites, founderRoots }),
    )
  ) {
    return null;
  }

  const pendingLive = pending && !nominationExpired(pending) ? pending : null;
  const nomineeName = pendingLive
    ? members.find((m) => m.publicKey === pendingLive.nomineeKey)
        ?.displayName || shortKey(pendingLive.nomineeKey)
    : null;

  return (
    <section className="card mb-4 border-l-4 border-amber-500">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
        {t("soleFounder.title")}
      </h2>
      {pendingLive ? (
        <>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("soleFounder.pendingBody", { name: nomineeName })}
          </p>
          <Link
            to="/add-cofounder"
            className="mt-2 inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("soleFounder.pendingCta")} →
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("soleFounder.body")}
          </p>
          <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
            {t("soleFounder.invitesWork")}
          </p>
          <Link to="/add-cofounder" className="btn-primary mt-3 inline-block">
            {t("soleFounder.cta")}
          </Link>
        </>
      )}
    </section>
  );
}
