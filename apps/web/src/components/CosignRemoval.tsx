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
import { shortKey } from "@/lib/format";
import { useStepFocus } from "@/lib/useStepFocus";
import {
  coSignDraft,
  linkedProposalTitle,
  memberDisplayName,
  parseCeremonyDraft,
  type ParsedDraft,
} from "@/lib/removalCeremony";

// The co-signer's side of the ceremony (docs/member-removal.md §4):
// capture the proposer's draft, see exactly WHO and WHY before
// anything is signed, sign deliberately, hand the fragment back as a
// QR. A signature here is a personal, permanent, public act — the
// friction copy says so.
export function CosignRemoval({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [capturing, setCapturing] = useState(true);
  const [draft, setDraft] = useState<ParsedDraft | null>(null);
  const [subjectName, setSubjectName] = useState<string | null>(null);
  const [linkedTitle, setLinkedTitle] = useState<string | null>(null);
  const [fragmentText, setFragmentText] = useState<string | null>(null);
  const [fragmentQr, setFragmentQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The flow's phase, derived from the state machine below — the
  // step-focus discipline needs one value that changes per screen.
  const phase = capturing
    ? "capture"
    : fragmentText !== null
      ? "fragment"
      : draft
        ? "confirm"
        : "fallback";
  const stepRef = useStepFocus(phase);

  useEffect(() => {
    if (!fragmentText) return;
    let cancelled = false;
    void QRCode.toDataURL(fragmentText, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    }).then((url) => {
      if (!cancelled) setFragmentQr(url);
    });
    return () => {
      cancelled = true;
    };
  }, [fragmentText]);

  async function handleCapture(text: string) {
    setCapturing(false);
    const parsed = parseCeremonyDraft(text);
    if (!parsed.ok) {
      setError(t(`removals.error.${parsed.error}`));
      return;
    }
    setError(null);
    setDraft(parsed.draft);
    setSubjectName(await memberDisplayName(parsed.draft.subjectKey));
    if (parsed.draft.proposalId) {
      setLinkedTitle(await linkedProposalTitle(parsed.draft.proposalId));
    }
  }

  async function handleSign() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const result = await coSignDraft(draft);
      if (!result.ok) {
        setError(t(`removals.error.${result.error}`));
        return;
      }
      setFragmentText(result.fragmentText);
    } finally {
      setBusy(false);
    }
  }

  if (capturing) {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t("removals.cosignCaptureHint")}
        </p>
        <PairDeviceCapture onCaptured={(text) => void handleCapture(text)} onCancel={onDone} />
      </div>
    );
  }

  if (draft && fragmentText === null) {
    const name = subjectName ?? shortKey(draft.subjectKey);
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {t(
            draft.recordKind === "removal"
              ? "removals.cosignFriction"
              : "removals.cosignReinstateFriction",
            { name },
          )}
        </p>
        {draft.reason && (
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {t("removals.cosignReason", { reason: draft.reason })}
          </p>
        )}
        {draft.proposalId && (
          <p className="text-sm text-moss-700 dark:text-moss-200">
            {linkedTitle
              ? t("removals.linkedProposal", { title: linkedTitle })
              : t("removals.linkedProposalMissing")}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-ghost text-xs" onClick={onDone}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="btn-primary text-xs"
            disabled={busy}
            onClick={() => void handleSign()}
          >
            {t("removals.cosignConfirm", { name })}
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

  if (fragmentText !== null) {
    return (
      <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <p className="text-sm font-medium">{t("removals.cosignShowBack")}</p>
        <div className="flex flex-col items-center gap-2">
          {fragmentQr && (
            <img
              src={fragmentQr}
              alt={t("removals.cosignQrAlt")}
              className="h-56 w-56 rounded-lg"
            />
          )}
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => void navigator.clipboard?.writeText(fragmentText)}
          >
            {t("removals.copyText")}
          </button>
        </div>
        <button type="button" className="btn-secondary self-start text-xs" onClick={onDone}>
          {t("removals.close")}
        </button>
      </div>
    );
  }

  return (
    <div ref={stepRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      <button type="button" className="btn-secondary self-start text-xs" onClick={onDone}>
        {t("removals.close")}
      </button>
    </div>
  );
}
