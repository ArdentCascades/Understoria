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
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { BetaNotice } from "@/components/BetaNotice";
import { decodeAndVerifyInvite, extractInviteToken } from "@/lib/invite";
import { redeemInvite, type RedeemError } from "@/db/invites";
import { db } from "@/db/database";
import { suggestNodeUrlFromOrigin } from "@/lib/nodeOriginSuggest";
import { formatDeadline, shortKey } from "@/lib/format";
import {
  required,
  useFieldValidation,
  type Validator,
} from "@/lib/validation";

// Invite redemption — the honest-exits shape of
// `docs/invite-redemption.md` §5.1 + §5.2 + §5.3 (Phase 0):
//
//  - A missing or damaged fragment (the dominant real failure:
//    messenger in-app browsers strip/mangle `#fragments` from tapped
//    link previews) renders a paste-the-link recovery input instead
//    of a dead end. The blame goes to the transport, never the member
//    (solidarity-not-shame).
//  - Every exit toward the board says plainly that the member has NOT
//    joined a community and can join later with a fresh link — a
//    failed redemption must never be silently converted into
//    looks-like-success self-onboarding (the production incident).
//  - On a device that already holds the current member's secret key,
//    redemption ATTACHES to that identity (name edit offered) instead
//    of minting a ghost second identity; "I'm someone else" keeps the
//    shared-device mint path one tap away. See db/invites.ts.
//  - On success, if the PWA was served by a community node and no
//    node is configured, the device CONNECTS to the origin-derived
//    node URL automatically. Accepting the invite IS the consent —
//    the member just chose to join this community, and joining
//    means joining its server (operator ruling, 2026-07,
//    superseding the earlier §5.3 card for invite arrivals; the
//    Board's first-run suggestion keeps its explicit card). When no
//    server is reachable, the unconnected notice below says so
//    plainly instead of a silent looks-like-success redirect.

type FieldName = "displayName";

const VALIDATORS: Record<FieldName, Validator> = {
  displayName: required("invite.displayNameRequired"),
};

