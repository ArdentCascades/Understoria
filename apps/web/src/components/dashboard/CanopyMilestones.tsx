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
import { useTranslation } from "react-i18next";
import { milestonesForType, type MilestoneState } from "@/lib/milestones";
import type { NodeConfig } from "@/types";

interface CanopyMilestonesProps {
  totalHours: number;
  totalExchanges: number;
  totalMembers: number;
  /** Labels reached in the current session — those leaves get a
   *  one-time ember tint + fade-in. Pass from
   *  useNewlyReachedMilestones in Dashboard.tsx. */
  newlyReachedLabels: ReadonlySet<string>;
  /** Optional community config — when provided, the rows include the
   *  community's custom milestones alongside the baseline. */
  nodeConfig?: NodeConfig;
}

export function CanopyMilestones({
  totalHours,
  totalExchanges,
  totalMembers,
  newlyReachedLabels,
  nodeConfig,
}: CanopyMilestonesProps) {
  const { t } = useTranslation();
  const hoursRow = milestonesForType("hours", totalHours, nodeConfig);
  const exchangesRow = milestonesForType("exchanges", totalExchanges, nodeConfig);
  const membersRow = milestonesForType("members", totalMembers, nodeConfig);

  return (
    <section className="card mb-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300">
        {t("dashboard.milestones.title")}
      </h2>
      <CanopyRow
        rowLabel={t("dashboard.milestones.hours")}
        leaves={hoursRow}
        newlyReachedLabels={newlyReachedLabels}
      />
      <CanopyRow
        rowLabel={t("dashboard.milestones.exchanges")}
        leaves={exchangesRow}
        newlyReachedLabels={newlyReachedLabels}
      />
      <CanopyRow
        rowLabel={t("dashboard.milestones.members")}
        leaves={membersRow}
        newlyReachedLabels={newlyReachedLabels}
      />
    </section>
  );
}

function CanopyRow({
  rowLabel,
  leaves,
  newlyReachedLabels,
}: {
  rowLabel: string;
  leaves: MilestoneState[];
  newlyReachedLabels: ReadonlySet<string>;
}) {
  return (
    <div className="mb-stack-sm last:mb-0">
      <div className="mb-1 text-xs text-moss-600 dark:text-moss-300">
        {rowLabel}
      </div>
      <ul className="flex flex-wrap items-center gap-2">
        {leaves.map(({ milestone, reached }) => {
          const isFreshlyReached =
            reached && newlyReachedLabels.has(milestone.label);
          return (
            <li key={milestone.label}>
              <CanopyLeaf
                reached={reached}
                isFreshlyReached={isFreshlyReached}
                ariaLabel={milestone.label}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CanopyLeaf({
  reached,
  isFreshlyReached,
  ariaLabel,
}: {
  reached: boolean;
  isFreshlyReached: boolean;
  ariaLabel: string;
}) {
  // Color logic:
  //   - Reached + freshly-reached this session: ember-500 fill, fade-in
  //   - Reached (older): canopy-700 fill
  //   - Unreached: outlined only, moss-300 stroke, no fill
  // The leaf shape borrows the small-leaf SVG from LeafDivider for
  // visual consistency.
  const fill = isFreshlyReached
    ? "fill-ember-500"
    : reached
      ? "fill-canopy-700 dark:fill-canopy-400"
      : "fill-none";
  const stroke = reached
    ? "stroke-current text-canopy-700 dark:text-canopy-400"
    : "stroke-current text-moss-300 dark:text-moss-700";
  const animation = isFreshlyReached ? "animate-fade-in" : "";
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 16 16"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${fill} ${stroke} ${animation}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M8 14V6" />
      <path d="M8 8c-2-3-5-3-7-2 1 3 4 5 7 5" />
      <path d="M8 6c2-3 5-3 7-2-1 3-4 5-7 5" />
    </svg>
  );
}
