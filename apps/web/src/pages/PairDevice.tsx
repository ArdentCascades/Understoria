/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { db } from "@/db/database";
import { createMember } from "@/db/seed";
import { markOnboarded } from "@/db/onboarding";
import {
  currentLockState,
  enablePassphrase,
  persistSecretKey,
} from "@/db/secrets";
import { validatePassphrase } from "@/lib/passphrase";
import { keyFingerprint } from "@/lib/keyFingerprint";
import type { AvailabilityChip } from "@/types";
import {
  decodeEnvelope,
  unwrapTransfer,
  type TransferPayload,
} from "@/lib/devicePairing";
import {
  badgeForPubkey,
  cancelLinkRequest,
  deriveLinkChannelId,
  fetchLinkEnvelope,
  generateLinkKeypair,
  grantChannelIdForPubkey,
  LINK_POLL_INTERVAL_MS,
  LINK_REQUEST_TTL_MS,
  LINK_STALL_HINT_MS,
  normalizeLinkCode,
  openGrant,
  postLinkRequest,
  resolveLinkApiBase,
} from "@/lib/deviceLink";
import { b64encode } from "@/lib/bytes";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import { PairDevicePassphraseEntry } from "@/components/PairDevicePassphraseEntry";
import { PairDeviceBootstrapReminder } from "@/components/PairDeviceBootstrapReminder";
import { DevicePairingFingerprintConfirm } from "@/components/DevicePairingFingerprintConfirm";
import { recordPairing } from "@/db/pairing";

type Stage =
  | "link-wait"
  | "link-in"
  | "other-ways"
  | "link-entry"
  | "capture"
  | "passphrase"
  | "fingerprint-confirm"
  | "session-passphrase"
  | "bootstrap"
  | "label-destination"
  | "success-redirect";

/** Sub-states of the tap-to-link waiting screen. `waiting` is the
 *  normal case; everything else is an honest dead-end with a next
 *  step on screen. */
type WaitState =
  | "starting"
  | "waiting"
  | "no-node"
  | "busy-node"
  | "node-error"
  | "interfered";

/**
 * Destination-side device-pairing flow. Reached via the Welcome
 * flow's "I have another device" path. Per design doc §7:
 *
 *   1. capture             — camera scan + paste fallback
 *   2. passphrase          — 6-word BIP39 input, unwrap envelope
 *   3. fingerprint-confirm — show short hex hash of the unwrapped
 *                            publicKey, member confirms it matches
 *                            the source device (catches mistaken-
 *                            pairing and mid-flow QR swap; the
 *                            cryptographic identity check already
 *                            ran inside `unwrapTransfer`)
 *   4. session-passphrase  — set this device's own session
 *                            passphrase (re-wraps the imported key)
 *   5. bootstrap           — "what to expect" reminder before the
 *                            Board (§7.5)
 *
 * Errors short-circuit back to the relevant step:
 *   - capture failed → stay on capture with error message
 *   - unwrap failed  → stay on passphrase with inline error
 *   - expired        → stay on passphrase ("ask the other device
 *                      to generate a new one")
 *
 * The transfer passphrase is destroyed after the import completes —
 * the design doc §7.4 invariant.
 */
