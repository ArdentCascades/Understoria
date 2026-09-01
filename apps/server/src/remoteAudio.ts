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

/**
 * Pull-through fetch of peer communities' recordings (V8 #478,
 * docs/voice-board.md §5's promised follow-up).
 *
 * A federated voice post arrives carrying only its SIGNED audio
 * reference — the bytes stay on the origin community's node until a
 * member here actually opens the post. Then THIS node fetches the
 * blob from its configured peers (the same PEER_NODE_URLS +
 * PEER_READ_TOKENS the feed pull uses), verifies the content
 * address, caches the bytes (LRU-capped), and serves them. Refs over
 * the wire, payloads on demand — never a broadcast.
 *
 * Safety properties, each one load-bearing:
 *
 *   - CONTENT-ADDRESS VERIFICATION: the blobId IS the hash of the
 *     bytes; it is recomputed over what the peer actually sent, so a
 *     lying peer cannot swap a recording under a signed reference —
 *     the same check the upload route and the PWA both make.
 *   - LOOP GUARD: outbound pull requests carry NO_PULL_HEADER; a
 *     node seeing it answers from local storage only. Without this,
 *     two nodes missing the same blob would ping-pong forever.
 *   - SINGLE-FLIGHT: concurrent GETs for one blob coalesce into one
 *     peer fetch — ten members opening the same fresh post cost one
 *     download, not ten.
 *   - TIMEOUT: each peer attempt is bounded (AbortSignal), so an
 *     unreachable peer can't hold a member's player spinner hostage;
 *     the next peer is tried, then the request falls back to 404 and
 *     the player's existing retry UI.
 *   - SIZE CEILING: a response over AUDIO_BLOB_MAX_BYTES is refused
 *     before hashing — a hostile peer can't disk-fill or CPU-burn
 *     through this path.
 *
 * Fetch-interest metadata (threat-model §7): the request carries the
 * NODE's peer bearer token, never the member's key — the peer's
 * operator learns "someone in that community played this recording
 * now", not who. The member↔clip mapping stays on the member's own
 * node, which sees it like any other read.
 */

import {
  AUDIO_BLOB_MAX_BYTES,
  audioBlobId,
  isAllowedAudioMime,
} from "@understoria/shared/crypto";
import type { RemoteAudioCacheStore } from "./db.js";

/** Requests carrying this header never trigger an outbound pull —
 *  the federated-read loop guard. */
export const NO_PULL_HEADER = "x-understoria-no-pull";

/** Minimal fetch shape the puller needs — injectable for tests. */
export type BlobFetcher = (
  url: string,
  init: { headers: Record<string, string>; signal: AbortSignal },
) => Promise<{
  ok: boolean;
  headers: { get(name: string): string | null };
  arrayBuffer(): Promise<ArrayBuffer>;
}>;

export interface RemoteAudioPuller {
  /** Verified bytes for a peer blob, from cache or a live peer fetch;
   *  null when no peer holds it (or holds only lies). */
  fetch(blobId: string): Promise<{ mime: string; bytes: Buffer } | null>;
}

const BLOB_ID_RE = /^[0-9a-f]{64}$/;

export function createRemoteAudioPuller(options: {
  peerUrls: readonly string[];
  peerTokens: Readonly<Record<string, string>>;
  cache: RemoteAudioCacheStore;
  maxCacheBytes: number;
  timeoutMs: number;
  fetcher?: BlobFetcher;
  log?: { warn(obj: unknown, msg: string): void };
  now?: () => number;
}): RemoteAudioPuller {
  const {
    peerUrls,
    peerTokens,
    cache,
    maxCacheBytes,
    timeoutMs,
    fetcher = (url, init) => fetch(url, init),
    log,
    now = () => Date.now(),
  } = options;

  // Single-flight: one in-flight peer fetch per blobId, shared by
  // every concurrent request for it.
  const inFlight = new Map<
    string,
    Promise<{ mime: string; bytes: Buffer } | null>
  >();

  async function fetchFromPeers(
    blobId: string,
  ): Promise<{ mime: string; bytes: Buffer } | null> {
    for (const peer of peerUrls) {
      const base = peer.replace(/\/+$/, "");
      const headers: Record<string, string> = { [NO_PULL_HEADER]: "1" };
      const token = Object.entries(peerTokens).find(([url]) =>
        base.startsWith(url.replace(/\/+$/, "")),
      )?.[1];
      if (token) headers.authorization = `Bearer ${token}`;
      try {
        const res = await fetcher(
          `${base}/audio-blobs/${encodeURIComponent(blobId)}`,
          { headers, signal: AbortSignal.timeout(timeoutMs) },
        );
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        // Ceiling first (cheap), hash second — a hostile peer gets
        // neither free disk nor free CPU through this path.
        if (buf.length === 0 || buf.length > AUDIO_BLOB_MAX_BYTES) {
          log?.warn({ peer: base }, "peer audio blob over size ceiling");
          continue;
        }
        if (audioBlobId(new Uint8Array(buf)) !== blobId) {
          log?.warn({ peer: base }, "peer audio blob content-address mismatch");
          continue;
        }
        const mimeRaw = res.headers.get("content-type") ?? "";
        const mime = mimeRaw.split(";")[0].trim();
        if (!isAllowedAudioMime(mime)) {
          log?.warn({ peer: base }, "peer audio blob disallowed mime");
          continue;
        }
        // Cache-miss on a too-big-for-cap blob still serves — the
        // member's playback never depends on cache admission.
        cache.insertWithTrim(
          { blobId, mime, bytes: buf, now: now() },
          maxCacheBytes,
        );
        return { mime, bytes: buf };
      } catch {
        // Timeout or network failure — the next peer gets its turn.
        continue;
      }
    }
    return null;
  }

  return {
    async fetch(blobId) {
      // Refuse to turn arbitrary path segments into outbound
      // requests: only well-formed content addresses leave this node.
      if (!BLOB_ID_RE.test(blobId)) return null;
      if (maxCacheBytes === 0 || peerUrls.length === 0) return null;
      const existing = inFlight.get(blobId);
      if (existing !== undefined) return existing;
      const attempt = fetchFromPeers(blobId).finally(() => {
        inFlight.delete(blobId);
      });
      inFlight.set(blobId, attempt);
      return attempt;
    },
  };
}
