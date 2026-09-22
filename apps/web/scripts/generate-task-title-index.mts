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
// Regenerates src/content/taskTitleIndex.ts from the content bundles.
// Run `npm run generate:task-index` (tsx) after ANY change to template
// names or task names in any language — including adding a language:
// this script, not hand-splicing, is how the index stays complete.
// The locale list and its order come from content/registry.ts so the
// emitted tables always match what the app can actually load.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "content", "taskTitleIndex.ts");

const registry = readFileSync(
  join(ROOT, "src", "content", "registry.ts"),
  "utf8",
);
const locales = [...registry.matchAll(/^ {2}(\w+): \(\) =>/gm)].map(
  (m) => m[1],
);
if (!locales.includes("en") || locales.length < 2) {
  throw new Error(`registry parse failed: ${locales.join(",")}`);
}

interface Tpl {
  id: string;
  name: string;
  suggestsWorkDays?: boolean;
  tasks: readonly { name: string }[];
}
interface EvTpl {
  id: string;
  titleScaffold: string;
  descriptionScaffold: string;
}

const names: Record<string, Record<string, string>> = {};
const taskNames: Record<string, Record<string, readonly string[]>> = {};
const workDays: Record<string, boolean> = {};
const eventScaffolds: Record<string, Record<string, string>> = {};

for (const code of locales) {
  const bundle = (await import(
    join(ROOT, "src", "content", "bundles", `${code}.ts`)
  )) as {
    PROJECT_TEMPLATES: readonly Tpl[];
    EVENT_TEMPLATES: readonly EvTpl[];
  };
  for (const tpl of bundle.PROJECT_TEMPLATES) {
    (taskNames[tpl.id] ??= {})[code] = tpl.tasks.map((t) => t.name);
    (names[tpl.id] ??= {})[code] = tpl.name;
    // Sparse like the hand-rolled table: only templates that carry
    // the flag appear; absent reads as falsy at every call site.
    if (code === "en" && tpl.suggestsWorkDays) workDays[tpl.id] = true;
  }
  for (const ev of bundle.EVENT_TEMPLATES) {
    (eventScaffolds[ev.id] ??= {})[code] = ev.titleScaffold;
  }
}

// Every template must exist in every locale (the parity gates
// guarantee it; fail loudly here rather than emit a partial index).
for (const [id, tables] of Object.entries(taskNames)) {
  const missing = locales.filter((c) => !tables[c]);
  if (missing.length) {
    throw new Error(`${id} missing locales: ${missing.join(",")}`);
  }
}

const HEADER = `/*
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
// GENERATED eager index — regenerate with \`npm run generate:task-index\`
// whenever template names or task names change in ANY language (drift
// is CI-pinned in taskTitleIndex.test.ts). Per-template task-name and
// display-name tables for every content language, plus the structural
// suggestsWorkDays flag. Kept eager and tiny so title->index recovery
// (tips/steps on a project created in another locale), the work-day
// hint, and provenance-verified display translation
// (docs/provenance-translation.md) never need a lazy content bundle.
`;

let out = HEADER;
out +=
  "export const TEMPLATE_TASK_NAMES: Record<\n  string,\n  Record<string, readonly string[]>\n> = ";
out += JSON.stringify(taskNames, null, 2);
out +=
  ";\n\nexport const TEMPLATE_SUGGESTS_WORK_DAYS: Record<string, boolean> = ";
out += JSON.stringify(workDays, null, 2);
out +=
  ";\n\n// Template display names in every content language — the match table\n// for provenance-verified translation of an unmodified project title\n// (docs/provenance-translation.md).\nexport const TEMPLATE_NAMES: Record<\n  string,\n  Record<string, string>\n> = ";
out += JSON.stringify(names, null, 2);
out +=
  ";\n\n// Event-template title scaffolds in every content language — the\n// prefix-match table for provenance-verified translation of an event\n// title's app-authored segment (the scaffold ends \" — \" and the\n// member's own words follow verbatim; docs/provenance-translation.md).\nexport const EVENT_TITLE_SCAFFOLDS: Record<\n  string,\n  Record<string, string>\n> = ";
