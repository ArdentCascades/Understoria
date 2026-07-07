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
import { REMOVAL_REASON_MAX_LENGTH } from "@understoria/shared/crypto";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import { removalQuorum } from "@/lib/memberRemoval";
import {
  collectCosignFragment,
  linkableProposals,
  mintCeremonyDraft,
  submitCeremonyRecord,
  type CeremonyDraft,
  type CeremonyKind,
} from "@/lib/removalCeremony";

// The proposer's side of the co-signing ceremony
// (docs/member-removal.md §4). Graduated-tools friction FIRST — a
// removal is the community's last resort, and the interstitial names
// the lighter tools before anything can be signed. Signature
// fragments travel device-to-device (QR / paste), same delivery
// posture as guardian shards: nothing goes through a server until
// the assembled record is submitted.

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
        {t("removals.copyText")}
      </button>
    </div>
  );
}

export function RemovalCeremony({
  recordKind,
  subjectKey,
  subjectName,
  onCancel,
}: {
  recordKind: CeremonyKind;
  subjectKey: string;
  subjectName: string;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"intro" | "collect" | "done">("intro");
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState<CeremonyDraft | null>(null);
  const [quorum, setQuorum] = useState(3);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkables, setLinkables] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [linkedProposalId, setLinkedProposalId] = useState("");

  useEffect(() => {
    void removalQuorum().then(setQuorum);
    void linkableProposals().then(setLinkables);
  }, []);

  async function handleMint() {
    setBusy(true);
    setError(null);
    try {
      const result = await mintCeremonyDraft(
        recordKind,
        subjectKey,
        reason.trim() || null,
        linkedProposalId || null,
      );
      if (!result.ok) {
        setError(t(`removals.error.${result.error}`));
        return;
      }
      setDraft(result.draft);
      setStep("collect");
    } finally {
      setBusy(false);
    }
  }

  function handleCapture(text: string) {
    setCapturing(false);
    if (!draft) return;
    const result = collectCosignFragment(text, draft);
    if (!result.ok) {
      setError(t(`removals.error.${result.error}`));
      return;
    }
    setError(null);
    setDraft({ ...draft, signatures: [...draft.signatures, result.entry] });
  }

  async function handleSubmit() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitCeremonyRecord(draft, quorum);
      if (!result.ok) {
        setError(t(`removals.error.${result.error}`));
        return;
      }
      setStep("done");
    } finally {
      setBusy(false);
    }
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {t(
            recordKind === "removal"
              ? "removals.interstitial"
              : "removals.reinstateIntro",
            { name: subjectName },
          )}
        </p>
        <label className="flex flex-col gap-1 text-sm">
          {t("removals.reasonLabel")}
          <textarea
            className="input min-h-[80px]"
            value={reason}
            maxLength={REMOVAL_REASON_MAX_LENGTH}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("removals.reasonPlaceholder")}
          />
        </label>
        {linkables.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
            {t("removals.linkLabel")}
            <select
              className="input"
              value={linkedProposalId}
              onChange={(e) => setLinkedProposalId(e.target.value)}
            >
              <option value="">{t("removals.linkNone")}</option>
              {linkables.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-ghost text-xs" onClick={onCancel}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn-primary text-xs"
            disabled={busy}
            onClick={() => void handleMint()}
          >
            {t("removals.beginCollecting")}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (step === "collect" && draft) {
    const have = draft.signatures.length;
    const enough = have >= quorum;
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t("removals.draftHint", { name: subjectName })}
        </p>
        <QrImage text={draft.draftText} alt={t("removals.draftQrAlt")} />
        <p role="status" className="text-sm font-medium">
          {t("removals.progress", { have, need: quorum })}
        </p>
        {!capturing && !enough && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCapturing(true)}
          >
            {t("removals.captureCosign")}
          </button>
        )}
        {capturing && (
          <PairDeviceCapture
            onCaptured={handleCapture}
            onCancel={() => setCapturing(false)}
          />
        )}
        {enough && (
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => void handleSubmit()}
          >
            {t(
              recordKind === "removal"
                ? "removals.submitRemoval"
                : "removals.submitReinstatement",
            )}
          </button>
        )}
        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        <button type="button" className="btn-ghost self-start text-xs" onClick={onCancel}>
          {t("common.cancel")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="text-sm text-moss-700 dark:text-moss-200">
        {t("removals.submitted")}
      </p>
      <button type="button" className="btn-secondary self-start text-xs" onClick={onCancel}>
        {t("removals.close")}
      </button>
    </div>
  );
}
