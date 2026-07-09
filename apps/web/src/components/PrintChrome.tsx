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
import { InviteQRCode } from "@/components/InviteQRCode";

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

/**
 * Tear-off tabs (paper-systems P6) — the real bulletin-board
 * mechanic: a strip of small QR tabs along the bottom edge, dashed
 * cut borders between them, so someone hurrying past takes one home
 * and scans it later. Rendered on screen too (what prints is what
 * you see), just compact.
 */
export function TearOffStrip({
  tabs,
  qrAriaLabel,
}: {
  tabs: { value: string; label: string }[];
  qrAriaLabel: string;
}) {
  const { t } = useTranslation();
  if (tabs.length === 0) return null;
  return (
    <div className="mt-8">
      <p
        aria-hidden="true"
        className="border-t border-dashed border-moss-400 pt-1 text-left text-xs text-moss-600 dark:text-moss-300 print:border-black/50 print:text-black"
      >
        {"✂ "}
        {t("print.tabs.cut")}
      </p>
      <ul className="flex flex-wrap items-stretch">
        {tabs.map((tab, i) => (
          <li
            key={`${tab.value}-${i}`}
            className="flex w-24 flex-col items-center gap-1 border-r border-dashed border-moss-400 p-2 first:border-l dark:border-moss-600 print:border-black/50"
            style={{ breakInside: "avoid" }}
          >
            <InviteQRCode value={tab.value} size={72} ariaLabel={qrAriaLabel} />
            <span className="w-full truncate text-center text-[10px] leading-tight text-moss-700 dark:text-moss-200 print:text-black">
              {tab.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
