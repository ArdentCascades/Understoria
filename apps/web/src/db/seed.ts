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
import {
  canonicalPostPayload,
  canonicalExchangePayload,
} from "@understoria/shared/crypto";
import { createVouch } from "@/lib/vouch";
import { IS_DEMO } from "@/lib/demo";
import { reachedMilestones } from "@/lib/milestones";
import i18n from "@/i18n";
import type {
  Event,
  EventShiftRow,
  Exchange,
  Member,
  Post,
  Project,
  ProjectCategory,
  ProjectTask,
  SignedVouch,
} from "@/types";

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
 * Entry point for the demo seed, gated to the two builds that WANT a
 * ready-made community: dev builds (something to poke at while working)
 * and demo/"tour" builds (`VITE_DEMO=1`, the public showcase demo that
 * should load straight onto a populated board). The contract (operator
 * ruling R1) is unchanged for everyone else: a REAL deployment starts
 * with an EMPTY node — identities are minted by onboarding (Welcome's
 * profile-setup step, InviteAccept, or PairDevice), never by the seed.
 *
 * `shouldSeed` defaults to Vite's build-time flags (`DEV` or the demo
 * flag); tests inject it explicitly to exercise both sides of the gate
 * without stubbing the build environment.
 */
export async function seedDemoCommunityIfDev(
  shouldSeed: boolean = import.meta.env.DEV || IS_DEMO,
): Promise<Member | null> {
  if (!shouldSeed) return null;
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
      // The demo founder's name in the member's own language — i18n is
      // initialized (main.tsx imports it) long before this dev/demo
      // seed runs, so a Spanish session seeds "Tú" instead of a
      // stray English "You". Demo data only; onboarding renames it.
      displayName: i18n.isInitialized ? i18n.t("common.you") : "You",
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

  // A handful of COMPLETED, mutually-signed exchanges so the demo
  // Dashboard reads as a living community — real hours exchanged, active
  // members, a solidarity streak, and a category spread — instead of an
  // untouched first-run node showing 0h across 0 exchanges. Each row is
  // signed by BOTH parties over the canonical exchange payload (exactly
  // as production confirmation does), so they pass `verifyExchange` and
  // render everywhere real exchanges do, including the Calendar's
  // exchange-density heat. Like the posts and vouches above, these are
  // demo-local: never enqueued to the outbox, so they never federate.
  const dayMs = 24 * 60 * 60 * 1000;
  // Anchor each on a distinct UTC day ending YESTERDAY, so the
  // solidarity streak counts an unbroken run (a quiet "today" doesn't
  // break it — see computeSolidarityStreak, which buckets by UTC day)
  // while NO seeded exchange sits inside the rolling 24-hour window
  // that assertWithinDailyLimit scans: the seed must never pre-consume
  // a member's daily helper slots or the demo's first real exchange
  // hits limits early. A fixed "26 hours back" satisfies both ONLY
  // after 02:00 — seeded between midnight and 02:00 it lands two days
  // back and the demo boots with a broken streak — so the anchor
  // clamps to yesterday's UTC midnight (still ≥24h ago at any clock
  // time) whenever 26h-back would overshoot yesterday.
  const startOfTodayUtc = Math.floor(now / dayMs) * dayMs;
  const anchor = Math.max(startOfTodayUtc - dayMs, now - 26 * 60 * 60 * 1000);
  const daysAgoAt = (d: number) => anchor - d * dayMs;
  const signSeedExchange = (
    helper: Member,
    helped: Member,
    hours: number,
    category: ProjectCategory,
    completedAt: number,
    postId: string,
  ): Exchange => {
    const helperSecret = secretByKey.get(helper.publicKey);
    const helpedSecret = secretByKey.get(helped.publicKey);
    if (!helperSecret || !helpedSecret) {
      throw new Error("seed: missing secret for exchange party");
    }
    const payload = canonicalExchangePayload({
      postId,
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hours,
      category,
      completedAt,
    });
    return {
      id: uuid(),
      postId,
      helperKey: helper.publicKey,
      helpedKey: helped.publicKey,
      hoursExchanged: hours,
      helperSignature: sign(payload, helperSecret),
      helpedSignature: sign(payload, helpedSecret),
      completedAt,
      category,
      nodeId,
    };
  };

  // One past need that was met, so the Dashboard's "Needs completed this week"
  // isn't a lonely zero. Completed posts drop off the open board tabs, so
  // this reads as history (a fulfilled ask) without cluttering the board.
  const metNeedId = uuid();
  const imaniSecret = memberSecrets.get(imani.publicKey);
  if (!imaniSecret) throw new Error("seed: missing secret for met-need poster");
  const metNeed: Post = {
    ...signSeedPost(
      {
        id: metNeedId,
        type: "NEED",
        category: "food",
        title: "Groceries picked up during a rough week",
        description:
          "I was down with the flu and couldn't get out. Someone grabbed a few essentials and left them at my door — back on my feet now. Thank you.",
        estimatedHours: 1,
        urgency: "medium",
        postedBy: imani.publicKey,
        createdAt: daysAgoAt(2) - 60 * 60 * 1000,
        expiresAt: null,
        locationZone: "North neighborhood",
        nodeId,
      },
      imaniSecret,
    ),
    status: "completed",
    claimedBy: rosa.publicKey,
    confirmedBy: [imani.publicKey],
  };
  await db.posts.put(metNeed);

  // Exchanges chosen to match each member's skills (Rosa drives and
  // tutors, Marcus fixes bikes, Imani does childcare and grant writing,
  // Theo helps with computers and listens), spread one per day across
  // the past week so every member is "active this week" and the streak
  // is unbroken. Every DIRECTED (helper → helped) pair appears at most
  // once, and exactly one undirected pair flows both ways (Rosa ↔
  // Marcus below): evaluateSafeguards flags a reciprocal_pattern when a
  // pair reaches reciprocalPairThreshold (default 3, counted both
  // directions) inside 30 days, so no seeded pair may reach 2 exchanges
  // with the demo user — their FIRST real exchange with that member
  // would sit one step from an anti-gaming flag, an amber moderation
  // chip on a supposedly clean showcase. A both-ways pair between two
  // fictional members is safe (the demo user can never be a party to a
  // Rosa ↔ Marcus exchange) and keeps the Dashboard's Reciprocity
  // pulse showing a real two-way connection instead of a lonely
  // one-way-so-far state.
  const seedExchanges: Exchange[] = [
    signSeedExchange(rosa, you, 2, "transport", daysAgoAt(0), uuid()),
    signSeedExchange(you, marcus, 1, "food", daysAgoAt(0), uuid()),
    signSeedExchange(marcus, imani, 1.5, "skilled_labor", daysAgoAt(1), uuid()),
    // Marcus returns Rosa's tutoring (day 4 below) with a bike fix —
    // the demo's one reciprocal pair.
    signSeedExchange(marcus, rosa, 1, "skilled_labor", daysAgoAt(1), uuid()),
    signSeedExchange(imani, theo, 3, "childcare", daysAgoAt(2), uuid()),
    // The fulfilled need above — helper Rosa, helped Imani (the poster).
    signSeedExchange(rosa, imani, 1, "food", daysAgoAt(2), metNeedId),
    signSeedExchange(theo, rosa, 1, "skilled_labor", daysAgoAt(3), uuid()),
    signSeedExchange(rosa, marcus, 1.5, "education", daysAgoAt(4), uuid()),
    signSeedExchange(imani, you, 2, "education", daysAgoAt(5), uuid()),
    signSeedExchange(theo, you, 1, "emotional_support", daysAgoAt(6), uuid()),
  ];
  await db.exchanges.bulkPut(seedExchanges);

  // The 15 seeded hours already cross the baseline "10 hours of mutual
  // aid" milestone. Mark everything the SEED reached as celebrated, or
  // the Dashboard pops its animated milestone celebration for
  // fabricated history on every fresh dev database, every first-time
  // demo visitor, and after every demo reset. Derived (not hardcoded)
  // so future seed edits that cross new thresholds stay silent too.
  const totalSeedHours = seedExchanges.reduce(
    (sum, x) => sum + x.hoursExchanged,
    0,
  );
  const seedReachedLabels = [
    ...reachedMilestones("hours", totalSeedHours),
    ...reachedMilestones("exchanges", seedExchanges.length),
    ...reachedMilestones("members", 1 + demoMembers.length),
  ].map((m) => m.label);
  await setSetting(
    SETTING_KEYS.celebratedMilestones,
    JSON.stringify(seedReachedLabels),
  );

  // A JOINABLE project, so first-run exploration can walk the whole
  // claimer arc — claim → "a good first step" → private plan → In my
  // care → the resume card — without first authoring a project. Rosa
  // organizes it (never "You": organizers can't claim their own
  // tasks, and the point is that YOU can claim these). The task
  // titles/descriptions/hours are the community-fridge template's
  // VERBATIM, so the per-task tips and the claim-moment first step
  // resolve; the 1.5h and 0.5h tasks light up the board's "Fits in
  // about an hour" filter and the one-small-thing picker. One task is
  // already claimed by Marcus so the project reads as alive, not
  // staged. Direct table writes (not createProject/addProjectTask) so
  // nothing lands in the outbox — the same demo-local, never-federate
  // posture as the seed posts and vouches above.
  const fridgeProjectId = uuid();
  const taskIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];
  const fridgeProject: Project = {
    id: fridgeProjectId,
    title: "Fridge outside the corner store",
    description:
      "A community fridge under the awning at Han's corner store — free food, day and night, no questions asked. The fridge itself is promised; now we make it real.",
    category: "food",
    organizerKey: rosa.publicKey,
    coOrganizerKeys: [],
    status: "active",
    targetHours: 18,
    contributedHours: 0,
    deadline: null,
    createdAt: hourAgo(72),
    completedAt: null,
    pauseNote: null,
    locationZone: "East neighborhood",
    tags: [],
    nodeId,
    templateId: "community-fridge",
  };
  const openTask = (
    i: number,
    fields: Pick<
      ProjectTask,
      "title" | "description" | "estimatedHours" | "requiredSkills"
    > &
      Partial<ProjectTask>,
  ): ProjectTask => ({
    id: taskIds[i],
    projectId: fridgeProjectId,
    category: "food",
    urgency: "low",
    assignedTo: null,
    status: "open",
    dependencies: [],
    orderIndex: (i + 1) * 1000,
    createdAt: hourAgo(72),
    completedAt: null,
    completedBy: null,
    exchangeId: null,
    claimedAt: null,
    actualHours: null,
    checkInAcknowledgedAt: null,
    recurringCadence: null,
    ...fields,
  });
  const fridgeTasks: ProjectTask[] = [
    openTask(0, {
      title: "Find a host site with power and foot traffic",
      description:
        "Approach small businesses, churches, clinics, or community centers. Ask if they'll let you place a fridge under their awning and plug it in (electricity cost is usually a few dollars a month — offer to cover it). Get a simple written okay.",
      estimatedHours: 3,
      requiredSkills: ["outreach"],
      urgency: "medium",
    }),
    openTask(1, {
      title: "Source a fridge and a weatherproof shelter",
      description:
        "Put out a call for a working fridge on local groups. Build or buy a simple wooden cabinet/lean-to around it to protect it from rain and sun. Anchor it so it can't tip. Includes locating, transporting, and building.",
      estimatedHours: 8,
      requiredSkills: ["carpentry", "driving"],
      dependencies: [taskIds[0]],
      // Marcus is mid-carry so the project reads as alive.
      status: "claimed",
      assignedTo: marcus.publicKey,
      claimedAt: hourAgo(24),
    }),
    openTask(2, {
      title: "Set the ground rules and label everything",
      description:
        "Post a clear, multilingual sign: take what you need, leave what you can, no expired/home-canned/raw meat. Add labels and a marker so people can date items.",
      estimatedHours: 1.5,
      requiredSkills: ["writing", "translation"],
      dependencies: [taskIds[1]],
    }),
    openTask(3, {
      title: "Recruit a cleaning and restocking rota",
      description:
        "Make a shared weekly schedule. Each shift is ~15 minutes: wipe surfaces, toss anything spoiled or past-date, and note what's running low. Keep cleaning supplies on site.",
      estimatedHours: 2,
      requiredSkills: ["organizing"],
      dependencies: [taskIds[1]],
      recurringCadence: "month",
    }),
    openTask(4, {
      title: "Build supply relationships",
      description:
        "Ask bakeries, grocers, restaurants, and farmers' markets for regular end-of-day donations. Coordinate a pickup volunteer. Track which sources are reliable.",
      estimatedHours: 3,
      requiredSkills: ["outreach"],
    }),
    openTask(5, {
      title: "Set up a problem contact",
      description:
        'Put one phone number or email on the fridge for "fridge is broken / power is out / question." Decide who answers it and how fast.',
      estimatedHours: 0.5,
      requiredSkills: [],
    }),
  ];
  await db.projects.put(fridgeProject);
  await db.projectTasks.bulkPut(fridgeTasks);

  // An upcoming gathering with open shifts, tied to the same effort:
  // gives the Calendar and the Dashboard's "Coming up" something to
  // show, and lets a first-run member walk the shift arc — sign up →
  // "Add this shift to my calendar". Empty `signature` marks the row
  // demo-local/not-federable, the same convention as pre-federation
  // legacy posts.
  const buildDayId = uuid();
  const dayFromNow = (d: number) => now + d * 24 * 60 * 60 * 1000;
  const buildDayStart = dayFromNow(5);
  const buildDay: Event = {
    id: buildDayId,
    kind: "event",
    title: "Fridge build day",
    description:
      "We're building the shelter and setting up the fridge together. Come for an hour or the whole morning — tools and snacks provided.",
    category: "food",
    startsAt: buildDayStart,
    endsAt: buildDayStart + 4 * 60 * 60 * 1000,
    location: "Behind Han's corner store, East neighborhood",
    capacity: null,
    templateId: null,
    createdAt: hourAgo(48),
    createdBy: rosa.publicKey,
    nodeId,
    signature: "",
  };
  const buildDayShifts: EventShiftRow[] = [
    {
      id: uuid(),
      eventId: buildDayId,
      label: "Morning build crew",
      startsAt: buildDayStart,
      endsAt: buildDayStart + 2 * 60 * 60 * 1000,
      capacity: 4,
      createdBy: rosa.publicKey,
      createdAt: hourAgo(48),
    },
    {
      id: uuid(),
      eventId: buildDayId,
      label: "Finishing and first stock",
      startsAt: buildDayStart + 2 * 60 * 60 * 1000,
      endsAt: buildDayStart + 4 * 60 * 60 * 1000,
      capacity: 3,
      createdBy: rosa.publicKey,
      createdAt: hourAgo(48),
    },
  ];
  await db.events.put(buildDay);
  await db.eventShifts.bulkPut(buildDayShifts);

  return you;
}

