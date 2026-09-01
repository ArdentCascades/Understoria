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
import { describe, expect, it } from "vitest";
import { MEMBER_GUIDE, type GuideSection } from "./member-guide";
import { OPSEC_GUIDE } from "./opsec-guide";
import { STUDY_PROMPTS, type StudyPrompt } from "./study-prompts";
import { MEMBER_GUIDE_ES } from "./member-guide.es";
import { MEMBER_GUIDE_FR } from "./member-guide.fr";
import { MEMBER_GUIDE_PT } from "./member-guide.pt";
import { MEMBER_GUIDE_ZH } from "./member-guide.zh";
import { MEMBER_GUIDE_HI } from "./member-guide.hi";
import { MEMBER_GUIDE_VI } from "./member-guide.vi";
import { MEMBER_GUIDE_RU } from "./member-guide.ru";
import { MEMBER_GUIDE_AR } from "./member-guide.ar";
import { MEMBER_GUIDE_BO } from "./member-guide.bo";
import { MEMBER_GUIDE_UR } from "./member-guide.ur";
import { OPSEC_GUIDE_ES } from "./opsec-guide.es";
import { OPSEC_GUIDE_FR } from "./opsec-guide.fr";
import { OPSEC_GUIDE_PT } from "./opsec-guide.pt";
import { OPSEC_GUIDE_ZH } from "./opsec-guide.zh";
import { OPSEC_GUIDE_HI } from "./opsec-guide.hi";
import { OPSEC_GUIDE_VI } from "./opsec-guide.vi";
import { OPSEC_GUIDE_RU } from "./opsec-guide.ru";
import { OPSEC_GUIDE_AR } from "./opsec-guide.ar";
import { OPSEC_GUIDE_BO } from "./opsec-guide.bo";
import { OPSEC_GUIDE_UR } from "./opsec-guide.ur";
import { STUDY_PROMPTS_ES } from "./study-prompts.es";
import { STUDY_PROMPTS_FR } from "./study-prompts.fr";
import { STUDY_PROMPTS_PT } from "./study-prompts.pt";
import { STUDY_PROMPTS_ZH } from "./study-prompts.zh";
import { STUDY_PROMPTS_HI } from "./study-prompts.hi";
import { STUDY_PROMPTS_VI } from "./study-prompts.vi";
import { STUDY_PROMPTS_RU } from "./study-prompts.ru";
import { STUDY_PROMPTS_AR } from "./study-prompts.ar";
import { STUDY_PROMPTS_BO } from "./study-prompts.bo";
import { STUDY_PROMPTS_UR } from "./study-prompts.ur";

// Guardrail against translation drift for the guide corpus (member
// guide, opsec guide, study prompts) — same posture as
// design-principles.parity.test.ts: section ids are stable anchors,
// LearnSection renders in file order, and a member comparing notes
// with a neighbor on another language expects the same section at
// the same position. Adding or reordering a section in an English
// file without mirroring every translation is a CI failure, not a
// quiet regression.

const GUIDE_LOCALES: ReadonlyArray<
  [string, readonly GuideSection[], readonly GuideSection[]]
> = [
  ["Spanish", MEMBER_GUIDE_ES, OPSEC_GUIDE_ES],
  ["French", MEMBER_GUIDE_FR, OPSEC_GUIDE_FR],
  ["Portuguese", MEMBER_GUIDE_PT, OPSEC_GUIDE_PT],
  ["Chinese", MEMBER_GUIDE_ZH, OPSEC_GUIDE_ZH],
  ["Hindi", MEMBER_GUIDE_HI, OPSEC_GUIDE_HI],
  ["Vietnamese", MEMBER_GUIDE_VI, OPSEC_GUIDE_VI],
  ["Russian", MEMBER_GUIDE_RU, OPSEC_GUIDE_RU],
  ["Arabic", MEMBER_GUIDE_AR, OPSEC_GUIDE_AR],
  ["Tibetan", MEMBER_GUIDE_BO, OPSEC_GUIDE_BO],
  ["Urdu", MEMBER_GUIDE_UR, OPSEC_GUIDE_UR],
];

