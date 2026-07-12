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
import { getSetting } from "@/db/database";
import { listNodeEndpoints, nodeSuccessKey } from "@/lib/nodeEndpoints";
import { getWindowHorizonMs, YEAR_MS } from "@/lib/storageWindow";
import { countActiveSeedVaults } from "@/lib/seedVault";
import {
  computeResilience,
  isRecentSuccess,
  nodeFreshness,
  type NodeFreshness,
  type ResilienceSnapshot,
} from "@/lib/resilience";

// "Community resilience" — docs/community-resilience.md Phase A + B.
// Makes the structural difference from corporate centralization
// visible: the trunk row shows how many servers carry this community
// (the primary plus every consented mirror, each with a quiet
// freshness leaf), the replica line names the fact that every
// member's device already holds a complete signed copy, and the
// dashed empty trunk IS the call to action — it opens the guided
// "Grow another root" wizard (/grow-root), which replaced the static
// add-a-node Help entry. With two or more nodes answering, the tier
// climbs (sturdy / deep_rooted) and the copy makes the takedown story
// concrete: if one server disappears, apps switch to the others on
// their own. Wording tiers, never a numeric score (no-leaderboards
// applies to infrastructure too); no red styling anywhere — a small
// community with one lovingly-run node is healthy, not failing.
// Renders entirely from local settings + tables: zero new wire bytes.
export function ResilienceCard() {
  const { t } = useTranslation();
  const { members, capacityPostures } = useApp();
  const [snapshot, setSnapshot] = useState<ResilienceSnapshot | null>(null);
  const [leaves, setLeaves] = useState<NodeFreshness[]>([]);
  // Storage windowing (docs/storage-budget.md Phase 1): the replica
  // claim becomes conditional on a windowed device — never say more
  // than THIS device's copy delivers.
  const [windowYears, setWindowYears] = useState<number | null>(null);
  // Seed vaults (docs/storage-budget.md Phase 2): members who pledge
  // the complete archive — counted like nodes, not like members.
  const [seedVaults, setSeedVaults] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void getWindowHorizonMs().then((ms) => {
      if (!cancelled) setWindowYears(ms === null ? null : Math.round(ms / YEAR_MS));
    });
    void countActiveSeedVaults().then((n) => {
      if (!cancelled) setSeedVaults(n);
    });
    void (async () => {
      const { primary, endpoints } = await listNodeEndpoints();
      const freshness: NodeFreshness[] = [];
      let reachable = 0;
      for (const url of endpoints) {
        const lastSuccess = await getSetting(
          nodeSuccessKey(url, primary ?? url),
        );
        freshness.push(nodeFreshness(lastSuccess));
        if (isRecentSuccess(lastSuccess)) reachable += 1;
      }
      if (!cancelled) {
        setLeaves(freshness);
        setSnapshot(
          computeResilience({
            nodesConfigured: endpoints.length,
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
  const failoverLive = snapshot.tier === "sturdy" || snapshot.tier === "deep_rooted";
  // Copy elevation (docs/capacity-forecast.md §5.2): when the community's
  // node reports RED pressure AND no healthy mirror has failed over yet
  // (nodesReachable < 2), lean the resilience card toward "grow a root"
  // — the response that distributes the load. Coarse and honest: a band,
  // never a number, and never a word about who hosts.
  const capacityRed =
    capacityPostures.some((p) => p.pressure === "red") &&
    snapshot.nodesReachable < 2;
  const LEAF_CLASS: Record<NodeFreshness, string> = {
    fresh: "bg-canopy-500",
    lagging: "bg-amber-400",
    quiet: "bg-moss-300 dark:bg-moss-600",
  };

  return (
    <section className="card mb-4" aria-labelledby="resilience-title">
      <h2
        id="resilience-title"
        className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("dashboard.resilience.title")}
      </h2>

      {/* Trunk row: one tree per node (with its freshness leaf); the
          dashed slot is the CTA. */}
      <div className="mb-2 flex items-center gap-2" aria-hidden="true">
        {leaves.map((freshness, i) => (
          <span
            key={`node-${i}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-canopy-50 text-xl dark:bg-canopy-950/40"
            title={`${t("dashboard.resilience.nodeTitle")} — ${t(`dashboard.resilience.leaf.${freshness}`)}`}
          >
            🌳
            <span
              className={`absolute right-1 top-1 h-2 w-2 rounded-full ${LEAF_CLASS[freshness]}`}
            />
          </span>
        ))}
        <Link
          to="/grow-root"
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-moss-300 text-lg text-moss-600 hover:border-canopy-500 hover:text-canopy-600 dark:border-moss-700 dark:text-moss-300 dark:hover:border-canopy-400"
          title={t("dashboard.resilience.cta")}
        >
          +
        </Link>
        <span className="ml-1 text-sm font-medium text-canopy-800 dark:text-canopy-200">
          {tierLabel}
        </span>
      </div>

      {seedVaults > 0 && (
        <p className="mb-1 text-xs text-moss-600 dark:text-moss-300">
          {t(
            seedVaults === 1
              ? "dashboard.resilience.seedVaultsOne"
              : "dashboard.resilience.seedVaultsOther",
            { count: seedVaults },
          )}
        </p>
      )}

      <p className="text-sm text-moss-700 dark:text-moss-200">
        {snapshot.tier === "seedling"
          ? t("dashboard.resilience.bodySeedling")
          : snapshot.nodesConfigured > 1
            ? t(
                snapshot.memberCount === 1
                  ? "dashboard.resilience.bodyMultiOne"
                  : "dashboard.resilience.bodyMultiOther",
                {
                  count: snapshot.memberCount,
                  nodes: snapshot.nodesConfigured,
                },
              )
            : t(
                snapshot.memberCount === 1
                  ? "dashboard.resilience.bodyOne"
                  : "dashboard.resilience.bodyOther",
                { count: snapshot.memberCount },
              )}
      </p>
      {failoverLive && (
        <p className="mt-1 text-sm text-moss-700 dark:text-moss-200">
          {t("dashboard.resilience.bodyFailover")}
        </p>
      )}
      {windowYears !== null && (
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("dashboard.resilience.windowedNote", { years: windowYears })}
        </p>
      )}
      {snapshot.nodeQuiet && (
        <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
          {t("dashboard.resilience.nodeQuiet")}
        </p>
      )}
      {capacityRed && (
        <p className="mt-2 rounded-lg bg-red-50 px-2 py-1 text-sm font-medium text-red-900 dark:bg-red-950/40 dark:text-red-100">
          {t("dashboard.resilience.capacityRed")}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Link
          to="/grow-root"
          className="inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("dashboard.resilience.cta")} →
        </Link>
        {/* The detail affordance (desktop-power-tools plan 4): the
            full infrastructure picture — every server's health, this
            device's outbox, governance posture, drill checklists.
            Every member can read it; that IS the posture. */}
        <Link
          to="/infrastructure"
          className="inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("dashboard.resilience.infraLink")} →
        </Link>
      </div>
    </section>
  );
}
