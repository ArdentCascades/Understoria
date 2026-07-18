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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OneSmallThing } from "@/components/board/OneSmallThing";
import type { Post, Project, ProjectTask } from "@/types";

/**
 * The Board's two "help me find something to do" affordances:
 *   • "One small thing" — the choice-paralysis escape hatch; expands
 *     to exactly one claimable pick at a time (lib/oneSmallThing.ts —
 *     feasibility filters + a shuffle, never a recommender).
 *   • "Ways to plug in" — the browsable shelf's only doorway
 *     (docs/ways-to-plug-in.md §8 ruling 1: a link, not a tab). No
 *     count badge: §4's never-a-nudge boundary applies here too.
 *
 * Rendered in TWO DOM positions on the Board (the pattern the filter
 * rails once used, kept here deliberately): a copy inside the sticky
 * command band (`hidden lg:flex`, desktop-visible — the band has free
 * width beside the capped search input) and a copy in the page flow
 * (`lg:hidden`, phone-visible). The band must stay minimal on phones
 * — every sticky row is viewport permanently lost on a small screen —
 * so the links join it only where the width is free. This component
 * carries NO layout classes; wrappers at each render site own those.
 */
export interface DiscoveryLinksProps {
  memberKey: string;
  tasks: ProjectTask[];
  projects: Project[];
  posts: Post[];
  blockedKeys: ReadonlySet<string>;
}

export function DiscoveryLinks({
  memberKey,
  tasks,
  projects,
  posts,
  blockedKeys,
}: DiscoveryLinksProps) {
  const { t } = useTranslation();
  return (
    <>
      <OneSmallThing
        memberKey={memberKey}
        tasks={tasks}
        projects={projects}
        posts={posts}
        blockedKeys={blockedKeys}
      />
      <Link
        to="/plug-in"
        className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-moss-600 underline-offset-2 hover:text-canopy-700 hover:underline focus-visible:underline dark:text-moss-300 dark:hover:text-canopy-300"
      >
        <span aria-hidden="true">🔌</span>
        {t("board.plugInLink")}
      </Link>
    </>
  );
}
