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

// ============================================================================
// Tiny, dependency-free, XSS-safe Markdown subset.
//
// This module is the SECURITY BOUNDARY for rendering federated / untrusted
// text. It is intentionally a *parser only*: it turns a string into an
// abstract syntax tree (AST) of plain data objects. It NEVER produces HTML,
// never produces a string of markup, and never touches the DOM. The renderer
// (components/Markdown.tsx) walks this AST and emits React elements, so user
// content can only ever become *text* and a fixed, closed set of element
// types (p / strong / em / code / a / br / ul / ol / li). There is no code
// path by which an input string becomes raw markup, which is what makes the
// whole pipeline XSS-proof by construction.
//
// Two further hardening rules live here:
//   1. URLs are run through `sanitizeUrl`, which allows ONLY http(s) and
//      mailto. `javascript:`, `data:`, `vbscript:`, protocol-relative
//      (`//evil`), and relative URLs are rejected. A rejected link is
//      dropped entirely (its visible label survives as plain text), so no
//      `<a href>` ever carries a dangerous scheme.
//   2. Raw angle brackets / HTML in the input are NOT parsed as markup. A
//      literal `<script>...</script>` is just text; it ends up as a
//      `{type:"text"}` node and the renderer prints it verbatim and inert.
// ============================================================================

/** A leaf or nested run of inline (within-paragraph) content. */
export type MdInline =
  | { type: "text"; value: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "em"; children: MdInline[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: MdInline[] }
  | { type: "br" };

/** A top-level block. Deliberately flat: no nested lists, no blockquotes. */
export type MdBlock =
  | { type: "paragraph"; children: MdInline[] }
  | { type: "list"; ordered: boolean; items: MdInline[][] };

// Bullet list marker: up to 3 leading spaces, then -, * or +, then >=1 space.
const BULLET_RE = /^[ ]{0,3}[-*+][ ]+/;
// Ordered list marker: up to 3 leading spaces, then digits, a dot, >=1 space.
const ORDERED_RE = /^[ ]{0,3}\d+\.[ ]+/;

// Matches any ASCII control character (U+0000..U+001F, U+007F) OR any
// whitespace. Used by sanitizeUrl to reject obfuscated URLs.
const UNSAFE_URL_CHAR_RE = new RegExp("[\\x00-\\x1f\\x7f\\s]");

/**
 * Validate and normalize a URL pulled from `[label](url)` or a bare autolink.
 *
 * SECURITY: this is the allow-list that keeps dangerous schemes out of every
 * `href` we ever emit. Returns the cleaned URL string when safe, or `null`
 * when the caller must DROP the link.
 *
 *   - Trim surrounding whitespace.
 *   - Reject if it contains any ASCII control character or any whitespace
 *     (a tab/newline/space inside a URL is a classic obfuscation vector,
 *     e.g. `java\tscript:`, so we never even reach scheme parsing for those).
 *   - Allow ONLY when it begins with `http://`, `https://` (case-insensitive)
 *     or `mailto:`. Everything else (`javascript:`, `data:`, `vbscript:`,
 *     `//evil.com` protocol-relative, `/relative`, `./x`, `#frag`) is
 *     rejected.
 */
export function sanitizeUrl(raw: string): string | null {
  const u = raw.trim();
  if (UNSAFE_URL_CHAR_RE.test(u)) return null;
  if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u)) return u;
  return null;
}

// Characters a backslash may escape into a literal. Mirrors the small set of
// markup characters this subset understands.
const ESCAPABLE = new Set(["*", "_", "`", "[", "]", "(", ")", "\\"]);

// Trailing punctuation stripped off a bare autolinked URL so sentence
// punctuation ("see https://x.org/a.") is not swallowed into the link.
const AUTOLINK_TRAILING = new Set([
  ".",
  ",",
  ";",
  ":",
  "!",
  "?",
  ")",
  "]",
  "}",
  "'",
  '"',
]);

/** True when `ch` is an ASCII alphanumeric. Used for `_`/`__` word-boundary
 *  gating so `snake_case` / `5_000` / `a_b` are NOT emphasized. */
