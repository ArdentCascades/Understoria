/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Tests for the pure capacity forecast (capacityForecast.ts). Everything
 * is driven by injected sample series and an injected clock, so the math
 * — Theil–Sen slope, EWMA smoothing, day-based disk banding,
 * headroom-based RAM/CPU banding, worst-of pressure, and the hysteresis
 * primitive — is exercised without a node, a socket, or a disk.
 */
import { describe, expect, it } from "vitest";
import {
  ewma,
  forecastCapacity,
  median,
  robustSlope,
  stabilizeBand,
  worstBand,
  type CapacitySample,
} from "./capacityForecast.js";

const DAY = 86_400_000;
const GB = 1_000_000_000;
const NOW = 1_700_000_000_000;

interface SeriesSpec {
  now?: number;
  count: number;
  stepMs?: number;
  disk?: (i: number) => { free: number; total: number };
  mem?: (i: number) => { free: number; total: number };
  cpu?: (i: number) => { load: number; cores: number };
}

/** Build a series oldest→newest, the newest landing exactly at `now`. */
function series(spec: SeriesSpec): CapacitySample[] {
  const now = spec.now ?? NOW;
  const step = spec.stepMs ?? DAY;
  const out: CapacitySample[] = [];
  for (let i = 0; i < spec.count; i++) {
    const sampledAt = now - (spec.count - 1 - i) * step;
    const d = spec.disk?.(i) ?? null;
    const m = spec.mem?.(i) ?? null;
    const c = spec.cpu?.(i) ?? null;
    out.push({
      sampledAt,
      diskFreeBytes: d ? d.free : null,
      diskTotalBytes: d ? d.total : null,
      memFreeBytes: m ? m.free : null,
      memTotalBytes: m ? m.total : null,
      loadAvg1m: c ? c.load : null,
      cpuCount: c ? c.cores : null,
    });
  }
  return out;
}

describe("numeric helpers", () => {
  it("median handles odd and even lengths", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(Number.isNaN(median([]))).toBe(true);
  });

  it("ewma weights the most recent reading and returns null when empty", () => {
    expect(ewma([], 0.3)).toBeNull();
    expect(ewma([5], 0.3)).toBe(5);
    // Rising series → smoothed value sits below the latest reading.
    const e = ewma([0, 10], 0.5);
    expect(e).toBe(5);
  });

  it("robustSlope is the median of pairwise slopes and shrugs off one outlier", () => {
    const clean = robustSlope([
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ]);
    expect(clean?.slope).toBeCloseTo(2, 6);

    const withSpike = robustSlope([
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 999 }, // outlier
      { x: 3, y: 6 },
      { x: 4, y: 8 },
    ]);
    // Median slope stays near the true trend of 2 despite the spike.
    expect(withSpike?.slope).toBeCloseTo(2, 0);
    expect(robustSlope([{ x: 1, y: 1 }])).toBeNull();
  });

  it("worstBand takes the worst real band and ignores unknown", () => {
    expect(worstBand(["green", "amber", "red"])).toBe("red");
    expect(worstBand(["green", "unknown", "amber"])).toBe("amber");
    expect(worstBand(["unknown", "unknown"])).toBe("unknown");
    expect(worstBand([])).toBe("unknown");
  });
});

describe("forecastCapacity — insufficient data", () => {
  it("reports 'gathering data' below the minimum sample count", () => {
    const f = forecastCapacity(
      series({ count: 4, disk: (i) => ({ free: (50 - i) * GB, total: 100 * GB }) }),
      { now: NOW, minSamples: 8 },
    );
    expect(f.pressure).toBe("unknown");
    expect(f.note).toBe("gathering data");
    expect(f.horizonDays).toBeNull();
  });

  it("ignores samples older than the trailing window", () => {
    // 20 samples one day apart, but a 5-day window admits only the last few.
    const f = forecastCapacity(
      series({ count: 20, disk: (i) => ({ free: (50 - i) * GB, total: 100 * GB }) }),
      { now: NOW, trailingWindowMs: 5 * DAY, minSamples: 8 },
    );
    expect(f.note).toBe("gathering data");
    expect(f.sampleCount).toBeLessThan(8);
  });
});

