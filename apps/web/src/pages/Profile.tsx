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
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { IconSettings } from "@/components/visual";
import { balanceFor, transactionHistory } from "@/lib/timebank";
import { humanizeError } from "@/lib/humanizeError";
import { AchievementBadge } from "@/components/AchievementBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ContextualHint } from "@/components/ContextualHint";
import { InviteShareSheet } from "@/components/InviteShareSheet";
import { WhyTooltip } from "@/components/WhyTooltip";
import { EmptyState } from "@/components/EmptyState";
import {
  formatHours,
  formatRelativeTime,
  formatSignedHours,
  shortKey,
} from "@/lib/format";
import { updateMemberProfile } from "@/db/actions";
import type { InviteRow } from "@/db/database";
import { issueInvite } from "@/db/invites";
import { trustStatusWithInvites, vouchCountFor } from "@/lib/vouch";
import { MemberAvatar } from "@/components/MemberAvatar";
import { TrustChip } from "@/components/TrustChip";
import { CommunitySettingsSection } from "@/components/CommunitySettingsSection";
import { DisputesSection } from "@/components/DisputesSection";
import { ProposalsSection } from "@/components/ProposalsSection";
import { LearnSection } from "@/components/LearnSection";
import type {
  AchievementType,
  AvailabilityChip,
  FlagReason,
  Member,
} from "@/types";
import { AvailabilityChipPicker } from "@/components/AvailabilityChipPicker";

function flagReasonKey(reason: FlagReason | undefined): string {
  switch (reason) {
    case "short_duration":
      return "profile.history.flagShort";
    case "reciprocal_pattern":
      return "profile.history.flagReciprocal";
    case "daily_limit_warning":
      return "profile.history.flagDailyLimit";
    default:
      return "profile.history.flagDefault";
  }
}

