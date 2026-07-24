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

// The federation pull loop — how a device notices records other
// members pushed to the node. Sending is already prompt (every write
// calls `flushOutboxNow`), so the felt latency between two co-present
// people is entirely the RECEIVE cadence. This module makes that
// cadence live during active use without changing WHAT or WHERE data
// flows (the node still relays everything; see docs/sync-liveness.md):
//
//   1. Pull on focus / visibility-regain / reconnect — the instant the
//      app comes forward, reconcile (a coalesced, in-flight-guarded
//      "kick"). This is the biggest felt win at zero steady cost.
//   2. Activity-aware cadence — while foregrounded and recently
//      interacted-with, poll every HOT_MS (~12s); backgrounded or idle,
//      fall back to COLD_MS (3 min). A foreground-but-idle tab quietly
//      backs off (QUIET) so it doesn't poll at full rate forever.
//   3. Hot set vs cold set — only tables that change during live
//      collaboration ride the fast tick; rare membership/governance
//      tables stay on the slow beat, keeping the hot tick cheap.
//
// Privacy: the node already serves every read, so polling more often
// exposes no new information and no new surface — only tighter timing.
// Backgrounded is always cold, preserving the "device is asleep"
// signal. No peer channel, no persistent connection, no presence beacon.

type FederationSyncModule = typeof import("@/lib/federationSync");

/** The pull functions this loop drives — Pick keeps the signatures
 *  (including `pullFederatedClaims`'s `number` return) honest against
 *  federationSync without re-declaring them. */
export type SyncPulls = Pick<
  FederationSyncModule,
  | "pullFederatedPosts"
  | "pullFederatedClaims"
  | "pullFederatedTaskComments"
  | "pullFederatedExchanges"
  | "pullFederatedMessages"
  | "pullFederatedEvents"
  | "pullFederatedEventRsvps"
  | "pullFederatedEventShifts"
  | "pullFederatedShiftSignups"
  | "pullFederatedProjectStates"
  | "pullFederatedTaskStates"
  | "pullFederatedCoOrgInvitations"
  | "pullFederatedCoOrgResponses"
  | "pullFederatedCoOrgRevocations"
  | "pullFederatedEventCancellations"
  | "pullFederatedRedemptions"
  | "pullFederatedInviteRevocations"
  | "pullFederatedVouches"
  | "pullFederatedSeedVaultPledges"
  | "pullCapacityPostures"
  | "pullFederatedMemberRemovals"
  | "pullFederatedMemberReinstatements"
  | "pullFederatedProposals"
  | "pullFederatedVotes"
  | "pullFederatedProposalClosures"
  | "pullFounderNomination"
>;

/** Fast tick while foregrounded + active. */
export const HOT_MS = 12_000;
/** Slow tick when backgrounded or idle — the prior whole-loop cadence. */
export const COLD_MS = 180_000;
/** No interaction for this long (while visible) → treated as idle. */
export const IDLE_MS = 60_000;
/** Consecutive empty hot ticks before the interval starts stretching. */
export const QUIET_AFTER = 3;
/** Ceiling on the backed-off hot interval (never exceeds cold). */
export const HOT_MAX_MS = 60_000;
/** Focus + visibilitychange fire together; collapse kicks within this. */
export const KICK_COALESCE_MS = 1_000;

/** Custom window event that triggers an immediate coalesced sync
 *  cycle — the nudge stream (lib/nudgeStream.ts) dispatches it when
 *  the server announces "something changed". Same treatment as a
 *  focus kick. */
export const SYNC_KICK_EVENT = "understoria:sync-kick";
/** ± jitter so a room of devices that foreground together don't stampede. */
const JITTER = 0.15;

export interface SyncLoopOptions {
  /** Loads the pull module. Defaults to the code-split dynamic import. */
  loadPulls?: () => Promise<SyncPulls>;
  /** Injected for deterministic jitter in tests. */
  random?: () => number;
  /** Injected clock. */
  now?: () => number;
}

