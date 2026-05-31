/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { ReactElement } from "react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { AVATAR_HEX, deriveAvatar, type AvatarSpec } from "@/lib/avatar";
import { shortKey } from "@/lib/format";
import { darkerShade, lighterShade } from "@/components/avatarShapes";

// Member identity avatar — a parametric botanical illustration
// derived deterministically from a member's public key. See
// lib/avatar.ts for the derivation and the freeze commitment.
//
// Carries information (the public key identity), so this SVG is
// NOT marked decorative — it stays visible under
// prefers-contrast: more. Screen readers receive the short-key
// fingerprint as the aria-label so they have an identification
// handle that matches the textual `shortKey` chrome elsewhere
// in the app.
//
// Artwork polish: the derivation algorithm is frozen, but the
// SVG rendering uses hand-tuned Bézier leaf paths, per-leaf
// linear gradients computed from the spec-derived fill (so no
// new palette colors are introduced), a tapered Sapling stem,
// rule-of-thirds composition anchors per shape variant, subtle
// darker strokes for definition, and leaf-bud SprigOverlay
// shapes. Every spec value still drives the same visual aspect
// as before — same shape variant, same leaf count, same fill,
// same accent — so existing members still recognize each other.

export interface MemberAvatarProps {
  publicKey: string;
  /** Pixel side length. Defaults to 32. */
  size?: number;
  /** Round-corner radius for the framing background, as a
   *  fraction of size. 0 = sharp corners, 0.5 = circle. Default
   *  0.5 (circle). */
  cornerRadius?: number;
  /** When true, render a soft inset ring in the avatar's primary
   *  derived color so the avatar reads as a framed identity
   *  marker rather than a flat inline glyph. Color comes from the
   *  same fill the avatar already uses — no new color choice. */
  framed?: boolean;
  /** Extra className applied to the wrapping SVG (margin, etc.). */
  className?: string;
}

