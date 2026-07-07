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
import type {
  AwaitingTransition,
  Exchange,
  Post,
  SignedVouch,
  TaskComment,
} from "@/types";
import type {
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
  EventRsvpState,
  EventShiftState,
  InviteRevocation,
  ProjectState,
  RedemptionReceipt,
  MemberRemoval,
  MemberReinstatement,
  SeedVaultPledge,
  ShiftSignupState,
  TaskState,
} from "@understoria/shared/types";
import { db, SETTING_KEYS, getSetting, setSetting } from "@/db/database";
import {
  normalizeNodeUrl,
  readAcceptedMirrors,
  recordNodeSuccess,
} from "@/lib/nodeEndpoints";

/**
 * Best-effort mirroring of a finalized exchange to the community node.
 *
 * Why best-effort: a community node down for 30s when a member confirms
 * an exchange should not block the exchange itself or surface as an
 * error in the user's flow. The exchange already lives on the local
 * device, signed by both parties; the node copy is for community-wide
 * visibility and federation.
 *
 * Robust delivery (an outbox table + retry worker) is tracked work
 * for a follow-up slice. For v1 we just fire the POST and record the
 * outcome in settings so the Profile page can show "last success" and
 * "last error" chips.
 *
 * The helper never throws — every failure path resolves with the
 * `error` field set. Callers should `await` only if they want to
 * display the immediate result; the production call site fires it
 * unawaited.
 */

export interface SubmitConfig {
  url: string;
  enabled: boolean;
  /**
   * Accepted mirror URLs to try when the primary is unreachable
   * (docs/community-resilience.md §B.2). Populated by
   * `readSubmitConfig` from the member's consented mirror list; the
   * outbox stays single-delivery per record — whichever node accepts
   * it fans it out server-side via mirror replication. Optional so
   * existing call sites and tests that build a bare `{url, enabled}`
   * keep working unchanged.
   */
  fallbackUrls?: readonly string[];
}

export interface SubmitResult {
  /** True iff the node returned a 2xx status. */
  ok: boolean;
  /** Set when ok is false. Suitable for surfacing in the UI. */
  error?: string;
  /** HTTP status returned by the node, if we got that far. */
  status?: number;
}

export async function readSubmitConfig(): Promise<SubmitConfig> {
  const [url, enabledRaw, mirrors] = await Promise.all([
    getSetting(SETTING_KEYS.communityNodeUrl),
    getSetting(SETTING_KEYS.communityNodeEnabled),
    readAcceptedMirrors(),
  ]);
  return {
    url: url ?? "",
    enabled: enabledRaw === "1",
    fallbackUrls: mirrors,
  };
}

export async function writeSubmitConfig(cfg: SubmitConfig): Promise<void> {
  // Atomic so a partial failure never leaves URL set with a stale enabled
  // flag (or vice versa). Either both fields land or neither does.
  await db.transaction("rw", db.settings, async () => {
    await setSetting(SETTING_KEYS.communityNodeUrl, cfg.url);
    await setSetting(
      SETTING_KEYS.communityNodeEnabled,
      cfg.enabled ? "1" : "0",
    );
  });
}

export interface SubmitDeps {
  fetchImpl?: typeof fetch;
}

export async function submitExchangeToNode(
  exchange: Exchange,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/exchanges", exchange, config, deps);
}

/**
 * Mirror a signed vouch to the configured community node. Same
 * best-effort semantics as `submitExchangeToNode` — failures resolve
 * with `error` set, never thrown. Vouches federate via the same
 * outbox pattern as exchanges (Agent 3 task 2 continued).
 */
export async function submitVouchToNode(
  vouch: SignedVouch,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/vouches", vouch, config, deps);
}

/**
 * Mirror a signed post to the configured community node. Same
 * best-effort semantics as `submitExchangeToNode`. The caller passes
 * the immutable wire shape (lifecycle fields stripped) — see
 * `enqueuePostOutbox` in `lib/outbox.ts`.
 */
export async function submitPostToNode(
  post: Post,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/posts", post, config, deps);
}

export async function submitClaimToNode(
  claim: { postId: string; claimerKey: string; claimedAt: number; nodeId: string },
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/claims", claim, config, deps);
}

/**
 * Mirror a signed task comment to the configured community node.
 * Same best-effort semantics as `submitPostToNode`. The caller passes
 * the full TaskComment shape, including `deletedAt` — soft deletes
 * federate by re-pushing the same row with `deletedAt` populated.
 */
export async function submitTaskCommentToNode(
  comment: TaskComment,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/task-comments", comment, config, deps);
}

