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
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import {
  cancelPost,
  claimPost,
  confirmExchange,
  disputeExchange,
  unclaimPost,
} from "@/db/actions";
import { humanizeError } from "@/lib/humanizeError";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AchievementBadge } from "@/components/AchievementBadge";
import {
  formatDeadline,
  formatHours,
  formatRelativeTime,
  shortKey,
} from "@/lib/format";
import type { Achievement, Post } from "@/types";

type DialogKind =
  | { type: "claim" }
  | { type: "confirm-complete" }
  | { type: "dispute" }
  | { type: "cancel" }
  | { type: "release" }
  | null;

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, members, currentMember, nodeId } = useApp();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [error, setError] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const post = useMemo(
    () => posts.find((p) => p.id === id) ?? null,
    [posts, id],
  );
  const memberMap = useMemo(
    () => new Map(members.map((m) => [m.publicKey, m])),
    [members],
  );

  if (!post) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("postDetail.notFound")}
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/")}
        >
          {t("postDetail.backToBoard")}
        </button>
      </div>
    );
  }

  const poster = memberMap.get(post.postedBy);
  const claimer = post.claimedBy ? memberMap.get(post.claimedBy) : null;
  const me = currentMember;
  const isPoster = me?.publicKey === post.postedBy;
  const isClaimer = me?.publicKey === post.claimedBy;
  const isParty = isPoster || isClaimer;
  const alreadyConfirmed = me
    ? post.confirmedBy.includes(me.publicKey)
    : false;

  const helperName =
    post.type === "NEED"
      ? claimer?.displayName
      : poster?.displayName;
  const helpedName =
    post.type === "NEED"
      ? poster?.displayName
      : claimer?.displayName;

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      setError(null);
      return await action();
    } catch (err) {
      const message = humanizeError(err);
      setError(message);
      // Also surface as an error toast with Retry — the inline
      // <p role="alert"> below is reliable, but the action dialog
      // just closed and the page might have scrolled past it. The
      // toast catches the user wherever they are.
      showToast(message, {
        tone: "error",
        action: {
          label: t("common.tryAgain"),
          onAction: () => {
            void run(action);
          },
        },
      });
      return null;
    } finally {
      setDialog(null);
    }
  }

  async function handleConfirmComplete() {
    if (!me) return;
    const result = await run(() =>
      confirmExchange(post!.id, me.publicKey, nodeId),
    );
    if (result?.newAchievements.length) {
      setNewAchievements(result.newAchievements);
    }
    if (result) {
      // The result is null if the call threw; only toast on success.
      // The exchange object is null on the first party's confirmation
      // (still awaiting the other party) and populated on the second.
      // Toast differs to match the actual state of credit flow.
      showToast(
        t(
          result.exchange === null
            ? "toast.exchangeConfirmedPending"
            : "toast.exchangeConfirmedComplete",
        ),
      );
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <button
        type="button"
        className="btn-ghost -ml-2 mb-3 text-sm"
        onClick={() => navigate(-1)}
      >
        {t("common.back")}
      </button>

      <div className="card mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={post.category} />
          <UrgencyBadge urgency={post.urgency} />
          <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {post.type === "NEED"
              ? t("postDetail.typeNeed")
              : t("postDetail.typeOffer")}
          </span>
          <StatusLabel status={post.status} />
        </div>
        <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
        {post.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-moss-700 dark:text-moss-200">
            {post.description}
          </p>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field label={t("postDetail.fieldEstimatedHours")}>
            {formatHours(post.estimatedHours)}
          </Field>
          <Field label={t("postDetail.fieldPosted")}>
            {formatRelativeTime(post.createdAt)}
          </Field>
          <Field
            label={
              post.type === "NEED"
                ? t("postDetail.fieldPostedBy")
                : t("postDetail.fieldOfferedBy")
            }
          >
            <PersonInline
              name={poster?.displayName ?? t("common.anyMember")}
              publicKey={post.postedBy}
              isYou={isPoster}
            />
          </Field>
          {post.claimedBy && (
            <Field
              label={
                post.type === "NEED"
                  ? t("postDetail.fieldHelper")
                  : t("postDetail.fieldClaimedBy")
              }
            >
              <PersonInline
                name={claimer?.displayName ?? t("common.anyMember")}
                publicKey={post.claimedBy}
                isYou={isClaimer}
              />
            </Field>
          )}
          {post.locationZone && (
            <Field label={t("postDetail.fieldArea")}>{post.locationZone}</Field>
          )}
          {post.expiresAt && (
            <Field label={t("postDetail.fieldExpires")}>
              {formatDeadline(post.expiresAt)}
            </Field>
          )}
        </dl>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </p>
      )}

      <ActionPanel
        post={post}
        isPoster={isPoster}
        isClaimer={isClaimer}
        isParty={isParty}
        alreadyConfirmed={alreadyConfirmed}
        helperName={helperName}
        helpedName={helpedName}
        onOpenDialog={setDialog}
      />

      {newAchievements.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-500">
            {t("postDetail.newRolesEarned")}
          </h2>
          <ul className="flex flex-col gap-2">
            {newAchievements.map((a) => (
              <li key={a.id}>
                <AchievementBadge
                  type={a.achievementType}
                  earnedAt={a.earnedAt}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={dialog?.type === "claim"}
        title={
          post.type === "NEED"
            ? t("postDetail.dialogClaimNeedTitle")
            : t("postDetail.dialogClaimOfferTitle")
        }
        description={
          post.type === "NEED"
            ? t("postDetail.dialogClaimNeedDescription", {
                hours: formatHours(post.estimatedHours),
                category: t(`categories.${post.category}`),
              })
            : t("postDetail.dialogClaimOfferDescription", {
                hours: formatHours(post.estimatedHours),
              })
        }
        confirmLabel={t("postDetail.dialogClaimConfirm")}
        confirmingLabel={t("common.working")}
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me &&
          run(() => claimPost(post.id, me.publicKey))
        }
      />

      <ConfirmDialog
        open={dialog?.type === "confirm-complete"}
        title={t("postDetail.dialogCompleteTitle")}
        description={t("postDetail.dialogCompleteDescription")}
        confirmLabel={t("postDetail.dialogCompleteConfirm")}
        confirmingLabel={t("common.working")}
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirmComplete}
      />

      <ConfirmDialog
        open={dialog?.type === "dispute"}
        tone="caution"
        title={t("postDetail.dialogDisputeTitle")}
        description={t("postDetail.dialogDisputeDescription")}
        confirmLabel={t("postDetail.dialogDisputeConfirm")}
        confirmingLabel={t("common.working")}
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me && run(() => disputeExchange(post.id, me.publicKey))
        }
      />

      <ConfirmDialog
        open={dialog?.type === "cancel"}
        tone="caution"
        title={t("postDetail.dialogCancelTitle")}
        description={t("postDetail.dialogCancelDescription")}
        confirmLabel={t("postDetail.dialogCancelConfirm")}
        confirmingLabel={t("common.working")}
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me && run(() => cancelPost(post.id, me.publicKey))
        }
      />

      <ConfirmDialog
        open={dialog?.type === "release"}
        title={t("postDetail.dialogReleaseTitle")}
        description={t("postDetail.dialogReleaseDescription")}
        confirmLabel={t("postDetail.dialogReleaseConfirm")}
        confirmingLabel={t("common.working")}
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me && run(() => unclaimPost(post.id, me.publicKey))
        }
      />
    </div>
  );
}

