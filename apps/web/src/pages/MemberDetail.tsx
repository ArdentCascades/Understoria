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
/*
 * OPERATOR RULING (2026-07) + design principle `no-leaderboards`
 * ("Progress is tracked at the community level. The unit of
 * measurement is us, not me."):
 *
 *   A member page viewed by OTHERS must not display stats or badges
 *   people can compare themselves to.
 *
 * Concretely, this page must never (re)gain:
 *   - vouch COUNTS ("3 vouches", "1/2 vouches") — trust is shown
 *     qualitatively via <TrustChip status={...}/> with NO `count`;
 *   - the "Vouched for by" voucher list (its length is a de facto
 *     score, and its timestamps are a browsable activity record —
 *     see `no-activity-search`);
 *   - exchange tallies, hour totals, streaks, achievement badges
 *     (AchievementBadge is for the member's OWN Profile only), or
 *     join-date-as-seniority.
 *
 * What IS welcome here: matching info (skills, availability, area),
 * the qualitative trust status, and the Vouch / Block actions. Trust
 * GATING logic (trustStatusWithInvites) is untouched by the ruling —
 * only comparable DISPLAY is banned. A tripwire test lives in
 * MemberDetail.test.tsx.
 */
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { useApp } from "@/state/AppContext";
import { BackLink } from "@/components/BackLink";
import { isFounderRoot, trustStatusWithInvites } from "@/lib/vouch";
import { MemberAvatar } from "@/components/MemberAvatar";
import { FounderChip, TrustChip } from "@/components/TrustChip";
import { TrustGateCard } from "@/components/InviteTrustGateCard";
import { AvailabilityChips } from "@/components/AvailabilityChips";
import { BlockConfirmCard } from "@/components/BlockConfirmCard";
import { UnblockConfirmDialog } from "@/components/UnblockConfirmDialog";
import { addManualVouch, VouchValidationError } from "@/db/vouches";
import { isBlocked } from "@/db/blocks";
import { RemovalCeremony } from "@/components/RemovalCeremony";
import { RemovalGateNotice, useRemovalGate } from "@/components/useRemovalGate";
import { IdentityKey } from "@/components/IdentityKey";
import { shortKey } from "@/lib/format";
import { flushOutboxNow } from "@/lib/outbox";
import { humanizeError } from "@/lib/humanizeError";

