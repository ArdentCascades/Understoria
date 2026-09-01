/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
//
// README drift guard (docs/readme-plan.md, step R1).
//
// The README is read by three audiences — an organizer deciding whether to
// bring this to their group, a developer deciding whether to contribute,
// and an agent asked to edit the file later. All three are hurt the same
// way when it makes a claim the code stopped supporting, and none of them
// can tell by reading.
//
// Three claims had already gone false before this test existed:
//
//   - "Spanish translation", while languages.ts carried eight languages.
//   - "tweetnacl / libsodium.js", while libsodium was not a dependency.
//   - Automerge credited among "projects that make this possible", while
//     it was not a dependency either.
//
// Each was true when written. That is the point: prose has no compiler,
// so the numbers it quotes need one. Everything asserted below is a claim
// the README makes that some file in this repository decides.
//
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LANGUAGES } from "@/i18n/languages";
import { PROJECT_TEMPLATES_EN } from "@/content/projectTemplates.en";
import { MINIMUM_VOUCHES_FOR_TRUST } from "@/lib/vouch";

const ROOT = join(__dirname, "..", "..", "..", "..");
const README = readFileSync(join(ROOT, "README.md"), "utf8");

/** The README writes small numbers as words, the way prose does. */
const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
] as const;

/** Counts above the small-number range the README spells out in words. */
const BIG_WORDS: Record<number, string> = {
  30: "thirty",
  31: "thirty-one",
  32: "thirty-two",
  33: "thirty-three",
};

function word(n: number): string {
  return WORDS[n] ?? BIG_WORDS[n] ?? String(n);
}

/** Every package.json in the workspace, as one dependency name set. */
function allDependencyNames(): Set<string> {
  const names = new Set<string>();
  const manifests = [join(ROOT, "package.json")];
  for (const group of ["apps", "packages"]) {
    const dir = join(ROOT, group);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const m = join(dir, entry, "package.json");
      if (existsSync(m)) manifests.push(m);
    }
  }
  for (const m of manifests) {
    const pkg = JSON.parse(readFileSync(m, "utf8")) as Record<string, unknown>;
    for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
      const deps = pkg[field];
      if (deps && typeof deps === "object") {
        for (const name of Object.keys(deps as object)) names.add(name);
      }
    }
  }
  return names;
}

describe("README: claims the code decides", () => {
  it("states the number of shipped languages correctly", () => {
    // The failure this test was written for. Eight languages shipped and
    // the front page said one, because the roadmap existed in two places
    // and only one copy was maintained.
    expect(README).toContain(`${word(LANGUAGES.length)} languages`);
  });

  it("names only languages that are actually in the registry", () => {
    const endonymByEnglishName: Record<string, string> = {
      English: "en",
      Spanish: "es",
      French: "fr",
      Portuguese: "pt",
      Chinese: "zh",
      Hindi: "hi",
      Vietnamese: "vi",
      Russian: "ru",
      Arabic: "ar",
      Tibetan: "bo",
      Urdu: "ur",
      Indonesian: "id",
    };
    const shipped = new Set<string>(LANGUAGES.map((l) => l.code));
    const claimed = Object.entries(endonymByEnglishName)
      .filter(([name]) => new RegExp(`\\b${name}\\b`).test(README))
      .map(([, code]) => code);
    // Every language the README names by name must be one we ship. A
    // language we ship but do not name is fine — the bullet is prose,
    // not an inventory.
    expect(claimed.filter((c) => !shipped.has(c))).toEqual([]);
  });

  it("states the project-template count correctly", () => {
    expect(README).toContain(`${PROJECT_TEMPLATES_EN.length} playbooks`);
  });

  it("states the vouch threshold correctly", () => {
    expect(README).toContain(
      `${word(MINIMUM_VOUCHES_FOR_TRUST)} vouches`,
    );
  });

  it("states the number of design principles correctly", () => {
    const src = readFileSync(
      join(ROOT, "apps", "web", "src", "content", "design-principles.ts"),
      "utf8",
    );
    const count = (src.match(/^ {4}id: "/gm) ?? []).length;
    expect(count, "no principles found — did the file move?").toBeGreaterThan(0);
    expect(README).toContain(`${word(count)} named design principles`);
  });

  it("states how many screens carry the why control correctly", () => {
    // The member-facing half of the principles claim: a "why" control on
    // the surfaces that could have shown a score or a ranking.
    const webSrc = join(ROOT, "apps", "web", "src");
    let screens = 0;
    const walk = (dir: string) => {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, name.name);
        if (name.isDirectory()) walk(full);
        else if (name.name.endsWith(".tsx") && readFileSync(full, "utf8").includes("WhyTooltip"))
          screens += 1;
      }
    };
    walk(webSrc);
    // Case-insensitive: prose may open a sentence with the number.
    expect(README.toLowerCase()).toContain(
      `${word(screens)} screens carry`.toLowerCase(),
    );
  });

  it("states the community node's default port correctly", () => {
    const config = readFileSync(
      join(ROOT, "apps", "server", "src", "config.ts"),
      "utf8",
    );
    const m = config.match(/asInt\("PORT",\s*env\.PORT,\s*(\d+)\)/);
    expect(m, "could not find the PORT default in config.ts").toBeTruthy();
    expect(README).toContain(`port ${m![1]}`);
  });

  it("names no library that is not actually a dependency", () => {
    // A watchlist rather than a scan of every word: these are the
    // crypto and convergent-data libraries a README for this project
    // plausibly mentions, and two of them were being claimed falsely.
    const WATCHED = [
      "tweetnacl",
      "libsodium",
      "automerge",
      "yjs",
      "dexie",
      "fastify",
      "workbox",
    ];
    const deps = allDependencyNames();
    const offenders: string[] = [];
    for (const name of WATCHED) {
      // Only a bare mention counts, not a link to the project's homepage —
      // crediting an influence is not the same as claiming a dependency.
      const mentioned = new RegExp(`\`${name}[\\w.-]*\``, "i").test(README);
      if (!mentioned) continue;
      const present = [...deps].some((d) =>
        d.toLowerCase().includes(name.toLowerCase()),
      );
      if (!present) offenders.push(name);
    }
    expect(offenders).toEqual([]);
  });
});

