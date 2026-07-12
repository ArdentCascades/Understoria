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
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";

/**
 * Multi-node endpoints — docs/community-resilience.md §B.2.
 *
 * A community can run MIRROR nodes: same-community replicas that
 * replicate every durable kind server-side (§B.1). This module is the
 * client half: the ordered endpoint list (the member's explicit
 * primary first, then the mirrors the member has ACCEPTED via the
 * consent card), the active-node resolution pulls use to fail over,
 * and the per-node reachability telemetry the resilience card renders.
 *
 * Consent discipline: a mirror announced in the primary's
 * `GET /config.mirrors` is a SUGGESTION. Nothing is adopted until the
 * member accepts it on the consent card (`MirrorSuggestCard`) — the
 * same informed-consent posture as the origin-derived node suggestion.
 * Declining persists so the suggestion never nags; the member's
 * explicit primary is never dropped or reordered by an announcement.
 *
 * Cursor scoping note (load-bearing, see `cursorKeySuffix`): federation
 * pull cursors must be PER NODE. Mirrors lag each other, so carrying
 * the primary's high-water mark to a mirror would silently skip every
 * record the mirror holds that the primary hadn't served yet — and
 * vice versa. The primary keeps the legacy (unsuffixed) cursor keys so
 * existing devices fail over without re-syncing or migrating anything;
 * each mirror gets its own `::<hash>` suffix and starts from zero
 * (every pull is idempotent by id / natural key, so the first mirror
 * pull just dedups).
 */

/** Accepted mirror URLs, JSON string[] (order = acceptance order). */
const MIRRORS_KEY = "communityNodeMirrors";
/** Declined announced-mirror URLs, JSON string[] — "asked and
 *  answered"; the consent card never re-asks for these. */
const MIRRORS_DISMISSED_KEY = "communityNodeMirrorsDismissed";

/** Last-seen `/config` system key, JSON `{nodeId, current, history,
 *  capturedAt}` — re-seed Phase R0's disaster bookkeeping (see
 *  `pendingMirrorSuggestions`). Exported for the future re-seed UI. */
export const LAST_SEEN_SYSTEM_KEY = "communityNodeLastSeenSystemKey";
/** The community's removal quorum as last published by GET /config
 *  (docs/member-removal.md §2) — member devices verify pulled
 *  removal/reinstatement records against this instead of
 *  hard-coding a number. */
export const LAST_SEEN_REMOVAL_QUORUM = "communityRemovalQuorum";

/** One day — the future-bound skew grace on a captured key-rotation
 *  trail, matching the server's peerPull/mirror resolvers. */
const SYSTEM_KEY_SKEW_MS = 24 * 60 * 60 * 1000;

/**
 * Resolve the node system pubkey needed to verify a system-signed
 * record (e.g. a `CapacityPosture`, docs/capacity-forecast.md §6) for
 * `nodeId` as of `signedAt`, from the `/config.systemKey` this device
 * last captured (`LAST_SEEN_SYSTEM_KEY`). Rotation-aware, mirroring the
 * server resolver (`peerPull.ts`): the key CURRENT at `signedAt` is the
 * first history entry retired strictly after it, else `current`.
 *
 * Returns null — so the caller REFUSES the record, never labelling an
 * unverifiable row authentic — when the captured key is absent,
 * unparseable, or for a DIFFERENT node. A device only ever holds the
 * key of the node it talks to, so a posture stamped with another node's
 * id cannot be verified here yet (full multi-node key discovery is
 * tracked separately); refusing is the safe default.
 */
export async function resolveCommunitySystemPubkey(
  nodeId: string,
  signedAt: number,
): Promise<string | null> {
  let raw: unknown;
  try {
    raw = await getSetting(LAST_SEEN_SYSTEM_KEY);
  } catch {
    return null;
  }
  if (typeof raw !== "string" || raw === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    typeof (parsed as { nodeId?: unknown }).nodeId !== "string" ||
    typeof (parsed as { current?: unknown }).current !== "string"
  ) {
    return null;
  }
  const captured = parsed as {
    nodeId: string;
    current: string;
    history?: unknown;
  };
  if (captured.nodeId !== nodeId) return null;

  const bound = Date.now() + SYSTEM_KEY_SKEW_MS;
  const history = (Array.isArray(captured.history) ? captured.history : [])
    .filter(
      (h): h is { pubkey: string; retiredAt: number } =>
        h !== null &&
        typeof h === "object" &&
        typeof (h as { pubkey?: unknown }).pubkey === "string" &&
        typeof (h as { retiredAt?: unknown }).retiredAt === "number" &&
        Number.isInteger((h as { retiredAt: number }).retiredAt) &&
        (h as { retiredAt: number }).retiredAt > 0 &&
        (h as { retiredAt: number }).retiredAt <= bound,
    )
    .sort((a, b) => a.retiredAt - b.retiredAt);
  for (const h of history) {
    if (h.retiredAt > signedAt) return h.pubkey;
  }
  return captured.current;
}

/** How long one active-node resolution is trusted before re-probing.
 *  Short enough that a mid-session outage fails over within a couple
 *  of sync ticks; long enough that one sync cycle's 16 pulls share a
 *  single probe. */
