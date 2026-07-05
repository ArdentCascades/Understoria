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
import { db, SETTING_KEYS, setSetting, getSetting } from "./database";
import { persistSecretKey } from "./secrets";
import { uuid } from "@/lib/id";
import { generateKeyPair, sign } from "@/lib/crypto";
import { canonicalPostPayload } from "@understoria/shared/crypto";
import { createVouch } from "@/lib/vouch";
import type { Member, Post, SignedVouch } from "@/types";

// Wraps the immutable subset of a seed Post with a real signature
// using the poster's freshly-generated secret key. Keeps the seed
// data path consistent with `createPost` so demo posts pass
// `verifyPost()` and federate the same way real posts do.
function signSeedPost(
  immutable: Omit<Post, "claimedBy" | "status" | "confirmedBy" | "signature">,
  posterSecretKey: string,
): Post {
  return {
    ...immutable,
    claimedBy: null,
    status: "open",
    confirmedBy: [],
    signature: sign(canonicalPostPayload(immutable), posterSecretKey),
  };
}

const DEFAULT_SEED_BALANCE = 5;

export async function ensureNodeId(): Promise<string> {
  const existing = await getSetting(SETTING_KEYS.nodeId);
  if (existing) return existing;
  const nodeId = `node_${uuid().slice(0, 8)}`;
  await setSetting(SETTING_KEYS.nodeId, nodeId);
  return nodeId;
}

/**
 * Creates a member with a real Ed25519 keypair. The private key is stored
 * locally in the `secretKeys` table — Agent 2 will wrap this in
 * passphrase-derived encryption. For now, data-export explicitly omits
 * this table.
 */
export async function createMember(
  partial: Partial<Member> & { displayName: string },
  nodeId: string,
): Promise<Member> {
  let publicKey = partial.publicKey;
  let mintedSecret: string | null = null;
  if (!publicKey) {
    const kp = generateKeyPair();
    publicKey = kp.publicKey;
    mintedSecret = kp.secretKey;
  }
  const member: Member = {
    publicKey,
    displayName: partial.displayName,
    skills: partial.skills ?? [],
    availability: partial.availability ?? "",
    availabilityChips: partial.availabilityChips ?? [],
    seedBalance: partial.seedBalance ?? DEFAULT_SEED_BALANCE,
    vouchedBy: partial.vouchedBy ?? [],
    createdAt: partial.createdAt ?? Date.now(),
    nodeId: partial.nodeId ?? nodeId,
    locationZone: partial.locationZone ?? "",
  };
  // The key and the member row land together — a crash between the
  // two writes otherwise leaves either an orphan secret key or a
  // member who owns no key and can never sign anything. Dexie joins
  // this to a surrounding transaction when the caller already opened
  // one over these tables (e.g. redeemInvite's mint path). The key is
  // persisted through `persistSecretKey`, which WRAPS it when the
  // device has passphrase protection unlocked (Round-4 review) — a
  // freshly-minted identity must not land as plaintext on a protected
  // device.
  await db.transaction("rw", [db.secretKeys, db.members], async () => {
    if (mintedSecret !== null) {
      await persistSecretKey(member.publicKey, mintedSecret);
    }
    await db.members.put(member);
  });
  return member;
}

/**
 * DEV-MODE-ONLY entry point for the demo seed. The contract (operator
 * ruling R1): dev builds get a demo community so there's something to
 * interact with; real deployments start with an EMPTY node — identities
 * are minted by onboarding (Welcome's profile-setup step, InviteAccept,
 * or PairDevice), never by the seed.
 *
 * `isDev` defaults to Vite's build-time flag; tests inject the flag
 * explicitly to exercise both sides of the gate without stubbing the
 * build environment.
 */
export async function seedDemoCommunityIfDev(
  isDev: boolean = import.meta.env.DEV,
): Promise<Member | null> {
  if (!isDev) return null;
  return seedDemoCommunityIfEmpty();
}

/**
 * Seeds the database with a small demo community so the board isn't empty
 * on first launch in dev. Production never calls this — real deployments
 * start with an empty node and grow through onboarding + invites (see
 * `seedDemoCommunityIfDev` above for the gate). Safe to call multiple
 * times — it is a no-op once the current member is set.
 */
