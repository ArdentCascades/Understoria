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
import type { SeedVaultPledge } from "@understoria/shared/types";
import { db, getSetting, SETTING_KEYS } from "@/db/database";
import { getSecretKey } from "@/db/secrets";
import { enqueueSeedVaultPledgeOutbox, flushOutboxNow } from "@/lib/outbox";
import { getWindowHorizonMs, undoWindowing } from "@/lib/storageWindow";
import { uuid } from "@/lib/id";

/*
 * The seed-vault role — docs/storage-budget.md Phase 2.
 *
 * A member with room to spare pledges to keep the COMPLETE community
 * archive on a device of theirs. The pledge is a public, revocable,
 * MEMBER-granular signed LWW record (never device-granular — no
 * device census exists and none should); the community counts its
 * full-archive holders on the resilience card without learning
 * anything about anyone's hardware.
 *
 * Mutual exclusion with storage windowing: a vault device must not
 * window, so pledging runs the windowing undo (clear horizon + reset
 * pull cursors → background re-download of the full history), and the
 * windowing UI hides while the pledge is active.
 */

export type SetPledgeResult =
  | { ok: true; pledge: SeedVaultPledge }
  | { ok: false; error: "no_identity" | "locked" };

/** Sign and store the current member's pledge (active or retracted),
 *  enqueue it for the node, and — when activating — undo any local
 *  window so the device actually holds what it promises. */
export async function setSeedVaultPledge(
  active: boolean,
): Promise<SetPledgeResult> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return { ok: false, error: "no_identity" };
  let secret: string;
  try {
    secret = await getSecretKey(me);
  } catch {
    return { ok: false, error: "locked" };
  }

  if (active && (await getWindowHorizonMs()) !== null) {
    // A vault that windows would be lying — restore full custody
    // first. The re-download happens in the background pulls.
    await undoWindowing();
  }

  const unsigned: Omit<SeedVaultPledge, "signature"> = {
    id: uuid(),
    memberKey: me,
    active,
    updatedAt: Date.now(),
    signerKey: me,
  };
  const pledge: SeedVaultPledge = {
    ...unsigned,
    signature: signStateRecord<SeedVaultPledge>(unsigned, secret),
  };
  await db.transaction("rw", [db.seedVaultPledges, db.outbox, db.settings], async () => {
    await db.seedVaultPledges.put(pledge);
    await enqueueSeedVaultPledgeOutbox(pledge);
  });
  void flushOutboxNow().catch(() => {});
  return { ok: true, pledge };
}

/** The current member's own pledge row, if any. */
export async function getMySeedVaultPledge(): Promise<SeedVaultPledge | null> {
  const me = await getSetting(SETTING_KEYS.currentMember);
  if (!me) return null;
  return (await db.seedVaultPledges.get(me)) ?? null;
}

/** How many members currently pledge the full archive — the number
 *  the resilience card shows beside the server count. */
export async function countActiveSeedVaults(): Promise<number> {
  return db.seedVaultPledges.filter((p) => p.active === true).count();
}
