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
import { useCallback, useState } from "react";
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
import { recordPairing } from "@/db/pairing";

type Stage =
  | "comparison"
  | "gate"
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
 * The destination side ships in a follow-up PR.
 */
export default function AddDevicePage() {
  const { currentMember, lockState } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("comparison");
  // Only the encoded envelope (QR payload string) is kept in state;
  // the structured `TransferEnvelope` object is local to the wrap
  // step. Both pieces drop on `reset()` regardless.
  const [encoded, setEncoded] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const handleCancel = useCallback(() => {
    reset();
    navigate("/profile");
  }, [reset, navigate]);

  const handleShowQR = useCallback(async () => {
    if (!currentMember) return;
    if (lockState === "locked") {
      setErrorMessage(t("addDevice.errors.locked"));
      setStage("error");
      return;
    }
    try {
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
      // Per `docs/blocking.md` §14.1: block state propagates to a
      // newly-paired device through the local-key-wrapped pairing
      // envelope (NEVER over a peer-node wire). Read scoped to this
      // blocker's pubkey so a shared-device cluster doesn't leak
      // one member's blocks into another member's transfer.
      const blockBundle = await assembleBlocksForTransfer(
        currentMember.publicKey,
      );
      const env = await wrapForTransfer({
        secretKey,
        publicKey,
        profile,
        passphrase: generated,
        blocks: blockBundle.blocks,
        previouslyBlocked: blockBundle.previouslyBlocked,
      });

      setEncoded(encodeEnvelope(env));
      setPassphrase(generated);
      setExpiresAt(Date.now() + DEFAULT_EXPIRY_MS);
      setStage("display");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : t("addDevice.errors.generic"),
      );
      setStage("error");
    }
  }, [currentMember, lockState, t]);

  const handleExpired = useCallback(() => {
    reset();
    setStage("expired");
  }, [reset]);

  const handleStartOver = useCallback(() => {
    reset();
    setStage("comparison");
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

      {stage === "comparison" && (
        <section className="card flex flex-col gap-6">
          <DevicePairingComparisonCard />
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
              onClick={() => setStage("gate")}
            >
              {t("addDevice.comparison.continue")}
            </button>
          </div>
        </section>
      )}

      {stage === "gate" && (
        <section
          className="card flex flex-col gap-4"
          aria-labelledby="addDevice-gate-heading"
        >
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
            {t("addDevice.expired.body")}
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
