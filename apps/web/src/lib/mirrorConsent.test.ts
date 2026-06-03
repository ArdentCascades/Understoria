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
import { mirrorChangeNeedsConsent, type MirrorConfig } from "./mirrorConsent";

const off = (url = ""): MirrorConfig => ({ url, enabled: false });
const on = (url: string): MirrorConfig => ({ url, enabled: true });

describe("mirrorChangeNeedsConsent", () => {
  it("off -> off needs no consent", () => {
    expect(mirrorChangeNeedsConsent(off(), off("https://a.example"))).toBe(
      false,
    );
  });

  it("off -> on with a url needs consent", () => {
    expect(mirrorChangeNeedsConsent(off(), on("https://a.example"))).toBe(true);
  });

  it("off -> on with an empty url needs no consent", () => {
    expect(mirrorChangeNeedsConsent(off(), on(""))).toBe(false);
  });

  it("off -> on with a whitespace-only url needs no consent", () => {
    expect(mirrorChangeNeedsConsent(off(), on("   "))).toBe(false);
  });

  it("on -> on with the same url needs no consent", () => {
    expect(
      mirrorChangeNeedsConsent(on("https://a.example"), on("https://a.example")),
    ).toBe(false);
  });

  it("on -> on with a whitespace-only diff needs no consent", () => {
    // Trimming both sides means cosmetic edits don't re-prompt.
    expect(
      mirrorChangeNeedsConsent(on("https://a.example"), on("  https://a.example  ")),
    ).toBe(false);
  });

  it("on -> on with a different url needs consent (re-target)", () => {
    expect(
      mirrorChangeNeedsConsent(on("https://a.example"), on("https://b.example")),
    ).toBe(true);
  });

  it("on -> off needs no consent", () => {
    expect(mirrorChangeNeedsConsent(on("https://a.example"), off("https://a.example"))).toBe(
      false,
    );
  });

  it("editing the url while disabled needs no consent", () => {
    expect(mirrorChangeNeedsConsent(off("https://a.example"), off("https://b.example"))).toBe(
      false,
    );
  });

  it("does not mutate its inputs", () => {
    const prev = on("  https://a.example  ");
    const next = on("https://b.example");
    const prevCopy = { ...prev };
    const nextCopy = { ...next };
    mirrorChangeNeedsConsent(prev, next);
    expect(prev).toEqual(prevCopy);
    expect(next).toEqual(nextCopy);
  });
});
