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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import type { BoardNudgeStatus } from "@/lib/boardNudge";
import { readSubmitConfig } from "@/lib/nodeSubmit";
import {
  dismissNotJoinedNudge,
  isNotJoined,
  isNotJoinedNudgeDismissed,
} from "@/lib/notJoinedNudge";

// The §5.1.4 not-joined affordance (`docs/invite-redemption.md`): a
// member who proceeded past a failed invite redemption and onboarded
// standalone is participating on an island that LOOKS like success.
// This quiet card names the state honestly and offers the one useful
// action — opening /invite, which now carries the paste-the-link
// recovery input.
//
// An affordance, not a warning: no red, no countdown, no nagging
// cadence (solidarity-not-shame, no-notifications). Dismissal is
// per-identity and permanent; /invite stays reachable from Settings.
//
// Detection (all live via useApp / readSubmitConfig): a current member
// exists, no redeemed invite row names them, and no community node is
// configured — see lib/notJoinedNudge.ts `isNotJoined`.

export function useNotJoinedNudge(): BoardNudgeStatus {
  const { currentMember, invites } = useApp();
  const memberKey = currentMember?.publicKey ?? null;
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [nodeUrl, setNodeUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!memberKey) {
      // No identity → the card can never show; resolve so lower-
      // priority prompts aren't blocked behind an unanswerable check.
      setDismissed(false);
      setNodeUrl("");
      return;
    }
    void isNotJoinedNudgeDismissed(memberKey).then((v) => {
      if (!cancelled) setDismissed(v);
    });
    void readSubmitConfig().then((cfg) => {
      if (!cancelled) setNodeUrl(cfg.url);
    });
    return () => {
      cancelled = true;
    };
  }, [memberKey]);

  async function handleDismiss() {
    if (!memberKey) return;
    await dismissNotJoinedNudge(memberKey);
    setDismissed(true);
  }

  const ready = dismissed !== null && nodeUrl !== null;
  const visible =
    ready &&
    dismissed === false &&
    isNotJoined({
      memberKey,
      invites,
      communityNodeUrl: nodeUrl ?? "",
    });

  return {
    ready,
    visible,
    node: <NotJoinedNudgeCard onDismiss={handleDismiss} />,
  };
}

function NotJoinedNudgeCard({
  onDismiss,
}: {
  onDismiss: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="region"
      aria-label={t("notJoinedCard.label")}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-moss-200
                 bg-moss-50 px-3 py-2 text-sm
                 dark:border-moss-800 dark:bg-moss-900/40"
    >
      <p className="font-medium">{t("notJoinedCard.title")}</p>
      <p className="text-moss-700 dark:text-moss-200">
        {t("notJoinedCard.body")}
      </p>
      <div className="flex gap-2 self-end">
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => void onDismiss()}
        >
          {t("notJoinedCard.dismiss")}
        </button>
        <Link to="/invite" className="btn-secondary text-xs">
          {t("notJoinedCard.cta")}
        </Link>
      </div>
    </div>
  );
}
