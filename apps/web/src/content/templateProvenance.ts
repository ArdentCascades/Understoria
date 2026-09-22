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
// Provenance-verified display translation (docs/provenance-translation.md).
//
// A project created from a playbook stores its text as literal strings
// in the organizer's language. When a stored field BYTE-MATCHES the
// shipped playbook corpus — same template, exact bytes, and for tasks
// the same row in every locale that matches — it is provably the
// app's own text, so it may be DISPLAYED in the viewer's language
// from the viewer's own reviewed bundle. Anything else is the
// organizer's writing and renders exactly as signed. Near-match is
// never accepted, nothing in the record is trusted as a claim, and
// the signed record itself is never altered: this module only decides
// what the allowlisted surfaces (see provenance.guard.test.ts) show,
// with the original one toggle away.
import { getContentBundle, contentLocale } from "./registry";
import {
  EVENT_TITLE_SCAFFOLDS,
  TEMPLATE_NAMES,
  TEMPLATE_TASK_NAMES,
} from "./taskTitleIndex";
import { sha256Hex } from "@/lib/sha256";
import {
  TEMPLATE_WORDING_HISTORY,
  type TemplateWordingHistory,
} from "./templateProvenanceHistory";

/** The truncated (128-bit) SHA-256 the wording history stores for
 *  descriptions — one definition shared with the index generator so
 *  runtime matching and generated hashes can never drift. Truncation
 *  keeps the generated files half the size; 128 bits still makes a
 *  crafted second preimage infeasible, which is what licenses a
 *  history match to substitute (docs/provenance-translation.md). */
export function wordingHash(text: string): string {
  return sha256Hex(text).slice(0, 32);
}

/** A single displayable field after provenance checking. `translated`
 *  is true only when `text` came from the viewer's bundle; `original`
 *  always holds the signed bytes. `sourceLocale` is the content
 *  language the original provably belongs to (set exactly when
 *  `translated`), for lang-tagging the toggled original. */
export interface ProvenanceText {
  text: string;
  original: string;
  translated: boolean;
  sourceLocale?: string;
}

const asIs = (s: string): ProvenanceText => ({
  text: s,
  original: s,
  translated: false,
});

/** Locales whose template display name is byte-identical to `title`
 *  — in the current corpus or in the append-only wording history
 *  (docs/provenance-translation.md: a native-review reword must not
 *  orphan projects created under the old wording; display always
 *  uses the CURRENT viewer-language text). `history` is injectable
 *  for tests and defaults to the generated module. */
export function matchedNameLocales(
  templateId: string,
  title: string,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): string[] {
  const table = TEMPLATE_NAMES[templateId];
  if (!table) return [];
  const hist = history[templateId]?.names ?? {};
  return Object.keys(table).filter(
    (code) =>
      table[code] === title || (hist[code]?.includes(title) ?? false),
  );
}

/** The task row `title` byte-matches in the template — null when it
 *  matches nowhere OR at conflicting rows across locales (ambiguity
 *  never substitutes; within one locale uniqueness is corpus-gated in
 *  templateProvenance.test.ts). */
export function matchedTaskRow(
  templateId: string,
  title: string,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): { row: number; locales: string[] } | null {
  const tables = TEMPLATE_TASK_NAMES[templateId];
  if (!tables) return null;
  const hist = history[templateId]?.taskNames ?? {};
  let row = -1;
  const locales: string[] = [];
  for (const [code, names] of Object.entries(tables)) {
    let idx = names.indexOf(title);
    if (idx < 0) {
      // Historical wording: rows are aligned to the CURRENT corpus,
      // so a hit licenses the same row-agreement rule as a live one.
      idx = (hist[code] ?? []).findIndex((olds) => olds.includes(title));
    }
    if (idx < 0) continue;
    if (row >= 0 && idx !== row) return null;
    row = idx;
    locales.push(code);
  }
  return row >= 0 ? { row, locales } : null;
}

/** Viewer-language rendering of a project title, when provenance
 *  verifies. Synchronous: the name tables are eager. */
export function provenanceTitle(
  templateId: string | null,
  title: string,
  viewerLocale: string | undefined,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): ProvenanceText {
  if (!templateId) return asIs(title);
  const viewer = contentLocale(viewerLocale);
  const locales = matchedNameLocales(templateId, title, history);
  if (locales.length === 0 || locales.includes(viewer)) return asIs(title);
  const ours = TEMPLATE_NAMES[templateId]?.[viewer];
  if (!ours) return asIs(title);
  return {
    text: ours,
    original: title,
    translated: true,
    sourceLocale: locales[0],
  };
}

/** Viewer-language rendering of a task title, when provenance
 *  verifies. Synchronous: the task-name tables are eager. */
export function provenanceTaskTitle(
  templateId: string | null,
  title: string,
  viewerLocale: string | undefined,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): ProvenanceText {
  if (!templateId) return asIs(title);
  const viewer = contentLocale(viewerLocale);
  const match = matchedTaskRow(templateId, title, history);
  if (!match || match.locales.includes(viewer)) return asIs(title);
  const ours = TEMPLATE_TASK_NAMES[templateId]?.[viewer]?.[match.row];
  if (!ours) return asIs(title);
  return {
    text: ours,
    original: title,
    translated: true,
    sourceLocale: match.locales[0],
  };
}

