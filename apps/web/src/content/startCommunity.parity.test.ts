/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { START_COMMUNITY } from "./startCommunity";
import { START_COMMUNITY_ES } from "./startCommunity.es";
import { START_COMMUNITY_FR } from "./startCommunity.fr";
import { START_COMMUNITY_PT } from "./startCommunity.pt";
import { START_COMMUNITY_ZH } from "./startCommunity.zh";

// Guardrail against translation drift, same discipline as
// faq.parity.test.ts — plus one rule the FAQ doesn't need: the
// walkthrough's terminal blocks must be BYTE-IDENTICAL across
// languages. A translated command is a broken command.

describe.each([
  ["Spanish", START_COMMUNITY_ES],
  ["French", START_COMMUNITY_FR],
  ["Portuguese", START_COMMUNITY_PT],
  ["Chinese", START_COMMUNITY_ZH],
] as const)("Start-a-community guide parity — English ↔ %s", (_localeName, GUIDE_TR) => {
  it("has the same step ids in the same order", () => {
    expect(GUIDE_TR.steps.map((s) => s.id)).toEqual(
      START_COMMUNITY.steps.map((s) => s.id),
    );
  });

  it("has the same paragraph counts per step, intro, and closing", () => {
    expect(GUIDE_TR.intro.length).toBe(
      START_COMMUNITY.intro.length,
    );
    expect(GUIDE_TR.closing.length).toBe(
      START_COMMUNITY.closing.length,
    );
    for (const en of START_COMMUNITY.steps) {
      const tr = GUIDE_TR.steps.find((s) => s.id === en.id)!;
      expect(tr.paragraphs.length, `step ${en.id}`).toBe(
        en.paragraphs.length,
      );
    }
  });

  it("has byte-identical code blocks — commands never translate", () => {
    for (const en of START_COMMUNITY.steps) {
      const tr = GUIDE_TR.steps.find((s) => s.id === en.id)!;
      expect(tr.code ?? [], `step ${en.id}`).toEqual(en.code ?? []);
    }
  });

  it("names the docs that ship inside the download in both languages", () => {
    // The loop only closes if the guide points at the runbooks that
    // ride in the tarball itself, not at URLs on a forge.
    for (const guide of [START_COMMUNITY, GUIDE_TR]) {
      const all = [
        ...guide.intro,
        ...guide.closing,
        ...guide.steps.flatMap((s) => s.paragraphs),
      ].join(" ");
      expect(all).toContain("docs/quickstart.md");
      expect(all).toContain("docs/deploy-linode.md");
      expect(all).toContain("docs/deploy-alternatives.md");
      expect(all).not.toContain("github.com");
    }
  });
});
