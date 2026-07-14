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
// Tiny, dependency-free, XSS-safe Markdown subset (the "SAFE" set).
//
// This module is the SECURITY BOUNDARY for rendering federated / untrusted
// text. It is intentionally a *parser only*: it turns a string into an
// abstract syntax tree (AST) of plain data objects. It NEVER produces HTML,
// never produces a string of markup, and never touches the DOM. The renderer
// (components/Markdown.tsx) walks this AST and emits React elements, so user
// content can only ever become *text* and a fixed, closed set of element
// types (p / strong / em / del / code / a / br / ul / ol / li / heading /
// blockquote / pre+code / hr / table). There is no code path by which an
// input string becomes raw markup, which is what makes the whole pipeline
// XSS-proof by construction.
//
// Three further hardening rules live here:
//   1. URLs are run through `sanitizeUrl`, which allows ONLY http(s) and
//      mailto. `javascript:`, `data:`, `vbscript:`, protocol-relative
//      (`//evil`), and relative URLs are rejected. A rejected link is
//      dropped entirely (its visible label survives as plain text), so no
//      `<a href>` ever carries a dangerous scheme.
//   2. Raw angle brackets / HTML in the input are NOT parsed as markup. A
//      literal `<script>...</script>` is just text; it ends up as a
//      `{type:"text"}` node and the renderer prints it verbatim and inert.
//      Inside a fenced code block the same content is captured VERBATIM into
//      the block's `value` string and never re-parsed.
//   3. Markdown image syntax `![alt](url)` is NEVER rendered as an `<img>`.
//      It degrades to a SAFE LINK to sanitizeUrl(url) (label = alt, or the
//      url when alt is empty); an unsafe url drops to just the alt/url text.
//      This keeps the destination clickable without a render-time remote
//      fetch (which would leak the viewer's IP).
// ============================================================================

