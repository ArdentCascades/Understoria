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
import type { TrustStatus } from "@/lib/vouch";

export function TrustChip({ status }: { status: TrustStatus }) {
  const { t } = useTranslation();
  if (status === "trusted") {
    return (
      <span
        className="chip bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
        title={t("trust.trustedTooltip")}
      >
        <span aria-hidden="true" className="mr-1">
          {"\u{2714}"}
        </span>
        {t("trust.trusted")}
      </span>
    );
  }
  return (
    <span
      className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      title={t("trust.pendingTooltip")}
    >
      <span aria-hidden="true" className="mr-1">
        {"\u{231B}"}
      </span>
      {t("trust.pending")}
    </span>
  );
}
