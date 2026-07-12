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
 * Node capacity self-sampler (docs/capacity-forecast.md §3A, PR 2).
 *
 * A periodic worker that reads the node's OWN disk/RAM/CPU on a timer
 * and appends a row to the `node_capacity_samples` ring buffer, giving
 * the forecaster (PR 3) a trailing series to fit a slope against. It is
 * the read-side complement of `insertCaps` (the write-side disk-fill
 * backstop): that one bounces writes when the box is already full; this
 * one lets the community see it coming.
 *
 * Everything here is operator-local. The numbers describe ONE machine —
 * the box the node runs on, readable by its host with `df`/`free` — and
 * they never leave it: no route serves this table, no pull leg
 * replicates it. Only the coarse `CapacityPosture` (PR 3) is ever
 * shared, and that carries a band, never a byte count.
 *
 * All standard-library, no native module: `fs.statfsSync`,
 * `fs.statSync`, and `os`. The reads and the insert run synchronously
 * in the timer callback — consistent with the DB layer's
 * synchronous-by-design posture and safely off the request path. Every
 * dependency is injectable, so the whole worker is unit-testable
 * without a real disk.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import { dirname } from "node:path";
import type { FastifyBaseLogger } from "fastify";
import type { CapacitySampleInput, CapacitySampleStore } from "./db.js";

/**
 * The platform primitives the sampler reads. Defaults hit the real
 * `fs`/`os`; tests inject fakes to drive any series they like.
 */
export interface CapacitySamplerDeps {
  /** `fs.statfsSync`-shaped: block size + free/total blocks for a path. */
  statfs(path: string): { bsize: number; bavail: number; blocks: number };
  /** File size in bytes; throws if the file is absent. */
  fileSize(path: string): number;
  freemem(): number;
  totalmem(): number;
  /** 1-, 5-, 15-minute load averages (`os.loadavg()`). */
  loadavg(): number[];
  now(): number;
}

function defaultDeps(): CapacitySamplerDeps {
  return {
    statfs: (p) => {
      const s = fs.statfsSync(p);
      return {
        bsize: Number(s.bsize),
        bavail: Number(s.bavail),
        blocks: Number(s.blocks),
      };
    },
    fileSize: (p) => fs.statSync(p).size,
    freemem: () => os.freemem(),
    totalmem: () => os.totalmem(),
    loadavg: () => os.loadavg(),
    now: () => Date.now(),
  };
}

export interface CapacitySamplerOptions {
  store: CapacitySampleStore;
  /** The node's DB file; its directory is the disk we forecast. */
  databasePath: string;
  /** Timer cadence. `<= 0` disables the loop (tests drive `sampleOnce`). */
  intervalMs: number;
  /** Ring-buffer size handed to `store.record`. */
  keepN: number;
  deps?: Partial<CapacitySamplerDeps>;
  log?: Pick<FastifyBaseLogger, "warn">;
}

export interface CapacitySampler {
  /** Take one reading now and record it. Returns the row written, or
   *  null if every dimension was unreadable (nothing recorded). Exposed
   *  so tests — and PR 3 — can drive a single tick deterministically. */
  sampleOnce(): CapacitySampleInput | null;
  stop(): void;
}

/** Read one value, folding any platform error into null so a single
 *  unreadable dimension never sinks the whole sample. */
function safe<T>(read: () => T, onError?: (err: Error) => void): T | null {
  try {
    return read();
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

export function startCapacitySampler(
  opts: CapacitySamplerOptions,
): CapacitySampler {
  const deps: CapacitySamplerDeps = { ...defaultDeps(), ...opts.deps };
  const dir = dirname(opts.databasePath);
  const warn = (label: string, err: Error): void =>
    opts.log?.warn(`[capacity-sampler] ${label}: ${err.message}`);

  function sampleOnce(): CapacitySampleInput | null {
    const disk = safe(
      () => deps.statfs(dir),
      (e) => warn("statfs", e),
    );
    const diskFreeBytes = disk ? disk.bavail * disk.bsize : null;
    const diskTotalBytes = disk ? disk.blocks * disk.bsize : null;

    // DB footprint = the file plus its WAL sidecar (WAL mode is on, see
    // db.ts). A missing sidecar contributes 0; a missing main file
    // leaves the whole figure null rather than a misleading zero.
    const mainSize = safe(
      () => deps.fileSize(opts.databasePath),
      (e) => warn("statSync db", e),
    );
    const walSize = safe(() => deps.fileSize(`${opts.databasePath}-wal`)) ?? 0;
    const dbSizeBytes = mainSize === null ? null : mainSize + walSize;

    const memFreeBytes = safe(
      () => deps.freemem(),
      (e) => warn("freemem", e),
    );
    const memTotalBytes = safe(
      () => deps.totalmem(),
      (e) => warn("totalmem", e),
    );
    const loadAvg1m = safe(
      () => {
        const v = deps.loadavg()[0];
        return v === undefined ? null : v;
      },
      (e) => warn("loadavg", e),
    );

    const sample: CapacitySampleInput = {
      sampledAt: deps.now(),
      diskFreeBytes,
      diskTotalBytes,
      dbSizeBytes,
      memFreeBytes,
      memTotalBytes,
      loadAvg1m,
    };

    // If the whole platform is opaque, don't persist a row of nulls —
    // the forecaster would only have to filter it back out, and an
    // all-null buffer is indistinguishable from "gathering data".
    const anyReading =
      diskFreeBytes !== null ||
      dbSizeBytes !== null ||
      memFreeBytes !== null ||
      loadAvg1m !== null;
    if (!anyReading) return null;

    opts.store.record(sample, opts.keepN);
    return sample;
  }

  // Overlap guard mirrors the mirror-pull worker. A tick is fully
  // synchronous today so it cannot actually overlap, but the flag keeps
  // the worker shape uniform and is cheap insurance against a future
  // async dependency.
  let running = false;
  const tick = (): void => {
    if (running) return;
    running = true;
    try {
      sampleOnce();
    } catch (err) {
      warn("tick", err instanceof Error ? err : new Error(String(err)));
    } finally {
      running = false;
    }
  };

  const active = opts.intervalMs > 0;
  const timer = active ? setInterval(tick, opts.intervalMs) : null;
  timer?.unref?.();
  if (active) tick();

  return {
    sampleOnce,
    stop() {
      if (timer !== null) clearInterval(timer);
    },
  };
}
