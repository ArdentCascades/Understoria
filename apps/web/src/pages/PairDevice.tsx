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
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import { PairDevicePassphraseEntry } from "@/components/PairDevicePassphraseEntry";
import { PairDeviceBootstrapReminder } from "@/components/PairDeviceBootstrapReminder";
import { DevicePairingFingerprintConfirm } from "@/components/DevicePairingFingerprintConfirm";
import { recordPairing } from "@/db/pairing";

type Stage =
  | "capture"
  | "passphrase"
  | "fingerprint-confirm"
  | "session-passphrase"
  | "bootstrap"
  | "label-destination"
  | "success-redirect";

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
  const { nodeId, setCurrentMember } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("capture");
  const [encoded, setEncoded] = useState<string | null>(null);
  const [payload, setPayload] = useState<TransferPayload | null>(null);
  const [unwrapError, setUnwrapError] = useState<string | null>(null);
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
    setSessionPassphrase("");
    setSessionConfirm("");
    setStage("capture");
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
          {t("pairDevice.subtitle")}
        </p>
      </header>

      {stage === "capture" && (
        <section className="card">
          <PairDeviceCapture
            onCaptured={handleCaptured}
            onCancel={handleCancelToWelcome}
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