/** Sum the "new rows landed" signal across a set of pull results. Most
 *  pulls return `{inserted}`; `pullFederatedClaims` returns a bare
 *  count. Only used to decide whether to back off — never for display. */
function insertedOf(
  r: { inserted: number } | number | null | undefined,
): number {
  if (r == null) return 0;
  if (typeof r === "number") return r > 0 ? r : 0;
  return r.inserted;
}

/**
 * The HOT set — tables that change during live, side-by-side use.
 * Awaited (not fire-and-forget) so the loop learns whether anything
 * landed, which drives the quiet-backoff. Dependency order preserved:
 * events → (rsvps ∥ shifts → signups); projects → tasks
 * (docs/project-federation.md §6).
 */
async function runHot(p: SyncPulls): Promise<number> {
  let inserted = 0;
  const add = (r: { inserted: number } | number | null | undefined) => {
    inserted += insertedOf(r);
  };

  const independent = await Promise.all([
    p.pullFederatedPosts(),
    p.pullFederatedClaims(),
    p.pullFederatedTaskComments(),
    p.pullFederatedExchanges(),
    p.pullFederatedMessages(),
  ]);
  independent.forEach(add);

  await Promise.all([
    (async () => {
      add(await p.pullFederatedEvents());
      const [rsvps, shifts] = await Promise.all([
        p.pullFederatedEventRsvps(),
        p.pullFederatedEventShifts(),
      ]);
      add(rsvps);
      add(shifts);
      add(await p.pullFederatedShiftSignups());
    })(),
    (async () => {
      add(await p.pullFederatedProjectStates());
      add(await p.pullFederatedTaskStates());
    })(),
  ]);

  return inserted;
}

/**
 * The COLD set — membership + governance records that rarely change
 * and never need to feel instant. Fire-and-forget (the loop doesn't
 * gate its cadence on these). Referent order held for
 * proposals → votes → closures (docs/proposal-federation.md G1).
 */
function runCold(p: SyncPulls): void {
  void p.pullFederatedCoOrgInvitations();
  void p.pullFederatedCoOrgResponses();
  void p.pullFederatedCoOrgRevocations();
  void p.pullFederatedEventCancellations();
  void p.pullFederatedRedemptions();
  void p.pullFederatedInviteRevocations();
  void p.pullFederatedVouches();
  void p.pullFederatedSeedVaultPledges();
  void p.pullCapacityPostures();
  void p.pullFederatedMemberRemovals();
  void p.pullFederatedMemberReinstatements();
  // Co-founder nominations live for days; the accept card is a
  // deliberate ceremony, not live collaboration. The first cycle
  // always runs the cold set, so a foregrounding device still picks
  // an incoming nomination up promptly.
  void p.pullFounderNomination();
  void p.pullFederatedProposals().then(() => {
    void p.pullFederatedVotes();
    void p.pullFederatedProposalClosures();
  });
}

function defaultIsVisible(): boolean {
  return (
    typeof document === "undefined" ||
    document.visibilityState === "visible"
  );
}

function defaultIsOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

/**
 * Start the loop. Returns a stop function that cancels the timer and
 * unbinds every listener (idempotent). Runs one full cycle immediately
 * (hot + cold), matching the prior startup-pull behavior.
 */
