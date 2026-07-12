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
 * Capacity forecast — the pure math behind `docs/capacity-forecast.md`
 * (PR 1 of the plan). Given a trailing series of the node's own
 * disk/RAM/CPU samples, it projects when disk runs out and grades the
 * three resources into a green/amber/red pressure band. Nothing here
 * touches the network, a member record, or the filesystem: it takes
 * numbers in and returns a verdict, so it is exhaustively unit-testable
 * and commits the tree to nothing federated.
 *
 * The design rulings this encodes (docs/capacity-forecast.md §11,
 * resolved 2026-07-12):
 *
 *   - Disk is the only honest countdown. Its band is derived from
 *     "days until full" (amber < 120 d, red < 45 d), NOT from percent
 *     used — a disk that is 90% full but flat is fine, one that is 55%
 *     and climbing fast is not.
 *   - RAM and CPU do not "run out" on a clock; they get tight. Both are
 *     graded off *sustained free headroom* (amber < 20% free, red < 8%
 *     free), CPU headroom being `1 - load1m / cores`.
 *   - Any maxed resource degrades the community, so the overall
 *     `pressure` is the worst of the three; only disk carries the
 *     countdown (`horizonDays`).
 *
 * Robustness choices: the slope is Theil–Sen (median of pairwise
 * slopes) so a single reindex/purge spike can't swing the estimate; the
 * "now" reading is an EWMA so it doesn't chase noise; and the countdown
 * is reported as a range, never a false-precise date. Hysteresis (don't
 * flip bands on a single reading) is a separate concern owned by the
 * emit layer — see `stabilizeBand` at the bottom, a pure primitive the
 * node will feed its recent band history.
 */

const MS_PER_DAY = 86_400_000;

/** How full is the tank, and how alarmed should we be. */
export type Band = "green" | "amber" | "red" | "unknown";

/**
 * One reading of the node's own resources. Every field is nullable
 * because a given platform may not expose a given number; the forecast
 * simply grades the dimensions it can see and marks the rest `unknown`.
 */
export interface CapacitySample {
  /** Epoch milliseconds when the sample was taken. */
  readonly sampledAt: number;
  readonly diskFreeBytes: number | null;
  readonly diskTotalBytes: number | null;
  readonly memFreeBytes: number | null;
  readonly memTotalBytes: number | null;
  /** 1-minute load average (node-wide, e.g. `os.loadavg()[0]`). */
  readonly loadAvg1m: number | null;
  /** Core count, to normalise load into a per-core headroom. */
  readonly cpuCount: number | null;
}

export interface ForecastConfig {
  /** Injected clock (epoch ms). Required — keeps the fn deterministic. */
  readonly now: number;
  /** Only samples within this window of `now` are considered. */
  readonly trailingWindowMs?: number;
  /** Below this many in-window samples, the verdict is "gathering data". */
  readonly minSamples?: number;
  readonly diskAmberDays?: number;
  readonly diskRedDays?: number;
  /** Free-headroom fraction below which RAM/CPU go amber / red. */
  readonly headroomAmberFrac?: number;
  readonly headroomRedFrac?: number;
  /** EWMA smoothing factor in (0,1]; higher tracks the latest reading harder. */
  readonly ewmaAlpha?: number;
}

/** A three-point projection; `high` is capped, never unbounded. */
export interface DayRange {
  readonly low: number;
  readonly mid: number;
  readonly high: number;
}

export interface DimensionForecast {
  readonly band: Band;
  /** Smoothed free-headroom fraction now, or null if unmeasurable. */
  readonly headroomFrac: number | null;
}

export interface DiskForecast extends DimensionForecast {
  /** Days until free space hits zero, or null if not projected to fill. */
  readonly daysToFull: DayRange | null;
  readonly trend: "filling" | "flat" | "draining" | "unknown";
}

export interface CapacityForecast {
  /** Worst of the three dimensions — the headline. */
  readonly pressure: Band;
  readonly disk: DiskForecast;
  readonly ram: DimensionForecast;
  readonly cpu: DimensionForecast;
  /** The only honest countdown: disk's `daysToFull`. */
  readonly horizonDays: DayRange | null;
  readonly sampleCount: number;
  /** Set when the verdict is provisional (e.g. too few samples). */
  readonly note?: string;
}

/** Config with every knob filled in — what the internals actually see. */
interface ResolvedConfig {
  trailingWindowMs: number;
  minSamples: number;
  diskAmberDays: number;
  diskRedDays: number;
  headroomAmberFrac: number;
  headroomRedFrac: number;
  ewmaAlpha: number;
  /** High end of any countdown, so an almost-flat slope reads as "years". */
  horizonCapDays: number;
}

const DEFAULTS: ResolvedConfig = {
  trailingWindowMs: 21 * MS_PER_DAY,
  minSamples: 8,
  diskAmberDays: 120,
  diskRedDays: 45,
  headroomAmberFrac: 0.2,
  headroomRedFrac: 0.08,
  ewmaAlpha: 0.3,
  horizonCapDays: 3650,
};

