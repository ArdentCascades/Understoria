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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import QRCode from "qrcode";
import { CATEGORIES } from "@understoria/shared/types";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import { db } from "@/db/database";
import { useApp } from "@/state/AppContext";
import {
  acceptDirectExchangeOffer,
  collectDirectExchangeReceipt,
  isDirectCeremonyText,
  MAX_BACKDATE_MS,
  mintDirectExchangeOffer,
  parseDirectExchangeOffer,
  type DirectExchangeOffer,
  type DirectRole,
  type ParsedDirectOffer,
} from "@/lib/directExchange";
import { formatHours, shortKey } from "@/lib/format";
import { keyFingerprint } from "@/lib/keyFingerprint";
import { useStepFocus } from "@/lib/useStepFocus";
import type { Category } from "@/types";

/*
 * Record time together — the direct-exchange recording ceremony
 * (docs/direct-exchange-label.md, adopted). For help that has no post
 * and no project task behind it: the pair that shared the hours walks
 * up and records them, phone to phone, both signing.
 *
 * The page has two doors:
 *  - INITIATE (needs ?member=<key>, which the PR-E doorways provide —
 *    a profile's "Record time together", a passed plain-event shift):
 *    small form → the before-you-sign honesty card → offer QR →
 *    scan their receipt → done.
 *  - CO-SIGN ("Scan their code" — no parameter needed): capture →
 *    review on YOUR screen (who/hours/direction, their fingerprint,
 *    what signing moves) → sign → receipt QR.
 *
 * Deliberately NO member picker and NO board surface: recording
 * direct credit starts from the person, not from browsing (§6).
 */

function QrImage({ text, alt }: { text: string; alt: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);
  return (
    <div className="flex flex-col items-center gap-2">
      {dataUrl && (
        <img src={dataUrl} alt={alt} className="h-56 w-56 rounded-lg" />
      )}
      <button
        type="button"
        className="btn-ghost text-xs"
        onClick={() => void navigator.clipboard?.writeText(text)}
      >
        {t("inPerson.copyText")}
      </button>
    </div>
  );
}

function Fingerprint({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {label}
      </span>
      <span
        aria-label={label}
        className="font-mono text-lg font-semibold tracking-widest text-moss-900 dark:text-moss-100"
      >
        {value}
      </span>
    </div>
  );
}

function localDayToCompletedAt(day: string): number {
  // Midday local time of the chosen day — a "when" for the record,
  // never a clock claim. Today uses the real moment.
  const today = new Date().toISOString().slice(0, 10);
  if (day === today || !day) return Date.now();
  return new Date(`${day}T12:00:00`).getTime();
}

