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
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  parseMarkdown,
  type MdBlock,
  type MdInline,
  type MdListItem,
  type MdTableAlign,
} from "@/lib/markdown";

/**
 * Mention resolution — OPT-IN per surface. A surface that renders
 * comments (TaskComments) wraps its markdown in
 * `<MentionResolverContext.Provider>`; every other surface renders a
 * mention token as its plain "@label" fallback, byte-identical to
 * what a peer community on an older build sees. Resolution maps a
 * member KEY to the member's CURRENT display name from the local
 * members table — the current name always wins over the token's
 * embedded compose-time label, so a comment can never dress an
 * arbitrary key up as somebody else (docs/mentions.md §4).
 */
export interface MentionResolver {
  /** Current display name for a member key, or undefined when the
   *  key isn't in the local members table (e.g. a peer community's
   *  member arriving via a federated comment). */
  resolveName: (key: string) => string | undefined;
  /** The viewing member's own key — their mentions get the "that's
   *  you" emphasis. */
  currentMemberKey?: string;
}

export const MentionResolverContext = createContext<MentionResolver | null>(
  null,
);

/**
 * One rendered mention. Resolvable keys render as a quiet chip
 * linking to the member's profile (so "who is asking?" is one tap);
 * unresolvable keys — or surfaces with no resolver — render the
 * compose-time label as muted text, no link, no implied trust.
 */
function MentionChip({ mentionKey, label }: { mentionKey: string; label: string }) {
  const { t } = useTranslation();
  const ctx = useContext(MentionResolverContext);
  const name = ctx?.resolveName(mentionKey);
  if (name === undefined) {
    return (
      <span className="text-moss-600 dark:text-moss-300">
        @{label || t("common.memberFallback")}
      </span>
    );
  }
  const isMe = ctx?.currentMemberKey === mentionKey;
  return (
    <Link
      to={`/member/${encodeURIComponent(mentionKey)}`}
      className={`rounded px-0.5 font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300 ${
        isMe ? "bg-canopy-100 dark:bg-canopy-900/60" : ""
      }`}
    >
      @{name}
    </Link>
  );
}

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
//
// Notably absent: there is NO `<img>` branch anywhere. Markdown image syntax
// was already degraded to a safe link (or text) by the parser, so no remote
// image fetch can ever be triggered by federated content. Code blocks render
// their captured text verbatim and are never re-parsed as markup.

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
    case "del":
      return <del key={key}>{node.children.map(renderInline)}</del>;
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
    case "mention":
      // A component (not inline JSX) so it can read the resolver
      // context — renderInline itself is a plain function.
      return <MentionChip key={key} mentionKey={node.key} label={node.label} />;
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

// Heading size classes by level. Levels 1–3 are progressively calmer; 4–6 are
// muted so a deep heading never shouts. All are literal strings so Tailwind's
// content scanner emits them. We render with role="heading"+aria-level rather
// than raw <h1>..<h6> so federated content does not pollute the page's heading
// outline, and so sizes stay modest regardless of document position.
const HEADING_CLASS: Record<number, string> = {
  1: "mt-2 text-lg font-semibold",
  2: "mt-2 text-base font-semibold",
  3: "mt-2 text-sm font-semibold",
  4: "mt-2 text-sm font-semibold text-moss-600 dark:text-moss-300",
  5: "mt-2 text-sm font-semibold text-moss-600 dark:text-moss-300",
  6: "mt-2 text-sm font-semibold text-moss-600 dark:text-moss-300",
};

// Per-column text alignment class for a table cell. `null` → default (left).
const ALIGN_CLASS: Record<"left" | "center" | "right", string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function alignClass(a: MdTableAlign): string {
  return a ? ALIGN_CLASS[a] : "text-left";
}

/** Render one list (recursively, so nested lists nest). A list whose items
 *  are all task items renders without bullets and with disabled checkboxes. */
function renderList(
  block: Extract<MdBlock, { type: "list" }>,
  key: number,
): ReactNode {
  // A "task list" is one where at least one item carries a checkbox; we render
  // the whole list as a checklist (no marker) so rows line up.
  const isTaskList = block.items.some((item) => item.checked !== null);

  const renderItem = (item: MdListItem, idx: number): ReactNode => {
    const nested = item.children.map(renderBlock);
    if (isTaskList) {
      // Read-only, disabled checkbox + content as a flex row. The checkbox is
      // disabled+readOnly so federated content can never be toggled; it is
      // purely a visual state indicator.
      return (
        <li key={idx} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={item.checked === true}
            disabled
            readOnly
            aria-hidden="true"
            className="mt-1"
          />
          <span className="flex-1">
            {item.content.map(renderInline)}
            {nested}
          </span>
        </li>
      );
    }
    return (
      <li key={idx}>
        {item.content.map(renderInline)}
        {nested}
      </li>
    );
  };

  const items = block.items.map(renderItem);

  if (isTaskList) {
    return (
      <ul key={key} className="list-none space-y-1 pl-0">
        {items}
      </ul>
    );
  }
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

/** Render one block node to a React element. */
function renderBlock(block: MdBlock, key: number): ReactNode {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{block.children.map(renderInline)}</p>;

    case "heading":
      // role="heading" + aria-level keep the semantics for assistive tech
      // without emitting a real <h1>..<h6> (see HEADING_CLASS note).
      return (
        <div
          key={key}
          role="heading"
          aria-level={block.level}
          className={HEADING_CLASS[block.level] ?? HEADING_CLASS[6]}
        >
          {block.children.map(renderInline)}
        </div>
      );

    case "blockquote":
      // Calm, not italic: a left rule + muted text wrapping the recursively
      // rendered child blocks (so a quote can hold paragraphs and lists).
      return (
        <blockquote
          key={key}
          className="border-l-2 border-moss-300 pl-3 text-moss-600 dark:border-moss-600 dark:text-moss-300"
        >
          {block.children.map(renderBlock)}
        </blockquote>
      );

    case "codeBlock":
      // overflow-x-auto so long lines scroll instead of breaking the layout.
      // The optional lang shows as a tiny muted label. `value` is plain text
      // from the parser — never re-parsed, never executed.
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded bg-moss-100 p-2 text-xs dark:bg-moss-900"
        >
          {block.lang ? (
            <span className="mb-1 block text-[0.7rem] text-moss-600 dark:text-moss-300">
              {block.lang}
            </span>
          ) : null}
          <code className="font-mono">{block.value}</code>
        </pre>
      );

    case "hr":
      return (
        <hr key={key} className="my-3 border-moss-200 dark:border-moss-700" />
      );

    case "list":
      return renderList(block, key);

    case "table":
      // Horizontally scrollable wrapper so a wide table never pushes the card
      // open; bordered cells with per-column alignment from `align`.
      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {block.header.map((cell, c) => (
                  <th
                    key={c}
                    className={`border border-moss-200 px-2 py-1 font-semibold text-left dark:border-moss-700 ${alignClass(
                      block.align[c] ?? null,
                    )}`}
                  >
                    {cell.map(renderInline)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`border border-moss-200 px-2 py-1 dark:border-moss-700 ${alignClass(
                        block.align[c] ?? null,
                      )}`}
                    >
                      {cell.map(renderInline)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
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
