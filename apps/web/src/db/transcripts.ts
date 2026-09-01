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
 * Encrypted transcript twins (V7 #477 Phase 2 —
 * docs/transcription-plan.md D3).
 *
 * A transcript is someone's spoken words, written down — it must
 * never be the WEAKER copy of a message whose own plaintext Dexie
 * never holds. Each row stores only NaCl-box ciphertext, boxed under
 * the member's OWN key (`encryptMessage(text, mySecret, myPublic)` —
 * the guardianShards construction): readable by this identity alone,
 * on every install from day one, enrolled passphrase or not.
 *
 * Rows are keyed by the clip they caption — "msg:<messageId>" for a
 * voice note, "blob:<audioBlobId>" for a voice post — so each clip
 * is transcribed at most once and its caption survives the screen
 * closing. Purge posture: cleared whole by softPurge (classified in
 * lib/panic.ts, enforced by purgeCoverage.test.ts), wiped by
 * hardPurge's live-schema sweep, excluded from the export bundle and
 * absent from SNAPSHOT_TABLES — transcripts of other people's voices
 * travel nowhere.
 */

import {
  db,
  getSetting,
  SETTING_KEYS,
  type TranscriptRow,
} from "./database";
import { getSecretKey } from "./secrets";
import { decryptMessage, encryptMessage } from "@/lib/crypto";

export function messageTranscriptKey(messageId: string): string {
  return `msg:${messageId}`;
}

export function blobTranscriptKey(blobId: string): string {
  return `blob:${blobId}`;
}

/** Box a transcript under the member's own key and store it. False
 *  (and nothing stored) when there's no signed-in identity or its
 *  secret is unavailable — the caller's in-memory caption still
 *  shows; only persistence is skipped. */
export async function saveTranscript(
  clipKey: string,
  lang: string,
  text: string,
): Promise<boolean> {
  try {
    const me = await getSetting(SETTING_KEYS.currentMember);
    if (!me) return false;
    const secret = await getSecretKey(me);
    if (!secret) return false;
    const box = encryptMessage(text, secret, me);
    const row: TranscriptRow = {
      id: clipKey,
      ownerKey: me,
      lang,
      nonce: box.nonce,
      ciphertext: box.ciphertext,
      createdAt: Date.now(),
    };
    await db.transcripts.put(row);
    return true;
  } catch {
    return false;
  }
}

/** The stored transcript for a clip, decrypted for the current
 *  member — null when none exists, it belongs to a different
 *  identity, or it can't be opened. */
export async function readTranscript(clipKey: string): Promise<string | null> {
  try {
    const row = await db.transcripts.get(clipKey);
    if (row === undefined) return null;
    const me = await getSetting(SETTING_KEYS.currentMember);
    if (!me || row.ownerKey !== me) return null;
    const secret = await getSecretKey(me);
    if (!secret) return null;
    return decryptMessage(
      { nonce: row.nonce, ciphertext: row.ciphertext },
      secret,
      row.ownerKey,
    );
  } catch {
    return null;
  }
}
