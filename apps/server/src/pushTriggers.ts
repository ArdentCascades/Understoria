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
// The send triggers (docs/notifications.md) — the last leg between a
// member's opt-in and a real ping. Two of the three categories have a
// node-visible signal today and are wired here:
//
//  - awaiting_confirmation: event-driven, off the signed
//    awaiting-transition artifact the app already posts when an
//    exchange or task enters its confirmation window. The ping goes
//    to the ONE party whose word is missing — never the signer, who
//    just acted. Dedupe is the artifact's own first-writer-wins
//    insert: the route only notifies on a 201.
//
//  - shift_reminder: a sweep, because "before it begins" is a clock,
//    not an event. Every few minutes it scans shifts whose start
//    falls inside the reminder lead window and pings each signed-up
//    member once — a durable (kind, dedupe_key) ledger row makes
//    "once" survive restarts. Cancelled events and tombstoned
//    shifts/signups send nothing (the doc's "cancelled things cancel
//    their pings" — with a sweep, checking at send time IS the
//    cancellation).
//
//  - event_reminder (v2): the same clock, one level up — an event
//    the member RSVP'd "going" to starts soon. Rides the same sweep,
//    ledger and cancellation discipline; only a live "going" answer
//    pings ("maybe" chose ambivalence, and an RSVP flipped away
//    before the window simply never matches at send time).
//
//  - message_waiting (v2): event-driven off the relay's
//    onNewMessage hook, coalesced per recipient through the same
//    ledger — one ping per 4-hour quiet period, whatever any
//    sender does. See createMessageWaitingNotifier.
//
//  - test_ping (v2) is not a trigger at all: it is self-requested
//    through POST /push/test and delivered straight to the signing
//    member's own subscription row. Nothing here can emit one.
//
//  - guardian_request has NO node-visible signal yet: guardian
//    recovery runs device-to-device and through end-to-end messages
//    the node cannot (and must not) classify. The category exists
//    and gates; sends begin when a recovery-request record the node
//    can see is designed. Recorded in the doc's field notes.
//
// Payloads remain CATEGORY DATA ONLY: a category and a path. Titles,
// tiers and wording are applied on the member's device by the
// service worker; nothing here knows what any lock screen will show.
import type { Database as DatabaseType } from "better-sqlite3-multiple-ciphers";
import type {
  AwaitingTransition,
  EventRsvpState,
  EventShiftState,
  RelayedMessage,
  ShiftSignupState,
} from "@understoria/shared";
import type { PushSender } from "./push.js";

/** How far ahead of a start time the reminder fires — shifts and
 *  events share the clock. One hour: early enough to travel, late
 *  enough to matter — and comfortably inside the 4-hour delivery
 *  TTL, so a phone that comes online before the start still hears
 *  about it, and one that doesn't never gets a stale buzz after the
 *  fact. (A member-chosen lead is the designed follow-up — rung I —
 *  and will be a DEVICE preference, not a node column.) */
export const REMINDER_LEAD_MS = 60 * 60 * 1000;

/** Sweep cadence. Five minutes of jitter on a one-hour lead is
 *  invisible to a member and cheap for the node. */
export const REMINDER_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

/** Send-once rows older than this can never match a live window
 *  again (shifts don't time-travel); the sweep prunes them. */
const SENT_LEDGER_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Where the confirmation is waiting, as an app path. The artifact's
 * postId is either a board post id or the `project:<pid>/task:<tid>`
 * label (docs/auto-confirm-key.md §5).
 */
export function awaitingConfirmationPath(postId: string): string {
  const m = postId.match(/^project:([^/]+)\/task:(.+)$/);
  return m ? `/project/${m[1]}/task/${m[2]}` : `/post/${postId}`;
}

/**
 * The one member whose word is missing: the transition's OTHER
 * party. `signedBy` just marked the work done — pinging them would
 * be an engagement notification, exactly what the contract bans.
 */
export function awaitingConfirmationTarget(
  record: Pick<AwaitingTransition, "helperKey" | "helpedKey" | "signedBy">,
): string {
  return record.signedBy === record.helperKey
    ? record.helpedKey
    : record.helperKey;
}

/**
 * Fire the awaiting-your-confirmation ping for a NEWLY inserted
 * transition artifact. Best-effort and non-blocking by contract: a
 * push-service outage must never fail the federation write that
 * triggered it, so callers do not await this.
 */
