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
import { getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { readSubmitConfig } from "@/lib/nodeSubmit";

// Origin-derived community-node suggestion —
// `docs/invite-redemption.md` §5.3.
//
// The canonical deployment (deploy/Caddyfile) serves the PWA and the
// Fastify node from ONE origin: the dist at https://DOMAIN/, the API
// under https://DOMAIN/api. A member who loaded the PWA from a
// community node is therefore already holding the node URL in
// `location.origin`; the manual Settings transcription step is why a
// fresh invitee's device can't sync (incident finding #4).
//
// Behavior: derive `${location.origin}/api`, probe GET /api/health
// (same-origin fetch, no third-party request), and if it answers like
// an Understoria node, PREFILL the community-node settings behind an
// explicit informed-consent confirmation naming the origin and what
// will be sent (the mirrorConsent.ts posture).
//
// NEVER silent (operator ruling, §15.2): the threat-model entry
// "Configurable node URL can leak counterparty public keys" made
// explicit consent load-bearing; auto-ENABLE would hollow it out.
// Auto-SUGGEST keeps the consent gate while removing the
// transcription step.
//
// Failure is silent — an unconfigured node is a normal state, not a
// problem to nag about.

/** How long the health probe may hang before we conclude "no node
 *  here". Same-origin, so this is generous. */
const PROBE_TIMEOUT_MS = 4000;

/**
 * Origins where the derivation is known-wrong before probing (§5.3
 * table): local development serves the PWA without any community
 * node behind the same origin, and a suggestion there would train
 * developers to click through consent cards. Anything that isn't
 * plain http(s) (file:, extension pages) can't host a node either.
 */
export function isExcludedOrigin(origin: string): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return true;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return true;
  const host = url.hostname;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "0.0.0.0") return true;
  // IPv6 loopback — URL.hostname keeps the brackets.
  if (host === "[::1]" || host === "::1") return true;
  // The whole 127.0.0.0/8 loopback block, not just 127.0.0.1.
  if (/^127(\.\d{1,3}){3}$/.test(host)) return true;
  return false;
}

/** The candidate node URL for a PWA served by a community node:
 *  the API lives under `/api` on the same origin (deploy/Caddyfile). */
export function deriveCandidateNodeUrl(origin: string): string {
  return `${origin.replace(/\/+$/, "")}/api`;
}

/**
 * Does `candidateUrl` answer like an Understoria node? GET /health
 * returns exactly `{"status":"ok"}` (apps/server/src/routes/health.ts
 * keeps it minimal on purpose). Any network error, non-2xx, non-JSON
 * body, or wrong shape means "no" — silently.
 */
export async function probeNodeHealth(
  candidateUrl: string,
  fetchImpl: typeof fetch | undefined = globalThis.fetch,
): Promise<boolean> {
  if (!fetchImpl) return false;
  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
    : null;
  try {
    const res = await fetchImpl(`${candidateUrl}/health`, {
      method: "GET",
      credentials: "omit",
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: unknown };
    return body?.status === "ok";
  } catch {
    return false;
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

export interface SuggestDeps {
  /** Overridable for tests; defaults to the live location.origin. */
  origin?: string;
  fetchImpl?: typeof fetch;
  /** Vite dev server exclusion (§5.3 table row 4). Injectable so
   *  tests exercise both sides without stubbing the build env. */
  isDev?: boolean;
}

/**
 * The full §5.3 gate, in order: dev build → no; excluded origin → no;
 * device already configured (a URL is set, whether or not mirroring
 * is currently enabled — the member has made their choice) → no;
 * health probe fails → no. Otherwise the candidate URL, which the
 * caller must put behind an EXPLICIT consent confirmation before
 * persisting anything.
 */
export async function suggestNodeUrlFromOrigin(
  deps: SuggestDeps = {},
): Promise<string | null> {
  const isDev = deps.isDev ?? import.meta.env.DEV;
  if (isDev) return null;
  const origin =
    deps.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  if (!origin || isExcludedOrigin(origin)) return null;
  const cfg = await readSubmitConfig();
  if (cfg.url.trim() !== "") return null;
  const candidate = deriveCandidateNodeUrl(origin);
  const healthy = await probeNodeHealth(candidate, deps.fetchImpl);
  return healthy ? candidate : null;
}

const DISMISSED_VALUE = "1";

/** Declining the suggestion — anywhere it appears — is permanent for
 *  this device (no-notifications: re-asking is nagging). The member
 *  can still configure a node manually in Settings at any time. */
export async function isNodeSuggestDismissed(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.nodeOriginSuggestDismissed);
  return value === DISMISSED_VALUE;
}

export async function dismissNodeSuggest(): Promise<void> {
  await setSetting(
    SETTING_KEYS.nodeOriginSuggestDismissed,
    DISMISSED_VALUE,
  );
}
