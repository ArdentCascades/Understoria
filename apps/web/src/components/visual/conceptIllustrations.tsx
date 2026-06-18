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

// Onboarding concept illustrations. Three new inline SVGs in the same
// visual language as illustrations.tsx — single-weight 1.5px stroke,
// currentColor, no fills, soft hand-drawn curves, 96x96 viewBox —
// plus a resolver that reuses two of the empty-state drawings
// (sapling, hands) so the tour's five concepts share one botanical
// vocabulary. Decorative: always rendered aria-hidden; the concept's
// meaning lives in the OnboardingScreen title + body text, which is
// what carries through under prefers-contrast: more.

import {
  IllustrationSapling,
  IllustrationHands,
} from "./illustrations";

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
  "data-decorative": "true",
};

// An hourglass with a leaf sprouting from the top — time becoming
// growth. The image for the timebank: hours are the soil the network
// grows in.
export function IllustrationHourLeaf({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* top and bottom caps */}
      <path d="M30 30h36" />
      <path d="M30 78h36" />
      {/* glass — two bulbs meeting at the waist */}
      <path d="M34 30c0 9 5 15 14 18-9 3-14 9-14 18" />
      <path d="M62 30c0 9-5 15-14 18 9 3 14 9 14 18" />
      {/* sand settled in the lower bulb */}
      <path d="M40 74c2-5 5-8 8-8s6 3 8 8" />
      {/* stem rising from the top cap */}
      <path d="M48 30V16" />
      {/* a pair of small leaves on the stem */}
      <path d="M48 24c-4-5-10-5-13-2 1 6 7 8 12 6" />
      <path d="M48 20c4-4 9-4 12-2-1 5-6 7-11 5" />
    </svg>
  );
}

// A key whose bow reads as a leaf, with a small sprig at the stem —
// the cryptographic key blended with the understory motif. You hold
// your own key; the key is alive.
export function IllustrationKeyLeaf({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* bow shaped as a leaf, tip up-left */}
      <path d="M44 26c-9-4-18 0-21 9 9 4 18 0 21-9z" />
      {/* leaf vein */}
      <path d="M40 30c-5-1-9 1-12 4" />
      {/* shaft running down to the teeth */}
      <path d="M40 30l22 22" />
      {/* a little sprig where the shaft leaves the bow */}
      <path d="M46 36c4-3 9-2 12 1-3 4-8 4-12 1" />
      {/* teeth at the foot of the key */}
      <path d="M62 52l8 8" />
      <path d="M58 60l6 6" />
      <path d="M54 64l4 4" />
    </svg>
  );
}

// A single small tree — trunk and a soft canopy of a few leaves.
// The collective form of the seedling: projects are growth that more
// than one person tends. Distinct from IllustrationPath's two
// flanking trees.
export function IllustrationTree({ className }: { className?: string }) {
  return (
    <svg {...SHARED_PROPS} className={className}>
      {/* trunk */}
      <path d="M48 80V46" />
      {/* roots flaring at the base */}
      <path d="M40 80c2-4 5-6 8-6s6 2 8 6" />
      {/* low branches lifting into the canopy */}
      <path d="M48 56c-5-3-9-7-11-12" />
      <path d="M48 50c5-3 9-6 11-10" />
      {/* canopy — three soft leaf lobes */}
      <path d="M48 46c-10 0-18-7-18-16 9-4 18 0 22 8" />
      <path d="M48 46c10 0 18-7 18-16-9-4-18 0-22 8" />
      <path d="M48 38c-3-7 0-14 8-17 4 8 1 16-8 17z" />
    </svg>
  );
}

export type ConceptIllustrationName =
  | "timebank"
  | "credit"
  | "identity"
  | "community"
  | "projects";

// Resolver used by OnboardingScreen so the concept steps can pass a
// name string. Two concepts reuse empty-state drawings (sapling for
// the seed balance, hands for the community), the other three use the
// new SVGs above.
export function ConceptIllustration({
  name,
  className,
}: {
  name: ConceptIllustrationName;
  className?: string;
}) {
  switch (name) {
    case "timebank":
      return <IllustrationHourLeaf className={className} />;
    case "credit":
      return <IllustrationSapling className={className} />;
    case "identity":
      return <IllustrationKeyLeaf className={className} />;
    case "community":
      return <IllustrationHands className={className} />;
    case "projects":
      return <IllustrationTree className={className} />;
  }
}
