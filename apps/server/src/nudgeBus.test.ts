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
import { describe, expect, it, vi } from "vitest";
import { createNudgeBus } from "./nudgeBus.js";

// The nudge bus (docs/sync-liveness.md, "server push") is the whole
// in-process fan-out for live delivery: /nudges subscribers on one
// side, the accepted-write broadcast hook on the other. It must stay
// boring — deliver to everyone, survive a broken listener, forget
// unsubscribed sockets.

describe("createNudgeBus", () => {
  it("delivers a broadcast to every current subscriber", () => {
    const bus = createNudgeBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe(a);
    bus.subscribe(b);
    expect(bus.size()).toBe(2);
    bus.broadcast();
    bus.broadcast();
    expect(a).toHaveBeenCalledTimes(2);
    expect(b).toHaveBeenCalledTimes(2);
  });

  it("unsubscribe stops delivery and shrinks size()", () => {
    const bus = createNudgeBus();
    const a = vi.fn();
    const unsubscribe = bus.subscribe(a);
    bus.broadcast();
    unsubscribe();
    bus.broadcast();
    expect(a).toHaveBeenCalledTimes(1);
    expect(bus.size()).toBe(0);
    // Idempotent — a double-unsubscribe (cleanup firing on both the
    // request and the raw socket "close") must not throw.
    expect(() => unsubscribe()).not.toThrow();
  });

  it("a throwing listener never starves the others", () => {
    const bus = createNudgeBus();
    const broken = vi.fn(() => {
      throw new Error("socket already destroyed");
    });
    const healthy = vi.fn();
    bus.subscribe(broken);
    bus.subscribe(healthy);
    expect(() => bus.broadcast()).not.toThrow();
    expect(healthy).toHaveBeenCalledTimes(1);
  });
});
