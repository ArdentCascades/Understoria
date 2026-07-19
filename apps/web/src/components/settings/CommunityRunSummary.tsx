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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";

// The face of the "How this community is run" zone: a READ-ONLY mirror
// of the thresholds this community currently runs on, followed by the
// two doorways that match how these are meant to change — a proposal
// for the community to discuss, and the list of proposals already open.
//
// This is the honest posture. These values are node config today, and
// during bootstrap any member can still edit them (the collapsed
// CommunitySettingsSection below this card is that path) — but the
// DEFAULT presentation is "here's what we run on; change it together,"
// not a live form that reads like a personal preference. When the
// vote-to-adopt pipeline lands (roadmap Agent 13) the bootstrap editor
// retires and this summary attributes each value to the proposal that
// carried it; the doorways below already point the right way.
export function CommunityRunSummary() {
  const { t } = useTranslation();
  const { nodeConfig } = useApp();

  const rows: { label: string; value: string }[] = [
    {
      label: t("profile.communitySettings.dailyLimit.label"),
      value: String(nodeConfig.dailyHelperLimit),
    },
    {
      label: t("profile.communitySettings.deliberationDays.label"),
      value: String(nodeConfig.proposalDeliberationDays),
    },
    {
      label: t("profile.communitySettings.minAffirms.label"),
      value: String(nodeConfig.proposalMinAffirms),
    },
    {
      label: t("profile.communitySettings.taskCheckInDays.label"),
      value: String(nodeConfig.taskCheckInDays),
    },
    {
      label: t("community.autoConfirmHours.label"),
      value: String(nodeConfig.autoConfirmHours),
    },
    {
      label: t("profile.communitySettings.inviteOnly.label"),
      value: nodeConfig.inviteOnly
        ? t("settings.community.summary.on")
        : t("settings.community.summary.off"),
    },
  ];

  return (
    <section className="card mb-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("settings.community.summary.title")}
      </h3>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("settings.community.summary.intro")}
      </p>

      <dl className="divide-y divide-bark-100 dark:divide-moss-800">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-4 py-1.5"
          >
            <dt className="text-sm text-moss-700 dark:text-moss-200">
              {r.label}
            </dt>
            <dd className="shrink-0 font-mono text-sm text-canopy-800 dark:text-canopy-200">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/proposals/new" className="btn-secondary text-sm">
          {t("settings.community.summary.proposeChange")}
        </Link>
        <Link to="/proposals" className="btn-ghost text-sm">
          {t("settings.community.summary.seeProposals")}
        </Link>
      </div>
    </section>
  );
}
