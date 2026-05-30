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
import { useTranslation } from "react-i18next";
import { AVATAR_HEX, deriveAvatar, type AvatarSpec } from "@/lib/avatar";
import { shortKey } from "@/lib/format";

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

export interface MemberAvatarProps {
  publicKey: string;
  /** Pixel side length. Defaults to 32. */
  size?: number;
  /** Round-corner radius for the framing background, as a
   *  fraction of size. 0 = sharp corners, 0.5 = circle. Default
   *  0.5 (circle). */
  cornerRadius?: number;
  /** Extra className applied to the wrapping SVG (margin, etc.). */
  className?: string;
}

export function MemberAvatar({
  publicKey,
  size = 32,
  cornerRadius = 0.5,
  className,
}: MemberAvatarProps) {
  const { t } = useTranslation();
  const spec = deriveAvatar(publicKey);
  const fill = AVATAR_HEX[spec.fillClass];
  const accent = AVATAR_HEX[spec.accentClass];
  const rx = size * cornerRadius;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={t("avatar.label", { shortKey: shortKey(publicKey) })}
      className={className}
    >
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
      <g
        transform={`rotate(${spec.rotationOffset} 32 32)`}
      >
        <ShapeFor spec={spec} fill={fill} accent={accent} />
        <SprigOverlay decoration={spec.sprigDecoration} accent={accent} />
      </g>
    </svg>
  );
}

function ShapeFor({
  spec,
  fill,
  accent,
}: {
  spec: AvatarSpec;
  fill: string;
  accent: string;
}) {
  switch (spec.shape) {
    case "sapling":
      return <Sapling spec={spec} fill={fill} accent={accent} />;
    case "leafCluster":
      return <LeafCluster spec={spec} fill={fill} accent={accent} />;
    case "sprig":
      return <SprigShape spec={spec} fill={fill} accent={accent} />;
    case "branch":
      return <Branch spec={spec} fill={fill} accent={accent} />;
  }
}

// --- Leaf primitives -------------------------------------------------

interface LeafProps {
  cx: number;
  cy: number;
  rotation: number;
  fill: string;
  shape: AvatarSpec["leafShape"];
  size?: number;
}

