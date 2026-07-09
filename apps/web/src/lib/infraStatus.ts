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

/**
 * Community infrastructure page (docs/desktop-power-tools.md plan 4)
 * — the pure half. Endpoint probes with an injectable fetch (the
 * `probeNewRoot` pattern from lib/growRoot.ts) and the drill-
 * checklist state helpers the page persists to settings.
 *
 * Deliberately NOT operator-gated, and everything read here already
 * belongs to the member: `/health` and `/config` are public routes,
 * the outbox and sync telemetry live on this device, and the
 * governance snapshot is derived from records the member already
 * holds. An infrastructure page every member can read IS the
 * transparency posture (docs/operator-powers.md).
 */

const PROBE_TIMEOUT_MS = 4_000;

function probeInit(): RequestInit {
  return {
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    credentials: "omit",
    mode: "cors",
  };
}

function stripTrailingSlash(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export interface EndpointStatus {
  url: string;
  isPrimary: boolean;
  /** `GET /health` answered OK from THIS device. `false` honestly
   *  means "didn't answer from here", which includes the member
   *  being offline — the page says so, it never claims "down". */
  healthy: boolean;
  /** The node id the server publishes on `GET /config`, or null when
   *  the route couldn't be asked or doesn't publish one. */
  nodeId: string | null;
  /** True only when this is the PRIMARY, both its published id and
   *  the community id stored on this device are known, and they
   *  differ — a real anomaly (wrong URL, replaced server) worth a
   *  calm flag. Mirrors run their own distinct NODE_IDs by design,
   *  so no mirror comparison happens; and `null`-vs-known is never
   *  flagged (couldn't ask ≠ mismatch). */
  nodeIdMismatch: boolean;
}

/**
 * Probe every configured endpoint (primary + accepted mirrors).
 * Never throws; a network failure marks that endpoint's fields
 * honestly (`healthy: false`, `nodeId: null`) and every endpoint is
 * always present in the result, in input order.
 */
export async function probeEndpoints(input: {
  endpoints: string[];
  primaryUrl: string | null;
  /** The community id stored on this device (AppContext `nodeId`),
   *  or null when unknown — disables the mismatch check. */
  expectedNodeId: string | null;
  fetchImpl?: typeof fetch;
}): Promise<EndpointStatus[]> {
  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  const primary = input.primaryUrl ? stripTrailingSlash(input.primaryUrl) : null;

  return Promise.all(
    input.endpoints.map(async (raw): Promise<EndpointStatus> => {
      const url = stripTrailingSlash(raw);
      const isPrimary = primary !== null && url === primary;

      let healthy = false;
      try {
        const res = await fetchImpl(`${url}/health`, probeInit());
        healthy = res.ok;
      } catch {
        healthy = false;
      }

      let nodeId: string | null = null;
      try {
        const res = await fetchImpl(`${url}/config`, probeInit());
        if (res.ok) {
          const body = (await res.json()) as { nodeId?: unknown } | null;
          if (
            body &&
            typeof body === "object" &&
            typeof body.nodeId === "string" &&
            body.nodeId.length > 0
          ) {
            nodeId = body.nodeId;
          }
        }
      } catch {
        nodeId = null;
      }

      return {
        url,
        isPrimary,
        healthy,
        nodeId,
        nodeIdMismatch:
          isPrimary &&
          nodeId !== null &&
          input.expectedNodeId !== null &&
          input.expectedNodeId !== "" &&
          nodeId !== input.expectedNodeId,
      };
    }),
  );
}

// --- drill checklists --------------------------------------------------

/**
 * Device-local drill tracking (SETTING_KEYS.drillChecklists, JSON).
 * The runbooks (docs/offline-resilience.md §4, docs/community-reseed.md
 * + operator-guide §6) stay the source of truth — this page is only
 * the tracker. Never federated, never in the outbox: settings rows
 * stay on this device.
 */
export interface DrillState {
  /** Checked step indexes — deduped, kept in [0, stepCount). */
  checked: number[];
  /** ISO date (yyyy-mm-dd) the member last ran the drill, or null. */
  lastDrilledAt: string | null;
}

export type DrillChecklists = Record<string, DrillState>;

const EMPTY_DRILL: DrillState = { checked: [], lastDrilledAt: null };

export function drillState(
  all: DrillChecklists,
  drillId: string,
): DrillState {
  return all[drillId] ?? EMPTY_DRILL;
}

/** Parse the persisted JSON. Corrupt or foreign shapes resolve to {}
 *  — a reset checklist, never a crash. */
export function parseDrillChecklists(
  raw: string | undefined | null,
): DrillChecklists {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: DrillChecklists = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const v = value as { checked?: unknown; lastDrilledAt?: unknown };
      out[key] = {
        checked: Array.isArray(v.checked)
          ? [
              ...new Set(
                v.checked.filter(
                  (n): n is number =>
                    typeof n === "number" && Number.isInteger(n) && n >= 0,
                ),
              ),
            ]
          : [],
        lastDrilledAt:
          typeof v.lastDrilledAt === "string" && v.lastDrilledAt.length > 0
            ? v.lastDrilledAt
            : null,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeDrillChecklists(all: DrillChecklists): string {
  return JSON.stringify(all);
}

/** Toggle one step. Out-of-range indexes are dropped so a checklist
 *  that SHRINKS in a later release can't strand phantom checks. */
export function toggleDrillStep(
  all: DrillChecklists,
  drillId: string,
  step: number,
  stepCount: number,
): DrillChecklists {
  const current = drillState(all, drillId);
  const inRange = current.checked.filter((n) => n < stepCount);
  const checked = inRange.includes(step)
    ? inRange.filter((n) => n !== step)
    : [...inRange, step].sort((a, b) => a - b);
  return { ...all, [drillId]: { ...current, checked } };
}

/** Stamp "last drilled" (and clear the checks — a finished drill
 *  resets the list for the next one). */
export function markDrilled(
  all: DrillChecklists,
  drillId: string,
  isoDate: string,
): DrillChecklists {
  return { ...all, [drillId]: { checked: [], lastDrilledAt: isoDate } };
}

/** Clear one drill's checks without touching its last-drilled date. */
export function resetDrill(
  all: DrillChecklists,
  drillId: string,
): DrillChecklists {
  const current = drillState(all, drillId);
  return { ...all, [drillId]: { ...current, checked: [] } };
}
