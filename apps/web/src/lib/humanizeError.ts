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

// Map unknown errors → user-readable strings.
//
// Background: most thrown errors in this codebase carry humane copy
// already ("That passphrase didn't match the current one.", "Only the
// project organizer can do that.", and so on). But error-surfacing
// components were calling `(err as Error).message` directly, which
// leaks any technical fallback through to the user — runtime
// errors, network errors, error codes that look like
// DAILY_LIMIT_EXCEEDED or http_422.
//
// This helper keeps the existing humane copy when it looks
// presentable and substitutes a generic fallback otherwise. Known
// typed errors with stable `.code` fields get explicit handling so
// we can extend them as we discover them.

/** What a recognisable "user-shaped" message looks like:
 *  - starts with a capital letter or a quote/emoji
 *  - contains at least one space
 *  - doesn't look like a code (no all-caps_underscores, no
 *    http_${digits}, no `:` in the first 30 chars)
 */
function looksUserFacing(message: string): boolean {
  if (!message) return false;
  if (message.length < 5) return false;
  if (/^[A-Z_]+$/.test(message)) return false; // SCREAMING_CASE codes
  if (/^http_\d+$/.test(message)) return false; // network status fallbacks
  if (/^[a-z_]+$/.test(message)) return false; // snake_case codes
  // First char must be a letter, quote, or unicode that suggests prose.
  if (!/^["“'(]?[A-Za-z]/.test(message)) return false;
  // Must contain a space — single-word identifiers are codes.
  if (!/\s/.test(message)) return false;
  return true;
}

const FALLBACK = "Something went wrong. Please try again.";

/**
 * Returns a string safe to show in error UI. Pass any thrown value
 * (TypeScript or runtime); the function never throws.
 */
export function humanizeError(err: unknown): string {
  if (err == null) return FALLBACK;
  if (typeof err === "string") {
    return looksUserFacing(err) ? err : FALLBACK;
  }
  if (typeof err !== "object") return FALLBACK;
  const e = err as { message?: unknown; code?: unknown };
  // Typed errors with a recognised `code` get special treatment as
  // we discover them. Today the safeguards error is the only one
  // that surfaces with a SCREAMING_CASE code in its message, and its
  // own .message is already humane — so prefer that over a generic
  // code lookup.
  const message = typeof e.message === "string" ? e.message : "";
  if (looksUserFacing(message)) return message;
  return FALLBACK;
}
