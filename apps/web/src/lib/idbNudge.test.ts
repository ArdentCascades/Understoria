/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The boot nudge exists for the wedged-WebKit state where even a
// fresh page's indexedDB.open() hangs. Pins: a healthy engine costs
// one call; a wedged engine is prodded until any call answers
// (however late, resolve or reject); the deadline caps the wait so
// boot is never held hostage; and environments without databases()
// pass through untouched.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nudgeIndexedDB } from "./idbNudge";

describe("nudgeIndexedDB", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns after one call on a healthy engine", async () => {
    const databases = vi.fn(() => Promise.resolve([]));
    const p = nudgeIndexedDB({ databases });
    await vi.advanceTimersByTimeAsync(0);
    await p;
    expect(databases).toHaveBeenCalledTimes(1);
  });

  it("keeps prodding a silent engine until any call answers", async () => {
    // First calls hang (the wedge); the prodding itself is the cure —
    // once the engine wakes, a later call resolves.
    let calls = 0;
    const databases = vi.fn(
      () =>
        new Promise<unknown>((resolve) => {
          calls += 1;
          if (calls >= 4) resolve([]);
        }),
    );
    const p = nudgeIndexedDB({ databases, intervalMs: 100 });
    await vi.advanceTimersByTimeAsync(300); // prods 2..4 fire
    await p;
    expect(calls).toBe(4);
  });

  it("a REJECTING call counts as an answering engine", async () => {
    const databases = vi.fn(() => Promise.reject(new Error("boom")));
    const p = nudgeIndexedDB({ databases });
    await vi.advanceTimersByTimeAsync(0);
    await p; // must not throw — the nudge never rejects
    expect(databases).toHaveBeenCalledTimes(1);
  });

  it("gives up at the deadline so boot is never held hostage", async () => {
    const databases = vi.fn(() => new Promise<unknown>(() => {}));
    const p = nudgeIndexedDB({
      databases,
      intervalMs: 100,
      deadlineMs: 450,
    });
    await vi.advanceTimersByTimeAsync(450);
    await p;
    // Prodding stops with the deadline: no calls after it.
    const callsAtDeadline = databases.mock.calls.length;
    await vi.advanceTimersByTimeAsync(1_000);
    expect(databases.mock.calls.length).toBe(callsAtDeadline);
  });

  it("passes through when the environment has no databases()", async () => {
    // Older browsers (and some harnesses) ship indexedDB without
    // databases(); the nudge must be a no-op there, not a crash.
    vi.stubGlobal("indexedDB", {});
    try {
      await expect(nudgeIndexedDB()).resolves.toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