interface ActionPanelProps {
  post: Post;
  isPoster: boolean;
  isClaimer: boolean;
  isParty: boolean;
  alreadyConfirmed: boolean;
  helperName: string | undefined;
  helpedName: string | undefined;
  onOpenDialog: (d: DialogKind) => void;
}

function ActionPanel({
  post,
  isPoster,
  isClaimer,
  isParty,
  alreadyConfirmed,
  helperName,
  helpedName,
  onOpenDialog,
}: ActionPanelProps) {
  const { t } = useTranslation();
  if (post.status === "open") {
    if (isPoster) {
      return (
        <Actions>
          <button
            className="btn-secondary"
            onClick={() => onOpenDialog({ type: "cancel" })}
          >
            {t("postDetail.actionsCancelPost")}
          </button>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            {t("postDetail.actionsWaiting")}
          </p>
        </Actions>
      );
    }
    return (
      <Actions>
        <button
          className="btn-primary"
          onClick={() => onOpenDialog({ type: "claim" })}
        >
          {post.type === "NEED"
            ? t("postDetail.actionsOfferToHelp")
            : t("postDetail.actionsClaimOffer")}
        </button>
      </Actions>
    );
  }

  if (post.status === "claimed" || post.status === "awaiting_confirmation") {
    if (!isParty) {
      return (
        <Actions>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("postDetail.actionsClaimedBy", {
              helper: helperName ?? t("common.anyMember"),
              helped: helpedName ?? t("common.anyMember"),
            })}
          </p>
        </Actions>
      );
    }
    return (
      <Actions>
        <p className="text-sm text-moss-700 dark:text-moss-200">
          {t("postDetail.actionsExplain")}
        </p>
        {alreadyConfirmed ? (
          <p className="text-sm font-medium text-canopy-700 dark:text-canopy-300">
            {t("postDetail.actionsConfirmed")}
          </p>
        ) : (
          <button
            className="btn-primary"
            onClick={() => onOpenDialog({ type: "confirm-complete" })}
          >
            {t("postDetail.actionsConfirmComplete")}
          </button>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => onOpenDialog({ type: "dispute" })}
          >
            {t("postDetail.actionsFlag")}
          </button>
          {isClaimer && (
            <button
              className="btn-ghost"
              onClick={() => onOpenDialog({ type: "release" })}
              disabled={post.status === "awaiting_confirmation"}
            >
              {t("postDetail.actionsRelease")}
            </button>
          )}
        </div>
      </Actions>
    );
  }

  if (post.status === "completed") {
    return (
      <Actions>
        <p className="rounded-xl bg-canopy-50 p-3 text-sm text-canopy-900 dark:bg-canopy-950/40 dark:text-canopy-100">
          {t("postDetail.actionsCompleted", {
            hours: formatHours(post.estimatedHours),
            helper: helperName ?? t("common.anyMember"),
            helped: helpedName ?? t("common.anyMember"),
          })}
        </p>
      </Actions>
    );
  }

  if (post.status === "disputed") {
    return (
      <Actions>
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t("postDetail.actionsDisputed")}
        </p>
      </Actions>
    );
  }

  return null;
}

function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div className="card flex flex-col gap-3">{children}</div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-moss-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

function PersonInline({
  name,
  publicKey,
  isYou,
}: {
  name: string;
  publicKey: string;
  isYou: boolean;
}) {
  const { t } = useTranslation();
  if (isYou) {
    return (
      <span>
        {t("common.you")}{" "}
        <span className="text-xs text-moss-500">({shortKey(publicKey)})</span>
      </span>
    );
  }
  return (
    <span>
      <Link
        to={`/member/${encodeURIComponent(publicKey)}`}
        className="underline-offset-2 hover:underline"
      >
        {name}
      </Link>{" "}
      <span className="text-xs text-moss-500">({shortKey(publicKey)})</span>
    </span>
  );
}

function StatusLabel({ status }: { status: Post["status"] }) {
  const { t } = useTranslation();
  const styles: Record<Post["status"], string> = {
    open: "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100",
    claimed: "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200",
    awaiting_confirmation:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
    completed:
      "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100",
    cancelled: "bg-moss-100 text-moss-600 dark:bg-moss-900 dark:text-moss-300",
    disputed: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100",
  };
  return (
    <span className={`chip ${styles[status]}`}>{t(`postStatus.${status}`)}</span>
  );
}
