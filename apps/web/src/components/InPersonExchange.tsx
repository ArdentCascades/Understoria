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
import QRCode from "qrcode";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import { formatHours, shortKey } from "@/lib/format";
import { keyFingerprint } from "@/lib/keyFingerprint";
import { useStepFocus } from "@/lib/useStepFocus";
import {
  acceptExchangeOffer,
  collectExchangeReceipt,
  exchangeParties,
  isExchangeCeremonyText,
  mintExchangeOffer,
  parseExchangeOffer,
  type ExchangeOffer,
  type ParsedExchangeOffer,
} from "@/lib/inPersonExchange";
import type { Post } from "@/types";

/*
 * The in-person confirmation ceremony (docs/offline-resilience.md §5)
 * — two members in the same room, no network needed on either side.
 * Same two-QR round trip as the removal ceremony, both roles in one
 * component because the post itself decides which side of the
 * exchange the viewer is on:
 *
 *   helper:  show OFFER QR (with own key fingerprint) → capture the
 *            receipt from the other phone → done.
 *   helped:  capture the offer → REVIEW (hours, category, who —
 *            with the helper's key fingerprint to compare against
 *            their screen) → co-sign → show RECEIPT QR.
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
        <img
          src={dataUrl}
          alt={alt}
          // Phone held sideways: clamp the square to the viewport
          // height so the code, its instructions, and the buttons
          // share a ~320px-tall screen. Portrait keeps 224px.
          className="h-56 w-56 rounded-lg landscape-short:h-[min(55vh,14rem)] landscape-short:w-[min(55vh,14rem)]"
        />
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

export function InPersonExchange({
  post,
  meKey,
  otherPartyName,
  onClose,
}: {
  post: Post;
  meKey: string;
  otherPartyName: string | undefined;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const parties = exchangeParties(post);
  const role =
    parties && meKey === parties.helperKey
      ? ("helper" as const)
      : parties && meKey === parties.helpedKey
        ? ("helped" as const)
        : null;

  // Helper-side state.
  const [offer, setOffer] = useState<ExchangeOffer | null>(null);
  const [capturingReceipt, setCapturingReceipt] = useState(false);
  const [collected, setCollected] = useState(false);
  // Helped-side state.
  const [parsed, setParsed] = useState<ParsedExchangeOffer | null>(null);
  const [receiptText, setReceiptText] = useState<string | null>(null);
  // Shared.
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const step =
    role === "helper"
      ? collected
        ? "helper-done"
        : capturingReceipt
          ? "helper-capture"
          : "helper-offer"
      : receiptText !== null
        ? "helped-receipt"
        : parsed
          ? "helped-review"
          : "helped-capture";
  const stepRef = useStepFocus(step);

  const otherName = otherPartyName ?? t("common.anyMember");

  useEffect(() => {
    if (role !== "helper") return;
    let cancelled = false;
    void mintExchangeOffer(post.id).then((result) => {
      if (cancelled) return;
      if (result.ok) setOffer(result.offer);
      else setError(t(`inPerson.error.${result.error}`));
    });
    return () => {
      cancelled = true;
    };
    // Minted once per open (role/post.id are stable for the life of
    // the flow) — the offer signs a completedAt timestamp, so
    // re-minting on unrelated re-renders would orphan the QR the
    // other phone may already have scanned.
  }, [role, post.id]);

  if (!role) return null;

  function handleReceiptCapture(text: string) {
    setCapturingReceipt(false);
    if (!offer) return;
    void collectExchangeReceipt(text, offer).then((result) => {
      if (!result.ok) {
        setError(t(`inPerson.error.${result.error}`));
        setCapturingReceipt(true);
        return;
      }
      setError(null);
      setCollected(true);
    });
  }

  async function handleOfferCapture(text: string) {
    const result = await parseExchangeOffer(text);
    if (!result.ok) {
      setError(t(`inPerson.error.${result.error}`));
      return;
    }
    setError(null);
    setParsed(result.offer);
  }

  async function handleSign() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const result = await acceptExchangeOffer(parsed);
      if (!result.ok) {
        setError(t(`inPerson.error.${result.error}`));
        return;
      }
      setReceiptText(result.receiptText);
    } finally {
      setBusy(false);
    }
  }

  const closeButton = (
    <button
      type="button"
      className="btn-ghost self-start text-xs"
      onClick={onClose}
    >
      {t("common.cancel")}
    </button>
  );
  const errorLine = error && (
    <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
      {error}
    </p>
  );

  if (step === "helper-offer") {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t("inPerson.offerHint", { name: otherName })}
        </p>
        {offer && (
          <>
            <p className="text-sm font-medium">
              {t("inPerson.hoursLine", {
                hours: formatHours(offer.hours),
                category: t(`categories.${offer.category}`),
              })}
            </p>
            {/* Portrait: QR above fingerprint + button (unchanged
                stack). Phone held sideways: QR on the left, the
                fingerprint/hint/button column beside it, so nothing
                sits below the fold of a ~320px-tall screen. */}
            <div className="flex flex-col gap-3 landscape-short:flex-row landscape-short:items-center landscape-short:gap-6">
              <QrImage text={offer.offerText} alt={t("inPerson.offerQrAlt")} />
              <div className="flex flex-col gap-3">
                <Fingerprint
                  value={keyFingerprint(offer.helperKey)}
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
                  {t("inPerson.captureReceipt")}
                </button>
              </div>
            </div>
          </>
        )}
        {errorLine}
        {closeButton}
      </div>
    );
  }

  if (step === "helper-capture") {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t("inPerson.captureReceiptHint", { name: otherName })}
        </p>
        {errorLine}
        <PairDeviceCapture
          onCaptured={handleReceiptCapture}
          onCancel={() => setCapturingReceipt(false)}
          acceptsText={isExchangeCeremonyText}
          invalidMessage={t("inPerson.error.not_a_receipt")}
        />
      </div>
    );
  }

  if (step === "helper-done") {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <p role="status" className="text-sm text-moss-700 dark:text-moss-200">
          {t("inPerson.done")}
        </p>
        <button
          type="button"
          className="btn-secondary self-start text-xs"
          onClick={onClose}
        >
          {t("inPerson.close")}
        </button>
      </div>
    );
  }

  if (step === "helped-capture") {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t("inPerson.captureOfferHint")}
        </p>
        {errorLine}
        <PairDeviceCapture
          onCaptured={(text) => void handleOfferCapture(text)}
          onCancel={onClose}
          acceptsText={isExchangeCeremonyText}
          invalidMessage={t("inPerson.error.not_an_offer")}
        />
      </div>
    );
  }

  if (step === "helped-review" && parsed) {
    const helperName = parsed.helperName ?? shortKey(parsed.helperKey);
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {t("inPerson.reviewBody", {
            hours: formatHours(parsed.hours),
            category: t(`categories.${parsed.category}`),
            name: helperName,
            title: parsed.postTitle,
          })}
        </p>
        <Fingerprint
          value={keyFingerprint(parsed.helperKey)}
          label={t("inPerson.fingerprintLabel")}
        />
        <p className="text-xs text-moss-600 dark:text-moss-300">
          {t("inPerson.reviewFingerprintHint", { name: helperName })}
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-ghost text-xs" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn-primary text-xs"
            disabled={busy}
            onClick={() => void handleSign()}
          >
            {t("inPerson.sign", { hours: formatHours(parsed.hours) })}
          </button>
        </div>
        {errorLine}
      </div>
    );
  }

  if (step === "helped-receipt" && receiptText !== null) {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <p className="text-sm font-medium">
          {t("inPerson.receiptHint", {
            name: parsed?.helperName ?? t("common.anyMember"),
          })}
        </p>
        {/* Same stack → row swap as the offer step: sideways, the
            receipt QR sits beside its status + Close. */}
        <div className="flex flex-col gap-3 landscape-short:flex-row landscape-short:items-center landscape-short:gap-6">
          <QrImage text={receiptText} alt={t("inPerson.receiptQrAlt")} />
          <div className="flex flex-col gap-3">
            <p
              role="status"
              className="text-sm text-moss-700 dark:text-moss-200"
            >
              {t("inPerson.done")}
            </p>
            <button
              type="button"
              className="btn-secondary self-start text-xs"
              onClick={onClose}
            >
              {t("inPerson.close")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
      {errorLine}
      {closeButton}
    </div>
  );
}