function isAlnum(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return /[0-9A-Za-z]/.test(ch);
}

/** True when the character `before` is a valid left boundary for a bare
 *  autolink: start-of-string (undefined), whitespace, or one of `(` `[`. */
function isAutolinkBoundary(before: string | undefined): boolean {
  if (before === undefined) return true;
  if (/\s/.test(before)) return true;
  return before === "(" || before === "[";
}

/**
 * Parse a single line/segment string into inline nodes.
 *
 * A left-to-right scan with an explicit literal-text buffer. At each index we
 * try a fixed priority list of constructs; the FIRST that matches wins.
 * Anything that doesn't match a construct (or a construct that fails to find
 * its closing delimiter) is appended to the buffer as literal text. The
 * buffer is flushed to a `{type:"text"}` node whenever we emit a structured
 * node or reach the end.
 */
export function parseInline(s: string): MdInline[] {
  const out: MdInline[] = [];
  let buf = "";

  const flush = () => {
    if (buf.length > 0) {
      out.push({ type: "text", value: buf });
      buf = "";
    }
  };

  let i = 0;
  const n = s.length;

  while (i < n) {
    const ch = s[i];

    // (1) Backslash escape: \ followed by an escapable char -> literal char.
    if (ch === "\\" && i + 1 < n && ESCAPABLE.has(s[i + 1])) {
      buf += s[i + 1];
      i += 2;
      continue;
    }

    // (2) Code span: `...`. The inner text is taken VERBATIM, with no further
    //     parsing inside, so `* _ [ ]` etc. inside backticks are inert. If
    //     there is no closing backtick the opening one is a literal char.
    if (ch === "`") {
      const close = s.indexOf("`", i + 1);
      if (close !== -1) {
        flush();
        out.push({ type: "code", value: s.slice(i + 1, close) });
        i = close + 1;
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }

    // (3) Link: [label](url). Find the first ] after [, require the next
    //     char to be ( and find its closing ). If sanitizeUrl succeeds we
    //     emit a link; if it FAILS (dangerous/relative scheme) we DROP the
    //     anchor and keep the label as plain inline text, never an <a>. If
    //     the bracket pattern does not fully match, `[` is a literal char.
    if (ch === "[") {
      const closeBracket = s.indexOf("]", i + 1);
      if (closeBracket !== -1 && s[closeBracket + 1] === "(") {
        const closeParen = s.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const label = s.slice(i + 1, closeBracket);
          const rawUrl = s.slice(closeBracket + 2, closeParen);
          const href = sanitizeUrl(rawUrl);
          flush();
          if (href !== null) {
            out.push({ type: "link", href, children: parseInline(label) });
          } else {
            // Unsafe URL: keep the visible label, drop the link entirely.
            out.push(...parseInline(label));
          }
          i = closeParen + 1;
          continue;
        }
      }
      buf += ch;
      i += 1;
      continue;
    }

    // (4) Autolink a bare http(s) URL, but only at a word boundary so a URL
    //     glued to the end of a word is not picked up mid-token. Trailing
    //     sentence punctuation is trimmed off the captured URL. The FULL URL
    //     (scheme included) is shown as the link text: for untrusted federated
    //     links, letting the member see the exact destination matters more
    //     than a tidier display.
    if ((ch === "h" || ch === "H") && isAutolinkBoundary(s[i - 1])) {
      const m = /^https?:\/\/[^\s<>]+/i.exec(s.slice(i));
      if (m) {
        let url = m[0];
        while (url.length > 0 && AUTOLINK_TRAILING.has(url[url.length - 1])) {
          url = url.slice(0, -1);
        }
        if (url.length > 0) {
          // The regex already guaranteed http(s), but re-validate so the
          // single allow-list in sanitizeUrl stays the only gate.
          const href = sanitizeUrl(url);
          if (href !== null) {
            flush();
            out.push({
              type: "link",
              href,
              children: [{ type: "text", value: url }],
            });
            i += url.length;
            continue;
          }
        }
      }
      // Fall through: treat as ordinary character.
    }

    // (5) Strong: **...** or __...__. Checked BEFORE em so `**` is not read
    //     as two `*`. Opening run must be immediately followed by a non-
    //     space; the matching closing run must be immediately preceded by a
    //     non-space. For `__`, additionally require word boundaries on the
    //     outside (so `snake__case` is NOT emphasized).
    if (ch === "*" || ch === "_") {
      const delim = ch + ch;
      if (s.startsWith(delim, i)) {
        const strong = tryFlanked(s, i, delim, ch === "_");
        if (strong) {
          flush();
          out.push({ type: "strong", children: parseInline(strong.inner) });
          i = strong.end;
          continue;
        }
      }
      // (6) Em: *...* or _..._. Same flanking; `_` requires word boundaries
      //     (so `5_000` and `a_b` are NOT emphasized). We skip the em attempt
      //     when the very next char is the SAME delimiter (i.e. a `**`/`__`
      //     run whose strong match just failed): opening em on the doubled
      //     run would wrap a stray leading `*`/`_` as content (turning
      //     `** nope **` into an em around `* nope *`), which is never what
      //     the author meant. Leaving the delimiter literal is the calm
      //     outcome.
      if (s[i + 1] !== ch) {
        const em = tryFlanked(s, i, ch, ch === "_");
        if (em) {
          flush();
          out.push({ type: "em", children: parseInline(em.inner) });
          i = em.end;
          continue;
        }
      }
      buf += ch;
      i += 1;
      continue;
    }

    // (7) Otherwise: ordinary character.
    buf += ch;
    i += 1;
  }

  flush();
  return out;
}

