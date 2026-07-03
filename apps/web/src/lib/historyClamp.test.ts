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
import { clampNewestFirst, HISTORY_CLAMP_VISIBLE } from "./historyClamp";

const list = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("clampNewestFirst", () => {
  it("passes short lists through untouched", () => {
    const entries = list(3);
    const { visible, hiddenCount } = clampNewestFirst(entries, false);
    expect(visible).toBe(entries); // same reference — no needless copy
    expect(hiddenCount).toBe(0);
  });

  it("treats a list exactly at the limit as unclamped", () => {
    const entries = list(HISTORY_CLAMP_VISIBLE);
    const { visible, hiddenCount } = clampNewestFirst(entries, false);
    expect(visible).toBe(entries);
    expect(hiddenCount).toBe(0);
  });

  it("clamps to the newest entries (head of a newest-first list)", () => {
    const entries = list(HISTORY_CLAMP_VISIBLE + 5);
    const { visible, hiddenCount } = clampNewestFirst(entries, false);
    expect(visible).toEqual(list(HISTORY_CLAMP_VISIBLE));
    expect(hiddenCount).toBe(5);
  });

  it("shows everything when expanded, still reporting hiddenCount for the toggle label", () => {
    const entries = list(HISTORY_CLAMP_VISIBLE + 2);
    const { visible, hiddenCount } = clampNewestFirst(entries, true);
    expect(visible).toBe(entries);
    expect(hiddenCount).toBe(2);
  });

  it("honors a custom max", () => {
    const { visible, hiddenCount } = clampNewestFirst(list(4), false, 2);
    expect(visible).toEqual([0, 1]);
    expect(hiddenCount).toBe(2);
  });

  it("handles an empty list", () => {
    const { visible, hiddenCount } = clampNewestFirst([], false);
    expect(visible).toEqual([]);
    expect(hiddenCount).toBe(0);
  });
});
