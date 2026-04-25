import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import es from "./locales/es.json";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function flattenKeys(obj: JsonValue, prefix = ""): string[] {
  if (
    obj === null ||
    typeof obj !== "object" ||
    Array.isArray(obj)
  ) {
    return [prefix];
  }
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    out.push(...flattenKeys(v as JsonValue, next));
  }
  return out;
}

/**
 * The locales must always have identical key sets. Anything else means a
 * user in one language sees raw key names where the UI used to be — a
 * silent regression. This test makes that regression loud.
 *
 * When this test fails, fix the missing-side translation file. Adding a
 * key in en without a matching es entry (or vice versa) is the bug.
 */
describe("i18n locale parity", () => {
  const enKeys = flattenKeys(en).sort();
  const esKeys = flattenKeys(es).sort();

  it("en.json and es.json have identical key sets", () => {
    const enSet = new Set(enKeys);
    const esSet = new Set(esKeys);
    const onlyInEn = enKeys.filter((k) => !esSet.has(k));
    const onlyInEs = esKeys.filter((k) => !enSet.has(k));
    expect(onlyInEn, "Keys present in en.json but missing from es.json").toEqual(
      [],
    );
    expect(onlyInEs, "Keys present in es.json but missing from en.json").toEqual(
      [],
    );
  });

  it("every leaf in en.json is a non-empty string", () => {
    function check(obj: JsonValue, path: string) {
      if (typeof obj === "string") {
        expect(obj.length, `${path} should not be empty`).toBeGreaterThan(0);
        return;
      }
      if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
        throw new Error(
          `${path} is not a string or nested object — locales should only contain strings`,
        );
      }
      for (const [k, v] of Object.entries(obj)) {
        check(v as JsonValue, path ? `${path}.${k}` : k);
      }
    }
    check(en as JsonValue, "");
    check(es as JsonValue, "");
  });
});
