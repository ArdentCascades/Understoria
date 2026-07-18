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
//
// useMediaQuery — the live media-query hook behind the landscape
// split-pane gates. Locks:
//   1. Initial render reads the current match state synchronously.
//   2. A `change` event on the MediaQueryList flips the hook's value
//      (rotation mid-view live-switches the layout).
//   3. jsdom-absent safety: no window.matchMedia → always false, no
//      throw (the hook must be render-safe in every test harness).
//   4. Unmount detaches the change listener.
//
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useMediaQuery, SHORT_LANDSCAPE_QUERY } from "./viewport";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

interface StubMql {
  matches: boolean;
  media: string;
  listeners: Set<() => void>;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
  fire: () => void;
}

function stubMatchMedia(initialMatches: boolean): Map<string, StubMql> {
  const byQuery = new Map<string, StubMql>();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): StubMql => {
      let mql = byQuery.get(query);
      if (!mql) {
        const listeners = new Set<() => void>();
        mql = {
          matches: initialMatches,
          media: query,
          listeners,
          addEventListener: (_type, cb) => listeners.add(cb),
          removeEventListener: (_type, cb) => listeners.delete(cb),
          fire: () => {
            for (const cb of [...listeners]) cb();
          },
        };
        byQuery.set(query, mql);
      }
      return mql;
    },
  });
  return byQuery;
}

let container: HTMLDivElement;
let root: Root;
let observed: boolean | undefined;

function Probe({ query }: { query: string }) {
  observed = useMediaQuery(query);
  return null;
}

function renderProbe(query: string) {
  act(() => {
    root = createRoot(container);
    root.render(createElement(Probe, { query }));
  });
}

beforeEach(() => {
  observed = undefined;
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  // Restore jsdom's native matchMedia-less window.
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe("useMediaQuery", () => {
  it("reads the initial match state", () => {
    stubMatchMedia(true);
    renderProbe(SHORT_LANDSCAPE_QUERY);
    expect(observed).toBe(true);
  });

  it("reads an initial non-match as false", () => {
    stubMatchMedia(false);
    renderProbe(SHORT_LANDSCAPE_QUERY);
    expect(observed).toBe(false);
  });

  it("flips when the media query's change event fires (rotation)", () => {
    const mqls = stubMatchMedia(false);
    renderProbe(SHORT_LANDSCAPE_QUERY);
    expect(observed).toBe(false);

    const mql = mqls.get(SHORT_LANDSCAPE_QUERY)!;
    act(() => {
      mql.matches = true;
      mql.fire();
    });
    expect(observed).toBe(true);

    act(() => {
      mql.matches = false;
      mql.fire();
    });
    expect(observed).toBe(false);
  });

  it("is safe (always false) when matchMedia does not exist", () => {
    // jsdom carries no matchMedia by default — must not throw.
    expect(typeof window.matchMedia).not.toBe("function");
    renderProbe(SHORT_LANDSCAPE_QUERY);
    expect(observed).toBe(false);
  });

  it("detaches its change listener on unmount", () => {
    const mqls = stubMatchMedia(false);
    renderProbe(SHORT_LANDSCAPE_QUERY);
    const mql = mqls.get(SHORT_LANDSCAPE_QUERY)!;
    expect(mql.listeners.size).toBe(1);
    act(() => root.unmount());
    expect(mql.listeners.size).toBe(0);
    // Re-create a root so afterEach's unmount stays valid.
    act(() => {
      root = createRoot(container);
      root.render(null);
    });
  });
});
