/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * The Settings switchboard for opt-in notifications
 * (docs/notifications.md). What these pin is the ceremony, not the
 * pixels: everything renders OFF with no permission activity; the
 * vendor-metadata disclosure stands between the first toggle and the
 * browser prompt; cancel means nothing happened; a denial is shown
 * plainly and never re-asked; and all-off tears down node row and
 * browser subscription while keeping the member's display choices.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/state/AppContext", () => ({ useApp: () => mockState }));

vi.mock("@/lib/pushBrowser", () => ({
  pushSupported: () => true,
  currentPermission: () => mockPermission,
  requestNotificationPermission: vi.fn(async () => {
    mockPermission = mockPermissionAnswer;
    return mockPermissionAnswer;
  }),
  subscribeBrowserPush: vi.fn(async () => ({
    endpoint: "https://push.example/sub/1",
    keys: { p256dh: "p", auth: "a" },
  })),
  currentBrowserSubscription: vi.fn(async () => null),
  unsubscribeBrowserPush: vi.fn(async () => {}),
}));

vi.mock("@/lib/pushNotifications", () => {
  const defaults = () => ({
    categories: [] as import("@understoria/shared").NotificationCategory[],
    tier: "generic" as const,
    title: null as string | null,
    deviceId: "device-test",
    endpoint: null as string | null,
    renewedAt: 0,
    strings: null,
  });
  return {
    defaultPushPrefs: defaults,
    getPushPrefs: vi.fn(async () => ({ ...mockPrefs })),
    savePushPrefs: vi.fn(async (p: typeof mockPrefs) => {
      mockPrefs = { ...p };
    }),
    fetchVapidKey: vi.fn(async () => mockVapid),
    registerPushSubscription: vi.fn(
      async (
        _m: string,
        sub: { endpoint: string },
        cats: import("@understoria/shared").NotificationCategory[],
      ) => {
        mockPrefs = { ...mockPrefs, categories: cats, endpoint: sub.endpoint };
        return true;
      },
    ),
    teardownPushSubscription: vi.fn(async () => {
      mockPrefs = defaults();
    }),
  };
});

import "@/i18n";
import { NotificationsSection } from "./NotificationsSection";
import {
  requestNotificationPermission,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from "@/lib/pushBrowser";
import {
  registerPushSubscription,
  teardownPushSubscription,
  defaultPushPrefs,
} from "@/lib/pushNotifications";
import type { Member } from "@/types";

let mockPermission: NotificationPermission;
let mockPermissionAnswer: NotificationPermission;
let mockPrefs: ReturnType<typeof defaultPushPrefs>;
let mockVapid: import("@/lib/pushNotifications").VapidKeyResult;
let mockState: {
  currentMember: Member | null;
  lockState: "unprotected" | "locked" | "unlocked";
};

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  vi.clearAllMocks();
  mockPermission = "default";
  mockPermissionAnswer = "granted";
  mockPrefs = defaultPushPrefs();
  mockVapid = { kind: "ok", publicKey: "test-vapid-key" };
  mockState = {
    currentMember: {
      publicKey: "me-key",
      displayName: "Me",
      skills: [],
      availability: "",
      availabilityChips: [],
      seedBalance: 5,
      vouchedBy: [],
      createdAt: 0,
      nodeId: "node-1",
      locationZone: "",
    },
    lockState: "unprotected",
  };
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
    root.render(<NotificationsSection />);
  });
  // Let the prefs/vapid loads land.
  await act(async () => {
    await Promise.resolve();
  });
}

function checkboxes(): HTMLInputElement[] {
  return [
    ...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  ];
}

function buttonByText(text: string): HTMLButtonElement {
  const btn = [...container.querySelectorAll("button")].find(
    (b) => b.textContent === text,
  );
  if (!btn) throw new Error(`no button "${text}"`);
  return btn;
}

