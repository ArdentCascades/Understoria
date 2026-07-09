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
import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, SETTING_KEYS, setSetting } from "@/db/database";

// The gathering screen's device-local curation (docs/gathering-screen.md
// §7.2). Stored in the `settings` table, which NEVER federates — this is
// one organizer's kiosk configuration, and because it only rearranges
// already-public content it carries no privacy weight. The privacy-
// sensitive pieces (a self-serve opt-out, the people slide) are Phase 2b,
// gated on member-profile federation, and are NOT here.

export interface GatheringConfig {
  /** Coarse category on/off toggles. */
  categories: {
    events: boolean;
    tasks: boolean;
    needs: boolean;
    offers: boolean;
  };
  /** Slide ids the organizer pinned — always in the rotation (if still
   *  live) and hoisted to the front, in this order. */
  pinnedIds: string[];
  /** Slide ids the organizer hid — never shown. This is also the interim
   *  "please don't feature my post" control: a member asks, the organizer
   *  hides it in one tap, no federation required. */
  hiddenIds: string[];
  /** Seconds each slide dwells before advancing. */
  dwellSeconds: number;
  /** Optional custom title for the welcome slide (e.g. "Repair Café —
   *  Saturday"). Empty falls back to the default community banner. */
  title: string;
}

export const DEFAULT_DWELL_SECONDS = 12;
export const DWELL_CHOICES = [8, 12, 20, 30] as const;

export const DEFAULT_GATHERING_CONFIG: GatheringConfig = {
  categories: { events: true, tasks: true, needs: true, offers: true },
  pinnedIds: [],
  hiddenIds: [],
  dwellSeconds: DEFAULT_DWELL_SECONDS,
  title: "",
};

// Parse a stored blob into a fully-populated config, tolerating older or
// partial shapes (any missing field falls back to its default). Kept pure
// and exported so the reducer logic is unit-testable.
export function parseGatheringConfig(raw: string | undefined): GatheringConfig {
  if (!raw) return DEFAULT_GATHERING_CONFIG;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_GATHERING_CONFIG;
  }
  if (!parsed || typeof parsed !== "object") return DEFAULT_GATHERING_CONFIG;
  const p = parsed as Partial<GatheringConfig> & {
    categories?: Partial<GatheringConfig["categories"]>;
  };
  const dwell = Number(p.dwellSeconds);
  return {
    categories: {
      events: p.categories?.events ?? true,
      tasks: p.categories?.tasks ?? true,
      needs: p.categories?.needs ?? true,
      offers: p.categories?.offers ?? true,
    },
    pinnedIds: Array.isArray(p.pinnedIds) ? p.pinnedIds.filter(isStr) : [],
    hiddenIds: Array.isArray(p.hiddenIds) ? p.hiddenIds.filter(isStr) : [],
    dwellSeconds:
      Number.isFinite(dwell) && dwell >= 3 && dwell <= 120
        ? dwell
        : DEFAULT_DWELL_SECONDS,
    title: typeof p.title === "string" ? p.title.slice(0, 80) : "",
  };
}

function isStr(v: unknown): v is string {
  return typeof v === "string";
}

// Pin and hide are mutually exclusive per id: pinning an item clears it
// from hidden and vice-versa, so the two lists can never disagree.
export function togglePinned(
  config: GatheringConfig,
  id: string,
): GatheringConfig {
  const pinned = config.pinnedIds.includes(id);
  return {
    ...config,
    pinnedIds: pinned
      ? config.pinnedIds.filter((x) => x !== id)
      : [...config.pinnedIds, id],
    hiddenIds: config.hiddenIds.filter((x) => x !== id),
  };
}

export function toggleHidden(
  config: GatheringConfig,
  id: string,
): GatheringConfig {
  const hidden = config.hiddenIds.includes(id);
  return {
    ...config,
    hiddenIds: hidden
      ? config.hiddenIds.filter((x) => x !== id)
      : [...config.hiddenIds, id],
    pinnedIds: config.pinnedIds.filter((x) => x !== id),
  };
}

export interface UseGatheringConfig {
  config: GatheringConfig;
  update: (next: GatheringConfig) => void;
}

export function useGatheringConfig(): UseGatheringConfig {
  const raw = useLiveQuery(
    () => db.settings.get(SETTING_KEYS.gatheringScreenConfig),
    [],
  );
  const config = parseGatheringConfig(raw?.value);
  const update = useCallback((next: GatheringConfig) => {
    void setSetting(
      SETTING_KEYS.gatheringScreenConfig,
      JSON.stringify(next),
    );
  }, []);
  return { config, update };
}
