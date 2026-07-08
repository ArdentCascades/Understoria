/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `useLiveQuery` is the banner's only read path into Dexie (the
// pending outbox count). Mocking it lets each test dial the count
// without spinning up IndexedDB. Same pattern as Welcome.test.tsx.
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: () => mockPendingCount,
}));

// The banner never touches the db directly when useLiveQuery is
// mocked; stub the module so the test doesn't construct a Dexie
// instance at import time.
vi.mock("@/db/database", () => ({
  db: {},
}));

// Reconnect-with-pending-rows nudges the worker. Spy, don't run.
const flushMock = vi.fn(async () => ({
  attempted: 0,
  delivered: 0,
  poisoned: 0,
  retried: 0,
}));
vi.mock("@/lib/outbox", () => ({
  flushOutboxNow: () => flushMock(),
}));

// i18n side effects so `t()` yields English copy for assertions.
import "@/i18n";
import { OfflineBanner } from "./OfflineBanner";
import { ToastContainer } from "./ToastContainer";
import { ToastProvider } from "@/state/ToastContext";

let mockPendingCount = 0;

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
  mockPendingCount = 0;
  flushMock.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
});

function render() {
  act(() => {
    root = createRoot(container);
    root.render(
      // MemoryRouter: the banner's outage-guide link needs a router.
      <MemoryRouter>
        <ToastProvider>
          <OfflineBanner />
          <ToastContainer />
        </ToastProvider>
      </MemoryRouter>,
    );
  });
}

function setNavigatorOnline(value: boolean) {
  vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(value);
}

function statusRegion(): HTMLElement | null {
  return container.querySelector("[role=status][aria-live=polite]");
}

describe("OfflineBanner", () => {
  it("renders no banner content while online", () => {
    setNavigatorOnline(true);
    render();
    // The polite live region wrapper stays mounted (stable for screen
    // readers), but it must be empty — no banner copy.
    expect(statusRegion()).not.toBeNull();
    expect(container.textContent).not.toContain("You're offline");
  });

  it("shows the calm offline copy inside a role=status region when offline", () => {
    setNavigatorOnline(false);
    render();
    const region = statusRegion();
    expect(region).not.toBeNull();
    expect(region!.textContent).toContain(
      "You're offline. Everything here still works from your device.",
    );
  });

  it("omits the pending line when the outbox is empty", () => {
    setNavigatorOnline(false);
    mockPendingCount = 0;
    render();
    expect(container.textContent).not.toContain("when you reconnect");
  });

  it("shows a singular pending count", () => {
    setNavigatorOnline(false);
    mockPendingCount = 1;
    render();
    expect(container.textContent).toContain(
      "1 change will send when you reconnect.",
    );
  });

  it("shows a pluralized pending count", () => {
    setNavigatorOnline(false);
    mockPendingCount = 3;
    render();
    expect(container.textContent).toContain(
      "3 changes will send when you reconnect.",
    );
  });

  it("disappears when connectivity returns and flushes queued rows", () => {
    setNavigatorOnline(false);
    mockPendingCount = 2;
    render();
    expect(container.textContent).toContain("You're offline");

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(container.textContent).not.toContain("You're offline");
    expect(flushMock).toHaveBeenCalledTimes(1);
    // Pending rows existed, so the brief back-online toast shows.
    expect(container.textContent).toContain(
      "Back online. Sending queued changes…",
    );
  });

  it("skips the back-online toast and flush when nothing was queued", () => {
    setNavigatorOnline(false);
    mockPendingCount = 0;
    render();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(container.textContent).not.toContain("Back online");
    expect(flushMock).not.toHaveBeenCalled();
  });
});
