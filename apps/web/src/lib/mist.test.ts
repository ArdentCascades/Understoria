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
import { afterEach, describe, expect, it } from "vitest";
import {
  MIST_STORAGE_KEY,
  applyMist,
  cacheMist,
  isMistPreference,
} from "./mist";

afterEach(() => {
  document.documentElement.classList.remove("mist");
  window.localStorage.removeItem(MIST_STORAGE_KEY);
});

describe("mist — isMistPreference", () => {
  it("accepts exactly the two preferences", () => {
    expect(isMistPreference("off")).toBe(true);
    expect(isMistPreference("on")).toBe(true);
    expect(isMistPreference("ON")).toBe(false);
    expect(isMistPreference("")).toBe(false);
    expect(isMistPreference(true)).toBe(false);
    expect(isMistPreference(undefined)).toBe(false);
  });
});

describe("mist — applyMist", () => {
  it("adds and removes the root class, idempotently", () => {
    applyMist("on");
    expect(document.documentElement.classList.contains("mist")).toBe(true);
    applyMist("on");
    expect(document.documentElement.classList.contains("mist")).toBe(true);
    applyMist("off");
    expect(document.documentElement.classList.contains("mist")).toBe(false);
    applyMist("off");
    expect(document.documentElement.classList.contains("mist")).toBe(false);
  });
});

describe("mist — cacheMist", () => {
  it("writes the preference through to localStorage", () => {
    cacheMist("on");
    expect(window.localStorage.getItem(MIST_STORAGE_KEY)).toBe("on");
    cacheMist("off");
    expect(window.localStorage.getItem(MIST_STORAGE_KEY)).toBe("off");
  });
});
