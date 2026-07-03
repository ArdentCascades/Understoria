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
import { describe, expect, it } from "vitest";
import enRaw from "./locales/en.json?raw";
import esRaw from "./locales/es.json?raw";

/**
 * Scan raw JSON source for duplicate keys within the same object, at any
 * nesting depth. JSON.parse is last-wins on duplicates, so a duplicated
 * key silently discards the earlier block — exactly what happened when
 * both locales declared a top-level "community" twice and the
 * autoConfirmHours strings vanished into missing-key fallbacks. The
 * parity test can't catch that (both files parsed to the same shape), so
 * this test checks the source text before parsing gets a chance to lie.
 *
 * Returns the dotted paths of any duplicated keys, e.g. ["community"].
 */
function findDuplicateKeys(source: string): string[] {
  const duplicates: string[] = [];
  // One Set of seen keys per open object; parallel stack of path segments
  // (null for containers without a key, i.e. the root or array elements).
  const seenStack: Array<Set<string>> = [];
  const pathStack: Array<string | null> = [];
  let pendingKey: string | null = null;
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"') {
      let j = i + 1;
      let text = "";
      while (j < source.length && source[j] !== '"') {
        if (source[j] === "\\") {
          text += source[j] + source[j + 1];
          j += 2;
        } else {
          text += source[j];
          j += 1;
        }
      }
      let k = j + 1;
      while (k < source.length && /\s/.test(source[k])) k += 1;
      if (source[k] === ":") {
        const seen = seenStack[seenStack.length - 1];
        if (seen) {
          if (seen.has(text)) {
            const parents = pathStack.filter((p): p is string => p !== null);
            duplicates.push([...parents, text].join("."));
          }
          seen.add(text);
        }
        pendingKey = text;
        i = k + 1;
        continue;
      }
      i = j + 1;
      continue;
    }
    if (ch === "{") {
      seenStack.push(new Set());
      pathStack.push(pendingKey);
      pendingKey = null;
    } else if (ch === "}") {
      seenStack.pop();
      pathStack.pop();
    } else if (ch === "[") {
      pathStack.push(pendingKey);
      pendingKey = null;
    } else if (ch === "]") {
      pathStack.pop();
    }
    i += 1;
  }
  return duplicates;
}

describe("i18n locale duplicate keys", () => {
  it("the scanner itself flags duplicates JSON.parse would swallow", () => {
    expect(
      findDuplicateKeys('{ "a": { "x": 1 }, "b": 2, "a": { "y": 3 } }'),
    ).toEqual(["a"]);
    expect(
      findDuplicateKeys('{ "a": { "x": 1, "x": 2 }, "b": ":{ not a key" }'),
    ).toEqual(["a.x"]);
    expect(findDuplicateKeys('{ "a": { "x": 1 }, "b": { "x": 2 } }')).toEqual(
      [],
    );
  });

  for (const [locale, source] of [
    ["en", enRaw],
    ["es", esRaw],
  ] as const) {
    it(`${locale}.json declares every key exactly once`, () => {
      expect(
        findDuplicateKeys(source),
        `Duplicate keys in ${locale}.json — JSON.parse keeps only the last ` +
          "occurrence, silently dropping every key that exists only in the " +
          "earlier block. Merge the duplicated blocks into one.",
      ).toEqual([]);
    });
  }
});
