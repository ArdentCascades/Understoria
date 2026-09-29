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
//
// Storage watchdog (the stuck-"Working…" fix).
//
// WebKit can hand a resumed home-screen PWA a dead IndexedDB
// connection: after the OS suspends the page and the member returns —
// most often by tapping a notification — requests on the old
// connection never fire success OR error. Every Dexie promise then
// hangs forever. The visible symptom that motivated this module: an
// organizer taps Confirm on a completed task and the button stays at
// "Working…" indefinitely — no error toast, because there is no
// rejection to toast; usePendingAction's `finally` never runs. The
// members map read hangs the same way, so the page reads
// "Completed by —".
//
// The confirm path is entirely local (Dexie + synchronous signing), so
// a non-settling promise there IS the storage layer not answering.
// Recovery has to replace the page's IndexedDB connection. Closing and
// reopening the Dexie instance in place would do that for NEW work,
// but it errors every mounted liveQuery subscription (they don't
// re-subscribe), which trades a hang for a crash. A reload is the
// honest recovery: the app is local-first and boots in moments, and
// the watchdog only fires when storage has provably stopped answering
// — a state in which every tap already hangs forever, so there is
// nothing left on the page worth preserving.
//
// Shape: on every wake (visibilitychange → visible, window focus,
// pageshow — the same signals lib/syncLoop pulls on), race one trivial
// read against a timeout. Generous timeout and a confirming second
// probe, so a slow disk or a wake-burst write queue is never mistaken
// for a dead connection; a sessionStorage throttle caps recovery at
// one reload per window so a genuinely broken profile can't reload-loop.

import { db } from "@/db/database";

/** One probe's budget. IDB point reads answer in milliseconds; only a
 *  dead connection (or an implausibly wedged disk) misses this. */
const PROBE_TIMEOUT_MS = 3_000;
/** Pause between the failed first probe and the confirming second. */
const RECHECK_DELAY_MS = 1_000;
/** Wakes arrive in bursts (focus + visibilitychange together). */
const WAKE_COALESCE_MS = 10_000;
/** At most one recovery reload per this window. */
const RELOAD_THROTTLE_MS = 60_000;
const RELOAD_STAMP_KEY = "understoria.storageWatchdog.lastReload";

export interface StorageWatchdogOptions {
  /** Trivial read that exercises the page's IndexedDB connection. */
  probe?: () => Promise<unknown>;
  /** Recovery action. Defaults to location.reload(). */
  reload?: () => void;
  now?: () => number;
  isVisible?: () => boolean;
  /** Guard against probing mid-open (see check()). */
  isDbOpen?: () => boolean;
  probeTimeoutMs?: number;
  recheckDelayMs?: number;
}

function defaultProbe(): Promise<unknown> {
  // A point read on a tiny always-present table. Dexie auto-opens a
  // merely-closed database, so this only stays unanswered when the
  // underlying connection is dead.
  return db.settings.get("storage-watchdog-probe");
}

function defaultIsVisible(): boolean {
  return (
    typeof document === "undefined" ||
    document.visibilityState === "visible"
  );
}

function readReloadStamp(): number {
  try {
    const raw = sessionStorage.getItem(RELOAD_STAMP_KEY);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeReloadStamp(now: number): void {
  try {
    sessionStorage.setItem(RELOAD_STAMP_KEY, String(now));
  } catch {
    // Private-mode storage failure just weakens the throttle.
  }
}

/** Resolves true when the probe answered within its budget. */
async function probeAnswers(
  probe: () => Promise<unknown>,
  timeoutMs: number,
): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      probe().then(
        () => true,
        // A probe that REJECTS still proves the connection answers —
        // only silence is death.
        () => true,
      ),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

/**
 * Start the watchdog. Returns a stop function that unbinds every
 * listener (idempotent). Deliberately does NOT probe at start: a
 * freshly-created page holds a freshly-created connection (the dead
 * state only arises when an EXISTING page is resumed), and a probe
 * racing a long schema migration at boot could mistake the upgrade
 * wait for death and reload mid-migration.
 */
export function startStorageWatchdog(
  options: StorageWatchdogOptions = {},
): () => void {
  const probe = options.probe ?? defaultProbe;
  const reload =
    options.reload ??
    (() => {
      window.location.reload();
    });
  const now = options.now ?? Date.now;
  const isVisible = options.isVisible ?? defaultIsVisible;
  const isDbOpen = options.isDbOpen ?? (() => db.isOpen());
  const probeTimeoutMs = options.probeTimeoutMs ?? PROBE_TIMEOUT_MS;
  const recheckDelayMs = options.recheckDelayMs ?? RECHECK_DELAY_MS;

  let stopped = false;
  let checking = false;
  let lastWakeAt = Number.NEGATIVE_INFINITY;

  async function check(): Promise<void> {
    if (stopped || checking || !isVisible()) return;
    // Not open = still opening (boot, or a version upgrade in
    // progress) or failed to open entirely. Neither is the
    // dead-after-resume state — that one reads as open, because the
    // open long since succeeded and the connection died silently
    // underneath it. A reload would interrupt the former and not help
    // the latter, so stand down.
    if (!isDbOpen()) return;
    checking = true;
    try {
      if (await probeAnswers(probe, probeTimeoutMs)) return;
      // Confirm before the drastic step: a wake-burst write queue or a
      // groaning disk gets a second chance to answer.
      await new Promise((r) => setTimeout(r, recheckDelayMs));
      if (stopped || !isVisible()) return;
      if (await probeAnswers(probe, probeTimeoutMs)) return;
      const t = now();
      if (t - readReloadStamp() < RELOAD_THROTTLE_MS) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn(
            "[understoria] storage still unresponsive after a recent recovery reload — not reloading again",
          );
        }
        return;
      }
      writeReloadStamp(t);
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[understoria] IndexedDB stopped answering after resume — reloading to get a fresh connection",
        );
      }
      reload();
    } finally {
      checking = false;
    }
  }

  function onWake(): void {
    if (stopped || !isVisible()) return;
    const t = now();
    if (t - lastWakeAt < WAKE_COALESCE_MS) return;
    lastWakeAt = t;
    void check();
  }

  const unbinders: Array<() => void> = [];
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const bind = (target: EventTarget, type: string, fn: () => void): void => {
      target.addEventListener(type, fn, { passive: true });
      unbinders.push(() => target.removeEventListener(type, fn));
    };
    bind(document, "visibilitychange", onWake);
    bind(window, "focus", onWake);
    // bfcache restores and some iOS resume paths announce themselves
    // here rather than via visibilitychange.
    bind(window, "pageshow", onWake);
  }

  return () => {
    stopped = true;
    for (const off of unbinders) off();
    unbinders.length = 0;
  };
}
