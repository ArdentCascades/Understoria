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
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "@understoria/shared";
import { useApp } from "@/state/AppContext";
import {
  fetchVapidKey,
  getPushPrefs,
  registerPushSubscription,
  savePushPrefs,
  teardownPushSubscription,
  defaultPushPrefs,
  type LockScreenTier,
  type PushDisplayStrings,
  type PushPrefs,
  type VapidKeyResult,
} from "@/lib/pushNotifications";
import {
  currentBrowserSubscription,
  currentPermission,
  pushSupported,
  requestNotificationPermission,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from "@/lib/pushBrowser";

/**
 * The notifications switchboard (docs/notifications.md — quiet by
 * default). Everything ships OFF; the section leads with "many
 * members never turn these on"; the browser permission prompt fires
 * only here, only at the member's first category, only AFTER the
 * vendor-metadata disclosure — and a denial is final: the app never
 * asks again on its own.
 *
 * What the node learns is category choices alone. The lock-screen
 * tier, the member-chosen title, and the display strings (snapshotted
 * PRE-LOCALIZED at save time, because the service worker has no i18n
 * runtime) live only in the device's prefs database, applied by
 * push-sw.js at display time.
 */

const CATEGORY_KEYS: Record<
  NotificationCategory,
  { label: string; desc: string; body: string }
> = {
  shift_reminder: {
    label: "push.catShift",
    desc: "push.catShiftDesc",
    body: "push.bodyShift",
  },
  guardian_request: {
    label: "push.catGuardian",
    desc: "push.catGuardianDesc",
    body: "push.bodyGuardian",
  },
  awaiting_confirmation: {
    label: "push.catConfirm",
    desc: "push.catConfirmDesc",
    body: "push.bodyConfirm",
  },
};

type Flow =
  | { kind: "idle" }
  /** Disclosure shown; the category the member reached for waits. */
  | { kind: "disclosure"; category: NotificationCategory }
  | { kind: "busy" }
  | { kind: "denied" }
  | { kind: "saveFailed" };

export function NotificationsSection() {
  const { t } = useTranslation();
  const { currentMember, lockState } = useApp();
  const supported = pushSupported();
  const [prefs, setPrefs] = useState<PushPrefs | null>(null);
  /** null = still checking. */
  const [vapid, setVapid] = useState<VapidKeyResult | null>(null);
  const [flow, setFlow] = useState<Flow>({ kind: "idle" });

  useEffect(() => {
    if (!supported) return;
    let alive = true;
    void getPushPrefs().then((p) => {
      if (alive) setPrefs(p);
    });
    void fetchVapidKey().then((result) => {
      if (alive) setVapid(result);
    });
    if (currentPermission() === "denied") setFlow({ kind: "denied" });
    return () => {
      alive = false;
    };
  }, [supported]);

  if (!supported) {
    return (
      <Shell>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("push.unsupported")}
        </p>
      </Shell>
    );
  }
  if (prefs === null || vapid === null) {
    return <Shell />;
  }
  // A member already subscribed keeps their switchboard whatever the
  // key probe said — the key is only needed to CREATE a subscription.
  // Everyone else gets the truthful story for their exact situation:
  // three different problems, three different fixes, three messages.
  if (vapid.kind !== "ok" && prefs.categories.length === 0) {
    return (
      <Shell>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {vapid.kind === "unconfigured"
            ? t("push.noNode")
            : vapid.kind === "unsupported"
              ? t("push.serverNoPush")
              : t("push.serverUnreachable")}
        </p>
        {vapid.kind === "unreachable" && (
          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={() => {
              setVapid(null);
              void fetchVapidKey().then(setVapid);
            }}
          >
            {t("common.tryAgain")}
          </button>
        )}
      </Shell>
    );
  }

  const memberKey = currentMember?.publicKey ?? null;
  const locked = lockState === "locked";
  const anyOn = prefs.categories.length > 0;

  /** The pre-localized snapshot push-sw.js will read at display
   *  time — rebuilt on every save so it tracks the app language. */
  function displayStrings(): PushDisplayStrings {
    return {
      generic: t("push.bodyGeneric"),
      named: Object.fromEntries(
        NOTIFICATION_CATEGORIES.map((c) => [c, t(CATEGORY_KEYS[c].body)]),
      ) as Record<NotificationCategory, string>,
    };
  }

  async function applyCategories(next: NotificationCategory[]) {
    if (!memberKey || !prefs) return;
    setFlow({ kind: "busy" });
    if (next.length === 0) {
      // Everything off: browser subscription dropped, node row
      // deleted (signed, best-effort), prefs cleared — then the
      // display choices are re-saved so turning one thing back on
      // later doesn't forget the member's tier and title.
      const { tier, title } = prefs;
      await unsubscribeBrowserPush();
      await teardownPushSubscription(memberKey);
      const cleared = { ...defaultPushPrefs(), tier, title };
      await savePushPrefs(cleared);
      setPrefs(cleared);
      setFlow({ kind: "idle" });
      return;
    }
    let subscription = await currentBrowserSubscription();
    if (!subscription) {
      subscription =
        vapid?.kind === "ok"
          ? await subscribeBrowserPush(vapid.publicKey)
          : null;
    }
    const ok =
      subscription !== null &&
      (await registerPushSubscription(memberKey, subscription, next).catch(
        () => false,
      ));
    if (!ok) {
      setFlow({ kind: "saveFailed" });
      return;
    }
    // registerPushSubscription persisted categories/endpoint; layer
    // the device-only display prefs on top of what it stored.
    const stored = await getPushPrefs();
    const updated = { ...stored, strings: displayStrings() };
    await savePushPrefs(updated);
    setPrefs(updated);
    setFlow({ kind: "idle" });
  }

  async function toggleCategory(category: NotificationCategory) {
    if (!prefs) return;
    const on = prefs.categories.includes(category);
    const next = on
      ? prefs.categories.filter((c) => c !== category)
      : [...prefs.categories, category];
    if (!on && prefs.categories.length === 0) {
      // First category: permission ceremony, disclosure first.
      const permission = currentPermission();
      if (permission === "denied") {
        setFlow({ kind: "denied" });
        return;
      }
      if (permission !== "granted") {
        setFlow({ kind: "disclosure", category });
        return;
      }
    }
    await applyCategories(next);
  }

  async function acceptDisclosure(category: NotificationCategory) {
    setFlow({ kind: "busy" });
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      setFlow({ kind: "denied" });
      return;
    }
    await applyCategories([category]);
  }

  /** Tier and title are device-only: saved locally, never sent. */
  async function saveDisplayPrefs(patch: Partial<PushPrefs>) {
    if (!prefs) return;
    const updated = { ...prefs, ...patch, strings: displayStrings() };
    await savePushPrefs(updated);
    setPrefs(updated);
  }

  const busy = flow.kind === "busy";

  return (
    <Shell>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("push.intro")}
      </p>
      {locked ? (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("push.locked")}
        </p>
      ) : flow.kind === "denied" ? (
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {t("push.permissionDenied")}
        </p>
      ) : (
        <>
          <h3 className="mb-2 text-sm font-semibold text-moss-700 dark:text-moss-200">
            {t("push.whatTitle")}
          </h3>
          <ul className="mb-3 space-y-2">
            {NOTIFICATION_CATEGORIES.map((category) => {
              const on = prefs.categories.includes(category);
              return (
                <li key={category}>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={on}
                      disabled={busy || !memberKey}
                      onChange={() => void toggleCategory(category)}
                    />
                    <span className="font-medium">
                      {t(CATEGORY_KEYS[category].label)}
                    </span>
                  </label>
                  <p className="ms-6 text-sm text-moss-600 dark:text-moss-300">
                    {t(CATEGORY_KEYS[category].desc)}
                  </p>
                </li>
              );
            })}
          </ul>
          {flow.kind === "disclosure" && (
            <div
              role="alertdialog"
              aria-labelledby="push-disclosure-title"
              className="mb-3 rounded-xl border border-moss-300 bg-moss-50 p-3 dark:border-moss-700 dark:bg-moss-900/40"
            >
              <h4
                id="push-disclosure-title"
                className="mb-1 text-sm font-semibold"
              >
                {t("push.disclosureTitle")}
              </h4>
              <p className="mb-3 text-sm text-moss-700 dark:text-moss-200">
                {t("push.disclosure")}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void acceptDisclosure(flow.category)}
                >
                  {t("push.disclosureContinue")}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setFlow({ kind: "idle" })}
                >
                  {t("push.disclosureCancel")}
                </button>
              </div>
            </div>
          )}
          {flow.kind === "saveFailed" && (
            <p role="alert" className="mb-3 text-sm text-moss-600 dark:text-moss-300">
              {t("push.saveFailed")}
            </p>
          )}
          {anyOn ? (
            <>
              <h3 className="mb-2 text-sm font-semibold text-moss-700 dark:text-moss-200">
                {t("push.lockTitle")}
              </h3>
              <ul className="mb-3 space-y-2">
                {(["silent", "generic", "named"] as LockScreenTier[]).map(
                  (tier) => (
                    <li key={tier}>
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name="push-tier"
                          className="mt-1"
                          checked={prefs.tier === tier}
                          disabled={busy}
                          onChange={() => void saveDisplayPrefs({ tier })}
                        />
                        <span>
                          {tier === "silent"
                            ? t("push.tierSilent")
                            : tier === "generic"
                              ? t("push.tierGeneric")
                              : t("push.tierNamed")}
                        </span>
                      </label>
                    </li>
                  ),
                )}
              </ul>
              <label className="mb-1 block text-sm font-semibold text-moss-700 dark:text-moss-200">
                {t("push.titleLabel")}
                <input
                  type="text"
                  className="input mt-1 w-full font-normal"
                  maxLength={40}
                  value={prefs.title ?? ""}
                  placeholder="Understoria"
                  disabled={busy}
                  onChange={(e) =>
                    void saveDisplayPrefs({
                      title: e.target.value.trim() === "" ? null : e.target.value,
                    })
                  }
                />
              </label>
              <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
                {t("push.titleHint")}
              </p>
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => void applyCategories([])}
              >
                {t("push.turnAllOff")}
              </button>
            </>
          ) : (
            flow.kind === "idle" && (
              <p className="text-xs text-moss-600 dark:text-moss-300">
                {t("push.allOff")}
              </p>
            )
          )}
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <section className="card mb-4" aria-labelledby="push-title">
      <h2
        id="push-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        <span aria-hidden="true" className="me-1">
          🔔
        </span>
        {t("push.title")}
      </h2>
      {children}
    </section>
  );
}
