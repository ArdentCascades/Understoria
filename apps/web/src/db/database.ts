import Dexie, { type Table } from "dexie";
import type {
  Achievement,
  Exchange,
  Member,
  Post,
} from "@/types";

export interface AppSetting {
  key: string;
  value: string;
}

/**
 * Local-only secret key storage. Agent 2 will wrap this in a passphrase-
 * derived key (Web Crypto + PBKDF2 or Argon2); today it's stored as a
 * base64 blob in a dedicated table keyed by public key. This table must
 * NEVER be synced, exported, or federated — it's explicitly excluded from
 * the data-export flow in Profile.tsx.
 */
export interface SecretKeyRow {
  publicKey: string;
  secretKey: string;
}

export class UnderstoriaDB extends Dexie {
  members!: Table<Member, string>;
  posts!: Table<Post, string>;
  exchanges!: Table<Exchange, string>;
  achievements!: Table<Achievement, string>;
  settings!: Table<AppSetting, string>;
  secretKeys!: Table<SecretKeyRow, string>;

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
  }
}

export const db = new UnderstoriaDB();

export const SETTING_KEYS = {
  currentMember: "currentMember",
  nodeId: "nodeId",
  celebratedMilestones: "celebratedMilestones",
  onboarded: "onboarded",
} as const;

export async function getSetting(key: string): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
