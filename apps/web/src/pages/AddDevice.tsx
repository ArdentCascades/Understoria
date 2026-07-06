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
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useApp } from "@/state/AppContext";
import { getSecretKey } from "@/db/secrets";
import { b64decode } from "@/lib/bytes";
import {
  assembleBlocksForTransfer,
  DEFAULT_EXPIRY_MS,
  encodeEnvelope,
  generateTransferPassphrase,
  wrapForTransfer,
  type TransferProfile,
} from "@/lib/devicePairing";
import { DevicePairingComparisonCard } from "@/components/DevicePairingComparisonCard";
import { DevicePairingDisplay } from "@/components/DevicePairingDisplay";
import { DeviceLinkCodeDisplay } from "@/components/DeviceLinkCodeDisplay";
import {
  badgeForPubkey,
  deriveLinkChannelId,
  grantChannelIdForPubkey,
  LINK_EXPIRY_MS,
  LINK_POLL_INTERVAL_MS,
  LINK_STALL_HINT_MS,
  listLinkRequests,
  publishLinkEnvelope,
  resolveLinkApiBase,
  sealGrant,
  type PendingLinkRequest,
} from "@/lib/deviceLink";
import { buildTransferPayload } from "@/lib/devicePairing";
import { buildCommunitySnapshot } from "@/lib/communitySnapshot";
import { readSubmitConfig } from "@/lib/nodeSubmit";
import { recordPairing } from "@/db/pairing";

type Stage =
  | "listen"
  | "sent"
  | "other-ways"
  | "gate"
  | "link-display"
  | "display"
  | "label-source"
  | "expired"
  | "error";

/**
 * Source-side AddDevice wizard. Per `docs/device-pairing.md` §6 —
 * four stages:
 *
 *   1. comparison: what does and doesn't transfer
 *   2. gate:       camera-surveillance awareness gate
 *   3. display:    QR + 6-word passphrase + 5-minute countdown
 *   4. expired:    auto-dismissed; "start over" or "close"
 *
 * Lifetime invariants:
 *   - The wrapped envelope and the transfer passphrase live in
 *     component state ONLY. They are not written to IndexedDB,
 *     localStorage, sessionStorage, or any storage primitive.
 *   - On stage change away from `display` (cancel, expired, route
 *     change), the envelope + passphrase drop with the state.
 *   - There is NO clipboard or share-sheet escape hatch (see design
 *     doc §6.3 — the envelope is too large to type, and clipboard
 *     routing reintroduces persistence).
 *
 * The destination side lives in PairDevice.tsx.
 *
 * Two transports (design doc §6.6): the node-relayed LINK path
 * (default when a community node is reachable — the member carries
 * only the 6 words to the new device; the wrapped envelope waits at
 * the node) and the QR path (offline / no-node fallback, and the
 * split-channel option for members who don't want ciphertext on the
 * node at all).
 */
