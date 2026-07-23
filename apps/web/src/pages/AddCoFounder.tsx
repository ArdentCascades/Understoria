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
import { useTranslation } from "react-i18next";
import type { FounderNomination } from "@understoria/shared/types";
import { useApp } from "@/state/AppContext";
import { BackLink } from "@/components/BackLink";
import { MemberAvatar } from "@/components/MemberAvatar";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import {
  clearPendingNomination,
  createNomination,
  nominationExpired,
  plausibleCofounderKey,
  readPendingNomination,
  submitNomination,
} from "@/lib/cofounder";
import { formatAbsoluteDateTime, shortKey } from "@/lib/format";
import { keyFingerprint } from "@/lib/keyFingerprint";
import {
  getActiveNodeUrl,
  pendingMirrorSuggestions,
} from "@/lib/nodeEndpoints";

// The founder's half of the co-founder ceremony
// (docs/cofounder-ceremony-plan.md P3): permanence first, then an
// in-person key capture (QR from the nominee's Profile full-key
// panel, or paste — NEVER a member-roster picker: the "no member-list
// browsing surface" threat-model principle holds), a name+avatar
// confirm against wrong-key social engineering, the signed
// nomination, and a pending card until the nominee's own signature
// lands. Done = the node publishes TWO founder hashes — the capture's
// count, not any local inference, is what flips this page.

type Step =
  | { kind: "loading" }
  | { kind: "intro" }
  | { kind: "capture" }
  // Camera captures bypass PairDeviceCapture's paste validation, so
  // garbage lands here rather than on the confirm step.
  | { kind: "invalid" }
  | { kind: "dead_end" }
  | { kind: "own_key" }
  | { kind: "confirm"; nomineeKey: string }
  | { kind: "pending"; nomination: FounderNomination }
  | { kind: "done" };

/** /config re-capture cadence while the page is open — modest: the
 *  nominee-side accept kick does the fast flip; this is the fallback
 *  for the founder staring at the pending card. */
const CONFIG_POLL_MS = 30_000;

