import { CATEGORY_META } from "@/lib/categories";
import type { Category } from "@/types";

export function CategoryBadge({
  category,
  size = "md",
}: {
  category: Category;
  size?: "sm" | "md";
}) {
  const meta = CATEGORY_META[category];
  const base =
    "inline-flex items-center gap-1.5 rounded-full bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100";
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };
  return (
    <span className={`${base} ${sizes[size]}`}>
      <span aria-hidden="true">{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
