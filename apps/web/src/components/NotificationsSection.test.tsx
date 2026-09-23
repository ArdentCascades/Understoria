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

vi.mock("@/lib/pushNameConsent", () => ({
  getMyPushNameConsent: vi.fn(async () =>
    mockMyConsent === null ? null : { allow: mockMyConsent },
  ),
  setPushNameConsent: vi.fn(async (allow: boolean) => {
    mockMyConsent = allow;
    return { ok: true, consent: { allow } };
  }),
  buildPushNameMap: vi.fn(async () => mockNameMap),
}));

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
    tiers: {} as Partial<
      Record<
        import("@understoria/shared").NotificationCategory,
        "silent" | "generic" | "named"
      >
    >,
    quiet: null as { start: string; end: string } | null,
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
    requestTestPing: vi.fn(async () => mockTestResult),
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
  requestTestPing,
  teardownPushSubscription,
  defaultPushPrefs,
} from "@/lib/pushNotifications";
import { setPushNameConsent } from "@/lib/pushNameConsent";
import type { Member } from "@/types";

let mockPermission: NotificationPermission;
let mockPermissionAnswer: NotificationPermission;
let mockPrefs: ReturnType<typeof defaultPushPrefs>;
let mockTestResult: { ok: boolean; status: number };
let mockMyConsent: boolean | null;
let mockNameMap: Record<string, string>;
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
  mockTestResult = { ok: true, status: 200 };
  mockMyConsent = null;
  mockNameMap = {};
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
    // Five switchboard rows plus the name-consent checkbox.
    expect(checkboxes()).toHaveLength(6);
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
    // Five switchboard rows plus the quiet-hours checkbox (the
    // switchboard is open for a subscribed member) plus the
    // name-consent checkbox.
    expect(checkboxes()).toHaveLength(7);
    expect(container.textContent).not.toContain("couldn't be reached");
  });

  it("renders everything off by default and asks the browser nothing", async () => {
    await render();
    expect(checkboxes()).toHaveLength(6);
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

  it("never lists test_ping as a switch, and the switchboard shows event reminders and messages (v2)", async () => {
    await render();
    expect(container.textContent).toContain("Event reminders");
    expect(container.textContent).toContain("Messages waiting");
    // Five subscribable rows + name consent, none of them a
    // test-ping preference — the test is a button, not a
    // subscription.
    expect(checkboxes()).toHaveLength(6);
    expect(container.textContent).not.toContain("Send myself a test");
  });

  it("sends a self-test on request and reports the outcome honestly", async () => {
    mockPermission = "granted";
    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["shift_reminder"],
      endpoint: "https://push.example/sub/1",
    };
    await render();
    await act(async () => {
      buttonByText("Send myself a test").click();
    });
    expect(requestTestPing).toHaveBeenCalledWith("me-key");
    expect(container.textContent).toContain("Sent.");

    mockTestResult = { ok: false, status: 0 };
    await act(async () => {
      buttonByText("Send myself a test").click();
    });
    expect(container.textContent).toContain("couldn't be sent");
  });

  it("per-kind overrides appear only with two kinds on, and save device-only tiers", async () => {
    mockPermission = "granted";
    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["shift_reminder"],
      endpoint: "https://push.example/sub/1",
    };
    await render();
    expect(container.textContent).not.toContain("Fine-tune each kind");
    act(() => root.unmount());

    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["shift_reminder", "event_reminder"],
      endpoint: "https://push.example/sub/1",
    };
    await render();
    expect(container.textContent).toContain("Fine-tune each kind");
    const select = container.querySelector<HTMLSelectElement>("select");
    expect(select).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )!.set!;
      setter.call(select, "silent");
      select!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(mockPrefs.tiers).toEqual({ shift_reminder: "silent" });
    // Categories at the node were untouched — this is display-only.
    expect(registerPushSubscription).not.toHaveBeenCalled();
  });

  it("quiet hours toggle stores a local window and clears it, never touching the node", async () => {
    mockPermission = "granted";
    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["shift_reminder"],
      endpoint: "https://push.example/sub/1",
    };
    await render();
    const quietBox = checkboxes()[5];
    expect(quietBox.checked).toBe(false);
    await act(async () => {
      quietBox.click();
    });
    expect(mockPrefs.quiet).toEqual({ start: "22:00", end: "07:00" });
    const timeInputs = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="time"]'),
    ];
    expect(timeInputs).toHaveLength(2);
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(timeInputs[0], "21:30");
      timeInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(mockPrefs.quiet).toEqual({ start: "21:30", end: "07:00" });
    await act(async () => {
      checkboxes()[5].click();
    });
    expect(mockPrefs.quiet).toBeNull();
    expect(registerPushSubscription).not.toHaveBeenCalled();
  });

  it("the sender-side name consent is its own signed record: off by default, flips, never touches prefs", async () => {
    await render();
    expect(container.textContent).toContain("Your name on other screens");
    const consentBox = checkboxes()[5]; // last: after the 5 switches
    expect(consentBox.checked).toBe(false);
    await act(async () => {
      consentBox.click();
    });
    expect(setPushNameConsent).toHaveBeenCalledWith(true);
    expect(checkboxes()[5].checked).toBe(true);
    // Flipping the federated flag registers nothing with the node's
    // PUSH tables and saves no device prefs — it is a state record.
    expect(registerPushSubscription).not.toHaveBeenCalled();
  });

  it("snapshots the consented∩unblocked name map into the device prefs at save time", async () => {
    mockPermission = "granted";
    mockNameMap = { "key-ana": "Ana" };
    mockPrefs = {
      ...defaultPushPrefs(),
      categories: ["message_waiting"],
      endpoint: "https://push.example/sub/1",
    };
    await render();
    // Any display-pref save re-snapshots strings AND names.
    const radios = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ];
    await act(async () => {
      radios[2].click(); // named tier
    });
    expect(mockPrefs.names).toEqual({ "key-ana": "Ana" });
    expect(mockPrefs.strings?.named.message_waiting).toContain("{sender}");
    expect(mockPrefs.strings?.named.test_ping).toBeTruthy();
  });
});