function Leaf({ cx, cy, rotation, fill, shape, size = 1 }: LeafProps) {
  const rx = 3.5 * size;
  const ry = 6 * size;
  switch (shape) {
    case "round":
      return (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={fill}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
      );
    case "elongated": {
      // Almond-shaped via path
      const half = ry;
      const w = rx * 0.85;
      return (
        <path
          d={`M ${cx} ${cy - half} Q ${cx + w} ${cy} ${cx} ${cy + half} Q ${cx - w} ${cy} ${cx} ${cy - half} Z`}
          fill={fill}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
      );
    }
    case "scalloped": {
      // Lobed leaf via three overlapping circles
      const a = ry * 0.6;
      return (
        <g transform={`rotate(${rotation} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy - a} r={rx * 0.85} fill={fill} />
          <circle cx={cx - rx * 0.5} cy={cy + a * 0.2} r={rx * 0.8} fill={fill} />
          <circle cx={cx + rx * 0.5} cy={cy + a * 0.2} r={rx * 0.8} fill={fill} />
        </g>
      );
    }
  }
}

// --- Shape variants --------------------------------------------------

function Sapling({
  spec,
  fill,
  accent,
}: {
  spec: AvatarSpec;
  fill: string;
  accent: string;
}) {
  // Vertical stem rising from y=52 to y=20, leaves alternating
  // left/right up the stem. `branchAngle` tilts the whole stem
  // from vertical.
  const stemX1 = 32;
  const stemY1 = 52;
  const stemY2 = 18;
  const tilt = spec.branchAngle * 0.4; // rotate the stem
  const leaves = [];
  // Distribute leaves between stemY1 and stemY2.
  for (let i = 0; i < spec.leafCount; i++) {
    const t = (i + 1) / (spec.leafCount + 1);
    const y = stemY1 - t * (stemY1 - stemY2);
    const side = i % 2 === 0 ? -1 : 1;
    const x = stemX1 + side * 7;
    const rotation = side * 35;
    const isAccent = i === Math.floor(spec.leafCount / 2);
    leaves.push(
      <Leaf
        key={i}
        cx={x}
        cy={y}
        rotation={rotation}
        fill={isAccent ? accent : fill}
        shape={spec.leafShape}
        size={0.8}
      />,
    );
  }
  // Top crown leaf
  leaves.push(
    <Leaf
      key="top"
      cx={stemX1}
      cy={stemY2 - 2}
      rotation={0}
      fill={fill}
      shape={spec.leafShape}
      size={0.9}
    />,
  );
  return (
    <g transform={`rotate(${tilt} 32 36)`}>
      <line
        x1={stemX1}
        y1={stemY1}
        x2={stemX1}
        y2={stemY2}
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.9}
      />
      {leaves}
    </g>
  );
}

function LeafCluster({
  spec,
  fill,
  accent,
}: {
  spec: AvatarSpec;
  fill: string;
  accent: string;
}) {
  // Leaves arranged radially around a center point. No stem.
  const cx = 32;
  const cy = 32;
  const r = 14;
  const leaves = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const angle = (i / spec.leafCount) * 360 + spec.branchAngle;
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.cos(rad - Math.PI / 2) * r;
    const y = cy + Math.sin(rad - Math.PI / 2) * r;
    const isAccent = i === 0;
    leaves.push(
      <Leaf
        key={i}
        cx={x}
        cy={y}
        rotation={angle}
        fill={isAccent ? accent : fill}
        shape={spec.leafShape}
        size={0.85}
      />,
    );
  }
  return (
    <g>
      {leaves}
      <circle cx={cx} cy={cy} r={3} fill={accent} opacity={0.7} />
    </g>
  );
}

function SprigShape({
  spec,
  fill,
  accent,
}: {
  spec: AvatarSpec;
  fill: string;
  accent: string;
}) {
  // Diagonal branch with leaves spaced along one side.
  const x1 = 18;
  const y1 = 50;
  const x2 = 48;
  const y2 = 18;
  // Apply branchAngle as a rotation around the midpoint.
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const leaves = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const t = (i + 0.5) / spec.leafCount;
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    // Offset perpendicular to the branch
    const ox = -(y2 - y1) / Math.hypot(x2 - x1, y2 - y1) * 6;
    const oy = (x2 - x1) / Math.hypot(x2 - x1, y2 - y1) * 6;
    const isAccent = i === spec.leafCount - 1;
    leaves.push(
      <Leaf
        key={i}
        cx={x + ox}
        cy={y + oy}
        rotation={-45}
        fill={isAccent ? accent : fill}
        shape={spec.leafShape}
        size={0.75}
      />,
    );
  }
  return (
    <g transform={`rotate(${spec.branchAngle * 0.6} ${midX} ${midY})`}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.85}
      />
      {leaves}
    </g>
  );
}

function Branch({
  spec,
  fill,
  accent,
}: {
  spec: AvatarSpec;
  fill: string;
  accent: string;
}) {
  // Horizontal branch with leaves above it. Like a low-growing
  // ground branch.
  const y0 = 40;
  const x1 = 12;
  const x2 = 52;
  const leaves = [];
  for (let i = 0; i < spec.leafCount; i++) {
    const t = (i + 0.5) / spec.leafCount;
    const x = x1 + t * (x2 - x1);
    const isAccent = i === Math.floor(spec.leafCount / 2);
    leaves.push(
      <Leaf
        key={i}
        cx={x}
        cy={y0 - 8}
        rotation={spec.branchAngle * 0.5 + (i % 2 === 0 ? -10 : 10)}
        fill={isAccent ? accent : fill}
        shape={spec.leafShape}
        size={0.8}
      />,
    );
  }
  return (
    <g transform={`rotate(${spec.branchAngle * 0.3} 32 ${y0})`}>
      <line
        x1={x1}
        y1={y0}
        x2={x2}
        y2={y0}
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.85}
      />
      {leaves}
    </g>
  );
}

// --- Sprig decoration overlay ---------------------------------------

function SprigOverlay({
  decoration,
  accent,
}: {
  decoration: AvatarSpec["sprigDecoration"];
  accent: string;
}) {
  if (decoration === "none") return null;
  const dots = [];
  if (decoration === "left" || decoration === "both") {
    dots.push(<circle key="l1" cx={10} cy={54} r={1.6} fill={accent} opacity={0.7} />);
    dots.push(<circle key="l2" cx={6} cy={50} r={1.2} fill={accent} opacity={0.5} />);
  }
  if (decoration === "right" || decoration === "both") {
    dots.push(<circle key="r1" cx={54} cy={54} r={1.6} fill={accent} opacity={0.7} />);
    dots.push(<circle key="r2" cx={58} cy={50} r={1.2} fill={accent} opacity={0.5} />);
  }
  return <g>{dots}</g>;
}
