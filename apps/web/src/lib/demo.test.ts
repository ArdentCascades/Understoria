/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { IS_DEMO } from "./demo";

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
