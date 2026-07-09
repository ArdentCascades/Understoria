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
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { decodeAndVerifyInvite } from "@/lib/invite";
import { formatAbsoluteDate } from "@/lib/format";
import { InviteQRCode } from "@/components/InviteQRCode";
import {
  PrintFooter,
  PrintToolbar,
  TearOffStrip,
} from "@/components/PrintChrome";

// The invite poster (docs/desktop-power-tools.md plan 5;
// docs/offline-resilience.md §5's "paper bulletin board of QR codes
// in a shelter lobby"). A print-clean page: the invite QR at poster
// size, the plain-words what-this-is copy, the address typed out for
// people who'd rather not scan, and the expiry date.
//
// The invite rides in the URL FRAGMENT (/print/invite#<encoded>) —
// the exact token the share links already use, so it never reaches
// any server and the poster page can be refreshed or bookmarked
// while the invite lives. The token is decoded AND verified before
// anything renders: an expired or forged invite gets an honest
// refusal, never a poster that would fail at the door.
export default function PrintInvitePage() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const encoded = hash.replace(/^#/, "");
  const parsed = useMemo(
    () => (encoded ? decodeAndVerifyInvite(encoded) : null),
    [encoded],
  );

  if (!parsed || !parsed.ok) {
    return (
      <div className="px-4 pb-8 pt-6">
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t(
            parsed && parsed.error === "expired"
              ? "print.invite.expired"
              : "print.invite.invalid",
          )}
        </p>
        <button
          type="button"
          className="btn-secondary mt-3"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  const inviteUrl = `${window.location.origin}/invite#${encoded}`;

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <PrintToolbar />

      {/* The poster itself — everything below prints. */}
      <div className="mx-auto max-w-xl text-center">
        <h1 className="page-title print:text-black">
          {t("print.invite.headline")}
        </h1>
        <p className="mt-1 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
          {window.location.host}
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm text-moss-700 dark:text-moss-200 print:text-black">
          {t("print.invite.what")}
        </p>

        <div className="mt-6 flex justify-center">
          <InviteQRCode
            value={inviteUrl}
            size={320}
            ariaLabel={t("print.invite.qrAria")}
          />
        </div>

        <p className="mx-auto mt-4 max-w-md break-all text-xs text-moss-600 dark:text-moss-300 print:text-black">
          {t("print.invite.urlLead")} {inviteUrl}
        </p>

        <p className="mt-4 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
          {t("print.invite.expires", {
            date: formatAbsoluteDate(parsed.invite.expiresAt),
          })}
        </p>

        {/* Tear-off tabs (P6): six copies of the same invite for
            passers-by in a hurry. */}
        <TearOffStrip
          tabs={Array.from({ length: 6 }, () => ({
            value: inviteUrl,
            label: window.location.host,
          }))}
          qrAriaLabel={t("print.invite.qrAria")}
        />

        <PrintFooter />
      </div>
    </div>
  );
}