export function MemberAvatar({
  publicKey,
  size = 32,
  cornerRadius = 0.5,
  framed = false,
  className,
}: MemberAvatarProps) {
  const { t } = useTranslation();
  const spec = deriveAvatar(publicKey);
  const fill = AVATAR_HEX[spec.fillClass];
  const accent = AVATAR_HEX[spec.accentClass];
  const rx = size * cornerRadius;

  // Per-render unique IDs so multiple avatars on the same page
  // don't collide in their gradient references.
  const reactId = useId();
  const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");
  const fillGradId = `mavatar-fg-${safeId}`;
  const accentGradId = `mavatar-ag-${safeId}`;

  const fillLight = lighterShade(fill);
  const fillDark = darkerShade(fill);
  const accentLight = lighterShade(accent);
  const accentDark = darkerShade(accent);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={t("avatar.label", { shortKey: shortKey(publicKey) })}
      className={className}
    >
      <defs>
        {/* Bottom-to-top gradient: lighter at the leaf base,
         *  primary spec-derived color at the tip. Both stops are
         *  computed from `fill` so the visual stays inside the
         *  canopy / moss / bark palette no matter which fill the
         *  spec selected. */}
        <linearGradient id={fillGradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={fillLight} />
          <stop offset="100%" stopColor={fill} />
        </linearGradient>
        <linearGradient id={accentGradId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={accentLight} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      {/* Light card-like background tinted toward the primary
       *  fill so the avatar reads against both white and dark
       *  card chrome. The 8% alpha keeps it subtle. */}
      <rect
        x={0}
        y={0}
        width={64}
        height={64}
        rx={(rx * 64) / size}
        ry={(rx * 64) / size}
        fill={fill}
        opacity={0.08}
      />
      {framed && (
        <rect
          x={2}
          y={2}
          width={60}
          height={60}
          rx={(rx * 64) / size}
          ry={(rx * 64) / size}
          fill="none"
          stroke={fill}
          strokeWidth={2.5}
          opacity={0.5}
        />
      )}
      <g transform={`rotate(${spec.rotationOffset} 32 32)`}>
        <ShapeFor
          spec={spec}
          fill={fill}
          accent={accent}
          fillGradId={fillGradId}
          accentGradId={accentGradId}
          fillDark={fillDark}
          accentDark={accentDark}
        />
        <SprigOverlay
          decoration={spec.sprigDecoration}
          accent={accent}
          accentDark={accentDark}
        />
      </g>
    </svg>
  );
}

interface ShapePalette {
  fill: string;
  accent: string;
  fillGradId: string;
  accentGradId: string;
  fillDark: string;
  accentDark: string;
}

function ShapeFor({
  spec,
  ...palette
}: { spec: AvatarSpec } & ShapePalette) {
  switch (spec.shape) {
    case "sapling":
      return <Sapling spec={spec} {...palette} />;
    case "leafCluster":
      return <LeafCluster spec={spec} {...palette} />;
    case "sprig":
      return <SprigShape spec={spec} {...palette} />;
    case "branch":
      return <Branch spec={spec} {...palette} />;
  }
}

// --- Leaf primitive --------------------------------------------------

interface LeafProps {
  cx: number;
  cy: number;
  rotation: number;
  /** Gradient id for the leaf fill. */
  gradientId: string;
  /** Darker shade of the underlying fill, used for the stroke
   *  and central vein so they stay in palette. */
  strokeColor: string;
  shape: AvatarSpec["leafShape"];
  size?: number;
}

/**
 * Hand-tuned leaf primitive. Each variant is a Bézier path with
 * a subtle central vein. Leaves are oriented apex-up before
 * rotation — same orientation convention as the pre-polish
 * version.
 */
function Leaf({
  cx,
  cy,
  rotation,
  gradientId,
  strokeColor,
  shape,
  size = 1,
}: LeafProps) {
  const rx = 3.5 * size;
  const ry = 6 * size;
  const strokeWidth = Math.max(0.4, 0.6 * size);
  const veinWidth = Math.max(0.3, 0.45 * size);
  const transform = `rotate(${rotation} ${cx} ${cy})`;

  switch (shape) {
    case "round": {
      // Round leaf with a slight apex point at the tip.
      const apexY = cy - ry;
      const baseY = cy + ry;
      const sideY = cy + ry * 0.05;
      const path =
        `M ${cx} ${apexY} ` +
        `C ${cx + rx} ${cy - ry * 0.55} ${cx + rx} ${sideY} ${cx} ${baseY} ` +
        `C ${cx - rx} ${sideY} ${cx - rx} ${cy - ry * 0.55} ${cx} ${apexY} Z`;
      return (
        <g transform={transform}>
          <path
            d={path}
            fill={`url(#${gradientId})`}
            stroke={strokeColor}
            strokeOpacity={0.5}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx} ${apexY + ry * 0.25} L ${cx} ${baseY - ry * 0.2}`}
            stroke={strokeColor}
            strokeOpacity={0.4}
            strokeWidth={veinWidth}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
    }
    case "elongated": {
      // Willow / olive / eucalyptus: narrower with pointed tips
      // at both ends.
      const apexY = cy - ry * 1.05;
      const baseY = cy + ry * 1.05;
      const w = rx * 0.6;
      const path =
        `M ${cx} ${apexY} ` +
        `C ${cx + w} ${cy - ry * 0.4} ${cx + w} ${cy + ry * 0.4} ${cx} ${baseY} ` +
        `C ${cx - w} ${cy + ry * 0.4} ${cx - w} ${cy - ry * 0.4} ${cx} ${apexY} Z`;
      return (
        <g transform={transform}>
          <path
            d={path}
            fill={`url(#${gradientId})`}
            stroke={strokeColor}
            strokeOpacity={0.5}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={`M ${cx} ${apexY + ry * 0.2} L ${cx} ${baseY - ry * 0.2}`}
            stroke={strokeColor}
            strokeOpacity={0.4}
            strokeWidth={veinWidth}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
    }
    case "scalloped": {
      // True lobed leaf: a top lobe + two side lobes around a
      // central point. Bottom tapers to a petiole.
      const apexY = cy - ry * 1.05;
      const baseY = cy + ry;
      const topPeakY = cy - ry * 1.05;
      const sideX = rx * 1.05;
      const sideY = cy - ry * 0.15;
      const notchTopY = cy - ry * 0.45;
      const notchTopX = rx * 0.45;
      const notchBotY = cy + ry * 0.35;
      const notchBotX = rx * 0.5;

      // Trace clockwise starting at apex.
      const path =
        `M ${cx} ${apexY} ` +
        `C ${cx + notchTopX * 0.8} ${topPeakY + ry * 0.1} ${cx + notchTopX} ${notchTopY - ry * 0.2} ${cx + notchTopX} ${notchTopY} ` +
        `C ${cx + sideX * 0.9} ${notchTopY + ry * 0.05} ${cx + sideX} ${sideY - ry * 0.1} ${cx + sideX} ${sideY} ` +
        `C ${cx + sideX * 0.9} ${sideY + ry * 0.35} ${cx + notchBotX} ${notchBotY - ry * 0.05} ${cx + notchBotX} ${notchBotY} ` +
        `C ${cx + notchBotX * 0.6} ${baseY - ry * 0.05} ${cx + notchBotX * 0.3} ${baseY} ${cx} ${baseY} ` +
        `C ${cx - notchBotX * 0.3} ${baseY} ${cx - notchBotX * 0.6} ${baseY - ry * 0.05} ${cx - notchBotX} ${notchBotY} ` +
        `C ${cx - sideX * 0.9} ${sideY + ry * 0.35} ${cx - sideX} ${sideY - ry * 0.1} ${cx - sideX} ${sideY} ` +
        `C ${cx - sideX * 0.9} ${notchTopY + ry * 0.05} ${cx - notchTopX} ${notchTopY - ry * 0.2} ${cx - notchTopX} ${notchTopY} ` +
        `C ${cx - notchTopX} ${notchTopY - ry * 0.2} ${cx - notchTopX * 0.8} ${topPeakY + ry * 0.1} ${cx} ${apexY} Z`;

      const veinMain = `M ${cx} ${apexY + ry * 0.15} L ${cx} ${baseY - ry * 0.15}`;
      const veinLeftLobe = `M ${cx} ${cy - ry * 0.2} L ${cx - sideX * 0.7} ${sideY + ry * 0.05}`;
      const veinRightLobe = `M ${cx} ${cy - ry * 0.2} L ${cx + sideX * 0.7} ${sideY + ry * 0.05}`;
      return (
        <g transform={transform}>
          <path
            d={path}
            fill={`url(#${gradientId})`}
            stroke={strokeColor}
            strokeOpacity={0.5}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={veinMain}
            stroke={strokeColor}
            strokeOpacity={0.4}
            strokeWidth={veinWidth}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={veinLeftLobe}
            stroke={strokeColor}
            strokeOpacity={0.35}
            strokeWidth={veinWidth * 0.85}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={veinRightLobe}
            stroke={strokeColor}
            strokeOpacity={0.35}
            strokeWidth={veinWidth * 0.85}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
    }
  }
}

// --- Shape variants --------------------------------------------------

function Sapling({
  spec,
  fill,
  fillGradId,
  accentGradId,
  fillDark,
  accentDark,
}: { spec: AvatarSpec } & ShapePalette) {
  // Rule-of-thirds anchor: stem root at y=54 (base), crown at
  // y=12 (top), so the leaf mass clusters in the upper third
  // around y=22 rather than centered at y=32.
  const stemX = 32;
  const stemBaseY = 54;
  const stemTopY = 12;
  const tilt = spec.branchAngle * 0.4;

  const leaves: ReactElement[] = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const t = (i + 1) / (spec.leafCount + 1);
    // Bias t toward the top so the leaf mass anchors in the
    // upper third (rule-of-thirds composition).
    const biased = Math.pow(t, 0.75);
    const y = stemBaseY - biased * (stemBaseY - stemTopY);
    const side = i % 2 === 0 ? -1 : 1;
    const x = stemX + side * 7;
    const rotation = side * 35;
    const isAccent = i === Math.floor(spec.leafCount / 2);
    leaves.push(
      <Leaf
        key={i}
        cx={x}
        cy={y}
        rotation={rotation}
        gradientId={isAccent ? accentGradId : fillGradId}
        strokeColor={isAccent ? accentDark : fillDark}
        shape={spec.leafShape}
        size={0.8}
      />,
    );
  }
  // Crown leaf at the top tip
  leaves.push(
    <Leaf
      key="top"
      cx={stemX}
      cy={stemTopY - 2}
      rotation={0}
      gradientId={fillGradId}
      strokeColor={fillDark}
      shape={spec.leafShape}
      size={0.9}
    />,
  );

  // Tapered stem path: wider at base (~3px wide total), narrower
  // at the top (~1.5px). Drawn as a filled quadratic ribbon
  // rather than a stroked line.
  const baseHalf = 1.6;
  const topHalf = 0.7;
  const stemPath =
    `M ${stemX - baseHalf} ${stemBaseY} ` +
    `Q ${stemX - baseHalf * 0.6} ${(stemBaseY + stemTopY) / 2} ${stemX - topHalf} ${stemTopY} ` +
    `L ${stemX + topHalf} ${stemTopY} ` +
    `Q ${stemX + baseHalf * 0.6} ${(stemBaseY + stemTopY) / 2} ${stemX + baseHalf} ${stemBaseY} Z`;

  // Small sprout at the base — two tiny leaves angled down and
  // outward, scaled small so they don't dominate at 20px renders.
  const sprout = (
    <g key="sprout">
      <Leaf
        cx={stemX - 4}
        cy={stemBaseY - 1}
        rotation={-120}
        gradientId={fillGradId}
        strokeColor={fillDark}
        shape="round"
        size={0.35}
      />
      <Leaf
        cx={stemX + 4}
        cy={stemBaseY - 1}
        rotation={120}
        gradientId={fillGradId}
        strokeColor={fillDark}
        shape="round"
        size={0.35}
      />
    </g>
  );

  return (
    <g transform={`rotate(${tilt} 32 36)`}>
      <path
        d={stemPath}
        fill={fill}
        stroke={fillDark}
        strokeOpacity={0.5}
        strokeWidth={0.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.95}
      />
      {sprout}
      {leaves}
    </g>
  );
}

function LeafCluster({
  spec,
  accent,
  fillGradId,
  accentGradId,
  fillDark,
  accentDark,
}: { spec: AvatarSpec } & ShapePalette) {
  // Radial cluster centered at 32,32. The 12 o'clock leaf
  // (i === 0) is larger and accent-colored to give the cluster
  // a clear "crown" / directionality.
  const cx = 32;
  const cy = 32;
  const r = 14;
  const leaves: ReactElement[] = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const angle = (i / spec.leafCount) * 360 + spec.branchAngle;
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.cos(rad - Math.PI / 2) * r;
    const y = cy + Math.sin(rad - Math.PI / 2) * r;
    const isAccent = i === 0;
    const leafSize = i === 0 ? 1.0 : 0.85;
    leaves.push(
      <Leaf
        key={i}
        cx={x}
        cy={y}
        rotation={angle}
        gradientId={isAccent ? accentGradId : fillGradId}
        strokeColor={isAccent ? accentDark : fillDark}
        shape={spec.leafShape}
        size={leafSize}
      />,
    );
  }
  return (
    <g>
      {leaves}
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={accent}
        stroke={accentDark}
        strokeOpacity={0.5}
        strokeWidth={0.5}
        opacity={0.75}
      />
    </g>
  );
}

function SprigShape({
  spec,
  fill,
  fillGradId,
  accentGradId,
  fillDark,
  accentDark,
}: { spec: AvatarSpec } & ShapePalette) {
  // Diagonal branch lower-left to upper-right with a larger
  // terminal leaf at the upper-right tip.
  const x1 = 12;
  const y1 = 52;
  const x2 = 50;
  const y2 = 16;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const perpX = -(y2 - y1) / len;
  const perpY = (x2 - x1) / len;

  const leaves: ReactElement[] = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const t = (i + 0.5) / spec.leafCount;
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    const ox = perpX * 6;
    const oy = perpY * 6;
    leaves.push(
      <Leaf
        key={i}
        cx={x + ox}
        cy={y + oy}
        rotation={-45}
        gradientId={fillGradId}
        strokeColor={fillDark}
        shape={spec.leafShape}
        size={0.75}
      />,
    );
  }
  // Terminal leaf at the upper-right tip — larger and accent-
  // colored to anchor the composition.
  leaves.push(
    <Leaf
      key="terminal"
      cx={x2 + perpX * 2}
      cy={y2 + perpY * 2}
      rotation={-45}
      gradientId={accentGradId}
      strokeColor={accentDark}
      shape={spec.leafShape}
      size={0.95}
    />,
  );

  // Tapered branch (wider at the base, narrower at the tip).
  const baseHalf = 1.3;
  const tipHalf = 0.55;
  const branchPerpX = perpX * baseHalf;
  const branchPerpY = perpY * baseHalf;
  const branchTipPerpX = perpX * tipHalf;
  const branchTipPerpY = perpY * tipHalf;
  const branchPath =
    `M ${x1 + branchPerpX} ${y1 + branchPerpY} ` +
    `L ${x2 + branchTipPerpX} ${y2 + branchTipPerpY} ` +
    `L ${x2 - branchTipPerpX} ${y2 - branchTipPerpY} ` +
    `L ${x1 - branchPerpX} ${y1 - branchPerpY} Z`;

  return (
    <g transform={`rotate(${spec.branchAngle * 0.6} ${midX} ${midY})`}>
      <path
        d={branchPath}
        fill={fill}
        stroke={fillDark}
        strokeOpacity={0.5}
        strokeWidth={0.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.95}
      />
      {leaves}
    </g>
  );
}

