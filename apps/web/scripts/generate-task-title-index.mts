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

const names: Record<string, Record<string, string>> = {};
const taskNames: Record<string, Record<string, readonly string[]>> = {};
const workDays: Record<string, boolean> = {};

for (const code of locales) {
  const bundle = (await import(
    join(ROOT, "src", "content", "bundles", `${code}.ts`)
  )) as { PROJECT_TEMPLATES: readonly Tpl[] };
  for (const tpl of bundle.PROJECT_TEMPLATES) {
    (taskNames[tpl.id] ??= {})[code] = tpl.tasks.map((t) => t.name);
    (names[tpl.id] ??= {})[code] = tpl.name;
    // Sparse like the hand-rolled table: only templates that carry
    // the flag appear; absent reads as falsy at every call site.
    if (code === "en" && tpl.suggestsWorkDays) workDays[tpl.id] = true;
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
out += ";\n";
writeFileSync(OUT, out);
console.log(
  `taskTitleIndex.ts: ${Object.keys(taskNames).length} templates × ${locales.length} locales (names + task names + workDays)`,
);
