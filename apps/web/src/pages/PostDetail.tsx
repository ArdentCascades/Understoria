import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "@/state/AppContext";
import {
  cancelPost,
  claimPost,
  confirmExchange,
  disputeExchange,
  unclaimPost,
} from "@/db/actions";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UrgencyBadge } from "@/components/UrgencyBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AchievementBadge } from "@/components/AchievementBadge";
import { formatHours, formatRelativeTime, shortKey } from "@/lib/format";
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
          This post couldn't be found. It may have been cancelled.
        </p>
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => navigate("/")}
        >
          Back to board
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
      setError((err as Error).message);
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
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <button
        type="button"
        className="btn-ghost -ml-2 mb-3 text-sm"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="card mb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={post.category} />
          <UrgencyBadge urgency={post.urgency} />
          <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
            {post.type === "NEED" ? "Need" : "Offer"}
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
          <Field label="Estimated hours">
            {formatHours(post.estimatedHours)}
          </Field>
          <Field label="Posted">
            {formatRelativeTime(post.createdAt)}
          </Field>
          <Field label={post.type === "NEED" ? "Posted by" : "Offered by"}>
            <PersonInline
              name={poster?.displayName ?? "Member"}
              publicKey={post.postedBy}
              isYou={isPoster}
            />
          </Field>
          {post.claimedBy && (
            <Field
              label={post.type === "NEED" ? "Helper" : "Claimed by"}
            >
              <PersonInline
                name={claimer?.displayName ?? "Member"}
                publicKey={post.claimedBy}
                isYou={isClaimer}
              />
            </Field>
          )}
          {post.locationZone && (
            <Field label="Area">{post.locationZone}</Field>
          )}
          {post.expiresAt && (
            <Field label="Expires">
              {new Date(post.expiresAt).toLocaleDateString()}
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
            New community roles earned
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
        title="Claim this post?"
        description={
          post.type === "NEED" ? (
            <p>
              You're offering to help with{" "}
              <strong>{formatHours(post.estimatedHours)}</strong> of{" "}
              {post.category.replace("_", " ")}. You'll earn credit once both
              of you confirm completion.
            </p>
          ) : (
            <p>
              You'd like to receive help for{" "}
              <strong>{formatHours(post.estimatedHours)}</strong>. Credits
              transfer when both parties confirm.
            </p>
          )
        }
        confirmLabel="Yes, claim it"
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me &&
          run(() => claimPost(post.id, me.publicKey))
        }
      />

      <ConfirmDialog
        open={dialog?.type === "confirm-complete"}
        title="Mark this exchange complete?"
        description={
          <p>
            Confirm that the help actually happened. Credits transfer once both
            parties confirm. If something went wrong, you can flag it instead.
          </p>
        }
        confirmLabel="Yes, it's complete"
        onCancel={() => setDialog(null)}
        onConfirm={handleConfirmComplete}
      />

      <ConfirmDialog
        open={dialog?.type === "dispute"}
        tone="caution"
        title="Flag this exchange for community review?"
        description={
          <p>
            The exchange will be flagged and a community mediator can help
            resolve it. Your credits won't transfer yet.
          </p>
        }
        confirmLabel="Flag it"
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me && run(() => disputeExchange(post.id, me.publicKey))
        }
      />

      <ConfirmDialog
        open={dialog?.type === "cancel"}
        tone="caution"
        title="Cancel this post?"
        description="Cancelled posts stay visible but can't be claimed."
        confirmLabel="Cancel post"
        onCancel={() => setDialog(null)}
        onConfirm={() =>
          me && run(() => cancelPost(post.id, me.publicKey))
        }
      />

      <ConfirmDialog
        open={dialog?.type === "release"}
        title="Release your claim?"
        description="This will reopen the post so someone else can step in."
        confirmLabel="Release claim"
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
  if (post.status === "open") {
    if (isPoster) {
      return (
        <Actions>
          <button
            className="btn-secondary"
            onClick={() => onOpenDialog({ type: "cancel" })}
          >
            Cancel post
          </button>
          <p className="text-xs text-moss-500 dark:text-moss-400">
            Waiting for someone to claim this.
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
          {post.type === "NEED" ? "Offer to help" : "Claim this offer"}
        </button>
      </Actions>
    );
  }

  if (post.status === "claimed" || post.status === "awaiting_confirmation") {
    if (!isParty) {
      return (
        <Actions>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            This post has been claimed. {helperName ?? "A community member"}{" "}
            is helping {helpedName ?? "the poster"}.
          </p>
        </Actions>
      );
    }
    return (
      <Actions>
        <p className="text-sm text-moss-700 dark:text-moss-200">
          When the help has actually happened, both of you confirm below.
          Credits transfer once both have confirmed.
        </p>
        {alreadyConfirmed ? (
          <p className="text-sm font-medium text-canopy-700 dark:text-canopy-300">
            You've confirmed. Waiting on the other party.
          </p>
        ) : (
          <button
            className="btn-primary"
            onClick={() => onOpenDialog({ type: "confirm-complete" })}
          >
            Confirm it's complete
          </button>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => onOpenDialog({ type: "dispute" })}
          >
            Something's wrong — flag it
          </button>
          {isClaimer && (
            <button
              className="btn-ghost"
              onClick={() => onOpenDialog({ type: "release" })}
              disabled={post.status === "awaiting_confirmation"}
            >
              Release claim
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
          Completed. {formatHours(post.estimatedHours)} of credit flowed from{" "}
          <strong>{helpedName ?? "the helped party"}</strong> to{" "}
          <strong>{helperName ?? "the helper"}</strong>. Thank you both.
        </p>
      </Actions>
    );
  }

  if (post.status === "disputed") {
    return (
      <Actions>
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          This exchange has been flagged for community review. A mediator will
          follow up.
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
  return (
    <span>
      {isYou ? "You" : name}{" "}
      <span className="text-xs text-moss-500">({shortKey(publicKey)})</span>
    </span>
  );
}

function StatusLabel({ status }: { status: Post["status"] }) {
  const map: Record<Post["status"], { label: string; cls: string }> = {
    open: {
      label: "Open",
      cls: "bg-canopy-50 text-canopy-800 dark:bg-canopy-950/40 dark:text-canopy-100",
    },
    claimed: {
      label: "Claimed",
      cls: "bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200",
    },
    awaiting_confirmation: {
      label: "Awaiting confirmation",
      cls: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
    },
    completed: {
      label: "Completed",
      cls: "bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-moss-100 text-moss-600 dark:bg-moss-900 dark:text-moss-300",
    },
    disputed: {
      label: "Flagged",
      cls: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100",
    },
  };
  const { label, cls } = map[status];
  return <span className={`chip ${cls}`}>{label}</span>;
}
