/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// RTL guard (docs/rtl-plan.md, step R1).
//
// Every horizontal spacing/alignment utility in app code uses Tailwind's
// LOGICAL forms — ms/me, ps/pe, start/end, text-start/text-end,
// border-s/border-e — so that a right-to-left language mirrors the layout
// instead of stranding it. In LTR these compile to exactly the physical
// properties they replaced (`margin-inline-start` IS `margin-left` when
// direction is ltr), so the sweep was pixel-neutral; the point is purely
// that RTL now has somewhere to go.
//
// This test is the ratchet. Physical utilities are easy to reintroduce by
// habit or by copying an older snippet, and nothing else would notice
// until an Arabic-speaking member saw a broken screen.
//
// Anything genuinely physical belongs in ALLOWLIST below, WITH a reason.
// "It was already there" is not a reason.
//
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..");

const VALUE = String.raw`(?:[0-9]+(?:\.[0-9]+)?(?:/[0-9]+)?|px|full|auto|screen|min|max|fit|\[[^\]]*\])`;

/** Physical horizontal utilities, as whole class tokens. Vertical ones
 *  (mt/mb/pt/pb, top/bottom, border-t/border-b) are direction-neutral
 *  and deliberately not matched.
 *
 *  Values are restricted to Tailwind's own scale so English prose can
 *  never trip this: "left-click", "right-aligned" and "left-handed" all
 *  appear in comments and member-facing copy, and `left-[a-z]+` would
 *  flag every one of them. */
const PHYSICAL = new RegExp(
  String.raw`(?<![\w:/-])(?:[a-z-]+:)*-?(?:` +
    String.raw`[mp][lr]-` +
    VALUE +
    String.raw`|` +
    String.raw`(?:left|right)-` +
    VALUE +
    String.raw`|` +
    String.raw`text-(?:left|right)|` +
    String.raw`border-[lr](?:-[0-9]+)?|` +
    String.raw`rounded-[lr](?:-(?:sm|md|lg|xl|2xl|3xl|full|none))?|` +
    String.raw`space-x-` +
    VALUE +
    String.raw`|divide-x|` +
    String.raw`float-(?:left|right)|origin-(?:left|right)` +
    String.raw`)(?![\w./-])`,
  "g",
);

/**
 * Deliberate physical usages, each with the reason it must stay physical.
 * Keyed by file, valued by the exact substring that licenses the line —
 * so an unrelated physical utility in the same file still fails.
 */
