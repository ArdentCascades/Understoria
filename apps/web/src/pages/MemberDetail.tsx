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
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { trustStatusWithInvites, vouchersFor } from "@/lib/vouch";
import { TrustChip } from "@/components/TrustChip";
import { TrustedByList } from "@/components/TrustedByList";
import { addManualVouch, VouchValidationError } from "@/db/vouches";
import { shortKey } from "@/lib/format";
import { flushOutboxNow } from "@/lib/outbox";
import { humanizeError } from "@/lib/humanizeError";

export default function MemberDetailPage() {
  const { publicKey } = useParams<{ publicKey: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    members,
    currentMember,
    vouches,
    invites,
    exchanges,
  } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vouchedJustNow, setVouchedJustNow] = useState(false);

  const member = useMemo(
    () => members.find((m) => m.publicKey === publicKey) ?? null,
    [members, publicKey],
  );
  const memberVouchers = useMemo(
    () =>
      member
        ? vouchersFor(member.publicKey, { vouches, invites })
        : new Map(),
    [member, vouches, invites],
  );
  const trust = useMemo(
    () =>
      member
        ? trustStatusWithInvites(member.publicKey, { vouches, invites })
        : null,
    [member, vouches, invites],
  );
  const currentTrust = useMemo(
    () =>
      currentMember
        ? trustStatusWithInvites(currentMember.publicKey, {
            vouches,
            invites,
          })
        : null,
    [currentMember, vouches, invites],
  );
  const exchangeCount = useMemo(
    () =>
      exchanges.filter(
        (x) =>
          (publicKey && x.helperKey === publicKey) ||
          (publicKey && x.helpedKey === publicKey),
      ).length,
    [exchanges, publicKey],
  );
  const alreadyVouchedByMe = useMemo(
    () =>
      currentMember && publicKey
        ? vouches.some(
            (v) =>
              v.voucherKey === currentMember.publicKey &&
              v.voucheeKey === publicKey,
          )
        : false,
    [vouches, currentMember, publicKey],
  );

  if (!member) {
    return (
      <div className="px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-moss-600 underline-offset-2 hover:underline"
        >
          {t("common.back")}
        </button>
        <p className="text-moss-600 dark:text-moss-300">
          {t("member.notFound")}
        </p>
      </div>
    );
  }

  const isSelf = currentMember?.publicKey === member.publicKey;
  // A vouch is useful only if (a) the voucher is themselves trusted —
  // otherwise the vouch adds no trust signal — and (b) the vouchee
  // isn't already trusted (more vouches don't hurt but don't help
  // either; showing the button on already-trusted members invites
  // performative vouching).
  const canVouch =
    !isSelf &&
    currentTrust === "trusted" &&
    trust === "pending_trust" &&
    !alreadyVouchedByMe;

  async function handleVouch() {
    if (!currentMember || !publicKey) return;
    setPending(true);
    setError(null);
    try {
      await addManualVouch({
        voucherKey: currentMember.publicKey,
        voucheeKey: publicKey,
      });
      setVouchedJustNow(true);
      // Kick the outbox so a configured node sees it promptly.
      void flushOutboxNow().catch(() => {
        // Outbox is best-effort; the row is persisted regardless.
      });
    } catch (err) {
      // VouchValidationError messages are already humane; pass them
      // straight through. Anything else gets the humanize fallback.
      setError(
        err instanceof VouchValidationError ? err.message : humanizeError(err),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-moss-600 underline-offset-2 hover:underline"
      >
        {t("common.back")}
      </button>

      <header className="mb-4">
        <h1 className="mb-1 text-2xl font-semibold">{member.displayName}</h1>
        <p className="text-xs font-mono text-moss-500">
          {shortKey(member.publicKey)}
        </p>
        <div className="mt-2">
          {trust && <TrustChip status={trust} count={memberVouchers.size} />}
        </div>
      </header>

      <section className="card mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("member.aboutTitle")}
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              {t("member.skills")}
            </dt>
            <dd>
              {member.skills.length > 0
                ? member.skills.join(", ")
                : t("member.none")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              {t("member.availability")}
            </dt>
            <dd>{member.availability || t("member.none")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              {t("member.area")}
            </dt>
            <dd>{member.locationZone || t("member.none")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-500">
              {t("member.exchanges")}
            </dt>
            <dd>{exchangeCount}</dd>
          </div>
        </dl>
      </section>

      <section className="card mb-4" aria-labelledby="trusted-by-title">
        <h2
          id="trusted-by-title"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500"
        >
          {t("trustedBy.title")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("trustedBy.intro")}
        </p>
        <TrustedByList vouchers={memberVouchers} members={members} />
      </section>

      <section className="card mb-4" aria-labelledby="vouch-section-title">
        <h2
          id="vouch-section-title"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500"
        >
          {t("member.vouchTitle")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("member.vouchIntro")}
        </p>

        {vouchedJustNow ? (
          <p className="text-sm text-canopy-700 dark:text-canopy-200">
            {t("member.vouchedJustNow")}
          </p>
        ) : isSelf ? (
          <p className="text-sm text-moss-500">{t("member.cannotVouchSelf")}</p>
        ) : currentTrust !== "trusted" ? (
          <p className="text-sm text-moss-500">
            {t("member.cannotVouchUntilTrusted")}
          </p>
        ) : trust === "trusted" ? (
          <p className="text-sm text-moss-500">
            {t("member.alreadyFullyTrusted")}
          </p>
        ) : alreadyVouchedByMe ? (
          <p className="text-sm text-moss-500">
            {t("member.alreadyVouchedByYou")}
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={handleVouch}
              disabled={pending || !canVouch}
              className="btn-primary"
            >
              {pending ? t("member.vouching") : t("member.vouchButton")}
            </button>
            {error && (
              <p
                className="mt-2 text-sm text-red-700 dark:text-red-300"
                role="alert"
              >
                {error}
              </p>
            )}
          </>
        )}
      </section>

      <Link
        to="/"
        className="text-sm text-moss-600 underline-offset-2 hover:underline"
      >
        {t("member.backToBoard")}
      </Link>
    </div>
  );
}
