import { Link } from "react-router-dom";
import type { Post } from "@/types";
import { formatHours, formatRelativeTime } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { UrgencyBadge } from "./UrgencyBadge";

export function PostCard({
  post,
  posterName,
  isCurrentMember,
}: {
  post: Post;
  posterName: string;
  isCurrentMember: boolean;
}) {
  const typeLabel = post.type === "NEED" ? "needs help" : "offers";
  return (
    <Link
      to={`/post/${post.id}`}
      className="card block animate-fade-in transition-shadow hover:shadow-md
                 focus-visible:ring-2 focus-visible:ring-canopy-600/50"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <CategoryBadge category={post.category} size="sm" />
        <UrgencyBadge urgency={post.urgency} />
        {post.status !== "open" && <StatusChip status={post.status} />}
      </div>
      <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
      {post.description && (
        <p className="mt-1 line-clamp-2 text-sm text-moss-600 dark:text-moss-300">
          {post.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-moss-600 dark:text-moss-400">
        <span>
          <span className="font-medium">
            {isCurrentMember ? "You" : posterName}
          </span>{" "}
          {typeLabel}{" "}
          <span className="font-medium">
            {formatHours(post.estimatedHours)}
          </span>
        </span>
        <span>{formatRelativeTime(post.createdAt)}</span>
      </div>
    </Link>
  );
}

function StatusChip({ status }: { status: Post["status"] }) {
  const map: Record<Post["status"], string> = {
    open: "Open",
    claimed: "Claimed",
    awaiting_confirmation: "Awaiting confirmation",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Flagged for review",
  };
  return (
    <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
      {map[status]}
    </span>
  );
}
