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
import { Fragment } from "react";
import { highlightRanges } from "@/lib/messageSearch";

// Renders `text` with every non-overlapping occurrence of `query`
// wrapped in <mark>. Amber, not ember — ember is reserved for
// reciprocity moments per design/README.md; a search hit is an
// "attention" signal that lives in the same space the urgency
// badges already occupy.
//
// Renders plain text when query is empty so callers don't need to
// branch.
export function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const ranges = highlightRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((r, i) => {
    if (r.start > cursor) {
      out.push(<Fragment key={`t${i}`}>{text.slice(cursor, r.start)}</Fragment>);
    }
    out.push(
      <mark
        key={`m${i}`}
        className="rounded-sm bg-amber-100 px-0.5 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    cursor = r.end;
  });
  if (cursor < text.length) {
    out.push(<Fragment key="tend">{text.slice(cursor)}</Fragment>);
  }
  return <>{out}</>;
}
