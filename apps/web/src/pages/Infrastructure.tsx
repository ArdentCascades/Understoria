/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { SoleFounderCard } from "@/components/SoleFounderCard";
import { shareOrigin } from "@/lib/appOrigin";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import {
  LAST_SEEN_REMOVAL_QUORUM,
  listNodeEndpoints,
  nodeSuccessKey,
} from "@/lib/nodeEndpoints";
import { nodeFreshness } from "@/lib/resilience";
import {
  drillState,
  markDrilled,
  parseDrillChecklists,
  probeEndpoints,
  resetDrill,
  serializeDrillChecklists,
  toggleDrillStep,
  type DrillChecklists,
  type EndpointStatus,
} from "@/lib/infraStatus";

// "Community infrastructure" (docs/desktop-power-tools.md plan 4):
// the runbooks turned into a page you can see is green — servers and
// their health, what this device is carrying, the governance posture,
// and the two disaster drills as trackable checklists.
//
// Deliberately NOT operator-gated. Everything shown is either already
// public (GET /health, GET /config), already on this device (outbox,
// sync telemetry, member count), or already community-legible by
// design (docs/operator-powers.md). A page every member can read IS
// the transparency posture — there is no operator-only view to gate.
//
// Honesty rules carried from the resilience card: probes from this
// device can only say "answered" / "didn't answer from here" (a
// member's own spotty WiFi must never paint the community's server
// as down), and nothing here scores, ranks, or alarms — no red
// anywhere, information over urgency.

/** The drills, in the order the docs recommend running them.
 *  Step TEXT lives in i18n (infra.drills.<id>.step1..N); the docs
 *  named in each card remain the source of truth. */
const DRILLS = [
  { id: "stormHub", steps: 6, docRef: "docs/offline-resilience.md §4" },
  { id: "reseed", steps: 6, docRef: "docs/community-reseed.md" },
  { id: "flashDrive", steps: 5, docRef: "docs/flash-drive-install.md §6" },
] as const;

