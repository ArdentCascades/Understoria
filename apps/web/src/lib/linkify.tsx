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
import type React from "react";

// Conservative URL detection: match `https?://` URLs only. We do NOT
// linkify bare domains ("example.com") or "www." prefixes — the
// false-positive rate on ordinary prose ("see foo.com/bar", "e.g.")
// is too high, and a wrong link is worse than no link. A scheme is an
// explicit signal that the member meant a link.
const URL_RE = /https?:\/\/[^\s<>]+/g;

// URLs at the end of a sentence pick up trailing punctuation:
// "see https://example.com/foo." should link only ".../foo" and leave
// the period in the surrounding text. Trim a run of these from the
// match tail; the trimmed characters fall back into the next plain
// segment (see lastIndex bookkeeping below).
const TRAILING_PUNCT_RE = /[.,;)\]]+$/;

// Body-text link styling. `break-all` is load-bearing: it lets a long
// pasted URL wrap mid-character rather than push the card layout open
// (a 200-char redirect URL would otherwise overflow). target/rel are
// the security floor — `noopener noreferrer` denies the opened page
// any `window.opener` handle back into this PWA.
const LINK_CLASS =
  "underline underline-offset-2 break-all text-canopy-700 hover:text-canopy-800 dark:text-canopy-300 dark:hover:text-canopy-200";

/**
 * Split `text` on `https?://` URLs and wrap each match in an anchor,
 * returning a flat array of plain strings and `<a>` nodes that a
 * caller can drop directly into JSX (e.g. `{linkify(comment.body)}`).
 *
 * Pure and render-layer only: it never mutates the input model, adds
 * no markdown, and does no URL validation beyond the scheme match.
 * Text with no URL returns as a single-element `[text]` array.
 */
export function linkify(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    const raw = match[0];
    const url = raw.replace(TRAILING_PUNCT_RE, "");
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    nodes.push(
      <a
        key={`linkify-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        {url}
      </a>,
    );
    // Resume the plain-text cursor at the end of the *trimmed* URL so
    // any trailing punctuation we stripped lands back in the next
    // plain segment.
    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  // No URL matched → hand back the original string as a single node so
  // callers always get a non-empty array to map over.
  return nodes.length > 0 ? nodes : [text];
}