out += JSON.stringify(eventScaffolds, null, 2);
out += ";\n";
writeFileSync(OUT, out);
console.log(
  `taskTitleIndex.ts: ${Object.keys(taskNames).length} templates × ${locales.length} locales (names + task names + workDays)`,
);

// ---- Historical wording sets (docs/provenance-translation.md) ----
// Projects store template text as literal strings at creation time.
// When a wording changes (native review, en edits), projects created
// under the OLD wording would stop byte-matching and silently fall
// back to the organizer's language. So each regeneration diffs the
// new corpus against the PREVIOUS generated files and appends every
// vanished wording to an append-only history: plaintext for names
// and task names (they were in the old index), SHA-256 hashes for
// descriptions (only their hashes exist outside the bundles, via the
// manifest below). Runtime matching consults the history; display
// always uses the CURRENT viewer-language text. Structural changes
// (a template's task count changing) are breaking by design: history
// for that template/locale's tasks is dropped with a warning and old
// projects fall back honestly.
import {
  composeTemplateDescription,
  wordingHash,
} from "../src/content/templateProvenance";
import { TEMPLATE_WORDING_HISTORY as OLD_HISTORY } from "../src/content/templateProvenanceHistory";
import { TEMPLATE_DESC_MANIFEST as OLD_MANIFEST } from "../src/content/templateProvenanceManifest";
import * as OLD_INDEX from "../src/content/taskTitleIndex";
const OLD_NAMES = OLD_INDEX.TEMPLATE_NAMES;
const OLD_TASK_NAMES = OLD_INDEX.TEMPLATE_TASK_NAMES;
// Tolerate an index generated before event scaffolds existed.
const OLD_EVENT_SCAFFOLDS: Record<string, Record<string, string>> =
  (OLD_INDEX as { EVENT_TITLE_SCAFFOLDS?: Record<string, Record<string, string>> })
    .EVENT_TITLE_SCAFFOLDS ?? {};

interface Hist {
  names?: Record<string, string[]>;
  taskNames?: Record<string, string[][]>;
  descHashes?: Record<string, string[]>;
  taskDescHashes?: Record<string, string[][]>;
  eventScaffolds?: Record<string, string[]>;
  eventDescHashes?: Record<string, string[]>;
}

// Current-corpus manifest (per template, per locale): the description
// composition hash and per-row task-description hashes.
const manifest: Record<
  string,
  Record<string, { d?: string; t?: string[]; e?: string }>
> = {};
for (const code of locales) {
  const bundle = (await import(
    join(ROOT, "src", "content", "bundles", `${code}.ts`)
  )) as {
    PROJECT_TEMPLATES: readonly (Tpl & {
      purpose: string;
      whoItServes: string;
      whatYoullNeed: string;
      tasks: readonly { name: string; description: string }[];
    })[];
    EVENT_TEMPLATES: readonly EvTpl[];
  };
  for (const tpl of bundle.PROJECT_TEMPLATES) {
    (manifest[tpl.id] ??= {})[code] = {
      d: wordingHash(composeTemplateDescription(tpl)),
      t: tpl.tasks.map((task) => wordingHash(task.description)),
    };
  }
  // Event templates share the map, and the id namespaces are NOT
  // disjoint (skill-share and repair-cafe exist as both) — safety
  // comes from field-level namespacing instead: d/t and the
  // name/task history keys are project data, e and the event history
  // keys are event data, so a shared id never mixes the two.
  for (const ev of bundle.EVENT_TEMPLATES) {
    (manifest[ev.id] ??= {})[code] = {
      e: wordingHash(ev.descriptionScaffold),
    };
  }
}

