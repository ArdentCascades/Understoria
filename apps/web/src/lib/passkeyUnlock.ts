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
import { b64encode, randomBytes, utf8encode } from "./bytes";
import { isDesktopShell } from "./desktop";

/**
 * Passkey unlock — the WebAuthn half of the device-master-key envelope
 * (db/secrets.ts holds the storage half).
 *
 * What a passkey does here, and what it deliberately does NOT do:
 * a passkey CANNOT replace the member's Ed25519 identity — WebAuthn
 * only signs its own ceremony format, never the canonical payloads
 * federation verifies. What it CAN do is stand in for the passphrase:
 * the `prf` extension returns a high-entropy 32-byte secret, stable
 * per credential and gated behind the platform's user verification
 * (Face ID / fingerprint / device PIN). We HKDF that secret into a
 * key-encryption key (KEK) that wraps the device master key, exactly
 * the role the passphrase's PBKDF2 output plays. The passphrase stays
 * enrolled as the guaranteed fallback — a passkey is an ADDITIONAL
 * unlock method, never the only one (secrets.ts enforces this).
 *
 * The whole ceremony is local: no server round-trip, no challenge
 * verification (there is no relying-party server — the challenge is
 * random and unused), so unlock works fully offline, storm hub or no
 * hub. The credential is bound to the community's domain like any
 * passkey.
 *
 * Everything network-less and WebAuthn-shaped goes through an
 * injectable `credentials` container (the probeNewRoot fetch pattern)
 * so the derivation logic is unit-testable without a browser
 * authenticator.
 */

/** Stored (non-secret) enrollment metadata — db/secrets.ts persists
 *  this next to the wrapped device master key. */
export interface PasskeyEnrollmentMeta {
  /** base64url of the credential's rawId. */
  credentialId: string;
  /** base64 of the 32-byte PRF evaluation salt, fixed at enrollment. */
  prfSalt: string;
  createdAt: number;
}

export type PasskeyErrorCode =
  /** No WebAuthn on this browser at all. */
  | "unsupported"
  /** Authenticator created a credential but does not support the prf
   *  extension — no wrapping key can ever come out of it. */
  | "prf_unsupported"
  /** The member dismissed the platform prompt. Not an error to show
   *  loudly — callers should stay quiet or say "cancelled". */
  | "cancelled"
  /** Anything else (ceremony error, missing PRF output at assert
   *  time, malformed response). */
  | "failed";

export type PasskeyEnrollResult =
  | { ok: true; credentialId: string; prfSalt: string; kek: Uint8Array }
  | { ok: false; error: PasskeyErrorCode };

export type PasskeyAssertResult =
  | { ok: true; kek: Uint8Array }
  | { ok: false; error: PasskeyErrorCode };

/** The slice of CredentialsContainer we use — injectable for tests. */
export interface CredentialsApi {
  create(options: CredentialCreationOptions): Promise<Credential | null>;
  get(options: CredentialRequestOptions): Promise<Credential | null>;
}

// The prf extension shapes. lib.dom's AuthenticationExtensions* types
// don't carry `prf` on every TS version this repo may build under, so
// we type the extension locally and cast at the WebAuthn boundary.
interface PrfExtensionInputs {
  prf?: { eval?: { first: BufferSource } };
}
interface PrfExtensionOutputs {
  prf?: { enabled?: boolean; results?: { first?: ArrayBuffer } };
}

interface PublicKeyCredentialLike extends Credential {
  rawId: ArrayBuffer;
  getClientExtensionResults(): PrfExtensionOutputs;
}

const PRF_SALT_LENGTH = 32;
const HKDF_SALT = "understoria-passkey-kek";
const HKDF_INFO = "unlock-v1";

/** Sync capability check: does this browser have WebAuthn at all?
 *  The desktop shell (app:// origin) is excluded even though the
 *  APIs exist there: WebAuthn binds credentials to a registrable
 *  domain, which a custom scheme doesn't have — create/get would
 *  fail with a SecurityError. The UI degrades exactly as on a
 *  browser without WebAuthn: passphrase-only, which secrets.ts
 *  guarantees is always sufficient. */
export function supportsPasskeys(): boolean {
  if (isDesktopShell()) return false;
  return (
    typeof PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials
  );
}

/**
 * Derive the 32-byte KEK from a PRF output. HKDF-SHA256 with fixed,
 * versioned salt/info strings: the PRF secret is already uniform, but
 * binding the derivation to an app-specific context means the same
 * credential used by any other application (or a future Understoria
 * purpose with a different info string) can never yield this KEK.
 */
export async function deriveKekFromPrf(
  prfOutput: ArrayBuffer,
): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    prfOutput,
    "HKDF",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: utf8encode(HKDF_SALT) as BufferSource,
      info: utf8encode(HKDF_INFO) as BufferSource,
    },
    baseKey,
    256,
  );
  return new Uint8Array(bits);
}