export default function InviteAcceptPage() {
  const {
    nodeId,
    setNodeId,
    currentMember,
    setCurrentMember,
    refreshOnboarded,
  } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // The token under consideration. Seeded from the URL fragment, but
  // replaceable by the paste-recovery input — state, not a memo.
  const [encoded, setEncoded] = useState<string | null>(() => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash || null;
  });

  const [parseResult, setParseResult] = useState<
    ReturnType<typeof decodeAndVerifyInvite> | null
  >(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "error" | "done"
  >("idle");
  const [error, setError] = useState<RedeemError | null>(null);
  // §5.2: does this device hold the current member's secret key?
  // null = still checking. Gates the attach-vs-mint presentation; the
  // db layer re-derives the same answer at redemption time.
  const [holdsSecret, setHoldsSecret] = useState<boolean | null>(null);
  // §5.2 shared-device escape hatch: "I'm someone else".
  const [asSomeoneElse, setAsSomeoneElse] = useState(false);
  // Origin-derived node URL probe (§5.3). Starts at mount and is
  // awaited on the success path — on redemption the device connects
  // to it directly, no extra tap.
  const suggestionPromise = useRef<Promise<string | null> | null>(null);
  // Whether this device ends up with a community node configured —
  // resolved on the success path (auto-connect included). Redeeming
  // and NOT being connected means the new member cannot reach the
  // community: say so plainly instead of redirecting into a silently
  // empty app (the 2026-07 "island account" reports).
  const [configured, setConfigured] = useState<boolean | null>(null);

  const validation = useFieldValidation<FieldName>(
    { displayName },
    VALIDATORS,
  );

  useEffect(() => {
    if (!encoded) {
      setParseResult(null);
      return;
    }
    setParseResult(decodeAndVerifyInvite(encoded));
  }, [encoded]);

  useEffect(() => {
    let cancelled = false;
    if (!currentMember) {
      setHoldsSecret(false);
      return;
    }
    void db.secretKeys.get(currentMember.publicKey).then((row) => {
      if (!cancelled) setHoldsSecret(!!row);
    });
    return () => {
      cancelled = true;
    };
  }, [currentMember]);

  useEffect(() => {
    // Kick off the §5.3 probe once. All gating (dev builds, localhost,
    // already-configured devices, health probe) lives in the lib;
    // failure is silent — an unconfigured node is a normal state.
    suggestionPromise.current = suggestNodeUrlFromOrigin().catch(
      () => null,
    );
  }, []);

  const attachEligible =
    currentMember !== null && holdsSecret === true && !asSomeoneElse;

  // Prefill the name field for the attach path: the invite screen's
  // name field becomes an EDIT of the existing display name, not a
  // creation (§5.2). Never clobber in-progress typing; switching to
  // "I'm someone else" clears the prefill so the new person starts
  // from an empty field.
  useEffect(() => {
    if (!attachEligible || !currentMember) return;
    setDisplayName((v) => (v.trim() ? v : currentMember.displayName));
  }, [attachEligible, currentMember]);

  function applyPastedToken(token: string) {
    setError(null);
    setStatus("idle");
    setEncoded(token);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!encoded) return;
    validation.markAllTouched();
    if (validation.hasErrors) return;
    setStatus("submitting");
    const result = await redeemInvite(encoded, displayName.trim(), nodeId, {
      forceNewIdentity: asSomeoneElse,
    });
    if (!result.ok) {
      setStatus("error");
      setError(result.error);
      return;
    }
    // Attach mode resolves to the same key — the call is a no-op then,
    // and the switch that matters on the mint path.
    await setCurrentMember(result.value.member.publicKey);
    // redeemInvite marked the device onboarded (a redeemed invite IS a
    // named identity in a community); pull that into live context
    // state NOW, or the OnboardingGate bounces this member into the
    // Welcome flow on the very next navigation — the trap that
    // manufactured second "island" identities (2026-07 reports).
    await refreshOnboarded();
    // A fresh member adopts the community's nodeId during redeem so the
    // Dashboard's node-scoped stats reflect the community they just
    // joined. redeemInvite already persisted the setting; mirror it into
    // the live app state here so it takes effect without a reload. After
    // setCurrentMember, so no consumer renders a frame scoped to the new
    // community id with no current member.
    if (result.value.nodeId) {
      setNodeId(result.value.nodeId);
    }
    // Accepting the invite IS joining the community — server included
    // (operator ruling, 2026-07: "when someone redeems the invite,
    // they join the server. Period."). If this device has no node
    // configured and the serving origin answers like one, connect NOW
    // and push the join receipt immediately, so the founder's
    // projects/events/posts start flowing on the very first sync.
    const { readSubmitConfig, writeSubmitConfig } = await import(
      "@/lib/nodeSubmit"
    );
    let cfg = await readSubmitConfig();
    if (cfg.url.trim() === "") {
      const candidate = (await suggestionPromise.current) ?? null;
      if (candidate) {
        await writeSubmitConfig({ url: candidate, enabled: true });
        const { flushOutboxNow } = await import("@/lib/outbox");
        void flushOutboxNow();
        // Receive the payload NOW (operator ruling 2026-07): pull the
        // community's content immediately instead of waiting for the
        // sync loop's next tick, so the new member's first Dashboard
        // render already shows the community they just joined.
        // Fire-and-forget; live queries fill screens as records land.
        void import("@/lib/federationSync").then(async (sync) => {
          await sync.pullFederatedRedemptions().catch(() => {});
          await Promise.allSettled([
            sync.pullFederatedPosts(),
            sync.pullFederatedEvents(),
            sync.pullFederatedProjectStates(),
            sync.pullFederatedTaskStates(),
          ]);
        });
        cfg = await readSubmitConfig();
      }
    }
    setConfigured(cfg.url.trim() !== "");
    setStatus("done");
  }

  // Auto-redirect on a CONNECTED success. An unconnected redemption
  // must never be silently converted into looks-like-success — the
  // member would land on an empty app with no explanation.
  useEffect(() => {
    if (status !== "done" || configured === false) return;
    const id = setTimeout(() => navigate("/"), 1000);
    return () => clearTimeout(id);
  }, [status, configured, navigate]);

  // No fragment at all — the mangled-link arrival (§5.1.1). The same
  // paste input as the error screen, framed calmly rather than as an
  // immediate `malformed` error: nothing failed yet, the code just
  // didn't survive the trip.
  if (!encoded) {
    return (
      <div className="px-4 pb-8 pt-6">
        <h1 className="text-xl font-bold">{t("invite.noFragment.title")}</h1>
        <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
          {t("invite.noFragment.body")}
        </p>
        <PasteRecovery onToken={applyPastedToken} />
        <ContinueWithoutJoining inviterName={null} />
      </div>
    );
  }

  if (!parseResult) {
    return (
      <div className="px-4 pt-6 text-sm text-moss-600 dark:text-moss-300">
        {t("invite.reading")}
      </div>
    );
  }

  // Token present but unusable — decode/verify failure, or a hard
  // redemption error surfaced below via `status === "error"` re-render
  // of the form. Per-error guidance plus the paste input: pasting the
  // original message fixes a mangled fragment, and pasting a FRESH
  // link the inviter just sent resolves every other case without
  // hunting for a tappable URL.
  if (!parseResult.ok) {
    return (
      <ErrorExit
        error={parseResult.error}
        inviterName={null}
        onToken={applyPastedToken}
      />
    );
  }

  const { invite } = parseResult;

  if (status === "error" && error) {
    return (
      <ErrorExit
        error={error}
        inviterName={invite.inviterName}
        onToken={applyPastedToken}
      />
    );
  }

  return (
    <div className="px-4 pb-8 pt-6">
      <div className="card">
        <h1 className="page-title">{t("invite.youInvited")}</h1>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          {t("invite.wantsYou", { name: invite.inviterName })}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
              {t("invite.inviterKey")}
            </dt>
            <dd className="mt-0.5 font-mono text-xs">
              {shortKey(invite.inviterKey)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
              {t("invite.expires")}
            </dt>
            <dd className="mt-0.5">
              {formatDeadline(invite.expiresAt)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-moss-600 dark:text-moss-300">
          {t("invite.expiresOn", {
            date: new Date(invite.expiresAt).toLocaleDateString(),
          })}
        </p>

        <p className="mt-4 rounded-xl bg-moss-50 p-3 text-xs text-moss-600 dark:bg-moss-900 dark:text-moss-300">
          {t("invite.fingerprintReminder", { name: invite.inviterName })}
        </p>

        {status === "done" ? (
          <>
            <p className="mt-4 rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
              {/* "Redirecting…" only when we actually are — with the
                  unconnected notice below, the member decides first. */}
              {configured === false
                ? t("invite.welcomeStay")
                : t("invite.welcome")}
            </p>
            {/* No reachable node and none configured: the redemption
                is real but LOCAL-ONLY — this device cannot reach the
                community's server, so nothing of the community will
                appear until it's connected. Say it, name the path,
                and let the member proceed deliberately. */}
            {configured === false && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
              >
                <p>
                  {t("invite.notConnected.body", {
                    name: invite.inviterName,
                  })}
                </p>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => navigate("/")}
                  >
                    {t("invite.notConnected.continue")}
                  </button>
                  <button
                    type="button"
                    className="btn-primary text-xs"
                    onClick={() => navigate("/profile")}
                  >
                    {t("invite.notConnected.goToSettings")}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-3"
            noValidate
          >
            {/* §5.2 identity banner: on an already-identified device
                attach is the stated default; the mint escape hatch is
                one tap away, never buried. */}
            {currentMember && holdsSecret && !asSomeoneElse && (
              <div className="rounded-xl bg-canopy-50 p-3 text-sm dark:bg-canopy-950/40">
                <p className="font-medium text-canopy-900 dark:text-canopy-100">
                  {t("invite.joiningAs", {
                    name: currentMember.displayName,
                  })}
                </p>
                <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
                  {t("invite.attachNote")}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                  onClick={() => {
                    setAsSomeoneElse(true);
                    setDisplayName("");
                  }}
                >
                  {t("invite.someoneElse")}
                </button>
              </div>
            )}
            {currentMember && holdsSecret && asSomeoneElse && (
              <div className="rounded-xl bg-moss-50 p-3 text-sm dark:bg-moss-900">
                <p className="text-xs text-moss-600 dark:text-moss-300">
                  {t("invite.mintingNote")}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                  onClick={() => {
                    setAsSomeoneElse(false);
                    setDisplayName(currentMember.displayName);
                  }}
                >
                  {t("invite.joinAsExisting", {
                    name: currentMember.displayName,
                  })}
                </button>
              </div>
            )}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("invite.displayNameLabel")}
              </span>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={() => validation.onBlur("displayName")}
                aria-invalid={
                  validation.shouldShowError("displayName") || undefined
                }
                aria-describedby={
                  validation.shouldShowError("displayName")
                    ? "displayName-error"
                    : undefined
                }
                maxLength={60}
                required
              />
              {validation.shouldShowError("displayName") && (
                <p
                  id="displayName-error"
                  role="alert"
                  className="text-xs text-rose-700 dark:text-rose-300"
                >
                  {t(validation.errors.displayName!.key)}
                </p>
              )}
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/")}
              >
                {t("invite.continueWithoutJoining")}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={status === "submitting"}
              >
                {status === "submitting"
                  ? t("invite.submitting")
                  : t("invite.submit")}
              </button>
            </div>
            {/* The honest-exit note (§5.1.3), de-emphasized but present
                before the decision: declining is a legitimate state,
                not a failure state — and not a joined one either. */}
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("invite.notJoinedNote", { name: invite.inviterName })}
            </p>
          </form>
        )}
      </div>
      {/* The beta/AI disclosure — an invite link is most members'
          very first contact with Understoria, so the honest word
          about what this software is belongs on this doorstep,
          before the join decision, not after it. */}
      <BetaNotice className="mt-4" />
    </div>
  );
}

