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
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { flushOutboxNow } from "@/lib/outbox";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useVirtualKeyboardOpen } from "@/lib/useVirtualKeyboard";
import { useToast } from "@/state/ToastContext";

// Ambient state, not a notification. The banner reflects a condition
// the member is already living in (no connectivity); it never buzzes,
// never counts unread anything, and disappears the moment the
// condition does. The pending count exists so a member on precarious
// connectivity KNOWS their post/exchange is safely queued rather than
// lost — transparency about capacity, per the local-first design.
//
// Placement: a slim fixed strip hovering just above the BottomNav,
// using the same `5rem + safe-area` bottom clearance that <main>
// already reserves for the nav (and `4rem` on lg, where the nav is
// sticky with no safe-area padding). Layout adds matching bottom
// padding to <main> while the banner is visible, so no content is
// ever hidden behind it.
//
// Tone: bark (warm neutral), deliberately NOT alarm-red. Offline is
// a normal condition for this community, not an error — the copy and
// the palette both say "everything still works".
//
// The wrapper with role="status" stays mounted even while online so
// screen readers have a stable polite live region: going offline
// announces the message once; coming back simply empties it.

export function OfflineBanner() {
  const { t } = useTranslation();
  const online = useOnlineStatus();
  const { showToast } = useToast();
  const keyboardOpen = useVirtualKeyboardOpen();

  // Read-only view of the outbox: rows the worker hasn't delivered
  // yet. Live so a post created while offline bumps the count
  // immediately. Default 0 while Dexie resolves.
  const pendingCount = useLiveQuery(
    () => db.outbox.where("status").equals("pending").count(),
    [],
    0,
  );
  const pendingRef = useRef(pendingCount);
  pendingRef.current = pendingCount;

  // On reconnect: nudge the outbox worker so queued rows go out now
  // rather than on the next backoff tick, and — only if something was
  // actually queued — show one auto-dismissing toast confirming it.
  // No pending rows → the banner just disappears, nothing else.
  const wasOffline = useRef(false);
  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      if (pendingRef.current > 0) {
        showToast(t("offline.backOnline"), "info");
        void flushOutboxNow();
      }
    }
  }, [online, showToast, t]);

  return (
    <div
      role="status"
      aria-live="polite"
      // opacity (not unmount / visibility) while the keyboard is up:
      // the strip is fixed-positioned and would float detached
      // mid-screen (see useVirtualKeyboard.ts), but the live region
      // must stay in the a11y tree so offline transitions announce
      // exactly once regardless of keyboard state.
      className={`pointer-events-none fixed inset-x-0 z-20 px-4
                 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-16
                 ${keyboardOpen ? "opacity-0" : ""}`}
    >
      {!online && (
        <div
          className="mx-auto max-w-screen-md rounded-xl border border-bark-200
                     bg-bark-100/95 px-4 py-2 text-sm text-bark-800 shadow-sm
                     backdrop-blur supports-[backdrop-filter]:bg-bark-100/80
                     dark:border-bark-700 dark:bg-bark-800/95 dark:text-bark-100
                     lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-[1440px]"
        >
          <p>{t("offline.banner")}</p>
          {pendingCount > 0 && (
            <p className="mt-0.5 text-bark-600 dark:text-bark-300">
              {t("offline.pendingCount", { count: pendingCount })}
            </p>
          )}
          {/* The one actionable line: the outage playbook (in-person
              confirm, storm hub) lives on Help where it's findable in
              fair weather too. The banner wrapper is
              pointer-events-none by design; the link re-enables its
              own hit area. */}
          <Link
            to="/help#internet-outage"
            className="touch-target pointer-events-auto mt-0.5 inline-flex
                       items-center text-sm font-medium text-bark-700
                       underline-offset-2 hover:underline dark:text-bark-200"
          >
            {t("offline.guideLink")} →
          </Link>
        </div>
      )}
    </div>
  );
}