export default function PairDevicePage() {
  const { nodeId, setCurrentMember, refreshOnboarded } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  // The installed-app welcome fork links here with ?samePhone=1 —
  // the identity lives in this phone's browser, so the capture step
  // starts in copy/paste mode instead of asking for the camera.
  const [searchParams] = useSearchParams();
  const samePhone = searchParams.get("samePhone") === "1";

  // Tap-to-link is the default entry (design doc §6.7): this device
  // raises its hand and the member approves from their signed-in
  // device — zero typing. The word-relay and QR paths live behind
  // "Other ways to link".
  const [stage, setStage] = useState<Stage>("link-wait");
  const [encoded, setEncoded] = useState<string | null>(null);
  const [payload, setPayload] = useState<TransferPayload | null>(null);
  const [unwrapError, setUnwrapError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);

  // --- Tap-to-link waiting screen state --------------------------------
  const [waitState, setWaitState] = useState<WaitState>("starting");
  const [badge, setBadge] = useState<[string, string] | null>(null);
  const [requestExpiresAt, setRequestExpiresAt] = useState<number | null>(
    null,
  );
  const [nowTick, setNowTick] = useState(() => Date.now());
  // Bumping restarts the whole ask with a fresh key + badge ("Ask
  // again" after expiry or interference).
  const [askAttempt, setAskAttempt] = useState(0);
  const [importedName, setImportedName] = useState("");
  // Two-tap arming for the "this isn't me" wipe.
  const [wipeArmed, setWipeArmed] = useState(false);
  // Pending request bookkeeping for best-effort withdrawal. Cleared
  // after a successful import (already cancelled) so the unmount
  // cleanup doesn't cancel twice.
  const linkCancelRef = useRef<{
    apiBase: string;
    pubkey: string;
    token: string;
  } | null>(null);
  const [sessionPassphrase, setSessionPassphrase] = useState("");
  const [sessionConfirm, setSessionConfirm] = useState("");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Free-text label for the destination-side inventory entry. Empty
  // string is the default — the prompt only nudges, never blocks.
  const [labelDraft, setLabelDraft] = useState("");
  const [savingLabel, setSavingLabel] = useState(false);

  const handleSaveDestinationLabel = useCallback(
    async (label: string) => {
      setSavingLabel(true);
      try {
        await recordPairing({ kind: "destination", label });
      } finally {
        setSavingLabel(false);
      }
      setStage("success-redirect");
      navigate("/");
    },
    [navigate],
  );

  const handleCancelToWelcome = useCallback(() => {
    setEncoded(null);
    setPayload(null);
    setUnwrapError(null);
    setSessionPassphrase("");
    setSessionConfirm("");
    navigate("/welcome");
  }, [navigate]);

  const handleCaptured = useCallback((value: string) => {
    setEncoded(value);
    setStage("passphrase");
  }, []);

  // --- Tap-to-link lifecycle -------------------------------------------
  // On entering link-wait (or tapping "Ask again"): find the node,
  // raise a fresh one-time key as a link request, show its badge, and
  // poll the grant mailbox until the member approves from their
  // signed-in device. The grant import path skips the fingerprint and
  // session-passphrase stages on purpose: the approval already
  // happened on the trusted device, and locking stays available in
  // Settings → Security.
  useEffect(() => {
    if (stage !== "link-wait") return;
    let cancelled = false;
    let pollId: number | null = null;
    let tickId: number | null = null;
    setWaitState("starting");
    setBadge(null);
    setRequestExpiresAt(null);

    const run = async () => {
      const apiBase = await resolveLinkApiBase();
      if (cancelled) return;
      if (!apiBase) {
        setWaitState("no-node");
        return;
      }
      const keypair = generateLinkKeypair();
      const pubkey = b64encode(keypair.publicKey);
      const posted = await postLinkRequest(apiBase, pubkey);
      if (cancelled) return;
      if (posted.kind === "too_many") {
        setWaitState("busy-node");
        return;
      }
      if (posted.kind !== "ok") {
        setWaitState("node-error");
        return;
      }
      linkCancelRef.current = {
        apiBase,
        pubkey,
        token: posted.cancelToken,
      };
      setBadge(badgeForPubkey(pubkey));
      setRequestExpiresAt(posted.expiresAt);
      setWaitState("waiting");
      tickId = window.setInterval(() => setNowTick(Date.now()), 500);

      const channel = grantChannelIdForPubkey(pubkey);
      pollId = window.setInterval(() => {
        void (async () => {
          if (cancelled) return;
          const res = await fetchLinkEnvelope(apiBase, channel);
          if (cancelled) return;
          // not_found = still waiting; error = transient network
          // blip — both just wait for the next tick. (Polling keeps
          // running even past the request's expiry: an approval sent
          // in the final seconds should still land.)
          if (res.kind !== "found") return;
          if (pollId !== null) {
            window.clearInterval(pollId);
            pollId = null;
          }
          const opened = openGrant(res.envelope, keypair);
          if (!opened.ok) {
            // Junk in our mailbox — someone posted a grant that
            // isn't for our key (or is malformed). The one-shot row
            // is consumed either way; honest message + fresh ask.
            setWaitState("interfered");
            return;
          }
          try {
            await importPayload(opened.payload, nodeId, null);
            await setCurrentMember(opened.payload.publicKey);
            await markOnboarded();
            // Flip the IN-MEMORY flag too: OnboardingGate routes on
            // AppContext's `onboarded`, not the Dexie setting, and
            // without this refresh the post-link navigate("/")
            // bounces straight back to the welcome fork — a trap.
            await refreshOnboarded();
            setImportedName(opened.payload.profile.displayName);
            const c = linkCancelRef.current;
            linkCancelRef.current = null;
            if (c) void cancelLinkRequest(c.apiBase, c.pubkey, c.token);
            if (!cancelled) {
              setWipeArmed(false);
              setStage("link-in");
            }
          } catch {
            if (!cancelled) setWaitState("interfered");
          }
        })();
      }, LINK_POLL_INTERVAL_MS);
    };
    void run();

    return () => {
      cancelled = true;
      if (pollId !== null) window.clearInterval(pollId);
      if (tickId !== null) window.clearInterval(tickId);
      // Withdraw the standing request when leaving the screen —
      // best-effort; the TTL is the real cleanup. Skipped after a
      // successful import (the ref was cleared post-cancel).
      const c = linkCancelRef.current;
      linkCancelRef.current = null;
      if (c) void cancelLinkRequest(c.apiBase, c.pubkey, c.token);
    };
  }, [stage, askAttempt, nodeId, setCurrentMember, refreshOnboarded]);

  // "This isn't me" on the link-in screen: a fresh device that just
  // imported a stranger's identity (see the junk-grant vector in
  // docs/device-pairing.md §6.7) has nothing of its own to lose —
  // wipe the local database entirely and restart the welcome flow.
  const handleWipeAndStartOver = useCallback(async () => {
    await db.delete();
    window.location.href = "/welcome";
  }, []);

  // Link path: the 6 words locate the node's mailbox AND decrypt the
  // envelope. One derivation finds the channel, one unwraps —
  // channel match implies key match, so a found-but-undecryptable
  // envelope is a server fault, not a typo. The mailbox row is
  // ONE-SHOT: a successful fetch consumes it, so failures after that
  // point send the member back to the source device to start over.
  const handleSubmitLinkCode = useCallback(
    async (code: string) => {
      setLinkBusy(true);
      setLinkError(null);
      try {
        const apiBase = await resolveLinkApiBase();
        if (!apiBase) {
          setLinkError(t("pairDevice.link.noNode"));
          return;
        }
        const normalized = normalizeLinkCode(code);
        const channelId = await deriveLinkChannelId(normalized);
        const res = await fetchLinkEnvelope(apiBase, channelId);
        if (res.kind === "not_found") {
          setLinkError(t("pairDevice.link.notFound"));
          return;
        }
        if (res.kind === "error") {
          setLinkError(t("pairDevice.errors.generic"));
          return;
        }
        const env = decodeEnvelope(res.envelope);
        if (!env) {
          setLinkError(t("pairDevice.errors.generic"));
          return;
        }
        const result = await unwrapTransfer(env, normalized);
        if (!result.ok) {
          setLinkError(
            result.reason === "expired"
              ? t("pairDevice.link.notFound")
              : t("pairDevice.errors.generic"),
          );
          return;
        }
        setPayload(result.payload);
        setStage("fingerprint-confirm");
      } finally {
        setLinkBusy(false);
      }
    },
    [t],
  );

  const handleSubmitPassphrase = useCallback(
    async (passphrase: string) => {
      if (!encoded) {
        setUnwrapError(t("pairDevice.errors.lostEnvelope"));
        return;
      }
      const env = decodeEnvelope(encoded);
      if (!env) {
        setUnwrapError(t("pairDevice.errors.malformed"));
        return;
      }
      setBusy(true);
      const result = await unwrapTransfer(env, passphrase);
      setBusy(false);
      if (!result.ok) {
        switch (result.reason) {
          case "wrong_passphrase":
            setUnwrapError(t("pairDevice.errors.wrongPassphrase"));
            break;
          case "expired":
            setUnwrapError(t("pairDevice.errors.expired"));
            break;
          case "version_mismatch_envelope":
          case "version_mismatch_payload":
            setUnwrapError(t("pairDevice.errors.versionMismatch"));
            break;
          case "publickey_mismatch":
            setUnwrapError(t("pairDevice.errors.publickeyMismatch"));
            break;
          case "malformed_envelope":
          default:
            setUnwrapError(t("pairDevice.errors.malformed"));
        }
        return;
      }
      setUnwrapError(null);
      setPayload(result.payload);
      setStage("fingerprint-confirm");
    },
    [encoded, t],
  );

  // Fingerprint derived from the unwrapped payload's publicKey. Pure
  // function on a string input, so memoising keeps the component
  // cheap and means the displayed hex is stable while the member
  // stares at it. Same lifetime as `payload` — both drop on mismatch
  // / cancel / unmount per design doc §6.4–§7.4. Falls back to empty
  // when no payload is present (e.g. before the unwrap completes);
  // the fingerprint-confirm stage is only mounted when payload is
  // non-null so the empty branch is unreachable in practice.
  const fingerprint = useMemo(
    () => (payload ? keyFingerprint(payload.publicKey) : ""),
    [payload],
  );

  // "No, they don't match" → drop everything sensitive and send the
  // member back to capture. The framing in the destination copy is
  // "stop and have the other device start over" — letting them
  // retype the transfer passphrase doesn't help, because if the
  // fingerprints diverge the envelope on the wire is the wrong
  // envelope (or the source screen is stale). Safe default is full
  // restart.
  const handleMismatch = useCallback(() => {
    setEncoded(null);
    setPayload(null);
    setUnwrapError(null);
    setLinkError(null);
    setSessionPassphrase("");
    setSessionConfirm("");
    // Back to the default entry — for the link path the mailbox row
    // was consumed, so the source device must start over anyway.
    setStage("link-entry");
  }, []);

  // The session-passphrase step optionally sets the device's own
  // unlock passphrase. Skipping (empty submit) leaves the secret
  // stored unwrapped — same default as a fresh seed flow.
  const handleSubmitSessionPassphrase = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!payload) return;
      const setting = sessionPassphrase.trim();
      // If the member set a passphrase, require it to validate and
      // to match the confirmation field. Empty is allowed (no
      // passphrase protection) and bypasses both checks.
      if (setting !== "") {
        const reason = validatePassphrase(setting);
        if (reason) {
          setSessionError(reason);
          return;
        }
        if (setting !== sessionConfirm) {
          setSessionError(t("pairDevice.session.mismatch"));
          return;
        }
      }
      setSessionError(null);
      setBusy(true);
      try {
        await importPayload(payload, nodeId, setting || null);
        await setCurrentMember(payload.publicKey);
        await markOnboarded();
        // Same in-memory refresh as the tap-to-link path — without it
        // the gate bounces the finished member back to /welcome.
        await refreshOnboarded();
        // Sensitive material — transfer passphrase, payload bytes —
        // dropped explicitly before navigating. Payload's secretKey
        // is already in IndexedDB (wrapped or not); React's GC will
        // clear the rest when the component unmounts.
        setPayload(null);
        setEncoded(null);
        setSessionPassphrase("");
        setSessionConfirm("");
        setStage("bootstrap");
      } catch (err) {
        setSessionError(
          err instanceof Error ? err.message : t("pairDevice.errors.generic"),
        );
      } finally {
        setBusy(false);
      }
    },
    [
      payload,
      sessionPassphrase,
      sessionConfirm,
      nodeId,
      setCurrentMember,
      refreshOnboarded,
      t,
    ],
  );

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={handleCancelToWelcome}
        >
          {t("common.back")}
        </button>
        <h1 className="page-title mt-2">{t("pairDevice.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {samePhone
            ? t("pairDevice.subtitleSamePhone")
            : t("pairDevice.subtitle")}
        </p>
      </header>

      {stage === "link-wait" && (
        <section className="card flex flex-col gap-5">
          {waitState === "starting" && (
            <p className="text-sm text-moss-600 dark:text-moss-300">
              {t("pairDevice.wait.starting")}
            </p>
          )}

          {waitState === "waiting" && badge && (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  aria-label={t("pairDevice.wait.badgeAriaLabel")}
                  className="rounded-2xl bg-moss-100 px-6 py-4 text-5xl dark:bg-moss-800"
                >
                  <span aria-hidden="true">{badge[0]} {badge[1]}</span>
                </div>
                <p className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("pairDevice.wait.badgeCaption")}
                </p>
              </div>

              <h2 className="page-title text-center text-base">
                {t("pairDevice.wait.title")}
              </h2>
              <ol className="ml-5 list-decimal space-y-1 text-sm text-moss-700 dark:text-moss-200">
                <li>
                  {samePhone
                    ? t("pairDevice.wait.samePhoneStep1")
                    : t("pairDevice.wait.step1")}
                </li>
                <li>{t("pairDevice.wait.step2")}</li>
                <li>
                  {t("pairDevice.wait.step3", {
                    badge: `${badge[0]} ${badge[1]}`,
                  })}
                </li>
              </ol>

              {requestExpiresAt !== null &&
                (nowTick < requestExpiresAt ? (
                  <>
                    <p
                      aria-live="polite"
                      className="text-center text-sm text-moss-600 dark:text-moss-300"
                    >
                      {t("pairDevice.wait.waitingLine", {
                        mmss: formatMmss(requestExpiresAt - nowTick),
                      })}
                    </p>
                    {/* Stall hint: the rendezvous fails SILENTLY when a
                        VPN / Private Relay makes the two apps present
                        different addresses — after a while, name it. */}
                    {LINK_REQUEST_TTL_MS - (requestExpiresAt - nowTick) >
                      LINK_STALL_HINT_MS && (
                      <p
                        role="status"
                        className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                      >
                        {t("pairDevice.wait.vpnHint")}
                      </p>
                    )}
                  </>
                ) : (
                  <div
                    role="status"
                    className="flex flex-col items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                  >
                    <p>{t("pairDevice.wait.expired")}</p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setAskAttempt((n) => n + 1)}
                    >
                      {t("pairDevice.wait.askAgain")}
                    </button>
                  </div>
                ))}
            </>
          )}

          {waitState === "no-node" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-moss-700 dark:text-moss-200">
                {t("pairDevice.wait.noNode")}
              </p>
              <button
                type="button"
                className="btn-primary self-start"
                onClick={() => setStage("capture")}
              >
                {t("pairDevice.wait.useQr")}
              </button>
            </div>
          )}

          {waitState === "busy-node" && (
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("pairDevice.wait.busyNode")}
            </p>
          )}

          {waitState === "node-error" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-moss-700 dark:text-moss-200">
                {t("pairDevice.wait.nodeError")}
              </p>
              <button
                type="button"
                className="btn-primary self-start"
                onClick={() => setAskAttempt((n) => n + 1)}
              >
                {t("common.tryAgain")}
              </button>
            </div>
          )}

          {waitState === "interfered" && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl bg-rose-50 p-4 dark:bg-rose-950/40"
            >
              <p className="text-sm text-rose-800 dark:text-rose-100">
                {t("pairDevice.wait.interfered")}
              </p>
              <button
                type="button"
                className="btn-primary self-start"
                onClick={() => setAskAttempt((n) => n + 1)}
              >
                {t("pairDevice.wait.askAgain")}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-moss-100 pt-3 dark:border-moss-800">
            <button
              type="button"
              className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
              onClick={() => setStage("other-ways")}
            >
              {t("pairDevice.otherWays.link")}
            </button>
            <button
              type="button"
              className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
              onClick={handleCancelToWelcome}
            >
              {t("common.cancel")}
            </button>
          </div>
        </section>
      )}

      {stage === "link-in" && (
        <section className="card flex flex-col gap-4">
          <h2 className="page-title text-base">
            {t("pairDevice.linkIn.title", { name: importedName })}
          </h2>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("pairDevice.bootstrap.intro")}
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-moss-700 dark:text-moss-200">
            <li>{t("pairDevice.bootstrap.bullets.noDms")}</li>
            <li>{t("pairDevice.bootstrap.bullets.noDrafts")}</li>
            <li>{t("pairDevice.bootstrap.bullets.noPrefs")}</li>
          </ul>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("pairDevice.bootstrap.outro")}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setLabelDraft("");
                setStage("label-destination");
              }}
            >
              {t("pairDevice.bootstrap.continue")}
            </button>
          </div>
          {/* The junk-grant escape (design doc §6.7): if the name
              above isn't the member, this fresh device imported a
              stranger's identity — wipe local state and start over.
              Two taps on purpose: arm, then confirm. */}
          {!wipeArmed ? (
            <button
              type="button"
              className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
              onClick={() => setWipeArmed(true)}
            >
              {t("pairDevice.linkIn.notMe")}
            </button>
          ) : (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40"
            >
              <p className="text-sm text-rose-800 dark:text-rose-100">
                {t("pairDevice.linkIn.notMeConfirmBody")}
              </p>
              <button
                type="button"
                className="btn-secondary self-start"
                onClick={() => {
                  void handleWipeAndStartOver();
                }}
              >
                {t("pairDevice.linkIn.wipeButton")}
              </button>
            </div>
          )}
        </section>
      )}

      {stage === "other-ways" && (
        <section className="card flex flex-col gap-4">
          <h2 className="page-title text-base">
            {t("pairDevice.otherWays.title")}
          </h2>
          <button
            type="button"
            onClick={() => {
              setLinkError(null);
              setStage("link-entry");
            }}
            className="card flex flex-col gap-1 text-left hover:border-moss-400"
          >
            <span className="font-semibold">
              {t("pairDevice.otherWays.wordsTitle")}
            </span>
            <span className="text-sm text-moss-600 dark:text-moss-300">
              {t("pairDevice.otherWays.wordsBody")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStage("capture")}
            className="card flex flex-col gap-1 text-left hover:border-moss-400"
          >
            <span className="font-semibold">
              {t("pairDevice.otherWays.qrTitle")}
            </span>
            <span className="text-sm text-moss-600 dark:text-moss-300">
              {t("pairDevice.otherWays.qrBody")}
            </span>
          </button>
          <button
            type="button"
            className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
            onClick={() => setStage("link-wait")}
          >
            {t("common.back")}
          </button>
        </section>
      )}

      {stage === "link-entry" && (
        <section className="card flex flex-col gap-4">
          {/* Where-do-the-words-come-from directions, phrased for the
              journey: the same-phone member flips to their browser;
              the two-device member glances at the other screen. */}
          <section
            aria-labelledby="pairDevice-link-directions-heading"
            className="rounded-xl border border-canopy-200 bg-canopy-50 p-4 dark:border-canopy-800 dark:bg-canopy-950/40"
          >
            <h2
              id="pairDevice-link-directions-heading"
              className="mb-2 text-sm font-semibold text-canopy-900 dark:text-canopy-100"
            >
              {t("pairDevice.link.directionsTitle")}
            </h2>
            <ol className="ml-5 list-decimal space-y-1 text-sm text-moss-700 dark:text-moss-200">
              <li>
                {samePhone
                  ? t("pairDevice.link.samePhoneStep1")
                  : t("pairDevice.link.step1")}
              </li>
              <li>
                {samePhone
                  ? t("pairDevice.link.samePhoneStep2")
                  : t("pairDevice.link.step2")}
              </li>
            </ol>
          </section>
          <PairDevicePassphraseEntry
            onSubmit={(code) => {
              void handleSubmitLinkCode(code);
            }}
            onCancel={() => setStage("other-ways")}
            unwrapError={linkError}
            busy={linkBusy}
            submitLabel={t("pairDevice.link.submit")}
          />
          <button
            type="button"
            className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
            onClick={() => {
              setLinkError(null);
              setStage("capture");
            }}
          >
            {t("pairDevice.link.scanInstead")}
          </button>
        </section>
      )}

      {stage === "capture" && (
        <section className="card">
          <PairDeviceCapture
            onCaptured={handleCaptured}
            onCancel={() => {
              // Back from the QR path returns to the method list, not
              // all the way out — the member chose QR from there.
              setStage("other-ways");
            }}
            samePhone={samePhone}
          />
        </section>
      )}

      {stage === "passphrase" && (
        <section className="card">
          <PairDevicePassphraseEntry
            onSubmit={(p) => {
              void handleSubmitPassphrase(p);
            }}
            onCancel={() => {
              setUnwrapError(null);
              setStage("capture");
            }}
            unwrapError={unwrapError}
          />
        </section>
      )}

      {stage === "fingerprint-confirm" && payload && (
        <DevicePairingFingerprintConfirm
          fingerprint={fingerprint}
          onConfirm={() => setStage("session-passphrase")}
          onMismatch={handleMismatch}
        />
      )}

      {stage === "session-passphrase" && (
        <section className="card flex flex-col gap-4">
          <h2 className="page-title text-base">
            {t("pairDevice.session.title")}
          </h2>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("pairDevice.session.intro")}
          </p>
          <form
            onSubmit={(e) => {
              void handleSubmitSessionPassphrase(e);
            }}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("pairDevice.session.passphraseLabel")}
              </span>
              <input
                type="password"
                className="input"
                value={sessionPassphrase}
                onChange={(e) => setSessionPassphrase(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("pairDevice.session.confirmLabel")}
              </span>
              <input
                type="password"
                className="input"
                value={sessionConfirm}
                onChange={(e) => setSessionConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("pairDevice.session.skipHint")}
            </p>
            {sessionError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
              >
                {sessionError}
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelToWelcome}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={busy}
                aria-busy={busy}
              >
                {busy
                  ? t("common.working")
                  : t("pairDevice.session.finish")}
              </button>
            </div>
          </form>
        </section>
      )}

      {stage === "bootstrap" && (
        <PairDeviceBootstrapReminder
          onContinue={() => {
            // Route through the label prompt before the Board hand-off.
            // The pair has succeeded by this point so there's no
            // "don't save" option — the destination-side record is
            // a member-facing signal we want regardless of label.
            setLabelDraft("");
            setStage("label-destination");
          }}
        />
      )}

      {stage === "label-destination" && (
        <section
          className="card flex flex-col gap-4"
          aria-labelledby="pairDevice-labelDestination-heading"
        >
          <h2
            id="pairDevice-labelDestination-heading"
            className="text-lg font-semibold"
          >
            {t("pairDevice.labelDestination.title")}
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("pairDevice.labelDestination.body")}
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("pairDevice.labelDestination.inputLabel")}
            </span>
            {/* Default empty — no UA autofill. Browser strings are
                long, locale-variable, and rarely match what the
                member would call the device. Better to ask. */}
            <input
              type="text"
              className="input"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              maxLength={80}
            />
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                void handleSaveDestinationLabel("");
              }}
              disabled={savingLabel}
            >
              {t("pairDevice.labelDestination.skip")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void handleSaveDestinationLabel(labelDraft.trim());
              }}
              disabled={savingLabel}
            >
              {t("pairDevice.labelDestination.save")}
            </button>
          </div>
        </section>
      )}

      {stage === "success-redirect" && null}
    </div>
  );
}

