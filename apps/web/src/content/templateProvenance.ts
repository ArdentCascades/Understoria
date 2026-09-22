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
import { TEMPLATE_NAMES, TEMPLATE_TASK_NAMES } from "./taskTitleIndex";

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

/** Locales whose template display name is byte-identical to `title`. */
export function matchedNameLocales(
  templateId: string,
  title: string,
): string[] {
  const table = TEMPLATE_NAMES[templateId];
  if (!table) return [];
  return Object.keys(table).filter((code) => table[code] === title);
}

/** The task row `title` byte-matches in the template — null when it
 *  matches nowhere OR at conflicting rows across locales (ambiguity
 *  never substitutes; within one locale uniqueness is corpus-gated in
 *  templateProvenance.test.ts). */
export function matchedTaskRow(
  templateId: string,
  title: string,
): { row: number; locales: string[] } | null {
  const tables = TEMPLATE_TASK_NAMES[templateId];
  if (!tables) return null;
  let row = -1;
  const locales: string[] = [];
  for (const [code, names] of Object.entries(tables)) {
    const idx = names.indexOf(title);
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
): ProvenanceText {
  if (!templateId) return asIs(title);
  const viewer = contentLocale(viewerLocale);
  const locales = matchedNameLocales(templateId, title);
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
): ProvenanceText {
  if (!templateId) return asIs(title);
  const viewer = contentLocale(viewerLocale);
  const match = matchedTaskRow(templateId, title);
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
  tasks: readonly { description: string }[];
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
): ProvenanceText {
  if (!templateId || !description) return asIs(description);
  return verifyAgainstBundles(
    templateId,
    description,
    candidateLocales,
    contentLocale(viewerLocale),
    (tpl) => (tpl ? composeTemplateDescription(tpl) : undefined),
  );
}

/** Same, for a TASK description at a row already fixed by its
 *  title match. */
export function provenanceTaskDescription(
  templateId: string | null,
  row: number,
  description: string,
  candidateLocales: readonly string[],
  viewerLocale: string | undefined,
): ProvenanceText {
  if (!templateId || !description || row < 0) return asIs(description);
  return verifyAgainstBundles(
    templateId,
    description,
    candidateLocales,
    contentLocale(viewerLocale),
    (tpl) => tpl?.tasks[row]?.description,
  );
}
