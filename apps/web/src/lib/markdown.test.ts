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
  type MdListItem,
} from "./markdown";

// --- Helpers for the new list item shape -----------------------------------

/** An ordinary (non-task) list item with the given inline content and no
 *  nested children — the common case in these tests. */
function item(content: MdInline[]): MdListItem {
  return { checked: null, content, children: [] };
}

/** A single text-only list item: `textItem("a")` → item with text "a". */
function textItem(value: string): MdListItem {
  return item([{ type: "text", value }]);
}

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
        node.type === "del" ||
        node.type === "link"
      ) {
        walkInline(node.children);
      }
    }
  };
  const walkBlocks = (bs: MdBlock[]) => {
    for (const block of bs) {
      types.add(block.type);
      switch (block.type) {
        case "paragraph":
        case "heading":
          walkInline(block.children);
          break;
        case "blockquote":
          walkBlocks(block.children);
          break;
        case "list":
          block.items.forEach((item) => {
            walkInline(item.content);
            walkBlocks(item.children);
          });
          break;
        case "table":
          block.header.forEach(walkInline);
          block.rows.forEach((row) => row.forEach(walkInline));
          break;
        // codeBlock / hr carry no inline children.
      }
    }
  };
  walkBlocks(blocks);
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

  it("image syntax NEVER yields an image node or an <img> string", () => {
    const nodes = parseInline("![alt text](https://e/i.png)");
    // Degrades to a safe LINK, never an image. No "image" type exists.
    expect(nodes).toEqual([
      {
        type: "link",
        href: "https://e/i.png",
        children: [{ type: "text", value: "alt text" }],
      },
    ]);
    expect(JSON.stringify(nodes)).not.toContain("image");
    expect(JSON.stringify(nodes)).not.toContain("img");
  });

  it("image with an unsafe javascript: url drops to text, never a link/img", () => {
    const nodes = parseInline("![alt](javascript:alert(1))");
    expect(nodes.some((node) => node.type === "link")).toBe(false);
    // The alt text survives; no href, no image, no javascript scheme.
    expect(nodes.some((node) => node.type === "text" && node.value === "alt")).toBe(
      true,
    );
    expect(JSON.stringify(nodes)).not.toContain("href");
    expect(JSON.stringify(nodes)).not.toContain("javascript");
    expect(JSON.stringify(nodes)).not.toContain("image");
  });

  it("keeps <script> inside a fenced code block as inert verbatim text", () => {
    const blocks = parseMarkdown("```\n<script>alert(1)</script>\n```");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "codeBlock",
      lang: null,
      value: "<script>alert(1)</script>",
    });
    // No structural node was injected from the dangerous content — it is a
    // plain string in `value`, never parsed as markup.
    expect(collectTypes(blocks).has("link")).toBe(false);
  });

  it("drops an unsafe link inside a heading to plain text", () => {
    const blocks = parseMarkdown("# Title [x](javascript:alert(1))");
    expect(blocks[0].type).toBe("heading");
    const types = collectTypes(blocks);
    expect(types.has("link")).toBe(false);
    expect(JSON.stringify(blocks)).not.toContain("javascript");
  });

  it("drops an unsafe link inside a blockquote to plain text", () => {
    const blocks = parseMarkdown("> see [x](javascript:alert(1))");
    expect(blocks[0].type).toBe("blockquote");
    expect(collectTypes(blocks).has("link")).toBe(false);
    expect(JSON.stringify(blocks)).not.toContain("javascript");
  });

  it("drops an unsafe link inside a table cell to plain text", () => {
    const blocks = parseMarkdown(
      "| a | b |\n| --- | --- |\n| [x](javascript:alert(1)) | ok |",
    );
    expect(blocks[0].type).toBe("table");
    expect(collectTypes(blocks).has("link")).toBe(false);
    expect(JSON.stringify(blocks)).not.toContain("javascript");
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

describe("markdown — strikethrough", () => {
  it("parses ~~text~~ as a del node with recursively-parsed children", () => {
    expect(parseInline("~~gone~~")).toEqual([
      { type: "del", children: [{ type: "text", value: "gone" }] },
    ]);
    // Inner is recursively parsed: emphasis inside strikethrough works.
    expect(parseInline("~~a *b*~~")).toEqual([
      {
        type: "del",
        children: [
          { type: "text", value: "a " },
          { type: "em", children: [{ type: "text", value: "b" }] },
        ],
      },
    ]);
  });

  it("leaves a single ~ and an unmatched ~~ as literal text", () => {
    expect(parseInline("a ~ b")).toEqual([{ type: "text", value: "a ~ b" }]);
    expect(parseInline("~~unclosed")).toEqual([
      { type: "text", value: "~~unclosed" },
    ]);
    // Flanking: a space after the opening run does not open.
    expect(parseInline("~~ nope ~~")).toEqual([
      { type: "text", value: "~~ nope ~~" },
    ]);
  });

  it("does not interfere with code spans, emphasis, or links", () => {
    // `~` inside a code span is inert.
    expect(parseInline("`a ~~b~~ c`")).toEqual([
      { type: "code", value: "a ~~b~~ c" },
    ]);
    // Strikethrough wrapping a link.
    expect(parseInline("~~[x](https://e)~~")).toEqual([
      {
        type: "del",
        children: [
          {
            type: "link",
            href: "https://e",
            children: [{ type: "text", value: "x" }],
          },
        ],
      },
    ]);
  });
});

describe("markdown — image as safe link", () => {
  it("turns ![alt](url) into a link to the url with the alt as label", () => {
    expect(parseInline("![alt](https://e/i.png)")).toEqual([
      {
        type: "link",
        href: "https://e/i.png",
        children: [{ type: "text", value: "alt" }],
      },
    ]);
  });

  it("uses the url as the label when the alt text is empty", () => {
    expect(parseInline("![](https://e/i.png)")).toEqual([
      {
        type: "link",
        href: "https://e/i.png",
        children: [{ type: "text", value: "https://e/i.png" }],
      },
    ]);
  });

  it("drops to just the alt text for an unsafe image url", () => {
    expect(parseInline("![alt](vbscript:x)")).toEqual([
      { type: "text", value: "alt" },
    ]);
  });

  it("leaves a bare ! (not followed by a valid bracket) as a literal char", () => {
    expect(parseInline("hi! there")).toEqual([
      { type: "text", value: "hi! there" },
    ]);
    expect(parseInline("![not a link")).toEqual([
      { type: "text", value: "![not a link" },
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
      items: [textItem("one"), textItem("two"), textItem("three")],
    });
  });

  it("parses an ordered list", () => {
    const blocks = parseMarkdown("1. first\n2. second");
    expect(blocks).toEqual([
      {
        type: "list",
        ordered: true,
        items: [textItem("first"), textItem("second")],
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

  it("now treats # and > as heading / blockquote (the SAFE set)", () => {
    // A `#` line becomes a heading and a `>` line becomes a blockquote; the
    // blank-line-free transition between them ends the heading at the `>`.
    const blocks = parseMarkdown("# Heading\n> quote");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "heading",
      level: 1,
      children: [{ type: "text", value: "Heading" }],
    });
    expect(blocks[1]).toMatchObject({ type: "blockquote" });
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
// BLOCK — headings
// ===========================================================================
describe("markdown — headings", () => {
  it("parses levels 1..6 from the # run length", () => {
    for (let level = 1; level <= 6; level++) {
      const hashes = "#".repeat(level);
      const blocks = parseMarkdown(`${hashes} Title`);
      expect(blocks).toEqual([
        {
          type: "heading",
          level,
          children: [{ type: "text", value: "Title" }],
        },
      ]);
    }
  });

  it("strips an optional trailing run of # and surrounding spaces", () => {
    expect(parseMarkdown("## Title ##")).toEqual([
      { type: "heading", level: 2, children: [{ type: "text", value: "Title" }] },
    ]);
    expect(parseMarkdown("# Title #####  ")).toEqual([
      { type: "heading", level: 1, children: [{ type: "text", value: "Title" }] },
    ]);
  });

  it("inline-parses the heading text", () => {
    expect(parseMarkdown("# A **bold** title")).toEqual([
      {
        type: "heading",
        level: 1,
        children: [
          { type: "text", value: "A " },
          { type: "strong", children: [{ type: "text", value: "bold" }] },
          { type: "text", value: " title" },
        ],
      },
    ]);
  });

  it("a # with no following space is NOT a heading (literal paragraph)", () => {
    const blocks = parseMarkdown("#notaheading");
    expect(blocks).toEqual([
      { type: "paragraph", children: [{ type: "text", value: "#notaheading" }] },
    ]);
  });

  it("does not allow 7+ hashes (stays a paragraph)", () => {
    const blocks = parseMarkdown("####### too many");
    expect(blocks[0].type).toBe("paragraph");
  });
});

// ===========================================================================
// BLOCK — blockquotes
// ===========================================================================
describe("markdown — blockquotes", () => {
  it("groups consecutive > lines and recursively parses the inner text", () => {
    const blocks = parseMarkdown("> line one\n> line two");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "blockquote",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "line one" },
            { type: "br" },
            { type: "text", value: "line two" },
          ],
        },
      ],
    });
  });

  it("can hold a list inside the quote", () => {
    const blocks = parseMarkdown("> - a\n> - b");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: "blockquote" });
    const bq = blocks[0] as Extract<MdBlock, { type: "blockquote" }>;
    expect(bq.children).toEqual([
      { type: "list", ordered: false, items: [textItem("a"), textItem("b")] },
    ]);
  });

  it("ends the quote at a blank or non-> line", () => {
    const blocks = parseMarkdown("> quoted\n\nafter");
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("blockquote");
    expect(blocks[1]).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "after" }],
    });
  });
});