/**
 * Mirror a signed co-organizer invitation / response / revocation to
 * the configured community node. Same best-effort semantics as the
 * other submitters. See `docs/co-organizer-invitations.md` §8.
 */
export async function submitCoOrganizerInvitationToNode(
  record: CoOrganizerInvitation,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/coorg-invitations", record, config, deps);
}

export async function submitCoOrganizerInvitationResponseToNode(
  record: CoOrganizerInvitationResponse,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/coorg-invitation-responses", record, config, deps);
}

export async function submitCoOrganizerInvitationRevocationToNode(
  record: CoOrganizerInvitationRevocation,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord(
    "/coorg-invitation-revocations",
    record,
    config,
    deps,
  );
}

/**
 * Mirror a signed community event to the configured community node.
 * Same best-effort semantics as the other submitters. See
 * `docs/community-events.md` §7. The server-side route lands in PR D;
 * until then, this POST will 404 cleanly and the outbox worker will
 * retry on the standard backoff schedule.
 */
export async function submitEventToNode(
  record: Event,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/events", record, config, deps);
}

/**
 * Mirror a signed event cancellation. Same semantics as
 * `submitEventToNode`. The server enforces (in PR D) that the
 * cancellation's `createdBy` equals the referenced event's
 * `createdBy`; this client signs the record correctly and lets the
 * route validate.
 */
export async function submitEventCancellationToNode(
  record: EventCancellation,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/event-cancellations", record, config, deps);
}

/**
 * Push a signed redemption receipt to the configured community node
 * (`POST /redemptions`, `docs/invite-redemption.md` §7). Same
 * best-effort semantics as the other submitters. A 409 means the
 * token was already redeemed by a DIFFERENT key — first-writer-wins
 * on the server; the outbox treats it as poison (retrying a lost
 * race never succeeds) and the poisoned row surfacing in the UI is
 * how the losing member learns her link was redeemed twice.
 */
export async function submitRedemptionReceiptToNode(
  receipt: RedemptionReceipt,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/redemptions", receipt, config, deps);
}

/**
 * Push a signed invite revocation. Mirrors the redemption-receipt
 * submit; a 409 (token already revoked by a different inviter) is a
 * poison status, same as the receipt route. See
 * `docs/invite-revocation.md` §4.
 */
/**
 * Push a signed awaiting-transition artifact to the community node —
 * docs/auto-confirm-key.md §5. The node stamps its own clock at
 * ingestion; that stamp is the age anchor the /auto-confirm window is
 * enforced from, so delivering this promptly is what starts the
 * clock. Same best-effort semantics as every other submitter.
 */
export async function submitAwaitingTransitionToNode(
  record: AwaitingTransition,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/awaiting-transitions", record, config, deps);
}

export async function submitInviteRevocationToNode(
  revocation: InviteRevocation,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/invite-revocations", revocation, config, deps);
}

/**
 * Push a signed project / task state record (docs/project-federation.md
 * §5). Same best-effort semantics as every other submitter. The server
 * answers 200 `{stored:false}` for a stale version (fine — some device
 * published a newer one) and 403 for an unauthorized signer; both are
 * terminal for that outbox row. A task's 409 `unknown_project` is the
 * one RETRYABLE 4xx: the project record is still in flight, and the
 * outbox flush special-cases it (see `flushOutboxOnce`).
 */
export async function submitProjectStateToNode(
  record: ProjectState,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/project-states", record, config, deps);
}

export async function submitTaskStateToNode(
  record: TaskState,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/task-states", record, config, deps);
}

/**
 * Push the Phase 2 participation state records
 * (docs/project-federation.md §6). Same best-effort semantics as the
 * project/task submitters; a 409 (event / shift not on the node yet)
 * is the retryable-4xx case the outbox flush special-cases. The
 * former note here — "there is intentionally no submitEventRsvpToNode;
 * RSVPs are local-only by design" — was retired by Phase 2's
 * deliberate stance reversal (threat-model §7).
 */
export async function submitEventRsvpToNode(
  record: EventRsvpState,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/event-rsvps", record, config, deps);
}

/** Seed-vault pledge (docs/storage-budget.md Phase 2) — no referent,
 *  so there is no retryable-409 case: the node stores or LWW-noops. */
export async function submitSeedVaultPledgeToNode(
  record: SeedVaultPledge,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/seed-vault-pledges", record, config, deps);
}

/** Member removal / reinstatement (docs/member-removal.md M2): the
 *  assembled quorum record. 409 quorum_not_met is the retryable
 *  case the outbox flush special-cases. */
