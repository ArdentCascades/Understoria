/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Node capacity self-sampler (docs/capacity-forecast.md §3A, PR 2).
 *
 * Two REAL in-memory `node_capacity_samples` tables drive these: the
 * ring-buffer store (insert + trim invariants) and the sampler worker
 * over injected `fs`/`os`/clock fakes — no real disk, no timers. The
 * last cases lock the privacy contract from §7: this table is
 * operator-local, so it must stay absent from the `insertCaps`
 * write-side surfaces and off every federation pull leg.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  createCapacitySampleStore,
  openDatabase,
  type CapacitySampleStore,
} from "./db.js";
import {
  startCapacitySampler,
  type CapacitySamplerDeps,
} from "./capacitySampler.js";
import { SURFACES } from "./insertCaps.js";

let db: DatabaseType;

beforeEach(() => {
  db = openDatabase(":memory:");
});

afterEach(() => {
  db.close();
});

/** A fully-readable platform; each test overrides the parts it cares
 *  about. Distinct disk/mem/load values so mis-wired fields show up. */
function fakeDeps(over: Partial<CapacitySamplerDeps> = {}): CapacitySamplerDeps {
  return {
    statfs: () => ({ bsize: 4096, bavail: 1000, blocks: 5000 }),
    fileSize: (p) => (p.endsWith("-wal") ? 2048 : 10_240),
    freemem: () => 2_000_000,
    totalmem: () => 8_000_000,
    loadavg: () => [1.5, 1.2, 0.9],
    now: () => 1_700_000_000_000,
    ...over,
  };
}

function makeSampler(
  store: CapacitySampleStore,
  deps: Partial<CapacitySamplerDeps>,
  keepN = 2000,
) {
  // intervalMs 0 → no timer; tests drive sampleOnce() by hand.
  return startCapacitySampler({
    store,
    databasePath: "/srv/understoria.db",
    intervalMs: 0,
    keepN,
    deps,
  });
}

describe("createCapacitySampleStore ring buffer", () => {
  it("keeps at most keepN rows, trimming oldest-first", () => {
    const store = createCapacitySampleStore(db);
    for (let i = 0; i < 12; i++) {
      store.record(
        {
          sampledAt: 1000 + i,
          diskFreeBytes: 500 - i,
          diskTotalBytes: 1000,
          dbSizeBytes: i,
          memFreeBytes: null,
          memTotalBytes: null,
          loadAvg1m: null,
        },
        5,
      );
    }
    expect(store.count()).toBe(5);
    const rows = store.recent();
    // Oldest-first, and the survivors are the newest five sampledAts.
    expect(rows.map((r) => r.sampledAt)).toEqual([1007, 1008, 1009, 1010, 1011]);
    // Monotonic ids: trimming by rowid never re-serves a stale row.
    expect(rows.map((r) => r.id)).toEqual([8, 9, 10, 11, 12]);
  });

  it("keepN <= 0 keeps everything", () => {
    const store = createCapacitySampleStore(db);
    for (let i = 0; i < 4; i++) {
      store.record(
        {
          sampledAt: 2000 + i,
          diskFreeBytes: null,
          diskTotalBytes: null,
          dbSizeBytes: null,
          memFreeBytes: null,
          memTotalBytes: null,
          loadAvg1m: null,
        },
        0,
      );
    }
    expect(store.count()).toBe(4);
  });

  it("recent(limit) returns the newest N, still oldest-first", () => {
    const store = createCapacitySampleStore(db);
    for (let i = 0; i < 6; i++) {
      store.record(
        {
          sampledAt: 3000 + i,
          diskFreeBytes: null,
          diskTotalBytes: null,
          dbSizeBytes: null,
          memFreeBytes: null,
          memTotalBytes: null,
          loadAvg1m: null,
        },
        1000,
      );
    }
    expect(store.recent(2).map((r) => r.sampledAt)).toEqual([3004, 3005]);
  });
});

