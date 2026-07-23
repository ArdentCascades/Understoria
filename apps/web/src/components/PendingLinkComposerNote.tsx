/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { textContainsLink } from "@/lib/markdown";
import { trustStatusWithInvites } from "@/lib/vouch";

/**
 * The poster-side half of the pending-author link gate: a calm inline
 * notice under a Markdown-enabled composer, shown only when the CURRENT
 * member's trust is still pending AND the draft actually contains a
 * link. Informational, never blocking — the post goes through; readers
 * just can't tap the link until the community has vouched for the
 * author. Same founder-capture posture as `inviteIssuanceAllowed`:
 * without a capture (`founderRoots` empty) the rooted computation has
 * no anchor, so we say nothing rather than guess at someone's status.
 */
export function PendingLinkComposerNote({ draft }: { draft: string }) {
  const { t } = useTranslation();
  const { currentMember, vouches, invites, founderRoots } = useApp();

  const pending = useMemo(() => {
    if (!currentMember || !founderRoots || founderRoots.size === 0) return false;
    if (!vouches || !invites) return false;
    return (
      trustStatusWithInvites(currentMember.publicKey, {
        vouches,
        invites,
        founderRoots,
      }) === "pending_trust"
    );
  }, [currentMember, vouches, invites, founderRoots]);

  if (!pending || !textContainsLink(draft)) return null;

  return (
    <p
      role="note"
      className="rounded-xl bg-moss-50 px-3 py-2 text-xs text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
    >
      {t("markdown.pendingLink.composerNote")}
    </p>
  );
}
