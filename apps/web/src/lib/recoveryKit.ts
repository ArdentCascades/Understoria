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
import nacl from "tweetnacl";
import { db, getSetting, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { markOnboarded } from "@/db/onboarding";
import {
  currentLockState,
  getSecretKey,
  persistSecretKey,
} from "@/db/secrets";
import { b64decode, b64encode } from "@/lib/bytes";
import {
  deriveMasterKey,
  newSalt,
  saltFromBlob,
  unwrap,
  wrap,
  type WrappedBlob,
} from "@/lib/passphrase";
import { readAcceptedMirrors, acceptMirror } from "@/lib/nodeEndpoints";
import { readSubmitConfig, writeSubmitConfig } from "@/lib/nodeSubmit";

/**
 * Identity recovery kit, Phase K1 — docs/identity-recovery.md §1.
 *
 * A member IS their keypair: balance, vouches, roles, and (since
 * member-authenticated reads) membership itself. A lost phone with no
 * paired second device used to mean all of it was gone. The kit is
 * the self-custody answer: a small file (or printed QR) holding the
 * secret key encrypted under a RECOVERY passphrase — the exact
 * PBKDF2-600k + secretbox wrap `lib/passphrase.ts` already ships, no
 * new primitives — plus the plaintext coordinates a fresh install
 * needs to find home (public key, display name, community id, node
 * URLs).
 *
 * The kit passphrase is chosen at export and deliberately INDEPENDENT
 * of the session passphrase: a kit in a drawer must not unlock
 * because someone shoulder-surfed the daily passphrase, and members
 * without daily passphrases still get kits.
 *
 * What restore does NOT bring back, honestly: E2E message history
 * (ciphertext lives only on devices), unsynced drafts, and anything a
 * community with no surviving node can't re-serve (which re-seed —
 * docs/community-reseed.md — exists to prevent). The operator appears
 * nowhere in this path, by design.
 */

export const RECOVERY_KIT_KIND = "understoria-recovery-kit";

export interface RecoveryKit {
  kind: typeof RECOVERY_KIT_KIND;
  version: 1;
  publicKey: string;
  displayName: string;
  /** The community id (record attribution / dashboard scoping). */
  nodeId: string | null;
  /** Where home is — suggestions for the restoring device, editable
   *  there (a years-old kit may name a moved server). */
  communityNodeUrl: string | null;
  mirrors: string[];
  createdAt: number;
  /** The secret key, wrapped under the KIT passphrase. */
  secret: WrappedBlob;
}

export type BuildKitResult =
  | { ok: true; kit: RecoveryKit }
  | { ok: false; error: "no_identity" | "locked" };

/**
 * Build a kit for the current member. Requires the secret key to be
 * readable NOW (an unlocked or unprotected session) — the kit wraps
 * the raw key under the kit passphrase, never re-wraps the session
 * blob (independence, see module comment).
 */
export async function buildRecoveryKit(
  kitPassphrase: string,
): Promise<BuildKitResult> {
  const publicKey = await getSetting(SETTING_KEYS.currentMember);
  if (!publicKey) return { ok: false, error: "no_identity" };
  const member = await db.members.get(publicKey);
  if (!member) return { ok: false, error: "no_identity" };

  let secretB64: string;
  try {
    secretB64 = await getSecretKey(publicKey); // throws while locked
  } catch {
    return { ok: false, error: "locked" };
  }

  const salt = newSalt();
  const masterKey = await deriveMasterKey(kitPassphrase, salt);
  const secret = wrap(secretB64, masterKey, salt);

  const [nodeId, nodeConfig, mirrors] = await Promise.all([
    getSetting(SETTING_KEYS.nodeId),
    readSubmitConfig(),
    readAcceptedMirrors(),
  ]);

  return {
    ok: true,
    kit: {
      kind: RECOVERY_KIT_KIND,
      version: 1,
      publicKey,
      displayName: member.displayName,
      nodeId: nodeId ?? null,
      communityNodeUrl:
        nodeConfig.enabled && nodeConfig.url.trim() !== ""
          ? nodeConfig.url.trim()
          : null,
      mirrors: [...mirrors],
      createdAt: Date.now(),
      secret,
    },
  };
}

export type ParseKitResult =
  | { ok: true; kit: RecoveryKit }
  | { ok: false; error: "not_a_kit" | "unsupported_version" };

/** Strict shape gate over untrusted file/QR content. */
export function parseRecoveryKit(text: string): ParseKitResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "not_a_kit" };
  }
  if (raw === null || typeof raw !== "object") {
    return { ok: false, error: "not_a_kit" };
  }
  const k = raw as Record<string, unknown>;
  if (k.kind !== RECOVERY_KIT_KIND) return { ok: false, error: "not_a_kit" };
  if (k.version !== 1) return { ok: false, error: "unsupported_version" };
  const secret = k.secret as Record<string, unknown> | null;
  if (
    typeof k.publicKey !== "string" ||
    k.publicKey === "" ||
    typeof k.displayName !== "string" ||
    typeof k.createdAt !== "number" ||
    secret === null ||
    typeof secret !== "object" ||
    secret.v !== 1 ||
    secret.kdf !== "pbkdf2-sha256" ||
    typeof secret.iterations !== "number" ||
    typeof secret.salt !== "string" ||
    typeof secret.nonce !== "string" ||
    typeof secret.ciphertext !== "string"
  ) {
    return { ok: false, error: "not_a_kit" };
  }
  return {
    ok: true,
    kit: {
      kind: RECOVERY_KIT_KIND,
      version: 1,
      publicKey: k.publicKey,
      displayName: k.displayName,
      nodeId: typeof k.nodeId === "string" && k.nodeId !== "" ? k.nodeId : null,
      communityNodeUrl:
        typeof k.communityNodeUrl === "string" && k.communityNodeUrl !== ""
          ? k.communityNodeUrl
          : null,
      mirrors: Array.isArray(k.mirrors)
        ? k.mirrors.filter((m): m is string => typeof m === "string")
        : [],
      createdAt: k.createdAt,
      secret: secret as unknown as WrappedBlob,
    },
  };
}

