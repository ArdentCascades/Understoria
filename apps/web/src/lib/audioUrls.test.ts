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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAudioUrl,
  releaseAudioUrl,
  revokeAllAudioUrls,
} from "./audioUrls";

// The audio-URL registry backing the #476 purge contract: every
// object URL minted for voice audio is registered, so a panic purge
// can revoke whatever is still alive without depending on component
// unmount order.

let created: ReturnType<typeof vi.fn>;
let revoked: ReturnType<typeof vi.fn>;
let serial = 0;

beforeEach(() => {
  created = vi.fn(() => `blob:audio-${serial++}`);
  revoked = vi.fn();
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: created,
    revokeObjectURL: revoked,
  });
});

afterEach(() => {
  // Drain the module-level registry so no test leaks URLs into the
  // next one.
  revokeAllAudioUrls();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const blob = () => new Blob(["bytes"], { type: "audio/webm" });

describe("audio object-URL registry", () => {
  it("mints through the platform API and registers the URL", () => {
    const url = createAudioUrl(blob());
    expect(url).toBe("blob:audio-0");
    expect(created).toHaveBeenCalledTimes(1);

    expect(revokeAllAudioUrls()).toBe(1);
    expect(revoked).toHaveBeenCalledWith(url);
  });

  it("release revokes one URL and forgets it", () => {
    const a = createAudioUrl(blob());
    const b = createAudioUrl(blob());

    releaseAudioUrl(a);
    expect(revoked).toHaveBeenCalledWith(a);

    // Only b is still registered; a is not revoked a second time.
    expect(revokeAllAudioUrls()).toBe(1);
    expect(revoked).toHaveBeenCalledTimes(2);
    expect(revoked).toHaveBeenLastCalledWith(b);
  });

  it("release of null is a no-op (the player's failed state)", () => {
    releaseAudioUrl(null);
    expect(revoked).not.toHaveBeenCalled();
  });

  it("returns null instead of throwing when the API is missing", () => {
    vi.stubGlobal("URL", { ...URL, createObjectURL: undefined });
    expect(createAudioUrl(blob())).toBeNull();
  });

  it("revokeAll keeps going when one revocation throws", () => {
    const a = createAudioUrl(blob());
    const b = createAudioUrl(blob());
    revoked.mockImplementationOnce(() => {
      throw new Error("already dead");
    });

    expect(revokeAllAudioUrls()).toBe(2);
    expect(revoked).toHaveBeenCalledWith(a);
    expect(revoked).toHaveBeenCalledWith(b);
    // Registry is empty afterward even though a revoke threw.
    expect(revokeAllAudioUrls()).toBe(0);
  });
});
