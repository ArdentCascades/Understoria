/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// The build stamp: a short identifier for the exact code a device is
// running, shown quietly in Settings. It exists for one operational
// job (docs/operator-guide.md §6, the auto-confirm enforcement flip):
// "read me your build stamp" has to work over any channel — SMS, a
// phone call, a note passed at a check-in — so the operator can
// confirm every pilot device activated the artifact-emitting build
// before flipping AUTO_CONFIRM_REQUIRE_TRANSITION.
//
// The value is injected at build time by vite.config.ts, which
// resolves it in this order: the VITE_BUILD_STAMP env var (the
// Docker build passes the short commit hash this way — the build
// context has no .git), then a live `git rev-parse --short HEAD`
// (local/dev builds), then empty. `resolveBuildStamp` turns an empty
// or absent value into "dev" so an un-stamped local build reads
// honestly rather than blank.

/** Normalize the raw injected stamp; empty/absent → "dev". */
export function resolveBuildStamp(raw: string | undefined | null): string {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed === "" ? "dev" : trimmed;
}

// `define`d by vite (see vite.config.ts). `typeof` guards against a
// ReferenceError if the define is ever absent (some tooling paths),
// falling through to "dev".
declare const __UNDERSTORIA_BUILD_STAMP__: string | undefined;

export const BUILD_STAMP: string = resolveBuildStamp(
  typeof __UNDERSTORIA_BUILD_STAMP__ === "string"
    ? __UNDERSTORIA_BUILD_STAMP__
    : undefined,
);
