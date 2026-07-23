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
// Source guard (printChrome.guard style) for the pending-author link
// gate: every `<Markdown` call site under src/pages + src/components
// must pass `authorKey`, so a future federated surface can't silently
// forget the gate. A surface may only skip it by joining the explicit
// allowlist below WITH an in-source comment saying why the author key
// is genuinely unavailable.
//
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "..");

// Call sites deliberately WITHOUT authorKey — each carries a comment
// at the call site explaining why. Currently empty: TaskDetailBody's
// task description (ProjectTask has no author field) is gated through
// the PRIMARY organizer's key as the conservative proxy — without it,
// a pending member could route clickable links through task
// descriptions, bypassing the gate everywhere else.
const ALLOWLIST = new Set<string>([]);

function sourceFiles(dir: string): string[] {
  return readdirSync(join(SRC, dir))
    .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
    .map((f) => `${dir}/${f}`);
}

describe("Markdown authorKey contract", () => {
  const files = [...sourceFiles("pages"), ...sourceFiles("components")];

  it("scans a non-empty file set that includes the known call sites", () => {
    expect(files).toContain("pages/PostDetail.tsx");
    expect(files).toContain("components/TaskComments.tsx");
  });

  it.each(files)("%s: every <Markdown usage passes authorKey", (rel) => {
    const source = readFileSync(join(SRC, rel), "utf8");
    // `\b` keeps <MarkdownHint and <MarkdownLink out; [^>]* is safe
    // because Markdown props never contain a bare `>`.
    const usages = source.match(/<Markdown\b[^>]*>/g) ?? [];
    for (const usage of usages) {
      if (ALLOWLIST.has(rel)) continue;
      expect(
        usage.includes("authorKey"),
        `${rel} renders federated markdown without authorKey — thread the ` +
          `content author's signing key so the pending-author link gate ` +
          `applies, or allowlist the call site with a why-comment`,
      ).toBe(true);
    }
  });

  it("the allowlist stays honest: listed files still contain an un-gated usage", () => {
    for (const rel of ALLOWLIST) {
      const source = readFileSync(join(SRC, rel), "utf8");
      const usages = source.match(/<Markdown\b[^>]*>/g) ?? [];
      expect(usages.some((u) => !u.includes("authorKey"))).toBe(true);
    }
  });
});
