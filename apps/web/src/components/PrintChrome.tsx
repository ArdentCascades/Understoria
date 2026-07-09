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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatAbsoluteDate } from "@/lib/format";

// Shared frame bits for the /print/... pages (desktop-power-tools
// plan 5). The pages render as normal on-screen routes; @media print
// hides the app chrome globally (Layout/BottomNav/banner/toasts all
// carry print:hidden) and this toolbar hides itself too, so what
// comes out of the printer is just the sheet.

/** Screen-only Print + Back row. `window.print()`, no popups, no
 *  PDF library — the browser's own dialog is the whole mechanism. */
export function PrintToolbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate(-1)}
      >
        {t("common.back")}
      </button>
      <button
        type="button"
        className="btn-primary"
        onClick={() => window.print()}
      >
        {t("print.printButton")}
      </button>
    </div>
  );
}

/**
 * The honesty line every printout carries (threat-model §7): a
 * printout is an offline copy outside every purge and revocation
 * path — same posture as the recovery kit's print path. Rendered
 * on screen too, so the member reads it BEFORE printing.
 */
export function PrintFooter() {
  const { t } = useTranslation();
  return (
    <p className="mt-8 text-xs text-moss-600 dark:text-moss-300 print:text-black">
      {t("print.footer", { date: formatAbsoluteDate(Date.now()) })}
    </p>
  );
}