// ===========================================================================
// BLOCK — fenced code blocks
// ===========================================================================
describe("markdown — fenced code blocks", () => {
  it("captures ``` fenced content verbatim with no inline parsing", () => {
    const blocks = parseMarkdown("```\nconst x = *not emphasized*;\n```");
    expect(blocks).toEqual([
      {
        type: "codeBlock",
        lang: null,
        value: "const x = *not emphasized*;",
      },
    ]);
  });

  it("captures the optional language token", () => {
    const blocks = parseMarkdown("```ts\nlet n = 1;\n```");
    expect(blocks).toEqual([
      { type: "codeBlock", lang: "ts", value: "let n = 1;" },
    ]);
  });

  it("supports ~~~ fences too", () => {
    const blocks = parseMarkdown("~~~\na\nb\n~~~");
    expect(blocks).toEqual([
      { type: "codeBlock", lang: null, value: "a\nb" },
    ]);
  });

  it("keeps multiple inner lines joined by \\n with no trailing newline", () => {
    const blocks = parseMarkdown("```\nline1\nline2\nline3\n```");
    expect(blocks).toEqual([
      { type: "codeBlock", lang: null, value: "line1\nline2\nline3" },
    ]);
  });

  it("treats markup and <script> inside the fence as inert text", () => {
    const blocks = parseMarkdown("```\n# not a heading\n<script>x</script>\n```");
    expect(blocks).toEqual([
      {
        type: "codeBlock",
        lang: null,
        value: "# not a heading\n<script>x</script>",
      },
    ]);
  });

  it("runs to EOF when the closing fence is missing", () => {
    const blocks = parseMarkdown("```\nunterminated\nmore");
    expect(blocks).toEqual([
      { type: "codeBlock", lang: null, value: "unterminated\nmore" },
    ]);
  });

  it("requires the closing fence to be at least as long as the opener", () => {
    // A shorter ``` inside a ```` block is part of the content, not a close.
    const blocks = parseMarkdown("````\na\n```\nb\n````");
    expect(blocks).toEqual([
      { type: "codeBlock", lang: null, value: "a\n```\nb" },
    ]);
  });
});

