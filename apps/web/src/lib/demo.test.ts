/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import { clearUnderstoriaLocalStorage, IS_DEMO } from "./demo";

// The whole safety story of the demo build rests on one invariant: the
// demo flag is OFF unless a build explicitly set VITE_DEMO=1. A normal
// build (and the test environment, which sets no such flag) must read
// IS_DEMO === false, so the boot-time sample seed and the demo banner
// stay inert and a real node keeps starting empty (operator ruling R1).
describe("IS_DEMO", () => {
  it("is false unless VITE_DEMO is explicitly set to 1", () => {
    expect(IS_DEMO).toBe(false);
  });
});

describe("clearUnderstoriaLocalStorage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("removes only the app's `understoria.` dot-namespace keys", () => {
    // Storage is origin-wide, and the demo's default deploy layout
    // puts it at /demo/ on the SAME origin as the showcase site. A
    // demo reset that called localStorage.clear() would wipe the
    // site's `understoria-site-theme` (hyphen, different namespace)
    // and any other same-origin storage.
    localStorage.setItem("understoria.theme", "dark");
    localStorage.setItem("understoria.textSize", "large");
    localStorage.setItem("understoria-site-theme", "dark");
    localStorage.setItem("unrelated-key", "keep-me");

    clearUnderstoriaLocalStorage();

    expect(localStorage.getItem("understoria.theme")).toBeNull();
    expect(localStorage.getItem("understoria.textSize")).toBeNull();
    expect(localStorage.getItem("understoria-site-theme")).toBe("dark");
    expect(localStorage.getItem("unrelated-key")).toBe("keep-me");
  });
});
