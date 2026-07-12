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
/**
 * Node system signer — the privileged signing surface introduced by
 * `docs/auto-confirm-key.md`. The §2 contract is bounded by audit
 * AND by code: this module authorizes EXACTLY TWO payload shapes the
 * node system key may sign, and nothing else. A future caller that
 * needs the key for a third thing MUST amend the design doc (§2
 * contract 1) and this header before adding a signing surface here.
 *
 *   1. **Auto-confirm** (the original, `auto-confirm-key.md`): the
 *      helped-side signature of an exchange whose helper signature
 *      already verifies. It cannot synthesize a record, change the
 *      canonical payload, or reach any row not already in
 *      `awaiting_confirmation`. See §5 ("What the key cannot do").
 *   2. **Capacity posture** (`capacity-forecast.md` §6): the coarse,
 *      per-node `CapacityPosture` attestation — a traffic-light band
 *      plus a disk-horizon bucket and the recruitment trigger, and
 *      NOTHING quantitative. This is the "node identity attestation"
 *      `auto-confirm-key.md` §4 anticipated: the key is REUSED, not
 *      duplicated, so there is still exactly one operator-held signing
 *      key with one audit story. `signCapacityPosture` signs only the
 *      band decision; it cannot leak a byte count (the type carries
 *      none) and the raw samples never leave the box.
 *
 * Storage: secret bytes come from `NODE_SYSTEM_SECRET_KEY` at boot
 * (held in the immutable Config object) and are never persisted by
 * this module. The pubkey lives in `GET /config` (route-side
 * concern; not this module's job).
 */
import nacl from "tweetnacl";
import {
  canonicalExchangePayload,
  sign,
  stableStringify,
  verify,
} from "@understoria/shared/crypto";
import { b64decode, b64encode } from "@understoria/shared/bytes";
import type {
  Category,
  CapacityPosture,
  Exchange,
} from "@understoria/shared/types";

/** Canonical-payload fields the helper signs. */
export interface AutoConfirmPayload {
  postId: string;
  helperKey: string;
  helpedKey: string;
  hours: number;
  category: Category;
  completedAt: number;
}

/** A request to auto-confirm one record. The client (the PWA sweep)
 *  sends one of these per eligible row; the server independently
 *  checks eligibility before signing. */
export interface AutoConfirmRequest {
  /** A stable record id (UUID) for the resulting Exchange row.
   *  Client-chosen so re-submitting the same row is idempotent at
   *  the outbox layer and at the server store. */
  exchangeId: string;
  /** ms-epoch when the underlying post / task transitioned into
   *  `awaiting_confirmation`. The server uses this against its
   *  configured minimum to decide eligibility. */
  awaitingSince: number;
  /** The exact canonical-payload bytes the helper signed. Repeated
   *  byte-for-byte here so we can re-verify the helper signature
   *  without trusting any reconstruction. */
  payload: AutoConfirmPayload;
  /** The helper's signature over `payload`. Mandatory — without it
   *  the system key has nothing to attach a confirmation to (§4:
   *  the key cannot invent records). */
  helperSignature: string;
}

export type AutoConfirmResult =
  | { kind: "signed"; exchange: Exchange }
  | {
      kind: "ineligible";
      reason:
        | "auto_confirm_disabled"
        | "window_not_elapsed"
        | "bad_helper_signature"
        | "missing_system_key";
    };

/** Signer surface. Keeping the dependency abstract lets the
 *  endpoint pass either the env-derived signer or a per-test one
 *  without leaking secret bytes through more layers. */
export interface SystemSigner {
  /** Base64-encoded Ed25519 public key. Published in `GET /config`. */
  publicKey: string;
  /** Sign a canonical-payload string with the system secret key. */
  signPayload(payload: string): string;
}

/** Build a signer from a base64-encoded secret key. Returns null
 *  when no key was configured — callers handle "auto-confirm
 *  capability is absent" explicitly. */
export function createSystemSignerFromSecret(
  secretKeyB64: string | null,
): SystemSigner | null {
  if (secretKeyB64 === null || secretKeyB64.trim() === "") return null;
  // Validate the secret bytes by deriving the pubkey. A wrong
  // length or format throws here at boot rather than silently
  // signing junk later.
  const secretBytes = b64decode(secretKeyB64);
  const kp = nacl.sign.keyPair.fromSecretKey(secretBytes);
  const publicKey = b64encode(kp.publicKey);
  return {
    publicKey,
    signPayload(payload: string): string {
      return sign(payload, secretKeyB64);
    },
  };
}

