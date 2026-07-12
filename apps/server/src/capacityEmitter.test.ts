/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Capacity posture emitter (docs/capacity-forecast.md §6, PR 3) over a
 * REAL in-memory db + real stores + a real system-key signer. The
 * cases pin the §11 emit rules: a posture is written ONLY on a band
 * transition, it is node-system-key-signed (verifies through the shared
 * `verifyCapacityPosture`), it carries a band/horizon/trigger and
 * nothing quantitative, and the emitter re-seeds its stable band from a
 * stored posture so a restart doesn't re-emit.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import { verifyCapacityPosture } from "@understoria/shared/crypto";
import {
  createCapacityPostureStore,
  createCapacitySampleStore,
  openDatabase,
  type CapacityPostureStore,
  type CapacitySampleInput,
  type CapacitySampleStore,
} from "./db.js";
import { createSystemSignerFromSecret, type SystemSigner } from "./systemSigner.js";
import { createCapacityEmitter } from "./capacityEmitter.js";
import { generateKeyPair } from "@understoria/shared/crypto";

const DAY = 86_400_000;
const NOW = 1_700_000_000_000;

let db: DatabaseType;
let sampleStore: CapacitySampleStore;
let postureStore: CapacityPostureStore;
let signer: SystemSigner;

beforeEach(() => {
  db = openDatabase(":memory:");
  sampleStore = createCapacitySampleStore(db);
  postureStore = createCapacityPostureStore(db);
  signer = createSystemSignerFromSecret(generateKeyPair().secretKey)!;
});

afterEach(() => {
  db.close();
});

/** Seed the ring buffer with a disk series that drains from `startGB`
 *  by `perDayGB` per day across `count` daily samples ending at `now`.
 *  RAM/CPU are comfortable so disk drives the band. */
function seedDiskSeries(opts: {
  count: number;
  startFreeGB: number;
  perDayGB: number;
  totalGB: number;
  now: number;
}): void {
  const GB = 1_000_000_000;
  for (let i = 0; i < opts.count; i++) {
    const t = opts.now - (opts.count - 1 - i) * DAY;
    const freeGB = opts.startFreeGB - opts.perDayGB * i;
    const s: CapacitySampleInput = {
      sampledAt: t,
      diskFreeBytes: Math.max(0, freeGB) * GB,
      diskTotalBytes: opts.totalGB * GB,
      dbSizeBytes: 1_000_000,
      memFreeBytes: 8 * GB, // 50% free — comfortable
      memTotalBytes: 16 * GB,
      loadAvg1m: 0.5,
    };
    sampleStore.record(s, 5000);
  }
}

function makeEmitter(
  over: Partial<Parameters<typeof createCapacityEmitter>[0]> = {},
) {
  return createCapacityEmitter({
    sampleStore,
    postureStore,
    signer,
    nodeId: "node_test",
    cpuCount: 4,
    now: () => NOW,
    // Tight hysteresis so a single check can transition in tests.
    hysteresis: { worsenAfter: 1, easeAfter: 1 },
    ...over,
  });
}

describe("createCapacityEmitter.check", () => {
  it("returns null while still gathering data (sub-minimum samples)", () => {
    seedDiskSeries({
      count: 3, // below the forecaster's minSamples
      startFreeGB: 100,
      perDayGB: 1,
      totalGB: 500,
      now: NOW,
    });
    const emitter = makeEmitter();
    expect(emitter.check()).toBeNull();
    expect(postureStore.count()).toBe(0);
  });

  it("emits a signed posture on the first real band, verifiable by the node key", () => {
    // Draining fast: ~2 GB/day from 60 GB free → ~30 days to full = red.
    seedDiskSeries({
      count: 20,
      startFreeGB: 100,
      perDayGB: 2,
      totalGB: 500,
      now: NOW,
    });
    const emitter = makeEmitter();
    const posture = emitter.check();
    expect(posture).not.toBeNull();
    expect(posture!.nodeId).toBe("node_test");
    expect(posture!.pressure).toBe("red");
    expect(posture!.horizon).toBe("weeks");
    expect(posture!.growthRecommended).toBe(true);
    expect(posture!.signerKey).toBe(signer.publicKey);
    // Signed by the node system key, verifiable through the shared path.
    expect(verifyCapacityPosture(posture!)).toBe(true);
    // Persisted, LWW by nodeId.
    expect(postureStore.get("node_test")?.pressure).toBe("red");
    // Coarse by construction: no quantitative field leaked.
    expect(Object.keys(posture!).sort()).toEqual(
      [
        "nodeId",
        "pressure",
        "horizon",
        "growthRecommended",
        "updatedAt",
        "signerKey",
        "signature",
      ].sort(),
    );
  });

  it("is a no-op at a steady band — emits ONLY on a transition", () => {
    seedDiskSeries({
      count: 20,
      startFreeGB: 100,
      perDayGB: 2,
      totalGB: 500,
      now: NOW,
    });
    const emitter = makeEmitter();
    expect(emitter.check()?.pressure).toBe("red");
    // Same data, same band → nothing new written.
    expect(emitter.check()).toBeNull();
    expect(emitter.check()).toBeNull();
    expect(postureStore.count()).toBe(1);
  });

  it("a flat disk reads green with an ample horizon and no growth flag", () => {
    seedDiskSeries({
      count: 20,
      startFreeGB: 250,
      perDayGB: 0, // flat
      totalGB: 500,
      now: NOW,
    });
    const emitter = makeEmitter();
    const posture = emitter.check();
    expect(posture!.pressure).toBe("green");
    expect(posture!.horizon).toBe("ample");
    expect(posture!.growthRecommended).toBe(false);
  });

  it("re-seeds the stable band from a stored posture — no re-emit after restart", () => {
    seedDiskSeries({
      count: 20,
      startFreeGB: 100,
      perDayGB: 2,
      totalGB: 500,
      now: NOW,
    });
    // First emitter establishes red.
    expect(makeEmitter().check()?.pressure).toBe("red");
    const before = postureStore.get("node_test")!.updatedAt;
    // A fresh emitter (simulating a restart) sees the same red data and
    // must NOT re-emit — it seeds lastBand from the stored posture.
    const restarted = makeEmitter({ now: () => NOW + DAY });
    expect(restarted.check()).toBeNull();
    expect(postureStore.get("node_test")!.updatedAt).toBe(before);
  });

  it("RAM pressure drives the band even when disk is fine (worst-of-three)", () => {
    const GB = 1_000_000_000;
    for (let i = 0; i < 20; i++) {
      sampleStore.record(
        {
          sampledAt: NOW - (19 - i) * DAY,
          diskFreeBytes: 400 * GB, // roomy, flat
          diskTotalBytes: 500 * GB,
          dbSizeBytes: 1_000_000,
          memFreeBytes: 0.4 * GB, // ~2.5% free of 16 GB → red headroom
          memTotalBytes: 16 * GB,
          loadAvg1m: 0.5,
        },
        5000,
      );
    }
    const posture = makeEmitter().check();
    expect(posture!.pressure).toBe("red");
    // But the countdown stays disk-only: disk isn't filling → ample.
    expect(posture!.horizon).toBe("ample");
  });
});