describe("startCapacitySampler.sampleOnce", () => {
  it("composes disk/db/mem/cpu from the injected platform", () => {
    const store = createCapacitySampleStore(db);
    const sampler = makeSampler(store, fakeDeps());
    const s = sampler.sampleOnce();
    sampler.stop();

    expect(s).not.toBeNull();
    // free = bavail * bsize; total = blocks * bsize.
    expect(s?.diskFreeBytes).toBe(1000 * 4096);
    expect(s?.diskTotalBytes).toBe(5000 * 4096);
    // DB footprint = main file + WAL sidecar.
    expect(s?.dbSizeBytes).toBe(10_240 + 2048);
    expect(s?.memFreeBytes).toBe(2_000_000);
    expect(s?.memTotalBytes).toBe(8_000_000);
    // Only the 1-minute figure is kept.
    expect(s?.loadAvg1m).toBe(1.5);
    expect(s?.sampledAt).toBe(1_700_000_000_000);
    expect(store.count()).toBe(1);
  });

  it("statfs the DB's directory, not the file", () => {
    const store = createCapacitySampleStore(db);
    let seen = "";
    const sampler = makeSampler(
      store,
      fakeDeps({
        statfs: (p) => {
          seen = p;
          return { bsize: 4096, bavail: 1, blocks: 2 };
        },
      }),
    );
    sampler.sampleOnce();
    sampler.stop();
    expect(seen).toBe("/srv");
  });

  it("a missing WAL sidecar contributes 0, not a failure", () => {
    const store = createCapacitySampleStore(db);
    const sampler = makeSampler(
      store,
      fakeDeps({
        fileSize: (p) => {
          if (p.endsWith("-wal")) throw new Error("ENOENT");
          return 4096;
        },
      }),
    );
    const s = sampler.sampleOnce();
    sampler.stop();
    expect(s?.dbSizeBytes).toBe(4096);
  });

  it("an unreadable main DB file leaves dbSize null (not a false zero)", () => {
    const store = createCapacitySampleStore(db);
    const sampler = makeSampler(
      store,
      fakeDeps({
        fileSize: () => {
          throw new Error("ENOENT");
        },
      }),
    );
    const s = sampler.sampleOnce();
    sampler.stop();
    expect(s?.dbSizeBytes).toBeNull();
    // Disk/mem/cpu still read, so the row is still worth keeping.
    expect(s?.diskFreeBytes).not.toBeNull();
    expect(store.count()).toBe(1);
  });

  it("a single unreadable dimension doesn't sink the others", () => {
    const store = createCapacitySampleStore(db);
    const sampler = makeSampler(
      store,
      fakeDeps({
        statfs: () => {
          throw new Error("statfs unsupported");
        },
      }),
    );
    const s = sampler.sampleOnce();
    sampler.stop();
    expect(s?.diskFreeBytes).toBeNull();
    expect(s?.diskTotalBytes).toBeNull();
    expect(s?.memFreeBytes).toBe(2_000_000);
    expect(store.count()).toBe(1);
  });

  it("records nothing when the whole platform is opaque", () => {
    const store = createCapacitySampleStore(db);
    const boom = () => {
      throw new Error("unsupported");
    };
    const sampler = makeSampler(
      store,
      fakeDeps({
        statfs: boom,
        fileSize: boom,
        freemem: boom,
        totalmem: boom,
        loadavg: boom,
      }),
    );
    const s = sampler.sampleOnce();
    sampler.stop();
    expect(s).toBeNull();
    expect(store.count()).toBe(0);
  });

  it("records to the ring buffer with the configured keepN", () => {
    const store = createCapacitySampleStore(db);
    const sampler = makeSampler(store, fakeDeps(), 3);
    for (let i = 0; i < 5; i++) sampler.sampleOnce();
    sampler.stop();
    expect(store.count()).toBe(3);
  });
});

describe("capacity samples stay operator-local (docs §7)", () => {
  it("the table is absent from the insertCaps write surfaces", () => {
    for (const surface of Object.values(SURFACES)) {
      expect(surface.table).not.toBe("node_capacity_samples");
    }
  });

  it("no route or federation leg references the table", () => {
    // §3A/§7: no POST route, no peerPull/mirrorPull spec — the raw
    // samples never leave the box. Grep-guard the source so a future
    // edit that serves or replicates the table trips this test. (The
    // coarse CapacityPosture that PR 3 *does* federate is a different
    // table; only node_capacity_samples is operator-local.)
    const roots = ["server.ts", "peerPull.ts", "mirrorPull.ts"];
    for (const file of roots) {
      const src = readFileSync(
        fileURLToPath(new URL(`./${file}`, import.meta.url)),
        "utf8",
      );
      expect(src).not.toContain("node_capacity_samples");
    }
  });
});
