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

// Decorative horizontal divider with a small leaf at center.
// Replaces <hr> where a softer visual break is wanted. Always
// aria-hidden — semantic separation should come from headings, not
// from a graphic. If you need a semantic separator, use <hr> too.
//
// Three variants:
//   full    — line spans the container, leaf centered
//   short   — line is ~60% width, centered
//   dotted  — dotted line spans the container

export type LeafDividerVariant = "full" | "short" | "dotted";

export function LeafDivider({
  variant = "full",
  className,
}: {
  variant?: LeafDividerVariant;
  className?: string;
}) {
  const lineClass =
    variant === "dotted"
      ? "h-px w-full border-t border-dashed border-bark-200 dark:border-moss-800"
      : variant === "short"
        ? "h-px w-[40%] bg-bark-200 dark:bg-moss-800"
        : "h-px flex-1 bg-bark-200 dark:bg-moss-800";
  return (
    <div
      className={[
        "flex items-center gap-3 text-canopy-600 dark:text-canopy-400",
        variant === "short" ? "justify-center" : "",
        className ?? "",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className={lineClass} />
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 14V6" />
        <path d="M8 8c-2-3-5-3-7-2 1 3 4 5 7 5" />
        <path d="M8 6c2-3 5-3 7-2-1 3-4 5-7 5" />
      </svg>
      <span className={lineClass} />
    </div>
  );
}
