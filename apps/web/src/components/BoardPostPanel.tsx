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
import { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DockedPanel } from "@/components/DockedPanel";
import PostDetailPage from "@/pages/PostDetail";

// The board's docked post panel (docs/desktop-power-tools.md plan 3):
// /post/:id is nested UNDER the Board route, so at lg+ a post opens
// beside the card grid — the board (tab, filters, search, scroll)
// stays mounted, and clicking the next card swaps the panel. Below
// lg it takes the whole viewport, which reads exactly like the
// standalone post page always did.
//
// One URL per post, deliberately: every existing /post/:id link and
// share URL keeps working, and a shared deep link now gets the board
// behind the post for free. The content is the REAL PostDetailPage —
// same claim/confirm buttons, exchange narrative, menus, and share
// links (which keep the canonical /post/:id URL).
//
// Close keeps the current query string (the board's ?tab= lives in
// the URL) so dismissing a post from the Offers tab lands back on
// the Offers tab, not the default.
export function BoardPostPanel() {
  const { id } = useParams<{ id: string }>();
  const { search } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const close = useCallback(
    () => navigate({ pathname: "/", search }),
    [navigate, search],
  );

  return (
    <DockedPanel
      ariaLabel={t("board.panel.ariaLabel")}
      closeLabel={t("board.panel.close")}
      closeShortLabel={t("board.panel.closeShort")}
      onClose={close}
      swapKey={id}
    >
      <PostDetailPage />
    </DockedPanel>
  );
}
