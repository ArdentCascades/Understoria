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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { IconSettings } from "@/components/visual";
import {
  balanceFor,
  pendingBalanceFor,
  pendingTaskCreditFor,
  projectConfirmationOutflow,
  transactionHistory,
} from "@/lib/timebank";
import type {
  PendingBalance,
  PendingEntry,
  PendingTaskCredit,
  PendingTaskEntry,
  TransactionEntry,
} from "@/lib/timebank";
import { humanizeError } from "@/lib/humanizeError";
import { clampNewestFirst } from "@/lib/historyClamp";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { myClaimedTasks } from "@/lib/myTasks";
import { MyTasksSummary } from "@/pages/MyTasks";
import { myOrganizedProjects } from "@/lib/myProjects";
import { MyProjectsSummary } from "@/pages/MyProjects";
import { AchievementBadge } from "@/components/AchievementBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ContextualHint } from "@/components/ContextualHint";
import { InviteShareSheet } from "@/components/InviteShareSheet";
import { copyTextToClipboard } from "@/lib/share";
import { WhyTooltip } from "@/components/WhyTooltip";
import { IdentityKey } from "@/components/IdentityKey";
import { EmptyState } from "@/components/EmptyState";
import {
  formatDeadline,
  formatHours,
  formatRelativeTime,
  formatSignedHours,
  shortKey,
} from "@/lib/format";
import {
  disputeDirectExchange,
  disputeExchange,
  updateMemberProfile,
} from "@/db/actions";
import { isDirectExchangeLabel } from "@understoria/shared/crypto";
import { SETTING_KEYS, type InviteRow } from "@/db/database";
import { issueInvite } from "@/db/invites";
import {
  isFounderRoot,
  trustStatusWithInvites,
  vouchCountFor,
} from "@/lib/vouch";
import { MemberAvatar } from "@/components/MemberAvatar";
import { FounderChip, TrustChip } from "@/components/TrustChip";
import { DisputesSection } from "@/components/DisputesSection";
import { ProposalsSection } from "@/components/ProposalsSection";
import { LearnSection } from "@/components/LearnSection";
import { PairingLogSection } from "@/components/PairingLogSection";
import type {
  Achievement,
  AchievementType,
  AvailabilityChip,
  FlagReason,
  Member,
  Post,
  Project,
  ProjectTask,
} from "@/types";
import { AvailabilityChipPicker } from "@/components/AvailabilityChipPicker";

/**
 * The dispute doorway on a ledger row. Originally built for DIRECT
 * exchanges (no post page to host "Something's wrong — flag it");
 * round 3 found the same dead end for POST-BACKED exchanges — the
 * history row named the exchange but offered no way to flag it, and
 * the member had to rediscover the post page. One shared component
 * now hosts both: same ConfirmDialog ceremony, same trigger chip;
 * the caller supplies the dialog copy and the action (`disputeDirect
 * Exchange` for direct rows, `disputeExchange` for post rows). On
 * confirm the dispute proposal lands on the Disputes surface, and
 * this button's slot becomes the amber in-review link on the next
 * live-query render.
 */
function ExchangeFlagButton({
  title,
  body,
  confirmLabel,
  onFlag,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onFlag: () => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        className="chip bg-moss-100 text-moss-700 hover:bg-moss-200 dark:bg-moss-800 dark:text-moss-200 dark:hover:bg-moss-700"
        onClick={() => setOpen(true)}
      >
        {t("profile.history.directFlag")}
      </button>
      {error && (
        <span role="alert" className="text-rose-700 dark:text-rose-300">
          {error}
        </span>
      )}
      <ConfirmDialog
        open={open}
        title={title}
        description={body}
        confirmLabel={confirmLabel}
        cancelLabel={t("common.cancel")}
        tone="caution"
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          try {
            await onFlag();
            setError(null);
          } catch (e) {
            setError(humanizeError(e));
          } finally {
            setOpen(false);
          }
        }}
      />
    </>
  );
}

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

/**
 * An exchange whose credit is still in motion — one signature on
 * file, one to go. Distinguished from settled rows by a text badge
 * plus italic/muted styling (never color alone). When the viewer is
 * the one who still owes the confirmation, the whole row links to
 * the post detail page, which is where confirming happens.
 */
function PendingHistoryRow({
  entry,
  counterpartyName,
}: {
  entry: PendingEntry;
  counterpartyName: string;
}) {
  const { t } = useTranslation();
  const awaitingYou = entry.owedBy === "you";
  const body = (
    <>
      <CategoryBadge category={entry.category} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm italic text-moss-600 dark:text-moss-300">
          {/* Non-past phrasing on purpose: nothing has been confirmed
              yet, so "Helped" would claim a thing that hasn't happened
              (honesty over symmetry with the settled rows below). */}
          {entry.delta > 0
            ? t("profile.history.helpedPending")
            : t("profile.history.receivedPending")}{" "}
          <span className="font-medium">{counterpartyName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-moss-600 dark:text-moss-300">
          {/* The waiting-state timestamp, not the post's age — a post
              can sit on the board for days before anyone claims it.
              Legacy rows without one show no time at all rather than
              a misleading one. */}
          {entry.pendingSince !== null && (
            <span>{formatRelativeTime(entry.pendingSince)}</span>
          )}
          <span className="chip bg-moss-100 italic text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {awaitingYou
              ? t("profile.history.awaitingYouBadge")
              : t("profile.history.pendingBadge")}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium italic text-moss-600 dark:text-moss-300">
        {formatSignedHours(entry.delta)}
      </span>
    </>
  );
  return (
    <li className="py-3">
      {awaitingYou ? (
        <Link
          to={`/post/${entry.postId}`}
          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-3">{body}</div>
      )}
    </li>
  );
}

/**
 * A project task the member has submitted and is awaiting an
 * organizer's confirmation. Mirrors `PendingHistoryRow`'s muted /
 * italic treatment + text-badge marker. Always links to the project
 * page — the only recourse for a stalled confirmation is to nudge in
 * the existing project surface (pull, not push), so no new
 * notification surface ships with this row.
 */
