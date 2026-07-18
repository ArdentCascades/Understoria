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
import { IS_DEMO, resetDemo } from "@/lib/demo";

// A slim strip across the very top of the app, shown ONLY in a demo
// build (see lib/demo.ts). It sets honest expectations — this is a
// throwaway tour that lives only in the visitor's browser — and offers
// a one-tap "start over" so anyone can hand the demo to the next person
// clean. In a real (non-demo) build this renders nothing and the whole
// component tree-shakes away with the `IS_DEMO` constant.
//
// print:hidden: the strip is chrome, not content — same posture as the
// header, nav, and offline banner (Layout.tsx). Reset is a two-step
// inline confirm rather than a browser `confirm()` so it stays inside
// the app's look and is reachable by keyboard and screen reader.
export function DemoBanner() {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!IS_DEMO) return null;

  return (
    // landscape-short (a phone held sideways — tailwind.config.js):
    // the viewport is ~400px tall, so the banner slims to a single
    // truncated line (title attr keeps the full sentence a long-press
    // away) with tighter padding and a smaller font. The reset /
    // confirm affordances stay visible — only the prose compresses.
    <div
      role="note"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ember-600 px-4 py-1.5 text-center text-sm text-white print:hidden landscape-short:flex-nowrap landscape-short:gap-x-2 landscape-short:px-3 landscape-short:py-0.5 landscape-short:text-xs"
    >
      <p
        className="font-medium landscape-short:min-w-0 landscape-short:truncate"
        title={t("demo.banner")}
      >
        <span aria-hidden="true">🌱 </span>
        {t("demo.banner")}
      </p>
      {confirming ? (
        <span className="inline-flex items-center gap-2 landscape-short:shrink-0">
          <span>{t("demo.reset.confirm")}</span>
          <button
            type="button"
            onClick={() => {
              setResetting(true);
              void resetDemo();
            }}
            disabled={resetting}
            className="rounded-md bg-white/20 px-2 py-0.5 font-semibold underline-offset-2 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-70"
          >
            {resetting ? t("demo.reset.working") : t("demo.reset.yes")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={resetting}
            className="rounded-md px-2 py-0.5 underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t("demo.reset.no")}
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md bg-white/20 px-2 py-0.5 font-semibold hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white landscape-short:shrink-0 landscape-short:whitespace-nowrap"
        >
          {t("demo.reset.cta")}
        </button>
      )}
    </div>
  );
}