const ALLOWLIST: ReadonlyArray<{
  file: string;
  contains: string;
  why: string;
}> = [
  {
    file: "components/BottomNav.tsx",
    contains: "safe-area-inset-left",
    why:
      "env(safe-area-inset-left) is a PHYSICAL device notch, not a reading " +
      "direction. Pairing it with a logical padding would be wrong in RTL: " +
      "the rail's side and the inset it reads have to be decided together " +
      "(docs/rtl-plan.md R2).",
  },
  {
    file: "components/BottomNav.test.tsx",
    contains: "safe-area-inset-left",
    why:
      "Asserts the BottomNav rail's physical notch padding, so it stays " +
      "physical for exactly the same reason the source line does.",
  },
  {
    file: "pages/Board.tsx",
    contains: "safe-area-inset-right",
    why:
      "env(safe-area-inset-right) is the PHYSICAL opposite edge from the " +
      "landscape rail: the padding exists to clear a notch, not to follow " +
      "reading order. Which edge it clears flips with the rail, so both " +
      "move together in R2 (docs/rtl-plan.md).",
  },
  {
    file: "pages/Calendar.tsx",
    contains: "safe-area-inset-right",
    why:
      "Same landscape-rail inset as Board.tsx above — physical device edge, " +
      "flips with the rail in R2 (docs/rtl-plan.md).",
  },
  {
    file: "components/MeMenu.tsx",
    contains: "h-dvh w-80",
    why:
      "The drawer's anchor (right-0 + border-l) is inseparable from the " +
      "translate-x-full slide on the next line, and Tailwind has no logical " +
      "translate — flipping one without the other slides the panel in from " +
      "offscreen (docs/rtl-plan.md R2).",
  },
  {
    file: "components/Markdown.tsx",
    contains: "ALIGN_CLASS",
    why:
      "GFM's per-column `:---` alignment is visual and author-chosen, so an " +
      "explicit left/right stays physical. Only the DEFAULT became logical " +
      "(docs/rtl-plan.md R2 — awaiting the operator's call).",
  },
  {
    file: "components/Markdown.tsx",
    contains: 'left: "text-left"',
    why:
      "The ALIGN_CLASS table's own left entry — author-chosen visual " +
      "alignment, physical by design until R2 settles it.",
  },
  {
    file: "components/Markdown.tsx",
    contains: 'right: "text-right"',
    why:
      "The ALIGN_CLASS table's own right entry — author-chosen visual " +
      "alignment, physical by design until R2 settles it.",
  },
  {
    file: "components/Markdown.tsx",
    contains: "font-semibold text-left",
    why:
      "A <th>'s base text-left sits alongside alignClass(), which appends " +
      "its own alignment — so both land on the element and source order " +
      "decides. Latent fragility worth fixing WITH the ALIGN_CLASS call " +
      "in R2, not half-changed here (docs/rtl-plan.md R2).",
  },
  {
    file: "components/MeMenu.tsx",
    contains: "translate-x-full",
    why:
      "The drawer pairs right-0/border-l with translate-x-full for its " +
      "slide-in, and Tailwind has NO logical translate. Anchor side and " +
      "transform must flip together or the panel slides in from offscreen " +
      "(docs/rtl-plan.md R2).",
  },
  {
    file: "components/Markdown.test.tsx",
    contains: "text-left",
    why:
      "Asserts GFM's explicit column alignment, which stays physical until " +
      "the ALIGN_CLASS question is settled in R2.",
  },
  {
    file: "components/Markdown.test.tsx",
    contains: "text-right",
    why:
      "Asserts GFM's explicit column alignment, which stays physical until " +
      "the ALIGN_CLASS question is settled in R2.",
  },
  {
    file: "pages/Conversation.tsx",
    contains: "isMine ?",
    why:
      "Message affordances are placed by AUTHOR, not by layout. Under RTL " +
      '"mine" changes sides, so these need their operands swapped rather ' +
      "than substituted — a semantic change, not a mechanical one " +
      "(docs/rtl-plan.md R2).",
  },
  {
    file: "pages/Conversation.tsx",
    contains: "left-1/2",
    why:
      "Centering idiom (left-1/2 with -translate-x-1/2) is symmetric: it " +
      "already lands in the middle in either direction.",
  },
  {
    file: "pages/Conversation.menuPlacement.test.tsx",
    contains: "left-0",
    why:
      "Asserts the author-dependent menu placement, so it moves with that " +
      "ternary when R2 swaps its operands.",
  },
  {
    file: "pages/Conversation.menuPlacement.test.tsx",
    contains: "right-0",
    why:
      "Asserts the author-dependent menu placement, so it moves with that " +
      "ternary when R2 swaps its operands.",
  },
  {
    file: "components/OverflowMenu.tsx",
    contains: 'align === "right"',
    why:
      "The `align` prop's own vocabulary is physical. Making the classes " +
      'logical without renaming the prop would leave align="right" ' +
      "placing a menu on the left in RTL (docs/rtl-plan.md R2).",
  },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules") continue;
      walk(full, out);
    } else if (name.endsWith(".ts") || name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function licensed(rel: string, line: string): boolean {
  return ALLOWLIST.some((a) => a.file === rel && line.includes(a.contains));
}

describe("RTL: logical horizontal properties only", () => {
  it("no physical horizontal utility outside the documented allowlist", () => {
    const offenders: string[] = [];
    for (const abs of walk(SRC)) {
      const rel = abs.slice(SRC.length + 1).replace(/\\/g, "/");
      // This file spells the physical patterns out as literals.
      if (rel === "lib/logicalProperties.guard.test.ts") continue;
      const lines = readFileSync(abs, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (licensed(rel, line)) return;
        const hits = line.match(PHYSICAL);
        if (hits) {
          offenders.push(`${rel}:${i + 1}  ${hits.join(" ")}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it("every allowlist entry still applies (no stale exemptions)", () => {
    // An exemption that no longer matches anything is dead weight that
    // would silently license a future physical utility in that file.
    const stale: string[] = [];
    for (const a of ALLOWLIST) {
      const abs = join(SRC, a.file);
      let text: string;
      try {
        text = readFileSync(abs, "utf8");
      } catch {
        stale.push(`${a.file} (file is gone)`);
        continue;
      }
      if (!text.includes(a.contains)) {
        stale.push(`${a.file} → ${JSON.stringify(a.contains)}`);
      }
    }
    expect(stale).toEqual([]);
  });

  it("each allowlist entry carries a reason", () => {
    for (const a of ALLOWLIST) {
      expect(a.why.length, `${a.file} needs a why`).toBeGreaterThan(40);
    }
  });
});
