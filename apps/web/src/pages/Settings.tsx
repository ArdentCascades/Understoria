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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSection } from "@/components/LanguageSection";
import { AppearanceSection } from "@/components/AppearanceSection";
import { NodeSection } from "@/components/NodeSection";
import { SecuritySection } from "@/components/SecuritySection";
import { BlockedContactsPanel } from "@/components/BlockedContactsPanel";
import { exportData } from "@/lib/exportData";

// Device-local preferences and admin. Extracted from Profile.tsx so
// Profile can focus on community participation (who you are + what
// you've done) and Settings can hold the "how the app behaves on
// this device" concerns. Reachable from Profile's header gear icon.
//
// Five cards arranged in a CSS-columns layout at lg+ (2 columns —
// 5 cards isn't enough for 3 to balance well). Mobile falls through
// to single-column block flow with each card's existing `mb-4` for
// spacing. EmergencySection is NOT here — it stays on Profile per
// the privacy-as-precondition principle: panic buttons need to stay
// reachable in a stress moment, not buried under a settings tap.
export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("settings.back")}
        </button>
        <h1 className="page-title mt-2">{t("settings.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("settings.intro")}
        </p>
      </header>

      <div className="lg:columns-2 lg:gap-4 [&>*]:break-inside-avoid">
        <LanguageSection />

        <AppearanceSection />

        <BlockedContactsPanel />

        <NodeSection />

        <SecuritySection />

        <section className="card mb-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
            {t("profile.data.title")}
          </h2>
          <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
            {t("profile.data.intro")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={() => exportData()}
              type="button"
            >
              {t("profile.data.export")}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