export function startSyncLoop(options: SyncLoopOptions = {}): () => void {
  const loadPulls =
    options.loadPulls ?? (() => import("@/lib/federationSync"));
  const random = options.random ?? Math.random;
  const now = options.now ?? Date.now;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  let running = false;
  /** A kick/tick that arrived mid-cycle asks the current cycle to run
   *  once more instead of stacking a concurrent fan-out. */
  let rerun = false;
  // Sentinel so the first kick is never mistaken for a coalesced repeat
  // (matters when the clock starts near 0, e.g. under fake timers).
  let lastKickAt = Number.NEGATIVE_INFINITY;
  // -Infinity so the first cycle always runs the cold set (its "last
  // run" is infinitely long ago). A 0 sentinel breaks when the clock
  // starts at 0.
  let lastColdAt = Number.NEGATIVE_INFINITY;
  let lastInteractionAt = now();
  /** Consecutive empty hot ticks — stretches the hot interval. */
  let quietTicks = 0;

  const jitter = (ms: number): number =>
    Math.max(1, Math.round(ms * (1 + (random() - 0.5) * 2 * JITTER)));

  const isVisible = defaultIsVisible;
  const isOnline = defaultIsOnline;

  const active = (): boolean =>
    isVisible() && now() - lastInteractionAt < IDLE_MS;

  const hotInterval = (): number => {
    if (quietTicks < QUIET_AFTER) return HOT_MS;
    const stretched = HOT_MS * 2 ** (quietTicks - QUIET_AFTER + 1);
    return Math.min(stretched, HOT_MAX_MS);
  };

  const nextDelay = (): number =>
    jitter(active() ? hotInterval() : COLD_MS);

  const schedule = (delay: number): void => {
    if (stopped) return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => void cycle(false), delay);
  };

  async function cycle(kicked: boolean): Promise<void> {
    if (stopped) return;
    if (running) {
      // A concurrent trigger — coalesce into one more run after this.
      rerun = true;
      return;
    }
    running = true;
    try {
      do {
        rerun = false;
        if (!isOnline()) break; // reconnect fires `online` → kicks us
        const pulls = await loadPulls();
        const inserted = await runHot(pulls);
        if (kicked) {
          // A foregrounding/interaction wants fresh data — reset the
          // backoff regardless of what this cycle returned.
          quietTicks = 0;
        } else {
          quietTicks = inserted > 0 ? 0 : quietTicks + 1;
        }
        if (now() - lastColdAt >= COLD_MS) {
          lastColdAt = now();
          runCold(pulls);
        }
      } while (rerun && !stopped);
    } finally {
      running = false;
      schedule(nextDelay());
    }
  }

  /** Coalesced immediate pull for focus/visibility/online/wake. */
  function kick(): void {
    if (stopped || !isOnline()) return;
    const t = now();
    if (t - lastKickAt < KICK_COALESCE_MS) return;
    lastKickAt = t;
    lastInteractionAt = t; // foregrounding counts as activity
    void cycle(true);
  }

  function onVisibility(): void {
    if (isVisible()) kick();
    else schedule(nextDelay()); // dropped to background → reschedule cold
  }

  function onInteraction(): void {
    const wasIdle = now() - lastInteractionAt >= IDLE_MS;
    lastInteractionAt = now();
    quietTicks = 0;
    // Waking an idle-but-foreground tab: pull soon rather than waiting
    // out a backed-off interval. Continuous typing doesn't re-kick —
    // `wasIdle` is only true on the first interaction after a lull.
    if (wasIdle) kick();
  }

  const unbinders: Array<() => void> = [];
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const bind = (
      target: EventTarget,
      type: string,
      fn: () => void,
    ): void => {
      target.addEventListener(type, fn, { passive: true });
      unbinders.push(() => target.removeEventListener(type, fn));
    };
    bind(document, "visibilitychange", onVisibility);
    bind(window, "focus", kick);
    bind(window, "online", kick);
    // Server push (docs/sync-liveness.md): the nudge stream turns a
    // content-free SSE event into exactly this kick.
    bind(window, SYNC_KICK_EVENT, kick);
    bind(window, "pointerdown", onInteraction);
    bind(window, "keydown", onInteraction);
  }

  // Kick off immediately (hot + cold), then let the scheduler take over.
  void cycle(false);

  return () => {
    stopped = true;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    for (const off of unbinders) off();
    unbinders.length = 0;
  };
}
