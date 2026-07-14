/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, getSetting, SETTING_KEYS } from "./database";
import { seedDemoCommunityIfDev, seedDemoCommunityIfEmpty } from "./seed";
import { trustStatusWithInvites, vouchersFor } from "@/lib/vouch";
import { reachedMilestones } from "@/lib/milestones";
import { computeSolidarityStreak } from "@/lib/stats";

async function reset() {
  // Clear EVERY table (the standard suite idiom) — the seed now also
  // writes projects, tasks, events, and shifts, and a hand-picked
  // clear list silently leaks rows between tests as the seed grows.
  await Promise.all(db.tables.map((t) => t.clear()));
}

describe("seedDemoCommunityIfEmpty", () => {
  beforeEach(reset);

  it("seeds the founder and established members as trusted via real signed vouches", async () => {
    const you = await seedDemoCommunityIfEmpty();
    const members = await db.members.toArray();
    const vouches = await db.vouches.toArray();
    const ctx = { vouches, invites: [] };

    // Real signed vouch records exist — the old cross-vouch wrote only
    // the (unused) Member.vouchedBy array, leaving db.vouches empty and
    // every member "pending trust".
    expect(vouches.length).toBeGreaterThan(0);
    for (const v of vouches) expect(v.kind).toBe("manual");

    // The founder ("You") is trusted, so they aren't locked out of
    // vouching on a fresh node.
    expect(trustStatusWithInvites(you.publicKey, ctx)).toBe("trusted");

    const statuses = members.map((m) =>
      trustStatusWithInvites(m.publicKey, ctx),
    );
    // Most members are established; exactly one newcomer stays pending so
    // the Vouch button is visible (you're trusted) AND usable (there's
    // someone to vouch for).
    expect(statuses.filter((s) => s === "trusted").length).toBeGreaterThanOrEqual(4);
    expect(statuses.filter((s) => s === "pending_trust").length).toBe(1);
  });

  it("seeds a project the founder can actually claim tasks on", async () => {
    const you = await seedDemoCommunityIfEmpty();
    const projects = await db.projects.toArray();
    expect(projects.length).toBe(1);
    const [project] = projects;

    // Claimable BY the founder: someone else organizes it, and it's
    // active (planning/paused projects don't accept claims).
    expect(project.organizerKey).not.toBe(you.publicKey);
    expect(project.coOrganizerKeys).not.toContain(you.publicKey);
    expect(project.status).toBe("active");
    // Template id set + verbatim template titles, so the per-task tips
    // and the claim-moment "good first step" resolve.
    expect(project.templateId).toBe("community-fridge");

    const tasks = await db.projectTasks.toArray();
    const open = tasks.filter((t) => t.status === "open");
    expect(open.length).toBeGreaterThanOrEqual(4);
    // At least one hour-sized open task, so the board's "Fits in about
    // an hour" filter and the one-small-thing picker have a hit.
    expect(
      open.some((t) => t.estimatedHours > 0 && t.estimatedHours <= 1),
    ).toBe(true);
    // One task mid-carry by a demo member — alive, not staged — and
    // never by the founder (their In-my-care should start empty).
    const claimed = tasks.filter((t) => t.status === "claimed");
    expect(claimed.length).toBe(1);
    expect(claimed[0].assignedTo).not.toBe(you.publicKey);
    // Dependencies reference real in-project task ids.
    const ids = new Set(tasks.map((t) => t.id));
    for (const t of tasks) {
      for (const dep of t.dependencies) expect(ids.has(dep)).toBe(true);
    }
  });

  it("seeds an upcoming gathering with open shifts and no signups", async () => {
    const you = await seedDemoCommunityIfEmpty();
    const events = await db.events.toArray();
    expect(events.length).toBe(1);
    const [event] = events;
    expect(event.createdBy).not.toBe(you.publicKey);
    expect(event.startsAt).toBeGreaterThan(Date.now());
    // Demo-local, not federable — same convention as legacy posts.
    expect(event.signature).toBe("");

    const shifts = await db.eventShifts.toArray();
    expect(shifts.length).toBeGreaterThanOrEqual(2);
    for (const s of shifts) {
      expect(s.eventId).toBe(event.id);
      expect(s.endsAt).toBeGreaterThan(s.startsAt);
      expect(s.createdBy).toBe(event.createdBy);
    }
    // The founder signs up themself — the seed never volunteers them.
    expect(await db.shiftSignups.count()).toBe(0);
  });

  it("never repeats a (helper, helped) pair — the reciprocal-pattern safeguard must start at zero", async () => {
    // evaluateSafeguards flags reciprocal_pattern when a pair reaches
    // reciprocalPairThreshold (default 3, counted BOTH directions)
    // within 30 days. The seed used to repeat rosa↔you twice, putting
    // the demo user's first real exchange with Rosa one step from an
    // amber anti-gaming chip on a supposedly clean showcase.
    await seedDemoCommunityIfEmpty();
    const exchanges = await db.exchanges.toArray();
    const pairKeys = exchanges.map((x) =>
      [x.helperKey, x.helpedKey].sort().join("|"),
    );
    expect(new Set(pairKeys).size).toBe(pairKeys.length);
  });

  it("seeds no exchange inside the rolling 24-hour daily-helper window", async () => {
    // assertWithinDailyLimit scans the last 24 hours per helper
    // (default cap 3). Seeded history must not pre-consume anyone's
    // daily slots, or a first real exchange hits limits early.
    await seedDemoCommunityIfEmpty();
    const exchanges = await db.exchanges.toArray();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const x of exchanges) {
      expect(x.completedAt).toBeLessThan(cutoff);
    }
  });

  it("keeps an unbroken solidarity streak alongside the empty daily window", async () => {
    await seedDemoCommunityIfEmpty();
    const exchanges = await db.exchanges.toArray();
    // Seven distinct consecutive days ending yesterday — the demo
    // Dashboard must show a living streak, not "gathering".
    expect(computeSolidarityStreak(exchanges)).toBeGreaterThanOrEqual(7);
  });

  it("holds streak + daily-window even seeded just after midnight UTC", async () => {
    // A fixed "26 hours back" anchor lands TWO UTC days back when the
    // seed runs between 00:00 and 02:00 (26h from 01:00 is 23:00 two
    // days prior), booting the demo with a broken streak. The anchor
    // clamps to yesterday's UTC midnight in that window — still ≥24h
    // ago, so the daily-helper limit stays untouched too.
    vi.useFakeTimers({
      toFake: ["Date"],
      now: new Date(Date.UTC(2026, 6, 14, 0, 30)),
    });
    try {
      await seedDemoCommunityIfEmpty();
      const exchanges = await db.exchanges.toArray();
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;
      for (const x of exchanges) {
        expect(x.completedAt).toBeLessThan(cutoff);
      }
      expect(computeSolidarityStreak(exchanges, now)).toBeGreaterThanOrEqual(7);
    } finally {
      vi.useRealTimers();
    }
  });

  it("pre-marks every milestone the seeded history already crossed as celebrated", async () => {
    // The seeded hours cross the "10 hours of mutual aid" baseline;
    // without this the Dashboard pops its animated celebration for
    // fabricated history on every fresh demo/dev boot and after
    // every demo reset.
    await seedDemoCommunityIfEmpty();
    const raw = await getSetting(SETTING_KEYS.celebratedMilestones);
    expect(raw).toBeDefined();
    const celebrated = JSON.parse(raw!) as string[];

    const exchanges = await db.exchanges.toArray();
    const totalHours = exchanges.reduce((s, x) => s + x.hoursExchanged, 0);
    const memberCount = await db.members.count();
    const expected = [
      ...reachedMilestones("hours", totalHours),
      ...reachedMilestones("exchanges", exchanges.length),
      ...reachedMilestones("members", memberCount),
    ].map((m) => m.label);
    // Derived, not hardcoded: future seed growth that crosses new
    // thresholds must stay silent without this test changing.
    expect(expected.length).toBeGreaterThan(0);
    expect(celebrated).toEqual(expect.arrayContaining(expected));
  });

  it("leaves the newcomer one vouch short, so a single vouch tips them to trusted", async () => {
    await seedDemoCommunityIfEmpty();
    const members = await db.members.toArray();
    const vouches = await db.vouches.toArray();
    const ctx = { vouches, invites: [] };

    const newcomer = members.find(
      (m) => trustStatusWithInvites(m.publicKey, ctx) === "pending_trust",
    );
    expect(newcomer).toBeDefined();
    // Exactly one existing voucher → one more vouch reaches the trust
    // threshold of two.
    expect(vouchersFor(newcomer!.publicKey, ctx).size).toBe(1);
  });
});