const history: Record<string, Hist> = {};
// Carry forward existing history, pruning entries that equal the
// CURRENT text/hash again (a revert makes them redundant).
const push = (arr: string[], v: string, current: string | undefined) => {
  if (v !== current && v && !arr.includes(v)) arr.push(v);
};
for (const [tid, h] of Object.entries(OLD_HISTORY as Record<string, Hist>)) {
  const out: Hist = {};
  for (const [code, olds] of Object.entries(h.names ?? {})) {
    const arr: string[] = [];
    for (const v of olds) push(arr, v, names[tid]?.[code]);
    if (arr.length) (out.names ??= {})[code] = arr;
  }
  for (const [code, rows] of Object.entries(h.taskNames ?? {})) {
    const cur = taskNames[tid]?.[code];
    if (!cur || rows.length !== cur.length) continue; // structural change
    const outRows = rows.map((row, i) => {
      const arr: string[] = [];
      for (const v of row) push(arr, v, cur[i]);
      return arr;
    });
    if (outRows.some((r) => r.length)) (out.taskNames ??= {})[code] = outRows;
  }
  for (const [code, olds] of Object.entries(h.descHashes ?? {})) {
    const arr: string[] = [];
    for (const v of olds) push(arr, v, manifest[tid]?.[code]?.d);
    if (arr.length) (out.descHashes ??= {})[code] = arr;
  }
  for (const [code, rows] of Object.entries(h.taskDescHashes ?? {})) {
    const cur = manifest[tid]?.[code]?.t;
    if (!cur || rows.length !== cur.length) continue;
    const outRows = rows.map((row, i) => {
      const arr: string[] = [];
      for (const v of row) push(arr, v, cur[i]);
      return arr;
    });
    if (outRows.some((r) => r.length))
      (out.taskDescHashes ??= {})[code] = outRows;
  }
  for (const [code, olds] of Object.entries(h.eventScaffolds ?? {})) {
    const arr: string[] = [];
    for (const v of olds) push(arr, v, eventScaffolds[tid]?.[code]);
    if (arr.length) (out.eventScaffolds ??= {})[code] = arr;
  }
  for (const [code, olds] of Object.entries(h.eventDescHashes ?? {})) {
    const arr: string[] = [];
    for (const v of olds) push(arr, v, manifest[tid]?.[code]?.e);
    if (arr.length) (out.eventDescHashes ??= {})[code] = arr;
  }
  if (Object.keys(out).length) history[tid] = out;
}
// Append wordings that just vanished (old generated files vs new
// corpus).
for (const [tid, tables] of Object.entries(
  OLD_NAMES as Record<string, Record<string, string>>,
)) {
  for (const [code, oldName] of Object.entries(tables)) {
    if (names[tid]?.[code] !== undefined && oldName !== names[tid][code]) {
      const h = (history[tid] ??= {});
      const arr = ((h.names ??= {})[code] ??= []);
      push(arr, oldName, names[tid][code]);
    }
  }
}
for (const [tid, tables] of Object.entries(
  OLD_TASK_NAMES as Record<string, Record<string, readonly string[]>>,
)) {
  for (const [code, oldRows] of Object.entries(tables)) {
    const cur = taskNames[tid]?.[code];
    if (!cur) continue;
    if (oldRows.length !== cur.length) {
      if (history[tid]?.taskNames?.[code] || oldRows.length) {
        console.warn(
          `history: ${tid} (${code}) task count changed ${oldRows.length}→${cur.length} — task history dropped (structural change falls back)`,
        );
      }
      continue;
    }
    const h = (history[tid] ??= {});
    const rows = ((h.taskNames ??= {})[code] ??= cur.map(() => []));
    oldRows.forEach((oldName, i) => push(rows[i], oldName, cur[i]));
    if (!rows.some((r) => r.length)) delete h.taskNames[code];
  }
}
for (const [tid, tables] of Object.entries(OLD_EVENT_SCAFFOLDS)) {
  for (const [code, oldScaffold] of Object.entries(tables)) {
    const cur = eventScaffolds[tid]?.[code];
    if (cur !== undefined && oldScaffold !== cur) {
      const h = (history[tid] ??= {});
      push(((h.eventScaffolds ??= {})[code] ??= []), oldScaffold, cur);
    }
  }
}
for (const [tid, tables] of Object.entries(
  OLD_MANIFEST as Record<
    string,
    Record<string, { d?: string; t?: string[]; e?: string }>
  >,
)) {
  for (const [code, old] of Object.entries(tables)) {
    const cur = manifest[tid]?.[code];
    if (!cur) continue;
    const h = (history[tid] ??= {});
    if (old.d && cur.d && old.d !== cur.d) {
      push(((h.descHashes ??= {})[code] ??= []), old.d, cur.d);
    }
    if (old.t && cur.t && old.t.length === cur.t.length) {
      const rows = ((h.taskDescHashes ??= {})[code] ??= cur.t.map(() => []));
      old.t.forEach((oh, i) => push(rows[i], oh, cur.t![i]));
      if (!rows.some((r) => r.length)) delete h.taskDescHashes[code];
    }
    if (old.e && cur.e && old.e !== cur.e) {
      push(((h.eventDescHashes ??= {})[code] ??= []), old.e, cur.e);
    }
  }
}
// Drop empty shells so the emitted file stays tidy.
for (const [tid, h] of Object.entries(history)) {
  for (const k of [
    "names",
    "taskNames",
    "descHashes",
    "taskDescHashes",
    "eventScaffolds",
    "eventDescHashes",
  ] as const) {
    if (h[k] && !Object.keys(h[k]!).length) delete h[k];
  }
  if (!Object.keys(h).length) delete history[tid];
}

