/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSetting, setSetting } from "@/db/database";

export function ContextualHint({
  settingKey,
  ariaLabel,
  message,
  dismissLabel,
}: {
  settingKey: string;
  ariaLabel: string;
  message: string;
  dismissLabel?: string;
}) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSetting(settingKey).then((v) => {
      if (!cancelled) setDismissed(v === "1");
    });
    return () => {
      cancelled = true;
    };
  }, [settingKey]);

  if (dismissed !== false) return null;

  async function handleDismiss() {
    await setSetting(settingKey, "1");
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-canopy-200
                 bg-canopy-50 px-3 py-2 text-sm
                 dark:border-canopy-900 dark:bg-canopy-950/40"
    >
      <p className="text-canopy-900 dark:text-canopy-100">{message}</p>
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void handleDismiss()}
        >
          {dismissLabel ?? t("common.gotIt")}
        </button>
      </div>
    </div>
  );
}
