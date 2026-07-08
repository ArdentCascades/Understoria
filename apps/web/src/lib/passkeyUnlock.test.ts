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
//
// The WebAuthn seam, tested through the injectable credentials
// container (the probeNewRoot injectable-fetch pattern). A fake
// authenticator implements PRF the way real ones do: a deterministic
// function of (credential secret, eval salt), returned only from
// assertions when create-time evaluation is "unsupported". Locks:
//   1. enroll → assert derive the SAME KEK — the whole scheme rests
//      on the PRF output being stable per (credential, salt).
//   2. An authenticator without PRF yields `prf_unsupported`, and
//      never a usable KEK.
//   3. A dismissed platform prompt (NotAllowedError) is `cancelled`,
//      not `failed` — the UI stays quiet on it.
//   4. Authenticators that only evaluate PRF at assertion time work:
//      enrollment runs the extra get() and still returns the KEK.
//
import { describe, expect, it } from "vitest";
import nacl from "tweetnacl";
import {
  assertPasskeyKek,
  enrollPasskey,
  type CredentialsApi,
} from "./passkeyUnlock";
import { b64decode } from "./bytes";

interface PrfEvalInputs {
  prf?: { eval?: { first: BufferSource } };
}

function toBytes(src: BufferSource): Uint8Array {
  return src instanceof ArrayBuffer
    ? new Uint8Array(src)
    : new Uint8Array(src.buffer, src.byteOffset, src.byteLength);
}

/** Deterministic fake PRF: SHA-512(credentialSecret || salt)[0..32).
 *  Mirrors the real property that matters — same credential + same
 *  salt → same 32 bytes; anything else → different bytes. */
function fakePrf(credentialSecret: Uint8Array, salt: Uint8Array): ArrayBuffer {
  const input = new Uint8Array(credentialSecret.length + salt.length);
  input.set(credentialSecret, 0);
  input.set(salt, credentialSecret.length);
  return nacl.hash(input).slice(0, 32).buffer as ArrayBuffer;
}

function fakeCredential(
  rawId: Uint8Array,
  ext: {
    prfEnabled?: boolean;
    prfResult?: ArrayBuffer;
  },
): Credential {
  return {
    id: "fake",
    type: "public-key",
    rawId: rawId.buffer,
    getClientExtensionResults: () => ({
      prf:
        ext.prfEnabled === undefined && ext.prfResult === undefined
          ? undefined
          : {
              enabled: ext.prfEnabled,
              results: ext.prfResult ? { first: ext.prfResult } : undefined,
            },
    }),
  } as unknown as Credential;
}

/** A fake authenticator holding one credential secret. `evalAtCreate`
 *  controls whether create() returns PRF output directly or only
 *  advertises `enabled` (forcing the enrollment-time assertion). */
function fakeAuthenticator(opts: {
  evalAtCreate: boolean;
  prfSupported?: boolean;
}): CredentialsApi & { credentialSecret: Uint8Array; rawId: Uint8Array } {
  const credentialSecret = new Uint8Array(32).fill(7);
  const rawId = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const supported = opts.prfSupported ?? true;
  return {
    credentialSecret,
    rawId,
    async create(options) {
      const inputs = options.publicKey!
        .extensions as unknown as PrfEvalInputs;
      const salt = inputs.prf?.eval?.first;
      if (!supported) {
        return fakeCredential(rawId, {});
      }
      if (opts.evalAtCreate && salt) {
        return fakeCredential(rawId, {
          prfEnabled: true,
          prfResult: fakePrf(credentialSecret, toBytes(salt)),
        });
      }
      return fakeCredential(rawId, { prfEnabled: true });
    },
    async get(options) {
      const inputs = options.publicKey!
        .extensions as unknown as PrfEvalInputs;
      const salt = inputs.prf?.eval?.first;
      if (!supported || !salt) return fakeCredential(rawId, {});
      return fakeCredential(rawId, {
        prfResult: fakePrf(credentialSecret, toBytes(salt)),
      });
    },
  };
}

describe("passkeyUnlock — enrollment and assertion through the injectable seam", () => {
  it("enroll and assert derive the same KEK (create-time PRF)", async () => {
    const auth = fakeAuthenticator({ evalAtCreate: true });
    const enrolled = await enrollPasskey({
      displayName: "Mira",
      credentials: auth,
    });
    if (!enrolled.ok) throw new Error(`enroll failed: ${enrolled.error}`);
    expect(enrolled.kek).toHaveLength(32);

    const asserted = await assertPasskeyKek({
      credentialId: enrolled.credentialId,
      prfSalt: b64decode(enrolled.prfSalt),
      credentials: auth,
    });
    if (!asserted.ok) throw new Error(`assert failed: ${asserted.error}`);
    expect(Array.from(asserted.kek)).toEqual(Array.from(enrolled.kek));
  });

  it("enroll works on assert-only PRF authenticators (the common case)", async () => {
    const auth = fakeAuthenticator({ evalAtCreate: false });
    const enrolled = await enrollPasskey({
      displayName: "Mira",
      credentials: auth,
    });
    if (!enrolled.ok) throw new Error(`enroll failed: ${enrolled.error}`);

    const asserted = await assertPasskeyKek({
      credentialId: enrolled.credentialId,
      prfSalt: b64decode(enrolled.prfSalt),
      credentials: auth,
    });
    if (!asserted.ok) throw new Error(`assert failed: ${asserted.error}`);
    expect(Array.from(asserted.kek)).toEqual(Array.from(enrolled.kek));
  });

  it("a different salt yields a different KEK", async () => {
    const auth = fakeAuthenticator({ evalAtCreate: false });
    const enrolled = await enrollPasskey({
      displayName: "Mira",
      credentials: auth,
    });
    if (!enrolled.ok) throw new Error("enroll failed");
    const wrongSalt = new Uint8Array(32).fill(9);
    const asserted = await assertPasskeyKek({
      credentialId: enrolled.credentialId,
      prfSalt: wrongSalt,
      credentials: auth,
    });
    if (!asserted.ok) throw new Error("assert failed");
    expect(Array.from(asserted.kek)).not.toEqual(Array.from(enrolled.kek));
  });

  it("returns prf_unsupported when the authenticator lacks PRF", async () => {
    const auth = fakeAuthenticator({ evalAtCreate: false, prfSupported: false });
    const enrolled = await enrollPasskey({
      displayName: "Mira",
      credentials: auth,
    });
    expect(enrolled).toEqual({ ok: false, error: "prf_unsupported" });
  });

  it("maps a dismissed platform prompt to cancelled", async () => {
    const dismiss: CredentialsApi = {
      async create() {
        const err = new Error("user dismissed");
        err.name = "NotAllowedError";
        throw err;
      },
      async get() {
        const err = new Error("user dismissed");
        err.name = "NotAllowedError";
        throw err;
      },
    };
    const enrolled = await enrollPasskey({
      displayName: "Mira",
      credentials: dismiss,
    });
    expect(enrolled).toEqual({ ok: false, error: "cancelled" });

    const asserted = await assertPasskeyKek({
      credentialId: "AQIDBA",
      prfSalt: new Uint8Array(32),
      credentials: dismiss,
    });
    expect(asserted).toEqual({ ok: false, error: "cancelled" });
  });

  it("maps other ceremony errors to failed", async () => {
    const broken: CredentialsApi = {
      async create() {
        throw new Error("boom");
      },
      async get() {
        throw new Error("boom");
      },
    };
    const enrolled = await enrollPasskey({
      displayName: "Mira",
      credentials: broken,
    });
    expect(enrolled).toEqual({ ok: false, error: "failed" });
  });
});
