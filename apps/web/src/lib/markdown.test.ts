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
  parseInline,
  parseMarkdown,
  sanitizeUrl,
  stripMarkdown,
  type MdBlock,
  type MdInline,
} from "./markdown";

// --- Small helpers for asserting on the AST --------------------------------

/** Recursively collect every node type present in a block list. */
function collectTypes(blocks: MdBlock[]): Set<string> {
  const types = new Set<string>();
  const walkInline = (nodes: MdInline[]) => {
    for (const node of nodes) {
      types.add(node.type);
      if (
        node.type === "strong" ||
        node.type === "em" ||
        node.type === "link"
      ) {
        walkInline(node.children);
      }
    }
  };
  for (const block of blocks) {
    types.add(block.type);
    if (block.type === "paragraph") walkInline(block.children);
    else block.items.forEach(walkInline);
  }
  return types;
}

/** The single paragraph's inline children, asserting there is exactly one
 *  paragraph block. */
function inlineOf(text: string): MdInline[] {
  const blocks = parseMarkdown(text);
  expect(blocks).toHaveLength(1);
  expect(blocks[0].type).toBe("paragraph");
  return (blocks[0] as Extract<MdBlock, { type: "paragraph" }>).children;
}

// ===========================================================================
// SECURITY / XSS — the most important block. Proves dangerous input is inert.
// ===========================================================================
describe("markdown — security / XSS", () => {
  it("drops a javascript: link to plain label text (no link node)", () => {
    // Note: the closing ) of `alert(1)` is the FIRST ) after the bracket, so
    // the captured raw URL is `javascript:alert(1` and the final ) survives
    // as literal text. Per spec we only require: NO link node, the visible
    // label preserved, and no href emitted.
    const nodes = parseInline("[x](javascript:alert(1))");
    expect(nodes.some((n) => n.type === "link")).toBe(false);
    // The visible label survives as text.
    expect(nodes.some((n) => n.type === "text" && n.value === "x")).toBe(true);
    // No href anywhere.
    expect(JSON.stringify(nodes)).not.toContain("href");
  });

  it("drops data:, vbscript:, protocol-relative, and relative links", () => {
    for (const url of [
      "data:text/html;base64,PHNjcmlwdD4=",
      "vbscript:msgbox",
      "//evil.com",
      "/relative",
      "./also-relative",
      "#frag",
    ]) {
      const nodes = parseInline(`[x](${url})`);
      expect(nodes.some((n) => n.type === "link")).toBe(false);
      // Label kept as text.
      expect(nodes).toEqual([{ type: "text", value: "x" }]);
    }
  });

  it("keeps a literal <script> tag as inert text, injecting no nodes", () => {
    const input = "<script>alert(1)</script>";
    const nodes = parseInline(input);
    // Exactly one text node, value preserved verbatim.
    expect(nodes).toEqual([{ type: "text", value: input }]);
    // None of the structural types leaked in.
    for (const node of nodes) {
      expect(["strong", "em", "code", "link", "br"]).not.toContain(node.type);
    }
  });

  it("keeps an <img onerror=...> payload as inert verbatim text", () => {
    const input = "<img src=x onerror=alert(1)>";
    const nodes = parseInline(input);
    expect(nodes).toEqual([{ type: "text", value: input }]);
    expect(nodes.some((n) => n.type === "link")).toBe(false);
  });

  it("rejects URLs containing control chars or whitespace via sanitizeUrl", () => {
    expect(sanitizeUrl("java\tscript:alert(1)")).toBeNull();
    expect(sanitizeUrl("https://e\nvil.com")).toBeNull();
    expect(sanitizeUrl("https://has space.com")).toBeNull();
    // A NUL byte smuggled into an otherwise-valid-looking URL is rejected.
    expect(sanitizeUrl("https://evil\x00.com")).toBeNull();
    expect(sanitizeUrl("\x01https://x.org")).toBeNull();
  });

  it("accepts only http(s) and mailto in sanitizeUrl", () => {
    expect(sanitizeUrl("http://x.org")).toBe("http://x.org");
    expect(sanitizeUrl("HTTPS://Example.com")).toBe("HTTPS://Example.com");
    expect(sanitizeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("data:text/html,x")).toBeNull();
    expect(sanitizeUrl("vbscript:x")).toBeNull();
    expect(sanitizeUrl("//evil.com")).toBeNull();
    expect(sanitizeUrl("/relative")).toBeNull();
    expect(sanitizeUrl("ftp://x.org")).toBeNull();
  });

  it("preserves a safe https link with the href intact", () => {
    const nodes = parseInline("[x](HTTPS://Example.com)");
    expect(nodes).toEqual([
      {
        type: "link",
        href: "HTTPS://Example.com",
        children: [{ type: "text", value: "x" }],
      },
    ]);
  });

  it("preserves a mailto link with the href intact", () => {
    const nodes = parseInline("[email](mailto:a@b.com)");
    expect(nodes).toEqual([
      {
        type: "link",
        href: "mailto:a@b.com",
        children: [{ type: "text", value: "email" }],
      },
    ]);
  });
});

