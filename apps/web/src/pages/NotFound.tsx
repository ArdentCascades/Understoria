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
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/EmptyState";

// Catch-all for unmatched routes. App.tsx used to fall through to the
// Board, which silently showed the wrong page for a typo'd or stale
// URL. The page title is the lone <h1>; EmptyState carries the calm,
// no-shame copy and the way back, so it renders without its own title
// to keep a single heading on the page.

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="px-4 pb-8 pt-4">
      <h1 className="page-title">{t("notFound.title")}</h1>
      <EmptyState
        illustration="path"
        message={t("notFound.message")}
        action={{ label: t("notFound.cta"), to: "/" }}
      />
    </div>
  );
}