/**
 * Try to match an emphasis run that opens with `delim` at index `i`.
 *
 * Flanking rules (a deliberately small subset of CommonMark):
 *   - The character immediately after the opening delimiter run must be a
 *     non-space (so `** foo**` does not open).
 *   - The character immediately before the closing delimiter run must be a
 *     non-space (so `**foo **` does not close there).
 *   - When `requireWordBoundary` is set (the `_`/`__` underscore forms), the
 *     character before the opening run and the character after the closing
 *     run must both be non-alphanumeric, so intra-word underscores
 *     (`snake_case`, `5_000`, `a_b`) never emphasize.
 *
 * Returns `{ inner, end }` (the text between the delimiters and the index just
 * past the closing delimiter) or `null` when there is no valid close.
 */
function tryFlanked(
  s: string,
  i: number,
  delim: string,
  requireWordBoundary: boolean,
): { inner: string; end: number } | null {
  const dlen = delim.length;
  // Opening delimiter must be followed by a non-space (and must exist).
  const afterOpen = s[i + dlen];
  if (afterOpen === undefined || /\s/.test(afterOpen)) return null;
  // Underscore forms: char before the opening run must not be alphanumeric.
  if (requireWordBoundary && isAlnum(s[i - 1])) return null;

  // Scan forward for a valid closing delimiter run.
  let j = i + dlen;
  while (j < s.length) {
    const at = s.indexOf(delim, j);
    if (at === -1) return null;
    const beforeClose = s[at - 1];
    // Closing run must be immediately preceded by a non-space and must leave
    // a non-empty inner string (rejects `****` / `__` adjacency).
    if (at > i + dlen && beforeClose !== undefined && !/\s/.test(beforeClose)) {
      const afterClose = s[at + dlen];
      // Underscore forms: char after the closing run must not be alnum.
      if (!requireWordBoundary || !isAlnum(afterClose)) {
        return { inner: s.slice(i + dlen, at), end: at + dlen };
      }
    }
    j = at + dlen;
  }
  return null;
}

