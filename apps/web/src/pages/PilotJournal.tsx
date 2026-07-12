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
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { BackLink } from "@/components/BackLink";
import { useApp } from "@/state/AppContext";
import {
  MAX_ENTRY_LENGTH,
  addJournalEntry,
  composeJournalText,
  deleteJournalEntry,
  listJournalEntries,
} from "@/db/journal";

// The pilot journal (docs/next-cycle-plans.md Plan 3 §3.3). A
// no-telemetry app's feedback channel: the member writes local notes,
// and the HAND-OFF is the consent ceremony — a "Share my journal"
// plain-text download they physically give the operator (or read at a
// check-in). There is deliberately NO send button, no prompt, no
// streak. Everything here is a local read/write over rows this device
// alone holds; nothing federates.

export default function PilotJournalPage() {
  const { t, i18n } = useTranslation();
  const { currentMember } = useApp();
  const memberKey = currentMember?.publicKey ?? null;

  const entries = useLiveQuery(
    () => (memberKey ? listJournalEntries(memberKey) : Promise.resolve([])),
    [memberKey],
    [],
  );

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!memberKey || draft.trim() === "") return;
    setPending(true);
    try {
      const saved = await addJournalEntry(memberKey, draft);
      if (saved) setDraft("");
    } finally {
      setPending(false);
    }
  }

  function handleShare() {
    const text = composeJournalText(entries, (ms) =>
      new Date(ms).toLocaleString(i18n.resolvedLanguage),
    );
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `understoria-pilot-journal-${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <BackLink
          to="/help"
          label={t("pilotJournal.back")}
          preferHistory
          className="btn-ghost -ml-2 text-sm"
        />
        <h1 className="page-title mt-2">{t("pilotJournal.title")}</h1>
        <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
          {t("pilotJournal.intro")}
        </p>
        <p className="mt-2 text-sm text-moss-600 dark:text-moss-300">
          {t("pilotJournal.privacyNote")}
        </p>
      </header>

      <form className="card mb-4" onSubmit={(e) => void handleAdd(e)}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            {t("pilotJournal.newLabel")}
          </span>
          <textarea
            className="input min-h-[6rem]"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_ENTRY_LENGTH}
            placeholder={t("pilotJournal.placeholder")}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="submit"
            className="btn-primary min-h-[44px]"
            disabled={pending || draft.trim() === "" || memberKey === null}
          >
            {t("pilotJournal.addButton")}
          </button>
          {entries.length > 0 && (
            <button
              type="button"
              className="btn-secondary min-h-[44px]"
              onClick={handleShare}
            >
              {t("pilotJournal.shareButton")}
            </button>
          )}
        </div>
      </form>

      {entries.length === 0 ? (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("pilotJournal.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-moss-200 p-3 dark:border-moss-800"
            >
              <p className="whitespace-pre-wrap text-sm">{entry.text}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <time className="text-xs text-moss-600 dark:text-moss-300">
                  {new Date(entry.createdAt).toLocaleString(
                    i18n.resolvedLanguage,
                  )}
                </time>
                <button
                  type="button"
                  className="btn-ghost min-h-[44px] text-xs"
                  onClick={() => {
                    if (memberKey)
                      void deleteJournalEntry(entry.id, memberKey);
                  }}
                >
                  {t("pilotJournal.deleteButton")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
