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
import { listDisputes } from "./disputes";
import type { Member, Post } from "@/types";

function buildMember(overrides: Partial<Member>): Member {
  return {
    publicKey: "k",
    nodeId: "n",
    displayName: "Member",
    skills: [],
    availability: "",
    availabilityChips: [],
    locationZone: "",
    seedBalance: 5,
    vouchedBy: [],
    createdAt: 0,
    ...overrides,
  };
}

function buildPost(overrides: Partial<Post>): Post {
  return {
    id: "p",
    nodeId: "n",
    type: "NEED",
    category: "other",
    title: "Sample",
    description: "",
    estimatedHours: 1,
    urgency: "low",
    postedBy: "POSTER",
    claimedBy: "CLAIMER",
    status: "disputed",
    confirmedBy: [],
    createdAt: 0,
    expiresAt: null,
    locationZone: "",
    signature: "",
    ...overrides,
  };
}

const POSTER = buildMember({ publicKey: "POSTER", displayName: "Poster" });
const CLAIMER = buildMember({ publicKey: "CLAIMER", displayName: "Claimer" });

describe("listDisputes", () => {
  it("returns empty when no disputed posts exist", () => {
    const posts = [buildPost({ status: "open" })];
    expect(listDisputes(posts, [POSTER, CLAIMER])).toEqual([]);
  });

  it("includes only disputed posts", () => {
    const posts = [
      buildPost({ id: "a", status: "open" }),
      buildPost({ id: "b", status: "disputed" }),
      buildPost({ id: "c", status: "completed" }),
      buildPost({ id: "d", status: "disputed" }),
    ];
    const result = listDisputes(posts, [POSTER, CLAIMER]);
    expect(result.map((r) => r.postId).sort()).toEqual(["b", "d"]);
  });

  it("maps helper/recipient correctly for a NEED dispute", () => {
    // NEED: posted by someone who needs help, claimed by helper.
    const posts = [
      buildPost({
        id: "need",
        type: "NEED",
        postedBy: "POSTER",
        claimedBy: "CLAIMER",
      }),
    ];
    const result = listDisputes(posts, [POSTER, CLAIMER]);
    expect(result[0].helperKey).toBe("CLAIMER");
    expect(result[0].helperName).toBe("Claimer");
    expect(result[0].recipientKey).toBe("POSTER");
    expect(result[0].recipientName).toBe("Poster");
  });

  it("maps helper/recipient correctly for an OFFER dispute", () => {
    // OFFER: posted by helper, claimed by recipient.
    const posts = [
      buildPost({
        id: "offer",
        type: "OFFER",
        postedBy: "POSTER",
        claimedBy: "CLAIMER",
      }),
    ];
    const result = listDisputes(posts, [POSTER, CLAIMER]);
    expect(result[0].helperKey).toBe("POSTER");
    expect(result[0].helperName).toBe("Poster");
    expect(result[0].recipientKey).toBe("CLAIMER");
    expect(result[0].recipientName).toBe("Claimer");
  });

  it("falls back to '—' when a name is missing from the member list", () => {
    const posts = [buildPost({ claimedBy: "UNKNOWN" })];
    const result = listDisputes(posts, [POSTER]);
    expect(result[0].helperName).toBeNull();
    expect(result[0].recipientName).toBe("Poster");
  });

  it("skips disputes with no claimer (defensive against bad data)", () => {
    const posts = [
      buildPost({ id: "good", claimedBy: "CLAIMER" }),
      buildPost({ id: "bad", type: "OFFER", claimedBy: null }),
    ];
    const result = listDisputes(posts, [POSTER, CLAIMER]);
    expect(result.map((r) => r.postId)).toEqual(["good"]);
  });

  it("sorts newest-first by createdAt", () => {
    const posts = [
      buildPost({ id: "old", createdAt: 100 }),
      buildPost({ id: "new", createdAt: 300 }),
      buildPost({ id: "mid", createdAt: 200 }),
    ];
    const result = listDisputes(posts, [POSTER, CLAIMER]);
    expect(result.map((r) => r.postId)).toEqual(["new", "mid", "old"]);
  });

  it("preserves the post type, category, and hours fields", () => {
    const posts = [
      buildPost({
        type: "OFFER",
        category: "skilled_labor",
        estimatedHours: 3.5,
      }),
    ];
    const result = listDisputes(posts, [POSTER, CLAIMER]);
    expect(result[0].postType).toBe("OFFER");
    expect(result[0].category).toBe("skilled_labor");
    expect(result[0].hours).toBe(3.5);
  });
});
