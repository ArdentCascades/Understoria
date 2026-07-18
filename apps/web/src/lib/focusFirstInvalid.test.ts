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
/**
 * Scroll-to-first-error helper (round-3 papercut: submitting a form
 * with an off-screen invalid field looked like "nothing happened" on
 * short landscape viewports). Locks:
 *   1. The FIRST `aria-invalid="true"` element in DOM order gets
 *      scrolled into view (block center, smooth) and focused.
 *   2. Runs deferred (rAF/timeout) so it sees the attributes React
 *      renders AFTER markAllTouched()'s state update.
 *   3. No invalid field → no scroll, no focus steal.
 *   4. Survives jsdom-like environments without scrollIntoView.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { focusFirstInvalidField } from "./focusFirstInvalid";

// jsdom has no scrollIntoView; install a spy-able stub per test.
function stubScrollIntoView() {
  const spy = vi.fn();
  (
    Element.prototype as unknown as { scrollIntoView: unknown }
  ).scrollIntoView = spy;
  return spy;
}

// The helper defers via requestAnimationFrame (setTimeout fallback);
// jsdom implements rAF on a real ~16ms timer, so wait a beat.
async function flushDeferred() {
  await new Promise((r) => setTimeout(r, 50));
}

afterEach(() => {
  delete (Element.prototype as unknown as { scrollIntoView?: unknown })
    .scrollIntoView;
  document.body.innerHTML = "";
});

describe("focusFirstInvalidField", () => {
  it("scrolls the first invalid field into view and focuses it", async () => {
    const spy = stubScrollIntoView();
    document.body.innerHTML = `
      <form>
        <input id="ok" />
        <input id="bad-1" aria-invalid="true" />
        <input id="bad-2" aria-invalid="true" />
      </form>`;
    focusFirstInvalidField();
    await flushDeferred();
    const first = document.getElementById("bad-1")!;
    expect(document.activeElement).toBe(first);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.instances[0]).toBe(first);
    expect(spy).toHaveBeenCalledWith({ block: "center", behavior: "smooth" });
  });

  it("does nothing when no field is invalid", async () => {
    const spy = stubScrollIntoView();
    document.body.innerHTML = `<form><input id="ok" /></form>`;
    const before = document.activeElement;
    focusFirstInvalidField();
    await flushDeferred();
    expect(spy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(before);
  });

  it("scopes the query to the given root", async () => {
    stubScrollIntoView();
    document.body.innerHTML = `
      <div id="outside"><input id="bad-out" aria-invalid="true" /></div>
      <form id="scope"><input id="bad-in" aria-invalid="true" /></form>`;
    focusFirstInvalidField(document.getElementById("scope"));
    await flushDeferred();
    expect(document.activeElement).toBe(document.getElementById("bad-in"));
  });

  it("still focuses when scrollIntoView is unavailable (jsdom guard)", async () => {
    // No stub installed — Element.prototype.scrollIntoView is absent.
    document.body.innerHTML = `<input id="bad" aria-invalid="true" />`;
    focusFirstInvalidField();
    await flushDeferred();
    expect(document.activeElement).toBe(document.getElementById("bad"));
  });
});
