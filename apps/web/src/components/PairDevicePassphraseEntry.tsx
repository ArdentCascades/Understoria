/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { wordlist } from "@scure/bip39/wordlists/english";

interface PairDevicePassphraseEntryProps {
  /** Number of word slots. Should match the source device's
   *  passphrase length — default 6 per design doc §5.3. */
  wordCount?: number;
  /** Fires when the member submits a complete passphrase. The
   *  parent unwraps the envelope. */
  onSubmit: (passphrase: string) => void;
  /** Fires when the member cancels back to the capture step. */
  onCancel: () => void;
  /** Set by the parent when an unwrap attempt failed with the
   *  rendered passphrase. Shows an inline message and lets the
   *  member edit. */
  unwrapError?: string | null;
}

/**
 * Destination-side passphrase entry — six word slots with BIP39
 * autocomplete drawn from the English wordlist (the same one the
 * source device picks from). Matches the visual convention from
 * hardware-wallet recovery UIs.
 *
 * The component doesn't do unwrap itself — that's the parent. It
 * just collects six words and hands them back as a space-separated
 * string when submitted.
 */
export function PairDevicePassphraseEntry({
  wordCount = 6,
  onSubmit,
  onCancel,
  unwrapError,
}: PairDevicePassphraseEntryProps) {
  const { t } = useTranslation();
  const datalistId = useId();
  const [words, setWords] = useState<string[]>(() =>
    Array.from({ length: wordCount }, () => ""),
  );

  // Cap suggestions to keep the datalist tractable — most browsers
  // render the full list on focus, which is unhelpful at 2048.
  // BIP39 has unique 4-character prefixes, so by the time a member
  // types 3-4 characters they've usually narrowed to a single word.
  const suggestions = useMemo(() => wordlist as readonly string[], []);

  function handleChange(idx: number, value: string) {
    const cleaned = value.toLowerCase().trim();
    setWords((prev) => {
      const next = [...prev];
      next[idx] = cleaned;
      return next;
    });
  }

  function handlePaste(e: React.ClipboardEvent, idx: number) {
    // If a member pastes the whole passphrase into one input, split
    // it across the remaining slots. Convenience for "the other
    // device's screen is right there, just type it once."
    const text = e.clipboardData.getData("text").trim();
    if (!/\s/.test(text)) return; // single word — let default handler run
    e.preventDefault();
    const parts = text.split(/\s+/).map((p) => p.toLowerCase());
    setWords((prev) => {
      const next = [...prev];
      for (let i = 0; i < parts.length && idx + i < next.length; i++) {
        next[idx + i] = parts[i];
      }
      return next;
    });
  }

  const allFilled = words.every((w) => w.length > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allFilled) return;
    onSubmit(words.join(" "));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-moss-600 dark:text-moss-300">
        {t("pairDevice.passphrase.instructions", { count: wordCount })}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {words.map((w, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span className="text-xs text-moss-600 dark:text-moss-300">
              {t("pairDevice.passphrase.wordLabel", { number: i + 1 })}
            </span>
            <input
              className="input font-mono"
              value={w}
              onChange={(e) => handleChange(i, e.target.value)}
              onPaste={(e) => handlePaste(e, i)}
              list={datalistId}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              aria-label={t("pairDevice.passphrase.wordLabel", {
                number: i + 1,
              })}
            />
          </label>
        ))}
      </div>

      {/* Single shared datalist for all six inputs. The browser
          filters by the focused input's value. */}
      <datalist id={datalistId}>
        {suggestions.map((w) => (
          <option key={w} value={w} />
        ))}
      </datalist>

      {unwrapError && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
        >
          {unwrapError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t("common.back")}
        </button>
        <button type="submit" className="btn-primary" disabled={!allFilled}>
          {t("pairDevice.passphrase.unwrap")}
        </button>
      </div>
    </form>
  );
}
