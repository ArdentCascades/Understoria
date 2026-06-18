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
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Below this character count a description renders plainly — no clamp,
// no toggle. The vast majority of descriptions are short, so they stay
// untouched. We use a conservative length heuristic rather than a
// scrollHeight/clientHeight measurement because layout measurement
// isn't reliable in jsdom, and length is simple, deterministic, and
// testable.
const COLLAPSE_THRESHOLD = 280;

// Literal class strings so Tailwind's content scanner generates the
// rules. A `line-clamp-${n}` template would NOT be detected — the class
// would render with no CSS and silently fail to clamp.
const CLAMP_CLASS: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

/**
 * Renders a block of (newline-preserving) text. Short text renders as a
 * plain paragraph. Long text is clamped to `clampLines` lines with a
 * "Show more"/"Show less" toggle. The full text is ALWAYS present in
 * the DOM — clamping is CSS-only (Tailwind `line-clamp-{n}`) — so
 * `textContent` always contains the whole string for screen readers and
 * tests.
 */
export function ExpandableText({
  text,
  className,
  clampLines = 4,
}: {
  text: string;
  className?: string;
  clampLines?: number;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > COLLAPSE_THRESHOLD;

  if (!isLong) {
    return <p className={className}>{text}</p>;
  }

  // `line-clamp-{n}` needs the text to wrap; the caller's className
  // already carries `whitespace-pre-wrap`, which clamps correctly.
  const clampClass = expanded ? "" : (CLAMP_CLASS[clampLines] ?? CLAMP_CLASS[4]);
  const paragraphClass = [className, clampClass].filter(Boolean).join(" ");

  return (
    <>
      <p className={paragraphClass}>{text}</p>
      <button
        type="button"
        className="mt-1 text-xs font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? t("common.showLess") : t("common.showMore")}
      </button>
    </>
  );
}
