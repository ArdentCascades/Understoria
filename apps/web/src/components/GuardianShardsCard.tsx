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
import { useApp } from "@/state/AppContext";
import { getSetting } from "@/db/database";
import { PairDeviceCapture } from "@/components/PairDeviceCapture";
import { useStepFocus } from "@/lib/useStepFocus";
import {
  acceptGuardianShard,
  createGuardianOffers,
  dropGuardianDuty,
  GUARDIAN_SETUP_KEY,
  GUARDIANS_MAX,
  GUARDIANS_MIN,
  listGuardianDuties,
  releaseShard,
  type GuardianShardRow,
} from "@/lib/guardianShards";

// Guardian shards — docs/identity-recovery.md Phase K2. One card, two
// roles: choosing YOUR guardians (splitting your key among trusted
// members, any k of whom can bring you back), and the duties YOU hold
// for others (accepting a shard, and the release ceremony when your
// person loses their phone). Every hand-off is device-to-device
// (QR / paste) — no server, no mailbox, nothing for a node to see.
// The release path carries deliberate friction copy: the live attack
// is someone IMPERSONATING your person, and the fix is human — look
// them in the eye, hear their voice.

function QrBlock({ text, label }: { text: string; label: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-2">
      {dataUrl && (
        <img src={dataUrl} alt={label} className="h-56 w-56 rounded-lg" />
      )}
      <button
        type="button"
        className="btn-ghost text-xs"
        onClick={() => void navigator.clipboard?.writeText(text)}
      >
        {t("guardians.copyText")}
      </button>
    </div>
  );
}

interface SetupRecord {
  setId: string;
  threshold: number;
  total: number;
  guardians: { publicKey: string; displayName: string }[];
  createdAt: number;
}

