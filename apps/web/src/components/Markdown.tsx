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
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  parseMarkdown,
  type MdBlock,
  type MdInline,
} from "@/lib/markdown";

// Below this character count a collapsible description renders plainly — no
// clamp, no toggle. Shared/exported so callers and tests reference one number.
// This replaces ExpandableText's own (identical) threshold.
export const COLLAPSE_THRESHOLD = 280;

// SECURITY NOTE: this renderer emits React *elements* only. It walks the AST
// produced by parseMarkdown (a pure parser that never produces markup) and
// maps each node to a fixed, closed set of element types. There is no
// `dangerouslySetInnerHTML` and no HTML-string concatenation anywhere, so
// untrusted federated content can only become text + these safe elements —
// XSS-proof by construction. Link hrefs were already allow-listed to
// http(s)/mailto by the parser's sanitizeUrl; we additionally pin
// `rel="noopener noreferrer nofollow"` and `target="_blank"` on every anchor.

/** Render one inline node to a React node. `key` is the array index. */
function renderInline(node: MdInline, key: number): ReactNode {
  switch (node.type) {
    case "text":
      return node.value;
    case "br":
      return <br key={key} />;
    case "strong":
      return (
        <strong key={key} className="font-semibold">
          {node.children.map(renderInline)}
        </strong>
      );
    case "em":
      return <em key={key}>{node.children.map(renderInline)}</em>;
    case "code":
      // Inline-code styling mirrors the app's existing <code> treatment
      // (rounded, subtle bg, slightly smaller, font-mono, dark variant).
      return (
        <code
          key={key}
          className="rounded bg-moss-100 px-1 py-0.5 font-mono text-[0.95em] text-bark-800 dark:bg-moss-800 dark:text-moss-100"
        >
          {node.value}
        </code>
      );
    case "link":
      // target=_blank so tapping a link in the installed PWA doesn't navigate
      // the app away; rel=noopener+noreferrer+nofollow because the href came
      // from untrusted, federated content. The href is already scheme-safe.
      return (
        <a
          key={key}
          href={node.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="break-words text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        >
          {node.children.map(renderInline)}
        </a>
      );
  }
}

/** Render one block node to a React element. */
function renderBlock(block: MdBlock, key: number): ReactNode {
  if (block.type === "paragraph") {
    return <p key={key}>{block.children.map(renderInline)}</p>;
  }
  // List: ordered → <ol>, otherwise <ul>. Literal class strings so Tailwind's
  // content scanner generates the rules.
  const items = block.items.map((item, idx) => (
    <li key={idx}>{item.map(renderInline)}</li>
  ));
  return block.ordered ? (
    <ol key={key} className="list-decimal space-y-1 pl-5">
      {items}
    </ol>
  ) : (
    <ul key={key} className="list-disc space-y-1 pl-5">
      {items}
    </ul>
  );
}

/**
 * Render a small, safe Markdown subset as React elements.
 *
 *   - `text` — the raw (untrusted) source.
 *   - `className` — applied to the wrapper <div> alongside block spacing.
 *   - `collapsible` — when true, long text (> COLLAPSE_THRESHOLD chars) is
 *     visually clamped with a Show more / Show less toggle. The FULL markdown
 *     is always in the DOM (only CSS-clamped), so screen readers and tests
 *     always see the complete text.
 */
export function Markdown({
  text,
  className,
  collapsible,
}: {
  text: string;
  className?: string;
  collapsible?: boolean;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const blocks = useMemo(() => parseMarkdown(text), [text]);

  // `[overflow-wrap:anywhere]` lets a long pasted URL wrap mid-string rather
  // than push the surrounding card/layout open (carried over from the linkify
  // feature this supersedes). It only breaks when needed, so prose stays intact.
  const wrapperClass = [className, "space-y-2", "[overflow-wrap:anywhere]"]
    .filter(Boolean)
    .join(" ");
  const content = blocks.map(renderBlock);

  // Non-collapsible, or short enough to never need a toggle: render plainly.
  if (!collapsible || text.length <= COLLAPSE_THRESHOLD) {
    return <div className={wrapperClass}>{content}</div>;
  }

  // Collapsible + long. The inner wrapper is CSS-clamped (max-h-32
  // overflow-hidden — literal classes) when collapsed; the full content is
  // always present in the DOM. Default state is collapsed.
  return (
    <div className={wrapperClass}>
      <div className={expanded ? undefined : "max-h-32 overflow-hidden"}>
        {content}
      </div>
      <button
        type="button"
        className="mt-1 text-xs font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? t("common.showLess") : t("common.showMore")}
      </button>
    </div>
  );
}
