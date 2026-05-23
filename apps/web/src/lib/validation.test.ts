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
import {
  combine,
  optional,
  positiveInteger,
  positiveNumber,
  required,
} from "./validation";

describe("required", () => {
  const v = required("err.required");

  it("flags empty string", () => {
    expect(v("")).toEqual({ key: "err.required" });
  });

  it("flags whitespace-only string", () => {
    expect(v("   \t")).toEqual({ key: "err.required" });
  });

  it("passes non-empty string", () => {
    expect(v("hi")).toBeNull();
  });
});

describe("positiveNumber", () => {
  const v = positiveNumber("err.positive");

  it("flags empty", () => {
    expect(v("")).toEqual({ key: "err.positive" });
  });

  it("flags non-numeric", () => {
    expect(v("abc")).toEqual({ key: "err.positive" });
  });

  it("flags zero", () => {
    expect(v("0")).toEqual({ key: "err.positive" });
  });

  it("flags negative", () => {
    expect(v("-1.5")).toEqual({ key: "err.positive" });
  });

  it("accepts positive integers + fractions", () => {
    expect(v("1")).toBeNull();
    expect(v("0.25")).toBeNull();
    expect(v("99.5")).toBeNull();
  });
});

describe("positiveInteger", () => {
  const v = positiveInteger("err.positiveInt");

  it("flags empty / non-numeric / negative / zero / fractional", () => {
    expect(v("")).toEqual({ key: "err.positiveInt" });
    expect(v("abc")).toEqual({ key: "err.positiveInt" });
    expect(v("-2")).toEqual({ key: "err.positiveInt" });
    expect(v("0")).toEqual({ key: "err.positiveInt" });
    expect(v("1.5")).toEqual({ key: "err.positiveInt" });
  });

  it("accepts positive integers", () => {
    expect(v("1")).toBeNull();
    expect(v("365")).toBeNull();
  });
});

describe("optional", () => {
  const v = optional(positiveInteger("err.positiveInt"));

  it("passes empty string (the whole point)", () => {
    expect(v("")).toBeNull();
    expect(v("   ")).toBeNull();
  });

  it("still flags invalid non-empty values", () => {
    expect(v("abc")).toEqual({ key: "err.positiveInt" });
  });

  it("still passes valid non-empty values", () => {
    expect(v("7")).toBeNull();
  });
});

describe("combine", () => {
  it("returns the first error in order", () => {
    const v = combine(
      required("err.required"),
      positiveNumber("err.positive"),
    );
    expect(v("")).toEqual({ key: "err.required" });
    expect(v("nope")).toEqual({ key: "err.positive" });
    expect(v("3")).toBeNull();
  });

  it("returns null if all pass", () => {
    const v = combine(required("err.required"), positiveNumber("err.positive"));
    expect(v("1.5")).toBeNull();
  });
});
