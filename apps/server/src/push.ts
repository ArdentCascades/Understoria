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
// Web push from the community's own node (docs/notifications.md).
//
// Standard Web Push, per-node VAPID keys, no vendor SDK: the sender
// is this server, payloads are encrypted to the subscription
// (RFC 8291, via the web-push library), and the browser vendor's
// push service sees timing metadata only — the cost the threat model
// discloses (§7). Payloads are CATEGORY DATA ONLY (shared
// PushPayload): the member's lock-screen tier and custom title never
// reach this module, and message bodies never exist in any payload
// because no messages category exists (the shared category enum is
// the contract; sendCategoryPush refuses anything outside it).
import webpush from "web-push";
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import {
  isNotificationCategory,
  type PushPayload,
} from "@understoria/shared";
import type {
  PushSubscriptionRow,
  PushSubscriptionStore,
} from "./db.js";

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

/**
 * Load-or-mint this node's VAPID key pair. Minted once on first boot
 * and persisted in `meta` (inside the encrypted ledger); the public
 * half is what clients subscribe against, so rotating it invalidates
 * every subscription — deliberate operator surgery, never automatic.
 */
export function ensureVapidKeys(db: DatabaseType): VapidKeys {
  const read = db.prepare("SELECT value FROM meta WHERE key = ?");
  const pub = read.get("vapid_public_key") as { value: string } | undefined;
  const priv = read.get("vapid_private_key") as { value: string } | undefined;
  if (pub && priv) {
    return { publicKey: pub.value, privateKey: priv.value };
  }
  const minted = webpush.generateVAPIDKeys();
  const write = db.prepare(
    "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)",
  );
  write.run("vapid_public_key", minted.publicKey);
  write.run("vapid_private_key", minted.privateKey);
  return minted;
}

/** Injectable transport so tests never touch a real push service. */
export type PushTransport = (
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  payload: string,
  options: {
    vapidDetails: { subject: string; publicKey: string; privateKey: string };
    TTL: number;
  },
) => Promise<unknown>;

const defaultTransport: PushTransport = (subscription, payload, options) =>
  webpush.sendNotification(subscription, payload, options);

/** How long the push service may hold an undelivered ping. Short on
 *  purpose: a reminder delivered a day late is worse than none. */
const PUSH_TTL_SECONDS = 4 * 60 * 60;

/** The VAPID `sub` claim — a contact hint for push services, not a
 *  real mailbox; per spec it just has to be a mailto/https URI. */
const VAPID_SUBJECT = "https://github.com/understoria";

export interface PushSender {
  /** Send `payload` to every live subscription opted into its
   *  category. Dead endpoints (404/410 from the push service) are
   *  pruned as they surface; other failures are logged and skipped —
   *  one device's outage never starves the rest. Returns how many
   *  sends were attempted. */
  sendCategoryPush(payload: PushPayload, now?: number): Promise<number>;
  /** Send `payload` to ONE member's opted-in devices — what every
   *  real trigger uses, because each ping has a person on the other
   *  end (docs/notifications.md: a shift YOU signed up for, work
   *  waiting on YOUR word). Same enum gate, same pruning; a member
   *  with the category off (or no subscription) gets zero sends,
   *  silently — the send-time filtering the doc requires. */
  sendToMember(
    memberKey: string,
    payload: PushPayload,
    now?: number,
  ): Promise<number>;
}

export function createPushSender(
  store: PushSubscriptionStore,
  keys: VapidKeys,
  transport: PushTransport = defaultTransport,
  log: (msg: string) => void = () => {},
): PushSender {
  async function sendOne(
    row: PushSubscriptionRow,
    body: string,
  ): Promise<void> {
    try {
      await transport(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body,
        {
          vapidDetails: {
            subject: VAPID_SUBJECT,
            publicKey: keys.publicKey,
            privateKey: keys.privateKey,
          },
          TTL: PUSH_TTL_SECONDS,
        },
      );
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        store.pruneDeadEndpoint(row.endpoint);
        return;
      }
      log(`push send failed (${status ?? "?"}) for one endpoint`);
    }
  }

  async function sendRows(
    rows: readonly PushSubscriptionRow[],
    payload: PushPayload,
  ): Promise<number> {
    const body = JSON.stringify(payload);
    await Promise.all(rows.map((row) => sendOne(row, body)));
    return rows.length;
  }

  function gate(payload: PushPayload): void {
    // The category enum is the contract (docs/notifications.md
    // nevers): nothing outside it can ever be sent, whatever a
    // future caller tries.
    if (!isNotificationCategory(payload.category)) {
      throw new Error(
        `push category ${JSON.stringify(payload.category)} is not in the documented list`,
      );
    }
  }

  return {
    async sendCategoryPush(payload, now = Date.now()) {
      gate(payload);
      return sendRows(store.listForCategory(payload.category, now), payload);
    },
    async sendToMember(memberKey, payload, now = Date.now()) {
      gate(payload);
      return sendRows(
        store
          .listForCategory(payload.category, now)
          .filter((row) => row.memberKey === memberKey),
        payload,
      );
    },
  };
}
