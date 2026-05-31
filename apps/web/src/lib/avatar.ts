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

// Deterministic avatar derivation from a member's Ed25519 public
// key. The avatar IS the public key in pictorial form — it carries
// no information the public key didn't already carry, so there is
// no new exposure surface. Display name is deliberately NOT part
// of the input: it would tie the avatar to a mutable identifier
// (members can change their display name) and would leak display-
// name entropy into the visual.
//
// **The algorithm is load-bearing once shipped.** Changing leaf-
// count modulo, palette assignments, or shape ordering after
// members have started recognizing each other by avatar breaks
// recognition trust the same way changing display names would.
// Any future change to this file requires a docs/threat-model.md
// §7 entry and explicit governance discussion (see
// docs/design-system/avatars or CHANGELOG).
//
// Derivation: base64-decode the public key, take the first 8
// bytes (Ed25519 keys are 32 bytes of cryptographic random;
// uniformly distributed by construction, so no extra hashing is
// needed). Each byte selects from a small enum via modulo. With
// 8 bytes of variation we get 2^64 distinct combinations —
// birthday-paradox collision probability is vanishingly small at
// any plausible community size.

export type AvatarShape = "sapling" | "leafCluster" | "sprig" | "branch";

/** Tailwind palette token mapped to its hex value. Kept in this
 *  file (not read from tailwind.config) so the algorithm is fully
 *  self-contained — see the freeze commitment in the header
 *  comment. */
export type AvatarFill =
  | "canopy-500"
  | "canopy-600"
  | "canopy-700"
  | "moss-500"
  | "moss-600"
  | "moss-700"
  | "bark-500"
  | "bark-600";

export type SprigDecoration = "none" | "left" | "right" | "both";
export type LeafShape = "round" | "elongated" | "scalloped";

export interface AvatarSpec {
  shape: AvatarShape;
  leafCount: number;
  branchAngle: number;
  fillClass: AvatarFill;
  accentClass: AvatarFill;
  sprigDecoration: SprigDecoration;
  leafShape: LeafShape;
  rotationOffset: number;
}

/** Used when the public key can't be decoded (empty, malformed,
 *  pre-onboarding placeholder). Stable so a member who somehow
 *  reaches the renderer without a real key always sees the same
 *  fallback rather than a random one per render. */
export const FALLBACK_SPEC: AvatarSpec = {
  shape: "sapling",
  leafCount: 5,
  branchAngle: 0,
  fillClass: "canopy-600",
  accentClass: "moss-500",
  sprigDecoration: "none",
  leafShape: "round",
  rotationOffset: 0,
};

// Frozen enum orderings — DO NOT REORDER without the §7
// threat-model entry described in the header comment. Reordering
// changes every existing member's avatar.
const SHAPES: readonly AvatarShape[] = [
  "sapling",
  "leafCluster",
  "sprig",
  "branch",
];
const LEAF_COUNTS: readonly number[] = [3, 4, 5, 6, 7];
const BRANCH_ANGLES: readonly number[] = [-15, -8, 0, 8, 15];
const FILLS: readonly AvatarFill[] = [
  "canopy-500",
  "canopy-600",
  "canopy-700",
  "moss-500",
  "moss-600",
  "moss-700",
  "bark-500",
  "bark-600",
];
const ACCENTS: readonly AvatarFill[] = [
  "canopy-500",
  "canopy-600",
  "moss-500",
  "moss-600",
  "bark-500",
  "bark-600",
];
const SPRIG_DECOS: readonly SprigDecoration[] = [
  "none",
  "left",
  "right",
  "both",
];
const LEAF_SHAPES: readonly LeafShape[] = [
  "round",
  "elongated",
  "scalloped",
];

/** Hex values for each AvatarFill token. Pinned to the exact
 *  tailwind.config palette so the avatars match the rest of the
 *  app's visual identity. If the palette itself ever changes,
 *  these stay frozen (per the freeze commitment) — the avatars
 *  may then drift from elsewhere in the app, which is the
 *  correct trade-off: stable recognition beats palette
 *  consistency. */
export const AVATAR_HEX: Record<AvatarFill, string> = {
  "canopy-500": "#22c55e",
  "canopy-600": "#16a34a",
  "canopy-700": "#15803d",
  "moss-500": "#688657",
  "moss-600": "#506b43",
  "moss-700": "#3f5537",
  "bark-500": "#7a6a52",
  "bark-600": "#5e5040",
};

export function deriveAvatar(publicKey: string): AvatarSpec {
  const bytes = tryDecodeBase64(publicKey);
  if (bytes === null || bytes.length < 8) return FALLBACK_SPEC;
  return {
    shape: SHAPES[bytes[0] % SHAPES.length],
    leafCount: LEAF_COUNTS[bytes[1] % LEAF_COUNTS.length],
    branchAngle: BRANCH_ANGLES[bytes[2] % BRANCH_ANGLES.length],
    fillClass: FILLS[bytes[3] % FILLS.length],
    accentClass: ACCENTS[bytes[4] % ACCENTS.length],
    sprigDecoration: SPRIG_DECOS[bytes[5] % SPRIG_DECOS.length],
    leafShape: LEAF_SHAPES[bytes[6] % LEAF_SHAPES.length],
    rotationOffset: (bytes[7] % 17) - 8,
  };
}

/** Base64 → bytes. Returns null on malformed input. Tolerates
 *  both standard and url-safe alphabets (Ed25519 keys in the
 *  codebase are standard base64, but defensive against future
 *  refactors). */
function tryDecodeBase64(s: string): Uint8Array | null {
  if (!s) return null;
  try {
    // Normalize url-safe to standard.
    const normalized = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const raw =
      typeof atob !== "undefined"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("binary");
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}