function Branch({
  spec,
  fill,
  fillGradId,
  accentGradId,
  fillDark,
  accentDark,
}: { spec: AvatarSpec } & ShapePalette) {
  // Horizontal branch at y=42 with leaves above. Tiny twig
  // stems connect each leaf to the main branch so leaves don't
  // float.
  const y0 = 42;
  const x1 = 12;
  const x2 = 52;
  const leafY = y0 - 8;

  const twigs: ReactElement[] = [];
  const leaves: ReactElement[] = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const t = (i + 0.5) / spec.leafCount;
    const x = x1 + t * (x2 - x1);
    const isAccent = i === Math.floor(spec.leafCount / 2);
    twigs.push(
      <line
        key={`twig-${i}`}
        x1={x}
        y1={y0}
        x2={x}
        y2={leafY + 4}
        stroke={fillDark}
        strokeOpacity={0.6}
        strokeWidth={0.7}
        strokeLinecap="round"
      />,
    );
    leaves.push(
      <Leaf
        key={i}
        cx={x}
        cy={leafY}
        rotation={spec.branchAngle * 0.5 + (i % 2 === 0 ? -10 : 10)}
        gradientId={isAccent ? accentGradId : fillGradId}
        strokeColor={isAccent ? accentDark : fillDark}
        shape={spec.leafShape}
        size={0.8}
      />,
    );
  }

  // Tapered horizontal branch (slightly thicker at the middle).
  const branchPath =
    `M ${x1} ${y0 - 0.6} ` +
    `Q ${(x1 + x2) / 2} ${y0 - 1.4} ${x2} ${y0 - 0.6} ` +
    `L ${x2} ${y0 + 0.6} ` +
    `Q ${(x1 + x2) / 2} ${y0 + 1.4} ${x1} ${y0 + 0.6} Z`;

  return (
    <g transform={`rotate(${spec.branchAngle * 0.3} 32 ${y0})`}>
      <path
        d={branchPath}
        fill={fill}
        stroke={fillDark}
        strokeOpacity={0.5}
        strokeWidth={0.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.95}
      />
      {twigs}
      {leaves}
    </g>
  );
}

