/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useTranslation } from "react-i18next";

/**
 * The "what does and doesn't transfer" card shown as the first step
 * of the AddDevice wizard. Per `docs/device-pairing.md` §6.2 — members
 * see concrete consequences BEFORE the QR appears, not after.
 *
 * The copy is in the i18n files; the structure is fixed so screen
 * readers parse it as two parallel lists.
 */
export function DevicePairingComparisonCard() {
  const { t } = useTranslation();

  const transfers = [
    {
      label: t("addDevice.comparison.transfers.identity"),
      detail: t("addDevice.comparison.transfers.identityDetail"),
    },
    {
      label: t("addDevice.comparison.transfers.profile"),
      detail: t("addDevice.comparison.transfers.profileDetail"),
    },
    {
      label: t("addDevice.comparison.transfers.balance"),
      detail: t("addDevice.comparison.transfers.balanceDetail"),
    },
  ];

  const stays = [
    {
      label: t("addDevice.comparison.stays.dms"),
      detail: t("addDevice.comparison.stays.dmsDetail"),
    },
    {
      label: t("addDevice.comparison.stays.drafts"),
      detail: t("addDevice.comparison.stays.draftsDetail"),
    },
    {
      label: t("addDevice.comparison.stays.themeDensity"),
      detail: t("addDevice.comparison.stays.themeDensityDetail"),
    },
    {
      label: t("addDevice.comparison.stays.achievements"),
      detail: t("addDevice.comparison.stays.achievementsDetail"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="addDevice-transfers-heading">
        <h2
          id="addDevice-transfers-heading"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-canopy-700 dark:text-canopy-300"
        >
          {t("addDevice.comparison.transfersTitle")}
        </h2>
        <ul className="flex flex-col gap-3">
          {transfers.map((row) => (
            <li key={row.label} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canopy-100 text-canopy-800 dark:bg-canopy-900/40 dark:text-canopy-200"
              >
                {"✓"}
              </span>
              <div>
                <div className="font-medium">{row.label}</div>
                <div className="text-sm text-moss-600 dark:text-moss-300">
                  {row.detail}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="addDevice-stays-heading">
        <h2
          id="addDevice-stays-heading"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300"
        >
          {t("addDevice.comparison.staysTitle")}
        </h2>
        <ul className="flex flex-col gap-3">
          {stays.map((row) => (
            <li key={row.label} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-moss-300 text-moss-500 dark:border-moss-600 dark:text-moss-300"
              >
                {"○"}
              </span>
              <div>
                <div className="font-medium">{row.label}</div>
                <div className="text-sm text-moss-600 dark:text-moss-300">
                  {row.detail}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
