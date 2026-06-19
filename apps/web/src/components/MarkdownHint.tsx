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

// A tiny, muted one-liner placed directly under a Markdown-enabled text
// editor. The hint shows the literal syntax (**bold**, _italic_, - lists) so
// it teaches the supported subset by example.
export function MarkdownHint() {
  const { t } = useTranslation();
  return (
    <p className="mt-1 text-xs text-moss-500 dark:text-moss-400">
      {t("common.markdownHint")}
    </p>
  );
}
