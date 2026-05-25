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
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DESIGN_PRINCIPLES } from "@/content/design-principles";

export function WhyTooltip({ principleId }: { principleId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const principle = DESIGN_PRINCIPLES.find((p) => p.id === principleId);
  if (!principle) return null;

  return (
    <span className="inline-block align-middle">
      <button
        type="button"
        className="ml-1 text-xs text-moss-400 underline-offset-2 hover:text-moss-600 hover:underline dark:text-moss-500 dark:hover:text-moss-300"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {t("why.trigger")}
      </button>
      {open && (
        <span
          className="mt-1 block rounded-lg bg-moss-50 px-3 py-2 text-xs text-moss-700 dark:bg-moss-900/60 dark:text-moss-200"
          role="note"
        >
          <span className="font-medium">{principle.statement}</span>{" "}
          {principle.example}{" "}
          <Link
            to="/profile#design-principles"
            className="font-medium text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
          >
            {t("why.readMore")}
          </Link>
        </span>
      )}
    </span>
  );
}