// --- small pure numeric helpers -----------------------------------------

export function median(xs: readonly number[]): number {
  if (xs.length === 0) return Number.NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * EWMA over an ordered series (oldest first, newest last). Returns the
 * smoothed value weighted toward the most recent reading.
 */
export function ewma(values: readonly number[], alpha: number): number | null {
  if (values.length === 0) return null;
  let acc = values[0];
  for (let i = 1; i < values.length; i++) {
    acc = alpha * values[i] + (1 - alpha) * acc;
  }
  return acc;
}

/**
 * Theil–Sen slope of `y` over `x`: the median of all pairwise slopes.
 * Also returns a robust spread (1.4826·MAD of the slopes) so a caller
 * can turn one slope into an optimistic/pessimistic range. Null when
 * fewer than two distinct-x points are available.
 */
export function robustSlope(
  points: readonly { readonly x: number; readonly y: number }[],
): { slope: number; spread: number; pairs: number } | null {
  const slopes: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      if (dx === 0) continue;
      slopes.push((points[j].y - points[i].y) / dx);
    }
  }
  if (slopes.length === 0) return null;
  const slope = median(slopes);
  const mad = median(slopes.map((s) => Math.abs(s - slope)));
  return { slope, spread: 1.4826 * mad, pairs: slopes.length };
}

// --- banding -------------------------------------------------------------

const RANK: Record<Band, number> = { unknown: -1, green: 0, amber: 1, red: 2 };

/** Worst of several bands; `unknown` never wins over a real reading. */
export function worstBand(bands: readonly Band[]): Band {
  const known = bands.filter((b) => b !== "unknown");
  if (known.length === 0) return "unknown";
  return known.reduce((acc, b) => (RANK[b] > RANK[acc] ? b : acc), "green" as Band);
}

function bandFromDays(days: number | null, amberDays: number, redDays: number): Band {
  if (days === null) return "green"; // not projected to fill → not alarming
  if (days <= redDays) return "red";
  if (days <= amberDays) return "amber";
  return "green";
}

function bandFromHeadroom(frac: number | null, amberFrac: number, redFrac: number): Band {
  if (frac === null || Number.isNaN(frac)) return "unknown";
  if (frac <= redFrac) return "red";
  if (frac <= amberFrac) return "amber";
  return "green";
}

// --- the forecast --------------------------------------------------------

function values(
  samples: readonly CapacitySample[],
  pick: (s: CapacitySample) => number | null,
): number[] {
  const out: number[] = [];
  for (const s of samples) {
    const v = pick(s);
    if (v !== null && Number.isFinite(v)) out.push(v);
  }
  return out;
}

function points(
  samples: readonly CapacitySample[],
  pick: (s: CapacitySample) => number | null,
): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const s of samples) {
    const v = pick(s);
    if (v !== null && Number.isFinite(v)) out.push({ x: s.sampledAt, y: v });
  }
  return out;
}

function forecastDisk(samples: readonly CapacitySample[], cfg: ResolvedConfig): DiskForecast {
  const freePts = points(samples, (s) => s.diskFreeBytes);
  const freeVals = freePts.map((p) => p.y);
  const currentFree = ewma(freeVals, cfg.ewmaAlpha);
  const totals = values(samples, (s) => s.diskTotalBytes);
  const total = totals.length > 0 ? totals[totals.length - 1] : null;
  const headroomFrac = currentFree !== null && total !== null && total > 0 ? currentFree / total : null;

  const fit = robustSlope(freePts);
  if (fit === null || currentFree === null) {
    return { band: "unknown", headroomFrac, daysToFull: null, trend: "unknown" };
  }

  const slopePerDay = fit.slope * MS_PER_DAY; // bytes/day; negative == filling
  const spreadPerDay = fit.spread * MS_PER_DAY;

  // A slope shallower than one part in the horizon cap is "flat" —
  // below the noise floor of a meaningful projection.
  const flatFloor = currentFree / cfg.horizonCapDays;
  if (slopePerDay >= -flatFloor) {
    const trend = slopePerDay > flatFloor ? "draining" : "flat";
    return { band: "green", headroomFrac, daysToFull: null, trend };
  }

  const daysFrom = (perDay: number): number =>
    Math.min(cfg.horizonCapDays, Math.max(0, currentFree / -perDay));
  const mid = daysFrom(slopePerDay);
  // Steeper slope → fills sooner (low). Gentler slope → later (high),
  // capped so an almost-flattening tail reads as "years", not Infinity.
  const steeper = slopePerDay - spreadPerDay;
  const gentler = slopePerDay + spreadPerDay;
  const low = daysFrom(steeper);
  const high = gentler < -flatFloor ? daysFrom(gentler) : cfg.horizonCapDays;
  const daysToFull: DayRange = {
    low: Math.min(low, mid),
    mid,
    high: Math.max(high, mid),
  };

  return {
    band: bandFromDays(mid, cfg.diskAmberDays, cfg.diskRedDays),
    headroomFrac,
    daysToFull,
    trend: "filling",
  };
}

