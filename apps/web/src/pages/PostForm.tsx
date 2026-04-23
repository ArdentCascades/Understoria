import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/state/AppContext";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/categories";
import { createPost } from "@/db/actions";
import type { Category, PostType, Urgency } from "@/types";

export default function PostFormPage() {
  const { currentMember } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialType: PostType =
    (params.get("type") as PostType) === "OFFER" ? "OFFER" : "NEED";

  const [type, setType] = useState<PostType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("other");
  const [hours, setHours] = useState("1");
  const [urgency, setUrgency] = useState<Urgency>("low");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentMember) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Give your post a short title so people know what it's about.");
      return;
    }
    const parsedHours = Number.parseFloat(hours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      setError("Estimated hours must be a positive number.");
      return;
    }
    const days = expiresInDays ? Number.parseInt(expiresInDays, 10) : null;
    const expiresAt =
      days && Number.isFinite(days) && days > 0
        ? Date.now() + days * 24 * 60 * 60 * 1000
        : null;
    try {
      setSubmitting(true);
      await createPost(currentMember!.publicKey, currentMember!.locationZone, {
        type,
        category,
        title,
        description,
        estimatedHours: parsedHours,
        urgency,
        expiresAt,
      });
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {type === "NEED" ? "Post a need" : "Post an offer"}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {type === "NEED"
            ? "What would support look like right now?"
            : "What can you share with the community?"}
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Post type"
        className="mb-5 grid grid-cols-2 rounded-full bg-moss-100 p-1 dark:bg-moss-900"
      >
        {(["NEED", "OFFER"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={type === t}
            onClick={() => setType(t)}
            className={`touch-target rounded-full text-sm font-semibold transition-colors ${
              type === t
                ? "bg-white text-canopy-800 shadow-sm dark:bg-moss-950 dark:text-canopy-200"
                : "text-moss-700 dark:text-moss-300"
            }`}
          >
            {t === "NEED" ? "Need" : "Offer"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Title</span>
          <input
            className="input"
            placeholder={
              type === "NEED"
                ? "e.g. Ride to clinic Thursday"
                : "e.g. Extra soup and bread this week"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Description</span>
          <textarea
            className="input min-h-28"
            placeholder="Add any helpful details — timing, location zone, accessibility, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Category</span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label} —{" "}
                {CATEGORY_META[c].description}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Estimated hours</span>
            <input
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              className="input"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
            <span className="text-xs text-moss-500 dark:text-moss-400">
              One hour of help = one hour of credit, whatever the work.
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Urgency</span>
            <select
              className="input"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
            >
              <option value="low">When you can</option>
              <option value="medium">Soon</option>
              <option value="high">Urgent</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Expires in (days, optional)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            className="input"
            placeholder="Leave blank to keep open"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? "Posting..." : "Post to the board"}
          </button>
        </div>
      </form>
    </div>
  );
}