/** mm:ss for the link-request countdown. */
function formatMmss(remainingMs: number): string {
  const clamped = Math.max(0, remainingMs);
  const minutes = Math.floor(clamped / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Apply an unwrapped TransferPayload to local state — write the
 * Member row, write the secret key (plain or wrapped under
 * `sessionPassphrase`), mark onboarded. Caller navigates after.
 *
 * Mirrors the redeemInvite path in `db/invites.ts` (lines 174-183)
 * but with the keypair coming from the payload rather than being
 * freshly generated.
 */
async function importPayload(
  payload: TransferPayload,
  nodeId: string,
  sessionPassphrase: string | null,
): Promise<void> {
  // Resolve the device's protection state BEFORE writing anything
  // (Round-4 review). Previously the imported secret key was written in
  // plaintext and THEN `enablePassphrase` was called — which (a) threw
  // on an already-protected+locked device, leaving the plaintext key
  // committed, and (b) on a protected+unlocked device rewrapped EVERY
  // identity's key under the new member's passphrase, locking the other
  // member out of their own key.
  const lockState = await currentLockState();
  if (lockState === "locked") {
    // Can't wrap the imported key (no live master key) and mustn't
    // leave it plaintext on a protected device — refuse cleanly with
    // nothing written.
    throw new Error(
      "This device is locked. Unlock it before importing another identity.",
    );
  }

  const existingMember = await db.members.get(payload.publicKey);
  await db.transaction(
    "rw",
    [db.members, db.secretKeys, db.blocks, db.previouslyBlocked],
    async () => {
      if (existingMember) {
        // Re-pair onto a device that already holds this identity: MERGE
        // profile fields only. A full `createMember` put would reset
        // seedBalance / createdAt / nodeId / vouchedBy from the thin
        // transfer profile, silently changing the member's timebank
        // balance across their own devices (Round-4 review).
        await db.members.update(payload.publicKey, {
          displayName: payload.profile.displayName,
          skills: payload.profile.skills,
          availability: payload.profile.availability,
          // `availabilityChips` is `string[]` on the wire but Member
          // wants the narrower enum; the source only ever emits valid
          // chips (they came from a Member row).
          availabilityChips:
            payload.profile.availabilityChips as AvailabilityChip[],
          locationZone: payload.profile.locationZone,
        });
      } else {
        await createMember(
          {
            publicKey: payload.publicKey,
            displayName: payload.profile.displayName,
            skills: payload.profile.skills,
            availability: payload.profile.availability,
            availabilityChips:
              payload.profile.availabilityChips as AvailabilityChip[],
            locationZone: payload.profile.locationZone,
          },
          nodeId,
        );
      }
      // Persist the imported key WRAPPED when the device is unlocked
      // (persistSecretKey handles the wrap under the existing master
      // key) — never via a full-device `enablePassphrase` rewrap.
      await persistSecretKey(payload.publicKey, payload.secretKey);

      // Merge the block bundle without resurrecting local unblocks or
      // creating duplicate rows (Round-4 review). Skip any incoming
      // block for a pair this device already has an opinion on — an
      // active block (dedup) or a local unblock in previouslyBlocked
      // (respect the newer local decision).
      if (payload.blocks && payload.blocks.length > 0) {
        for (const b of payload.blocks) {
          const activeDup = await db.blocks
            .where("[blockerKey+blockedKey]")
            .equals([b.blockerKey, b.blockedKey])
            .first();
          if (activeDup) continue;
          const unblocked = await db.previouslyBlocked
            .where("[blockerKey+blockedKey]")
            .equals([b.blockerKey, b.blockedKey])
            .first();
          if (unblocked) continue;
          await db.blocks.put(b);
        }
      }
      if (payload.previouslyBlocked && payload.previouslyBlocked.length > 0) {
        // History rows are keyed 1:1 per pair; bulkPut is safe (it
        // updates an existing row rather than duplicating).
        for (const h of payload.previouslyBlocked) {
          const existing = await db.previouslyBlocked
            .where("[blockerKey+blockedKey]")
            .equals([h.blockerKey, h.blockedKey])
            .first();
          await db.previouslyBlocked.put(existing ? { ...h, id: existing.id } : h);
        }
      }
    },
  );

  // Turn ON protection only when the device was UNPROTECTED and the
  // user typed a session passphrase — this wraps the just-written
  // plaintext key (and any other local plaintext identity) under one
  // passphrase. On an already-unlocked device the key was wrapped
  // above and we must NOT rewrap everyone.
  if (lockState === "unprotected" && sessionPassphrase) {
    await enablePassphrase(sessionPassphrase);
  }
}
