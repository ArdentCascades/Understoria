/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import { filterBoardPosts, type BoardPostFilter } from "./boardFilter";
import type { Post, PostStatus } from "@/types";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    type: "NEED",
    category: "food",
    title: "Grocery run",
    description: "Need a hand with a grocery pickup",
    estimatedHours: 1,
    urgency: "medium",
    postedBy: "key-a",
    claimedBy: null,
    status: "open",
    createdAt: 1_000,
    expiresAt: null,
    locationZone: "north",
    confirmedBy: [],
    nodeId: "node_local",
    signature: "",
    ...overrides,
  };
}

const OPEN_FILTER: BoardPostFilter = {
  type: "NEED",
  category: "",
  urgency: "",
  zone: "",
  query: "",
};

describe("filterBoardPosts — status handling", () => {
  it("keeps open, claimed, and awaiting posts; drops cancelled AND completed", () => {
    // Completed posts are finished exchanges, not board inventory.
    // Before this exclusion the Board's "Show N claimed" toggle
    // counted them (completed rows keep claimedBy set), so a board
    // with only finished exchanges showed "Show 1 claimed" that
    // expanded to reveal nothing actionable.
    const statuses: PostStatus[] = [
      "open",
      "claimed",
      "awaiting_confirmation",
      "completed",
      "cancelled",
    ];
    const posts = statuses.map((status, i) =>
      makePost({
        id: `post-${i}`,
        status,
        claimedBy: status === "open" ? null : "key-b",
      }),
    );
    const kept = filterBoardPosts(posts, OPEN_FILTER).map((p) => p.status);
    expect(kept).toContain("open");
    expect(kept).toContain("claimed");
    expect(kept).toContain("awaiting_confirmation");
    expect(kept).not.toContain("completed");
    expect(kept).not.toContain("cancelled");
  });

  it("disputed posts stay visible (they are unresolved, not history)", () => {
    const posts = [makePost({ status: "disputed", claimedBy: "key-b" })];
    expect(filterBoardPosts(posts, OPEN_FILTER)).toHaveLength(1);
  });
});

describe("filterBoardPosts — facet filters", () => {
  it("filters by type, category, urgency, and zone together", () => {
    const match = makePost({ id: "match" });
    const posts = [
      match,
      makePost({ id: "wrong-type", type: "OFFER" }),
      makePost({ id: "wrong-category", category: "transport" }),
      makePost({ id: "wrong-urgency", urgency: "low" }),
      makePost({ id: "wrong-zone", locationZone: "south" }),
    ];
    const result = filterBoardPosts(posts, {
      type: "NEED",
      category: "food",
      urgency: "medium",
      zone: "north",
      query: "",
    });
    expect(result.map((p) => p.id)).toEqual(["match"]);
  });

  it("matches the query against title and description", () => {
    const posts = [
      makePost({ id: "by-title", title: "Ladder loan" }),
      makePost({ id: "by-description", description: "borrow a ladder" }),
      makePost({ id: "no-match" }),
    ];
    const result = filterBoardPosts(posts, { ...OPEN_FILTER, query: "ladder" });
    expect(result.map((p) => p.id)).toEqual(["by-title", "by-description"]);
  });
});