describe("README: structure that keeps it maintainable", () => {
  it("every relative link resolves", () => {
    const broken: string[] = [];
    for (const m of README.matchAll(/\]\(([^)#][^)]*)\)/g)) {
      const target = m[1].split("#")[0];
      if (!target || /^(https?:|mailto:)/.test(target)) continue;
      if (!existsSync(join(ROOT, target))) broken.push(target);
    }
    expect(broken).toEqual([]);
  });

  it("every image path resolves", () => {
    const broken: string[] = [];
    for (const m of README.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)) {
      const src = m[1];
      if (/^https?:/.test(src)) continue;
      if (!existsSync(join(ROOT, src))) broken.push(src);
    }
    expect(broken).toEqual([]);
  });

  it("every in-page anchor points at a heading that exists", () => {
    // The table of contents at the top is hand-maintained, and renaming
    // a section silently breaks it — "Quick Start" became "Run it
    // yourself" and the link kept pointing at nothing. GitHub's slug
    // rule: lowercase, spaces to hyphens, punctuation dropped.
    const slugs = new Set(
      [...README.matchAll(/^#{2,3} (.+)$/gm)].map((m) =>
        m[1]
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      ),
    );
    const dangling = [...README.matchAll(/href="#([a-z0-9-]+)"/g)]
      .map((m) => m[1])
      .filter((a) => !slugs.has(a));
    expect(dangling).toEqual([]);
  });

  it("keeps the roadmap a summary rather than a second copy", () => {
    // docs/roadmap.md is the source of truth. The README's roadmap was
    // once a 61-line paste of it, which is exactly where the stale
    // language claim survived: two copies, one maintained. Checkbox
    // lists are the shape that paste takes.
    const roadmap = README.slice(README.indexOf("## Roadmap"));
    const checkboxes = roadmap.match(/^- \[[ x]\]/gm) ?? [];
    expect(
      checkboxes.length,
      "the README roadmap is growing a checklist again — it belongs in docs/roadmap.md",
    ).toBe(0);
  });

  it("uses no undefined internal shorthand", () => {
    // "Agent 7" meant something to the people who wrote the roadmap and
    // nothing to anyone else. A model reading it is likelier to invent a
    // meaning than to notice it is missing one.
    expect(README.match(/\bAgents?\s+\d+[a-z]?\b/g) ?? []).toEqual([]);
  });
});
