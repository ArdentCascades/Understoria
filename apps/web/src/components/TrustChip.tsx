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
import { useTranslation } from "react-i18next";
import { MINIMUM_VOUCHES_FOR_TRUST, type TrustStatus } from "@/lib/vouch";

interface TrustChipProps {
  status: TrustStatus;
  /** Optional distinct-voucher count. When present, the chip shows
   *  "Pending (1/2)" or "Trusted (3 vouches)" instead of just the
   *  label.
   *
   *  IMPORTANT — operator ruling + `no-leaderboards`: pass `count`
   *  ONLY on the member's OWN Profile (seeing your own progress to
   *  trusted is fine). Never on MemberDetail or any surface showing
   *  ANOTHER member — a vouch tally there is a comparable score. */
  count?: number;
  /** Smaller variant for inline use next to a name in a list, where
   *  the full chip would feel heavy. Defaults to false (regular
   *  chip size). */
  compact?: boolean;
}

/**
 * "Founding member" — shown next to the TrustChip for members the
 * node published as founding trust roots (salted hashes on
 * GET /config, resolved in lib/founderRoots.ts). It is the honest
 * explanation for a trusted member with zero vouchers: the web of
 * trust is rooted at them. Unlike vouch counts this is NOT a
 * comparable score (there is no ladder to climb — you were either
 * a root or you weren't), so it is fine on other members' pages.
 */
export function FounderChip({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const sizeClass = compact
    ? "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[0.625rem] font-medium"
    : "chip";
  return (
    <span
      className={`${sizeClass} bg-moss-100 text-moss-900 dark:bg-moss-900/60 dark:text-moss-100`}
      title={t("trust.founderTooltip")}
    >
      <span aria-hidden="true" className="mr-1">
        {"\u{1F331}"}
      </span>
      {t("trust.founder")}
    </span>
  );
}

export function TrustChip({ status, count, compact = false }: TrustChipProps) {
  const { t } = useTranslation();
  const sizeClass = compact
    ? "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[0.625rem] font-medium"
    : "chip";
  if (status === "trusted") {
    const label =
      count !== undefined
        ? t(
            count === 1
              ? "trust.trustedWithCountOne"
              : "trust.trustedWithCountOther",
            { count },
          )
        : t("trust.trusted");
    return (
      <span
        className={`${sizeClass} bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100`}
        title={t("trust.trustedTooltip")}
      >
        <span aria-hidden="true" className="mr-1">
          {"\u{2714}"}
        </span>
        {label}
      </span>
    );
  }
  const label =
    count !== undefined
      ? t("trust.pendingWithCount", {
          have: count,
          need: MINIMUM_VOUCHES_FOR_TRUST,
        })
      : t("trust.pending");
  return (
    <span
      className={`${sizeClass} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200`}
      title={t("trust.pendingTooltip")}
    >
      <span aria-hidden="true" className="mr-1">
        {"\u{231B}"}
      </span>
      {label}
    </span>
  );
}
