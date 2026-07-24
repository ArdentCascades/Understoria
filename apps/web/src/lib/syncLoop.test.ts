/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HOT_MS, COLD_MS, type SyncPulls, startSyncLoop } from "./syncLoop";

// The federation pull loop (docs/sync-liveness.md). Fake timers + a
// mock pull module drive the cadence and the focus/visibility/online
// kicks deterministically. `random: () => 0.5` zeroes the jitter so
// intervals are exact. `pullFederatedPosts` is the hot-set witness;
// `pullFederatedProposals` is the cold-set witness.

type MockPulls = Record<keyof SyncPulls, ReturnType<typeof vi.fn>>;

function makeMockPulls(): MockPulls {
  const ok = () => Promise.resolve({ inserted: 0, skipped: 0 });
  const num = () => Promise.resolve(0);
  const methods = [
    "pullFederatedPosts",
    "pullFederatedTaskComments",
    "pullFederatedExchanges",
    "pullFederatedMessages",
    "pullFederatedEvents",
    "pullFederatedEventRsvps",
    "pullFederatedEventShifts",
    "pullFederatedShiftSignups",
    "pullFederatedProjectStates",
    "pullFederatedTaskStates",
    "pullFederatedCoOrgInvitations",
    "pullFederatedCoOrgResponses",
    "pullFederatedCoOrgRevocations",
    "pullFederatedEventCancellations",
    "pullFederatedRedemptions",
    "pullFederatedInviteRevocations",
    "pullFederatedVouches",
    "pullFederatedSeedVaultPledges",
    "pullCapacityPostures",
    "pullFederatedMemberRemovals",
    "pullFederatedMemberReinstatements",
    "pullFounderNomination",
    "pullFederatedProposals",
    "pullFederatedVotes",
    "pullFederatedProposalClosures",
  ] as const;
  const pulls = {} as Record<string, ReturnType<typeof vi.fn>>;
  for (const m of methods) pulls[m] = vi.fn(ok);
  // pullFederatedClaims returns a bare count, not a result object.
  pulls.pullFederatedClaims = vi.fn(num);
  return pulls as unknown as MockPulls;
}

let mock: MockPulls;
let stop: (() => void) | null = null;

function start() {
  stop = startSyncLoop({
    loadPulls: () => Promise.resolve(mock as unknown as SyncPulls),
    random: () => 0.5,
  });
}

/** Flush the immediate (timer-less) startup cycle's awaited promises. */
async function flush() {
  await vi.advanceTimersByTimeAsync(1);
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
  });
}
function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", {
    value,
    configurable: true,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  setVisibility("visible");
  setOnline(true);
  mock = makeMockPulls();
});

afterEach(() => {
  stop?.();
  stop = null;
  vi.useRealTimers();
  setVisibility("visible");
  setOnline(true);
});

describe("syncLoop — startup + cadence", () => {
  it("runs one full cycle (hot + cold) on start", async () => {
    start();
    await flush();
    expect(mock.pullFederatedPosts).toHaveBeenCalledTimes(1);
    expect(mock.pullFederatedProposals).toHaveBeenCalledTimes(1);
  });

  it("re-pulls the hot set on the hot tick but not the cold set", async () => {
    start();
    await flush();
    await vi.advanceTimersByTimeAsync(HOT_MS);
    // A second hot pull fired; cold stays on its slow beat.
    expect(mock.pullFederatedPosts).toHaveBeenCalledTimes(2);
    expect(mock.pullFederatedProposals).toHaveBeenCalledTimes(1);
  });

  it("stretches the interval after consecutive empty hot ticks (quiet backoff)", async () => {
    start();
    await flush();
    // Ticks land at 12s and 24s; the third interval has backed off to
    // 24s (next tick at 48s), so at 40s there is no tick at 36s.
    await vi.advanceTimersByTimeAsync(40_000);
    expect(mock.pullFederatedPosts).toHaveBeenCalledTimes(3);
  });
});

describe("syncLoop — kicks (focus / visibility / reconnect)", () => {
  it("pulls the hot set immediately on visibilitychange → visible", async () => {
    start();
    await flush();
    const before = mock.pullFederatedPosts.mock.calls.length;
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    await flush();
    expect(mock.pullFederatedPosts.mock.calls.length).toBe(before + 1);
    // A kick is hot-only; the cold set did not re-run.
    expect(mock.pullFederatedProposals).toHaveBeenCalledTimes(1);
  });

  it("pulls on window focus and on reconnect (online)", async () => {
    start();
    await flush();
    const before = mock.pullFederatedPosts.mock.calls.length;
    window.dispatchEvent(new Event("focus"));
    await flush();
    // Advance past the coalesce window so the next kick is not swallowed.
    await vi.advanceTimersByTimeAsync(2_000);
    window.dispatchEvent(new Event("online"));
    await flush();
    expect(mock.pullFederatedPosts.mock.calls.length).toBe(before + 2);
  });

  it("coalesces rapid kicks into one pull", async () => {
    start();
    await flush();
    const before = mock.pullFederatedPosts.mock.calls.length;
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("focus"));
    window.dispatchEvent(new Event("focus"));
    await flush();
    expect(mock.pullFederatedPosts.mock.calls.length).toBe(before + 1);
  });

  it("does not kick when the tab goes to the background", async () => {
    start();
    await flush();
    const before = mock.pullFederatedPosts.mock.calls.length;
    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    await flush();
    expect(mock.pullFederatedPosts.mock.calls.length).toBe(before);
  });
});

describe("syncLoop — offline + teardown", () => {
  it("makes no requests while offline, then resumes on reconnect", async () => {
    setOnline(false);
    start();
    await flush();
    expect(mock.pullFederatedPosts).not.toHaveBeenCalled();
    setOnline(true);
    window.dispatchEvent(new Event("online"));
    await flush();
    expect(mock.pullFederatedPosts).toHaveBeenCalledTimes(1);
  });

  it("stop() halts the timer and unbinds every listener", async () => {
    start();
    await flush();
    const after = mock.pullFederatedPosts.mock.calls.length;
    stop?.();
    stop = null;
    await vi.advanceTimersByTimeAsync(COLD_MS * 2);
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
    await flush();
    expect(mock.pullFederatedPosts.mock.calls.length).toBe(after);
  });
});