/**
 * Parse a whole text document into top-level blocks.
 *
 * Steps:
 *   1. Normalize CRLF / CR newlines to LF.
 *   2. Split into lines; group runs of consecutive non-blank lines into
 *      blocks separated by one or more blank lines.
 *   3. A run whose lines are ALL bullet markers (or ALL ordered markers) is a
 *      list; the FIRST line decides `ordered`, and a switch in marker kind
 *      ends the list and starts a new block.
 *   4. Any other run is a paragraph: its lines are joined with `\n`, then
 *      parsed inline (a single `\n` becomes a `{type:"br"}`, the app's
 *      existing hard-newline behavior).
 *
 * Headings (#), blockquotes (>), and code fences (```) are NOT special; such
 * lines are ordinary paragraph text.
 */
export function parseMarkdown(text: string): MdBlock[] {
  // (1) Normalize newlines.
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  const blocks: MdBlock[] = [];
  let i = 0;
  const n = lines.length;

  const isBlank = (line: string) => line.trim() === "";
  const markerKind = (line: string): "bullet" | "ordered" | null => {
    if (BULLET_RE.test(line)) return "bullet";
    if (ORDERED_RE.test(line)) return "ordered";
    return null;
  };

  while (i < n) {
    // Skip blank lines separating blocks (also trims leading blanks).
    if (isBlank(lines[i])) {
      i += 1;
      continue;
    }

    // We are at the first line of a block. Decide whether the block is a list
    // by looking at THIS line's marker kind.
    const firstKind = markerKind(lines[i]);

    if (firstKind !== null) {
      // (3) List block. Consume consecutive non-blank lines of the SAME
      //     marker kind. A different kind (or a non-marker line, or a blank)
      //     ends the list.
      const ordered = firstKind === "ordered";
      const items: MdInline[][] = [];
      while (i < n && !isBlank(lines[i]) && markerKind(lines[i]) === firstKind) {
        const re = ordered ? ORDERED_RE : BULLET_RE;
        const afterMarker = lines[i].replace(re, "");
        items.push(parseInline(afterMarker));
        i += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // (4) Paragraph block. Consume consecutive non-blank lines that are NOT
    //     list markers (a marker line begins a new list block).
    const paraLines: string[] = [];
    while (i < n && !isBlank(lines[i]) && markerKind(lines[i]) === null) {
      paraLines.push(lines[i]);
      i += 1;
    }
    const joined = paraLines.join("\n");
    blocks.push({ type: "paragraph", children: parseParagraphInline(joined) });
  }

  return blocks;
}

/**
 * Parse a paragraph body where a single `\n` becomes a hard line break
 * (`{type:"br"}`). We split on `\n`, inline-parse each segment, and weave a
 * `br` node between segments, preserving the app's existing
 * `whitespace-pre-wrap` hard-newline behavior without ever letting a newline
 * affect inline parsing across the break.
 */
function parseParagraphInline(s: string): MdInline[] {
  const segments = s.split("\n");
  const out: MdInline[] = [];
  segments.forEach((seg, idx) => {
    if (idx > 0) out.push({ type: "br" });
    out.push(...parseInline(seg));
  });
  return out;
}

/**
 * Flatten a parsed document down to a single line of visible text, used for
 * one-line previews (TaskCard / PostCard) so raw `**`, `[label](url)` and
 * other syntax never leaks into a clamped preview.
 *
 * We walk the same AST the renderer uses, concatenating only the VISIBLE
 * text: `text`/`code` values and link/emphasis children text. List items are
 * joined with `, `, `br` becomes a space, and blocks are joined with a space.
 * Finally we collapse runs of whitespace to single spaces and trim.
 */
export function stripMarkdown(text: string): string {
  const blocks = parseMarkdown(text);

  const inlineText = (nodes: MdInline[]): string =>
    nodes
      .map((node) => {
        switch (node.type) {
          case "text":
            return node.value;
          case "code":
            return node.value;
          case "strong":
          case "em":
          case "link":
            return inlineText(node.children);
          case "br":
            return " ";
        }
      })
      .join("");

  const parts = blocks.map((block) => {
    if (block.type === "paragraph") return inlineText(block.children);
    // List: visible item texts joined with ", ".
    return block.items.map((item) => inlineText(item)).join(", ");
  });

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