const ACTIVE_NODE_TTL_MS = 30_000;

/** Per-node health probe timeout. `/health` is an open route (exempt
 *  from READ_AUTH), so this needs no identity. */
const PROBE_TIMEOUT_MS = 4_000;

export function normalizeNodeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** Stable, short, non-cryptographic url discriminator for settings
 *  keys (FNV-1a, hex). Collisions across a member's handful of node
 *  URLs are astronomically unlikely; nothing security-relevant keys
 *  off this. */
export function urlHash(url: string): string {
  let h = 2166136261 >>> 0;
  const s = normalizeNodeUrl(url);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

/** Settings key suffix scoping a federation cursor (or telemetry key)
 *  to one node. The PRIMARY stays unsuffixed — that is exactly the
 *  legacy key, so existing devices carry their cursors forward. */
export function cursorKeySuffix(url: string, primaryUrl: string): string {
  return normalizeNodeUrl(url) === normalizeNodeUrl(primaryUrl)
    ? ""
    : `::${urlHash(url)}`;
}

function parseUrlList(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u): u is string => typeof u === "string")
      .map(normalizeNodeUrl)
      .filter((u) => /^https?:\/\//.test(u));
  } catch {
    return [];
  }
}

export async function readAcceptedMirrors(): Promise<string[]> {
  return parseUrlList(await getSetting(MIRRORS_KEY));
}

export async function readDismissedMirrors(): Promise<string[]> {
  return parseUrlList(await getSetting(MIRRORS_DISMISSED_KEY));
}

/** Adopt an announced mirror (the consent card's confirm). */
export async function acceptMirror(url: string): Promise<void> {
  const normalized = normalizeNodeUrl(url);
  await db.transaction("rw", db.settings, async () => {
    const current = parseUrlList(await getSetting(MIRRORS_KEY));
    if (!current.includes(normalized)) {
      await setSetting(MIRRORS_KEY, JSON.stringify([...current, normalized]));
    }
  });
  invalidateActiveNode();
}

/** Decline an announced mirror (the consent card's dismiss) —
 *  persisted so the suggestion never re-nags. */
export async function dismissMirror(url: string): Promise<void> {
  const normalized = normalizeNodeUrl(url);
  await db.transaction("rw", db.settings, async () => {
    const current = parseUrlList(await getSetting(MIRRORS_DISMISSED_KEY));
    if (!current.includes(normalized)) {
      await setSetting(
        MIRRORS_DISMISSED_KEY,
        JSON.stringify([...current, normalized]),
      );
    }
  });
}

/** Remove a previously accepted mirror (Settings escape hatch). */
export async function removeMirror(url: string): Promise<void> {
  const normalized = normalizeNodeUrl(url);
  await db.transaction("rw", db.settings, async () => {
    const current = parseUrlList(await getSetting(MIRRORS_KEY));
    await setSetting(
      MIRRORS_KEY,
      JSON.stringify(current.filter((u) => u !== normalized)),
    );
  });
  invalidateActiveNode();
}

export interface NodeEndpoints {
  /** The member's explicit primary (Settings / consent card), or null
   *  when node sync is off or unconfigured. */
  primary: string | null;
  /** Ordered: primary first, then accepted mirrors. Empty when sync
   *  is off. */
  endpoints: string[];
}

export async function listNodeEndpoints(): Promise<NodeEndpoints> {
  const enabled = await getSetting(SETTING_KEYS.communityNodeEnabled);
  const rawUrl = await getSetting(SETTING_KEYS.communityNodeUrl);
  if (enabled !== "1" || !rawUrl?.trim()) {
    return { primary: null, endpoints: [] };
  }
  const primary = normalizeNodeUrl(rawUrl);
  const mirrors = (await readAcceptedMirrors()).filter((u) => u !== primary);
  return { primary, endpoints: [primary, ...mirrors] };
}

// --- per-node reachability telemetry ---------------------------------

/** Settings key holding the last successful signed read/write against
 *  one node (ISO string) — the resilience card's freshness source. The
 *  legacy unsuffixed `communityNodeLastSuccess` doubles as the
 *  primary's key, exactly like cursor keys. */
export function nodeSuccessKey(url: string, primaryUrl: string): string {
  return `${SETTING_KEYS.communityNodeLastSuccess}${cursorKeySuffix(url, primaryUrl)}`;
}

const lastRecorded = new Map<string, number>();

/** Record a successful exchange with a node. Debounced in memory so a
 *  16-pull sync cycle writes once, not sixteen times. Also refreshes
 *  the legacy global key — older UI (NodeSection chips) keeps meaning
 *  "the community was reachable". Never throws. */
export async function recordNodeSuccess(url: string): Promise<void> {
  try {
    const normalized = normalizeNodeUrl(url);
    const nowMs = Date.now();
    if ((lastRecorded.get(normalized) ?? 0) > nowMs - 60_000) return;
    lastRecorded.set(normalized, nowMs);
    const { primary } = await listNodeEndpoints();
    const iso = new Date().toISOString();
    await setSetting(nodeSuccessKey(normalized, primary ?? normalized), iso);
    await setSetting(SETTING_KEYS.communityNodeLastSuccess, iso);
  } catch {
    // Telemetry is best-effort.
  }
}

