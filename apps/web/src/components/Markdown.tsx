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
import { trustStatusWithInvites } from "@/lib/vouch";
import { useApp } from "@/state/AppContext";

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

/**
 * Pending-author link gate (operator safety ruling): when the CONTENT
 * AUTHOR's computed trust is still pending, their links render as
 * non-tappable plain text on every viewer's device. Not a shame
 * mechanism — the mechanism is explained in place (the why-affordance
 * below) and lifts by itself once the community vouches for them.
 * `true` = this Markdown root's author is pending, gate every link.
 * Default `false` (no authorKey / no trust data / trusted author):
 * links render exactly as before the gate existed.
 */
const PendingAuthorLinkContext = createContext<boolean>(false);

/** Visible text of an inline run — the gated link's label, so
 *  `[nice-label](evil.com)` can never hide its destination behind
 *  formatting (we always print the href alongside). */
function inlineText(nodes: MdInline[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
        case "code":
          return node.value;
        case "strong":
        case "em":
        case "del":
        case "link":
          return inlineText(node.children);
        case "mention":
          return `@${node.label}`;
        case "br":
          return " ";
      }
    })
    .join("");
}

/**
 * A link authored by a not-yet-vouched member: the REAL href as muted,
 * non-interactive plain text (never the label alone — the destination
 * must be readable), plus a small tap-for-why affordance following the
 * WhyTooltip interaction pattern. Deliberately NO <a> element in this
 * branch, and no hover-underline implying tappability.
 */
function PendingAuthorLink({ href, label }: { href: string; label: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // Show "label — href" only when the label adds information; a bare
  // autolink (label === href) or an empty label prints just the href.
  const trimmed = label.trim();
  const showLabel = trimmed !== "" && trimmed !== href;
  return (
    <span className="break-words text-moss-600 dark:text-moss-300">
      {showLabel ? `${trimmed} — ${href}` : href}
      <button
        type="button"
        className="ml-1 text-xs text-moss-400 underline-offset-2 hover:text-moss-600 hover:underline dark:text-moss-300 dark:hover:text-moss-300"
        aria-label={t("markdown.pendingLink.whyLabel")}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {t("why.trigger")}
      </button>
      {open && (
        <span
          className="mt-1 block rounded-lg bg-moss-50 px-3 py-2 text-xs text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
          role="note"
        >
          {t("markdown.pendingLink.why")}
        </span>
      )}
    </span>
  );
}

/**
 * The link branch — a component (like MentionChip) so it can read the
 * pending-author gate from context; renderInline is a plain function.
 */
function MarkdownLink({ node }: { node: Extract<MdInline, { type: "link" }> }) {
  const authorPending = useContext(PendingAuthorLinkContext);
  if (authorPending) {
    return <PendingAuthorLink href={node.href} label={inlineText(node.children)} />;
  }
  // target=_blank so tapping a link in the installed PWA doesn't navigate
  // the app away; rel=noopener+noreferrer+nofollow because the href came
  // from untrusted, federated content. The href is already scheme-safe.
  return (
    <a
      href={node.href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="break-words text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
    >
      {node.children.map(renderInline)}
    </a>
  );
}

/**
 * The viewer's trust data, or null when this Markdown renders outside
 * an AppProvider (isolated component tests, static harnesses). No
 * provider means no trust data, and no trust data means the gate stays
 * off — behavior byte-identical to before the gate existed.
 */
function useTrustDataOrNull(): Pick<
  ReturnType<typeof useApp>,
  "vouches" | "invites" | "founderRoots"
> | null {
  try {
    // useApp is unconditional here (hook order is stable); only its
    // missing-provider throw is absorbed.
    return useApp();
  } catch {
    return null;
  }
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
      // A component (see MarkdownLink) so the pending-author gate can be
      // read from context: an <a> for a trusted/unknown author, plain
      // text + why-affordance for a pending one.
      return <MarkdownLink key={key} node={node} />;
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
 *   - `authorKey` — the signing key of the content's AUTHOR. When set and
 *     the viewer's trust computation says that author is still pending
 *     trust, every link renders as non-tappable plain text (see
 *     PendingAuthorLinkContext). Omit for non-federated app copy
 *     (MarkdownHint) — links then stay clickable, exactly as before.
 */
export function Markdown({
  text,
  className,
  collapsible,
  authorKey,
}: {
  text: string;
  className?: string;
  collapsible?: boolean;
  authorKey?: string;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  const trust = useTrustDataOrNull();
  const vouches = trust?.vouches;
  const invites = trust?.invites;
  const founderRoots = trust?.founderRoots;
  // Author trust is computed ONCE per Markdown root and fanned out to
  // every link through context. The founder-rooted fixpoint walks the
  // whole vouch graph, but at community scale (tens-to-hundreds of
  // edges) that is cheap; per-link would still work, per-root is free.
  const authorPending = useMemo(() => {
    if (!authorKey || !vouches || !invites) return false;
    return (
      trustStatusWithInvites(authorKey, { vouches, invites, founderRoots }) ===
      "pending_trust"
    );
  }, [authorKey, vouches, invites, founderRoots]);

  // `[overflow-wrap:anywhere]` lets a long pasted URL wrap mid-string rather
  // than push the surrounding card/layout open (carried over from the linkify
  // feature this supersedes). It only breaks when needed, so prose stays intact.
  const wrapperClass = [className, "space-y-2", "[overflow-wrap:anywhere]"]
    .filter(Boolean)
    .join(" ");
  const content = blocks.map(renderBlock);

  // Non-collapsible, or short enough to never need a toggle: render plainly.
  if (!collapsible || text.length <= COLLAPSE_THRESHOLD) {
    return (
      <PendingAuthorLinkContext.Provider value={authorPending}>
        <div className={wrapperClass}>{content}</div>
      </PendingAuthorLinkContext.Provider>
    );
  }

  // Collapsible + long. The inner wrapper is CSS-clamped (max-h-32
  // overflow-hidden — literal classes) when collapsed; the full content is
  // always present in the DOM. Default state is collapsed.
  return (
    <PendingAuthorLinkContext.Provider value={authorPending}>
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
    </PendingAuthorLinkContext.Provider>
  );
}