/** A leaf or nested run of inline (within-paragraph) content. */
export type MdInline =
  | { type: "text"; value: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "em"; children: MdInline[] }
  | { type: "del"; children: MdInline[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: MdInline[] }
  | { type: "mention"; key: string; label: string }
  | { type: "br" };

/** One item of a list. `checked` is null for ordinary items, true/false for
 *  GFM task items (`[x]` / `[ ]`). `content` is the item's own first-line
 *  inline content; `children` holds nested blocks (e.g. a nested list). */
export type MdListItem = {
  checked: boolean | null;
  content: MdInline[];
  children: MdBlock[];
};

/** Per-column alignment for a GFM table, derived from the delimiter row. */
export type MdTableAlign = "left" | "center" | "right" | null;

/** A top-level (or nested) block. */
export type MdBlock =
  | { type: "paragraph"; children: MdInline[] }
  | { type: "heading"; level: number; children: MdInline[] }
  | { type: "blockquote"; children: MdBlock[] }
  | { type: "codeBlock"; lang: string | null; value: string }
  | { type: "hr" }
  | { type: "list"; ordered: boolean; items: MdListItem[] }
  | {
      type: "table";
      align: MdTableAlign[];
      header: MdInline[][];
      rows: MdInline[][][];
    };

// Bullet list marker: any leading spaces, then -, * or +, then >=1 space.
// (Indentation is captured separately for nesting; the >=3-space cap that
// CommonMark uses for top-level items is relaxed here so deeper indents read
// as nested rather than as code — this subset has no indented-code construct.)
const BULLET_RE = /^([ ]*)([-*+])[ ]+(.*)$/;
// Ordered list marker: any leading spaces, then digits, a dot, >=1 space.
const ORDERED_RE = /^([ ]*)(\d+)\.[ ]+(.*)$/;

// ATX heading: up to 3 leading spaces, 1..6 `#`, then >=1 space, then text.
const HEADING_RE = /^[ ]{0,3}(#{1,6})[ \t]+(.*)$/;
// Blockquote marker: up to 3 leading spaces, `>`, optionally one space.
const BLOCKQUOTE_RE = /^[ ]{0,3}>[ ]?(.*)$/;
// Opening/closing fence: up to 3 leading spaces, a run of >=3 ` or ~, then an
// optional info string. Captures the fence run and the (trimmed) language.
const FENCE_RE = /^[ ]{0,3}(`{3,}|~{3,})[ \t]*([A-Za-z0-9_+-]*)[ \t]*$/;
// Horizontal rule: only 3+ of the same -, * or _, optionally space-separated.
const HR_RE = /^[ ]{0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
// A task-item token at the start of an item's content: [ ], [x] or [X].
const TASK_RE = /^\[([ xX])\][ \t]+(.*)$/;

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

// The pseudo-scheme carried inside a mention token's URL slot:
// `@[Display Name](mention:BASE64KEY)`. Chosen deliberately so that any
// renderer that does NOT know about mentions — a peer community on an
// older build, or a surface that never opts into mention resolution —
// processes the token through the ORDINARY link rules: `mention:` fails
// sanitizeUrl's http(s)/mailto allow-list, the link is dropped, and the
// visible label survives as plain text. The reader sees "@Display Name",
// which is exactly the right degraded rendering, with zero wire-format
// or schema changes anywhere. See docs/mentions.md §2 (D2).
export const MENTION_SCHEME = "mention:";

// A plausible base64-encoded Ed25519 public key (44 chars with padding;
// bounds kept loose so this stays a shape check, not a crypto check).
// A token whose key fails this never becomes a mention node — it
// degrades exactly like an unsafe link (label as plain text), so a
// malformed or hostile token can't smuggle arbitrary strings into the
// member-key slot that renderers resolve against.
const MENTION_KEY_RE = /^[A-Za-z0-9+/]{32,88}={0,2}$/;

export function isValidMentionKey(key: string): boolean {
  return MENTION_KEY_RE.test(key);
}

// Characters a backslash may escape into a literal. Mirrors the small set of
// markup characters this subset understands.
const ESCAPABLE = new Set(["*", "_", "~", "`", "[", "]", "(", ")", "!", "\\"]);

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
 * Try to parse a `[label](url)` link beginning at index `i` (where `s[i]` is
 * `[`). Returns the parsed pieces and the index just past the closing `)`, or
 * `null` when the bracket pattern does not fully match. Shared by the link and
 * image-as-safe-link inline handlers so both use exactly one set of bracket
 * rules and one `sanitizeUrl` gate.
 */
function tryLink(
  s: string,
  i: number,
): { label: string; rawUrl: string; end: number } | null {
  const closeBracket = s.indexOf("]", i + 1);
  if (closeBracket === -1 || s[closeBracket + 1] !== "(") return null;
  const closeParen = s.indexOf(")", closeBracket + 2);
  if (closeParen === -1) return null;
  return {
    label: s.slice(i + 1, closeBracket),
    rawUrl: s.slice(closeBracket + 2, closeParen),
    end: closeParen + 1,
  };
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
    //     parsing inside, so `* _ [ ] ~` etc. inside backticks are inert. If
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

    // (3) Image-as-safe-link: `![label](url)`. We NEVER emit an <img>. When
    //     `!` is immediately followed by a valid `[..](..)`, we emit a LINK to
    //     sanitizeUrl(url) (children = the alt text, or the url when alt is
    //     empty); an unsafe url drops to just the alt/url text. If `!` is not
    //     followed by a valid bracket pattern, `!` is a literal char. Checked
    //     before `[` so the `!` is consumed with its bracket group.
    if (ch === "!" && s[i + 1] === "[") {
      const parsed = tryLink(s, i + 1);
      if (parsed) {
        const href = sanitizeUrl(parsed.rawUrl);
        const hasAlt = parsed.label.length > 0;
        flush();
        if (href !== null) {
          // Label = the alt text (inline-parsed), or — when alt is empty — the
          // url shown as a plain text node (NOT re-parsed, so it is not
          // autolinked into a nested link inside this one).
          const children: MdInline[] = hasAlt
            ? parseInline(parsed.label)
            : [{ type: "text", value: parsed.rawUrl }];
          out.push({ type: "link", href, children });
        } else {
          // Unsafe url: degrade to the alt text (or the raw url text when alt
          // is empty), never a link/img.
          if (hasAlt) {
            out.push(...parseInline(parsed.label));
          } else {
            out.push({ type: "text", value: parsed.rawUrl });
          }
        }
        i = parsed.end;
        continue;
      }
      // Not a valid image pattern: `!` is an ordinary character.
      buf += ch;
      i += 1;
      continue;
    }

    // (3.5) Mention: @[Display Name](mention:BASE64KEY). Only the exact
    //     shape becomes a mention node: `@` immediately followed by a
    //     valid bracket pattern whose URL slot is the mention pseudo-
    //     scheme with a plausible base64 key. Anything else — `@` before
    //     plain text, `@[..](https://..)`, a malformed key — leaves the
    //     `@` as a literal character and lets the ordinary link rules
    //     handle the bracket group (dropping a `mention:` URL as unsafe,
    //     which degrades the token to its visible label). The label is
    //     NOT inline-parsed: it is a person's name, not markup.
    if (ch === "@" && s[i + 1] === "[") {
      const parsed = tryLink(s, i + 1);
      if (parsed && parsed.rawUrl.startsWith(MENTION_SCHEME)) {
        const key = parsed.rawUrl.slice(MENTION_SCHEME.length);
        if (isValidMentionKey(key)) {
          flush();
          out.push({ type: "mention", key, label: parsed.label });
          i = parsed.end;
          continue;
        }
      }
      buf += ch;
      i += 1;
      continue;
    }

    // (4) Link: [label](url). Find the first ] after [, require the next
    //     char to be ( and find its closing ). If sanitizeUrl succeeds we
    //     emit a link; if it FAILS (dangerous/relative scheme) we DROP the
    //     anchor and keep the label as plain inline text, never an <a>. If
    //     the bracket pattern does not fully match, `[` is a literal char.
    if (ch === "[") {
      const parsed = tryLink(s, i);
      if (parsed) {
        const href = sanitizeUrl(parsed.rawUrl);
        flush();
        if (href !== null) {
          out.push({ type: "link", href, children: parseInline(parsed.label) });
        } else {
          // Unsafe URL: keep the visible label, drop the link entirely.
          out.push(...parseInline(parsed.label));
        }
        i = parsed.end;
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }

    // (5) Autolink a bare http(s) URL, but only at a word boundary so a URL
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

    // (6) Strong: **...** or __...__. Checked BEFORE em so `**` is not read
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
      // (7) Em: *...* or _..._. Same flanking; `_` requires word boundaries
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

    // (8) Strikethrough: ~~...~~ (GFM). Same flanking rules emphasis uses:
    //     opening run followed by a non-space, closing run preceded by a
    //     non-space. A single `~` or an unmatched `~~` stays literal. Placed
    //     after *, _, code and links so it never interferes with them.
    if (ch === "~" && s.startsWith("~~", i)) {
      const del = tryFlanked(s, i, "~~", false);
      if (del) {
        flush();
        out.push({ type: "del", children: parseInline(del.inner) });
        i = del.end;
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }

    // (9) Otherwise: ordinary character.
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

// --- Block helpers ---------------------------------------------------------

const isBlank = (line: string) => line.trim() === "";

const markerKind = (line: string): "bullet" | "ordered" | null => {
  if (BULLET_RE.test(line)) return "bullet";
  if (ORDERED_RE.test(line)) return "ordered";
  return null;
};

/** Width of a line's leading whitespace (tabs count as one column — good
 *  enough for the indentation comparisons this nesting model needs). */
function indentWidth(line: string): number {
  const m = /^[ \t]*/.exec(line);
  return m ? m[0].length : 0;
}

/**
 * A GFM table delimiter row: every `|`-separated cell matches `^:?-+:?$`
 * (with surrounding spaces allowed) and there is at least one cell. Returns
 * the per-column alignment array, or `null` when the line is not a valid
 * delimiter row.
 */
function parseDelimiterRow(line: string): MdTableAlign[] | null {
  const cells = splitTableRow(line);
  if (cells.length === 0) return null;
  const align: MdTableAlign[] = [];
  for (const raw of cells) {
    const cell = raw.trim();
    if (!/^:?-+:?$/.test(cell)) return null;
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    align.push(
      left && right ? "center" : right ? "right" : left ? "left" : null,
    );
  }
  return align;
}

/**
 * Split a GFM table row into its cell strings, respecting backslash-escaped
 * pipes (`\|` is a literal pipe inside a cell, not a separator) and trimming
 * a single optional leading/trailing pipe. Cells are returned untrimmed of
 * inner spaces (callers trim/inline-parse as needed).
 */
function splitTableRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  for (let k = 0; k < line.length; k++) {
    const c = line[k];
    if (c === "\\" && k + 1 < line.length) {
      // Keep the escape sequence intact so the inline parser can resolve it
      // (e.g. `\|` becomes a literal pipe, `\*` an escaped asterisk).
      cur += c + line[k + 1];
      k += 1;
      continue;
    }
    if (c === "|") {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  cells.push(cur);
  // Drop the leading empty cell from a leading `|`, and the trailing empty
  // cell from a trailing `|`, so `| a | b |` yields exactly ["a", "b"].
  if (cells.length > 0 && cells[0].trim() === "") cells.shift();
  if (cells.length > 0 && cells[cells.length - 1].trim() === "") cells.pop();
  return cells;
}

/** True when a line contains an UNescaped `|` (a table-row candidate). */
function hasUnescapedPipe(line: string): boolean {
  for (let k = 0; k < line.length; k++) {
    if (line[k] === "\\") {
      k += 1;
      continue;
    }
    if (line[k] === "|") return true;
  }
  return false;
}

/**
 * Parse a contiguous run of list lines (all `lines[start..end)` are list
 * markers and non-blank) into a single `list` block, building nesting from
 * each line's indentation. The first line decides `ordered`; a switch in
 * marker kind at the SAME indent level ends the list (handled by the caller,
 * which only passes a same-first-kind run for the top level — see below).
 *
 * Nesting model: a stack of open lists keyed by indent. A line more indented
 * than the current item opens a nested list under it; a line less indented
 * pops back to the matching level. Returns the parsed items for the top list
 * along with whether that top list is ordered.
 */
function parseListRun(lines: string[]): {
  ordered: boolean;
  items: MdListItem[];
} {
  type Frame = {
    indent: number;
    ordered: boolean;
    items: MdListItem[];
  };

  const matchItem = (
    line: string,
  ): { indent: number; ordered: boolean; rest: string } | null => {
    const b = BULLET_RE.exec(line);
    if (b) return { indent: b[1].length, ordered: false, rest: b[3] };
    const o = ORDERED_RE.exec(line);
    if (o) return { indent: o[1].length, ordered: true, rest: o[3] };
    return null;
  };

  const root: Frame = { indent: -1, ordered: false, items: [] };
  // Stack always holds the chain of currently-open list frames, outermost
  // first. `root` is a sentinel holding the top-level list once created.
  const stack: Frame[] = [root];

  const makeItem = (rest: string): MdListItem => {
    let checked: boolean | null = null;
    let content = rest;
    const task = TASK_RE.exec(rest);
    if (task) {
      checked = task[1] === "x" || task[1] === "X";
      content = task[2];
    }
    return { checked, content: parseInline(content), children: [] };
  };

  for (const line of lines) {
    const m = matchItem(line);
    if (!m) continue; // Caller guarantees list lines; defensive only.

    if (root.items.length === 0) {
      // First item ever: create the top list frame on its own indent.
      root.indent = m.indent;
      root.ordered = m.ordered;
      root.items.push(makeItem(m.rest));
      continue;
    }

    // Pop frames MORE indented than this line, so the top of the stack is the
    // shallowest frame whose indent is <= this line's indent. (Equal-indent
    // frames stay so a same-level sibling appends to the existing list rather
    // than opening a fresh one.)
    while (stack.length > 1 && stack[stack.length - 1].indent > m.indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (m.indent <= parent.indent) {
      // Sibling at this level (or dedent back to it): append to this frame.
      parent.items.push(makeItem(m.rest));
      continue;
    }

    // m.indent > parent.indent: open a NESTED list under the parent frame's
    // most recent item.
    const owner = parent.items[parent.items.length - 1];
    const nested: Frame = {
      indent: m.indent,
      ordered: m.ordered,
      items: [makeItem(m.rest)],
    };
    // The nested list becomes a child block of the owning item. We share the
    // SAME `items` array between the frame and the block so subsequent sibling
    // items pushed onto the frame also appear in the rendered nested block.
    const nestedBlock: MdBlock = {
      type: "list",
      ordered: nested.ordered,
      items: nested.items,
    };
    owner.children.push(nestedBlock);
    stack.push(nested);
  }

  return { ordered: root.ordered, items: root.items };
}

/**
 * Parse a whole text document into top-level blocks.
 *
 * Steps:
 *   1. Normalize CRLF / CR newlines to LF.
 *   2. Walk lines, dispatching on the FIRST line of each block in priority:
 *      fenced code → heading → hr → blockquote → table → list → paragraph.
 *      Blank lines separate blocks (and are trimmed at the edges).
 *
 * Headings/blockquotes/fences/hr/tables are now first-class; everything that
 * matches none of them is paragraph text (a single `\n` inside a paragraph
 * becomes a `{type:"br"}`, the app's existing hard-newline behavior).
 */
export function parseMarkdown(text: string): MdBlock[] {
  // (1) Normalize newlines.
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  const blocks: MdBlock[] = [];
  let i = 0;
  const n = lines.length;

  while (i < n) {
    // Skip blank lines separating blocks (also trims leading blanks).
    if (isBlank(lines[i])) {
      i += 1;
      continue;
    }

    const line = lines[i];

    // (a) Fenced code block. Capture the inner lines VERBATIM (no inline
    //     parsing) until a closing fence of the same char whose run length is
    //     >= the opening run, or EOF. The fence lines are not part of `value`.
    const fence = FENCE_RE.exec(line);
    if (fence) {
      const fenceChar = fence[1][0];
      const fenceLen = fence[1].length;
      const lang = fence[2].length > 0 ? fence[2] : null;
      i += 1;
      const body: string[] = [];
      while (i < n) {
        const close = FENCE_RE.exec(lines[i]);
        if (
          close &&
          close[1][0] === fenceChar &&
          close[1].length >= fenceLen &&
          close[2] === ""
        ) {
          i += 1; // Consume the closing fence.
          break;
        }
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "codeBlock", lang, value: body.join("\n") });
      continue;
    }

    // (b) ATX heading. `#`..`######` then a space then text; a trailing run of
    //     `#` (and surrounding spaces) is stripped. `#` without a space is not
    //     a heading and falls through to paragraph.
    const heading = HEADING_RE.exec(line);
    if (heading) {
      const level = heading[1].length;
      const body = heading[2].replace(/[ \t]+#+[ \t]*$/, "").trim();
      blocks.push({ type: "heading", level, children: parseInline(body) });
      i += 1;
      continue;
    }

    // (c) Horizontal rule. Checked before lists so `---`/`***`/`___` (which
    //     have NO non-marker content) become an <hr>, while `- x` stays a
    //     bullet. A standalone marker run only.
    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // (d) Blockquote. Consume consecutive `>`-prefixed lines, strip the `>`
    //     (and one optional space) prefix from each, then RECURSIVELY parse
    //     the de-prefixed text so a quote can hold paragraphs and lists. A
    //     blank or non-`>` line ends the quote.
    if (BLOCKQUOTE_RE.test(line)) {
      const inner: string[] = [];
      while (i < n && !isBlank(lines[i]) && BLOCKQUOTE_RE.test(lines[i])) {
        inner.push(lines[i].replace(BLOCKQUOTE_RE, "$1"));
        i += 1;
      }
      blocks.push({
        type: "blockquote",
        children: parseMarkdown(inner.join("\n")),
      });
      continue;
    }

    // (e) GFM table. A header line with an unescaped `|` IMMEDIATELY followed
    //     by a valid delimiter row. If the delimiter is missing/invalid we
    //     fall through and treat the header line as ordinary paragraph text.
    if (
      hasUnescapedPipe(line) &&
      i + 1 < n &&
      !isBlank(lines[i + 1]) &&
      parseDelimiterRow(lines[i + 1]) !== null
    ) {
      const align = parseDelimiterRow(lines[i + 1])!;
      const header = splitTableRow(line).map((c) => parseInline(c.trim()));
      i += 2;
      const rows: MdInline[][][] = [];
      while (i < n && !isBlank(lines[i]) && hasUnescapedPipe(lines[i])) {
        rows.push(splitTableRow(lines[i]).map((c) => parseInline(c.trim())));
        i += 1;
      }
      blocks.push({ type: "table", align, header, rows });
      continue;
    }

    // (f) List block. Consume consecutive non-blank list lines (any marker
    //     kind / any indent) and build nesting from indentation. A blank or
    //     non-list line ends the run; a top-level marker-kind switch at the
    //     SAME indent is split into a separate list (handled by slicing the
    //     run at a kind change among the outermost-indent lines).
    if (markerKind(line) !== null) {
      const runStart = i;
      while (i < n && !isBlank(lines[i]) && markerKind(lines[i]) !== null) {
        i += 1;
      }
      const run = lines.slice(runStart, i);
      // Split the run wherever the OUTERMOST-indent marker kind changes, so a
      // `- bullet` → `1. ordered` transition yields two sibling list blocks
      // (preserving the Essentials behavior) while nested lines stay grouped.
      const baseIndent = indentWidth(run[0]);
      let segStart = 0;
      let segKind = markerKind(run[0]);
      for (let k = 1; k < run.length; k++) {
        if (
          indentWidth(run[k]) === baseIndent &&
          markerKind(run[k]) !== segKind
        ) {
          const seg = parseListRun(run.slice(segStart, k));
          blocks.push({ type: "list", ordered: seg.ordered, items: seg.items });
          segStart = k;
          segKind = markerKind(run[k]);
        }
      }
      const seg = parseListRun(run.slice(segStart));
      blocks.push({ type: "list", ordered: seg.ordered, items: seg.items });
      continue;
    }

    // (g) Paragraph block. Consume consecutive non-blank lines that don't
    //     start any other block construct. The first such line begins a new
    //     block, so we re-check each construct on every subsequent line.
    const paraLines: string[] = [];
    while (
      i < n &&
      !isBlank(lines[i]) &&
      !FENCE_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !HR_RE.test(lines[i]) &&
      !BLOCKQUOTE_RE.test(lines[i]) &&
      markerKind(lines[i]) === null &&
      !(
        hasUnescapedPipe(lines[i]) &&
        i + 1 < n &&
        parseDelimiterRow(lines[i + 1]) !== null
      )
    ) {
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
 * one-line previews (TaskCard / PostCard) so raw `**`, `[label](url)`,
 * headings, fences and other syntax never leak into a clamped preview.
 *
 * We walk the same AST the renderer uses, concatenating only the VISIBLE
 * text. Finally we collapse runs of whitespace to single spaces and trim.
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
          case "del":
          case "link":
            return inlineText(node.children);
          case "mention":
            // Previews show the compose-time label — same degraded
            // rendering peers get; a one-line preview never resolves.
            return `@${node.label}`;
          case "br":
            return " ";
        }
      })
      .join("");

  // Flatten one list's items (and any nested child blocks) to comma-joined
  // visible text, preserving the Essentials "items joined with ', '" feel.
  const listText = (
    items: MdListItem[],
  ): string =>
    items
      .map((item) => {
        const own = inlineText(item.content);
        const nested = item.children.map(blockText).join(" ").trim();
        return nested ? `${own} ${nested}` : own;
      })
      .join(", ");

  const blockText = (block: MdBlock): string => {
    switch (block.type) {
      case "paragraph":
      case "heading":
        return inlineText(block.children);
      case "blockquote":
        return block.children.map(blockText).join(" ");
      case "codeBlock":
        return block.value;
      case "hr":
        return "";
      case "list":
        return listText(block.items);
      case "table":
        // Header cells then each body row's cells, all space-joined.
        return [
          ...block.header.map(inlineText),
          ...block.rows.flatMap((row) => row.map(inlineText)),
        ]
          .join(" ")
          .trim();
    }
  };

  return blocks
    .map(blockText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
