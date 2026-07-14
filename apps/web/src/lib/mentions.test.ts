/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { describe, expect, it } from "vitest";
import {
  activeMentionQuery,
  askedOfYou,
  extractMentionKeys,
  insertMention,
  matchMembers,
  mentionToken,
} from "./mentions";
import type { Project, ProjectTask, TaskComment } from "@/types";

const ME = "M".repeat(43) + "=";
const ROSA = "R".repeat(43) + "=";
const THEO = "T".repeat(43) + "=";

describe("mentionToken", () => {
  it("builds the wire token from name + key", () => {
    expect(mentionToken("Rosa", ROSA)).toBe(`@[Rosa](mention:${ROSA})`);
  });

  it("strips grammar-breaking characters from the label instead of corrupting the token", () => {
    // A display name containing ] or ( would terminate the bracket
    // pattern early and turn the rest of the token into stray prose.
    expect(mentionToken("Ro]sa (she/her)", ROSA)).toBe(
      `@[Rosa she/her](mention:${ROSA})`,
    );
  });

  it("round-trips through extraction", () => {
    const body = `ping ${mentionToken("Rosa", ROSA)} and ${mentionToken("Theo", THEO)}`;
    expect(extractMentionKeys(body)).toEqual([ROSA, THEO]);
  });
});

describe("extractMentionKeys", () => {
  it("dedupes repeated mentions of the same key", () => {
    const tok = mentionToken("Rosa", ROSA);
    expect(extractMentionKeys(`${tok} again ${tok}`)).toEqual([ROSA]);
  });

  it("does NOT count a token inside a code span — what reads as code is not an ask", () => {
    expect(extractMentionKeys(`\`${mentionToken("Rosa", ROSA)}\``)).toEqual([]);
  });

  it("does NOT count a token inside a fenced code block", () => {
    const body = "```\n" + mentionToken("Rosa", ROSA) + "\n```";
    expect(extractMentionKeys(body)).toEqual([]);
  });

  it("finds mentions nested in emphasis, lists, and blockquotes", () => {
    const body = [
      `**${mentionToken("Rosa", ROSA)}**`,
      `- item with ${mentionToken("Theo", THEO)}`,
      `> quoted ${mentionToken("Me", ME)}`,
    ].join("\n\n");
    expect(extractMentionKeys(body)).toEqual([ROSA, THEO, ME]);
  });
});

describe("activeMentionQuery", () => {
  it("detects an in-progress @query at the caret", () => {
    const text = "hey @ros";
    expect(activeMentionQuery(text, text.length)).toEqual({
      start: 4,
      query: "ros",
    });
  });

  it("allows a bare @ (empty query) to open the picker", () => {
    expect(activeMentionQuery("@", 1)).toEqual({ start: 0, query: "" });
  });

  it("never triggers mid-word — email addresses stay emails", () => {
    const text = "mail rosa@example";
    expect(activeMentionQuery(text, text.length)).toBeNull();
  });

  it("stops offering once the member typed past the name (bracket/newline/second @)", () => {
    expect(activeMentionQuery("@[Rosa](men", 11)).toBeNull();
    expect(activeMentionQuery("@rosa\nnext line", 15)).toBeNull();
  });

  it("follows the caret, not the end of the text", () => {
    const text = "@ros and more prose";
    expect(activeMentionQuery(text, 4)).toEqual({ start: 0, query: "ros" });
  });
});

describe("insertMention", () => {
  it("replaces the @query with the token plus a trailing space", () => {
    const text = "hey @ros can you look?";
    const caret = 8; // just after "@ros"
    const result = insertMention(text, { start: 4, query: "ros" }, caret, {
      key: ROSA,
      name: "Rosa",
    });
    const token = mentionToken("Rosa", ROSA);
    expect(result.text).toBe(`hey ${token}  can you look?`);
    expect(result.caret).toBe(4 + token.length + 1);
    // The caret sits right after the token's trailing space, ready to
    // keep typing.
    expect(result.text.slice(result.caret)).toBe(" can you look?");
  });
});

describe("matchMembers", () => {
  const POOL = [
    { key: ROSA, name: "Rosa Delgado" },
    { key: THEO, name: "Theo" },
    { key: ME, name: "Me Myself" },
  ];

  it("ranks prefix matches before substring matches", () => {
    const pool = [
      { key: "k1", name: "Delia" },
      { key: "k2", name: "Rosa Delgado" },
    ];
    expect(matchMembers("del", pool).map((m) => m.name)).toEqual([
      "Delia",
      "Rosa Delgado",
    ]);
  });

  it("excludes the composer themself from suggestions", () => {
    expect(matchMembers("", POOL, ME).map((m) => m.key)).toEqual([ROSA, THEO]);
  });

  it("matches case-insensitively across multi-word names", () => {
    expect(matchMembers("rosa d", POOL).map((m) => m.key)).toEqual([ROSA]);
  });
});

// --- askedOfYou: the WHOLE mention lifecycle (docs/mentions.md §3) ---------