export default function MemberDetailPage() {
  const { publicKey } = useParams<{ publicKey: string }>();
  const { t } = useTranslation();
  const {
    members,
    currentMember,
    vouches,
    invites,
    founderRoots,
  } = useApp();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vouchedJustNow, setVouchedJustNow] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [unblockOpen, setUnblockOpen] = useState(false);
  const [removalOpen, setRemovalOpen] = useState(false);
  const removalGate = useRemovalGate();

  // Reactive blocked-state lookup. Re-runs when either side's
  // pubkey changes OR when the underlying `blocks` table mutates
  // (block / unblock toggles the value live without a manual
  // refresh).
  const blocked = useLiveQuery(
    async () =>
      currentMember && publicKey
        ? await isBlocked(currentMember.publicKey, publicKey)
        : false,
    [currentMember?.publicKey, publicKey],
    false,
  );

  const member = useMemo(
    () => members.find((m) => m.publicKey === publicKey) ?? null,
    [members, publicKey],
  );
  const trust = useMemo(
    () =>
      member
        ? trustStatusWithInvites(member.publicKey, {
            vouches,
            invites,
            founderRoots,
          })
        : null,
    [member, vouches, invites, founderRoots],
  );
  const currentTrust = useMemo(
    () =>
      currentMember
        ? trustStatusWithInvites(currentMember.publicKey, {
            vouches,
            invites,
            founderRoots,
          })
        : null,
    [currentMember, vouches, invites, founderRoots],
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
        <BackLink
          to="/"
          label={t("common.back")}
          preferHistory
          className="mb-4 inline-block text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        />
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
      {/* The one back affordance on this page (the old footer "Back to
          board" link folded into it). Members are reached from many
          surfaces — board posts, project rosters, conversations —
          so back returns to wherever the profile
          was opened from; a cold entry (shared deep link) falls back
          to the Board, the surface members are discovered on. */}
      <BackLink
        to="/"
        label={t("common.back")}
        preferHistory
        className="mb-4 inline-block text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
      />

      <header className="mb-4 flex items-start gap-6">
        <MemberAvatar publicKey={member.publicKey} size={128} framed />
        <div className="min-w-0 flex-1">
          <h1 className="mb-1 text-2xl font-semibold">{member.displayName}</h1>
          {/* Canonical identity spot — the key stays visible, and
              tapping it explains what the code is (IdentityKey.tsx). */}
          <p className="text-xs font-mono text-moss-600 dark:text-moss-300">
            <IdentityKey
              publicKey={member.publicKey}
              name={member.displayName}
              isYou={isSelf}
              alwaysShown
            >
              {shortKey(member.publicKey)}
            </IdentityKey>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Qualitative trust status ONLY — no `count` prop. The
                chip used to read "Trusted (3 vouches)" / "New here
                (1/2 vouches)"; a vouch tally on someone else's page
                is a comparable score, banned by the operator ruling
                + `no-leaderboards` (see file header). The count
                variant remains fine on the member's OWN Profile.
                FounderChip is fine here: founding-root status is a
                published fact (salted hashes on /config), not a
                climbable tally. */}
            {trust && <TrustChip status={trust} />}
            {isFounderRoot(member.publicKey, { founderRoots }) && (
              <FounderChip />
            )}
          </div>
        </div>
      </header>

      <section className="card mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
          {t("member.aboutTitle")}
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
              {t("member.skills")}
            </dt>
            <dd>
              {member.skills.length > 0
                ? member.skills.join(", ")
                : t("member.none")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
              {t("member.availability")}
            </dt>
            <dd>
              {member.availabilityChips.length > 0 && (
                <div className="mb-1">
                  <AvailabilityChips chips={member.availabilityChips} />
                </div>
              )}
              {member.availability ||
                (member.availabilityChips.length === 0 && t("member.none"))}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
              {t("member.area")}
            </dt>
            <dd>{member.locationZone || t("member.none")}</dd>
          </div>
        </dl>
      </section>

      {/* The "Vouched for by" section (TrustedByList) was removed
          here per the operator ruling + `no-leaderboards`: a roster
          of vouchers is a countable trust score in list form, its
          per-vouch timestamps were a browsable activity record
          (`no-activity-search`), and its empty state ("No one has
          vouched for this member yet") shamed newcomers
          (`solidarity-not-shame`). Trust stays visible as the
          qualitative TrustChip above; vouch GATING below is
          unchanged. Do not restore the list. */}

      <section className="card mb-4" aria-labelledby="vouch-section-title">
        <h2
          id="vouch-section-title"
          className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
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
          <p className="text-sm text-moss-600 dark:text-moss-300">{t("member.cannotVouchSelf")}</p>
        ) : currentTrust !== "trusted" ? (
          /* The same gate card every trust-gated action shows, at the
             moment the member would reach for the button. NO `have`
             progress here: this is ANOTHER member's page, and a
             "N of 2 vouches" line would read as their score (the
             no-leaderboards tripwire below forbids it). Own progress
             lives on the member's own Profile. */
          <TrustGateCard i18nBase="member.vouchGate" />
        ) : trust === "trusted" ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("member.alreadyFullyTrusted")}
          </p>
        ) : alreadyVouchedByMe ? (
          <p className="text-sm text-moss-600 dark:text-moss-300">
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

      {/* The direct-exchange doorway (docs/direct-exchange-label.md
          §6.2, ruling R3): recording help that had no post or task
          behind it starts FROM THE PERSON — this profile — never
          from a board surface or a suggestion engine. Both
          directions land on the one ceremony form; consent stays the
          mutual signature. Sits above the defensive tools
          (graduated-tools ordering: connective before protective). */}
      {!isSelf && currentMember && publicKey && (
        <section className="card mb-4">
          <Link
            to={`/record-direct?member=${encodeURIComponent(publicKey)}`}
            className="btn-secondary inline-block min-h-[44px]"
          >
            {t("direct.title")}
          </Link>
          <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
            {t("member.recordDirectHint")}
          </p>
        </section>
      )}

      {/* Block / Unblock affordance. Hidden on the self-view because
          blocking yourself is meaningless. Per design doc §11.6 +
          §13.1: the surface lives ONLY on MemberDetail + Settings —
          not on feed cards — and uses the literal copy "Block
          contact" to stay clear of the `follows-not-blocked`
          task-vocabulary collision. */}
      {!isSelf && currentMember && (
        <section className="card mb-4">
          <button
            type="button"
            onClick={() =>
              blocked ? setUnblockOpen(true) : setBlockOpen(true)
            }
            className={
              blocked
                ? "btn-secondary min-h-[44px]"
                : "btn min-h-[44px] bg-rose-600 text-white hover:bg-rose-700"
            }
          >
            {blocked
              ? t("block.action.unblockButton")
              : t("block.action.button")}
          </button>
        </section>
      )}

      {/* Member removal (docs/member-removal.md §4): the heaviest
          tool sits BENEATH the block action — graduated-tools
          ordering — and opens with an interstitial naming the
          lighter tools before anything can be signed. Proposing is a
          trusted-member power (useRemovalGate): a pending-trust
          viewer sees the gate card, a trusted viewer in a
          smaller-than-quorum circle sees the honest circle-short
          note — never the start affordance. */}
      {!isSelf && currentMember && publicKey && (
        <section className="card mb-4">
          {removalGate.kind !== "allowed" ? (
            <RemovalGateNotice gate={removalGate} />
          ) : !removalOpen ? (
            <button
              type="button"
              className="btn-ghost text-xs text-moss-600 dark:text-moss-300"
              onClick={() => setRemovalOpen(true)}
            >
              {t("removals.proposeButton")}
            </button>
          ) : (
            <RemovalCeremony
              recordKind="removal"
              subjectKey={publicKey}
              subjectName={member.displayName}
              onCancel={() => setRemovalOpen(false)}
            />
          )}
        </section>
      )}

      {!isSelf && currentMember && publicKey && (
        <>
          <BlockConfirmCard
            open={blockOpen}
            blockedKey={publicKey}
            blockedDisplayName={member.displayName}
            onClose={() => setBlockOpen(false)}
          />
          <UnblockConfirmDialog
            open={unblockOpen}
            blockedKey={publicKey}
            blockedDisplayName={member.displayName}
            onClose={() => setUnblockOpen(false)}
          />
        </>
      )}
    </div>
  );
}