function PendingTaskHistoryRow({
  entry,
  taskTitle,
  projectTitle,
}: {
  entry: PendingTaskEntry;
  taskTitle: string;
  projectTitle: string;
}) {
  const { t } = useTranslation();
  return (
    <li className="py-3">
      <Link
        to={`/project/${entry.projectId}`}
        className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <CategoryBadge category={entry.category} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm italic text-moss-600 dark:text-moss-300">
            {t("profile.history.taskWorkingOn")}{" "}
            <span className="font-medium">
              {t("profile.history.taskRow", { taskTitle, projectTitle })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-moss-600 dark:text-moss-300">
            {/* When the member submitted the task for confirmation —
                not the task's creation date, which predates their
                involvement entirely. Legacy rows without a completedAt
                show no time rather than a misleading one. */}
            {entry.pendingSince !== null && (
              <span>{formatRelativeTime(entry.pendingSince)}</span>
            )}
            <span className="chip bg-moss-100 italic text-moss-700 dark:bg-moss-800 dark:text-moss-200">
              {t("profile.history.pendingBadge")}
            </span>
          </div>
        </div>
        <span className="text-sm font-medium italic text-moss-600 dark:text-moss-300">
          {formatSignedHours(entry.delta)}
        </span>
      </Link>
    </li>
  );
}

export default function ProfilePage() {
  const { currentMember } = useApp();
  // Gate here so the authenticated body's ~13 hooks live in a child
  // that only mounts with a non-null member. Placing those hooks after
  // an early return in THIS component crashed the app on a cold load /
  // deep link to /profile: `currentMember` is null on the first render
  // (the members live-query + current-member setting resolve async),
  // non-null a tick later, and the changing hook count between those
  // renders throws "rendered more hooks than during the previous
  // render". The child receives a non-null member as a prop, so its
  // hook order is stable from its first render.
  if (!currentMember) return null;
  return <ProfileBody member={currentMember} />;
}

function ProfileBody({ member }: { member: Member }) {
  // Shim so the existing `currentMember` references below read from the
  // non-null prop without a file-wide rename.
  const currentMember = member;
  const {
    members,
    exchanges,
    posts,
    projects,
    projectTasks,
    achievements,
    invites,
    vouches,
    nodeId,
    nodeConfig,
    blockedKeys,
    proposals,
    setCurrentMember,
    founderRoots,
  } = useApp();
  const { t } = useTranslation();
  // `/profile?edit=1` (the Board profile-nudge CTA) means "take me to
  // the editor", not just "take me to the page" — ProfileEditor
  // scrolls into view and focuses its first field. The param is
  // stripped after handling (history.replace) so back/refresh don't
  // replay the scroll.
  const [searchParams, setSearchParams] = useSearchParams();
  const editRequested = searchParams.get("edit") === "1";
  const clearEditParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("edit");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  // The full-key disclosure below the header. Closed by default —
  // the 44-char key is noise on every ordinary visit — but one tap
  // away, because it's the value operator runbooks actually need
  // (NODE_FOUNDER_KEYS bootstrap, mirror trust settings) and no
  // other surface in the app shows it untruncated.
  const [fullKeyOpen, setFullKeyOpen] = useState(false);

  const trust = trustStatusWithInvites(currentMember.publicKey, {
    vouches,
    invites,
    founderRoots,
  });
  const trustCount = vouchCountFor(currentMember.publicKey, {
    vouches,
    invites,
  });
  const isFounder = isFounderRoot(currentMember.publicKey, { founderRoots });
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
  // Credit "in motion" — exchanges where one signature is still
  // missing. Display honesty only: balanceFor never counts these
  // (an Exchange row doesn't exist until both sides sign), so the
  // breakdown explains the gap without changing the credit model.
  const pending = useMemo(
    () => pendingBalanceFor(currentMember.publicKey, posts),
    [currentMember, posts],
  );
  // Pending credit for project tasks the member has submitted —
  // claimer side only. The HELPED side of a task exchange is
  // indeterminate before confirmation (any organizer may sign), so
  // PR #221's exclusion of helped-side post pending still stands.
  // The CLAIMER side is fully determinate (their key on `assignedTo`,
  // their `task.estimatedHours` — exactly the figure
  // `confirmProjectTaskCompletion` writes onto the Exchange row), so
  // hiding it created an asymmetry the member could only resolve by
  // checking each project page. See `pendingTaskCreditFor` for why.
  const pendingTask = useMemo(
    () => pendingTaskCreditFor(currentMember.publicKey, projectTasks),
    [currentMember, projectTasks],
  );
  // Active commitments across all projects — feeds the small
  // "Tasks you're carrying" jump-off card below. Hidden entirely at
  // zero (same posture as AttentionSection: an empty list must never
  // read as "you're not doing enough").
  const carrying = useMemo(
    () => myClaimedTasks(currentMember.publicKey, projectTasks, projects),
    [currentMember, projectTasks, projects],
  );
  // Organizer-side twin of `carrying` — the projects in this member's
  // care, feeding the "Projects you organize" jump-off card below.
  // `projectCount` is the only field the card reads, and it depends on
  // projects / tasks / blockedKeys only (the co-organizer invitation
  // rows affect `pendingInviteCount`, which lives on the My work
  // tab), so we pass the lean slice here and let the page hydrate
  // the rest.
  const organizing = useMemo(
    () =>
      myOrganizedProjects({
        memberKey: currentMember.publicKey,
        projects,
        projectTasks,
        blockedKeys,
      }),
    [currentMember, projects, projectTasks, blockedKeys],
  );
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );
  // Hours that left this member's balance by confirming project tasks
  // (they sign as the helped party). On a busy project this can be the
  // whole reason a balance sits below seed — naming it stops the number
  // reading as personal over-consumption (solidarity-not-shame). The
  // helper stays title-free; we resolve the largest project's name here,
  // falling back quietly when its row isn't on this device.
  const outflow = useMemo(
    () => projectConfirmationOutflow(currentMember.publicKey, exchanges),
    [currentMember, exchanges],
  );
  const projectOutflow = useMemo(() => {
    const top = outflow.perProject[0];
    return {
      hours: outflow.totalHours,
      primaryTitle: top
        ? (projectMap.get(top.projectId)?.title ??
          t("profile.balance.projectOutflowUnknownProject"))
        : "",
      moreCount: Math.max(0, outflow.perProject.length - 1),
    };
  }, [outflow, projectMap, t]);
  const taskMap = useMemo(
    () => new Map(projectTasks.map((t) => [t.id, t])),
    [projectTasks],
  );
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m])),
    [members],
  );
  // Post lookup for the history rows' flag doorway — a settled row
  // can only be flagged while its post is still `completed` (the
  // dispute action's own gate), so the section needs each post's
  // live status.
  const postById = useMemo(
    () => new Map(posts.map((p) => [p.id, p])),
    [posts],
  );
  const myAchievements = useMemo(
    () =>
      achievements
        .filter((a) => a.memberKey === currentMember.publicKey)
        .sort((a, b) => b.earnedAt - a.earnedAt),
    [achievements, currentMember.publicKey],
  );
  // Flagged-exchange chip → dispute context. When a flagged exchange's
  // post has a dispute proposal on file, the amber chip deep-links to
  // that card via the `id={d.id}` anchors the /disputes list renders
  // (PR #232's PostDetail lookup, same shape: match on `disputePostId`,
  // most recent row wins — it's the live conversation). No match →
  // plain /disputes; the link never breaks.
  const disputeIdByPostId = useMemo(() => {
    const map = new Map<string, string>();
    const rows = proposals
      .filter((p) => p.kind === "dispute" && p.disputePostId)
      .sort((a, b) => a.createdAt - b.createdAt);
    // Ascending sort + overwrite ⇒ the most recent proposal wins.
    for (const p of rows) map.set(p.disputePostId as string, p.id);
    return map;
  }, [proposals]);

  return (
    <div className="px-4 pb-8 pt-4">
      {/* 2-pane layout at lg+ — the identity glance (header, balance
          + its hint, Roles earned) docks in a 320px right sidebar
          that sticks to the viewport; the main reading column hosts
          the high-volume scrollable sections (history →
          participation → editor → index → CommunitySettings →
          PairingLog → Emergency → dev MemberSwitcher). Below lg the
          `lg:*` classes are inert and the grid collapses to
          single-column DOM order. Roles earned renders at TWO sites
          — `hidden lg:block` in the rail here, `lg:hidden` after the
          participation cluster — so the mobile stack keeps roles
          between Invites and the editor. Two render sites, never CSS
          `order`, so mobile DOM order matches mobile visual order
          (WCAG 2.4.3 — same pattern as ProjectDetail.tsx's rail and
          Board.tsx's filter rails; see Profile.reflow.test.tsx).

          The sidebar `aside` is its own scroll context at lg+ so an
          overflowing rail never pushes the ledger off-screen. The
          main column's min-w-0 lets long history rows wrap rather
          than blow out the grid width. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
        <aside
          aria-label={t("profile.sidebarAriaLabel")}
          className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
        >
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2 landscape-short:mb-2">
            <div>
              <h1 className="page-title">{t("profile.title")}</h1>
              {/* Canonical identity spot — the key stays visible, and
                  tapping the line explains what the code is
                  (IdentityKey.tsx). */}
              <p className="text-xs text-moss-600 dark:text-moss-300">
                <IdentityKey
                  publicKey={currentMember.publicKey}
                  name={currentMember.displayName}
                  isYou
                  alwaysShown
                >
                  {t("profile.identity", {
                    key: shortKey(currentMember.publicKey),
                  })}
                </IdentityKey>
              </p>
              <button
                type="button"
                className="text-xs text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                aria-expanded={fullKeyOpen}
                onClick={() => setFullKeyOpen((v) => !v)}
              >
                {fullKeyOpen
                  ? t("profile.fullKey.hide")
                  : t("profile.fullKey.show")}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* A founder with zero vouchers is trusted by
                  construction — showing "Trusted (0 vouches)" would
                  read as a glitch, so the count appears only once
                  real vouchers exist. The FounderChip says why the
                  status is trusted regardless. */}
              <TrustChip
                status={trust}
                count={isFounder && trustCount === 0 ? undefined : trustCount}
              />
              {isFounder && <FounderChip />}
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

          {fullKeyOpen && (
            <FullKeyPanel publicKey={currentMember.publicKey} />
          )}

          <BalanceCard
            balance={balance}
            seed={currentMember.seedBalance}
            pending={pending}
            pendingTask={pendingTask}
            projectOutflow={projectOutflow}
            autoConfirmHours={nodeConfig.autoConfirmHours}
          />
          <ContextualHint
            settingKey={SETTING_KEYS.balanceHintDismissed}
            ariaLabel={t("hints.balance.label")}
            message={t("hints.balance.message")}
            learnMoreTo="/help#what-is-balance"
            learnMoreLabel={t("hints.balance.learnMoreLabel")}
          />

          {/* Desktop copy of Roles earned — on mobile this copy is hidden
              and the SAME section re-renders between the participation
              cluster and the editor (see the `lg:hidden` copy in the main
              column), so a phone visitor reads it in stack order. Two
              render sites, never CSS `order` (WCAG 2.4.3). */}
          <div className="hidden lg:block">
            <RolesEarnedSection achievements={myAchievements} />
          </div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-1 lg:min-w-0">

          {/* Exchange history is promoted to sit directly under the
              balance it itemizes — the every-visit pair (the number and
              the ledger behind it) stays within one screen instead of
              3–4 swipes apart. The About editor, touched rarely after
              first setup, now lives below the participation rows rather
              than between balance and history. */}
          <ExchangeHistorySection
            history={history}
            pending={pending}
            pendingTask={pendingTask}
            memberMap={memberMap}
            taskMap={taskMap}
            projectMap={projectMap}
            postById={postById}
            disputeIdByPostId={disputeIdByPostId}
            meKey={currentMember.publicKey}
          />

          {/* Community-participation cluster — the "what you're doing"
              surfaces: a conditional tasks-you're-carrying jump-off plus
              the organizer twin and Invites. A plain stack at every
              breakpoint (each card's own `mb-4` provides the spacing) —
              the old lg:columns-2 CSS-column packing is superseded by
              the rail grid above, which already narrows this column.
              Exchange history moved up beside the balance it explains;
              data export lives in Settings, MemberSwitcher at the page
              bottom. */}
          <div>
            {/* Cross-project commitments jump-off. Rendered only when the
                member is actually carrying something — at zero the card
                disappears rather than display an empty obligation. The
                full inventory lives on the My work tab; this card is the
                Profile-side door to its tasks section. */}
            {carrying.taskCount > 0 && (
              <section className="card mb-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("myTasks.title")}
                </h2>
                <p className="text-sm text-moss-700 dark:text-moss-200">
                  <MyTasksSummary
                    taskCount={carrying.taskCount}
                    projectCount={carrying.projectCount}
                  />
                </p>
                <Link
                  to="/my-work#tasks"
                  className="mt-2 inline-block text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("myTasks.seeAll")}
                </Link>
              </section>
            )}
            {/* Organizer-side jump-off, same posture as the carrying card:
                shown only when the member actually stewards something, so an
                empty list never reads as "you should be organizing more".
                The full workbench is the My work tab's projects
                section. */}
            {organizing.projectCount > 0 && (
              <section className="card mb-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
                  {t("myProjects.title")}
                </h2>
                <p className="text-sm text-moss-700 dark:text-moss-200">
                  <MyProjectsSummary projectCount={organizing.projectCount} />
                </p>
                <Link
                  to="/my-work#projects"
                  className="mt-2 inline-block text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
                >
                  {t("myProjects.seeAll")}
                </Link>
              </section>
            )}
            <InvitesSection
              member={currentMember}
              nodeId={nodeId}
              invites={myInvites}
            />

            {/* The invite hint sits adjacent to the Invites card it
                explains — it used to float above the whole cluster,
                several cards away from the Generate button it talks
                about. */}
            <ContextualHint
              settingKey={SETTING_KEYS.inviteHintDismissed}
              ariaLabel={t("hints.invite.label")}
              message={t("hints.invite.message")}
              learnMoreTo="/help#invite-someone"
              learnMoreLabel={t("hints.invite.learnMoreLabel")}
            />

            {/* Mobile copy of Roles earned — the desktop copy lives in
                the rail (`hidden lg:block`); this one is `lg:hidden` so
                the mobile stack reads Invites → Roles → editor in DOM
                exactly where it appears visually. No CSS `order`
                (WCAG 2.4.3). */}
            <div className="lg:hidden">
              <RolesEarnedSection achievements={myAchievements} />
            </div>
          </div>

          {/* About editor — touched rarely after first setup, so it sits
              below the every-visit surfaces (balance, history,
              participation) instead of between balance and history.
              `/profile?edit=1` (the Board profile-nudge CTA) still lands
              here: the editor scrolls itself into view via its own
              section ref, so its stack position is free to change. */}
          <ProfileEditor
            member={currentMember}
            focusOnMount={editRequested}
            onFocusHandled={clearEditParam}
          />

          {/* "Community & account" index — one compact section of labeled
              rows replacing the five standalone cards that used to sprawl
              here (Learn, Disputes, Proposals, the Settings row, Add
              device). Rare-need surfaces index into a row each; the
              every-visit surfaces live above. Disputes and Proposals keep
              their open counts (attention-on-open, not a notification).
              CommunitySettings stays OUT of the index as its own card
              below — it's about community-level safeguard thresholds, not
              device preferences (the "Settings" in its name
              notwithstanding), and the community-authority principle
              wants it on the page in its own right. */}
          <section
            className="card mb-4 mt-6"
            aria-labelledby="profile-communityAccount-title"
          >
            <h2
              id="profile-communityAccount-title"
              className="mb-1 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
            >
              {t("profile.communityAccount.title")}
            </h2>
            <div className="divide-y divide-moss-100 dark:divide-moss-800">
              <LearnSection />

              <DisputesSection />

              <ProposalsSection />

              {/* Labeled doorway to device-local Settings — discoverable
                  by reading, not just by recognizing the header gear
                  (which stays, for muscle memory). */}
              <SettingsRowSection />

              {/* AddDevice ships in the device-pairing series (design
                  note: docs/device-pairing.md). Its entry point is an
                  index row whose disclosure keeps one deliberate step
                  before the sensitive pairing flow — pairing a device is
                  weightier than sharing an invite. The paired-device
                  inventory (PairingLogSection) is what keeps the
                  Emergency adjacency now: its only remediation path IS
                  Emergency → Hard purge. */}
              <AddDeviceSection />
            </div>
          </section>

          {/* Community thresholds moved to Settings → "How this
              community is run" (one home for the node config, presented
              read-only-first with the bootstrap editor beneath). It no
              longer lives here. */}

          {/* Paired-device inventory. Renders null until the member has
              completed at least one pair from this device (as source or
              destination), so the section is invisible on a fresh
              install and grows in over time. Placed directly before
              Emergency (AddDevice moved into the index above; this
              section keeps the adjacency alone) because the inventory's
              only remediation path IS Emergency → Hard purge (Ed25519
              has no revocation primitive). See `docs/device-pairing.md`
              §9.x. */}
          <PairingLogSection />

          {/* Emergency stays on Profile — NOT in Settings, and NEVER
              inside the index or any disclosure — per the
              privacy-as-precondition principle. Panic buttons need to
              stay reachable in a stress moment; burying them behind a
              Settings tap or a collapsed row would weaken that
              affordance in exactly the moment it matters most.
              Standalone top-level card after the index and
              CommunitySettings so it's the last thing the eye lands on
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
      </div>
    </div>
  );
}

// The member's own roles/achievements list. Own-page stats are
// explicitly allowed (operator ruling) — the no-leaderboards
// principle forbids COMPARABLE stats, and this list never renders
// anyone else's.
function RolesEarnedSection({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const { t } = useTranslation();
  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.rolesEarned.title")}
        <WhyTooltip principleId="no-leaderboards" />
      </h2>
      {achievements.length === 0 ? (
        <EmptyState
          illustration="basket"
          variant="inset"
          message={t("profile.rolesEarned.empty")}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {achievements.map((a) => (
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
  );
}

// The member's exchange ledger — in-motion entries first, then
// settled rows newest-first (transactionHistory's order). Extracted
// from the page body so the stack reorder (history now sits directly
// under the balance) keeps the page component readable.
//
// The settled list is clamped to its newest HISTORY_CLAMP_VISIBLE
// rows behind a "Show N older exchanges" toggle (the announcements /
// task-comments house pattern). Clamping happens HERE, at the render
// layer — `transactionHistory` stays unbounded because the full
// signed ledger is the member's auditable record. In-motion entries
// never clamp: they're few, they're the most recent activity, and
// the awaiting-you rows are actionable.
function ExchangeHistorySection({
  history,
  pending,
  pendingTask,
  memberMap,
  taskMap,
  projectMap,
  postById,
  disputeIdByPostId,
  meKey,
}: {
  history: TransactionEntry[];
  pending: PendingBalance;
  pendingTask: PendingTaskCredit;
  memberMap: Map<string, Member>;
  taskMap: Map<string, ProjectTask>;
  projectMap: Map<string, Project>;
  postById: Map<string, Post>;
  disputeIdByPostId: Map<string, string>;
  meKey: string;
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const { visible: visibleHistory, hiddenCount } = clampNewestFirst(
    history,
    showAll,
  );
  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.history.title")}
      </h2>
      {history.length === 0 &&
      pending.entries.length === 0 &&
      pendingTask.entries.length === 0 ? (
        <EmptyState
          illustration="path"
          variant="inset"
          title={t("profile.history.emptyTitle")}
          message={t("profile.history.empty")}
          action={{ label: t("nav.board"), to: "/" }}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
          {/* In-motion entries first — they're the most recent
              activity and the credit column explains the gap
              between the list and the balance above. Distinguished
              by a text badge plus muted/italic treatment, never by
              color alone. */}
          {pending.entries.map((entry) => (
            <PendingHistoryRow
              key={entry.postId}
              entry={entry}
              counterpartyName={
                memberMap.get(entry.counterparty)?.displayName ??
                t("common.memberFallback")
              }
            />
          ))}
          {/* Project-task pending — claimer-side incoming credit
              only. The row links to the project page so a claimer
              can nudge a stalled confirmation in-place (pull
              recourse, no new notification surface). Helped-side
              task pending is deliberately omitted per PR #221's
              "indeterminate before confirmation" reasoning. */}
          {pendingTask.entries.map((entry) => {
            const task = taskMap.get(entry.taskId);
            const project = projectMap.get(entry.projectId);
            return (
              <PendingTaskHistoryRow
                key={entry.taskId}
                entry={entry}
                taskTitle={task?.title ?? ""}
                projectTitle={
                  project?.title ?? t("common.memberFallback")
                }
              />
            );
          })}
          {visibleHistory.map(({ exchange, delta, counterparty }) => {
            const other = memberMap.get(counterparty);
            const isDirect = isDirectExchangeLabel(exchange.postId);
            // Round-3 papercut: post-backed rows offered no flag
            // doorway — only direct rows did. A settled post-backed
            // exchange (post still completed, not yet disputed) now
            // carries the same "something's wrong?" chip, reusing
            // the post flow's dispute action + dialog copy. A
            // post-backed row whose post has moved to disputed gets
            // the amber in-review link instead (unless the
            // flaggedForReview chip below already provides it).
            const post = isDirect
              ? null
              : postById.get(exchange.postId) ?? null;
            const canFlagPost = post?.status === "completed";
            const postInReview =
              post?.status === "disputed" && !exchange.flaggedForReview;
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
                  <div className="flex items-center gap-2 text-xs text-moss-600 dark:text-moss-300">
                    <span>{formatRelativeTime(exchange.completedAt)}</span>
                    {/* A direct exchange has no post behind it — say
                        so quietly, and host the flag doorway here
                        since there is no post page to hold it. */}
                    {isDirect && (
                      <span className="chip bg-moss-100 italic text-moss-700 dark:bg-moss-800 dark:text-moss-200">
                        {t("profile.history.directChip")}
                      </span>
                    )}
                    {isDirect &&
                      (disputeIdByPostId.has(exchange.postId) ? (
                        <Link
                          to={`/disputes#${disputeIdByPostId.get(exchange.postId)}`}
                          className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        >
                          {t("profile.history.directInReview")}
                        </Link>
                      ) : (
                        <ExchangeFlagButton
                          title={t("profile.history.directFlagTitle")}
                          body={t("profile.history.directFlagBody")}
                          confirmLabel={t("profile.history.directFlagConfirm")}
                          onFlag={() =>
                            disputeDirectExchange(exchange.id, meKey)
                          }
                        />
                      ))}
                    {/* Post-backed rows: the same doorway the direct
                        rows had. The action is the post flow's own
                        disputeExchange — no forked flag logic. */}
                    {canFlagPost && post && (
                      <ExchangeFlagButton
                        title={t("profile.history.postFlagTitle")}
                        body={t("profile.history.postFlagBody")}
                        confirmLabel={t("profile.history.postFlagConfirm")}
                        onFlag={() => disputeExchange(post.id, meKey)}
                      />
                    )}
                    {postInReview && (
                      <Link
                        to={
                          disputeIdByPostId.has(exchange.postId)
                            ? `/disputes#${disputeIdByPostId.get(exchange.postId)}`
                            : "/disputes"
                        }
                        className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      >
                        {t("profile.history.directInReview")}
                      </Link>
                    )}
                    {/* The chip links to the review conversation it
                        names — anchored to the matching dispute card
                        when one is resolvable, the disputes list
                        otherwise. Same chip styling; the link is
                        context, not alarm. */}
                    {exchange.flaggedForReview && (
                      <Link
                        to={
                          disputeIdByPostId.has(exchange.postId)
                            ? `/disputes#${disputeIdByPostId.get(exchange.postId)}`
                            : "/disputes"
                        }
                        title={t(flagReasonKey(exchange.flagReason))}
                        className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                      >
                        {t("profile.history.flag")}
                      </Link>
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
      {hiddenCount > 0 && (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? t("profile.history.showFewer")
            : t(
                hiddenCount === 1
                  ? "profile.history.showOlderOne"
                  : "profile.history.showOlderOther",
                { count: hiddenCount },
              )}
        </button>
      )}
    </section>
  );
}

// The labeled route to /settings (Language, Appearance, Blocked
// contacts, Node, Security, Export). The header gear was the ONLY
// doorway before this row — a 20px icon with no label. Now a row in
// the "Community & account" index (formerly a standalone card): the
// whole row is the link (44px+ touch target) with the house `›`
// chevron; no counts, no badges.
function SettingsRowSection() {
  const { t } = useTranslation();
  return (
    <div className="py-2">
      <Link
        to="/settings"
        className="-m-2 flex min-h-[44px] items-center justify-between gap-3 rounded-xl p-2 hover:bg-moss-50 dark:hover:bg-moss-900"
      >
        <div className="min-w-0 flex-1">
          <h3
            id="profile-settings-row-title"
            className="text-sm font-semibold text-moss-800 dark:text-moss-100"
          >
            {t("profile.settingsRow.label")}
          </h3>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("profile.settingsRow.description")}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-lg text-moss-400 dark:text-moss-500"
        >
          ›
        </span>
      </Link>
    </div>
  );
}

// Entry point for the device-pairing flow (docs/device-pairing.md).
// A disclosure row, not a navigation row: the summary keeps one
// deliberate step between browsing the index and the sensitive
// pairing flow at /add-device. The flow itself is unchanged — the
// disclosed CTA navigates to the same page as the old card's button.
function AddDeviceSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <details className="py-2">
      <summary className="-m-2 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl p-2 marker:hidden hover:bg-moss-50 dark:hover:bg-moss-900">
        <div className="min-w-0 flex-1">
          <h3
            id="profile-addDevice-heading"
            className="text-sm font-semibold text-moss-800 dark:text-moss-100"
          >
            {t("profile.addDevice.title")}
          </h3>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("profile.addDevice.subtitle")}
          </p>
        </div>
        {/* No trailing glyph of our own: the global stylesheet already
            appends the house ▾/▴ disclosure chevron to every
            `details > summary` (index.css), which distinguishes this
            row from the index's `›` navigation rows. */}
      </summary>
      <div className="mt-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/add-device")}
        >
          {t("profile.addDevice.cta")}
        </button>
      </div>
    </details>
  );
}