function comment(overrides: Partial<TaskComment>): TaskComment {
  return {
    id: "c1",
    projectId: "p1",
    taskId: "t1",
    authorKey: ROSA,
    body: `can you take a look ${mentionToken("Me", ME)}?`,
    createdAt: 1_000,
    deletedAt: null,
    nodeId: "node_local",
    signature: "sig",
    ...overrides,
  };
}

function task(overrides: Partial<ProjectTask> = {}): ProjectTask {
  return {
    id: "t1",
    projectId: "p1",
    title: "Fix the fridge door",
    description: "",
    estimatedHours: 1,
    status: "open",
    assignedTo: null,
    completedAt: null,
    dependencies: [],
    order: 0,
    createdAt: 500,
    ...overrides,
  } as ProjectTask;
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    title: "Community fridge",
    description: "",
    category: "food",
    organizerKey: ROSA,
    coOrganizerKeys: [],
    status: "active",
    createdAt: 100,
    templateId: null,
    ...overrides,
  } as Project;
}

function ask(args: {
  comments: TaskComment[];
  tasks?: ProjectTask[];
  projects?: Project[];
  blockedKeys?: Set<string>;
}) {
  return askedOfYou({
    myKey: ME,
    comments: args.comments,
    tasks: args.tasks ?? [task()],
    projects: args.projects ?? [project()],
    blockedKeys: args.blockedKeys ?? new Set(),
  });
}

describe("askedOfYou — a hand is raised while every predicate holds", () => {
  it("surfaces a live mention of me on a live task", () => {
    const items = ask({ comments: [comment({})] });
    expect(items).toHaveLength(1);
    expect(items[0].comment.id).toBe("c1");
    expect(items[0].task.id).toBe("t1");
    expect(items[0].project.id).toBe("p1");
  });

  it("sorts newest ask first", () => {
    const items = ask({
      comments: [
        comment({ id: "old", createdAt: 1_000 }),
        comment({ id: "new", createdAt: 2_000 }),
      ],
    });
    expect(items.map((i) => i.comment.id)).toEqual(["new", "old"]);
  });

  it("ignores comments that mention someone else", () => {
    const items = ask({
      comments: [comment({ body: `ping ${mentionToken("Rosa", ROSA)}` })],
    });
    expect(items).toHaveLength(0);
  });

  it("ignores my own comments — a self-mention is a note, not an ask", () => {
    const items = ask({ comments: [comment({ authorKey: ME })] });
    expect(items).toHaveLength(0);
  });
});

describe("askedOfYou — the hand lowers itself", () => {
  it("a tombstoned comment is no ask", () => {
    const items = ask({ comments: [comment({ deletedAt: 2_000 })] });
    expect(items).toHaveLength(0);
  });

  it("a completed task lowers every hand on it", () => {
    const items = ask({
      comments: [comment({})],
      tasks: [task({ status: "completed" })],
    });
    expect(items).toHaveLength(0);
  });

  it("an archived or completed project lowers its hands", () => {
    for (const status of ["archived", "completed"] as const) {
      const items = ask({
        comments: [comment({})],
        projects: [project({ status })],
      });
      expect(items).toHaveLength(0);
    }
  });

  it("my later reply on the task lowers the hand — task-scoped, not thread-scoped", () => {
    const items = ask({
      comments: [
        comment({ id: "ask", createdAt: 1_000 }),
        comment({
          id: "my-reply",
          authorKey: ME,
          body: "on it!",
          createdAt: 2_000,
        }),
      ],
    });
    expect(items).toHaveLength(0);
  });

  it("my EARLIER comment does not pre-lower a later ask", () => {
    const items = ask({
      comments: [
        comment({
          id: "my-earlier",
          authorKey: ME,
          body: "watching this",
          createdAt: 500,
        }),
        comment({ id: "ask", createdAt: 1_000 }),
      ],
    });
    expect(items).toHaveLength(1);
  });

  it("my DELETED reply does not lower the hand", () => {
    const items = ask({
      comments: [
        comment({ id: "ask", createdAt: 1_000 }),
        comment({
          id: "my-deleted-reply",
          authorKey: ME,
          body: "on it",
          createdAt: 2_000,
          deletedAt: 3_000,
        }),
      ],
    });
    expect(items).toHaveLength(1);
  });

  it("a dangling comment (missing task or project) never surfaces", () => {
    expect(ask({ comments: [comment({})], tasks: [] })).toHaveLength(0);
    expect(ask({ comments: [comment({})], projects: [] })).toHaveLength(0);
  });
});

describe("askedOfYou — blocking swallows mentions (docs/mentions.md D6)", () => {
  it("a mention by a blocked member never surfaces", () => {
    // The thread view already hides the comment (docs/blocking.md §6);
    // the derived list must never resurrect what the blocker chose not
    // to see — otherwise mentions bypass blocking.
    const items = ask({
      comments: [comment({})],
      blockedKeys: new Set([ROSA]),
    });
    expect(items).toHaveLength(0);
  });

  it("a mention inside a code span is code, not an ask", () => {
    const items = ask({
      comments: [comment({ body: `\`${mentionToken("Me", ME)}\`` })],
    });
    expect(items).toHaveLength(0);
  });
});
