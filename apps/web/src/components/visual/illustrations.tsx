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

// Empty-state illustration set. Five inline SVGs in one shared
// visual language: single-weight 1.5px stroke, currentColor, no
// fills, soft hand-drawn curves, 96x96 viewBox. Decorative —
// always rendered aria-hidden; the surrounding EmptyState carries
// the accessible text.

const SHARED_PROPS = {
  width: 96,
  height: 96,
  viewBox: "0 0 96 96",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: false,
};

export type IllustrationName =
  | "sapling"
  | "hands"
  | "book"
  | "basket"
  | "path";

// A young sapling cradled in cupped hands — the "beginning" image.
export function IllustrationSapling({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* cupped hands */}
      <path d="M22 64c0 6 5 12 13 13h26c8-1 13-7 13-13" />
      <path d="M28 66c0-3 2-5 4-5" />
      <path d="M68 66c0-3-2-5-4-5" />
      {/* soil mound */}
      <path d="M30 64c4-2 9-3 18-3s14 1 18 3" />
      {/* sapling stem */}
      <path d="M48 60V30" />
      {/* leaves */}
      <path d="M48 44c-5-6-12-6-16-3 2 7 8 10 14 8" />
      <path d="M48 36c5-6 12-6 16-3-2 7-8 10-14 8" />
      <path d="M48 30c-3-3-7-4-10-3 1 4 4 6 7 6" />
    </svg>
  );
}

// Two open hands passing a small round object — exchange in motion.
export function IllustrationHands({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* left hand */}
      <path d="M10 58c4 0 8-2 12-6l8-8c2-2 5-2 6 0 1 1 0 3-1 4l-6 6" />
      <path d="M14 54c2 4 5 6 10 7" />
      {/* right hand */}
      <path d="M86 58c-4 0-8-2-12-6l-8-8c-2-2-5-2-6 0-1 1 0 3 1 4l6 6" />
      <path d="M82 54c-2 4-5 6-10 7" />
      {/* gift / object in middle */}
      <circle cx="48" cy="46" r="6" />
      {/* small leaf sprig above the object */}
      <path d="M48 40V32" />
      <path d="M48 34c2-2 5-2 7-1-1 3-3 4-6 4" />
    </svg>
  );
}

// An open book resting on a small stump — knowledge shared.
export function IllustrationBook({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* stump */}
      <ellipse cx="48" cy="74" rx="22" ry="4" />
      <path d="M26 74v6c0 2 10 4 22 4s22-2 22-4v-6" />
      <path d="M44 74v6M52 74v6" />
      {/* book — open V */}
      <path d="M16 50c8-4 18-6 32-6" />
      <path d="M80 50c-8-4-18-6-32-6" />
      <path d="M48 44v22" />
      <path d="M16 50v18c8-4 18-6 32-6" />
      <path d="M80 50v18c-8-4-18-6-32-6" />
      {/* page lines */}
      <path d="M26 56c4-1 9-2 16-2" />
      <path d="M70 56c-4-1-9-2-16-2" />
      <path d="M26 62c4-1 9-2 16-2" />
      <path d="M70 62c-4-1-9-2-16-2" />
    </svg>
  );
}

// A woven basket with handle — the gathered, the kept, the archive.
export function IllustrationBasket({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* handle */}
      <path d="M28 44c0-12 9-20 20-20s20 8 20 20" />
      {/* basket rim */}
      <ellipse cx="48" cy="44" rx="28" ry="4" />
      {/* basket body */}
      <path d="M20 44l6 28c0 2 10 4 22 4s22-2 22-4l6-28" />
      {/* weave — verticals */}
      <path d="M30 48v22M40 48v24M48 48v24M56 48v24M66 48v22" />
      {/* weave — horizontals */}
      <path d="M22 54c8 2 17 3 26 3s18-1 26-3" />
      <path d="M24 64c7 2 16 3 24 3s17-1 24-3" />
    </svg>
  );
}

// A winding path between two trees — the journey ahead.
export function IllustrationPath({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* path */}
      <path d="M40 80c0-6 4-10 8-12s8-6 8-12-4-10-8-12-8-6-8-12" />
      <path d="M56 80c0-6-4-10-8-12" />
      {/* left tree */}
      <path d="M22 70V44" />
      <path d="M22 50c-5-3-10-3-14-1 1 5 6 8 12 8" />
      <path d="M22 42c5-3 10-3 14-1-1 5-6 8-12 8" />
      <path d="M16 70h12" />
      {/* right tree */}
      <path d="M74 70V44" />
      <path d="M74 50c5-3 10-3 14-1-1 5-6 8-12 8" />
      <path d="M74 42c-5-3-10-3-14-1 1 5 6 8 12 8" />
      <path d="M68 70h12" />
    </svg>
  );
}

// Resolver used by EmptyState so callers can pass a name string.
export function Illustration({
  name,
  className,
}: {
  name: IllustrationName;
  className?: string;
}) {
  switch (name) {
    case "sapling":
      return <IllustrationSapling className={className} />;
    case "hands":
      return <IllustrationHands className={className} />;
    case "book":
      return <IllustrationBook className={className} />;
    case "basket":
      return <IllustrationBasket className={className} />;
    case "path":
      return <IllustrationPath className={className} />;
  }
}