function forecastHeadroom(
  samples: readonly CapacitySample[],
  free: (s: CapacitySample) => number | null,
  cfg: ResolvedConfig,
): DimensionForecast {
  const fracs = values(samples, free);
  const headroomFrac = ewma(fracs, cfg.ewmaAlpha);
  return {
    band: bandFromHeadroom(headroomFrac, cfg.headroomAmberFrac, cfg.headroomRedFrac),
    headroomFrac,
  };
}

function ramFreeFrac(s: CapacitySample): number | null {
  if (s.memFreeBytes === null || s.memTotalBytes === null || s.memTotalBytes <= 0) return null;
  return s.memFreeBytes / s.memTotalBytes;
}

function cpuFreeFrac(s: CapacitySample): number | null {
  if (s.loadAvg1m === null || s.cpuCount === null || s.cpuCount <= 0) return null;
  // Free CPU headroom: 1 minus per-core load, clamped to [0,1].
  return Math.min(1, Math.max(0, 1 - s.loadAvg1m / s.cpuCount));
}

/**
 * Grade a node's recent self-samples. Pure: same inputs → same output.
 * Feed it the full ring buffer; it windows and thins internally.
 */
export function forecastCapacity(
  samples: readonly CapacitySample[],
  config: ForecastConfig,
): CapacityForecast {
  const cfg: ResolvedConfig = {
    trailingWindowMs: config.trailingWindowMs ?? DEFAULTS.trailingWindowMs,
    minSamples: config.minSamples ?? DEFAULTS.minSamples,
    diskAmberDays: config.diskAmberDays ?? DEFAULTS.diskAmberDays,
    diskRedDays: config.diskRedDays ?? DEFAULTS.diskRedDays,
    headroomAmberFrac: config.headroomAmberFrac ?? DEFAULTS.headroomAmberFrac,
    headroomRedFrac: config.headroomRedFrac ?? DEFAULTS.headroomRedFrac,
    ewmaAlpha: config.ewmaAlpha ?? DEFAULTS.ewmaAlpha,
    horizonCapDays: DEFAULTS.horizonCapDays,
  };

  const cutoff = config.now - cfg.trailingWindowMs;
  const inWindow = samples
    .filter((s) => s.sampledAt >= cutoff && s.sampledAt <= config.now)
    .sort((a, b) => a.sampledAt - b.sampledAt);

  const unknownDim: DimensionForecast = { band: "unknown", headroomFrac: null };
  if (inWindow.length < cfg.minSamples) {
    return {
      pressure: "unknown",
      disk: { ...unknownDim, daysToFull: null, trend: "unknown" },
      ram: unknownDim,
      cpu: unknownDim,
      horizonDays: null,
      sampleCount: inWindow.length,
      note: "gathering data",
    };
  }

  const disk = forecastDisk(inWindow, cfg);
  const ram = forecastHeadroom(inWindow, ramFreeFrac, cfg);
  const cpu = forecastHeadroom(inWindow, cpuFreeFrac, cfg);

  return {
    pressure: worstBand([disk.band, ram.band, cpu.band]),
    disk,
    ram,
    cpu,
    horizonDays: disk.daysToFull,
    sampleCount: inWindow.length,
  };
}

// --- hysteresis (for the emit layer) ------------------------------------

/**
 * Decide the next *stable* band from a stream of raw per-sample bands,
 * so the community signal doesn't flip on a single noisy reading. A
 * worse band is adopted only after `worsenAfter` consecutive raw
 * readings at least that bad; an easier band only after `easeAfter`
 * consecutive readings at most that good. `unknown` raws are ignored.
 *
 * Pure and stateless — the caller passes the recent raw-band history
 * (oldest → newest) and the last stable band; PR 3's emitter owns that
 * history. Kept here so the whole band lifecycle is tested in one place.
 */
export function stabilizeBand(
  previous: Band,
  recentRaw: readonly Band[],
  opts: { worsenAfter?: number; easeAfter?: number } = {},
): Band {
  const worsenAfter = opts.worsenAfter ?? 2;
  const easeAfter = opts.easeAfter ?? 3;
  const known = recentRaw.filter((b) => b !== "unknown");
  if (known.length === 0) return previous;

  const newest = known[known.length - 1];
  if (previous === "unknown") return newest;

  const newestRank = RANK[newest];
  const prevRank = RANK[previous];
  if (newestRank > prevRank) {
    const tail = known.slice(-worsenAfter);
    return tail.length >= worsenAfter && tail.every((b) => RANK[b] >= newestRank)
      ? newest
      : previous;
  }
  if (newestRank < prevRank) {
    const tail = known.slice(-easeAfter);
    return tail.length >= easeAfter && tail.every((b) => RANK[b] <= newestRank)
      ? newest
      : previous;
  }
  return previous;
}
