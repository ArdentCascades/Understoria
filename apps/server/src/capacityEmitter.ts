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
/**
 * Capacity posture emitter (docs/capacity-forecast.md §6, PR 3).
 *
 * Turns the node's own sample ring buffer (PR 2) into the one coarse
 * signal the community sees: it forecasts over the trailing samples,
 * runs the resulting pressure band through the shipped `stabilizeBand`
 * hysteresis, and — ONLY when the stable band TRANSITIONS
 * (green↔amber↔red, §11 ruling 4) — signs a fresh `CapacityPosture`
 * with the node system key and writes it to the federated
 * `capacity_postures` store. No transition ⇒ no write, so the
 * federated write rate stays near zero.
 *
 * What crosses the wire is a decision, never a measurement: a band, a
 * coarse disk-horizon bucket, and the recruitment trigger. The raw
 * bytes stay in the operator-local ring buffer and never leave the box.
 *
 * The band history that feeds the hysteresis lives in memory here (the
 * "emit layer owns that history", per the forecast lib's note). On a
 * restart it re-warms over a few ticks from the last stored posture —
 * acceptable: hysteresis only smooths, it is not the source of truth.
 * Signing is delegated to `systemSigner.signCapacityPosture` so the
 * whole "what the system key may sign" surface stays auditable in one
 * file.
 */
import * as os from "node:os";
import {
  forecastCapacity,
  stabilizeBand,
  type Band,
  type CapacityForecast,
  type CapacitySample,
  type ForecastConfig,
} from "./capacityForecast.js";
import type { CapacityPostureStore, CapacitySampleStore } from "./db.js";
import { signCapacityPosture, type SystemSigner } from "./systemSigner.js";
import type { CapacityPosture } from "@understoria/shared/types";

/** Logical core count — static per machine, so it isn't persisted in
 *  the v26 sample table; the forecaster normalises load against it. */
function defaultCpuCount(): number {
  const n =
    typeof os.availableParallelism === "function"
      ? os.availableParallelism()
      : os.cpus().length;
  return n > 0 ? n : 1;
}

// Disk-horizon buckets mirror the forecast lib's default disk
// thresholds (amber < 120 d, red < 45 d): a posture with `weeks` left
// is in the red disk band, `months` in the amber, `ample` otherwise.
const HORIZON_WEEKS_MAX_DAYS = 45;
const HORIZON_MONTHS_MAX_DAYS = 120;

export interface CapacityEmitterOptions {
  sampleStore: CapacitySampleStore;
  postureStore: CapacityPostureStore;
  /** The node's system signer. Required — no key, no posture (§6). */
  signer: SystemSigner;
  nodeId: string;
  /** How many trailing samples to forecast over. */
  recentSampleLimit?: number;
  /** Overrides forwarded to `forecastCapacity` (thresholds, window). */
  forecastConfig?: Omit<ForecastConfig, "now">;
  hysteresis?: { worsenAfter?: number; easeAfter?: number };
  /** Logical core count for CPU-headroom normalisation. Defaults to
   *  the host's; injectable for deterministic tests. */
  cpuCount?: number;
  now?: () => number;
}

export interface CapacityEmitter {
  /** Forecast → hysteresis → maybe-emit. Returns the newly written
   *  posture on a band transition, else null. Idempotent per band:
   *  calling it repeatedly at a steady band writes nothing. */
  check(): CapacityPosture | null;
}

/** Coarse disk-horizon bucket from the forecast's disk countdown. */
function horizonBucket(forecast: CapacityForecast): CapacityPosture["horizon"] {
  const days = forecast.horizonDays;
  if (days === null) return "ample"; // not projected to fill
  if (days.mid <= HORIZON_WEEKS_MAX_DAYS) return "weeks";
  if (days.mid <= HORIZON_MONTHS_MAX_DAYS) return "months";
  return "ample";
}

export function createCapacityEmitter(
  opts: CapacityEmitterOptions,
): CapacityEmitter {
  const now = opts.now ?? (() => Date.now());
  const recentLimit = opts.recentSampleLimit ?? 400;
  const worsenAfter = opts.hysteresis?.worsenAfter ?? 2;
  const easeAfter = opts.hysteresis?.easeAfter ?? 3;
  const cpuCount = opts.cpuCount ?? defaultCpuCount();

  // Seed the stable band from any posture already stored (survives a
  // restart without re-emitting a band we already published). The raw
  // history starts empty and re-warms from live samples.
  const seeded = opts.postureStore.get(opts.nodeId);
  let lastBand: Band = seeded ? seeded.pressure : "unknown";
  const recentRaw: Band[] = [];
  const historyCap = Math.max(worsenAfter, easeAfter);

  return {
    check(): CapacityPosture | null {
      const nowMs = now();
      // The ring buffer stores everything except the static core count;
      // supply it here so CPU headroom normalises correctly.
      const samples: CapacitySample[] = opts.sampleStore
        .recent(recentLimit)
        .map((r) => ({
          sampledAt: r.sampledAt,
          diskFreeBytes: r.diskFreeBytes,
          diskTotalBytes: r.diskTotalBytes,
          memFreeBytes: r.memFreeBytes,
          memTotalBytes: r.memTotalBytes,
          loadAvg1m: r.loadAvg1m,
          cpuCount,
        }));
      const forecast = forecastCapacity(samples, {
        now: nowMs,
        ...opts.forecastConfig,
      });

      recentRaw.push(forecast.pressure);
      if (recentRaw.length > historyCap) recentRaw.shift();

      const stable = stabilizeBand(lastBand, recentRaw, {
        worsenAfter,
        easeAfter,
      });
      // "unknown" means still gathering data — never a posture. And a
      // steady band is a no-op: emit ONLY on a transition (§11 ruling 4).
      if (stable === "unknown" || stable === lastBand) return null;

      const unsigned: Omit<CapacityPosture, "signature"> = {
        nodeId: opts.nodeId,
        pressure: stable,
        horizon: horizonBucket(forecast),
        // The strong recruitment trigger fires at red — the point §5.2
        // elevates the "grow another root" copy. Amber still surfaces
        // the softer heads-up via `pressure`, without this flag.
        growthRecommended: stable === "red",
        updatedAt: nowMs,
        signerKey: opts.signer.publicKey,
      };
      const posture: CapacityPosture = {
        ...unsigned,
        signature: signCapacityPosture(unsigned, opts.signer),
      };
      opts.postureStore.upsert(posture);
      lastBand = stable;
      return posture;
    },
  };
}
