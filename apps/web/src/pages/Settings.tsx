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
import { SettingsZone } from "@/components/settings/SettingsZone";
import { CommunityRunSummary } from "@/components/settings/CommunityRunSummary";
import { CommunitySettingsSection } from "@/components/CommunitySettingsSection";
import { exportData } from "@/lib/exportData";
import { BUILD_STAMP } from "@/lib/buildStamp";
import {
  formatBytes,
  readStorageStatus,
  type StorageStatus,
} from "@/lib/storageBudget";

// Settings, organized by SOURCE OF AUTHORITY — the one question that
// matters at a control: who can change this, and how? Three zones
// (see SettingsZone) answer it in order of how close the power sits to
// you:
//   1. On this device        — you flip these; device-local, unsynced.
//   2. How this community is run — decided together, by proposal & vote.
//   3. This node              — set up by whoever runs the server.
// The old flat CSS-columns wall mixed all three, so a community
// threshold read like a personal toggle. Now each zone carries a plain
// authority lead-in, and a control that would misrepresent who holds
// power over it has no honest home to sit in.
//
// EmergencySection is NOT here — it stays on Profile per the
// privacy-as-precondition principle: panic buttons need to stay
// reachable in a stress moment, not buried under a settings tap.
// CommunitySettingsSection moved OFF Profile into zone 2 here — two
// live editors for one node config was a footgun; the read-only
// summary is now the face, the editable form the collapsed bootstrap
// path beneath it.
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
      <header className="mb-4 landscape-short:mb-2">
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
        <p className="page-subtitle text-sm text-moss-600 dark:text-moss-300">
          {t("settings.intro")}
        </p>
      </header>

      <SettingsZone
        id="device"
        title={t("settings.zones.device.title")}
        authority={t("settings.zones.device.authority")}
        columns
      >
        <LanguageSection />
        <ReadAloudSection />

        <AppearanceSection />

        <BlockedContactsPanel />

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
      </SettingsZone>

      <SettingsZone
        id="community"
        title={t("settings.zones.community.title")}
        authority={t("settings.zones.community.authority")}
      >
        {/* Read-only mirror of the community's thresholds + the two
            governance doorways — the honest face of "these are decided
            together." The editable form below it is the bootstrap path
            (any member, until vote-to-adopt ships), collapsed so it
            doesn't read like a personal switch. */}
        <CommunityRunSummary />
        <CommunitySettingsSection />
      </SettingsZone>

      <SettingsZone
        id="node"
        title={t("settings.zones.node.title")}
        authority={t("settings.zones.node.authority")}
      >
        {/* Your device's link to the community server, plus the
            server-side recovery path. How the node itself is set up is
            the operator's domain; the founder-claim card inside
            NodeSection self-reveals only on a fresh, unclaimed node. */}
        <NodeSection />
        <ReseedSection />
      </SettingsZone>

      <div>
        {/* The permanent beta/AI disclosure — the always-findable
            copy of the entry-door BetaNotice card (the other lives
            in Help, FAQ "beta-status"). Quiet by design; it belongs
            with the build stamp because both answer "what code am I
            actually running?" */}
        <p className="mt-6 text-center text-xs text-moss-600 dark:text-moss-300">
          {t("settings.betaLine")}
        </p>
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