export async function submitMemberRemovalToNode(
  record: MemberRemoval,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/member-removals", record, config, deps);
}

export async function submitMemberReinstatementToNode(
  record: MemberReinstatement,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/member-reinstatements", record, config, deps);
}

export async function submitEventShiftToNode(
  record: EventShiftState,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/event-shifts", record, config, deps);
}

export async function submitShiftSignupToNode(
  record: ShiftSignupState,
  config: SubmitConfig,
  deps: SubmitDeps = {},
): Promise<SubmitResult> {
  return postSignedRecord("/shift-signups", record, config, deps);
}

async function postSignedRecord(
  path: string,
  record: unknown,
  config: SubmitConfig,
  deps: SubmitDeps,
): Promise<SubmitResult> {
  if (!config.enabled || !config.url.trim()) {
    return { ok: false, error: "disabled" };
  }

  const fetchImpl = deps.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    return { ok: false, error: "fetch_not_available" };
  }

  // Failover walk (docs/community-resilience.md §B.2): the member's
  // primary first, then each accepted mirror. Only a NETWORK failure
  // or a 5xx moves to the next node — a 4xx is the record being
  // refused, and every mirror runs the identical validation, so a
  // second opinion can't change the verdict (and the outbox's
  // poison/retry semantics key off that first honest status). The
  // record is delivered to at most ONE node; mirror replication fans
  // it out server-side.
  const bases: string[] = [];
  for (const raw of [config.url, ...(config.fallbackUrls ?? [])]) {
    const normalized = normalizeNodeUrl(raw);
    if (normalized && !bases.includes(normalized)) bases.push(normalized);
  }

  let last: SubmitResult = { ok: false, error: "disabled" };
  for (const base of bases) {
    const endpoint = joinUrl(base, path);
    let res: Response;
    try {
      res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        // Browsers default credentials to "same-origin" — we want explicit
        // omit since the node is cross-origin and signatures are the
        // authentication.
        credentials: "omit",
        mode: "cors",
      });
    } catch (err) {
      last = { ok: false, error: (err as Error).message ?? "network_error" };
      continue; // unreachable — try the next node
    }

    if (res.ok) {
      await recordOutcome({ ok: true, status: res.status });
      void recordNodeSuccess(base);
      return { ok: true, status: res.status };
    }
    // 4xx/5xx — try to read the error body for diagnostics, fall back to status.
    let body = "";
    try {
      body = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
    const error = body || `http_${res.status}`;
    const result: SubmitResult = { ok: false, status: res.status, error };
    if (res.status < 500) {
      await recordOutcome(result);
      return result;
    }
    last = result; // server-side failure — try the next node
  }

  await recordOutcome(last);
  return last;
}

/**
 * Compose a target URL by appending `path` to `base`. The base is
 * expected to be a clean federation root (protocol + host + optional
 * pathname). Any query string or fragment on the base is dropped —
 * those don't make sense for a federation root, and the prior naive
 * string-concat produced invalid URLs in their presence
 * (e.g. `…/api?foo=1/exchanges`).
 *
 * Falls back to the string-concat behavior if the base doesn't parse
 * as an absolute URL, so a misconfigured base still produces a
 * predictable string for the fetch call to fail on cleanly.
 */
function joinUrl(base: string, path: string): string {
  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
    return `${trimmed}${path.startsWith("/") ? path : `/${path}`}`;
  }
  parsed.search = "";
  parsed.hash = "";
  const basePath = parsed.pathname.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  parsed.pathname = `${basePath}${suffix}`;
  return parsed.toString();
}

async function recordOutcome(result: SubmitResult): Promise<void> {
  try {
    if (result.ok) {
      await setSetting(
        SETTING_KEYS.communityNodeLastSuccess,
        new Date().toISOString(),
      );
      await setSetting(SETTING_KEYS.communityNodeLastError, "");
    } else if (result.error) {
      await setSetting(SETTING_KEYS.communityNodeLastError, result.error);
    }
  } catch {
    // Settings table writes can fail mid-purge; recording telemetry is
    // best-effort too.
  }
}

/**
 * Convenience: read the last-known status pair without forcing a
 * re-render path. Used by the Profile NodeSection to show "last
 * success" and "last error" chips.
 */
export async function readSubmitStatus(): Promise<{
  lastSuccess?: string;
  lastError?: string;
}> {
  const [s, e] = await Promise.all([
    getSetting(SETTING_KEYS.communityNodeLastSuccess),
    getSetting(SETTING_KEYS.communityNodeLastError),
  ]);
  return {
    lastSuccess: s || undefined,
    lastError: e || undefined,
  };
}