export function notifyAwaitingConfirmation(
  sender: PushSender,
  record: Pick<
    AwaitingTransition,
    "postId" | "helperKey" | "helpedKey" | "signedBy"
  >,
  log: (msg: string) => void = () => {},
): void {
  void sender
    .sendToMember(awaitingConfirmationTarget(record), {
      category: "awaiting_confirmation",
      path: awaitingConfirmationPath(record.postId),
    })
    .catch(() => log("awaiting-confirmation push failed"));
}

/** The message_waiting quiet period (docs/notifications.md v2):
 *  one ping per recipient per this window, fired by the first
 *  message after the window lapses. THE CAP IS THE SAFETY
 *  MECHANISM — whatever a sender does, they cannot make a phone
 *  buzz more than once per period, which is what neuters the
 *  blocked-abuser doorbell; naming rules ride on top and never
 *  replace it. */
export const MESSAGE_QUIET_PERIOD_MS = 4 * 60 * 60 * 1000;

export interface MessageWaitingNotifierOptions {
  db: DatabaseType;
  sender: PushSender;
  quietPeriodMs?: number;
  now?: () => number;
  log?: (msg: string) => void;
}

/**
 * The message_waiting trigger — event-driven off the relay's
 * onNewMessage hook (201 inserts only), coalesced per RECIPIENT
 * through the same durable ledger the sweeps use. The claim is a
 * single atomic upsert: insert the (kind, recipient) row, or renew
 * it only when the last ping is older than the quiet period —
 * whoever wins the write sends, and every message inside a live
 * period changes nothing.
 *
 * The payload carries the triggering sender's PUBLIC KEY as
 * `detail.senderKey` — never a display name, never a body, never a
 * count. The recipient's device decides (or refuses) to resolve
 * the key against its own local name map; a blocked or
 * unconsented sender's key finds no entry there.
 *
 * Zero-device sends release the claim (like the sweeps' late
 * opt-in rule): a recipient who enables the category mid-period
 * still hears about the NEXT message, rather than inheriting a
 * spent period from before they opted in. The release matches on
 * the claim's own timestamp so it can never erase a newer claim.
 */
export function createMessageWaitingNotifier({
  db,
  sender,
  quietPeriodMs = MESSAGE_QUIET_PERIOD_MS,
  now = Date.now,
  log = () => {},
}: MessageWaitingNotifierOptions): (
  message: Pick<RelayedMessage, "senderKey" | "recipientKey">,
) => void {
  const claim = db.prepare(`
    INSERT INTO push_reminders_sent (kind, dedupe_key, sent_at)
    VALUES ('message_waiting', @recipient, @at)
    ON CONFLICT(kind, dedupe_key) DO UPDATE SET sent_at = @at
      WHERE push_reminders_sent.sent_at <= @lapsed
  `);
  const release = db.prepare(`
    DELETE FROM push_reminders_sent
    WHERE kind = 'message_waiting' AND dedupe_key = ? AND sent_at = ?
  `);

  return (message) => {
    void (async () => {
      const at = now();
      const claimed = claim.run({
        recipient: message.recipientKey,
        at,
        lapsed: at - quietPeriodMs,
      });
      if (claimed.changes === 0) return; // inside a live quiet period
      const devices = await sender.sendToMember(message.recipientKey, {
        category: "message_waiting",
        path: "/messages",
        detail: { senderKey: message.senderKey },
      });
      if (devices === 0) release.run(message.recipientKey, at);
    })().catch(() => log("message-waiting push failed"));
  };
}

export interface ReminderSweepOptions {
  db: DatabaseType;
  sender: PushSender;
  intervalMs?: number;
  leadMs?: number;
  now?: () => number;
  log?: (msg: string) => void;
}

export interface ReminderSweep {
  /** One pass — exported for tests and for the interval to drive.
   *  Returns how many member-reminders were sent this pass. */
  sweepOnce(): Promise<number>;
  stop(): void;
}