describe("forecastCapacity — disk countdown", () => {
  it("projects a red band when disk fills within the red horizon", () => {
    // free = 49,48,…,20 GB over 30 days → ~1 GB/day, ~20 days to empty.
    const f = forecastCapacity(
      series({ count: 30, disk: (i) => ({ free: (49 - i) * GB, total: 100 * GB }) }),
      { now: NOW },
    );
    expect(f.disk.trend).toBe("filling");
    expect(f.disk.band).toBe("red");
    expect(f.pressure).toBe("red");
    const range = f.horizonDays;
    expect(range).not.toBeNull();
    expect(range!.low).toBeLessThanOrEqual(range!.mid);
    expect(range!.mid).toBeLessThanOrEqual(range!.high);
    expect(range!.mid).toBeGreaterThan(10);
    expect(range!.mid).toBeLessThan(45);
  });

  it("projects amber for a slow fill inside the amber horizon", () => {
    // ~0.25 GB/day, newest free ~20 GB → ~80 days.
    const f = forecastCapacity(
      series({ count: 40, disk: (i) => ({ free: (30 - 0.25 * i) * GB, total: 100 * GB }) }),
      { now: NOW },
    );
    expect(f.disk.band).toBe("amber");
    expect(f.horizonDays!.mid).toBeGreaterThan(45);
    expect(f.horizonDays!.mid).toBeLessThan(120);
  });

  it("treats a flat disk as green with no countdown, even when nearly full", () => {
    // 2 GB free of 100 GB (98% full) but perfectly flat → not alarming.
    const f = forecastCapacity(
      series({ count: 30, disk: () => ({ free: 2 * GB, total: 100 * GB }) }),
      { now: NOW },
    );
    expect(f.disk.trend).toBe("flat");
    expect(f.disk.band).toBe("green");
    expect(f.horizonDays).toBeNull();
  });

  it("treats a draining disk (freeing up) as green with no countdown", () => {
    const f = forecastCapacity(
      series({ count: 30, disk: (i) => ({ free: (20 + i) * GB, total: 100 * GB }) }),
      { now: NOW },
    );
    expect(f.disk.trend).toBe("draining");
    expect(f.disk.band).toBe("green");
    expect(f.horizonDays).toBeNull();
  });

  it("stays on the real trend when a single sample spikes", () => {
    // Filling ~1 GB/day, but one mid-series reading blips way up.
    const f = forecastCapacity(
      series({
        count: 30,
        disk: (i) => ({ free: (i === 12 ? 95 : 49 - i) * GB, total: 100 * GB }),
      }),
      { now: NOW },
    );
    // The outlier must not fool the forecast into "flat/green".
    expect(f.disk.trend).toBe("filling");
    expect(["amber", "red"]).toContain(f.disk.band);
    expect(f.horizonDays!.mid).toBeLessThan(90);
  });
});

describe("forecastCapacity — RAM and CPU headroom", () => {
  const steadyMem = (freeBytes: number) =>
    series({ count: 10, mem: () => ({ free: freeBytes, total: 16 * GB }) });

  it("grades RAM red below 8% free", () => {
    const f = forecastCapacity(steadyMem(1 * GB), { now: NOW }); // ~6%
    expect(f.ram.band).toBe("red");
    expect(f.pressure).toBe("red");
  });

  it("grades RAM amber between 8% and 20% free", () => {
    const f = forecastCapacity(steadyMem(2.4 * GB), { now: NOW }); // 15%
    expect(f.ram.band).toBe("amber");
  });

  it("grades RAM green above 20% free", () => {
    const f = forecastCapacity(steadyMem(8 * GB), { now: NOW }); // 50%
    expect(f.ram.band).toBe("green");
  });

  it("grades CPU headroom off per-core load", () => {
    const cpu = (load: number) =>
      forecastCapacity(series({ count: 10, cpu: () => ({ load, cores: 4 }) }), { now: NOW }).cpu.band;
    expect(cpu(3.8)).toBe("red"); // 0.95/core → 5% headroom
    expect(cpu(3.4)).toBe("amber"); // 0.85/core → 15% headroom
    expect(cpu(1.0)).toBe("green"); // 0.25/core → 75% headroom
  });
});

describe("forecastCapacity — worst dimension dominates", () => {
  it("lets a RAM squeeze drive pressure red while disk is calm", () => {
    const f = forecastCapacity(
      series({
        count: 12,
        disk: () => ({ free: 80 * GB, total: 100 * GB }), // flat, green
        mem: () => ({ free: 0.8 * GB, total: 16 * GB }), // ~5%, red
      }),
      { now: NOW },
    );
    expect(f.disk.band).toBe("green");
    expect(f.ram.band).toBe("red");
    expect(f.pressure).toBe("red");
    // The countdown is still disk-only (none here), never RAM's.
    expect(f.horizonDays).toBeNull();
  });
});

describe("stabilizeBand — hysteresis", () => {
  it("adopts the newest band immediately when there is no prior state", () => {
    expect(stabilizeBand("unknown", ["amber"])).toBe("amber");
  });

  it("worsens only after enough consecutive worse readings", () => {
    expect(stabilizeBand("green", ["green", "amber"], { worsenAfter: 2 })).toBe("green");
    expect(stabilizeBand("green", ["amber", "amber"], { worsenAfter: 2 })).toBe("amber");
  });

  it("eases only after enough consecutive better readings", () => {
    expect(stabilizeBand("red", ["red", "amber", "amber"], { easeAfter: 3 })).toBe("red");
    expect(stabilizeBand("red", ["amber", "amber", "amber"], { easeAfter: 3 })).toBe("amber");
  });

  it("ignores unknown readings", () => {
    expect(stabilizeBand("green", ["amber", "unknown"], { worsenAfter: 2 })).toBe("green");
    expect(stabilizeBand("green", ["unknown", "unknown"])).toBe("green");
  });
});