export default function AddCoFounderPage() {
  const { t } = useTranslation();
  const { currentMember, members, nodeId, founderHashCapture, refreshNodeConfig } =
    useApp();
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Submit awaits network + Dexie and can outlive the page (the
  // member navigates away mid-send) — guard every post-await
  // setState (the useVouchDiscoveryNudge pattern).
  const cancelledRef = useRef(false);
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // Resume a pending nomination across visits — the settings key is
  // the source of truth, not component state.
  useEffect(() => {
    let cancelled = false;
    void readPendingNomination().then((pending) => {
      if (cancelled) return;
      // Functional update: the done-watcher below may already have
      // resolved the step (two hashes on mount) — never regress it.
      setStep((prev) =>
        prev.kind !== "loading"
          ? prev
          : pending && !nominationExpired(pending)
            ? { kind: "pending", nomination: pending }
            : { kind: "intro" },
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // While the page is open, keep the founder-hash capture fresh:
  // pendingMirrorSuggestions IS the /config fetch that captures the
  // published hashes; refreshNodeConfig re-reads local config state.
  // The capture lands in settings, so `founderHashCapture` (a live
  // query upstream) updates on its own.
  useEffect(() => {
    const id = window.setInterval(() => {
      void pendingMirrorSuggestions();
      void refreshNodeConfig();
    }, CONFIG_POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshNodeConfig]);

  // Done = the node publishes two (or more) founder hashes — the
  // authoritative root count. Clears the pending key; the ceremony is
  // over everywhere, not just here.
  const hashCount = founderHashCapture?.hashes.length ?? 0;
  useEffect(() => {
    if (hashCount < 2) return;
    setStep((prev) =>
      prev.kind === "done" ? prev : ({ kind: "done" } as Step),
    );
    void clearPendingNomination();
  }, [hashCount]);

  if (!currentMember) return null;

  function handleCaptured(raw: string) {
    const key = raw.trim();
    if (!plausibleCofounderKey(key)) {
      setStep({ kind: "invalid" });
      return;
    }
    if (key === currentMember!.publicKey) {
      setStep({ kind: "own_key" });
      return;
    }
    if (!members.some((m) => m.publicKey === key)) {
      setStep({ kind: "dead_end" });
      return;
    }
    setStep({ kind: "confirm", nomineeKey: key });
  }

  // Shared by the confirm step and the pending card's re-send: mint a
  // FRESH nomination (fresh timestamps, fresh signature — the server
  // treats a resend as a replace) and submit it.
  async function handleSend(nomineeKey: string) {
    setBusy(true);
    setSendError(null);
    try {
      const active = await getActiveNodeUrl();
      if (!active) {
        if (!cancelledRef.current)
          setSendError(t("cofounder.errors.unreachable"));
        return;
      }
      const nomination = await createNomination({
        nominatorKey: currentMember!.publicKey,
        nomineeKey,
        nodeId,
      });
      const res = await submitNomination({ url: active.url, nomination });
      if (cancelledRef.current) return;
      if (!res.ok) {
        setSendError(t(`cofounder.errors.${res.reason}`));
        return;
      }
      setStep({ kind: "pending", nomination });
    } catch {
      // Signing failed (locked session / no key on this device).
      if (!cancelledRef.current)
        setSendError(t("cofounder.errors.bad_signature"));
    } finally {
      if (!cancelledRef.current) setBusy(false);
    }
  }

  async function handleWithdraw() {
    await clearPendingNomination();
    setSendError(null);
    setStep({ kind: "intro" });
  }

  const nameFor = (publicKey: string): string =>
    members.find((m) => m.publicKey === publicKey)?.displayName ||
    shortKey(publicKey);

  return (
    <div className="mx-auto max-w-lg px-4 pb-8 pt-4">
      <BackLink to="/profile" label={t("common.back")} preferHistory />
      <h1 className="page-title mt-2 mb-4">{t("cofounder.title")}</h1>

      {step.kind === "loading" && null}

      {step.kind === "intro" && (
        <section className="card">
          <h2 className="text-base font-semibold">
            {t("cofounder.intro.title")}
          </h2>
          {/* Permanence up front — before any capture UI exists. */}
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {t("cofounder.intro.permanence")}
          </p>
          <p className="mt-2 text-sm text-moss-700 dark:text-moss-200">
            {t("cofounder.intro.body")}
          </p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={() => setStep({ kind: "capture" })}
          >
            {t("cofounder.intro.start")}
          </button>
        </section>
      )}

      {step.kind === "capture" && (
        <section className="card">
          <h2 className="mb-2 text-base font-semibold">
            {t("cofounder.capture.title")}
          </h2>
          <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
            {t("cofounder.capture.hint")}
          </p>
          <PairDeviceCapture
            onCaptured={handleCaptured}
            onCancel={() => setStep({ kind: "intro" })}
            acceptsText={plausibleCofounderKey}
            invalidMessage={t("cofounder.capture.invalid")}
          />
        </section>
      )}

      {step.kind === "invalid" && (
        <section className="card">
          <p role="alert" className="text-sm text-moss-700 dark:text-moss-200">
            {t("cofounder.capture.invalid")}
          </p>
          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={() => setStep({ kind: "capture" })}
          >
            {t("cofounder.deadEnd.retry")}
          </button>
        </section>
      )}

      {step.kind === "dead_end" && (
        /* Honest dead-end: a co-founder must already be a member. No
           silent failure, no roster to pick from instead. */
        <section className="card">
          <h2 className="text-base font-semibold">
            {t("cofounder.deadEnd.title")}
          </h2>
          <p className="mt-2 text-sm text-moss-700 dark:text-moss-200">
            {t("cofounder.deadEnd.body")}
          </p>
          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={() => setStep({ kind: "capture" })}
          >
            {t("cofounder.deadEnd.retry")}
          </button>
        </section>
      )}

      {step.kind === "own_key" && (
        <section className="card">
          <h2 className="text-base font-semibold">
            {t("cofounder.ownKey.title")}
          </h2>
          <p className="mt-2 text-sm text-moss-700 dark:text-moss-200">
            {t("cofounder.ownKey.body")}
          </p>
          <button
            type="button"
            className="btn-secondary mt-3"
            onClick={() => setStep({ kind: "capture" })}
          >
            {t("cofounder.ownKey.retry")}
          </button>
        </section>
      )}

      {step.kind === "confirm" && (
        /* The wrong-key defense: the RESOLVED member's name + avatar
           + fingerprint, and the permanence line naming them. */
        <section className="card">
          <h2 className="text-base font-semibold">
            {t("cofounder.confirm.title")}
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <MemberAvatar publicKey={step.nomineeKey} size={48} framed />
            <div>
              <p className="text-sm font-semibold">
                {nameFor(step.nomineeKey)}
              </p>
              <p className="font-mono text-xs text-moss-600 dark:text-moss-300">
                {t("cofounder.confirm.fingerprint", {
                  fingerprint: keyFingerprint(step.nomineeKey),
                })}
              </p>
            </div>
          </div>
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {t("cofounder.confirm.line", { name: nameFor(step.nomineeKey) })}
          </p>
          <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
            {t("cofounder.confirm.check")}
          </p>
          {sendError && (
            <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-300">
              {sendError}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep({ kind: "capture" })}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              aria-busy={busy}
              onClick={() => void handleSend(step.nomineeKey)}
            >
              {busy
                ? t("cofounder.confirm.signing")
                : t("cofounder.confirm.sign")}
            </button>
          </div>
        </section>
      )}

      {step.kind === "pending" && (
        <section className="card">
          <h2 className="text-base font-semibold">
            {t("cofounder.pending.title")}
          </h2>
          <p className="mt-2 text-sm text-moss-700 dark:text-moss-200">
            {t("cofounder.pending.body", {
              name: nameFor(step.nomination.nomineeKey),
            })}
          </p>
          {nominationExpired(step.nomination) ? (
            <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              {t("cofounder.pending.expired")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
              {t("cofounder.pending.expires", {
                when: formatAbsoluteDateTime(step.nomination.expiresAt),
              })}
            </p>
          )}
          {sendError && (
            <p role="alert" className="mt-2 text-sm text-rose-700 dark:text-rose-300">
              {sendError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              aria-busy={busy}
              onClick={() => void handleSend(step.nomination.nomineeKey)}
            >
              {busy
                ? t("cofounder.confirm.signing")
                : t("cofounder.pending.resend")}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => void handleWithdraw()}
            >
              {t("cofounder.pending.withdraw")}
            </button>
          </div>
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("cofounder.pending.withdrawNote")}
          </p>
        </section>
      )}

      {step.kind === "done" && (
        <section className="card border-l-4 border-canopy-500">
          <h2 className="text-base font-semibold text-canopy-800 dark:text-canopy-200">
            {t("cofounder.done.title")}
          </h2>
          <p className="mt-2 text-sm text-moss-700 dark:text-moss-200">
            {t("cofounder.done.body")}
          </p>
          <BackLink
            to="/profile"
            label={t("cofounder.done.close")}
            className="btn-primary mt-3 inline-block"
          />
        </section>
      )}
    </div>
  );
}