export async function seedDemoCommunityIfEmpty(): Promise<Member> {
  const nodeId = await ensureNodeId();
  const existingMemberKey = await getSetting(SETTING_KEYS.currentMember);
  if (existingMemberKey) {
    const existing = await db.members.get(existingMemberKey);
    if (existing) return existing;
  }

  const you = await createMember(
    {
      displayName: "You",
      skills: ["listening", "cooking"],
      availability: "Evenings and weekends",
      locationZone: "North neighborhood",
    },
    nodeId,
  );
  await setSetting(SETTING_KEYS.currentMember, you.publicKey);

  const demoMembers: Partial<Member>[] = [
    {
      displayName: "Rosa",
      skills: ["driving", "spanish tutoring"],
      availability: "Weekday afternoons",
      locationZone: "East neighborhood",
    },
    {
      displayName: "Marcus",
      skills: ["plumbing", "bike repair"],
      availability: "Evenings",
      locationZone: "South neighborhood",
    },
    {
      displayName: "Imani",
      skills: ["childcare", "grant writing"],
      availability: "Weekend mornings",
      locationZone: "North neighborhood",
    },
    {
      displayName: "Theo",
      skills: ["computer help", "listening"],
      availability: "Flexible",
      locationZone: "West neighborhood",
    },
  ];

  const createdMembers: Member[] = [];
  // Map member public key → secret key, so the seed posts below can
  // be signed with each poster's real key (matching what `createPost`
  // does in production).
  const memberSecrets = new Map<string, string>();
  for (const m of demoMembers) {
    const created = await createMember(
      { ...m, displayName: m.displayName as string },
      nodeId,
    );
    createdMembers.push(created);
    const row = await db.secretKeys.get(created.publicKey);
    if (row?.secretKey) memberSecrets.set(created.publicKey, row.secretKey);
  }

  // Seed REAL signed vouches so the demo starts with a believable web of
  // trust. Trust is computed from signed `db.vouches` records (+ redeemed
  // invites) — NOT the legacy `Member.vouchedBy` array — so writing that
  // array (as this used to) had no effect and the whole demo read as
  // "pending trust". These vouches are demo-local: they are NOT enqueued
  // to the outbox, so they never federate to real peers (same posture as
  // the seed posts above).
  //
  // "You" and the established members (Rosa, Imani, Theo) each get two
  // distinct vouches → trusted, so the founder isn't locked out of
  // vouching on a fresh node. Marcus is left a genuine newcomer with a
  // single vouch → pending, so the Vouch button is both visible (you're
  // trusted) AND usable: vouch for him and watch him tip over to trusted.
  const [rosa, marcus, imani, theo] = createdMembers;
  const secretByKey = new Map(memberSecrets);
  const youSecret = await db.secretKeys.get(you.publicKey);
  if (youSecret?.secretKey) secretByKey.set(you.publicKey, youSecret.secretKey);

  const vouches: SignedVouch[] = [];
  const vouchFor = (voucher: Member, vouchee: Member): void => {
    const secret = secretByKey.get(voucher.publicKey);
    if (!secret) return;
    vouches.push(
      createVouch({
        voucherKey: voucher.publicKey,
        voucherSecretKey: secret,
        voucheeKey: vouchee.publicKey,
        kind: "manual",
      }),
    );
  };

  // Established members: each vouched by the next two around the ring →
  // two distinct vouchers → trusted.
  const established = [you, rosa, imani, theo];
  established.forEach((member, i) => {
    vouchFor(established[(i + 1) % established.length], member);
    vouchFor(established[(i + 2) % established.length], member);
  });
  // The newcomer: a single vouch → still pending (one short of trusted).
  vouchFor(rosa, marcus);

  await db.vouches.bulkPut(vouches);

  const now = Date.now();
  const hourAgo = (h: number) => now - h * 60 * 60 * 1000;
  const seedDrafts = [
    {
      id: uuid(),
      type: "NEED" as const,
      category: "transport" as const,
      title: "Ride to medical appointment Thursday",
      description:
        "Downtown clinic, 2pm Thursday. I can help with gas money if needed.",
      estimatedHours: 2,
      urgency: "medium" as const,
      postedBy: createdMembers[0].publicKey,
      createdAt: hourAgo(3),
      expiresAt: null,
      locationZone: "East neighborhood",
      nodeId,
    },
    {
      id: uuid(),
      type: "OFFER" as const,
      category: "skilled_labor" as const,
      title: "Bike tune-ups this weekend",
      description:
        "I can tune up 3 bikes on Saturday. Bring your own parts if you need replacements.",
      estimatedHours: 1,
      urgency: "low" as const,
      postedBy: createdMembers[1].publicKey,
      createdAt: hourAgo(8),
      expiresAt: now + 7 * 24 * 60 * 60 * 1000,
      locationZone: "South neighborhood",
      nodeId,
    },
    {
      id: uuid(),
      type: "NEED" as const,
      category: "childcare" as const,
      title: "Childcare Friday night — union meeting",
      description:
        "Need someone to watch two kids (ages 5 and 8) from 6-9pm Friday while I'm at a steward training.",
      estimatedHours: 3,
      urgency: "high" as const,
      postedBy: createdMembers[3].publicKey,
      createdAt: hourAgo(1),
      expiresAt: null,
      locationZone: "West neighborhood",
      nodeId,
    },
    {
      id: uuid(),
      type: "OFFER" as const,
      category: "emotional_support" as const,
      title: "A listening ear this week",
      description:
        "Organizing is heavy right now. If you need to talk — to process, vent, or think out loud — I'm here.",
      estimatedHours: 1,
      urgency: "low" as const,
      postedBy: createdMembers[3].publicKey,
      createdAt: hourAgo(20),
      expiresAt: null,
      locationZone: "West neighborhood",
      nodeId,
    },
    {
      id: uuid(),
      type: "OFFER" as const,
      category: "food" as const,
      title: "Extra soup and bread this week",
      description:
        "Made a big pot of lentil soup. Have 4 servings to share plus fresh bread.",
      estimatedHours: 0.5,
      urgency: "medium" as const,
      postedBy: createdMembers[2].publicKey,
      createdAt: hourAgo(5),
      expiresAt: now + 2 * 24 * 60 * 60 * 1000,
      locationZone: "North neighborhood",
      nodeId,
    },
  ];
  const seedPosts: Post[] = seedDrafts.map((d) => {
    const secret = memberSecrets.get(d.postedBy);
    if (!secret) throw new Error(`seed: missing secret for ${d.postedBy}`);
    return signSeedPost(d, secret);
  });

  await db.posts.bulkPut(seedPosts);

  return you;
}

export async function listDemoMembers(): Promise<Member[]> {
  const all = await db.members.orderBy("createdAt").toArray();
  return all;
}