export type RestoreResult =
  | { ok: true; publicKey: string }
  | {
      ok: false;
      error: "wrong_passphrase" | "corrupted_kit" | "device_locked";
    };

/**
 * Restore an identity from a kit onto THIS device. Mirrors the
 * device-pairing import path (`PairDevice.importPayload`): member row
 * created (or profile left intact when it already exists), secret key
 * persisted through `persistSecretKey` (wrapped when the device has a
 * live session key), current member + onboarded set, and the kit's
 * community coordinates adopted where the device has none of its own.
 * The caller navigates + refreshes app state afterwards.
 */
export async function restoreFromRecoveryKit(
  kit: RecoveryKit,
  kitPassphrase: string,
): Promise<RestoreResult> {
  const masterKey = await deriveMasterKey(
    kitPassphrase,
    saltFromBlob(kit.secret),
    kit.secret.iterations,
  );
  const secretB64 = unwrap(kit.secret, masterKey);
  if (secretB64 === null) return { ok: false, error: "wrong_passphrase" };

  // The decrypted key must actually BE the named identity — a
  // corrupted or hand-edited kit fails here rather than minting a
  // key that can't sign as its public half.
  try {
    const derived = nacl.sign.keyPair.fromSecretKey(b64decode(secretB64));
    if (b64encode(derived.publicKey) !== kit.publicKey) {
      return { ok: false, error: "corrupted_kit" };
    }
  } catch {
    return { ok: false, error: "corrupted_kit" };
  }

  // Same guard as the pairing import: a protected-and-locked device
  // has no live master key to wrap under, and we never write a
  // plaintext key beside wrapped ones.
  if ((await currentLockState()) === "locked") {
    return { ok: false, error: "device_locked" };
  }

  const memberCountBefore = await db.members.count();
  const existing = await db.members.get(kit.publicKey);
  await db.transaction("rw", [db.members, db.secretKeys], async () => {
    if (!existing) {
      await createMember(
        { publicKey: kit.publicKey, displayName: kit.displayName },
        kit.nodeId ?? (await getSetting(SETTING_KEYS.nodeId)) ?? "node_local",
      );
    }
    await persistSecretKey(kit.publicKey, secretB64);
  });
  await setSetting(SETTING_KEYS.currentMember, kit.publicKey);
  await markOnboarded();

  // Adopt the kit's community id on a FRESH device only (same rule as
  // the pairing import — a device with its own community keeps it).
  if (kit.nodeId && memberCountBefore === 0) {
    await setSetting(SETTING_KEYS.nodeId, kit.nodeId);
  }
  // Node coordinates are SUGGESTIONS: adopt only where nothing is
  // configured; a stale kit must never clobber a live config.
  if (kit.communityNodeUrl) {
    const current = await readSubmitConfig();
    if (current.url.trim() === "") {
      await writeSubmitConfig({ url: kit.communityNodeUrl, enabled: true });
      for (const mirror of kit.mirrors) {
        try {
          await acceptMirror(mirror);
        } catch {
          /* best-effort */
        }
      }
    }
  }

  // First sync — the community pours back in (the kit carries the
  // self; the network carries the history).
  void import("@/lib/federationSync").then((sync) => {
    void sync.pullFederatedPosts();
    void sync.pullFederatedClaims();
    void sync.pullFederatedTaskComments();
    void sync.pullFederatedExchanges();
    void sync.pullFederatedCoOrgInvitations();
    void sync.pullFederatedCoOrgResponses();
    void sync.pullFederatedCoOrgRevocations();
    void sync.pullFederatedEvents();
    void sync.pullFederatedEventCancellations();
    void sync.pullFederatedRedemptions();
    void sync.pullFederatedInviteRevocations();
    void sync.pullFederatedVouches();
    void sync.pullFederatedProjectStates();
    void sync.pullFederatedTaskStates();
    void sync.pullFederatedEventShifts();
    void sync.pullFederatedEventRsvps();
    void sync.pullFederatedShiftSignups();
  });

  return { ok: true, publicKey: kit.publicKey };
}

/** Filename for the downloaded kit — dated so a drawer of kits sorts. */
export function recoveryKitFilename(kit: RecoveryKit): string {
  const d = new Date(kit.createdAt);
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `understoria-recovery-kit-${stamp}.json`;
}
