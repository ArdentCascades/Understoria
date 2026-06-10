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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOnlineStatus } from "./useOnlineStatus";

// Tiny probe component: renders the hook's value as text so the
// assertions can read it from the DOM.
function Probe() {
  const online = useOnlineStatus();
  return <div data-testid="probe">{online ? "online" : "offline"}</div>;
}

let container: HTMLDivElement;
let root: Root;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

beforeEach(() => {
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
    root.render(<Probe />);
  });
}

function probeText(): string {
  return container.querySelector("[data-testid=probe]")?.textContent ?? "";
}

describe("useOnlineStatus", () => {
  it("initializes from navigator.onLine when online", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    render();
    expect(probeText()).toBe("online");
  });

  it("initializes from navigator.onLine when offline", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    render();
    expect(probeText()).toBe("offline");
  });

  it("flips to offline on the window offline event", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    render();
    expect(probeText()).toBe("online");
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(probeText()).toBe("offline");
  });

  it("flips back to online on the window online event", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    render();
    expect(probeText()).toBe("offline");
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(probeText()).toBe("online");
  });

  it("removes listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    render();
    act(() => {
      root.unmount();
    });
    const removed = removeSpy.mock.calls.map((c) => c[0]);
    expect(removed).toContain("online");
    expect(removed).toContain("offline");
  });
});