// ===========================================================================
// BLOCK — horizontal rules
// ===========================================================================
describe("markdown — horizontal rules", () => {
  it("parses ---, ***, and ___ as an hr", () => {
    for (const rule of ["---", "***", "___", "- - -", "* * *", "___ "]) {
      const blocks = parseMarkdown(rule);
      expect(blocks).toEqual([{ type: "hr" }]);
    }
  });

  it("does NOT treat `- item` as an hr (it is a bullet list)", () => {
    const blocks = parseMarkdown("- item");
    expect(blocks).toEqual([
      { type: "list", ordered: false, items: [textItem("item")] },
    ]);
  });

  it("does NOT treat `-- ` (only two dashes) as an hr", () => {
    const blocks = parseMarkdown("--");
    expect(blocks[0].type).toBe("paragraph");
  });
});

// ===========================================================================
// BLOCK — nested + task lists
// ===========================================================================
describe("markdown — nested + task lists", () => {
  it("nests an indented sub-list under its parent item (2 levels)", () => {
    const blocks = parseMarkdown("- outer\n  - inner1\n  - inner2\n- outer2");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "list",
      ordered: false,
      items: [
        {
          checked: null,
          content: [{ type: "text", value: "outer" }],
          children: [
            {
              type: "list",
              ordered: false,
              items: [textItem("inner1"), textItem("inner2")],
            },
          ],
        },
        textItem("outer2"),
      ],
    });
  });

  it("nests an ordered sub-list under a bullet item", () => {
    const blocks = parseMarkdown("- outer\n  1. one\n  2. two");
    const list = blocks[0] as Extract<MdBlock, { type: "list" }>;
    expect(list.items[0].children).toEqual([
      {
        type: "list",
        ordered: true,
        items: [textItem("one"), textItem("two")],
      },
    ]);
  });

  it("parses [x] / [X] / [ ] task items and strips the token", () => {
    const blocks = parseMarkdown("- [x] done\n- [X] also\n- [ ] todo");
    expect(blocks).toEqual([
      {
        type: "list",
        ordered: false,
        items: [
          { checked: true, content: [{ type: "text", value: "done" }], children: [] },
          { checked: true, content: [{ type: "text", value: "also" }], children: [] },
          { checked: false, content: [{ type: "text", value: "todo" }], children: [] },
        ],
      },
    ]);
  });

  it("leaves checked null for ordinary items", () => {
    const blocks = parseMarkdown("- plain");
    const list = blocks[0] as Extract<MdBlock, { type: "list" }>;
    expect(list.items[0].checked).toBeNull();
  });
});

