/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  CATEGORY_META,
  EVENT_CATEGORY_FALLBACK,
  eventCategoryMeta,
  normalizeExchangeCategory,
  PROJECT_CATEGORY_META,
  projectCategoryMeta,
} from "./categories";

describe("normalizeExchangeCategory / projectCategoryMeta", () => {
  it("passes through every current category unchanged", () => {
    expect(normalizeExchangeCategory("food")).toBe("food");
    expect(normalizeExchangeCategory("organizing")).toBe("organizing");
    expect(normalizeExchangeCategory("mutual_aid_drive")).toBe(
      "mutual_aid_drive",
    );
  });

  it("folds a stale/unknown id into 'other' — rows outlive renames", () => {
    // Task/project state federates verbatim, so a row written by an
    // older build can carry a category today's maps have never heard
    // of. It must fold, never crash.
    expect(normalizeExchangeCategory("gardening")).toBe("other");
    expect(normalizeExchangeCategory("")).toBe("other");
  });

  it("projectCategoryMeta is total — the twice-crashed-Dashboard guard", () => {
    expect(projectCategoryMeta("food")).toBe(PROJECT_CATEGORY_META.food);
    expect(projectCategoryMeta("not-a-category")).toBe(
      PROJECT_CATEGORY_META.other,
    );
    expect(projectCategoryMeta("not-a-category").emoji).not.toBe("");
  });
});

describe("eventCategoryMeta", () => {
  it("resolves an event-specific category to its own emoji + colour", () => {
    const social = eventCategoryMeta("social");
    expect(social.id).toBe("social");
    expect(social.emoji).not.toBe("");
    expect(social.barColorClass).toContain("bg-");
  });

  it("reuses the legacy meta for a category an event shares with posts/projects", () => {
    // A "food" event reads as the same concept as a "food" post.
    expect(eventCategoryMeta("food").emoji).toBe(CATEGORY_META.food.emoji);
    expect(eventCategoryMeta("food").barColorClass).toBe(
      CATEGORY_META.food.barColorClass,
    );
  });

  it("resolves a project-only category (e.g. organizing) that templates reuse", () => {
    expect(eventCategoryMeta("organizing").id).toBe("organizing");
    expect(eventCategoryMeta("organizing").barColorClass).toContain("bg-");
  });

  it("falls back to a neutral glyph/colour for an unknown peer category, never throwing", () => {
    // Events federate with free-text categories — a peer can send one we
    // don't know. This is the load-bearing no-crash guarantee.
    expect(eventCategoryMeta("zzz-some-future-category")).toBe(
      EVENT_CATEGORY_FALLBACK,
    );
    expect(eventCategoryMeta("")).toBe(EVENT_CATEGORY_FALLBACK);
    expect(EVENT_CATEGORY_FALLBACK.barColorClass).toContain("bg-");
    expect(EVENT_CATEGORY_FALLBACK.emoji).not.toBe("");
  });
});
