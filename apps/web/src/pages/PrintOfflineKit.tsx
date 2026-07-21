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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { shareOrigin } from "@/lib/appOrigin";
import { wifiQrValue } from "@/lib/offlineKit";
import { InviteQRCode } from "@/components/InviteQRCode";
import { PrintFooter, PrintToolbar } from "@/components/PrintChrome";

// The offline kit (paper-systems P4): the offline-resilience
// runbook physicalized, for the moment screens are dead and the
// runbook can't be read in the app it documents.
//
//   1. The storm-hub WALL POSTER: join the hub WiFi (a native
//      `WIFI:` QR phones parse from the camera), open the
//      community's ordinary address (the hub's DNS answers the
//      SAME domain — that is the whole storm-hub trick), and the
//      shelter is a working community island.
//   2. WALLET CARDS, printed 2-up with scissor lines: the same
//      three steps at pocket size.
//
// The app cannot know the hub's SSID or password, so the page
// carries SCREEN-ONLY inputs (print:hidden) the member fills before
// printing. Deliberately member-typed, never harvested from the OS.
// Empty fields degrade honestly: no WiFi QR, and the instructions
// say "ask for the community WiFi" instead.
//
// The WiFi password DOES print — deliberately. The wall poster's
// whole job is to hand the shelter WiFi to everyone in the room,
// and it says so on its face ("this poster shares the hub WiFi with
// everyone who can see it — post it where that's the point").
// Threat-model §7 "Print surfaces" carries the analysis.
export default function PrintOfflineKitPage() {
  const { t } = useTranslation();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");

  const wifiQr = wifiQrValue({ ssid, password });
  const origin = shareOrigin();
  const host = new URL(origin).host;

  return (
    <div className="px-4 pb-8 pt-6 print:bg-white print:px-0 print:pb-0 print:pt-0 print:text-black">
      <PrintToolbar />

      {/* Screen-only setup: the hub's WiFi, typed by the member. */}
      <div className="mb-6 max-w-md rounded-xl bg-moss-50 p-4 dark:bg-moss-900/50 print:hidden">
        <h2 className="text-sm font-semibold text-canopy-800 dark:text-canopy-200">
          {t("print.kit.setup.title")}
        </h2>
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("print.kit.setup.body")}
        </p>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("print.kit.setup.ssid")}
          <input
            type="text"
            className="input mt-1"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder={t("print.kit.setup.ssidPlaceholder")}
          />
        </label>
        <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("print.kit.setup.password")}
          <input
            type="text"
            className="input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("print.kit.setup.passwordPlaceholder")}
          />
        </label>
      </div>

      {/* ---- The wall poster ---- */}
      <div className="mx-auto max-w-xl text-center">
        <h1 className="page-title print:text-black">
          {t("print.kit.poster.headline")}
        </h1>
        <p className="mt-1 text-sm font-medium text-moss-700 dark:text-moss-200 print:text-black">
          {host}
        </p>

        <ol className="mx-auto mt-6 flex max-w-md flex-col gap-6 text-left">
          <li>
            <p className="text-base font-semibold print:text-black">
              {t("print.kit.poster.step1")}
            </p>
            {ssid.trim() ? (
              <div className="mt-2 flex items-center gap-4">
                {wifiQr && (
                  <InviteQRCode
                    value={wifiQr}
                    size={140}
                    ariaLabel={t("print.kit.poster.wifiQrAria")}
                  />
                )}
                <div className="text-sm text-moss-700 dark:text-moss-200 print:text-black">
                  <p className="font-medium">{ssid.trim()}</p>
                  {password && (
                    <p className="mt-0.5">
                      {t("print.kit.poster.passwordLine", { password })}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-moss-700 dark:text-moss-200 print:text-black">
                {t("print.kit.poster.askForWifi")}
              </p>
            )}
          </li>
          <li>
            <p className="text-base font-semibold print:text-black">
              {t("print.kit.poster.step2", { host })}
            </p>
            <div className="mt-2 flex items-center gap-4">
              <InviteQRCode
                value={origin}
                size={140}
                ariaLabel={t("print.kit.poster.addressQrAria")}
              />
              <p className="text-sm text-moss-700 dark:text-moss-200 print:text-black">
                {t("print.kit.poster.sameAddress")}
              </p>
            </div>
          </li>
          <li>
            <p className="text-base font-semibold print:text-black">
              {t("print.kit.poster.step3")}
            </p>
            <p className="mt-1 text-sm text-moss-700 dark:text-moss-200 print:text-black">
              {t("print.kit.poster.step3Body")}
            </p>
          </li>
        </ol>

        {ssid.trim() && (
          <p className="mx-auto mt-6 max-w-md text-xs text-moss-600 dark:text-moss-300 print:text-black">
            {t("print.kit.poster.sharesWifi")}
          </p>
        )}
      </div>

      {/* ---- Wallet cards, 2-up ---- */}
      <div style={{ breakBefore: "page" }} className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300 print:text-black">
          {t("print.kit.cards.title")}
        </h2>
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300 print:text-black">
          {"✂ "}
          {t("print.kit.cards.cut")}
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-[336px] rounded border border-dashed border-moss-400 p-3 dark:border-moss-600 print:border-black/50"
              style={{ breakInside: "avoid" }}
            >
              <p className="text-sm font-semibold print:text-black">{host}</p>
              <p className="mt-1 text-xs text-moss-700 dark:text-moss-200 print:text-black">
                {t("print.kit.cards.body")}
              </p>
              <p className="mt-1 text-xs font-medium text-moss-700 dark:text-moss-200 print:text-black">
                {ssid.trim()
                  ? t("print.kit.cards.wifiLine", { ssid: ssid.trim() })
                  : t("print.kit.cards.askForWifi")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <PrintFooter />
    </div>
  );
}