const b64urlFromBuffer = (buf: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const bufferFromB64url = (s: string): Uint8Array => {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

function isAbort(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === "NotAllowedError" || err.name === "AbortError")
  );
}

/**
 * Create a passkey and derive its unlock KEK. TWO platform prompts
 * are normal here: one to create the credential, and — on
 * authenticators that only evaluate PRF during assertions (a common
 * implementation) — a second to run the first evaluation. Callers'
 * copy should say so before starting.
 *
 * `prf_unsupported` is returned when the authenticator created a
 * credential without PRF; the orphan platform credential is harmless
 * (it wraps nothing) but cannot be deleted from JS — the member can
 * remove it from their OS password manager.
 */
export async function enrollPasskey(input: {
  displayName: string;
  credentials?: CredentialsApi;
}): Promise<PasskeyEnrollResult> {
  const api = input.credentials ?? defaultApi();
  if (!api) return { ok: false, error: "unsupported" };

  const prfSaltBytes = randomBytes(PRF_SALT_LENGTH);
  let created: Credential | null;
  try {
    created = await api.create({
      publicKey: {
        rp: { name: "Understoria" },
        user: {
          // A random local handle — deliberately NOT the member's
          // public key, so the platform credential store learns
          // nothing that links this passkey to the federated
          // identity.
          id: randomBytes(16) as BufferSource,
          name: input.displayName,
          displayName: input.displayName,
        },
        // The challenge is required by the API but verified by no
        // one: there is no relying-party server in this ceremony.
        challenge: randomBytes(32) as BufferSource,
        pubKeyCredParams: [
          { type: "public-key", alg: -8 }, // Ed25519
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "required",
        },
        extensions: {
          prf: { eval: { first: prfSaltBytes as BufferSource } },
        } as PrfExtensionInputs as AuthenticationExtensionsClientInputs,
      },
    });
  } catch (err) {
    return { ok: false, error: isAbort(err) ? "cancelled" : "failed" };
  }
  if (!created) return { ok: false, error: "failed" };

  const cred = created as PublicKeyCredentialLike;
  const credentialId = b64urlFromBuffer(cred.rawId);
  const ext = cred.getClientExtensionResults();
  if (!ext.prf?.enabled && !ext.prf?.results?.first) {
    return { ok: false, error: "prf_unsupported" };
  }

  // Some authenticators return PRF output at create time; the rest
  // require an assertion. Use the create-time output when present,
  // otherwise run the first assertion now.
  let prfOutput = ext.prf?.results?.first ?? null;
  if (!prfOutput) {
    const asserted = await assertPrf(api, credentialId, prfSaltBytes);
    if (!asserted.ok) return asserted;
    prfOutput = asserted.prfOutput;
  }

  return {
    ok: true,
    credentialId,
    prfSalt: b64encode(prfSaltBytes),
    kek: await deriveKekFromPrf(prfOutput),
  };
}

/**
 * Run the unlock assertion for an enrolled passkey and derive the
 * same KEK enrollment produced. One platform prompt.
 */
export async function assertPasskeyKek(input: {
  credentialId: string;
  prfSalt: Uint8Array;
  credentials?: CredentialsApi;
}): Promise<PasskeyAssertResult> {
  const api = input.credentials ?? defaultApi();
  if (!api) return { ok: false, error: "unsupported" };
  const asserted = await assertPrf(api, input.credentialId, input.prfSalt);
  if (!asserted.ok) return asserted;
  return { ok: true, kek: await deriveKekFromPrf(asserted.prfOutput) };
}

async function assertPrf(
  api: CredentialsApi,
  credentialId: string,
  prfSalt: Uint8Array,
): Promise<
  { ok: true; prfOutput: ArrayBuffer } | { ok: false; error: PasskeyErrorCode }
> {
  let asserted: Credential | null;
  try {
    asserted = await api.get({
      publicKey: {
        challenge: randomBytes(32) as BufferSource,
        allowCredentials: [
          {
            type: "public-key",
            id: bufferFromB64url(credentialId) as BufferSource,
          },
        ],
        userVerification: "required",
        extensions: {
          prf: { eval: { first: prfSalt as BufferSource } },
        } as PrfExtensionInputs as AuthenticationExtensionsClientInputs,
      },
    });
  } catch (err) {
    return { ok: false, error: isAbort(err) ? "cancelled" : "failed" };
  }
  if (!asserted) return { ok: false, error: "failed" };
  const out = (
    asserted as PublicKeyCredentialLike
  ).getClientExtensionResults().prf?.results?.first;
  if (!out) return { ok: false, error: "failed" };
  return { ok: true, prfOutput: out };
}

function defaultApi(): CredentialsApi | null {
  if (!supportsPasskeys()) return null;
  const c = navigator.credentials;
  // Bind — CredentialsContainer methods throw when detached.
  return {
    create: (o) => c.create(o),
    get: (o) => c.get(o),
  };
}