// --- active-node resolution ------------------------------------------

export interface ActiveNode {
  url: string;
  isPrimary: boolean;
}

interface ActiveNodeCache {
  value: ActiveNode;
  at: number;
  /** The endpoint list the resolution was computed from — a changed
   *  list (mirror accepted/removed, primary edited) invalidates. */
  fingerprint: string;
}

let activeNodeCache: ActiveNodeCache | null = null;

export function invalidateActiveNode(): void {
  activeNodeCache = null;
}

async function probe(
  url: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  try {
    const res = await fetchImpl(`${url}/health`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      credentials: "omit",
      mode: "cors",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * The node this sync cycle should talk to: the first endpoint whose
 * `/health` answers, preferring the member's primary. Cached briefly
 * so one cycle's pulls share a single probe. When EVERY endpoint is
 * down we return the primary anyway — each pull's own error handling
 * already copes with an unreachable node (that was the pre-failover
 * behavior), and returning null would wrongly disable pushes that
 * might race a recovery. Null only when node sync is off entirely.
 */
export async function getActiveNodeUrl(
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<ActiveNode | null> {
  const { primary, endpoints } = await listNodeEndpoints();
  if (!primary || endpoints.length === 0) return null;

  const fingerprint = endpoints.join("|");
  const nowMs = Date.now();
  if (
    activeNodeCache &&
    activeNodeCache.fingerprint === fingerprint &&
    activeNodeCache.at > nowMs - ACTIVE_NODE_TTL_MS
  ) {
    return activeNodeCache.value;
  }

  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  let value: ActiveNode = { url: primary, isPrimary: true };
  if (fetchImpl) {
    // Single-endpoint members skip the probe entirely — there is
    // nothing to fail over to, and the pulls' own error paths already
    // handle a down node. This keeps Phase A behavior byte-identical.
    if (endpoints.length > 1) {
      let found = false;
      for (const url of endpoints) {
        if (await probe(url, fetchImpl)) {
          value = { url, isPrimary: url === primary };
          found = true;
          break;
        }
      }
      if (!found) value = { url: primary, isPrimary: true };
    }
  }
  activeNodeCache = { value, at: nowMs, fingerprint };
  return value;
}

// --- announced-mirror discovery (the consent card's feed) -------------

/**
 * Mirrors the primary currently announces in `GET /config.mirrors`
 * that the member has neither accepted nor declined (and that aren't
 * the primary itself). These are what the consent card offers. Errors
 * resolve to [] — an unreachable node or a node without the field is
 * a normal state.
 */
export async function pendingMirrorSuggestions(
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<string[]> {
  const { primary } = await listNodeEndpoints();
  if (!primary) return [];
  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) return [];
  let announced: string[] = [];
  try {
    const res = await fetchImpl(`${primary}/config`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      credentials: "omit",
      mode: "cors",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      mirrors?: unknown;
      systemKey?: { current?: unknown; history?: unknown };
      nodeId?: unknown;
      removalQuorum?: unknown;
    } | null;
    if (!body || typeof body !== "object") return [];
    // Member removal (docs/member-removal.md §2): capture the node's
    // published quorum so pulled removal records verify against the
    // community's real rule.
    if (
      typeof body.removalQuorum === "number" &&
      Number.isInteger(body.removalQuorum) &&
      body.removalQuorum > 0
    ) {
      try {
        await setSetting(LAST_SEEN_REMOVAL_QUORUM, String(body.removalQuorum));
      } catch {
        // Capture is best-effort bookkeeping.
      }
    }
    // Re-seed Phase R0 (docs/community-reseed.md §1c): capture the
    // node's published auto-confirm key while the node is alive. If
    // the node is ever lost, this is the value the operator of a
    // replacement copies into TRUSTED_SYSTEM_KEYS so the community's
    // auto-confirmed exchanges re-verify — it is recoverable from any
    // member's device precisely because it was captured here.
    if (
      typeof body.nodeId === "string" &&
      body.systemKey &&
      typeof body.systemKey === "object" &&
      typeof body.systemKey.current === "string"
    ) {
      try {
        await setSetting(
          LAST_SEEN_SYSTEM_KEY,
          JSON.stringify({
            nodeId: body.nodeId,
            current: body.systemKey.current,
            history: Array.isArray(body.systemKey.history)
              ? body.systemKey.history
              : [],
            capturedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Capture is best-effort bookkeeping.
      }
    }
    if (!Array.isArray(body.mirrors)) return [];
    announced = body.mirrors
      .filter((u): u is string => typeof u === "string")
      .map(normalizeNodeUrl)
      .filter((u) => /^https?:\/\//.test(u));
  } catch {
    return [];
  }
  if (announced.length === 0) return [];
  const [accepted, dismissed] = await Promise.all([
    readAcceptedMirrors(),
    readDismissedMirrors(),
  ]);
  const known = new Set([...accepted, ...dismissed, primary]);
  return [...new Set(announced)].filter((u) => !known.has(u));
}