export default function RecordDirectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { currentMember } = useApp();
  const counterpartyKey = params.get("member");
  const counterparty = useLiveQuery(
    () => (counterpartyKey ? db.members.get(counterpartyKey) : undefined),
    [counterpartyKey],
  );

  // Initiator state.
  const [role, setRole] = useState<DirectRole>("helper");
  const [hoursText, setHoursText] = useState(
    params.get("hours") ?? "1",
  );
  const [category, setCategory] = useState<Category>(
    (CATEGORIES as readonly string[]).includes(params.get("category") ?? "")
      ? (params.get("category") as Category)
      : "other",
  );
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [consented, setConsented] = useState(false);
  const [offer, setOffer] = useState<DirectExchangeOffer | null>(null);
  const [capturingReceipt, setCapturingReceipt] = useState(false);
  const [collected, setCollected] = useState(false);
  // Co-signer state.
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState<ParsedDirectOffer | null>(null);
  const [receiptText, setReceiptText] = useState<string | null>(null);
  // Shared.
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const step = collected
    ? "initiator-done"
    : capturingReceipt
      ? "initiator-capture"
      : offer
        ? "initiator-offer"
        : receiptText !== null
          ? "cosigner-receipt"
          : parsed
            ? "cosigner-review"
            : scanning
              ? "cosigner-capture"
              : consented
                ? "consent"
                : "start";
  const stepRef = useStepFocus(step);

  const otherName =
    counterparty?.displayName ??
    (counterpartyKey ? shortKey(counterpartyKey) : "");
  const hours = Number.parseFloat(hoursText);
  const hoursValid = Number.isFinite(hours) && hours > 0 && hours <= 24;
  const minDay = new Date(Date.now() - MAX_BACKDATE_MS)
    .toISOString()
    .slice(0, 10);
  const maxDay = new Date().toISOString().slice(0, 10);

  const errorLine = error && (
    <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
      {error}
    </p>
  );

  async function handleMint() {
    if (!counterpartyKey) return;
    setBusy(true);
    setError(null);
    try {
      const result = await mintDirectExchangeOffer({
        counterpartyKey,
        role,
        hours,
        category,
        completedAt: localDayToCompletedAt(day),
      });
      if (!result.ok) {
        setError(t(`direct.error.${result.error}`));
        setConsented(false);
        return;
      }
      setOffer(result.offer);
    } finally {
      setBusy(false);
    }
  }

  async function handleOfferCapture(text: string) {
    const result = await parseDirectExchangeOffer(text);
    if (!result.ok) {
      setError(t(`direct.error.${result.error}`));
      return;
    }
    setError(null);
    setScanning(false);
    setParsed(result.offer);
  }

  async function handleCoSign() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const result = await acceptDirectExchangeOffer(parsed);
      if (!result.ok) {
        setError(t(`direct.error.${result.error}`));
        return;
      }
      setReceiptText(result.receiptText);
    } finally {
      setBusy(false);
    }
  }

  function handleReceiptCapture(text: string) {
    setCapturingReceipt(false);
    if (!offer) return;
    void collectDirectExchangeReceipt(text, offer).then((result) => {
      if (!result.ok) {
        setError(t(`direct.error.${result.error}`));
        setCapturingReceipt(true);
        return;
      }
      setError(null);
      setCollected(true);
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <h1 className="page-title mb-1">{t("direct.title")}</h1>
      <p className="mb-4 text-sm text-moss-700 dark:text-moss-200">
        {t("direct.intro")}
      </p>

      <div
        ref={stepRef}
        tabIndex={-1}
        className="card flex flex-col gap-3 outline-none"
      >
        {step === "start" && (
          <>
            {counterpartyKey && currentMember && (
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (hoursValid) setConsented(true);
                }}
              >
                <fieldset>
                  <legend className="mb-1 text-sm font-medium">
                    {t("direct.form.direction")}
                  </legend>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="direction"
                        checked={role === "helper"}
                        onChange={() => setRole("helper")}
                      />
                      {t("direct.form.iHelped", { name: otherName })}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="direction"
                        checked={role === "helped"}
                        onChange={() => setRole("helped")}
                      />
                      {t("direct.form.theyHelped", { name: otherName })}
                    </label>
                  </div>
                </fieldset>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">{t("direct.form.hours")}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0.25}
                    max={24}
                    step={0.25}
                    value={hoursText}
                    onChange={(e) => setHoursText(e.target.value)}
                    className="input"
                    required
                  />
                  <span className="text-xs text-moss-600 dark:text-moss-300">
                    {t("direct.form.hoursHint")}
                  </span>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">
                    {t("direct.form.category")}
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {t(`categories.${c}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">{t("direct.form.day")}</span>
                  <input
                    type="date"
                    value={day}
                    min={minDay}
                    max={maxDay}
                    onChange={(e) => setDay(e.target.value)}
                    className="input"
                  />
                </label>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!hoursValid}
                >
                  {t("direct.form.continue")}
                </button>
              </form>
            )}
            {!counterpartyKey && (
              <p className="text-sm text-moss-700 dark:text-moss-200">
                {t("direct.noMember")}
              </p>
            )}
            <div className="border-t border-moss-100 pt-3 dark:border-moss-800">
              <p className="mb-2 text-sm text-moss-700 dark:text-moss-200">
                {t("direct.scanLead")}
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
              >
                {t("direct.scanInstead")}
              </button>
            </div>
            {errorLine}
          </>
        )}

        {step === "consent" && (
          <>
            {/* The §7 honesty card — what this record is, before any
                signature exists. Same comparison-card discipline as
                the shift consent card. */}
            <div className="rounded-xl border border-canopy-200 bg-canopy-50 p-3 text-sm text-canopy-900 dark:border-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100">
              <p className="font-medium">{t("direct.consent.title")}</p>
              <p className="mt-1">
                {t("direct.consent.body", {
                  hours: formatHours(hours),
                  name: otherName,
                })}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setConsented(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={busy}
                onClick={() => void handleMint()}
              >
                {t("direct.consent.confirm")}
              </button>
            </div>
            {errorLine}
          </>
        )}

        {step === "initiator-offer" && offer && currentMember && (
          <>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("direct.offerHint", { name: otherName })}
            </p>
            <p className="text-sm font-medium">
              {t("inPerson.hoursLine", {
                hours: formatHours(offer.hours),
                category: t(`categories.${offer.category}`),
              })}
            </p>
            <QrImage text={offer.offerText} alt={t("direct.offerQrAlt")} />
            <Fingerprint
              value={keyFingerprint(currentMember.publicKey)}
              label={t("inPerson.fingerprintLabel")}
            />
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("inPerson.offerFingerprintHint")}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCapturingReceipt(true)}
            >
              {t("direct.captureReceipt")}
            </button>
            {errorLine}
          </>
        )}

        {step === "initiator-capture" && (
          <>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("direct.captureReceiptHint", { name: otherName })}
            </p>
            {errorLine}
            <PairDeviceCapture
              onCaptured={handleReceiptCapture}
              onCancel={() => setCapturingReceipt(false)}
              acceptsText={isDirectCeremonyText}
              invalidMessage={t("direct.error.not_a_receipt")}
            />
          </>
        )}

        {step === "initiator-done" && (
          <p role="status" className="text-sm text-moss-700 dark:text-moss-200">
            {t("direct.done")}
          </p>
        )}

        {step === "cosigner-capture" && (
          <>
            <p className="text-sm text-moss-700 dark:text-moss-200">
              {t("direct.captureOfferHint")}
            </p>
            {errorLine}
            <PairDeviceCapture
              onCaptured={(text) => void handleOfferCapture(text)}
              onCancel={() => setScanning(false)}
              acceptsText={isDirectCeremonyText}
              invalidMessage={t("direct.error.not_an_offer")}
            />
          </>
        )}

        {step === "cosigner-review" && parsed && (
          <>
            <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              {t(
                parsed.myRole === "helped"
                  ? "direct.review.theyHelpedYou"
                  : "direct.review.youHelpedThem",
                {
                  name: parsed.signerName ?? shortKey(parsed.signerKey),
                  hours: formatHours(parsed.hours),
                  category: t(`categories.${parsed.category}`),
                },
              )}
            </p>
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("direct.review.federates")}
            </p>
            <Fingerprint
              value={keyFingerprint(parsed.signerKey)}
              label={t("inPerson.fingerprintLabel")}
            />
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("inPerson.reviewFingerprintHint", {
                name: parsed.signerName ?? shortKey(parsed.signerKey),
              })}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => setParsed(null)}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn-primary text-xs"
                disabled={busy}
                onClick={() => void handleCoSign()}
              >
                {t("direct.sign", { hours: formatHours(parsed.hours) })}
              </button>
            </div>
            {errorLine}
          </>
        )}

        {step === "cosigner-receipt" && receiptText !== null && (
          <>
            <p className="text-sm font-medium">
              {t("direct.receiptHint", {
                name:
                  parsed?.signerName ??
                  (parsed ? shortKey(parsed.signerKey) : ""),
              })}
            </p>
            <QrImage text={receiptText} alt={t("direct.receiptQrAlt")} />
            <p
              role="status"
              className="text-sm text-moss-700 dark:text-moss-200"
            >
              {t("direct.done")}
            </p>
          </>
        )}

        {/* Page-level exit only on steps that don't carry their own
            cancel (the consent card, review card, and capture
            surfaces each have one). */}
        {["start", "initiator-offer", "initiator-done", "cosigner-receipt"].includes(
          step,
        ) && (
          <button
            type="button"
            className="btn-ghost self-start text-xs"
            onClick={() => navigate(-1)}
          >
            {step === "initiator-done" || step === "cosigner-receipt"
              ? t("direct.close")
              : t("common.cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
