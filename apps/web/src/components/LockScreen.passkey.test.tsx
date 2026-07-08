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
//
// The lock screen's passkey affordance. Locks:
//   1. With an enrollment on the device, "Unlock with passkey"
//      renders above the passphrase form (which stays — the fallback
//      is always visible, never behind a click).
//   2. Without one, the screen is exactly the passphrase form — no
//      dead button on un-enrolled devices.
//   3. Tapping the button asserts, unlocks with the derived KEK, and
//      refreshes the app's lock state.
//
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUnlock = vi.fn();
const mockRefreshLockState = vi.fn().mockResolvedValue(undefined);
vi.mock("@/state/AppContext", () => ({
  useApp: () => ({
    currentMember: null,
    unlock: mockUnlock,
    refreshLockState: mockRefreshLockState,
  }),
}));

const mockEnrollmentValue: {
  meta: { credentialId: string; prfSalt: string; createdAt: number } | null;
} = { meta: null };
const mockUnlockWithKek = vi.fn();
vi.mock("@/db/secrets", () => ({
  passkeyEnrollment: () => Promise.resolve(mockEnrollmentValue.meta),
  unlockSessionWithKek: (kek: Uint8Array) => mockUnlockWithKek(kek),
}));

const mockAssert = vi.fn();
vi.mock("@/lib/passkeyUnlock", () => ({
  supportsPasskeys: () => true,
  assertPasskeyKek: (input: unknown) => mockAssert(input),
}));

import "@/i18n";
import { LockScreen } from "./LockScreen";

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.clearAllMocks();
  mockEnrollmentValue.meta = null;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

async function render() {
  await act(async () => {
    root = createRoot(container);
    root.render(<LockScreen />);
  });
}

function passkeyButton(): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll("button")).find((b) =>
    /passkey/i.test(b.textContent ?? ""),
  ) as HTMLButtonElement | undefined;
}

describe("LockScreen — passkey affordance", () => {
  it("shows the passkey button when an enrollment exists, with the passphrase form still present", async () => {
    mockEnrollmentValue.meta = {
      credentialId: "AQID",
      prfSalt: "AAAA",
      createdAt: 1,
    };
    await render();
    expect(passkeyButton()).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it("shows no passkey button without an enrollment", async () => {
    await render();
    expect(passkeyButton()).toBeUndefined();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it("asserts, unlocks with the KEK, and refreshes lock state on tap", async () => {
    mockEnrollmentValue.meta = {
      credentialId: "AQID",
      prfSalt: "AAAA",
      createdAt: 1,
    };
    const kek = new Uint8Array(32).fill(6);
    mockAssert.mockResolvedValue({ ok: true, kek });
    mockUnlockWithKek.mockResolvedValue("unlocked");
    await render();
    await act(async () => {
      passkeyButton()!.click();
    });
    expect(mockAssert).toHaveBeenCalledWith(
      expect.objectContaining({ credentialId: "AQID" }),
    );
    expect(mockUnlockWithKek).toHaveBeenCalledWith(kek);
    expect(mockRefreshLockState).toHaveBeenCalled();
  });

  it("stays quiet when the member dismisses the platform prompt", async () => {
    mockEnrollmentValue.meta = {
      credentialId: "AQID",
      prfSalt: "AAAA",
      createdAt: 1,
    };
    mockAssert.mockResolvedValue({ ok: false, error: "cancelled" });
    await render();
    await act(async () => {
      passkeyButton()!.click();
    });
    expect(mockUnlockWithKek).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
