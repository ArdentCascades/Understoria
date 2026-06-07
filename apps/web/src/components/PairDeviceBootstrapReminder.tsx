/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useTranslation } from "react-i18next";

interface PairDeviceBootstrapReminderProps {
  onContinue: () => void;
}

/**
 * The §7.5 "what to expect" reminder shown on the destination
 * device right before it lands on the Board. Names the things the
 * new device starts WITHOUT — DM history, drafts, settings — so
 * the member doesn't discover the empty DM list as a bug.
 *
 * Pulls bullets from i18n so the wording matches the comparison
 * card on the source device's wizard (en + es parity).
 */
export function PairDeviceBootstrapReminder({
  onContinue,
}: PairDeviceBootstrapReminderProps) {
  const { t } = useTranslation();
  const bullets = [
    t("pairDevice.bootstrap.bullets.noDms"),
    t("pairDevice.bootstrap.bullets.noDrafts"),
    t("pairDevice.bootstrap.bullets.noPrefs"),
  ];
  return (
    <section
      className="card flex flex-col gap-4"
      aria-labelledby="pairDevice-bootstrap-heading"
    >
      <h2
        id="pairDevice-bootstrap-heading"
        className="page-title text-base"
      >
        {t("pairDevice.bootstrap.title")}
      </h2>
      <p className="text-sm text-moss-700 dark:text-moss-200">
        {t("pairDevice.bootstrap.intro")}
      </p>
      <ul className="flex flex-col gap-2 text-sm text-moss-700 dark:text-moss-200">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden="true" className="shrink-0 text-moss-500">
              {"•"}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("pairDevice.bootstrap.outro")}
      </p>
      <div className="flex justify-end">
        <button type="button" className="btn-primary" onClick={onContinue}>
          {t("pairDevice.bootstrap.continue")}
        </button>
      </div>
    </section>
  );
}
