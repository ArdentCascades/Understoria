/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The storage watchdog exists for one failure: WebKit resuming a
// suspended home-screen PWA with a dead IndexedDB connection, where
// every request hangs with no rejection (the stuck-"Working…" task
// confirm). These tests pin the whole decision tree: a probe that
// answers (even by rejecting) stands down, only double-confirmed
// silence reloads, boot/upgrade windows and hidden pages are never
// probed, and recovery is throttled so a broken profile can't
// reload-loop.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startStorageWatchdog } from "./storageWatchdog";

const PROBE_TIMEOUT = 3_000;
const RECHECK = 1_000;

function hungProbe(): Promise<unknown> {
  return new Promise(() => {});
}

describe("storageWatchdog", () => {
  let stop: (() => void) | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    stop?.();
    stop = null;
    vi.useRealTimers();
  });

  function start(overrides: Parameters<typeof startStorageWatchdog>[0] = {}) {
    stop = startStorageWatchdog({
      isVisible: () => true,
      isDbOpen: () => true,
      ...overrides,
    });
    return stop;
  }

  async function runFullCheck(): Promise<void> {
    await vi.advanceTimersByTimeAsync(PROBE_TIMEOUT); // first probe budget
    await vi.advanceTimersByTimeAsync(RECHECK); // confirmation pause
    await vi.advanceTimersByTimeAsync(PROBE_TIMEOUT); // second probe budget
  }

  it("stands down when the probe answers", async () => {
    const probe = vi.fn(() => Promise.resolve(undefined));
    const reload = vi.fn();
    start({ probe, reload });
    window.dispatchEvent(new Event("focus"));
    await runFullCheck();
    expect(probe).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
  });

  it("treats a REJECTING probe as an answering connection", async () => {
    // Only silence is death — an error still proves the connection
    // calls back, and reloading on it would turn every transient read
    // failure into a page loss.
    const probe = vi.fn(() => Promise.reject(new Error("boom")));
    const reload = vi.fn();
    start({ probe, reload });
    window.dispatchEvent(new Event("focus"));
    await runFullCheck();
    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads only after a hung probe is confirmed by a second hung probe", async () => {
    const probe = vi.fn(hungProbe);
    const reload = vi.fn();
    start({ probe, reload });
    window.dispatchEvent(new Event("focus"));

    // First probe timing out is not enough on its own.
    await vi.advanceTimersByTimeAsync(PROBE_TIMEOUT);
    expect(reload).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(RECHECK + PROBE_TIMEOUT);
    expect(probe).toHaveBeenCalledTimes(2);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("recovers when the connection comes back for the second probe", async () => {
    // First probe hangs, second answers — a wake-burst write queue,
    // not a dead connection.
    const probe = vi
      .fn<() => Promise<unknown>>()
      .mockImplementationOnce(hungProbe)
      .mockImplementation(() => Promise.resolve(undefined));
    const reload = vi.fn();
    start({ probe, reload });
    window.dispatchEvent(new Event("focus"));
    await runFullCheck();
    expect(probe).toHaveBeenCalledTimes(2);
    expect(reload).not.toHaveBeenCalled();
  });

  it("coalesces the wake burst into one check", async () => {
    const probe = vi.fn(() => Promise.resolve(undefined));
    start({ probe, reload: vi.fn() });
    // focus + visibilitychange + pageshow arrive together on resume.
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pageshow"));
    await vi.advanceTimersByTimeAsync(0);
    expect(probe).toHaveBeenCalledTimes(1);
  });

  it("throttles recovery to one reload per window", async () => {
    const probe = vi.fn(hungProbe);
    const reload = vi.fn();
    start({ probe, reload });

    window.dispatchEvent(new Event("focus"));
    await runFullCheck();
    expect(reload).toHaveBeenCalledTimes(1);

    // A later wake (past coalescing, inside the 60s throttle) with
    // storage still dead must NOT reload again — a profile where the
    // reload didn't help would otherwise loop.
    await vi.advanceTimersByTimeAsync(15_000);
    window.dispatchEvent(new Event("focus"));
    await runFullCheck();
    expect(reload).toHaveBeenCalledTimes(1);

    // Past the throttle window, recovery is allowed once more.
    await vi.advanceTimersByTimeAsync(60_000);
    window.dispatchEvent(new Event("focus"));
    await runFullCheck();
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it("never probes while hidden", async () => {
    const probe = vi.fn(() => Promise.resolve(undefined));
    start({ probe, isVisible: () => false });
    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(0);
    expect(probe).not.toHaveBeenCalled();
  });

  it("never probes while the database is still opening (boot / upgrade)", async () => {
    // The dead-after-resume state reads as OPEN — the open succeeded
    // long ago and the connection died underneath it. Not-open means
    // boot or a version migration, and a reload there could interrupt
    // the upgrade.
    const probe = vi.fn(() => Promise.resolve(undefined));
    start({ probe, isDbOpen: () => false });
    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(0);
    expect(probe).not.toHaveBeenCalled();
  });

  it("stop() unbinds the wake listeners", async () => {
    const probe = vi.fn(() => Promise.resolve(undefined));
    const s = start({ probe });
    s();
    stop = null;
    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(0);
    expect(probe).not.toHaveBeenCalled();
  });
});
