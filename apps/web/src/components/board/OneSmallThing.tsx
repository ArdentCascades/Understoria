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
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatHours } from "@/lib/format";
import {
  shuffleCandidates,
  smallThingCandidates,
  type SmallThing,
} from "@/lib/oneSmallThing";
import type { Post, Project, ProjectTask } from "@/types";

// The "one small thing" card (lib/oneSmallThing.ts): collapsed to a
// single quiet button until asked; then exactly ONE claimable thing
// at a time, with "show me another" to walk a shuffled order. The
// card explains itself — what it's for (skipping the choosing on a
// low-energy day) and what it is NOT (random, not ranked; nothing
// reads your history). Opening a pick lands on the task/post page,
// where the claim affordance already lives — this card never claims
// anything itself.
export function OneSmallThing({
  memberKey,
  tasks,
  projects,
  posts,
  blockedKeys,
}: {
  memberKey: string;
  tasks: readonly ProjectTask[];
  projects: readonly Project[];
  posts: readonly Post[];
  blockedKeys: ReadonlySet<string>;
}) {
  const { t } = useTranslation();
  // null = collapsed. The shuffled order is drawn once per opening,
  // so "show me another" cycles without repeats until exhausted.
  const [deck, setDeck] = useState<SmallThing[] | null>(null);
  const [index, setIndex] = useState(0);

  function open() {
    setDeck(
      shuffleCandidates(
        smallThingCandidates({ memberKey, tasks, projects, posts, blockedKeys }),
      ),
    );
    setIndex(0);
  }

  if (deck === null) {
    // Collapsed: an inline "do this" action, sized to sit in the
    // Board's discovery row beside "Ways to plug in". No own margin —
    // the row wrapper owns spacing.
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
        onClick={open}
      >
        <span aria-hidden="true">🎲</span>
        {t("board.oneSmallThing.button")}
      </button>
    );
  }

  const pick = deck[index % Math.max(1, deck.length)];

  return (
    <section
      aria-labelledby="one-small-thing-title"
      // w-full so that, once opened inside the Board's flex discovery
      // row, the card takes its own line and the sibling link wraps
      // beneath it rather than squeezing alongside.
      className="card w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <h2
          id="one-small-thing-title"
          className="text-xs font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
        >
          {t("board.oneSmallThing.heading")}
        </h2>
        <button
          type="button"
          className="btn-ghost -mr-2 -mt-1 text-xs"
          onClick={() => setDeck(null)}
        >
          {t("board.oneSmallThing.close")}
        </button>
      </div>
      <p className="mt-0.5 text-xs text-moss-600 dark:text-moss-300">
        {t("board.oneSmallThing.why")}
      </p>
      {deck.length === 0 ? (
        <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
          {t("board.oneSmallThing.empty")}
        </p>
      ) : (
        <>
          <p className="mt-2">
            <Link
              to={pick.to}
              className="text-base font-semibold text-canopy-800 underline-offset-2 hover:underline dark:text-canopy-200"
            >
              {pick.title}
            </Link>
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-moss-600 dark:text-moss-300">
            <span className="chip bg-moss-100 text-moss-700 dark:bg-moss-800 dark:text-moss-200">
              {pick.kind === "task"
                ? t("board.oneSmallThing.kindTask")
                : t("board.oneSmallThing.kindNeed")}
            </span>
            {pick.hours > 0 && (
              <span className="chip bg-canopy-50 text-canopy-900 dark:bg-canopy-950/50 dark:text-canopy-100">
                {formatHours(pick.hours)}
              </span>
            )}
            {pick.contextTitle && <span>{pick.contextTitle}</span>}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link to={pick.to} className="btn-secondary text-sm">
              {t("board.oneSmallThing.open")}
            </Link>
            {deck.length > 1 && (
              <button
                type="button"
                className="text-sm text-canopy-700 underline decoration-canopy-300 underline-offset-2 hover:text-canopy-900 dark:text-canopy-300 dark:decoration-canopy-700 dark:hover:text-canopy-100"
                onClick={() => setIndex((i) => (i + 1) % deck.length)}
              >
                {t("board.oneSmallThing.another")}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