export function GuardianShardsCard() {
  const { t } = useTranslation();
  const { currentMember, members, lockState } = useApp();
  const [setup, setSetup] = useState<SetupRecord | null>(null);
  const [duties, setDuties] = useState<GuardianShardRow[]>([]);
  // Setup flow state
  const [choosing, setChoosing] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(2);
  const [offers, setOffers] = useState<
    { guardianName: string; text: string }[] | null
  >(null);
  const [offerIndex, setOfferIndex] = useState(0);
  // Focus follows the offer stepper: entering the stepper and each
  // "next guardian" advance land focus on the step container, so the
  // announced showTo line reads in order.
  const offerStepRef = useStepFocus(offers === null ? null : offerIndex);
  // Guardian-side flow state
  const [accepting, setAccepting] = useState(false);
  const [acceptNote, setAcceptNote] = useState<string | null>(null);
  const [releasingFor, setReleasingFor] = useState<GuardianShardRow | null>(
    null,
  );
  const [releaseText, setReleaseText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const raw = await getSetting(GUARDIAN_SETUP_KEY);
    try {
      setSetup(raw ? (JSON.parse(raw) as SetupRecord) : null);
    } catch {
      setSetup(null);
    }
    setDuties(await listGuardianDuties());
  }
  useEffect(() => {
    void refresh();
  }, []);

  if (!currentMember) return null;
  const locked = lockState === "locked";
  const candidates = members.filter(
    (m) => m.publicKey !== currentMember.publicKey,
  );

  async function handleCreate() {
    setError(null);
    const guardians = candidates
      .filter((m) => picked.includes(m.publicKey))
      .map((m) => ({ publicKey: m.publicKey, displayName: m.displayName }));
    const result = await createGuardianOffers({ threshold, guardians });
    if (!result.ok) {
      setError(t(`guardians.error.${result.error}`));
      return;
    }
    setOffers(
      result.offers.map((o) => ({
        guardianName: o.guardianName,
        text: o.text,
      })),
    );
    setOfferIndex(0);
    setChoosing(false);
    await refresh();
  }

  async function handleAcceptCapture(text: string) {
    setAccepting(false);
    const result = await acceptGuardianShard(text);
    if (!result.ok) {
      setError(t(`guardians.error.${result.error}`));
      return;
    }
    setError(null);
    setAcceptNote(
      t("guardians.accepted", {
        name: result.row.ownerName,
        index: result.row.index,
        total: result.row.total,
        threshold: result.row.threshold,
      }),
    );
    await refresh();
  }

  async function handleReleaseCapture(text: string) {
    if (!releasingFor) return;
    const result = await releaseShard(releasingFor.ownerKey, text);
    setReleasingFor(null);
    if (!result.ok) {
      setError(t(`guardians.error.${result.error}`));
      return;
    }
    setError(null);
    setReleaseText(result.text);
  }

  return (
    <section className="card mb-4" aria-labelledby="guardians-title">
      <h2
        id="guardians-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("guardians.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("guardians.intro")}
      </p>

      {/* ---- MY guardians ---- */}
      {offers === null && !choosing && (
        <div className="mb-4">
          {setup ? (
            <p className="mb-2 text-sm text-moss-700 dark:text-moss-200">
              {t("guardians.current", {
                threshold: setup.threshold,
                total: setup.total,
                names: setup.guardians.map((g) => g.displayName).join(", "),
              })}
            </p>
          ) : (
            <p className="mb-2 text-sm text-moss-700 dark:text-moss-200">
              {t("guardians.none")}
            </p>
          )}
          <button
            type="button"
            className="btn-secondary"
            disabled={locked || candidates.length < GUARDIANS_MIN}
            onClick={() => {
              setChoosing(true);
              setPicked([]);
              setThreshold(2);
            }}
          >
            {setup ? t("guardians.reshard") : t("guardians.setup")}
          </button>
          {candidates.length < GUARDIANS_MIN && (
            <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {t("guardians.needMembers", { min: GUARDIANS_MIN })}
            </p>
          )}
          {setup && (
            <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {t("guardians.reshardHonesty")}
            </p>
          )}
        </div>
      )}

      {choosing && (
        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-medium">{t("guardians.pickTitle")}</p>
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("guardians.pickWarning")}
          </p>
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {candidates.map((m) => (
              <label key={m.publicKey} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={picked.includes(m.publicKey)}
                  disabled={
                    !picked.includes(m.publicKey) &&
                    picked.length >= GUARDIANS_MAX
                  }
                  onChange={(e) =>
                    setPicked((p) =>
                      e.target.checked
                        ? [...p, m.publicKey]
                        : p.filter((k) => k !== m.publicKey),
                    )
                  }
                />
                {m.displayName}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            {t("guardians.thresholdLabel")}
            <select
              className="input w-auto"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            >
              {Array.from(
                { length: Math.max(0, picked.length - GUARDIANS_MIN + 1) },
                (_, i) => GUARDIANS_MIN + i,
              ).map((k) => (
                <option key={k} value={k}>
                  {t("guardians.thresholdOption", { k, n: picked.length })}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setChoosing(false)}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="btn-primary text-xs"
              disabled={
                picked.length < Math.max(GUARDIANS_MIN, threshold) ||
                threshold < GUARDIANS_MIN
              }
              onClick={() => void handleCreate()}
            >
              {t("guardians.create")}
            </button>
          </div>
        </div>
      )}

      {offers !== null && (
        <div
          ref={offerStepRef}
          tabIndex={-1}
          className="mb-4 flex flex-col gap-2 outline-none"
        >
          <p role="status" className="text-sm font-medium">
            {t("guardians.showTo", {
              name: offers[offerIndex].guardianName,
              step: offerIndex + 1,
              count: offers.length,
            })}
          </p>
          <p className="text-xs text-moss-600 dark:text-moss-300">
            {t("guardians.showToHint")}
          </p>
          <QrBlock
            text={offers[offerIndex].text}
            label={t("guardians.offerQrAlt")}
          />
          <div className="flex justify-end gap-2">
            {offerIndex + 1 < offers.length ? (
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => setOfferIndex(offerIndex + 1)}
              >
                {t("guardians.nextGuardian")}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => setOffers(null)}
              >
                {t("guardians.finishSetup")}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- Members I guard ---- */}
      <div className="border-t border-moss-200 pt-3 dark:border-moss-800">
        <p className="mb-2 text-sm font-medium">{t("guardians.dutiesTitle")}</p>
        {duties.length === 0 && (
          <p className="mb-2 text-xs text-moss-600 dark:text-moss-300">
            {t("guardians.noDuties")}
          </p>
        )}
        <ul>
        {duties.map((d) => (
          <li
            key={d.ownerKey}
            className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span>
              {t("guardians.dutyLine", {
                name: d.ownerName,
                index: d.index,
                total: d.total,
                threshold: d.threshold,
              })}
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                className="btn-secondary text-xs"
                disabled={locked}
                onClick={() => {
                  setReleaseText(null);
                  setReleasingFor(d);
                }}
              >
                {t("guardians.helpRecover")}
              </button>
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() =>
                  void dropGuardianDuty(d.ownerKey).then(refresh)
                }
              >
                {t("guardians.dropDuty")}
              </button>
            </span>
          </li>
        ))}
        </ul>
        {acceptNote && (
          <p role="status" className="mb-2 text-xs text-canopy-800 dark:text-canopy-200">
            {acceptNote}
          </p>
        )}
        {!accepting && !releasingFor && releaseText === null && (
          <button
            type="button"
            className="btn-secondary"
            disabled={locked}
            onClick={() => {
              setAcceptNote(null);
              setAccepting(true);
            }}
          >
            {t("guardians.accept")}
          </button>
        )}
        {accepting && (
          <div className="mt-2">
            <PairDeviceCapture
              onCaptured={(text) => void handleAcceptCapture(text)}
              onCancel={() => setAccepting(false)}
            />
          </div>
        )}
        {releasingFor && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              {t("guardians.releaseFriction", {
                name: releasingFor.ownerName,
              })}
            </p>
            <p className="text-xs text-moss-600 dark:text-moss-300">
              {t("guardians.releaseCaptureHint")}
            </p>
            <PairDeviceCapture
              onCaptured={(text) => void handleReleaseCapture(text)}
              onCancel={() => setReleasingFor(null)}
            />
          </div>
        )}
        {releaseText !== null && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-sm font-medium">{t("guardians.releaseReady")}</p>
            <QrBlock text={releaseText} label={t("guardians.releaseQrAlt")} />
            <button
              type="button"
              className="btn-primary self-end text-xs"
              onClick={() => setReleaseText(null)}
            >
              {t("guardians.releaseDone")}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      {locked && (
        <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
          {t("guardians.lockedHint")}
        </p>
      )}
    </section>
  );
}
