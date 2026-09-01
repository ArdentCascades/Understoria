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
 * Speech-model hosting client (docs/transcription-plan.md D4).
 *
 * Models come from the community's own serving origin — the same
 * static tier that hosts the AGPL source bundle — never a
 * third-party CDN. `/models/manifest.json` declares what the
 * operator hosts, per language: {file, bytes, sha256, label}. The
 * download is verified against the manifest's SHA-256 before it is
 * stored; a mismatch is refused, not warned about.
 *
 * Verified bytes live in Cache Storage (`understoria-models`),
 * which the OS may evict under storage pressure — deliberate: the
 * member's storage stays theirs, the Settings card shows whether
 * the model is on the device, and re-downloading is their call.
 */

const CACHE_NAME = "understoria-models";
const MANIFEST_PATH = "/models/manifest.json";

export interface ModelEntry {
  /** Archive filename under /models/, e.g. vosk-model-small-es-0.42.tar.gz */
  file: string;
  /** Size in bytes, stated to the member BEFORE the download. */
  bytes: number;
  /** Hex SHA-256 of the archive; the download is refused on mismatch. */
  sha256: string;
  /** Upstream model name, for the operator runbook's audit trail. */
  label: string;
}

export type ManifestResult =
  /** The node doesn't host models — an honest state, not an error. */
  | { kind: "absent" }
  | { kind: "unreachable" }
  | { kind: "ok"; models: Record<string, ModelEntry> };

function primarySubtag(tag: string | undefined): string {
  return (tag ?? "en").toLowerCase().split("-")[0];
}

/** Fetch the operator's model manifest from the serving origin.
 *  `cache: "no-store"` — the manifest is tiny and must reflect what
 *  the operator hosts NOW, same posture as the source manifest. */
export async function fetchModelManifest(): Promise<ManifestResult> {
  try {
    const res = await fetch(MANIFEST_PATH, { cache: "no-store" });
    // A static tier without /models/ answers 404 — or an SPA
    // fallback 200 with HTML. Content-type separates them, the same
    // trick the source card uses.
    if (!res.ok) return { kind: "absent" };
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("json")) return { kind: "absent" };
    const body = (await res.json()) as { models?: Record<string, unknown> };
    const models: Record<string, ModelEntry> = {};
    for (const [lang, raw] of Object.entries(body.models ?? {})) {
      if (typeof raw !== "object" || raw === null) continue;
      const m = raw as Record<string, unknown>;
      if (
        typeof m.file === "string" &&
        typeof m.bytes === "number" &&
        typeof m.sha256 === "string" &&
        typeof m.label === "string"
      ) {
        models[primarySubtag(lang)] = {
          file: m.file,
          bytes: m.bytes,
          sha256: m.sha256,
          label: m.label,
        };
      }
    }
    return { kind: "ok", models };
  } catch {
    return { kind: "unreachable" };
  }
}

/** The manifest entry for an app language, or null when the operator
 *  hosts no model for it (Tibetan's everyday reality — surfaced as
 *  the honest per-language note, same pattern as read-aloud). */
export function modelForLanguage(
  manifest: ManifestResult,
  appLanguage: string | undefined,
): ModelEntry | null {
  if (manifest.kind !== "ok") return null;
  return manifest.models[primarySubtag(appLanguage)] ?? null;
}

function cacheKeyFor(entry: ModelEntry): string {
  // Keyed by content hash, not filename: a manifest update to a new
  // model version misses the old cache entry and re-downloads.
  return `/models/${entry.sha256}`;
}

async function openCache(): Promise<Cache | null> {
  try {
    if (typeof caches === "undefined") return null;
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Is this exact model (by content hash) already on the device? */
export async function isModelDownloaded(entry: ModelEntry): Promise<boolean> {
  const cache = await openCache();
  if (cache === null) return false;
  return (await cache.match(cacheKeyFor(entry))) !== undefined;
}

export type DownloadResult =
  | { kind: "ok" }
  | { kind: "verify_failed" }
  | { kind: "failed" };

/**
 * Download the archive from the serving origin, verify its SHA-256
 * against the manifest, and store the verified bytes. A hash
 * mismatch stores nothing and is refused loudly — a wrong model
 * file is an operator mistake (or worse) the member must see.
 */
export async function downloadModel(
  entry: ModelEntry,
): Promise<DownloadResult> {
  try {
    const res = await fetch(`/models/${encodeURIComponent(entry.file)}`);
    if (!res.ok) return { kind: "failed" };
    const bytes = await res.arrayBuffer();
    if ((await sha256Hex(bytes)) !== entry.sha256.toLowerCase()) {
      return { kind: "verify_failed" };
    }
    const cache = await openCache();
    if (cache === null) return { kind: "failed" };
    await cache.put(
      cacheKeyFor(entry),
      new Response(bytes, {
        headers: { "content-type": "application/octet-stream" },
      }),
    );
    return { kind: "ok" };
  } catch {
    return { kind: "failed" };
  }
}

/** The verified model bytes, or null when not downloaded (or
 *  evicted — the caller re-offers the download, never assumes). */
export async function readModelBytes(
  entry: ModelEntry,
): Promise<ArrayBuffer | null> {
  const cache = await openCache();
  if (cache === null) return null;
  const hit = await cache.match(cacheKeyFor(entry));
  if (hit === undefined) return null;
  return hit.arrayBuffer();
}

/** Remove every stored model — the Settings "remove model" action.
 *  Whole-cache delete keeps this drift-proof: stale versions from
 *  older manifests go with it. */
export async function deleteAllModels(): Promise<void> {
  try {
    if (typeof caches === "undefined") return;
    await caches.delete(CACHE_NAME);
  } catch {
    // Nothing to delete.
  }
}
