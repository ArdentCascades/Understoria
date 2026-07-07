/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ensurePersistentStorage,
  formatBytes,
  readStorageStatus,
} from "./storageBudget";

function stubStorage(impl: Partial<StorageManager> | undefined) {
  vi.stubGlobal("navigator", { storage: impl } as unknown as Navigator);
}

afterEach(() => vi.unstubAllGlobals());

describe("ensurePersistentStorage", () => {
  it("returns the grant result and skips re-requesting when already persisted", async () => {
    const persist = vi.fn(async () => true);
    stubStorage({ persisted: async () => true, persist });
    expect(await ensurePersistentStorage()).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  it("requests the grant when not yet persisted and reports refusal honestly", async () => {
    stubStorage({ persisted: async () => false, persist: async () => false });
    expect(await ensurePersistentStorage()).toBe(false);
  });

  it("returns null (never throws) when the API is absent or broken", async () => {
    stubStorage(undefined);
    expect(await ensurePersistentStorage()).toBeNull();
    stubStorage({
      persisted: async () => {
        throw new Error("boom");
      },
      persist: async () => true,
    });
    expect(await ensurePersistentStorage()).toBeNull();
  });
});

describe("readStorageStatus", () => {
  it("reads persisted + estimate when available", async () => {
    stubStorage({
      persisted: async () => true,
      estimate: async () => ({ usage: 12_345_678, quota: 1_000_000_000 }),
    });
    expect(await readStorageStatus()).toEqual({
      persisted: true,
      usage: 12_345_678,
      quota: 1_000_000_000,
    });
  });

  it("degrades to nulls without the API", async () => {
    stubStorage(undefined);
    expect(await readStorageStatus()).toEqual({
      persisted: null,
      usage: null,
      quota: null,
    });
  });
});

describe("formatBytes", () => {
  it("formats each magnitude and rejects garbage", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2_048)).toBe("2.0 KB");
    expect(formatBytes(300 * 1024)).toBe("300 KB");
    expect(formatBytes(12_345_678)).toBe("12 MB"); // ≥10 MB drops the decimal
    expect(formatBytes(3 * 1024 ** 3)).toBe("3.0 GB");
    expect(formatBytes(-1)).toBe("—");
    expect(formatBytes(Number.NaN)).toBe("—");
  });
});
