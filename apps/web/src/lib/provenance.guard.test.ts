/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// The structural half of the honesty contract in
// docs/provenance-translation.md: display translation exists ONLY on
// surfaces that carry the marker and the View-original toggle, and
// NEVER on surfaces where exact words are load-bearing (dispute
// review, flag review, removals, exchange confirmation — those show
// signed bytes, always). Rather than trusting every future surface to
// remember that, this test pins the importers of the provenance
// modules to an explicit allowlist. Growing the list is a deliberate,
// reviewed act that must bring the marker along.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..");

/** Every file allowed to reference templateProvenance or its hook.
 *  Paths relative to src/. */
const ALLOWED = new Set([
  // the mechanism itself
  "content/templateProvenance.ts",
  "content/templateProvenance.test.ts",
  "lib/useTemplateProvenance.ts",
  "lib/provenance.guard.test.ts",
  // the marker component the detail surfaces render
  "components/ProvenanceNote.tsx",
  // detail surfaces (each renders ProvenanceNote — asserted below)
  "pages/ProjectDetail.tsx",
  "pages/TaskDetail.tsx",
  "pages/EventDetail.tsx",
  // compact LIST surfaces (phase 2a): substitute without an inline
  // marker BY DESIGN — every row/card/slide links to the project or
  // task page, where the note and the View-original toggle live one
  // tap away (docs/provenance-translation.md, "Honesty on the
  // surface"). Exact-words surfaces (dispute, flag, removal,
  // confirmation) stay off this list, always.
  "pages/Board.tsx",
  "pages/MyProjects.tsx",
  "pages/MyTasks.tsx",
  "pages/MyWork.tsx",
  "pages/Calendar.tsx",
  "pages/Present.tsx",
  "pages/PlugIn.tsx",
  "lib/gatheringSlides.ts",
  "lib/gatheringSlides.test.ts",
  "lib/calendar.ts",
  "lib/calendar.test.ts",
  "components/ProjectCard.tsx",
  // display-view plumbing, plus the "Follows:" upstream-title lines
  // (compact, marker-free — each dep links/scrolls to its task)
  "components/TaskCard.tsx",
  "components/TaskDetailBody.tsx",
  // stages the template description with the shared composition —
  // uses composeTemplateDescription only, never substitution
  "pages/ProjectNew.tsx",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("provenance display translation stays on allowlisted surfaces", () => {
  it("no file outside the allowlist references the provenance modules", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const rel = file.slice(SRC.length + 1).replace(/\\/g, "/");
      if (ALLOWED.has(rel)) continue;
      const text = readFileSync(file, "utf8");
      if (
        text.includes("templateProvenance") ||
        text.includes("useTemplateProvenance")
      ) {
        offenders.push(rel);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every allowlisted surface renders the marker", () => {
    // A surface may substitute only while it carries the note + the
    // View-original toggle. Plumbing components render views handed
    // down BY a surface, so the surfaces are where the marker lives.
    for (const surface of [
      "pages/ProjectDetail.tsx",
      "pages/TaskDetail.tsx",
      "pages/EventDetail.tsx",
    ]) {
      const text = readFileSync(join(SRC, surface), "utf8");
      expect(text.includes("ProvenanceNote"), surface).toBe(true);
    }
  });
});