// Operator ruling R1: the demo community is DEV-MODE ONLY. Production
// (isDev: false) must start with a genuinely empty node — no members,
// no posts, no vouches, no current-member setting — because the first
// identity is minted by onboarding, never by the seed.
describe("seedDemoCommunityIfDev", () => {
  beforeEach(reset);

  it("does NOT seed when isDev is false — production starts empty", async () => {
    const result = await seedDemoCommunityIfDev(false);
    expect(result).toBeNull();
    expect(await db.members.count()).toBe(0);
    expect(await db.posts.count()).toBe(0);
    expect(await db.vouches.count()).toBe(0);
    expect(await db.secretKeys.count()).toBe(0);
    expect(await db.projects.count()).toBe(0);
    expect(await db.projectTasks.count()).toBe(0);
    expect(await db.events.count()).toBe(0);
    expect(await db.eventShifts.count()).toBe(0);
    expect(await getSetting(SETTING_KEYS.currentMember)).toBeUndefined();
  });

  it("seeds the demo community when isDev is true", async () => {
    const result = await seedDemoCommunityIfDev(true);
    expect(result).not.toBeNull();
    // Founder + 4 fictional members.
    expect(await db.members.count()).toBe(5);
    expect(await getSetting(SETTING_KEYS.currentMember)).toBe(
      result!.publicKey,
    );
  });

  it("defaults the flag from import.meta.env.DEV (true under vitest)", async () => {
    // Vitest runs with DEV=true, so the zero-arg call — the exact shape
    // AppContext uses — must seed. If the default-param wiring ever
    // breaks, dev builds silently lose their demo community.
    const result = await seedDemoCommunityIfDev();
    expect(result).not.toBeNull();
    expect(await db.members.count()).toBe(5);
  });
});
