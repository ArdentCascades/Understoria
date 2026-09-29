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
// The IndexedDB boot nudge — the second half of the stuck-storage
// story that lib/storageWatchdog.ts opened.
//
// The watchdog heals a page RESUMED with a dead IndexedDB connection
// by reloading it. The follow-up field report: the reload can land on
// a boot that hangs too, because in the wedged WebKit state even a
// fresh document's `indexedDB.open()` may never answer — the storage
// process itself is stuck, not just one connection. AppContext's boot
// chain then never reaches ready and the splash grows forever.
//
// WebKit has a known cure, shipped widely as the "safari-14-idb-fix"
// pattern: calling `indexedDB.databases()` repeatedly un-wedges the
// engine — the first call may hang exactly like open(), but the
// polling itself prods the storage process awake, and once any call
// answers, opens proceed normally. On a healthy device the first call
// resolves in a millisecond or two, so the nudge costs nothing.
//
// This never rejects and never blocks boot past its deadline: if the
// engine stays silent the whole time, boot proceeds (and hangs) and
// the splash's own watchdog surfaces the honest recovery guidance —
// fully closing the app, the one action that always restarts WebKit's
// storage process.

/** How often to prod the engine with a fresh databases() call. */
const NUDGE_INTERVAL_MS = 250;
/** Give up prodding after this long and let boot proceed. */
const NUDGE_DEADLINE_MS = 8_000;

export interface IdbNudgeOptions {
  /** Injectable databases() for tests. */
  databases?: () => Promise<unknown>;
  intervalMs?: number;
  deadlineMs?: number;
}

/**
 * Resolve once the IndexedDB engine answers a `databases()` call, or
 * after the deadline. Safe everywhere: environments without
 * `indexedDB.databases` (older browsers, some test harnesses) resolve
 * immediately, and a rejecting call counts as an ANSWERING engine —
 * as with the storage watchdog, only silence is death.
 */
export async function nudgeIndexedDB(
  options: IdbNudgeOptions = {},
): Promise<void> {
  const databases =
    options.databases ??
    (typeof indexedDB !== "undefined" &&
    typeof indexedDB.databases === "function"
      ? () => indexedDB.databases()
      : null);
  if (!databases) return;
  const intervalMs = options.intervalMs ?? NUDGE_INTERVAL_MS;
  const deadlineMs = options.deadlineMs ?? NUDGE_DEADLINE_MS;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      clearInterval(prodder);
      clearTimeout(deadline);
      resolve();
    };
    const prod = (): void => {
      // Every call is a fresh prod; any of them answering (however
      // late, resolve or reject) means the engine is awake.
      void databases().then(finish, finish);
    };
    const prodder = setInterval(prod, intervalMs);
    const deadline = setTimeout(finish, deadlineMs);
    prod();
  });
}