describe("NotificationsSection", () => {
  it("tells the true story for each server situation — never the wrong one", async () => {
    // The three non-ok probe outcomes are three different problems
    // with three different fixes; the field bug this pins against
    // was a connected member being told their device "isn't
    // connected" when their server just predated push support.
    mockVapid = { kind: "unsupported" };
    await render();
    expect(container.textContent).toContain(
      "doesn't offer notifications yet",
    );
    expect(container.textContent).not.toContain("isn't set up with one");
    act(() => root.unmount());

    mockVapid = { kind: "unconfigured" };
    await render();
    expect(container.textContent).toContain("isn't set up with one");
    act(() => root.unmount());

    mockVapid = { kind: "unreachable" };
    await render();
    expect(container.textContent).toContain("couldn't be reached just now");
    // The transient case gets a retry, and a successful retry opens
    // the switchboard.
    mockVapid = { kind: "ok", publicKey: "test-vapid-key" };
    await act(async () => {
      buttonByText("Try again").click();
    });
    expect(checkboxes()).toHaveLength(3);
  });

  it("keeps the switchboard for an already-subscribed member even when the probe fails", async () => {
    mockVapid = { kind: "unreachable" };
    mockPermission = "granted";
    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["shift_reminder"],
      endpoint: "https://push.example/sub/1",
    };
    await render();
    expect(checkboxes()).toHaveLength(3);
    expect(container.textContent).not.toContain("couldn't be reached");
  });

  it("renders everything off by default and asks the browser nothing", async () => {
    await render();
    expect(checkboxes()).toHaveLength(3);
    expect(checkboxes().every((c) => !c.checked)).toBe(true);
    expect(container.textContent).toContain("Everything is off");
    expect(requestNotificationPermission).not.toHaveBeenCalled();
    expect(registerPushSubscription).not.toHaveBeenCalled();
  });

  it("puts the disclosure between the first toggle and the prompt — cancel means nothing happened", async () => {
    await render();
    await act(async () => {
      checkboxes()[0].click();
    });
    // Disclosure visible, prompt NOT yet fired.
    expect(container.textContent).toContain("Before this turns on");
    expect(requestNotificationPermission).not.toHaveBeenCalled();
    await act(async () => {
      buttonByText("Not now").click();
    });
    expect(requestNotificationPermission).not.toHaveBeenCalled();
    expect(registerPushSubscription).not.toHaveBeenCalled();
    expect(checkboxes().every((c) => !c.checked)).toBe(true);
  });

  it("continue asks once, subscribes, registers the one category, and reveals the lock-screen choices", async () => {
    await render();
    await act(async () => {
      checkboxes()[0].click();
    });
    await act(async () => {
      buttonByText("I understand — ask this browser").click();
    });
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);
    expect(subscribeBrowserPush).toHaveBeenCalledWith("test-vapid-key");
    expect(registerPushSubscription).toHaveBeenCalledTimes(1);
    expect(
      (registerPushSubscription as ReturnType<typeof vi.fn>).mock.calls[0][2],
    ).toEqual(["shift_reminder"]);
    // The device-only display prefs appeared, strings snapshotted.
    expect(container.textContent).toContain("On your lock screen");
    expect(mockPrefs.strings?.generic).toBe("Something needs you");
    expect(mockPrefs.strings?.named.shift_reminder).toBeTruthy();
  });

  it("a denial is stated plainly and never re-asked", async () => {
    mockPermissionAnswer = "denied";
    await render();
    await act(async () => {
      checkboxes()[0].click();
    });
    await act(async () => {
      buttonByText("I understand — ask this browser").click();
    });
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("blocked for Understoria");
    expect(registerPushSubscription).not.toHaveBeenCalled();
    // Re-render fresh (the member returns later): the denied state is
    // shown from the stored permission, with no new prompt.
    act(() => {
      root.unmount();
    });
    await render();
    expect(container.textContent).toContain("blocked for Understoria");
    expect(requestNotificationPermission).toHaveBeenCalledTimes(1);
  });

  it("all-off tears down node row and browser subscription but keeps tier and title", async () => {
    mockPermission = "granted";
    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["shift_reminder"],
      endpoint: "https://push.example/sub/1",
      tier: "named",
      title: "Weather",
    };
    await render();
    await act(async () => {
      buttonByText("Turn every notification off").click();
    });
    expect(unsubscribeBrowserPush).toHaveBeenCalledTimes(1);
    expect(teardownPushSubscription).toHaveBeenCalledWith("me-key");
    expect(mockPrefs.categories).toEqual([]);
    expect(mockPrefs.tier).toBe("named");
    expect(mockPrefs.title).toBe("Weather");
    expect(container.textContent).toContain("Everything is off");
  });
});