export default function AddDevicePage() {
  const { currentMember, lockState } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Tap-to-link listening screen is the default (design doc §6.7):
  // the new device raises its hand and this screen sees it appear.
  const [stage, setStage] = useState<Stage>("listen");
  // Only the encoded envelope (QR payload string) is kept in state;
  // the structured `TransferEnvelope` object is local to the wrap
  // step. Both pieces drop on `reset()` regardless.
  const [encoded, setEncoded] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Which transport produced the current display/expired stage —
  // drives the right copy on the expired screen.
  const [method, setMethod] = useState<"link" | "qr">("qr");
  // Set when the link path was attempted and failed (node down,
  // mailbox full) — shown as an honest banner on the QR gate.
  const [fallbackNotice, setFallbackNotice] = useState(false);
  // Busy flag for the words-relay path — the link probe + PBKDF2 +
  // upload take a couple of seconds.
  const [preparing, setPreparing] = useState(false);

  // --- Tap-to-link listening state --------------------------------------
  // "starting" = resolving the node; "listening" = live poll running;
  // "no-node" = nothing to listen to (QR flow offered instead).
  const [listenState, setListenState] = useState<
    "starting" | "listening" | "no-node"
  >("starting");
  const [pending, setPending] = useState<PendingLinkRequest[]>([]);
  // Which request's grant is being sealed/sent (its pubkey), for the
  // per-card busy state.
  const [granting, setGranting] = useState<string | null>(null);
  // Re-render tick so the "asked N min ago" lines stay honest.
  const [listenTick, setListenTick] = useState(() => Date.now());
  // When live listening began — drives the VPN/Private-Relay hint
  // after a stretch of silence (the rendezvous fails invisibly when
  // the two apps present different network addresses).
  const [listenSince, setListenSince] = useState<number | null>(null);
  const apiBaseRef = useRef<string | null>(null);
  // Free-text label captured at the post-pair "want to label this?"
  // prompt. Stays empty when the member skips. Not sensitive — the
  // inventory it feeds is local-only.
  const [labelDraft, setLabelDraft] = useState("");
  const [savingLabel, setSavingLabel] = useState(false);

  // Drops sensitive state. Called on cancel / expiry / unmount.
  const reset = useCallback(() => {
    setEncoded(null);
    setPassphrase(null);
    setExpiresAt(null);
  }, []);

  // Live poll while on the listening screen: "any device on my
  // network asking to be linked?" The response carries only ephemeral
  // public keys — nothing sensitive rides this loop.
  useEffect(() => {
    if (stage !== "listen") return;
    let cancelled = false;
    let pollId: number | null = null;
    setListenState("starting");
    setPending([]);

    const run = async () => {
      const base = await resolveLinkApiBase();
      if (cancelled) return;
      if (!base) {
        setListenState("no-node");
        return;
      }
      apiBaseRef.current = base;
      setListenState("listening");
      setListenSince(Date.now());
      const poll = async () => {
        const res = await listLinkRequests(base);
        if (cancelled || res.kind !== "ok") return;
        setPending(res.requests);
        setListenTick(Date.now());
      };
      void poll();
      pollId = window.setInterval(() => {
        void poll();
      }, LINK_POLL_INTERVAL_MS);
    };
    void run();

    return () => {
      cancelled = true;
      if (pollId !== null) window.clearInterval(pollId);
    };
  }, [stage]);

  // The one tap that moves an identity: seal the transfer payload to
  // the chosen request's one-time key and park it in the mailbox. The
  // approval semantics live in the card copy — by the time this runs,
  // the member has read what linking means and checked the badge.
  const handleGrant = useCallback(
    async (requestPubkey: string) => {
      if (!currentMember) return;
      if (lockState === "locked") {
        setErrorMessage(t("addDevice.errors.locked"));
        setStage("error");
        return;
      }
      const apiBase = apiBaseRef.current;
      if (!apiBase) return;
      setGranting(requestPubkey);
      try {
        const secretKeyB64 = await getSecretKey(currentMember.publicKey);
        const blockBundle = await assembleBlocksForTransfer(
          currentMember.publicKey,
        );
        // The member's community connection travels with their
        // identity — without it the linked device arrives to an empty
        // community (every federation pull is gated on this setting).
        const submitCfg = await readSubmitConfig();
        const communityNode =
          submitCfg.url.trim() !== ""
            ? { url: submitCfg.url.trim(), enabled: submitCfg.enabled }
            : undefined;
        // The community itself rides the relayed transfer: projects,
        // tasks, proposals, and RSVPs never federate, and posts only
        // reach the node when each posting device mirrored them — so
        // sync alone would land the new device in a near-empty
        // community. null = too large; identity-only + sync then.
        const snapshot = await buildCommunitySnapshot();
        const payload = buildTransferPayload({
          secretKey: b64decode(secretKeyB64),
          publicKey: b64decode(currentMember.publicKey),
          profile: {
            displayName: currentMember.displayName,
            skills: currentMember.skills,
            availability: currentMember.availability,
            availabilityChips: currentMember.availabilityChips,
            locationZone: currentMember.locationZone,
          },
          expiryMs: LINK_EXPIRY_MS,
          blocks: blockBundle.blocks,
          previouslyBlocked: blockBundle.previouslyBlocked,
          ...(communityNode !== undefined ? { communityNode } : {}),
          ...(snapshot !== null ? { snapshot } : {}),
        });
        const sealed = sealGrant(payload, requestPubkey);
        const published = await publishLinkEnvelope(
          apiBase,
          grantChannelIdForPubkey(requestPubkey),
          sealed,
        );
        if (published.kind !== "ok") {
          setErrorMessage(t("addDevice.errors.generic"));
          setStage("error");
          return;
        }
        setStage("sent");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : t("addDevice.errors.generic"),
        );
        setStage("error");
      } finally {
        setGranting(null);
      }
    },
    [currentMember, lockState, t],
  );

  const handleCancel = useCallback(() => {
    reset();
    navigate("/profile");
  }, [reset, navigate]);

  // Shared wrap step for both transports: generate a fresh 6-word
  // code, bundle identity + profile + block state, and seal it under
  // the code. Per `docs/blocking.md` §14.1 the block bundle rides the
  // local-key-wrapped pairing envelope (NEVER a peer-node wire as
  // plaintext — on the link path the node stores only this
  // ciphertext). Read scoped to this blocker's pubkey so a
  // shared-device cluster doesn't leak one member's blocks into
  // another member's transfer.
  const buildWrappedTransfer = useCallback(
    // includeSnapshot: true on the RELAYED words path; false on the QR
    // path — a snapshot-sized envelope cannot render as a scannable QR.
    async (expiryMs: number, includeSnapshot: boolean) => {
      if (!currentMember) throw new Error("no current member");
      const secretKeyB64 = await getSecretKey(currentMember.publicKey);
      const secretKey = b64decode(secretKeyB64);
      const publicKey = b64decode(currentMember.publicKey);

      const profile: TransferProfile = {
        displayName: currentMember.displayName,
        skills: currentMember.skills,
        availability: currentMember.availability,
        availabilityChips: currentMember.availabilityChips,
        locationZone: currentMember.locationZone,
      };

      const generated = generateTransferPassphrase(wordlist, 6);
      const blockBundle = await assembleBlocksForTransfer(
        currentMember.publicKey,
      );
      // Same community-connection passthrough as the tap-to-link
      // grant — the QR/words paths must not produce emptier devices.
      const submitCfg = await readSubmitConfig();
      const snapshot = includeSnapshot ? await buildCommunitySnapshot() : null;
      const env = await wrapForTransfer({
        secretKey,
        publicKey,
        profile,
        passphrase: generated,
        expiryMs,
        blocks: blockBundle.blocks,
        previouslyBlocked: blockBundle.previouslyBlocked,
        ...(submitCfg.url.trim() !== ""
          ? {
              communityNode: {
                url: submitCfg.url.trim(),
                enabled: submitCfg.enabled,
              },
            }
          : {}),
        ...(snapshot !== null ? { snapshot } : {}),
      });
      return { encoded: encodeEnvelope(env), code: generated };
    },
    [currentMember],
  );

  // Continue from the comparison card. Tries the link transport
  // first: reachable node → park the envelope there, show only the
  // words. No node (or upload failed) → the QR gate, which is both
  // the offline path and the "nothing on the node, ever" path.
  const handleContinue = useCallback(async () => {
    if (!currentMember) return;
    if (lockState === "locked") {
      setErrorMessage(t("addDevice.errors.locked"));
      setStage("error");
      return;
    }
    setPreparing(true);
    try {
      const apiBase = await resolveLinkApiBase();
      if (!apiBase) {
        setStage("gate");
        return;
      }
      const { encoded: encodedEnv, code } =
        await buildWrappedTransfer(LINK_EXPIRY_MS, true);
      const channelId = await deriveLinkChannelId(code);
      const published = await publishLinkEnvelope(
        apiBase,
        channelId,
        encodedEnv,
      );
      if (published.kind !== "ok") {
        setFallbackNotice(true);
        setStage("gate");
        return;
      }
      // The envelope is parked at the node — the words are all this
      // screen needs to hold. `encoded` stays null on purpose.
      setPassphrase(code);
      setExpiresAt(published.expiresAt);
      setMethod("link");
      setStage("link-display");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("addDevice.errors.generic"),
      );
      setStage("error");
    } finally {
      setPreparing(false);
    }
  }, [currentMember, lockState, t, buildWrappedTransfer]);

  const handleShowQR = useCallback(async () => {
    if (!currentMember) return;
    if (lockState === "locked") {
      setErrorMessage(t("addDevice.errors.locked"));
      setStage("error");
      return;
    }
    try {
      const { encoded: encodedEnv, code } =
        await buildWrappedTransfer(DEFAULT_EXPIRY_MS, false);
      setEncoded(encodedEnv);
      setPassphrase(code);
      setExpiresAt(Date.now() + DEFAULT_EXPIRY_MS);
      setMethod("qr");
      setStage("display");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("addDevice.errors.generic"),
      );
      setStage("error");
    }
  }, [currentMember, lockState, t, buildWrappedTransfer]);

  const handleExpired = useCallback(() => {
    reset();
    setStage("expired");
  }, [reset]);

  const handleStartOver = useCallback(() => {
    reset();
    setFallbackNotice(false);
    setStage("listen");
  }, [reset]);

  // "Done" on the display screen no longer navigates straight to
  // Profile — it routes through the label-source stage so the member
  // can name this paired device for the inventory. Sensitive state
  // is dropped here because the pair itself is complete; the label
  // capture doesn't need the envelope or passphrase.
  const handleDoneShowingQR = useCallback(() => {
    reset();
    setLabelDraft("");
    setStage("label-source");
  }, [reset]);

  // Save path. Both "save with label" and "skip" land here; the
  // difference is the label string. Empty string is preserved
  // verbatim by the data layer — see `db/pairing.ts`.
  const handleSaveLabel = useCallback(
    async (label: string) => {
      setSavingLabel(true);
      try {
        await recordPairing({ kind: "source", label });
      } finally {
        setSavingLabel(false);
      }
      navigate("/profile");
    },
    [navigate],
  );

  // "Don't save — the pair failed" path. The flow can reach the
  // display stage on a member's honest attempt that the destination
  // device never actually completed. Forcing a write in that case
  // pollutes the inventory with phantom "you paired X" rows; the
  // ghost option lets the member opt out of recording at all.
  const handleDontSave = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  // Suppress null-render in some edge case where AppContext hasn't
  // wired currentMember yet — the OnboardingGate at App.tsx prevents
  // anonymous access here, but the guard documents the invariant.
  if (!currentMember) return null;

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={handleCancel}
        >
          {t("common.back")}
        </button>
        <h1 className="page-title mt-2">{t("addDevice.title")}</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("addDevice.subtitle")}
        </p>
      </header>

      {stage === "listen" && (
        <section className="flex flex-col gap-4">
          {listenState === "starting" && (
            <div className="card">
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("addDevice.listen.starting")}
              </p>
            </div>
          )}

          {listenState === "listening" && pending.length === 0 && (
            <div className="card flex flex-col gap-2">
              <h2 className="text-base font-semibold">
                {t("addDevice.listen.emptyTitle")}
              </h2>
              <p className="text-sm text-moss-700 dark:text-moss-200">
                {t("addDevice.listen.emptyBody")}
              </p>
              <p
                aria-live="polite"
                className="text-xs text-moss-600 dark:text-moss-300"
              >
                {t("addDevice.listen.listening")}
              </p>
              {listenSince !== null &&
                listenTick - listenSince > LINK_STALL_HINT_MS && (
                  <p
                    role="status"
                    className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                  >
                    {t("addDevice.listen.vpnHint")}
                  </p>
                )}
            </div>
          )}

          {listenState === "listening" && pending.length > 1 && (
            <p
              role="alert"
              className="rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              {t("addDevice.listen.multiWarning")}
            </p>
          )}

          {listenState === "listening" &&
            pending.map((req) => {
              const [b1, b2] = badgeForPubkey(req.pubkey);
              const ageMs = listenTick - req.createdAt;
              const stale = ageMs > 2 * 60_000;
              const busy = granting === req.pubkey;
              return (
                <div
                  key={req.pubkey}
                  className="card flex flex-col gap-3 border-canopy-300 dark:border-canopy-700"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-label={t("addDevice.listen.badgeAriaLabel")}
                      className="rounded-xl bg-moss-100 px-3 py-2 text-3xl dark:bg-moss-800"
                    >
                      <span aria-hidden="true">{b1} {b2}</span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {t("addDevice.listen.requestTitle")}
                      </span>
                      <span
                        className={
                          stale
                            ? "text-sm font-medium text-amber-700 dark:text-amber-300"
                            : "text-sm text-moss-600 dark:text-moss-300"
                        }
                      >
                        {ageMs < 90_000
                          ? t("addDevice.listen.askedJustNow")
                          : t("addDevice.listen.askedMinutesAgo", {
                              count: Math.round(ageMs / 60_000),
                            })}
                        {stale && ` — ${t("addDevice.listen.staleHint")}`}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-moss-700 dark:text-moss-200">
                    {t("addDevice.listen.requestBody")}
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={busy || granting !== null}
                    aria-busy={busy}
                    onClick={() => {
                      void handleGrant(req.pubkey);
                    }}
                  >
                    {busy
                      ? t("common.working")
                      : t("addDevice.listen.linkIt")}
                  </button>
                  <p className="text-xs text-moss-600 dark:text-moss-300">
                    {t("addDevice.listen.safetyLine")}
                  </p>
                </div>
              );
            })}

          {listenState === "no-node" && (
            <div className="card flex flex-col gap-3">
              <p className="text-sm text-moss-700 dark:text-moss-200">
                {t("addDevice.listen.noNode")}
              </p>
              <button
                type="button"
                className="btn-primary self-start"
                onClick={() => setStage("gate")}
              >
                {t("addDevice.listen.useQr")}
              </button>
            </div>
          )}

          {/* What moves across — the informed-consent content, one
              tap away instead of a mandatory wizard page. */}
          <details className="card">
            <summary className="cursor-pointer text-sm font-medium">
              {t("addDevice.listen.whatMoves")}
            </summary>
            <div className="pt-4">
              <DevicePairingComparisonCard />
            </div>
          </details>

          <button
            type="button"
            className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
            onClick={() => setStage("other-ways")}
          >
            {t("addDevice.otherWays.link")}
          </button>
        </section>
      )}

      {stage === "sent" && (
        <section className="card flex flex-col gap-4">
          <h2 className="page-title text-base">
            {t("addDevice.sent.title")}
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("addDevice.sent.body")}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-primary"
              onClick={handleDoneShowingQR}
            >
              {t("addDevice.display.done")}
            </button>
          </div>
        </section>
      )}

      {stage === "other-ways" && (
        <section className="card flex flex-col gap-4">
          <h2 className="page-title text-base">
            {t("addDevice.otherWays.title")}
          </h2>
          <button
            type="button"
            disabled={preparing}
            aria-busy={preparing}
            onClick={() => {
              void handleContinue();
            }}
            className="card flex flex-col gap-1 text-left hover:border-moss-400"
          >
            <span className="font-semibold">
              {preparing
                ? t("common.working")
                : t("addDevice.otherWays.wordsTitle")}
            </span>
            <span className="text-sm text-moss-600 dark:text-moss-300">
              {t("addDevice.otherWays.wordsBody")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStage("gate")}
            className="card flex flex-col gap-1 text-left hover:border-moss-400"
          >
            <span className="font-semibold">
              {t("addDevice.otherWays.qrTitle")}
            </span>
            <span className="text-sm text-moss-600 dark:text-moss-300">
              {t("addDevice.otherWays.qrBody")}
            </span>
          </button>
          <button
            type="button"
            className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
            onClick={() => setStage("listen")}
          >
            {t("common.back")}
          </button>
        </section>
      )}

      {stage === "link-display" && passphrase && expiresAt && (
        <section className="card flex flex-col gap-6">
          <DeviceLinkCodeDisplay
            code={passphrase}
            publicKey={currentMember.publicKey}
            expiresAt={expiresAt}
            onExpired={handleExpired}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDoneShowingQR}
            >
              {t("addDevice.display.done")}
            </button>
          </div>
          <button
            type="button"
            className="self-center text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
            onClick={() => {
              reset();
              setStage("gate");
            }}
          >
            {t("addDevice.link.qrInstead")}
          </button>
        </section>
      )}

      {stage === "gate" && (
        <section
          className="card flex flex-col gap-4"
          aria-labelledby="addDevice-gate-heading"
        >
          {fallbackNotice && (
            <p
              role="status"
              className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              {t("addDevice.link.fallbackNotice")}
            </p>
          )}
          <h2
            id="addDevice-gate-heading"
            className="text-lg font-semibold text-amber-900 dark:text-amber-200"
          >
            {t("addDevice.gate.title")}
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("addDevice.gate.body1")}
          </p>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("addDevice.gate.body2")}
          </p>
          <p className="text-sm font-medium text-moss-800 dark:text-moss-100">
            {t("addDevice.gate.commitment")}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-primary"
              onClick={handleCancel}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                void handleShowQR();
              }}
            >
              {t("addDevice.gate.showQR")}
            </button>
          </div>
        </section>
      )}

      {stage === "display" && encoded && passphrase && expiresAt && (
        <section className="card flex flex-col gap-6">
          <DevicePairingDisplay
            encodedEnvelope={encoded}
            passphrase={passphrase}
            publicKey={currentMember.publicKey}
            expiresAt={expiresAt}
            onExpired={handleExpired}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDoneShowingQR}
            >
              {t("addDevice.display.done")}
            </button>
          </div>
        </section>
      )}

      {stage === "label-source" && (
        <section
          className="card flex flex-col gap-4"
          aria-labelledby="addDevice-labelSource-heading"
        >
          <h2
            id="addDevice-labelSource-heading"
            className="text-lg font-semibold"
          >
            {t("addDevice.labelSource.title")}
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("addDevice.labelSource.body")}
          </p>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {t("addDevice.labelSource.inputLabel")}
            </span>
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
              className="btn-ghost"
              onClick={handleDontSave}
              disabled={savingLabel}
            >
              {t("addDevice.labelSource.dontSave")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                void handleSaveLabel("");
              }}
              disabled={savingLabel}
            >
              {t("addDevice.labelSource.skip")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void handleSaveLabel(labelDraft.trim());
              }}
              disabled={savingLabel}
            >
              {t("addDevice.labelSource.save")}
            </button>
          </div>
        </section>
      )}

      {stage === "expired" && (
        <section
          className="card flex flex-col gap-4"
          aria-labelledby="addDevice-expired-heading"
        >
          <h2
            id="addDevice-expired-heading"
            className="text-lg font-semibold"
          >
            {t("addDevice.expired.title")}
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {method === "link"
              ? t("addDevice.expired.bodyLink")
              : t("addDevice.expired.body")}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              {t("addDevice.expired.close")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleStartOver}
            >
              {t("addDevice.expired.startOver")}
            </button>
          </div>
        </section>
      )}

      {stage === "error" && (
        <section
          className="card flex flex-col gap-4"
          aria-labelledby="addDevice-error-heading"
          role="alert"
        >
          <h2
            id="addDevice-error-heading"
            className="text-lg font-semibold text-rose-800 dark:text-rose-200"
          >
            {t("addDevice.errors.title")}
          </h2>
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {errorMessage ?? t("addDevice.errors.generic")}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleStartOver}
            >
              {t("addDevice.errors.retry")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
