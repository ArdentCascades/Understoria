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
import Dexie, { type Table } from "dexie";
import type {
  Achievement,
  Exchange,
  Member,
  Post,
} from "@/types";
import type { SignedVouch } from "@/lib/vouch";

export interface AppSetting {
  key: string;
  value: string;
}

/**
 * Local-only secret key storage. A row holds EITHER plaintext
 * (`secretKey`, base64) OR a passphrase-wrapped blob (`wrapped`). Never
 * both. Plaintext rows only exist on nodes the user has chosen not to
 * passphrase-protect; enabling passphrase protection from Profile
 * rewrites every row in-place. This table must NEVER be synced,
 * exported, or federated — it's explicitly excluded from the data-export
 * flow in Profile.tsx.
 */
export interface SecretKeyRow {
  publicKey: string;
  secretKey?: string;
  wrapped?: import("@/lib/passphrase").WrappedBlob;
}

/**
 * Persisted outbox row for community-node mirroring. Each row represents
 * one signed record (today: an Exchange) that needs to be POSTed to the
 * configured community node. The worker in lib/outbox.ts owns this table
 * — it picks up `pending` rows whose `nextAttemptAt` is in the past,
 * POSTs them, and updates the row's status / backoff.
 *
 * Why persist it rather than fire-and-forget: a community node down for
 * 30 seconds when a member confirms an exchange should not drop that
 * exchange from the community-wide ledger. The outbox is the durable
 * boundary between "this exchange happened on my device" and "this
 * exchange is visible to the community."
 */
export interface OutboxRow {
  /** UUID for this outbox row. Distinct from the wrapped record's id. */
  id: string;
  /** Discriminator for future expansion (posts / vouches / invites). */
  kind: "exchange";
  /** JSON-stringified signed payload. Immutable once enqueued. */
  payload: string;
  /** Id of the wrapped record; lets us avoid double-enqueue on retry. */
  recordId: string;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number;
  status: "pending" | "delivered" | "poisoned";
  lastError?: string;
  lastAttemptAt?: number;
}

/**
 * Persisted state for invite tokens that this node has issued. The
 * signed blob lives in `signed` so re-issuing an already-shared link
 * is a no-op. Redemption is tracked by flipping `status` so the same
 * token cannot be consumed twice.
 */
export interface InviteRow {
  token: string;
  inviterKey: string;
  nodeId: string;
  createdAt: number;
  expiresAt: number;
  status: "open" | "redeemed" | "revoked" | "expired";
  redeemedBy: string | null;
  redeemedAt: number | null;
  /** URL-encoded token string (base64url of the signed invite JSON). */
  encoded: string;
}

export class UnderstoriaDB extends Dexie {
  members!: Table<Member, string>;
  posts!: Table<Post, string>;
  exchanges!: Table<Exchange, string>;
  achievements!: Table<Achievement, string>;
  settings!: Table<AppSetting, string>;
  secretKeys!: Table<SecretKeyRow, string>;
  invites!: Table<InviteRow, string>;
  vouches!: Table<SignedVouch, string>;
  outbox!: Table<OutboxRow, string>;

  constructor(name = "understoria") {
    super(name);
    this.version(1).stores({
      members: "publicKey, displayName, createdAt",
      posts:
        "id, type, status, category, postedBy, claimedBy, createdAt, urgency",
      exchanges:
        "id, postId, helperKey, helpedKey, completedAt, category",
      achievements:
        "id, memberKey, achievementType, earnedAt, [memberKey+achievementType]",
      settings: "key",
    });
    this.version(2).stores({
      secretKeys: "publicKey",
    });
    this.version(3).stores({
      invites: "token, inviterKey, status, createdAt",
      vouches: "id, voucherKey, voucheeKey, createdAt, [voucherKey+voucheeKey]",
    });
    this.version(4).stores({
      outbox: "id, kind, status, nextAttemptAt, recordId, [status+nextAttemptAt]",
    });
  }
}

export const db = new UnderstoriaDB();

export const SETTING_KEYS = {
  currentMember: "currentMember",
  nodeId: "nodeId",
  celebratedMilestones: "celebratedMilestones",
  onboarded: "onboarded",
  /** Base URL of the community node to mirror finalized exchanges to.
   *  Empty / unset means "do not mirror." */
  communityNodeUrl: "communityNodeUrl",
  /** "1" if exchange mirroring is enabled, "0" or absent otherwise. */
  communityNodeEnabled: "communityNodeEnabled",
  /** ISO timestamp of the last successful POST. Display-only. */
  communityNodeLastSuccess: "communityNodeLastSuccess",
  /** Last error message from a submission attempt. Display-only. */
  communityNodeLastError: "communityNodeLastError",
} as const;

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
