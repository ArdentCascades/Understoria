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
import { signStateRecord } from "@understoria/shared/crypto";
import type { PushNameConsent } from "@understoria/shared/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { enqueuePushNameConsentOutbox, flushOutboxNow } from "@/lib/outbox";
import { uuid } from "@/lib/id";

/*
 * Push name consent — docs/notifications.md v2, "messages named by
 * mutual consent".
 *
 * A member's federated "my name may appear in notifications" flag:
 * their control over their OWN name on other people's lock screens,
 * the pseudonym moral geometry pointed at notifications. Default
 * OFF for everyone (no record = no). Single-owner signed LWW on the
 * seed-vault-pledge machinery; retraction is allow:false so it keeps
 * winning over stale allowing copies.
 *
 * The record carries the boolean ONLY. The name a recipient's lock
 * screen shows is the one THEIR device already holds in its member
 * rows — resolved through `buildPushNameMap` below, which is the
 * recipient-side gate of the three-way AND (sender consented ∧
 * recipient chose named ∧ recipient's device resolves the key).
 */

export type SetConsentResult =
  | { ok: true; consent: PushNameConsent }
  | { ok: false; error: "no_identity" | "locked" };

/** Sign and store the current member's name-consent flag and
 *  enqueue it for the node. */
export async function setPushNameConsent(
  allow: boolean,
): Promise<SetConsentResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }

  const unsigned: Omit<PushNameConsent, "signature"> = {
    id: uuid(),
    memberKey: me,
    allow,
    updatedAt: Date.now(),
    signerKey: me,
  };
  const consent: PushNameConsent = {
    ...unsigned,
    signature: signStateRecord<PushNameConsent>(unsigned, secret),
  };
  await db.transaction(
    "rw",
    [db.pushNameConsents, db.outbox, db.settings],
    async () => {
      await db.pushNameConsents.put(consent);
      await enqueuePushNameConsentOutbox(consent);
    },
  );
  void flushOutboxNow().catch(() => {});
  return { ok: true, consent };
}

/** The current member's own consent row, if any (absence = OFF). */
export async function getMyPushNameConsent(): Promise<PushNameConsent | null> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return null;
  return (await db.pushNameConsents.get(me)) ?? null;
}

/**
 * The senderKey→displayName map the service worker resolves
 * message pings against — the recipient-side gate of the naming
 * AND. Built ONLY from this device's own member rows (never from
 * payload content), filtered to members who consented (allow:true)
 * AND whom the current member has not blocked. A blocked,
 * unconsented or unknown key finds no entry, and the SW renders
 * the generic wording — which is exactly what makes it safe for a
 * name to appear at all.
 *
 * Snapshotted into the SW prefs at Settings-save time (like the
 * display strings): the SW has no Dexie and reads only its tiny
 * prefs database.
 */
export async function buildPushNameMap(): Promise<Record<string, string>> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  const consented = new Set(
    (await db.pushNameConsents.toArray())
      .filter((c) => c.allow)
      .map((c) => c.memberKey),
  );
  if (consented.size === 0) return {};
  const blocked = new Set(
    me
      ? (
          await db.blocks.where("blockerKey").equals(me).toArray()
        ).map((b) => b.blockedKey)
      : [],
  );
  const map: Record<string, string> = {};
  for (const member of await db.members.toArray()) {
    if (!consented.has(member.publicKey)) continue;
    if (blocked.has(member.publicKey)) continue;
    if (!member.displayName) continue;
    map[member.publicKey] = member.displayName;
  }
  return map;
}