export default function InfrastructurePage() {
  const { t } = useTranslation();
  const { members, proposals, nodeId, communityNodeIds } = useApp();

  // --- servers ---------------------------------------------------------
  const [probing, setProbing] = useState(false);
  const [statuses, setStatuses] = useState<EndpointStatus[] | null>(null);

  const runProbe = useCallback(async () => {
    setProbing(true);
    try {
      const { primary, endpoints } = await listNodeEndpoints();
      if (endpoints.length === 0) {
        setStatuses([]);
        return;
      }
      setStatuses(
        await probeEndpoints({
          endpoints,
          primaryUrl: primary,
          expectedNodeIds: communityNodeIds.size > 0 ? communityNodeIds : null,
        }),
      );
    } finally {
      setProbing(false);
    }
  }, [communityNodeIds]);

  useEffect(() => {
    void runProbe();
  }, [runProbe]);

  // --- this device ------------------------------------------------------
  const outboxPending = useLiveQuery(
    () => db.outbox.where("status").equals("pending").count(),
    [],
    0,
  );
  const outboxPoisoned = useLiveQuery(
    () => db.outbox.where("status").equals("poisoned").count(),
    [],
    0,
  );
  const [lastSync, setLastSync] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { primary } = await listNodeEndpoints();
      if (!primary) return;
      const iso = await getSetting(nodeSuccessKey(primary, primary));
      if (!cancelled) setLastSync(iso ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- governance -------------------------------------------------------
  const openProposals = useMemo(
    () => proposals.filter((p) => p.status === "open").length,
    [proposals],
  );
  const [quorum, setQuorum] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getSetting(LAST_SEEN_REMOVAL_QUORUM).then((v) => {
      if (!cancelled) setQuorum(v ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- drills -----------------------------------------------------------
  const [drills, setDrills] = useState<DrillChecklists>({});
  useEffect(() => {
    let cancelled = false;
    void getSetting(SETTING_KEYS.drillChecklists).then((raw) => {
      if (!cancelled) setDrills(parseDrillChecklists(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const persistDrills = useCallback((next: DrillChecklists) => {
    setDrills(next);
    void setSetting(
      SETTING_KEYS.drillChecklists,
      serializeDrillChecklists(next),
    );
  }, []);

  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  return (
    <div className="px-4 pb-8 pt-6">
      <header className="mb-4 landscape-short:mb-2">
        <h1 className="page-title">{t("infra.title")}</h1>
        <p className="page-subtitle text-sm text-moss-600 dark:text-moss-300">
          {t("infra.tagline")}
        </p>
      </header>

      {/* Single-founder posture (docs/cofounder-ceremony-plan.md P4):
          on the page about what keeps the community standing, one
          trust root is the first thing worth seeing. Renders only for
          the sole founder. */}
      <SoleFounderCard />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-4">
        {/* Servers */}
        <section className="card mb-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("infra.servers.title")}
          </h2>
          {statuses === null || (probing && statuses.length === 0) ? (
            <p className="text-sm text-moss-600 dark:text-moss-300">
              {t("infra.servers.checking")}
            </p>
          ) : statuses.length === 0 ? (
            <>
              <p className="text-sm text-moss-700 dark:text-moss-200">
                {t("infra.servers.none")}
              </p>
              <Link
                to="/grow-root"
                className="mt-2 inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              >
                {t("dashboard.resilience.cta")} →
              </Link>
            </>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {statuses.map((s) => (
                  <li
                    key={s.url}
                    className="rounded-lg bg-moss-50 px-3 py-2 dark:bg-moss-900/50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span aria-hidden="true">🌳</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                        {t(
                          s.isPrimary
                            ? "infra.servers.primary"
                            : "infra.servers.mirror",
                        )}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.healthy
                            ? "bg-canopy-100 text-canopy-800 dark:bg-canopy-950/60 dark:text-canopy-200"
                            : "bg-moss-200 text-moss-700 dark:bg-moss-800 dark:text-moss-200"
                        }`}
                      >
                        {t(
                          s.healthy
                            ? "infra.servers.answered"
                            : "infra.servers.noAnswer",
                        )}
                      </span>
                    </div>
                    <p className="mt-1 break-all text-sm text-moss-700 dark:text-moss-200">
                      {s.url}
                    </p>
                    {s.nodeId && (
                      <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
                        {t("infra.servers.nodeId", { nodeId: s.nodeId })}
                      </p>
                    )}
                    {s.nodeIdMismatch && (
                      <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                        {t("infra.servers.nodeIdMismatch", {
                          expected: nodeId,
                        })}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {offline && (
                <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
                  {t("infra.servers.offline")}
                </p>
              )}
              <button
                type="button"
                className="mt-2 text-sm font-medium text-canopy-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-canopy-300"
                onClick={() => void runProbe()}
                disabled={probing}
              >
                {t(probing ? "infra.servers.checking" : "infra.servers.recheck")}
              </button>
            </>
          )}
        </section>

        {/* This device */}
        <section className="card mb-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("infra.device.title")}
          </h2>
          <dl className="flex flex-col gap-1 text-sm text-moss-700 dark:text-moss-200">
            <div className="flex items-baseline justify-between gap-2">
              <dt>{t("infra.device.members")}</dt>
              <dd className="font-medium">{members.length}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt>{t("infra.device.lastSync")}</dt>
              <dd className="font-medium">
                {lastSync
                  ? t(`infra.device.freshness.${nodeFreshness(lastSync)}`)
                  : t("infra.device.never")}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt>{t("infra.device.outboxPending")}</dt>
              <dd className="font-medium">{outboxPending}</dd>
            </div>
            {outboxPoisoned > 0 && (
              <div className="flex items-baseline justify-between gap-2">
                <dt>{t("infra.device.outboxPoisoned")}</dt>
                <dd className="font-medium">{outboxPoisoned}</dd>
              </div>
            )}
          </dl>
          {outboxPending === 0 && outboxPoisoned === 0 && (
            <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {t("infra.device.outboxClear")}
            </p>
          )}
        </section>

        {/* Governance */}
        <section className="card mb-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("infra.governance.title")}
          </h2>
          <dl className="flex flex-col gap-1 text-sm text-moss-700 dark:text-moss-200">
            <div className="flex items-baseline justify-between gap-2">
              <dt>{t("infra.governance.openProposals")}</dt>
              <dd className="font-medium">{openProposals}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt>{t("infra.governance.quorum")}</dt>
              <dd className="font-medium">
                {quorum ?? t("infra.governance.quorumUnknown")}
              </dd>
            </div>
          </dl>
          <Link
            to="/proposals"
            className="mt-2 inline-block text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("infra.governance.view")} →
          </Link>
        </section>

        <SourceCard />

        <FlashDriveCard />
      </div>

      {/* Drills */}
      <section className="mt-2">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("infra.drills.title")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("infra.drills.intro")}
          {" "}
          {/* Paper systems P4: the drills' physical companion. */}
          <Link
            to="/print/offline-kit"
            className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("print.kit.link")}
          </Link>
        </p>
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-4">
          {DRILLS.map((drill) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              state={drillState(drills, drill.id)}
              onToggle={(step) =>
                persistDrills(
                  toggleDrillStep(drills, drill.id, step, drill.steps),
                )
              }
              onMarkDrilled={() =>
                persistDrills(
                  markDrilled(
                    drills,
                    drill.id,
                    new Date().toISOString().slice(0, 10),
                  ),
                )
              }
              onReset={() => persistDrills(resetDrill(drills, drill.id))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Shape of /source/manifest.json, written by scripts/pack-source.sh. */
interface SourceManifest {
  version: string;
  commit: string;
  generatedAt: string;
  files: { name: string; bytes: number; sha256: string }[];
}

const REPO_URL = "https://github.com/ArdentCascades/Understoria";

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// "The software itself" — the node self-serves its Corresponding
// Source (AGPL §13; scripts/pack-source.sh) so the community's copy
// of the app doesn't depend on GitHub or any third party. The card
// reads /source/manifest.json from THIS deployment; a deployment
// from before the feature answers the fetch with the SPA fallback
// (index.html, 200, text/html), so presence is detected by
// content-type, not just status. Exported for its test.
export function SourceCard() {
  const { t } = useTranslation();
  // undefined = still fetching, null = this deployment doesn't serve it.
  const [manifest, setManifest] = useState<SourceManifest | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // On the web shareOrigin() === location.origin, so this stays
        // a same-origin fetch; in the desktop shell it resolves against
        // the community node instead of the app:// origin.
        const res = await fetch(`${shareOrigin()}/source/manifest.json`, {
          cache: "no-store",
        });
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok || !type.includes("json")) throw new Error("absent");
        const data = (await res.json()) as SourceManifest;
        if (!cancelled) setManifest(data);
      } catch {
        if (!cancelled) setManifest(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tarball = manifest?.files.find((f) =>
    f.name.endsWith("-source.tar.gz"),
  );
  const bundle = manifest?.files.find((f) => f.name.endsWith(".bundle"));

  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("infra.source.title")}
      </h2>
      <p className="text-sm text-moss-700 dark:text-moss-200">
        {t("infra.source.body")}
      </p>
      {manifest === undefined ? null : manifest === null ? (
        <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
          {t("infra.source.absent")}{" "}
          <a
            href={REPO_URL}
            className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("infra.source.repo")}
          </a>
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("infra.source.version", {
              version: manifest.version,
              commit: manifest.commit,
            })}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {tarball && (
              <li>
                <a
                  href={`${shareOrigin()}/source/${tarball.name}`}
                  download
                  className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("infra.source.download", {
                    size: formatBytes(tarball.bytes),
                  })}
                </a>
              </li>
            )}
            {bundle && (
              <li>
                <a
                  href={`${shareOrigin()}/source/${bundle.name}`}
                  download
                  className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("infra.source.bundle", {
                    size: formatBytes(bundle.bytes),
                  })}
                </a>
              </li>
            )}
            <li>
              <a
                href={`${shareOrigin()}/source/SHA256SUMS`}
                download
                className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
              >
                {t("infra.source.checksums")}
              </a>
            </li>
          </ul>
          {/* Integrity vs authenticity, said to the member's face —
              the same honesty rule as the rest of this page. */}
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("infra.source.caution")}
          </p>
        </>
      )}
      {/* The walkthrough is served by the node too — the download
          alone still left non-technical members needing a forge to
          read the instructions. */}
      <p className="mt-2 text-sm">
        <Link
          to="/help/start-a-community"
          className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {t("infra.source.walkthrough")} →
        </Link>
      </p>
    </section>
  );
}

// The drive is how the software itself travels without a network
// (docs/flash-drive-install.md). This card can't build one — that's
// a shell script on a machine with Docker — but it makes the
// capability discoverable next to the drill that proves it, instead
// of living only in a doc nobody opens until the outage.
export function FlashDriveCard() {
  const { t } = useTranslation();
  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("infra.flashDrive.title")}
      </h2>
      <p className="text-sm text-moss-700 dark:text-moss-200">
        {t("infra.flashDrive.body")}
      </p>
      {/* Command stays verbatim and horizontally scrollable —
          wrapping a shell line changes its meaning. */}
      <pre className="mt-2 overflow-x-auto rounded-lg bg-moss-950 p-3 text-xs leading-relaxed text-moss-100">
        <code>bash scripts/make-flash-drive.sh /media/your-drive --include-env .env</code>
      </pre>
      <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
        {t("infra.flashDrive.sealed")}
      </p>
      <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
        {t("infra.flashDrive.drill")}
      </p>
    </section>
  );
}

function DrillCard({
  drill,
  state,
  onToggle,
  onMarkDrilled,
  onReset,
}: {
  drill: (typeof DRILLS)[number];
  state: { checked: number[]; lastDrilledAt: string | null };
  onToggle: (step: number) => void;
  onMarkDrilled: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const steps = Array.from({ length: drill.steps }, (_, i) => i);
  const allChecked = steps.every((i) => state.checked.includes(i));
  return (
    <section className="card mb-4">
      <h3 className="text-sm font-semibold text-canopy-800 dark:text-canopy-200">
        {t(`infra.drills.${drill.id}.title`)}
      </h3>
      <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
        {t(`infra.drills.${drill.id}.body`)}{" "}
        <span className="whitespace-nowrap">({drill.docRef})</span>
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {steps.map((i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-moss-700 dark:text-moss-200">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-canopy-600"
                checked={state.checked.includes(i)}
                onChange={() => onToggle(i)}
              />
              <span>{t(`infra.drills.${drill.id}.step${i + 1}`)}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="text-xs text-moss-600 dark:text-moss-300">
          {state.lastDrilledAt
            ? t("infra.drills.lastDrilled", { date: state.lastDrilledAt })
            : t("infra.drills.notYet")}
        </p>
        {allChecked && (
          <button
            type="button"
            className="text-sm font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            onClick={onMarkDrilled}
          >
            {t("infra.drills.markToday")}
          </button>
        )}
        {state.checked.length > 0 && !allChecked && (
          <button
            type="button"
            className="text-xs text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
            onClick={onReset}
          >
            {t("infra.drills.reset")}
          </button>
        )}
      </div>
    </section>
  );
}
