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
import { BackLink } from "@/components/BackLink";
import { LanguageSection } from "@/components/LanguageSection";
import { ReadAloudSection } from "@/components/ReadAloudSection";
import { AppearanceSection } from "@/components/AppearanceSection";
import { NodeSection } from "@/components/NodeSection";
import { ReseedSection } from "@/components/ReseedSection";
import { RecoveryKitCard } from "@/components/RecoveryKitCard";
import { GuardianShardsCard } from "@/components/GuardianShardsCard";
import { SecuritySection } from "@/components/SecuritySection";
import { BlockedContactsPanel } from "@/components/BlockedContactsPanel";
import { StorageWindowSection } from "@/components/StorageWindowSection";
import { exportData } from "@/lib/exportData";
import { BUILD_STAMP } from "@/lib/buildStamp";
import {
  formatBytes,
  readStorageStatus,
  type StorageStatus,
} from "@/lib/storageBudget";

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
  // Storage budget Phase 0 (docs/storage-budget.md): make the size
  // and eviction-protection state of this device's community copy
  // visible — a full device should fail legibly, not opaquely.
  const [storage, setStorage] = useState<StorageStatus | null>(null);
  useEffect(() => {
    let cancelled = false;
    void readStorageStatus().then((st) => {
      if (!cancelled) setStorage(st);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        {/* Settings' one parent is Profile (gear icon + the labeled
            Settings row). History-aware so returning restores
            Profile's scroll position; a cold entry still lands on
            /profile rather than a dead navigate(-1). */}
        <BackLink
          to="/profile"
          label={t("settings.back")}
          preferHistory
          className="btn-ghost -ml-2 text-sm"
        />
        <h1 className="page-title mt-2">{t("settings.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("settings.intro")}
        </p>
      </header>

      <div className="lg:columns-2 lg:gap-4 [&>*]:break-inside-avoid">
        <LanguageSection />
        <ReadAloudSection />

        <AppearanceSection />

        <BlockedContactsPanel />

        <NodeSection />

        <ReseedSection />

        <SecuritySection />

        <RecoveryKitCard />

        <GuardianShardsCard />

        <section className="card mb-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("profile.data.title")}
          </h2>
          <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
            {t("profile.data.intro")}
          </p>
          {storage && storage.usage !== null && (
            <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
              {t("profile.data.storageUsage", {
                size: formatBytes(storage.usage),
              })}
              {" · "}
              {storage.persisted === true
                ? t("profile.data.storageProtected")
                : storage.persisted === false
                  ? t("profile.data.storageUnprotected")
                  : t("profile.data.storageUnknown")}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={() => exportData()}
              type="button"
            >
              {t("profile.data.export")}
            </button>
          </div>
          <StorageWindowSection />
        </section>

        {/* Build stamp — the short id of the code this device is
            running (docs/operator-guide.md §6). Quiet, selectable, and
            deliberately at the very bottom: its one job is to answer
            "read me your build stamp" during the auto-confirm
            enforcement flip, not to invite attention. */}
        <p className="mt-2 text-center text-xs text-moss-600 dark:text-moss-300">
          <span className="select-all font-mono">
            {t("settings.buildStamp", { stamp: BUILD_STAMP })}
          </span>
        </p>
      </div>
    </div>
  );
}