/** True when `code`'s bundle is actually loaded (getContentBundle
 *  falls back to the en bundle object for anything unloaded, so
 *  object identity is the honest probe). */
function loaded(code: string): boolean {
  return code === "en" || getContentBundle(code) !== getContentBundle("en");
}

/** Byte-verify `text` against `pick(template)` in each candidate
 *  source locale; on a match, return the viewer-bundle text. The
 *  candidates come from the same surface's title/task matches (the
 *  organizer's language shows up there — nothing is guessed), and
 *  the caller is responsible for ensureContent() on them; an
 *  unloaded candidate compares against the en fallback, which can
 *  only produce a match that is genuinely en's own text — labeled
 *  as en accordingly. */
function verifyAgainstBundles(
  templateId: string,
  text: string,
  candidateLocales: readonly string[],
  viewer: string,
  pick: (tpl: TemplateLike | undefined) => string | undefined,
): ProvenanceText {
  for (const code of candidateLocales) {
    if (code === viewer) continue;
    const theirs = pick(findTemplate(code, templateId));
    if (theirs !== text) continue;
    const ours = pick(findTemplate(viewer, templateId));
    if (!ours || ours === text) return asIs(text);
    return {
      text: ours,
      original: text,
      translated: true,
      sourceLocale: loaded(code) ? code : "en",
    };
  }
  return asIs(text);
}

interface TemplateLike {
  id: string;
  purpose: string;
  whoItServes: string;
  whatYoullNeed: string;
  tasks: readonly { description: string; skills?: readonly string[] }[];
}

function findTemplate(
  code: string,
  templateId: string,
): TemplateLike | undefined {
  return getContentBundle(code).PROJECT_TEMPLATES.find(
    (t) => t.id === templateId,
  );
}

/** The exact description string ProjectNew stages from a template —
 *  the composition is part of the byte-match contract, so it lives
 *  here once and ProjectNew imports it (drift would silently turn
 *  every new project's description "modified"). */
export function composeTemplateDescription(tpl: {
  purpose: string;
  whoItServes: string;
  whatYoullNeed: string;
}): string {
  return `${tpl.purpose}\n\n${tpl.whoItServes}\n\n${tpl.whatYoullNeed}`;
}

/** Viewer-language rendering of the PROJECT description, byte-
 *  verified against the candidate source locales' bundles. */
export function provenanceDescription(
  templateId: string | null,
  description: string,
  candidateLocales: readonly string[],
  viewerLocale: string | undefined,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): ProvenanceText {
  if (!templateId || !description) return asIs(description);
  const viewer = contentLocale(viewerLocale);
  const live = verifyAgainstBundles(
    templateId,
    description,
    candidateLocales,
    viewer,
    (tpl) => (tpl ? composeTemplateDescription(tpl) : undefined),
  );
  if (live.translated) return live;
  // Historical wording: hash membership licenses substitution with
  // the CURRENT viewer text — and needs no source bundle at all.
  const hist = history[templateId]?.descHashes;
  if (!hist) return live;
  const h = wordingHash(description);
  for (const [code, hashes] of Object.entries(hist)) {
    if (code === viewer || !hashes.includes(h)) continue;
    const tpl = findTemplate(viewer, templateId);
    const ours = tpl ? composeTemplateDescription(tpl) : undefined;
    if (!ours || ours === description) return live;
    return {
      text: ours,
      original: description,
      translated: true,
      sourceLocale: code,
    };
  }
  return live;
}

/** Same, for a TASK description at a row already fixed by its
 *  title match. */
export function provenanceTaskDescription(
  templateId: string | null,
  row: number,
  description: string,
  candidateLocales: readonly string[],
  viewerLocale: string | undefined,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): ProvenanceText {
  if (!templateId || !description || row < 0) return asIs(description);
  const viewer = contentLocale(viewerLocale);
  const live = verifyAgainstBundles(
    templateId,
    description,
    candidateLocales,
    viewer,
    (tpl) => tpl?.tasks[row]?.description,
  );
  if (live.translated) return live;
  const hist = history[templateId]?.taskDescHashes;
  if (!hist) return live;
  const h = wordingHash(description);
  for (const [code, rows] of Object.entries(hist)) {
    if (code === viewer || !(rows[row]?.includes(h) ?? false)) continue;
    const ours = findTemplate(viewer, templateId)?.tasks[row]?.description;
    if (!ours || ours === description) return live;
    return {
      text: ours,
      original: description,
      translated: true,
      sourceLocale: code,
    };
  }
  return live;
}

/**
 * Viewer-language rendering of a task's suggested-skill chips, for a
 * task whose row is already fixed by its title match. The byte-exact
 * rule applies PER SKILL: a stored skill translates only when it is,
 * byte for byte, one of a source bundle's skills for this same task
 * row — the aligned per-locale lists make the position the bridge.
 * A skill the organizer added or reworded matches nothing and stays
 * verbatim, exactly like every other member-authored string
 * (field report: an English-created template task showed
 * "outreach"/"paperwork" to a Chinese viewer whose bundle carries
 * 外联/办手续 for that very row).
 */
