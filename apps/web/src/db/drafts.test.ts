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
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "./database";
import {
  clearDraft,
  DRAFT_MAX_AGE_MS,
  loadDraft,
  purgeExpiredDrafts,
  saveDraft,
} from "./drafts";

interface SamplePayload {
  title: string;
  count: number;
  tags: string[];
}

const KEY = "test-draft";

async function reset() {
  await db.drafts.clear();
}

describe("saveDraft / loadDraft", () => {
  beforeEach(reset);

  it("round-trips a structured payload", async () => {
    const payload: SamplePayload = {
      title: "Plant the south bed",
      count: 3,
      tags: ["garden", "spring"],
    };
    await saveDraft(KEY, payload);
    const draft = await loadDraft<SamplePayload>(KEY);
    expect(draft).not.toBeNull();
    expect(draft!.payload).toEqual(payload);
    expect(draft!.updatedAt).toBeGreaterThan(0);
  });

  it("returns null when no draft exists for the key", async () => {
    expect(await loadDraft(KEY)).toBeNull();
  });

  it("overwrites the previous payload on re-save", async () => {
    await saveDraft(KEY, { title: "first", count: 1, tags: [] });
    await saveDraft(KEY, { title: "second", count: 2, tags: ["a"] });
    const draft = await loadDraft<SamplePayload>(KEY);
    expect(draft!.payload.title).toBe("second");
    expect(draft!.payload.count).toBe(2);
  });

  it("isolates drafts by key", async () => {
    await saveDraft("post-new", { title: "post" });
    await saveDraft("project-new", { title: "project" });
    const a = await loadDraft<{ title: string }>("post-new");
    const b = await loadDraft<{ title: string }>("project-new");
    expect(a!.payload.title).toBe("post");
    expect(b!.payload.title).toBe("project");
  });

  it("drops + returns null for drafts older than DRAFT_MAX_AGE_MS", async () => {
    await saveDraft(KEY, { title: "stale" });
    // Backdate the row by hand — saveDraft always stamps Date.now().
    const future = Date.now() + DRAFT_MAX_AGE_MS + 1000;
    const draft = await loadDraft(KEY, future);
    expect(draft).toBeNull();
    // Should also have been deleted from the table.
    expect(await db.drafts.get(KEY)).toBeUndefined();
  });

  it("treats corrupt JSON as missing + deletes the row", async () => {
    await db.drafts.put({
      key: KEY,
      payload: "{not valid json",
      updatedAt: Date.now(),
    });
    expect(await loadDraft(KEY)).toBeNull();
    expect(await db.drafts.get(KEY)).toBeUndefined();
  });
});

describe("clearDraft", () => {
  beforeEach(reset);

  it("removes the draft for the given key", async () => {
    await saveDraft(KEY, { title: "to be cleared" });
    await clearDraft(KEY);
    expect(await loadDraft(KEY)).toBeNull();
  });

  it("is a no-op when no draft exists", async () => {
    await expect(clearDraft(KEY)).resolves.toBeUndefined();
  });
});

describe("purgeExpiredDrafts", () => {
  beforeEach(reset);

  it("deletes only drafts older than the cutoff", async () => {
    const now = Date.now();
    await db.drafts.put({
      key: "fresh",
      payload: "{}",
      updatedAt: now - 1000,
    });
    await db.drafts.put({
      key: "stale",
      payload: "{}",
      updatedAt: now - DRAFT_MAX_AGE_MS - 1000,
    });
    const purged = await purgeExpiredDrafts(now);
    expect(purged).toBe(1);
    expect(await db.drafts.get("fresh")).toBeDefined();
    expect(await db.drafts.get("stale")).toBeUndefined();
  });

  it("returns 0 when nothing is expired", async () => {
    await saveDraft(KEY, { title: "fresh" });
    expect(await purgeExpiredDrafts()).toBe(0);
  });
});
