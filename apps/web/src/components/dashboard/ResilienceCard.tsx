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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { getSetting, SETTING_KEYS } from "@/db/database";
import {
  computeResilience,
  isRecentSuccess,
  type ResilienceSnapshot,
} from "@/lib/resilience";

// "Community resilience" — docs/community-resilience.md Phase A.
// Makes the structural difference from corporate centralization
// visible: the trunk row shows how many servers carry this community
// (Phase A: at most one, honestly), the replica line names the fact
// that every member's device already holds a complete signed copy,
// and the dashed empty trunk IS the call to action — it links to the
// add-a-node Help entry. Wording tiers, never a numeric score
// (no-leaderboards applies to infrastructure too); no red styling at
// tier one — a small community with one lovingly-run node is healthy,
// not failing. Renders entirely from local settings + tables: zero
// new wire bytes.
export function ResilienceCard() {
  const { t } = useTranslation();
  const { members } = useApp();
  const [snapshot, setSnapshot] = useState<ResilienceSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [enabled, url, lastSuccess] = await Promise.all([
        getSetting(SETTING_KEYS.communityNodeEnabled),
        getSetting(SETTING_KEYS.communityNodeUrl),
        getSetting(SETTING_KEYS.communityNodeLastSuccess),
      ]);
      const configured = enabled === "1" && !!url?.trim() ? 1 : 0;
      const reachable =
        configured === 1 && isRecentSuccess(lastSuccess) ? 1 : 0;
      if (!cancelled) {
        setSnapshot(
          computeResilience({
            nodesConfigured: configured,
            nodesReachable: reachable,
            memberCount: members.length,
          }),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [members.length]);

  if (!snapshot) return null;

  const tierLabel = t(`dashboard.resilience.tier.${snapshot.tier}`);
  const filledTrunks = snapshot.nodesConfigured;

  return (
    <section className="card mb-4" aria-labelledby="resilience-title">
      <h2
        id="resilience-title"
        className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("dashboard.resilience.title")}
      </h2>

      {/* Trunk row: one tree per node; the dashed slot is the CTA. */}
      <div className="mb-2 flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: filledTrunks }, (_, i) => (
          <span
            key={`node-${i}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-canopy-50 text-xl dark:bg-canopy-950/40"
            title={t("dashboard.resilience.nodeTitle")}
          >
            🌳
          </span>
        ))}
        <Link
          to="/help#add-a-node"
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-moss-300 text-lg text-moss-500 hover:border-canopy-500 hover:text-canopy-600 dark:border-moss-700 dark:text-moss-400 dark:hover:border-canopy-400"
          title={t("dashboard.resilience.cta")}
        >
          +
        </Link>
        <span className="ml-1 text-sm font-medium text-canopy-800 dark:text-canopy-200">
          {tierLabel}
        </span>
      </div>

      <p className="text-sm text-moss-700 dark:text-moss-200">
        {snapshot.tier === "seedling"
          ? t("dashboard.resilience.bodySeedling")
          : t(
              snapshot.memberCount === 1
                ? "dashboard.resilience.bodyOne"
                : "dashboard.resilience.bodyOther",
              { count: snapshot.memberCount },
            )}
      </p>
      {snapshot.nodeQuiet && (
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("dashboard.resilience.nodeQuiet")}
        </p>
      )}

      <Link
        to="/help#add-a-node"
        className="mt-2 inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
      >
        {t("dashboard.resilience.cta")} →
      </Link>
    </section>
  );
}
