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
// Source guard for the app-wide print posture (desktop-power-tools
// plan 5) — the same style as the moss-500 contrast guard. Two
// invariants, each of which silently regressing would break EVERY
// page's printout, not just the two print surfaces:
//
//   1. The app chrome (nav, offline banner, toasts, update prompt,
//      palette, the two page FABs) carries `print:hidden`.
//   2. The one-screen-tall clipped shell un-clips for print
//      (`print:h-auto` / `print:overflow-visible` on the shell and
//      the <main> scroller) — without this, everything past the
//      first viewport-height is cut off on paper.
//
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..");

function read(rel: string): string {
  return readFileSync(join(SRC, rel), "utf8");
}

describe("print chrome guard", () => {
  it.each([
    "components/BottomNav.tsx",
    "components/OfflineBanner.tsx",
    "components/ToastContainer.tsx",
    "components/UpdatePrompt.tsx",
    "components/CommandPalette.tsx",
    "pages/Board.tsx",
    "pages/Calendar.tsx",
  ])("%s hides its chrome in print", (rel) => {
    expect(read(rel)).toContain("print:hidden");
  });

  it("the Layout shell un-clips for print", () => {
    const layout = read("components/Layout.tsx");
    expect(layout).toContain("print:h-auto");
    // Shell div AND the <main> scroller both need overflow released.
    expect(layout.match(/print:overflow-visible/g)?.length ?? 0
    ).toBeGreaterThanOrEqual(2);
  });
});