function EmergencySection() {
  const { t, i18n } = useTranslation();
  const [confirming, setConfirming] = useState<null | "soft" | "hard">(null);
  const [status, setStatus] = useState<string | null>(null);

  // Accessible panic (#476): the confirm step SPEAKS what is about
  // to happen, on-device (lib/speak.ts), so a member who can't read
  // the dialog still knows exactly what they're confirming. Purely
  // additive — the visual dialog carries the same meaning alone.
  useEffect(() => {
    if (confirming === null) return;
    void import("@/lib/speak").then(({ speak }) => {
      speak(
        confirming === "soft"
          ? t("profile.emergency.spokenSoft")
          : t("profile.emergency.spokenHard"),
        i18n.language?.startsWith("es") ? "es" : "en",
      );
    });
    return () => {
      void import("@/lib/speak").then(({ stopSpeaking }) => stopSpeaking());
    };
  }, [confirming, t, i18n.language]);

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
          {/* The 🆘 glyph is deliberate (#476): a fixed, language-free
              marker so a non-reader can find the emergency section by
              icon alone. */}
          <span aria-hidden="true" className="mr-1">
            🆘
          </span>
          {t("profile.emergency.title")}
        </h2>
        <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
          {t("profile.emergency.intro")}
        </p>
        <ul className="mb-4 space-y-3 text-sm">
          <li>{t("profile.emergency.softBullet")}</li>
          <li>{t("profile.emergency.hardBullet")}</li>
        </ul>
        <p className="mb-4 text-xs text-moss-600 dark:text-moss-300">
          {t("profile.emergency.federatedNote")}
        </p>
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
  pending,
  pendingTask,
  projectOutflow,
  autoConfirmHours,
}: {
  balance: number;
  seed: number;
  pending: PendingBalance;
  pendingTask: PendingTaskCredit;
  /** Hours moved out of this member's balance by confirming project
   *  tasks, with the largest project's title pre-resolved. `hours === 0`
   *  hides the line entirely. */
  projectOutflow: { hours: number; primaryTitle: string; moreCount: number };
  autoConfirmHours: number;
}) {
  const { t } = useTranslation();
  const tone =
    balance > seed
      ? "surplus"
      : balance === seed
        ? "neutral"
        : "receiving";
  const messageKey = `profile.balance.${tone}`;
  const awaitingYou = pending.entries.filter((e) => e.owedBy === "you");
  // "Pending confirmation" — the headline merges post pending (partner
  // owes) with project-task pending (organizer owes). For posts this
  // is a partner's signature; for tasks an organizer's. Both end the
  // same way for the member: nothing for them to do, credit lands on
  // the other side's signature. The reworded `pendingLine` copy is
  // truthful for both ("{{hours}} pending confirmation") — the
  // post-specific "awaiting you" line above stays untouched because
  // a claimer never owes themselves a task confirmation.
  const partnerPendingTotal =
    Math.round((pending.awaitingPartnerHours + pendingTask.hours) * 100) / 100;
  const hasPartnerPending =
    pending.entries.some((e) => e.owedBy === "partner") ||
    pendingTask.entries.length > 0;
  const hasAnyPending =
    pending.entries.length > 0 || pendingTask.entries.length > 0;
  return (
    <section className="card mb-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-moss-600 dark:text-moss-300">
            {t("profile.balance.label")}
            <WhyTooltip principleId="equal-time" />
          </div>
          <div className="mt-1 text-4xl font-bold text-canopy-700 dark:text-canopy-300">
            {formatHours(balance)}
          </div>
          {/* Credit in motion — only when something actually is. The
              awaiting-you line comes first because the member can act
              on it; the merged pending line carries nothing to do
              (an organizer or partner signs; the auto-confirm sweep
              eventually covers either). Framed as movement, never as
              "stuck" — solidarity-not-shame. */}
          {hasAnyPending && (
            <div className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {awaitingYou.length > 0 && (
                <div>
                  {t("profile.balance.awaitingYouLine", {
                    hours: formatSignedHours(pending.awaitingYouHours),
                  })}
                </div>
              )}
              {hasPartnerPending && (
                <div>
                  {t("profile.balance.pendingLine", {
                    hours: formatSignedHours(partnerPendingTotal),
                  })}
                </div>
              )}
              <details className="mt-1">
                <summary className="cursor-pointer text-moss-400 underline-offset-2 hover:text-moss-600 hover:underline dark:text-moss-300 dark:hover:text-moss-300">
                  {t("profile.balance.pendingWhy")}
                </summary>
                <p className="mt-1 max-w-sm rounded-lg bg-moss-50 px-3 py-2 text-moss-700 dark:bg-moss-900/60 dark:text-moss-200">
                  {/* `autoConfirmHours <= 0` means this community has
                      no auto-confirm sweep — never promise one. */}
                  {autoConfirmHours > 0
                    ? t("profile.balance.pendingExplainerAuto", {
                        count: Math.max(
                          1,
                          Math.ceil(autoConfirmHours / 24),
                        ),
                      })
                    : t("profile.balance.pendingExplainerManual")}
                </p>
              </details>
            </div>
          )}
          {/* Confirmation outflow — explains a below-seed balance as
              hours moved to helpers on the community's behalf, not
              over-consumption. Unsigned hours + no "debt" framing
              (solidarity-not-shame); only rendered when nonzero. The
              exchange history below itemizes each one, so this stays a
              single quiet line, not an expandable. */}
          {projectOutflow.hours > 0 && (
            <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {projectOutflow.moreCount > 0
                ? t("profile.balance.projectOutflowLineMore", {
                    hours: formatHours(projectOutflow.hours),
                    project: projectOutflow.primaryTitle,
                    count: projectOutflow.moreCount,
                  })
                : t("profile.balance.projectOutflowLine", {
                    hours: formatHours(projectOutflow.hours),
                    project: projectOutflow.primaryTitle,
                  })}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-moss-600 dark:text-moss-300">
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

function ProfileEditor({
  member,
  focusOnMount = false,
  onFocusHandled,
}: {
  member: Member;
  /** True when the page was entered via `/profile?edit=1` (the Board
   *  profile-nudge CTA): scroll this section into view and focus the
   *  first field so "Add some details" lands ON the details form. */
  focusOnMount?: boolean;
  /** Called once the scroll/focus has run, so the caller can strip
   *  the `edit` param from the URL (replace, not push). */
  onFocusHandled?: () => void;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!focusOnMount) return;
    sectionRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    // preventScroll: the scrollIntoView above already framed the whole
    // section; letting focus() scroll again would yank the heading off
    // the top of the viewport.
    nameInputRef.current?.focus({ preventScroll: true });
    onFocusHandled?.();
    // Run once on the mount that carried the param — clearing the
    // param flips focusOnMount to false, and the guard above makes
    // that a no-op rather than a re-scroll.
  }, [focusOnMount, reduced, onFocusHandled]);
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
    <section ref={sectionRef} className="card mb-4 scroll-mt-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
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
          {/* Canonical identity spot — key visible, tap explains
              (IdentityKey.tsx). The avatarNote below keeps its own
              WhyTooltip. */}
          <p className="font-mono text-xs text-moss-600 dark:text-moss-300">
            <IdentityKey
              publicKey={member.publicKey}
              name={member.displayName}
              isYou
              alwaysShown
            >
              {shortKey(member.publicKey)}
            </IdentityKey>
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
                ref={nameInputRef}
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
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.memberSwitcher.title")}
      </h2>
      <p className="mb-3 text-xs text-moss-600 dark:text-moss-300">
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
              <div className="text-xs text-moss-600 dark:text-moss-300">
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
  // How the sheet was opened decides its first screen: freshly issued
  // → the share menu (no camera warning yet); an explicit "Show QR
  // code" tap → straight to the look-around check, which is that
  // warning's natural moment (2026-07 usability round).
  const [sheetIntent, setSheetIntent] = useState<"share" | "show">(
    "share",
  );
  // Optional local-only "who is this for?" label typed before
  // generating. Stored on the Dexie invite row only — never in the
  // link, never announced to the server (see db/invites.ts).
  const [noteInput, setNoteInput] = useState("");
  const [issuedNote, setIssuedNote] = useState("");
  // The me-menu's "Invite someone" deep-links here as /profile#invites.
  // The shell's ScrollToTop resets the main scroller on navigation, so
  // the hash needs an explicit scroll once the section exists.
  const location = useLocation();
  const invitesRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (location.hash === "#invites") {
      invitesRef.current?.scrollIntoView({ block: "start" });
    }
  }, [location.hash]);
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

  // A freshly issued link lives in `shareUrl` state, but the state
  // dies with the component — and members read that as the invite
  // itself being lost, so they generate a duplicate (the round-trip
  // finding from the 2026-07 usability run). Every invite row
  // persists its `encoded` token, so the full share link is
  // reconstructable at any time: on return, resurface the most
  // recent open invite with the same Reveal / Copy / QR affordances
  // it had at generation. Newest-first so the box always shows what
  // the member issued last.
  const openInvites = useMemo(
    () =>
      invites
        .filter(
          (inv) => inv.status === "open" && inv.expiresAt > Date.now(),
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [invites],
  );
  const latestOpen: InviteRow | undefined = openInvites[0];
  // Fresh link wins while it's in state (it's also the newest row —
  // same URL — but state survives a beat ahead of the live query).
  const activeUrl =
    shareUrl ??
    (latestOpen
      ? `${window.location.origin}/invite#${latestOpen.encoded}`
      : null);
  const isFreshShare = shareUrl !== null;

  async function handleIssue() {
    setError(null);
    setIssuing(true);
    try {
      const { shareUrl: url } = await issueInvite({
        inviterKey: member.publicKey,
        inviterName: member.displayName,
        // The post-issuance UX opens the share sheet right away —
        // on its share menu, not the camera warning; that warning
        // waits for an explicit "show" choice.
        nodeId,
        note: noteInput,
      });
      setShareUrl(url);
      setIssuedNote(noteInput.trim());
      setNoteInput("");
      setSheetIntent("share");
      setShareSheetOpen(true);
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setIssuing(false);
    }
  }

  async function handleCopy(url: string) {
    if ((await copyTextToClipboard(url)) === "copied") {
      setCopyStatus(t("common.copied"));
      setTimeout(() => setCopyStatus(null), 3000);
    } else {
      setCopyStatus(t("common.copyFailed"));
    }
  }

  return (
    <section id="invites" ref={invitesRef} className="card mb-4 scroll-mt-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.invites.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.invites.intro")}
      </p>
      <label className="mb-2 block text-sm">
        <span className="font-medium">
          {t("profile.invites.noteLabel")}
        </span>
        <input
          type="text"
          className="input mt-1"
          value={noteInput}
          maxLength={120}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder={t("profile.invites.notePlaceholder")}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={handleIssue}
          disabled={issuing}
        >
          {issuing
            ? t("profile.invites.generating")
            : latestOpen || shareUrl
              ? t("profile.invites.generateAnother")
              : t("profile.invites.generate")}
        </button>
      </div>

      {activeUrl && (
        <div className="mt-3 rounded-xl border border-canopy-200 bg-canopy-50 p-3 dark:border-canopy-900/50 dark:bg-canopy-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-canopy-800 dark:text-canopy-200">
            {isFreshShare
              ? t("profile.invites.shareTitle")
              : t("profile.invites.openShareTitle")}
          </p>
          {/* On return, say when it was made and how long it lives —
              the two facts that tell a member "this is the one you
              already generated", not a mystery counter. */}
          {!isFreshShare && latestOpen && (
            <p className="mt-1 text-xs text-moss-600 dark:text-moss-300">
              {t("profile.invites.openInviteMeta", {
                when: formatRelativeTime(latestOpen.createdAt),
                date: formatDeadline(latestOpen.expiresAt),
              })}
            </p>
          )}
          {/* The local-only label, so a returning member knows WHICH
              link this is ("Carol from the garden"). Only-you copy
              travels with it — the note itself never leaves this
              device. */}
          {(isFreshShare ? issuedNote : latestOpen?.note) ? (
            <p className="mt-1 text-xs font-medium text-canopy-800 dark:text-canopy-200">
              {t("profile.invites.noteFor", {
                note: isFreshShare ? issuedNote : latestOpen?.note,
              })}
            </p>
          ) : null}
          <code
            className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs dark:bg-moss-900"
            aria-live="polite"
          >
            {linkRevealed ? activeUrl : t("profile.invites.shareLinkHidden")}
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
              onClick={() => handleCopy(activeUrl)}
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
              onClick={() => {
                // Explicit "Show QR code" — the camera check is the
                // natural first screen here.
                setSheetIntent("show");
                setShareSheetOpen(true);
              }}
            >
              {t("profile.invites.showShareSheet")}
            </button>
            {copyStatus && (
              <span
                role="status"
                className="text-canopy-800 dark:text-canopy-200"
              >
                {copyStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
            {isFreshShare
              ? t("profile.invites.shareNote")
              : t("profile.invites.openShareNote")}
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
        open={shareSheetOpen && activeUrl !== null}
        url={activeUrl ?? ""}
        shareTitle={t("profile.invites.shareSheet.shareTitle")}
        shareText={t("profile.invites.shareSheet.shareText")}
        intent={sheetIntent}
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
    for (const inv of invites) {
      // A redeemed-despite-revocation invite is still a redemption for
      // the one-line summary; the /invites page shows the fuller state.
      const bucket =
        inv.status === "redeemed_despite_revocation" ? "redeemed" : inv.status;
      c[bucket] += 1;
    }
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

// The untruncated public key, on demand. This is the value the
// operator runbooks ask members to hand over (NODE_FOUNDER_KEYS
// bootstrap in .env.example, the mirror trust settings in
// operator-guide §6) and no other surface shows it whole. The key is
// PUBLIC — displaying it leaks nothing — and the visible <code> is
// deliberately selectable so the panel keeps working where
// navigator.clipboard is unavailable or denied (the same lesson as
// the copy-free pairing path: never make the clipboard API the only
// road).
function FullKeyPanel({ publicKey }: { publicKey: string }) {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopyStatus(t("common.copied"));
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(t("common.copyFailed"));
    }
  }

  return (
    <section className="card mb-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("profile.fullKey.title")}
      </h2>
      <code className="mt-2 block select-all break-all rounded bg-moss-50 px-2 py-1 font-mono text-xs dark:bg-moss-900">
        {publicKey}
      </code>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={handleCopy}
        >
          {t("common.copy")}
        </button>
        {copyStatus && (
          <span role="status" className="text-canopy-800 dark:text-canopy-200">
            {copyStatus}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-moss-600 dark:text-moss-300">
        {t("profile.fullKey.hint")}
      </p>
    </section>
  );
}
