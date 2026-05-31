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
import { parseTabParam, tabToParam } from "./boardTab";

describe("parseTabParam", () => {
  it("returns NEED for null", () => {
    expect(parseTabParam(null)).toBe("NEED");
  });

  it("returns NEED for undefined", () => {
    expect(parseTabParam(undefined)).toBe("NEED");
  });

  it("returns NEED for an empty string", () => {
    expect(parseTabParam("")).toBe("NEED");
  });

  it("returns NEED for an unknown value", () => {
    expect(parseTabParam("garbage")).toBe("NEED");
  });

  it("returns NEED for 'needs'", () => {
    expect(parseTabParam("needs")).toBe("NEED");
  });

  it("returns OFFER for 'offers'", () => {
    expect(parseTabParam("offers")).toBe("OFFER");
  });

  it("returns PROJECTS for 'projects'", () => {
    expect(parseTabParam("projects")).toBe("PROJECTS");
  });

  it("is case-insensitive for mixed-case 'Projects'", () => {
    expect(parseTabParam("Projects")).toBe("PROJECTS");
  });

  it("is case-insensitive for upper-case 'NEEDS'", () => {
    expect(parseTabParam("NEEDS")).toBe("NEED");
  });
});

describe("tabToParam", () => {
  it("maps NEED to 'needs'", () => {
    expect(tabToParam("NEED")).toBe("needs");
  });

  it("maps OFFER to 'offers'", () => {
    expect(tabToParam("OFFER")).toBe("offers");
  });

  it("maps PROJECTS to 'projects'", () => {
    expect(tabToParam("PROJECTS")).toBe("projects");
  });
});