export function provenanceTaskSkills(
  templateId: string | null,
  row: number,
  skills: readonly string[],
  candidateLocales: readonly string[],
  viewerLocale: string | undefined,
): readonly string[] {
  if (!templateId || row < 0 || skills.length === 0) return skills;
  const viewer = contentLocale(viewerLocale);
  const ours = findTemplate(viewer, templateId)?.tasks[row]?.skills;
  if (!ours || ours.length === 0) return skills;
  let any = false;
  const out = skills.map((skill) => {
    for (const code of candidateLocales) {
      if (code === viewer) continue;
      const theirs = findTemplate(code, templateId)?.tasks[row]?.skills;
      const idx = theirs?.indexOf(skill) ?? -1;
      if (idx < 0) continue;
      const translated = ours[idx];
      if (translated && translated !== skill) {
        any = true;
        return translated;
      }
      return skill;
    }
    return skill;
  });
  return any ? out : skills;
}

// ---- Event templates (docs/provenance-translation.md, phase 2c) ----
//
// An event stages title = the template's titleScaffold (which ends
// " — "; the member's own words follow) and description = the
// descriptionScaffold verbatim until edited. So descriptions get the
// same byte-exact rule as projects, and titles get the SCAFFOLD
// COMPOSITION rule: when the stored title starts with a locale's
// scaffold (current or historical), the scaffold segment is provably
// app text and renders as the viewer's scaffold, while the member's
// suffix stays verbatim, always. The longest matching scaffold wins
// (a longer byte-exact prefix is strictly more evidence); the suffix
// is member text embedded mid-string, so per-segment lang tagging is
// impossible — the marker on the event page owns the disclosure.

/** The longest current-or-historical scaffold `title` starts with,
 *  with every locale that carries a scaffold of that exact text. */
export function matchedEventScaffold(
  templateId: string,
  title: string,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): { scaffold: string; locales: string[] } | null {
  const table = EVENT_TITLE_SCAFFOLDS[templateId];
  if (!table) return null;
  const hist = history[templateId]?.eventScaffolds ?? {};
  let best: { scaffold: string; locales: string[] } | null = null;
  const consider = (code: string, scaffold: string) => {
    if (!scaffold || !title.startsWith(scaffold)) return;
    if (best && scaffold.length < best.scaffold.length) return;
    if (best && scaffold.length === best.scaffold.length) {
      if (!best.locales.includes(code)) best.locales.push(code);
      return;
    }
    best = { scaffold, locales: [code] };
  };
  for (const [code, scaffold] of Object.entries(table)) {
    consider(code, scaffold);
    for (const old of hist[code] ?? []) consider(code, old);
  }
  return best;
}

/** Viewer-language rendering of an event title: the matched scaffold
 *  segment substitutes, the member's suffix stays verbatim. */
export function provenanceEventTitle(
  templateId: string | null,
  title: string,
  viewerLocale: string | undefined,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): ProvenanceText {
  if (!templateId) return asIs(title);
  const viewer = contentLocale(viewerLocale);
  const match = matchedEventScaffold(templateId, title, history);
  if (!match) return asIs(title);
  const ours = EVENT_TITLE_SCAFFOLDS[templateId]?.[viewer];
  if (!ours) return asIs(title);
  const text = ours + title.slice(match.scaffold.length);
  if (text === title) return asIs(title);
  return {
    text,
    original: title,
    translated: true,
    sourceLocale: match.locales[0],
  };
}

/** Viewer-language rendering of an event description, byte-verified
 *  against the candidate locales' descriptionScaffold (or the
 *  wording history's hashes — no source bundle needed there). */
export function provenanceEventDescription(
  templateId: string | null,
  description: string,
  candidateLocales: readonly string[],
  viewerLocale: string | undefined,
  history: Record<string, TemplateWordingHistory> = TEMPLATE_WORDING_HISTORY,
): ProvenanceText {
  if (!templateId || !description) return asIs(description);
  const viewer = contentLocale(viewerLocale);
  const findEvent = (code: string) =>
    getContentBundle(code).EVENT_TEMPLATES.find((t) => t.id === templateId);
  for (const code of candidateLocales) {
    if (code === viewer) continue;
    const theirs = findEvent(code)?.descriptionScaffold;
    if (theirs !== description) continue;
    const ours = findEvent(viewer)?.descriptionScaffold;
    if (!ours || ours === description) return asIs(description);
    return {
      text: ours,
      original: description,
      translated: true,
      sourceLocale: loaded(code) ? code : "en",
    };
  }
  const hist = history[templateId]?.eventDescHashes;
  if (!hist) return asIs(description);
  const h = wordingHash(description);
  for (const [code, hashes] of Object.entries(hist)) {
    if (code === viewer || !hashes.includes(h)) continue;
    const ours = findEvent(viewer)?.descriptionScaffold;
    if (!ours || ours === description) return asIs(description);
    return {
      text: ours,
      original: description,
      translated: true,
      sourceLocale: code,
    };
  }
  return asIs(description);
}
