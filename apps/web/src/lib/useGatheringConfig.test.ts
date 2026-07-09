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
import { describe, expect, it } from "vitest";
import {
  DEFAULT_GATHERING_CONFIG,
  parseGatheringConfig,
  toggleHidden,
  togglePinned,
} from "./useGatheringConfig";

describe("parseGatheringConfig", () => {
  it("returns defaults for undefined or garbage", () => {
    expect(parseGatheringConfig(undefined)).toEqual(DEFAULT_GATHERING_CONFIG);
    expect(parseGatheringConfig("not json")).toEqual(DEFAULT_GATHERING_CONFIG);
    expect(parseGatheringConfig("123")).toEqual(DEFAULT_GATHERING_CONFIG);
  });

  it("fills missing fields from defaults (tolerates partial shapes)", () => {
    const cfg = parseGatheringConfig(
      JSON.stringify({ categories: { offers: false } }),
    );
    expect(cfg.categories).toEqual({
      events: true,
      tasks: true,
      needs: true,
      offers: false,
    });
    expect(cfg.dwellSeconds).toBe(DEFAULT_GATHERING_CONFIG.dwellSeconds);
    expect(cfg.pinnedIds).toEqual([]);
  });

  it("clamps an out-of-range dwell back to the default", () => {
    expect(parseGatheringConfig(JSON.stringify({ dwellSeconds: 1 })).dwellSeconds).toBe(
      DEFAULT_GATHERING_CONFIG.dwellSeconds,
    );
    expect(
      parseGatheringConfig(JSON.stringify({ dwellSeconds: 999 })).dwellSeconds,
    ).toBe(DEFAULT_GATHERING_CONFIG.dwellSeconds);
    expect(parseGatheringConfig(JSON.stringify({ dwellSeconds: 20 })).dwellSeconds).toBe(
      20,
    );
  });
});

describe("togglePinned / toggleHidden are mutually exclusive", () => {
  const base = { ...DEFAULT_GATHERING_CONFIG, pinnedIds: [], hiddenIds: [] };

  it("pinning an item clears it from hidden", () => {
    const hidden = toggleHidden(base, "x");
    expect(hidden.hiddenIds).toEqual(["x"]);
    const pinned = togglePinned(hidden, "x");
    expect(pinned.pinnedIds).toEqual(["x"]);
    expect(pinned.hiddenIds).toEqual([]);
  });

  it("hiding an item clears it from pinned", () => {
    const pinned = togglePinned(base, "y");
    expect(pinned.pinnedIds).toEqual(["y"]);
    const hidden = toggleHidden(pinned, "y");
    expect(hidden.hiddenIds).toEqual(["y"]);
    expect(hidden.pinnedIds).toEqual([]);
  });

  it("toggling twice returns to empty", () => {
    expect(togglePinned(togglePinned(base, "z"), "z").pinnedIds).toEqual([]);
    expect(toggleHidden(toggleHidden(base, "z"), "z").hiddenIds).toEqual([]);
  });
});
