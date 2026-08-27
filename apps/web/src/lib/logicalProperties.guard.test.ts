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
// One exemption is granted by CONSTRUCTION rather than by name: a physical
// utility scoped to Tailwind's `ltr:` or `rtl:` variant is already a
// direction-aware decision — `rtl:pr-[env(safe-area-inset-right)]` says
// "in a right-to-left layout, clear the right-hand notch", which is
// precisely the thought this test exists to require. Those pairs are how
// R2 handled the two things CSS logical properties cannot express: a
// device notch (env() names physical edges) and a translate (Tailwind has
// no logical translate). The pairing assertion below keeps a lone `ltr:`
// from sneaking through as a half-answer.
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

/** Whether a matched token is scoped to a reading direction, e.g.
 *  `landscape-short:rtl:pr-[env(safe-area-inset-right)]`. */
function directionScoped(token: string): boolean {
  return /(?:^|:)(?:ltr|rtl):/.test(token);
}

/** Collapses a physical utility onto its mirror, so `pl-[…left…]` and
 *  `pr-[…right…]` share a key and can be checked for pairing. Arbitrary
 *  values are erased because the two sides differ inside them by design. */
function mirrorKey(token: string): string {
  return token
    .replace(/^(?:[a-z-]+:)*/, "")
    .replace(/\[[^\]]*\]/g, "[]")
    .replace(/(^|-)(?:left|right)(-|$)/g, "$1?$2")
    .replace(/^(-?)([mp])[lr]-/, "$1$2?-")
    .replace(/^(border|rounded|divide|space)-[lr]/, "$1-?");
}

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
    file: "components/Markdown.tsx",
    contains: 'left: "text-left"',
    why:
      "GFM's per-column `:---` is a VISUAL, author-chosen alignment: a " +
      "column of numbers marked `---:` should line up at its right edge in " +
      "Arabic exactly as in English. Settled in R2 — explicit alignment " +
      "stays physical, only the unmarked default became logical.",
  },
  {
    file: "components/Markdown.tsx",
    contains: 'right: "text-right"',
    why:
      "The mirror of the left entry above, and physical for the same " +
      "reason: the author asked for that edge of the page, not for the " +
      "edge their reader's language happens to end at.",
  },
  {
    file: "components/Markdown.test.tsx",
    contains: "text-left",
    why:
      "Asserts GFM's EXPLICIT column alignment, which R2 settled as " +
      "physical. The same file also locks the unmarked default to " +
      "text-start — the half that did have to change.",
  },
  {
    file: "components/Markdown.test.tsx",
    contains: "text-right",
    why:
      "Asserts GFM's explicit right-aligned column — physical by the same " +
      "settled reasoning as the left one, and as the source table it " +
      "mirrors.",
  },
  {
    file: "pages/Conversation.tsx",
    contains: "left-1/2",
    why:
      "Centering idiom (left-1/2 with -translate-x-1/2) is symmetric: it " +
      "already lands in the middle in either direction.",
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

/** Every physical hit in the tree, with where it came from. */
function scan(): Array<{ rel: string; line: number; token: string }> {
  const hits: Array<{ rel: string; line: number; token: string }> = [];
  for (const abs of walk(SRC)) {
    const rel = abs.slice(SRC.length + 1).replace(/\\/g, "/");
    // This file spells the physical patterns out as literals.
    if (rel === "lib/logicalProperties.guard.test.ts") continue;
    readFileSync(abs, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (licensed(rel, line)) return;
        for (const token of line.match(PHYSICAL) ?? []) {
          hits.push({ rel, line: i + 1, token });
        }
      });
  }
  return hits;
}

describe("RTL: logical horizontal properties only", () => {
  it("no physical horizontal utility outside the documented allowlist", () => {
    const offenders = scan()
      // A `ltr:`/`rtl:`-scoped utility IS the direction-aware answer.
      .filter((h) => !directionScoped(h.token))
      .map((h) => `${h.rel}:${h.line}  ${h.token}`);
    expect(offenders).toEqual([]);
  });

  it("every ltr:-scoped utility has an rtl: counterpart in the same file", () => {
    // The construction exemption above is only sound if both halves are
    // written. `ltr:pl-[env(safe-area-inset-left)]` on its own is worse
    // than the physical utility it replaced: it looks considered while
    // leaving right-to-left with no padding at all.
    const byFile = new Map<string, Map<string, { ltr: number; rtl: number }>>();
    for (const h of scan()) {
      if (!directionScoped(h.token)) continue;
      const side = h.token.includes("rtl:") ? "rtl" : "ltr";
      const key = mirrorKey(h.token);
      const perFile = byFile.get(h.rel) ?? new Map();
      byFile.set(h.rel, perFile);
      const counts = perFile.get(key) ?? { ltr: 0, rtl: 0 };
      counts[side] += 1;
      perFile.set(key, counts);
    }
    const unpaired: string[] = [];
    for (const [rel, perFile] of byFile) {
      for (const [key, { ltr, rtl }] of perFile) {
        if (ltr !== rtl) unpaired.push(`${rel}  ${key}  ltr=${ltr} rtl=${rtl}`);
      }
    }
    expect(unpaired).toEqual([]);
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
