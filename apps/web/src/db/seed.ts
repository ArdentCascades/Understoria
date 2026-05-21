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
import { uuid } from "@/lib/id";
import { generateKeyPair } from "@/lib/crypto";
import type { Member, Post } from "@/types";

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
  if (!publicKey) {
    const kp = generateKeyPair();
    publicKey = kp.publicKey;
    await db.secretKeys.put({ publicKey, secretKey: kp.secretKey });
  }
  const member: Member = {
    publicKey,
    displayName: partial.displayName,
    skills: partial.skills ?? [],
    availability: partial.availability ?? "",
    seedBalance: partial.seedBalance ?? DEFAULT_SEED_BALANCE,
    vouchedBy: partial.vouchedBy ?? [],
    createdAt: partial.createdAt ?? Date.now(),
    nodeId: partial.nodeId ?? nodeId,
    locationZone: partial.locationZone ?? "",
  };
  await db.members.put(member);
  return member;
}

/**
 * Seeds the database with a small demo community so the board isn't empty
 * on first launch. Real pilots will start with an empty node and grow through
 * invites (see Agent 2). Safe to call multiple times — it is a no-op once
 * the current member is set.
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
  for (const m of demoMembers) {
    const created = await createMember(
      { ...m, displayName: m.displayName as string },
      nodeId,
    );
    createdMembers.push(created);
  }

  // Cross-vouch so everyone starts "trusted" in the demo.
  for (const m of createdMembers) {
    m.vouchedBy = createdMembers
      .filter((other) => other.publicKey !== m.publicKey)
      .slice(0, 2)
      .map((other) => other.publicKey);
    await db.members.put(m);
  }

  const now = Date.now();
  const hourAgo = (h: number) => now - h * 60 * 60 * 1000;
  const seedPosts: Post[] = [
    {
      id: uuid(),
      type: "NEED",
      category: "transport",
      title: "Ride to medical appointment Thursday",
      description:
        "Downtown clinic, 2pm Thursday. I can help with gas money if needed.",
      estimatedHours: 2,
      urgency: "medium",
      postedBy: createdMembers[0].publicKey,
      claimedBy: null,
      status: "open",
      createdAt: hourAgo(3),
      expiresAt: null,
      locationZone: "East neighborhood",
      confirmedBy: [],
    },
    {
      id: uuid(),
      type: "OFFER",
      category: "skilled_labor",
      title: "Bike tune-ups this weekend",
      description:
        "I can tune up 3 bikes on Saturday. Bring your own parts if you need replacements.",
      estimatedHours: 1,
      urgency: "low",
      postedBy: createdMembers[1].publicKey,
      claimedBy: null,
      status: "open",
      createdAt: hourAgo(8),
      expiresAt: now + 7 * 24 * 60 * 60 * 1000,
      locationZone: "South neighborhood",
      confirmedBy: [],
    },
    {
      id: uuid(),
      type: "NEED",
      category: "childcare",
      title: "Childcare Friday night — union meeting",
      description:
        "Need someone to watch two kids (ages 5 and 8) from 6-9pm Friday while I'm at a steward training.",
      estimatedHours: 3,
      urgency: "high",
      postedBy: createdMembers[3].publicKey,
      claimedBy: null,
      status: "open",
      createdAt: hourAgo(1),
      expiresAt: null,
      locationZone: "West neighborhood",
      confirmedBy: [],
    },
    {
      id: uuid(),
      type: "OFFER",
      category: "emotional_support",
      title: "A listening ear this week",
      description:
        "Organizing is heavy right now. If you need to talk — to process, vent, or think out loud — I'm here.",
      estimatedHours: 1,
      urgency: "low",
      postedBy: createdMembers[3].publicKey,
      claimedBy: null,
      status: "open",
      createdAt: hourAgo(20),
      expiresAt: null,
      locationZone: "West neighborhood",
      confirmedBy: [],
    },
    {
      id: uuid(),
      type: "OFFER",
      category: "food",
      title: "Extra soup and bread this week",
      description:
        "Made a big pot of lentil soup. Have 4 servings to share plus fresh bread.",
      estimatedHours: 0.5,
      urgency: "medium",
      postedBy: createdMembers[2].publicKey,
      claimedBy: null,
      status: "open",
      createdAt: hourAgo(5),
      expiresAt: now + 2 * 24 * 60 * 60 * 1000,
      locationZone: "North neighborhood",
      confirmedBy: [],
    },
  ];

  await db.posts.bulkPut(seedPosts);

  return you;
}

export async function listDemoMembers(): Promise<Member[]> {
  const all = await db.members.orderBy("createdAt").toArray();
  return all;
}