let hist = HEADER.replace(
  /\/\/ GENERATED[\s\S]*$/,
  `// GENERATED alongside taskTitleIndex.ts by \`npm run generate:task-index\`
// — the historical wording sets and current-corpus hash manifest for
// provenance-verified display translation
// (docs/provenance-translation.md). History is APPEND-ONLY across
// regenerations: a wording that changes in any language moves its old
// form here so projects created under it keep verifying (and keep
// displaying the CURRENT translation). Do not edit by hand.
`,
);
hist +=
  "export interface TemplateWordingHistory {\n  names?: Record<string, readonly string[]>;\n  taskNames?: Record<string, readonly (readonly string[])[]>;\n  descHashes?: Record<string, readonly string[]>;\n  taskDescHashes?: Record<string, readonly (readonly string[])[]>;\n  eventScaffolds?: Record<string, readonly string[]>;\n  eventDescHashes?: Record<string, readonly string[]>;\n}\n\n";
hist +=
  "export const TEMPLATE_WORDING_HISTORY: Record<\n  string,\n  TemplateWordingHistory\n> = ";
hist += JSON.stringify(history, null, 2);
hist += ";\n";
writeFileSync(
  join(ROOT, "src", "content", "templateProvenanceHistory.ts"),
  hist,
);
let man = HEADER.replace(
  /\/\/ GENERATED[\s\S]*$/,
  `// GENERATED alongside taskTitleIndex.ts by \`npm run generate:task-index\`.
// GENERATOR-ONLY — never import this from app code: it exists so the
// NEXT regeneration can detect description rewords (truncated SHA-256
// of each template's staged description composition and per-row task
// descriptions in the CURRENT corpus; plaintext descriptions exist
// only inside the content bundles). Do not edit by hand.
`,
);
man +=
  "export const TEMPLATE_DESC_MANIFEST: Record<\n  string,\n  Record<string, { d?: string; t?: readonly string[]; e?: string }>\n> = ";
man += JSON.stringify(manifest, null, 2);
man += ";\n";
writeFileSync(
  join(ROOT, "src", "content", "templateProvenanceManifest.ts"),
  man,
);
console.log(
  `templateProvenanceHistory.ts: ${Object.keys(history).length} templates carry history; manifest covers ${Object.keys(manifest).length} × ${locales.length}`,
);