// ===========================================================================
// BLOCK — GFM tables
// ===========================================================================
describe("markdown — GFM tables", () => {
  it("parses a header, delimiter, and body rows with alignment", () => {
    const blocks = parseMarkdown(
      "| L | C | R |\n| :--- | :--: | ---: |\n| a | b | c |\n| d | e | f |",
    );
    expect(blocks).toEqual([
      {
        type: "table",
        align: ["left", "center", "right"],
        header: [
          [{ type: "text", value: "L" }],
          [{ type: "text", value: "C" }],
          [{ type: "text", value: "R" }],
        ],
        rows: [
          [
            [{ type: "text", value: "a" }],
            [{ type: "text", value: "b" }],
            [{ type: "text", value: "c" }],
          ],
          [
            [{ type: "text", value: "d" }],
            [{ type: "text", value: "e" }],
            [{ type: "text", value: "f" }],
          ],
        ],
      },
    ]);
  });

  it("defaults alignment to null when a delimiter cell has no colons", () => {
    const blocks = parseMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |");
    const table = blocks[0] as Extract<MdBlock, { type: "table" }>;
    expect(table.align).toEqual([null, null]);
  });

  it("inline-parses cell content", () => {
    const blocks = parseMarkdown("| h |\n| --- |\n| **b** |");
    const table = blocks[0] as Extract<MdBlock, { type: "table" }>;
    expect(table.rows[0][0]).toEqual([
      { type: "strong", children: [{ type: "text", value: "b" }] },
    ]);
  });

  it("falls back to a paragraph when the delimiter row is missing/invalid", () => {
    // A pipe line not followed by a valid delimiter is ordinary text.
    const blocks = parseMarkdown("| a | b |\nnot a delimiter");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("paragraph");
  });

  it("ends the table at a blank or non-pipe line", () => {
    const blocks = parseMarkdown("| a |\n| --- |\n| 1 |\nafter");
    expect(blocks).toHaveLength(2);
    expect(blocks[0].type).toBe("table");
    expect(blocks[1]).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "after" }],
    });
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

  it("flattens a heading to its text (no leading #)", () => {
    const out = stripMarkdown("## Section title");
    expect(out).toBe("Section title");
    expect(out).not.toContain("#");
  });

  it("flattens a blockquote to its inner text (no leading >)", () => {
    const out = stripMarkdown("> a wise saying");
    expect(out).toBe("a wise saying");
    expect(out).not.toContain(">");
  });

  it("flattens a fenced code block to its collapsed value (no fences)", () => {
    const out = stripMarkdown("```ts\nconst x = 1;\nconst y = 2;\n```");
    expect(out).toBe("const x = 1; const y = 2;");
    expect(out).not.toContain("`");
  });

  it("flattens strikethrough to its children text (no ~)", () => {
    const out = stripMarkdown("this is ~~struck~~ out");
    expect(out).toBe("this is struck out");
    expect(out).not.toContain("~");
  });

  it("skips an hr entirely", () => {
    expect(stripMarkdown("before\n\n---\n\nafter")).toBe("before after");
  });

  it("flattens nested list items, keeping nested text", () => {
    const out = stripMarkdown("- outer\n  - inner");
    expect(out).toBe("outer inner");
  });

  it("flattens a task list, stripping the checkbox token", () => {
    const out = stripMarkdown("- [x] done\n- [ ] todo");
    expect(out).toBe("done, todo");
    expect(out).not.toContain("[");
    expect(out).not.toContain("]");
  });

  it("flattens a table to its cell texts joined by spaces", () => {
    const out = stripMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |");
    expect(out).toBe("a b 1 2");
    expect(out).not.toContain("|");
    expect(out).not.toContain("-");
  });

  it("flattens an image-as-link to its alt/url text (no ! or syntax)", () => {
    expect(stripMarkdown("![a cat](https://e/cat.png)")).toBe("a cat");
  });
});