export default function ProfilePage() {
  const {
    currentMember,
    members,
    exchanges,
    achievements,
    invites,
    vouches,
    nodeId,
    setCurrentMember,
  } = useApp();
  const { t } = useTranslation();

  if (!currentMember) return null;

  const trust = trustStatusWithInvites(currentMember.publicKey, {
    vouches,
    invites,
  });
  const trustCount = vouchCountFor(currentMember.publicKey, {
    vouches,
    invites,
  });
  const myInvites = invites.filter(
    (inv) => inv.inviterKey === currentMember.publicKey,
  );

  const balance = useMemo(
    () => balanceFor(currentMember, exchanges),
    [currentMember, exchanges],
  );
  const history = useMemo(
    () => transactionHistory(currentMember.publicKey, exchanges),
    [currentMember, exchanges],
  );
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m])),
    [members],
  );
  const myAchievements = useMemo(
    () =>
      achievements
        .filter((a) => a.memberKey === currentMember.publicKey)
        .sort((a, b) => b.earnedAt - a.earnedAt),
    [achievements, currentMember.publicKey],
  );

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="page-title">{t("profile.title")}</h1>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            {t("profile.identity", { key: shortKey(currentMember.publicKey) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrustChip status={trust} count={trustCount} />
          {/* Gear icon → device-local Settings (Language, Appearance,
              Community Node, Security, Data export). Emergency stays
              on Profile per the privacy-as-precondition principle. */}
          <Link
            to="/settings"
            aria-label={t("settings.openSettings")}
            className="touch-target inline-flex items-center justify-center rounded-full text-moss-700 hover:bg-moss-100 dark:text-moss-300 dark:hover:bg-moss-800"
          >
            <IconSettings size={20} />
          </Link>
        </div>
      </header>

      <BalanceCard balance={balance} seed={currentMember.seedBalance} />
      <ContextualHint
        settingKey="balanceHintDismissed"
        ariaLabel={t("hints.balance.label")}
        message={t("hints.balance.message")}
        technicalDetail={t("hints.balance.technical")}
      />

      <ProfileEditor member={currentMember} />

      <ContextualHint
        settingKey="inviteHintDismissed"
        ariaLabel={t("hints.invite.label")}
        message={t("hints.invite.message")}
        technicalDetail={t("hints.invite.technical")}
      />
      {/* Community-participation cluster. CSS columns at lg+ because
          the three cards have uneven heights — Invites can be tall
          (many tokens) or short (none); Roles earned grows with
          achievements; Exchange history grows with completed
          exchanges. Columns balance the fill so cards don't sit next
          to ragged empty space the way grid rows would.
          `[&>*]:break-inside-avoid` keeps each card whole. Below lg
          the columns classes are inert and each card's own `mb-4`
          provides the spacing. DOM order is preserved so tab and
          screen-reader navigation are unaffected by the column
          layout. After the Settings extraction this cluster is just
          the three "what you've done" surfaces — Data export moved
          to Settings, MemberSwitcher to page bottom. */}
      <div className="lg:columns-2 lg:gap-4 [&>*]:break-inside-avoid">
        <InvitesSection
          member={currentMember}
          nodeId={nodeId}
          invites={myInvites}
        />

        <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("profile.rolesEarned.title")}
          <WhyTooltip principleId="no-leaderboards" />
        </h2>
        {myAchievements.length === 0 ? (
          <EmptyState
            illustration="basket"
            variant="inset"
            message={t("profile.rolesEarned.empty")}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {myAchievements.map((a) => (
              <li key={a.id}>
                <AchievementBadge
                  type={a.achievementType as AchievementType}
                  earnedAt={a.earnedAt}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
          {t("profile.history.title")}
        </h2>
        {history.length === 0 ? (
          <EmptyState
            illustration="path"
            variant="inset"
            title={t("profile.history.emptyTitle")}
            message={t("profile.history.empty")}
            action={{ label: t("nav.board"), to: "/" }}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
            {history.map(({ exchange, delta, counterparty }) => {
              const other = memberMap.get(counterparty);
              return (
                <li
                  key={exchange.id}
                  className="flex items-center gap-3 py-3"
                >
                  <CategoryBadge category={exchange.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      {delta > 0
                        ? t("profile.history.helped")
                        : t("profile.history.received")}{" "}
                      <span className="font-medium">
                        {other?.displayName ?? t("common.memberFallback")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-moss-500">
                      <span>{formatRelativeTime(exchange.completedAt)}</span>
                      {exchange.flaggedForReview && (
                        <span
                          title={t(flagReasonKey(exchange.flagReason))}
                          className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        >
                          {t("profile.history.flag")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      delta > 0
                        ? "text-canopy-700 dark:text-canopy-300"
                        : "text-moss-600 dark:text-moss-300"
                    }`}
                  >
                    {formatSignedHours(delta)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      </div>

      {/* Community-governance cluster. CSS columns at lg+ for the
          same uneven-heights reason as the cluster above. After the
          Settings extraction this cluster holds Learn, Disputes,
          Proposals, and CommunitySettings — all community-level
          surfaces. (CommunitySettings is about community-level
          safeguard thresholds, not device preferences — the "Settings"
          in its name notwithstanding.) */}
      <div className="mt-6 lg:columns-2 lg:gap-4 [&>*]:break-inside-avoid">
        <LearnSection />

        <DisputesSection />

        <ProposalsSection />

        <CommunitySettingsSection />
      </div>

      {/* Emergency stays on Profile — NOT in Settings — per the
          privacy-as-precondition principle. Panic buttons need to
          stay reachable in a stress moment; burying them behind a
          Settings tap would weaken that affordance in exactly the
          moment it matters most. Standalone card after the
          governance cluster so it's the last thing the eye lands on
          before the dev MemberSwitcher below. */}
      <EmergencySection />

      {/* MemberSwitcher lives at the very end. It only renders when
          members.length > 1 — i.e., the dev "switch identity" tool
          shouldn't displace the production-relevant cards above. In
          single-identity setups (the production case) this is null
          and invisible; in multi-identity setups it sits below the
          last settings cluster where it doesn't interfere with the
          working area. */}
      <MemberSwitcher
        members={members}
        currentMember={currentMember}
        onSwitch={setCurrentMember}
      />
    </div>
  );
}

function EmergencySection() {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState<null | "soft" | "hard">(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirming) return;
    try {
      const { softPurge, hardPurge } = await import("@/lib/panic");
      const result =
        confirming === "soft" ? await softPurge() : await hardPurge();
      const ms = Math.round(result.durationMs);
      setStatus(
        result.mode === "soft"
          ? t("profile.emergency.completedSoft", { ms })
          : t("profile.emergency.completedHard", { ms }),
      );
      if (confirming === "hard") {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      setStatus(humanizeError(err));
    } finally {
      setConfirming(null);
    }
  }

  return (
    <>
      <section className="card border-rose-200 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
          {t("profile.emergency.title")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("profile.emergency.intro")}
        </p>
        <ul className="mb-4 space-y-3 text-sm">
          <li>{t("profile.emergency.softBullet")}</li>
          <li>{t("profile.emergency.hardBullet")}</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setConfirming("soft")}
          >
            {t("profile.emergency.softButton")}
          </button>
          <button
            type="button"
            className="btn bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => setConfirming("hard")}
          >
            {t("profile.emergency.hardButton")}
          </button>
        </div>
        {status && (
          <p
            role="status"
            className="mt-3 text-xs text-moss-600 dark:text-moss-300"
          >
            {status}
          </p>
        )}
      </section>
      <ConfirmDialog
        open={confirming === "soft"}
        tone="caution"
        title={t("profile.emergency.softTitle")}
        description={t("profile.emergency.softConfirmDescription")}
        confirmLabel={t("profile.emergency.softConfirm")}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
      <ConfirmDialog
        open={confirming === "hard"}
        tone="caution"
        title={t("profile.emergency.hardTitle")}
        description={t("profile.emergency.hardConfirmDescription")}
        confirmLabel={t("profile.emergency.hardConfirm")}
        onCancel={() => setConfirming(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

function BalanceCard({
  balance,
  seed,
}: {
  balance: number;
  seed: number;
}) {
  const { t } = useTranslation();
  const tone =
    balance > seed
      ? "surplus"
      : balance === seed
        ? "neutral"
        : "receiving";
  const messageKey = `profile.balance.${tone}`;
  return (
    <section className="card mb-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-moss-500">
            {t("profile.balance.label")}
            <WhyTooltip principleId="equal-time" />
          </div>
          <div className="mt-1 text-4xl font-bold text-canopy-700 dark:text-canopy-300">
            {formatHours(balance)}
          </div>
        </div>
        <div className="text-right text-xs text-moss-500">
          <div>
            {t("profile.balance.seed", { hours: formatHours(seed) })}
            <WhyTooltip principleId="asking-never-gated" />
          </div>
          <div>{t("profile.balance.footerNote")}</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-moss-600 dark:text-moss-300">
        {t(messageKey)}
      </p>
    </section>
  );
}

function ProfileEditor({ member }: { member: Member }) {
  const { t } = useTranslation();
  const [name, setName] = useState(member.displayName);
  const [skills, setSkills] = useState(member.skills.join(", "));
  const [availability, setAvailability] = useState(member.availability);
  const [availabilityChips, setAvailabilityChips] = useState<
    AvailabilityChip[]
  >(member.availabilityChips);
  const [zone, setZone] = useState(member.locationZone);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMemberProfile(member.publicKey, {
        displayName: name.trim() || member.displayName,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        availability: availability.trim(),
        availabilityChips,
        locationZone: zone.trim(),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.about.title")}
      </h2>
      {/* 2-pane at lg+: identity column on the left (280px), form on
          the right (capped at max-w-2xl). Mobile falls through to the
          single-column stack — identity centered above the form,
          matching pre-reflow exactly. DOM order is identity → divider
          → form so screen-reader and tab order follow the mobile
          reading order regardless of the lg+ visual placement. The
          divider hides at lg+; the column gap (lg:gap-8) provides
          the visual separation between identity and form. */}
      <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* `[&>svg]:lg:size-24` shrinks the avatar's SVG from 128px
            to 96px at lg+ via CSS — the SVG's intrinsic width/height
            attributes have very low specificity so CSS wins. The
            avatar is identity-statement on mobile (centered, large)
            and a utility element on desktop (left-aligned, smaller);
            Member Detail is where the avatar gets the ceremonial
            full-size treatment. */}
        <div className="my-4 flex flex-col items-center gap-2 text-center lg:my-0 lg:items-start lg:text-left [&>svg]:lg:size-24">
          <MemberAvatar publicKey={member.publicKey} size={128} framed />
          <p className="text-title font-semibold">{member.displayName}</p>
          <p className="font-mono text-xs text-moss-500">
            {shortKey(member.publicKey)}
          </p>
          <p className="mt-2 max-w-sm text-xs text-moss-600 dark:text-moss-300">
            {t("profile.about.avatarNote")}
            <WhyTooltip principleId="privacy-precondition" />
          </p>
        </div>
        <div className="my-4 border-t border-bark-200/60 dark:border-moss-800 lg:hidden" />
        <form
          className="flex flex-col gap-3 lg:max-w-2xl"
          onSubmit={handleSave}
        >
          {/* Display name + Area pair side-by-side at md+ — both are
              short single-line inputs and conceptually related (who /
              where). Skills stays full-width because members often
              type 50+ chars; the availability subsection stays
              full-width because its chip picker wraps. */}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{t("profile.about.name")}</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{t("profile.about.area")}</span>
              <input
                className="input"
                placeholder={t("profile.about.areaPlaceholder")}
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">{t("profile.about.skills")}</span>
            <input
              className="input"
              placeholder={t("profile.about.skillsPlaceholder")}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </label>
          <div className="flex flex-col gap-2 text-sm">
            <div>
              <div className="text-base font-semibold">
                {t("profile.about.availabilityHeading")}
              </div>
              <div className="text-xs text-moss-600 dark:text-moss-300">
                {t("profile.about.availabilitySubhead")}
              </div>
            </div>
            <AvailabilityChipPicker
              value={availabilityChips}
              onChange={setAvailabilityChips}
            />
            <label className="flex flex-col gap-1">
              <span className="font-medium">
                {t("profile.about.availabilityNotesLabel")}
              </span>
              <input
                className="input"
                placeholder={t("profile.about.availabilityPlaceholder")}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </button>
            {savedAt && (
              <span className="text-xs text-canopy-700 dark:text-canopy-300">
                {t("common.savedAt", { when: formatRelativeTime(savedAt) })}
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function MemberSwitcher({
  members,
  currentMember,
  onSwitch,
}: {
  members: Member[];
  currentMember: Member;
  onSwitch: (publicKey: string) => void;
}) {
  const { t } = useTranslation();
  if (members.length <= 1) return null;
  return (
    <section className="card mb-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.memberSwitcher.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-500">
        {t("profile.memberSwitcher.note")}
      </p>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.publicKey}>
            <button
              type="button"
              onClick={() => onSwitch(m.publicKey)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                m.publicKey === currentMember.publicKey
                  ? "border-canopy-600 bg-canopy-50 text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100"
                  : "border-moss-200 hover:bg-moss-50 dark:border-moss-800 dark:hover:bg-moss-900"
              }`}
            >
              <div className="font-medium">{m.displayName}</div>
              <div className="text-xs text-moss-500">
                {shortKey(m.publicKey)} ·{" "}
                {m.locationZone || t("profile.memberSwitcher.noAreaSet")}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
function InvitesSection({
  member,
  nodeId,
  invites,
}: {
  member: Member;
  nodeId: string;
  invites: InviteRow[];
}) {
  const { t } = useTranslation();
  const [issuing, setIssuing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  // Inline link starts redacted by default. Anyone in camera view —
  // including security cams, webcams, and onlookers on a wide
  // desktop monitor — can read the URL right off the screen. The
  // InviteShareSheet modal has its own "look around" gate; this
  // mirrors that gate for the inline display so the secret never
  // surfaces without an explicit member action. Reset on each fresh
  // invite (a member's surroundings can change between two share
  // sessions on the same device — same pattern as InviteShareSheet's
  // gate effect at line 86-93).
  const [linkRevealed, setLinkRevealed] = useState(false);
  useEffect(() => {
    if (shareUrl) setLinkRevealed(false);
  }, [shareUrl]);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleIssue() {
    setError(null);
    setIssuing(true);
    try {
      const { shareUrl: url } = await issueInvite({
        inviterKey: member.publicKey,
        inviterName: member.displayName,
        // The post-issuance UX opens the share sheet right away so
        // the QR is visible the moment the invite exists — that's
        // when a member is most likely to want to hand it off in
        // person.
        nodeId,
      });
      setShareUrl(url);
      setShareSheetOpen(true);
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setIssuing(false);
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus(t("common.copied"));
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(t("common.copyFailed"));
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-500">
        {t("profile.invites.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.invites.intro")}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={handleIssue}
          disabled={issuing}
        >
          {issuing
            ? t("profile.invites.generating")
            : t("profile.invites.generate")}
        </button>
      </div>

      {shareUrl && (
        <div className="mt-3 rounded-xl border border-canopy-200 bg-canopy-50 p-3 dark:border-canopy-900/50 dark:bg-canopy-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-canopy-800 dark:text-canopy-200">
            {t("profile.invites.shareTitle")}
          </p>
          <code
            className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs dark:bg-moss-900"
            aria-live="polite"
          >
            {linkRevealed ? shareUrl : t("profile.invites.shareLinkHidden")}
          </code>
          {linkRevealed && (
            <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
              {t("profile.invites.revealedHint")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => handleCopy(shareUrl)}
            >
              {t("common.copy")}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              aria-pressed={linkRevealed}
              onClick={() => setLinkRevealed((v) => !v)}
            >
              {linkRevealed
                ? t("profile.invites.hideLink")
                : t("profile.invites.revealLink")}
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => setShareSheetOpen(true)}
            >
              {t("profile.invites.showShareSheet")}
            </button>
            {copyStatus && (
              <span className="text-canopy-800 dark:text-canopy-200">
                {copyStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {t("profile.invites.shareNote")}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      {/* Compact summary in place of the historical list — the list
          itself lives at /invites. Non-zero status counts only, so a
          member with just open invites sees "3 open · Manage all →"
          rather than padded "0" labels. When the member has no
          invites yet, the summary doesn't render at all; the Generate
          button + intro carry the section. */}
      {invites.length > 0 && (
        <InvitesSummaryLine invites={invites} />
      )}

      <InviteShareSheet
        open={shareSheetOpen && shareUrl !== null}
        url={shareUrl ?? ""}
        shareTitle={t("profile.invites.shareSheet.shareTitle")}
        shareText={t("profile.invites.shareSheet.shareText")}
        onClose={() => setShareSheetOpen(false)}
      />
    </section>
  );
}

// One-line summary of the member's issued invites, rendered below the
// Generate flow on Profile. Counts each status that's > 0 (e.g.
// "3 open · 2 redeemed · 1 expired") and trails a "Manage all →" link
// to the dedicated /invites page where the full sorted list lives.
function InvitesSummaryLine({ invites }: { invites: InviteRow[] }) {
  const { t } = useTranslation();
  const counts = useMemo(() => {
    const c = { open: 0, redeemed: 0, revoked: 0, expired: 0 };
    for (const inv of invites) c[inv.status] += 1;
    return c;
  }, [invites]);
  // Order matches the /invites page sort tier: open first, then
  // redeemed, revoked, expired. Members read the most actionable
  // bucket first.
  const parts: string[] = [];
  if (counts.open > 0)
    parts.push(t("profile.invites.summary.open", { count: counts.open }));
  if (counts.redeemed > 0)
    parts.push(
      t("profile.invites.summary.redeemed", { count: counts.redeemed }),
    );
  if (counts.revoked > 0)
    parts.push(
      t("profile.invites.summary.revoked", { count: counts.revoked }),
    );
  if (counts.expired > 0)
    parts.push(
      t("profile.invites.summary.expired", { count: counts.expired }),
    );
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-moss-600 dark:text-moss-300">
      <span>{parts.join(" · ")}</span>
      <Link
        to="/invites"
        className="text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
      >
        {t("profile.invites.summary.manageAll")}
      </Link>
    </p>
  );
}