// --- Sprig decoration overlay ---------------------------------------

function SprigOverlay({
  decoration,
  accent,
  accentDark,
}: {
  decoration: AvatarSpec["sprigDecoration"];
  accent: string;
  accentDark: string;
}) {
  if (decoration === "none") return null;
  // Small leaf-bud shape: a tear-drop / droplet pointed toward
  // the avatar center, suggesting fresh growth. Filled <path>
  // rather than a circle so it reads as botanical detail.
  const buds: ReactElement[] = [];
  const renderBud = (
    key: string,
    cx: number,
    cy: number,
    r: number,
    rotation: number,
    opacity: number,
  ) => {
    const path =
      `M ${cx} ${cy - r * 1.4} ` +
      `C ${cx + r} ${cy - r * 0.6} ${cx + r} ${cy + r * 0.4} ${cx} ${cy + r * 0.9} ` +
      `C ${cx - r} ${cy + r * 0.4} ${cx - r} ${cy - r * 0.6} ${cx} ${cy - r * 1.4} Z`;
    buds.push(
      <path
        key={key}
        d={path}
        fill={accent}
        stroke={accentDark}
        strokeOpacity={0.5}
        strokeWidth={0.35}
        strokeLinejoin="round"
        opacity={opacity}
        transform={`rotate(${rotation} ${cx} ${cy})`}
      />,
    );
  };

  if (decoration === "left" || decoration === "both") {
    // Buds point upper-right (toward avatar center).
    renderBud("l1", 10, 54, 1.6, 35, 0.75);
    renderBud("l2", 6, 50, 1.2, 35, 0.55);
  }
  if (decoration === "right" || decoration === "both") {
    // Buds point upper-left (toward avatar center).
    renderBud("r1", 54, 54, 1.6, -35, 0.75);
    renderBud("r2", 58, 50, 1.2, -35, 0.55);
  }
  return <g>{buds}</g>;
}
