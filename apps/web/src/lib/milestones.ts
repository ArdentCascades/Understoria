import type { Milestone } from "@/types";

export const MILESTONES: Milestone[] = [
  { type: "hours", threshold: 10, label: "10 hours of mutual aid" },
  { type: "hours", threshold: 50, label: "50 hours of mutual aid" },
  { type: "hours", threshold: 100, label: "100 hours of mutual aid" },
  { type: "hours", threshold: 500, label: "500 hours of mutual aid" },
  { type: "hours", threshold: 1000, label: "1,000 hours of mutual aid" },
  { type: "exchanges", threshold: 10, label: "10 exchanges completed" },
  { type: "exchanges", threshold: 50, label: "50 exchanges completed" },
  { type: "exchanges", threshold: 100, label: "100 exchanges completed" },
  { type: "exchanges", threshold: 500, label: "500 exchanges completed" },
  { type: "members", threshold: 10, label: "10 members strong" },
  { type: "members", threshold: 25, label: "25 members strong" },
  { type: "members", threshold: 50, label: "50 members strong" },
  { type: "members", threshold: 100, label: "100 members strong" },
];

export interface MilestoneProgress {
  current: Milestone;
  next: Milestone | null;
  value: number;
  progress: number;
}

export function milestoneProgress(
  type: Milestone["type"],
  value: number,
): MilestoneProgress {
  const typed = MILESTONES.filter((m) => m.type === type).sort(
    (a, b) => a.threshold - b.threshold,
  );
  let current: Milestone = typed[0];
  let next: Milestone | null = typed[0];
  for (let i = 0; i < typed.length; i++) {
    if (value >= typed[i].threshold) {
      current = typed[i];
      next = typed[i + 1] ?? null;
    }
  }
  const prevThreshold = value >= current.threshold ? current.threshold : 0;
  const span = next ? next.threshold - prevThreshold : 1;
  const progress = next
    ? Math.max(0, Math.min(1, (value - prevThreshold) / span))
    : 1;
  return { current, next, value, progress };
}

export function reachedMilestones(
  type: Milestone["type"],
  value: number,
): Milestone[] {
  return MILESTONES.filter((m) => m.type === type && value >= m.threshold);
}