// ===========================================================================
// INLINE correctness
// ===========================================================================
describe("markdown — emphasis", () => {
  it("parses **bold** and __bold__ as strong", () => {
    expect(parseInline("**bold**")).toEqual([
      { type: "strong", children: [{ type: "text", value: "bold" }] },
    ]);
    expect(parseInline("__bold__")).toEqual([
      { type: "strong", children: [{ type: "text", value: "bold" }] },
    ]);
  });

  it("parses *it* and _it_ as em", () => {
    expect(parseInline("*it*")).toEqual([
      { type: "em", children: [{ type: "text", value: "it" }] },
    ]);
    expect(parseInline("_it_")).toEqual([
      { type: "em", children: [{ type: "text", value: "it" }] },
    ]);
  });

  it("does NOT emphasize intra-word underscores or asterisks", () => {
    // snake_case: underscores are word-internal.
    expect(parseInline("snake_case")).toEqual([
      { type: "text", value: "snake_case" },
    ]);
    expect(parseInline("snake__case")).toEqual([
      { type: "text", value: "snake__case" },
    ]);
    // 5_000 and a_b: digits/letters flank the underscore.
    expect(parseInline("5_000")).toEqual([{ type: "text", value: "5_000" }]);
    expect(parseInline("a_b")).toEqual([{ type: "text", value: "a_b" }]);
    // a*b: asterisk needs a non-space close; `b` is fine to OPEN, but there
    // is no closing `*`, so it stays literal.
    expect(parseInline("a*b")).toEqual([{ type: "text", value: "a*b" }]);
  });

  it("treats unmatched ** and a lone backtick as literal", () => {
    expect(parseInline("**unclosed")).toEqual([
      { type: "text", value: "**unclosed" },
    ]);
    expect(parseInline("a ` b")).toEqual([{ type: "text", value: "a ` b" }]);
  });

  it("does not open emphasis when the delimiter is followed by a space", () => {
    // Strong fails (space after the opening `**`); em is deliberately not
    // tried on the doubled run, so the whole thing stays literal.
    expect(parseInline("** nope **")).toEqual([
      { type: "text", value: "** nope **" },
    ]);
    // The single-delimiter space case also stays literal.
    expect(parseInline("* nope *")).toEqual([
      { type: "text", value: "* nope *" },
    ]);
  });

  it("nests em inside strong", () => {
    expect(parseInline("**bold _em_**")).toEqual([
      {
        type: "strong",
        children: [
          { type: "text", value: "bold " },
          { type: "em", children: [{ type: "text", value: "em" }] },
        ],
      },
    ]);
  });
});

describe("markdown — code spans and escapes", () => {
  it("does not emphasize inside a code span", () => {
    expect(parseInline("`code with * inside`")).toEqual([
      { type: "code", value: "code with * inside" },
    ]);
  });

  it("honors backslash escapes of markup characters", () => {
    expect(parseInline("\\*literal\\*")).toEqual([
      { type: "text", value: "*literal*" },
    ]);
    expect(parseInline("\\[not a link\\]")).toEqual([
      { type: "text", value: "[not a link]" },
    ]);
  });
});

describe("markdown — links and autolinks", () => {
  it("treats an incomplete [..]( pattern as a literal bracket", () => {
    expect(parseInline("[label] no paren")).toEqual([
      { type: "text", value: "[label] no paren" },
    ]);
  });

  it("autolinks a bare https URL and trims trailing sentence punctuation", () => {
    const nodes = parseInline("see https://x.org/a.");
    expect(nodes).toEqual([
      { type: "text", value: "see " },
      {
        type: "link",
        href: "https://x.org/a",
        children: [{ type: "text", value: "https://x.org/a" }],
      },
      { type: "text", value: "." },
    ]);
  });

  it("shows the full URL (scheme + trailing slash) as autolink display text", () => {
    // The href and the DISPLAY text are now identical: we show the whole URL
    // so the member sees the exact destination of an untrusted link.
    const nodes = parseInline("https://example.com/");
    expect(nodes).toEqual([
      {
        type: "link",
        href: "https://example.com/",
        children: [{ type: "text", value: "https://example.com/" }],
      },
    ]);
  });

  it("does NOT autolink a URL glued to the end of a word", () => {
    // No boundary before `https` → not an autolink, stays literal text.
    expect(parseInline("xhttps://x.org")).toEqual([
      { type: "text", value: "xhttps://x.org" },
    ]);
  });

  it("autolinks after an opening boundary character", () => {
    const nodes = parseInline("(https://x.org)");
    expect(nodes).toEqual([
      { type: "text", value: "(" },
      {
        type: "link",
        href: "https://x.org",
        children: [{ type: "text", value: "https://x.org" }],
      },
      { type: "text", value: ")" },
    ]);
  });
});