export function startReminderSweep({
  db,
  sender,
  intervalMs = REMINDER_SWEEP_INTERVAL_MS,
  leadMs = REMINDER_LEAD_MS,
  now = Date.now,
  log = () => {},
}: ReminderSweepOptions): ReminderSweep {
  const listShifts = db.prepare("SELECT payload FROM event_shifts");
  const eventCancelled = db.prepare(
    "SELECT 1 FROM event_cancellations WHERE event_id = ?",
  );
  const listSignups = db.prepare(
    "SELECT payload FROM shift_signups WHERE shift_id = ?",
  );
  // Events starting inside the window — `starts_at` is a real
  // column with an index, so the window IS the query.
  const listStartingEvents = db.prepare(
    "SELECT id FROM events WHERE starts_at > ? AND starts_at <= ?",
  );
  const listRsvps = db.prepare(
    "SELECT payload FROM event_rsvps WHERE event_id = ?",
  );
  // INSERT OR IGNORE is the atomic claim on "this reminder": whoever
  // inserts the row sends; a second pass (or a restart mid-pass)
  // changes nothing.
  const claimSend = db.prepare(
    "INSERT OR IGNORE INTO push_reminders_sent (kind, dedupe_key, sent_at) VALUES (?, ?, ?)",
  );
  const releaseClaim = db.prepare(
    "DELETE FROM push_reminders_sent WHERE kind = ? AND dedupe_key = ?",
  );
  const pruneLedger = db.prepare(
    "DELETE FROM push_reminders_sent WHERE sent_at < ?",
  );

  /** The shared send-once step: claim, send, release on zero
   *  devices so a member who flips the category on while the window
   *  is still open gets their reminder on a later pass. */
  async function remindOnce(
    kind: "shift_reminder" | "event_reminder",
    dedupeKey: string,
    memberKey: string,
    path: string,
    at: number,
  ): Promise<number> {
    const claimed = claimSend.run(kind, dedupeKey, at);
    if (claimed.changes === 0) return 0;
    try {
      const devices = await sender.sendToMember(memberKey, {
        category: kind,
        path,
      });
      if (devices > 0) return 1;
      releaseClaim.run(kind, dedupeKey);
      return 0;
    } catch {
      // The enum gate can't throw here (the category is ours);
      // transport failures are already logged-and-skipped inside
      // the sender. Keep the claim: a broken send this close to
      // the start is better silent than double.
      log(`${kind} push failed`);
      return 0;
    }
  }

  async function sweepOnce(): Promise<number> {
    const at = now();
    let sent = 0;
    // Shifts: community-scale table (a node hosts one community's
    // events); a full scan every few minutes is cheaper than being
    // clever.
    for (const row of listShifts.all() as { payload: string }[]) {
      let shift: EventShiftState;
      try {
        shift = JSON.parse(row.payload) as EventShiftState;
      } catch {
        continue;
      }
      if (shift.deletedAt !== null) continue;
      if (shift.startsAt <= at || shift.startsAt > at + leadMs) continue;
      if (eventCancelled.get(shift.eventId)) continue;
      for (const signupRow of listSignups.all(shift.id) as {
        payload: string;
      }[]) {
        let signup: ShiftSignupState;
        try {
          signup = JSON.parse(signupRow.payload) as ShiftSignupState;
        } catch {
          continue;
        }
        if (signup.deletedAt !== null) continue;
        sent += await remindOnce(
          "shift_reminder",
          `${shift.id}|${signup.memberKey}`,
          signup.memberKey,
          `/events/${shift.eventId}`,
          at,
        );
      }
    }
    // Events: same clock, one level up. Only a live "going" RSVP
    // pings; a flip to "maybe"/"not_going" before the window means
    // the row simply never matches at send time — with a sweep,
    // checking at send time IS the cancellation.
    for (const eventRow of listStartingEvents.all(at, at + leadMs) as {
      id: string;
    }[]) {
      if (eventCancelled.get(eventRow.id)) continue;
      for (const rsvpRow of listRsvps.all(eventRow.id) as {
        payload: string;
      }[]) {
        let rsvp: EventRsvpState;
        try {
          rsvp = JSON.parse(rsvpRow.payload) as EventRsvpState;
        } catch {
          continue;
        }
        if (rsvp.status !== "going") continue;
        sent += await remindOnce(
          "event_reminder",
          `${eventRow.id}|${rsvp.memberKey}`,
          rsvp.memberKey,
          `/events/${eventRow.id}`,
          at,
        );
      }
    }
    pruneLedger.run(at - SENT_LEDGER_RETENTION_MS);
    return sent;
  }

  const timer =
    intervalMs > 0
      ? setInterval(() => {
          void sweepOnce().catch(() => log("reminder sweep failed"));
        }, intervalMs)
      : null;
  timer?.unref?.();

  return {
    sweepOnce,
    stop() {
      if (timer) clearInterval(timer);
    },
  };
}
