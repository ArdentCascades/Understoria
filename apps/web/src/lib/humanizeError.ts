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

/** Bare server error codes with a known humane translation. The
 *  node's invite trust gate answers 403 `{error:"inviter_not_trusted"}`
 *  when a pending-trust member's invite is redeemed or announced;
 *  the code rides thrown errors and outbox `lastError` strings as-is
 *  and would otherwise hit the generic fallback. (The localized twin
 *  lives at `invite.errors.inviter_not_trusted` for surfaces that
 *  translate — see NodeSection's telemetry.) */
const CODE_MESSAGES: Record<string, string> = {
  inviter_not_trusted:
    "This invite can't be used yet — the person who sent it isn't fully vouched for in the community.",
  // The vouch trust gate's twin: the node refuses POST /vouches from
  // a member the community hasn't fully vouched for. Reachable when
  // this device's trust picture is stale (MemberDetail gates the
  // button, but the node has the final word).
  voucher_not_trusted:
    "The community server isn't counting your vouch yet — vouching starts counting once two trusted members have vouched for you.",
  // The closure trust gate (server proposals.governance.ts): only a
  // trusted member may record a proposal's outcome. Thrown by the
  // db-layer guard at the point of action and recorded verbatim as
  // outbox lastError on the node's 403 — both are WAITING states
  // (the 403 is retryable; a queued closure delivers itself once the
  // closer is vouched), so the copy says waiting, never rejected.
  closer_not_trusted:
    "Recording a community outcome opens up once the community fully vouches for you. Nothing is lost — the decision waits for a fully vouched member to record it, and your block always counts.",
  // The newcomer anti-spam cap (server newcomerCaps.ts): the node
  // accepts a day's worth of new content from a not-yet-vouched
  // author; the outbox retries 429s, so the surplus delivers itself
  // after the window.
  newcomer_daily_limit:
    "Today's share of new posts from a new member is full — the rest will send automatically tomorrow. The limit lifts once the community fully vouches for you.",
};

/**
 * Returns a string safe to show in error UI. Pass any thrown value
 * (TypeScript or runtime); the function never throws.
 */
export function humanizeError(err: unknown): string {
  if (err == null) return FALLBACK;
  if (typeof err === "string") {
    return (
      CODE_MESSAGES[err] ?? (looksUserFacing(err) ? err : FALLBACK)
    );
  }
  if (typeof err !== "object") return FALLBACK;
  const e = err as { message?: unknown; code?: unknown };
  // Typed errors with a recognised `code` get special treatment as
  // we discover them. Today the safeguards error is the only one
  // that surfaces with a SCREAMING_CASE code in its message, and its
  // own .message is already humane — so prefer that over a generic
  // code lookup.
  if (typeof e.code === "string" && CODE_MESSAGES[e.code]) {
    return CODE_MESSAGES[e.code];
  }
  const message = typeof e.message === "string" ? e.message : "";
  if (CODE_MESSAGES[message]) return CODE_MESSAGES[message];
  if (looksUserFacing(message)) return message;
  return FALLBACK;
}
