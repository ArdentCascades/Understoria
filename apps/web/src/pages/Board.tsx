import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/state/AppContext";
import { PostCard } from "@/components/PostCard";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import type { Category, PostType, Urgency } from "@/types";

type Tab = PostType;

const URGENCY_OPTIONS: Array<{ value: "" | Urgency; label: string }> = [
  { value: "", label: "All urgencies" },
  { value: "high", label: "Urgent" },
  { value: "medium", label: "Soon" },
  { value: "low", label: "When you can" },
];

export default function BoardPage() {
  const { posts, members, currentMember } = useApp();
  const [tab, setTab] = useState<Tab>("NEED");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "">("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const memberName = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) map.set(m.publicKey, m.displayName);
    return map;
  }, [members]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (p.type !== tab) return false;
      if (p.status === "cancelled") return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (urgencyFilter && p.urgency !== urgencyFilter) return false;
      if (q) {
        const haystack = `${p.title} ${p.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, tab, categoryFilter, urgencyFilter, query]);

  const openCount = useMemo(() => {
    return {
      NEED: posts.filter((p) => p.type === "NEED" && p.status === "open")
        .length,
      OFFER: posts.filter((p) => p.type === "OFFER" && p.status === "open")
        .length,
    };
  }, [posts]);

  return (
    <div className="px-4 pb-32 pt-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Community board</h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          Post what you need. Offer what you can.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Post types"
        className="mb-4 grid grid-cols-2 rounded-full bg-moss-100 p-1 dark:bg-moss-900"
      >
        {(["NEED", "OFFER"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`touch-target rounded-full text-sm font-semibold transition-colors ${
              tab === t
                ? "bg-white text-canopy-800 shadow-sm dark:bg-moss-950 dark:text-canopy-200"
                : "text-moss-700 dark:text-moss-300"
            }`}
          >
            {t === "NEED" ? "Needs" : "Offers"}
            <span className="ml-1 text-xs text-moss-500 dark:text-moss-400">
              ({openCount[t]})
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <label className="sr-only" htmlFor="category-filter">
          Filter by category
        </label>
        <select
          id="category-filter"
          className="input"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as Category | "")
          }
        >
          <option value="">All categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="urgency-filter">
          Filter by urgency
        </label>
        <select
          id="urgency-filter"
          className="input"
          value={urgencyFilter}
          onChange={(e) =>
            setUrgencyFilter(e.target.value as Urgency | "")
          }
        >
          {URGENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="board-search" className="sr-only">
          Search posts
        </label>
        <input
          id="board-search"
          type="search"
          className="input"
          placeholder="Search titles and descriptions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visiblePosts.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <ul className="flex flex-col gap-3">
          {visiblePosts.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                posterName={memberName.get(p.postedBy) ?? "Member"}
                isCurrentMember={p.postedBy === currentMember?.publicKey}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex gap-2 rounded-full bg-white/90 p-1 shadow-lg backdrop-blur dark:bg-moss-900/95">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/post/new?type=NEED`)}
          >
            <span aria-hidden="true">{"➕"}</span> Post a need
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/post/new?type=OFFER`)}
          >
            <span aria-hidden="true">{"\u{1F91D}"}</span> Post an offer
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const message =
    tab === "NEED"
      ? "No needs match these filters yet. If you need help, post something — asking is never gated in a timebank."
      : "No offers match these filters yet. What could you share with your community this week?";
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-4xl" aria-hidden="true">
        {"\u{1F331}"}
      </div>
      <p className="max-w-sm text-sm text-moss-600 dark:text-moss-300">
        {message}
      </p>
    </div>
  );
}
