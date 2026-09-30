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
import { IllustrationSapling } from "@/components/visual";

// How long "Growing your community…" may stand before it starts
// lying. Boot is a handful of local reads — even a slow device
// finishes in well under a second — so ten quiet seconds means the
// storage engine is not going to answer (the wedged-WebKit state the
// boot nudge in lib/idbNudge couldn't clear), and the splash owes the
// member the honest way out instead of eternal growth.
const STUCK_AFTER_MS = 10_000;

/**
 * The boot splash. Pretty patience first; past STUCK_AFTER_MS it
 * turns into recovery guidance — reload for the lucky case, and the
 * action that always works on iOS (fully closing the app restarts
 * WebKit's storage process) named in words. If boot completes late,
 * the parent unmounts us and the app proceeds normally.
 */
export function Splash() {
  const { t } = useTranslation();
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setStuck(true), STUCK_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-stack-sm px-6 text-center">
      <IllustrationSapling className="text-canopy-700 dark:text-canopy-300" />
      <p className="text-moss-600 dark:text-moss-300">{t("common.loading")}</p>
      {stuck && (
        <div
          role="status"
          className="flex max-w-sm flex-col items-center gap-3"
        >
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("common.loadingStuck")}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            {t("common.tryAgain")}
          </button>
        </div>
      )}
    </div>
  );
}