// The failed-redemption screen (§5.1.2–.3): per-error guidance that
// blames the transport, the paste-the-link recovery input, and the
// renamed, honest exit. `inviterName` is known only when the token
// decoded far enough to carry one (redeem-time errors); parse-time
// errors fall back to generic wording.
function ErrorExit({
  error,
  inviterName,
  onToken,
}: {
  error: RedeemError;
  inviterName: string | null;
  onToken: (token: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="px-4 pb-8 pt-6">
      <h1 className="text-xl font-bold">{t("invite.cantUse")}</h1>
      <p role="alert" className="mt-2 text-sm text-moss-600 dark:text-moss-300">
        {t(`invite.errors.${error}`)}
      </p>
      <PasteRecovery onToken={onToken} />
      <ContinueWithoutJoining inviterName={inviterName} />
    </div>
  );
}

// The §5.1.3 exit: renamed, de-emphasized, and honest. States plainly
// that the member has NOT joined a community and can join later with
// a fresh invite — never a silent fall-through into looks-like-success
// self-onboarding.
function ContinueWithoutJoining({
  inviterName,
}: {
  inviterName: string | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="mt-6">
      <p className="text-xs text-moss-600 dark:text-moss-300">
        {inviterName
          ? t("invite.notJoinedNote", { name: inviterName })
          : t("invite.notJoinedNoteGeneric")}
      </p>
      <button
        type="button"
        className="btn-secondary mt-3"
        onClick={() => navigate("/")}
      >
        {t("invite.continueWithoutJoining")}
      </button>
    </div>
  );
}

// The fragment-loss recovery input (§5.1.1). Accepts the full invite
// link, a whole pasted message containing it, or the bare token —
// `extractInviteToken` does the finding; `decodeAndVerifyInvite`
// re-runs on whatever it found. This turns the most common hard
// failure (a messenger stripping the `#fragment`) into a two-step
// success with no new link needed.
function PasteRecovery({ onToken }: { onToken: (token: string) => void }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);

  function handleUse() {
    const token = extractInviteToken(value);
    if (!token) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onToken(token);
  }

  return (
    <div className="mt-5 rounded-xl bg-moss-50 p-3 dark:bg-moss-900">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          {t("invite.paste.label")}
        </span>
        <input
          className="input"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setInvalid(false);
          }}
          placeholder={t("invite.paste.placeholder")}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "paste-error" : undefined}
        />
      </label>
      {invalid && (
        <p
          id="paste-error"
          role="alert"
          className="mt-1 text-xs text-rose-700 dark:text-rose-300"
        >
          {t("invite.paste.invalid")}
        </p>
      )}
      <button
        type="button"
        className="btn-primary mt-3"
        onClick={handleUse}
        disabled={!value.trim()}
      >
        {t("invite.paste.submit")}
      </button>
    </div>
  );
}