// ===========================================================================
// BLOCK correctness
// ===========================================================================
describe("markdown — blocks", () => {
  it("parses a bullet list with -, *, and + markers as one list", () => {
    const blocks = parseMarkdown("- one\n* two\n+ three");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "list",
      ordered: false,
      items: [
        [{ type: "text", value: "one" }],
        [{ type: "text", value: "two" }],
        [{ type: "text", value: "three" }],
      ],
    });
  });

  it("parses an ordered list", () => {
    const blocks = parseMarkdown("1. first\n2. second");
    expect(blocks).toEqual([
      {
        type: "list",
        ordered: true,
        items: [
          [{ type: "text", value: "first" }],
          [{ type: "text", value: "second" }],
        ],
      },
    ]);
  });

  it("splits a bullet→ordered transition into two list blocks", () => {
    const blocks = parseMarkdown("- bullet\n1. ordered");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: "list", ordered: false });
    expect(blocks[1]).toMatchObject({ type: "list", ordered: true });
  });

  it("separates paragraphs on a blank line", () => {
    const blocks = parseMarkdown("para one\n\npara two");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "para one" }],
    });
    expect(blocks[1]).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "para two" }],
    });
  });

  it("turns a single newline inside a paragraph into a br", () => {
    const blocks = parseMarkdown("line one\nline two");
    expect(blocks).toEqual([
      {
        type: "paragraph",
        children: [
          { type: "text", value: "line one" },
          { type: "br" },
          { type: "text", value: "line two" },
        ],
      },
    ]);
  });

  it("normalizes CRLF and CR to LF before splitting", () => {
    const blocks = parseMarkdown("a\r\n\r\nb\rc");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "a" }],
    });
    // "b\rc" → "b\nc" → one paragraph with a br.
    expect(blocks[1]).toEqual({
      type: "paragraph",
      children: [
        { type: "text", value: "b" },
        { type: "br" },
        { type: "text", value: "c" },
      ],
    });
  });

  it("does NOT special-case # or > lines (they are plain text)", () => {
    const blocks = parseMarkdown("# Heading\n> quote");
    // Both are non-marker lines in one paragraph (joined with a br).
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("paragraph");
    expect(blocks[0]).toEqual({
      type: "paragraph",
      children: [
        { type: "text", value: "# Heading" },
        { type: "br" },
        { type: "text", value: "> quote" },
      ],
    });
    // No heading/blockquote structure is introduced — the markers are text.
    const types = collectTypes(blocks);
    expect(types.has("link")).toBe(false);
    expect(types.has("strong")).toBe(false);
  });

  it("trims leading and trailing blank lines", () => {
    const blocks = parseMarkdown("\n\nhello\n\n");
    expect(blocks).toEqual([
      { type: "paragraph", children: [{ type: "text", value: "hello" }] },
    ]);
  });

  it("inlineOf helper sees emphasis + autolink together", () => {
    const nodes = inlineOf("**hi** and https://x.org");
    expect(nodes[0]).toEqual({
      type: "strong",
      children: [{ type: "text", value: "hi" }],
    });
    expect(nodes.some((n) => n.type === "link")).toBe(true);
  });
});

// ===========================================================================
// stripMarkdown
// ===========================================================================
describe("stripMarkdown", () => {
  it("flattens emphasis, link syntax, and a list to a clean one-liner", () => {
    const out = stripMarkdown(
      "**Sat 9am** see https://x.org/s — bring: \n- gloves",
    );
    expect(out).toBe("Sat 9am see https://x.org/s — bring: gloves");
    // No raw syntax leaks through.
    expect(out).not.toContain("*");
    expect(out).not.toContain("[");
    expect(out).not.toContain("]");
  });

  it("joins blocks with a space and list items with commas", () => {
    expect(stripMarkdown("intro\n\n- a\n- b\n- c")).toBe("intro a, b, c");
  });

  it("keeps code span content but drops the backticks", () => {
    expect(stripMarkdown("run `npm test` now")).toBe("run npm test now");
  });

  it("collapses whitespace and trims", () => {
    expect(stripMarkdown("  lots   of\n\n\n  space  ")).toBe("lots of space");
  });

  it("shows a dropped unsafe link as its plain label", () => {
    // Dropped link keeps the label; the stray trailing ) (the nested-paren
    // artifact of the first-) close rule) rides along but no syntax leaks.
    const out = stripMarkdown("[click](javascript:alert(1))");
    expect(out).toContain("click");
    expect(out).not.toContain("[");
    expect(out).not.toContain("javascript");
  });

  it("shows a dropped unsafe link cleanly when the URL has no nested parens", () => {
    expect(stripMarkdown("[click](vbscript:x)")).toBe("click");
  });
});
