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
import { db } from "./database";
import { getSecretKey } from "./secrets";
import { createVouch, verifyVouch } from "@/lib/vouch";
import { enqueueVouchOutbox } from "@/lib/outbox";
import type { SignedVouch } from "@/types";

/**
 * Manual web-of-trust vouch — a trusted member attests that another
 * member is part of the community. The signed record is written to
 * `db.vouches` and (if a community node is configured) enqueued into
 * the outbox so it federates the same way exchanges do.
 *
 * Constraints:
 * - Voucher must hold a secret key on this device (a real member
 *   account, not someone else's public key).
 * - Self-vouching is rejected — it adds no trust information.
 * - Duplicate vouches from the same voucher to the same vouchee are
 *   rejected; they wouldn't change trust status (the computation
 *   already dedupes by voucher key) but they would clutter the
 *   ledger.
 *
 * Returns the persisted SignedVouch on success.
 */
export class VouchValidationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function addManualVouch(input: {
  voucherKey: string;
  voucheeKey: string;
}): Promise<SignedVouch> {
  const { voucherKey, voucheeKey } = input;
  if (voucherKey === voucheeKey) {
    throw new VouchValidationError(
      "self_vouch",
      "You can't vouch for yourself.",
    );
  }
  const existing = await db.vouches
    .where("[voucherKey+voucheeKey]")
    .equals([voucherKey, voucheeKey])
    .first();
  if (existing) {
    throw new VouchValidationError(
      "duplicate",
      "You've already vouched for this member.",
    );
  }

  // Secret key must be loadable; this throws if the session is locked
  // and the voucher's key is wrapped, which is the correct behaviour —
  // a member can't sign anything without authenticating.
  const voucherSecretKey = await getSecretKey(voucherKey);
  const vouch = createVouch({
    voucherKey,
    voucherSecretKey,
    voucheeKey,
    kind: "manual",
  });

  // Defensive: verify the just-created vouch before persisting. If
  // signing was somehow broken, we don't want a bad record on disk.
  if (!verifyVouch(vouch)) {
    throw new VouchValidationError(
      "signing_failed",
      "Vouch signature did not verify locally — refusing to persist.",
    );
  }

  await db.transaction("rw", [db.vouches, db.outbox, db.settings], async () => {
    await db.vouches.put(vouch);
    await enqueueVouchOutbox(vouch);
  });
  return vouch;
}