/**
 * Eligibility + sign. The two-arg shape (request + context) is the
 * only way to drive the auto-confirm path on the server. Callers
 * MUST pass `autoConfirmHours` and `now`; this module does not read
 * either from elsewhere — testability and §5's "clock-skew is the
 * operator's problem to detect post-hoc" framing both want explicit
 * inputs.
 *
 * Verifies the helper signature against `helperKey` BEFORE signing.
 * This is the §2 bound 4: "It cannot invent records." If the helper
 * signature does not verify, the request is `ineligible:
 * bad_helper_signature` and the system key signs nothing.
 *
 * Returns the fully-signed Exchange row on success. The caller
 * writes it through the existing exchange-write path so federation /
 * downstream effects fire identically to a manual mutual confirm.
 */
export function autoConfirmExchange(
  request: AutoConfirmRequest,
  context: {
    signer: SystemSigner | null;
    nodeId: string;
    autoConfirmHours: number;
    now: number;
  },
): AutoConfirmResult {
  const { signer, nodeId, autoConfirmHours, now } = context;

  if (autoConfirmHours <= 0) {
    // §4 disabled-state: the endpoint refuses to sign. This branch
    // is not redundant with the client eligibility check — the
    // server is the trust boundary for the key and decides
    // independently.
    return { kind: "ineligible", reason: "auto_confirm_disabled" };
  }
  if (signer === null) {
    // §6 PR-A scope: operator can run with auto-confirm
    // intentionally disabled by not setting the env var. We do not
    // crash on boot; here we simply refuse to sign.
    return { kind: "ineligible", reason: "missing_system_key" };
  }
  const ageMs = now - request.awaitingSince;
  if (ageMs < autoConfirmHours * 60 * 60 * 1000) {
    return { kind: "ineligible", reason: "window_not_elapsed" };
  }

  // §2 bound 4: verify the helper signature against the EXACT
  // canonical-payload bytes derived from the client's payload. The
  // shared `canonicalExchangePayload` is stable across engines; the
  // round-trip here both defends against a buggy client and pins
  // the bytes the system key is about to sign.
  const canonical = canonicalExchangePayload(request.payload);
  if (!verify(canonical, request.helperSignature, request.payload.helperKey)) {
    return { kind: "ineligible", reason: "bad_helper_signature" };
  }

  // Sign the SAME canonical payload with the system key. The bytes
  // signed are unchanged — that's the §2 bound 4 invariant. The
  // helped-side signature is the system key's, but it attests to the
  // same hours / category / parties / completedAt the helper signed.
  const helpedSignature = signer.signPayload(canonical);

  const exchange: Exchange = {
    id: request.exchangeId,
    postId: request.payload.postId,
    helperKey: request.payload.helperKey,
    helpedKey: request.payload.helpedKey,
    hoursExchanged: request.payload.hours,
    helperSignature: request.helperSignature,
    helpedSignature,
    completedAt: request.payload.completedAt,
    category: request.payload.category,
    nodeId,
    autoConfirmed: true,
    autoConfirmedBy: `system:${nodeId}`,
    autoConfirmedAt: now,
  };
  return { kind: "signed", exchange };
}

/**
 * Project-task variant. Identical eligibility / signature behaviour
 * to `autoConfirmExchange`; the only differences are at the caller
 * — the task-side caller composes a `postId` of the form
 * `project:<projectId>/task:<taskId>` so federation-side stores can
 * still index the row, and the helped key the organizer would have
 * signed with. The shared signer surface guarantees the bytes
 * signed are identical to the exchange case — there is no
 * task-specific signing path.
 */
export function autoConfirmProjectTaskCompletion(
  request: AutoConfirmRequest,
  context: {
    signer: SystemSigner | null;
    nodeId: string;
    autoConfirmHours: number;
    now: number;
  },
): AutoConfirmResult {
  return autoConfirmExchange(request, context);
}

/**
 * §2 contract payload 2 — sign a coarse `CapacityPosture`
 * (docs/capacity-forecast.md §6). Takes the whole record minus its
 * `signature` and signs its stable-canonical form, so the signature
 * verifies through the generic `verifyStateRecord` /
 * `canonicalStatePayload` path exactly as every other signed LWW state
 * record does — no bespoke canonical function. The signing surface
 * lives here (not scattered `signer.signPayload` calls) so the audit
 * of "what the system key may sign" stays in one file, per the header
 * contract. The caller sets `signerKey` to `signer.publicKey` before
 * passing the record in.
 */
export function signCapacityPosture(
  posture: Omit<CapacityPosture, "signature">,
  signer: SystemSigner,
): string {
  return signer.signPayload(stableStringify(posture));
}