const PROMPT_LOCALES: ReadonlyArray<[string, readonly StudyPrompt[]]> = [
  ["Spanish", STUDY_PROMPTS_ES],
  ["French", STUDY_PROMPTS_FR],
  ["Portuguese", STUDY_PROMPTS_PT],
  ["Chinese", STUDY_PROMPTS_ZH],
  ["Hindi", STUDY_PROMPTS_HI],
  ["Vietnamese", STUDY_PROMPTS_VI],
  ["Russian", STUDY_PROMPTS_RU],
  ["Arabic", STUDY_PROMPTS_AR],
  ["Tibetan", STUDY_PROMPTS_BO],
  ["Urdu", STUDY_PROMPTS_UR],
];

function checkGuideAgainstEnglish(
  localeName: string,
  guideName: string,
  en: readonly GuideSection[],
  tr: readonly GuideSection[],
) {
  it(`${guideName}: same section ids, in the same order`, () => {
    expect(tr.map((s) => s.id)).toEqual(en.map((s) => s.id));
  });

  it(`${guideName}: same paragraph count per section`, () => {
    // Translation is paragraph-by-paragraph: merging or splitting
    // paragraphs silently diverges the reading experience and makes
    // future English edits impossible to mirror confidently.
    for (const s of tr) {
      const source = en.find((e) => e.id === s.id);
      expect(
        s.body.length,
        `${localeName} ${guideName} ${s.id} paragraph count`,
      ).toBe(source?.body.length);
    }
  });

  it(`${guideName}: no empty strings, prose actually translated`, () => {
    const enById = new Map(en.map((s) => [s.id, s]));
    for (const s of tr) {
      const source = enById.get(s.id)!;
      expect(s.title, `${localeName} ${guideName} ${s.id} title`).not.toBe("");
      s.body.forEach((paragraph, i) => {
        expect(
          paragraph,
          `${localeName} ${guideName} ${s.id} paragraph ${i}`,
        ).not.toBe("");
        expect(
          paragraph,
          `${localeName} ${guideName} ${s.id} paragraph ${i} still English`,
        ).not.toBe(source.body[i]);
      });
    }
  });

  it(`${guideName}: ids stay ASCII anchors`, () => {
    for (const s of tr) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
}

describe.each(GUIDE_LOCALES)(
  "guide parity — English ↔ %s",
  (localeName, memberGuide, opsecGuide) => {
    checkGuideAgainstEnglish(
      localeName,
      "member guide",
      MEMBER_GUIDE,
      memberGuide,
    );
    checkGuideAgainstEnglish(localeName, "opsec guide", OPSEC_GUIDE, opsecGuide);
  },
);

describe.each(PROMPT_LOCALES)(
  "study-prompt parity — English ↔ %s",
  (localeName, prompts) => {
    it("same prompt ids, in the same order", () => {
      expect(prompts.map((p) => p.id)).toEqual(STUDY_PROMPTS.map((p) => p.id));
    });

    it("themes are byte-identical to English", () => {
      // Theme is a machine key (union type, potential future
      // grouping), never prose.
      const en = new Map(STUDY_PROMPTS.map((p) => [p.id, p]));
      for (const p of prompts) {
        expect(p.theme, `${localeName} ${p.id} theme`).toBe(
          en.get(p.id)!.theme,
        );
      }
    });

    it("bodies are non-empty and actually translated", () => {
      const en = new Map(STUDY_PROMPTS.map((p) => [p.id, p]));
      for (const p of prompts) {
        expect(p.body, `${localeName} ${p.id} body`).not.toBe("");
        expect(p.body, `${localeName} ${p.id} body still English`).not.toBe(
          en.get(p.id)!.body,
        );
      }
    });
  },
);
