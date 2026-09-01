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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { createAudioUrl, releaseAudioUrl } from "@/lib/audioUrls";
import { isTranscriptionEnabled } from "@/lib/transcription";

/**
 * Plays a decrypted voice note (docs/message-relay.md §10). The
 * base64 audio exists in the clear only transiently: it becomes an
 * in-memory Blob + object URL for the lifetime of this component and
 * the URL is revoked on unmount — nothing plaintext is written
 * anywhere. The URL is minted through the audio-URL registry
 * (lib/audioUrls.ts) so a panic purge can revoke it even while the
 * player is still mounted (#476). Native <audio controls>
 * deliberately: familiar, keyboard accessible, and it handles both
 * codecs (Opus/WebM from most platforms, AAC/MP4 from iOS Safari)
 * without us guessing.
 */
type TranscriptState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "done"; text: string }
  | { kind: "empty" }
  | { kind: "no_model" }
  | { kind: "node_no_model" }
  | { kind: "failed" };

export function VoicePlayer({
  audioBase64,
  mime,
  durationMs,
  transcriptKey,
}: {
  audioBase64: string;
  mime: string;
  durationMs: number;
  /** Stable clip identity for the encrypted transcript twin
   *  (db/transcripts.ts) — "msg:<id>" / "blob:<id>". Omitted for
   *  ephemeral clips (the recorder preview): those transcribe
   *  in-memory only. */
  transcriptKey?: string;
}) {
  const { t, i18n } = useTranslation();
  const [failed, setFailed] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptState>({
    kind: "idle",
  });
  // Sync read of the per-device preference — off (the default) means
  // zero transcription UI, zero engine bytes, zero cost (V7 #477).
  const transcriptionOn = isTranscriptionEnabled();

  // A clip already transcribed shows its caption immediately — each
  // clip is paid for at most once (#477 Phase 2). The twin is
  // ciphertext at rest; this decrypts for the current member only.
  useEffect(() => {
    if (!transcriptionOn || transcriptKey === undefined) return;
    let alive = true;
    void (async () => {
      const { readTranscript } = await import("@/db/transcripts");
      const stored = await readTranscript(transcriptKey);
      if (alive && stored !== null) {
        setTranscript({ kind: "done", text: stored });
      }
    })();
    return () => {
      alive = false;
    };
    // transcriptionOn is a render-time localStorage read, not state,
    // so the key is the only real dependency.
  }, [transcriptKey, transcriptionOn]);

  async function handleTranscribe() {
    setTranscript({ kind: "running" });
    // The 5.8 MB engine chunk loads only here, on the member's tap.
    const { transcribeClip } = await import("@/lib/transcriptionEngine");
    const outcome = await transcribeClip(audioBase64, i18n.resolvedLanguage);
    if (outcome.kind === "ok" && transcriptKey !== undefined) {
      // Persist the twin (boxed under the member's own key). Failure
      // to persist never blocks the caption the member just paid for.
      const { saveTranscript } = await import("@/db/transcripts");
      void saveTranscript(
        transcriptKey,
        i18n.resolvedLanguage ?? "en",
        outcome.text,
      );
    }
    setTranscript(
      outcome.kind === "ok"
        ? { kind: "done", text: outcome.text }
        : outcome.kind === "empty"
          ? { kind: "empty" }
          : outcome.kind === "no_model"
            ? { kind: "no_model" }
            : outcome.kind === "node_no_model"
              ? { kind: "node_no_model" }
              : { kind: "failed" },
    );
  }

  const url = useMemo(() => {
    try {
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return createAudioUrl(new Blob([bytes], { type: mime }));
    } catch {
      return null;
    }
  }, [audioBase64, mime]);

  useEffect(() => {
    return () => releaseAudioUrl(url);
  }, [url]);

  const seconds = Math.max(1, Math.round(durationMs / 1000));

  if (url === null || failed) {
    return (
      <p className="text-sm italic opacity-70">
        {t("messages.voice.playbackFailed")}
      </p>
    );
  }

  return (
    <div className="min-w-[220px]">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the
          recording is the member's own speech; captions arrive with
          the optional on-device transcription work (issue V7). */}
      <audio
        controls
        preload="metadata"
        src={url}
        className="w-full max-w-full"
        aria-label={t("messages.voice.playerLabel", { seconds })}
        onError={() => setFailed(true)}
      />
      <p className="mt-0.5 text-xs opacity-60">
        {t("messages.voice.durationLine", { seconds })}
      </p>
      {transcriptionOn && (
        <div className="mt-1 text-sm">
          {transcript.kind === "idle" && (
            <button
              type="button"
              className="text-xs font-medium underline underline-offset-2"
              onClick={() => void handleTranscribe()}
            >
              {t("messages.voice.transcribe")}
            </button>
          )}
          {transcript.kind === "running" && (
            <p role="status" className="text-xs opacity-70">
              {t("messages.voice.transcribing")}
            </p>
          )}
          {transcript.kind === "done" && (
            // Phase 1: in-memory caption, gone when the screen
            // closes. Phase 2 stores the encrypted twin
            // (docs/transcription-plan.md D7).
            <p className="whitespace-pre-wrap">
              {t("messages.voice.transcriptLine", { text: transcript.text })}
            </p>
          )}
          {transcript.kind === "empty" && (
            <p className="text-xs italic opacity-70">
              {t("messages.voice.transcriptEmpty")}
            </p>
          )}
          {transcript.kind === "no_model" && (
            <p className="text-xs opacity-70">
              {t("messages.voice.transcriptNoModel")}
            </p>
          )}
          {transcript.kind === "node_no_model" && (
            // Distinct from no_model: pointing at a Settings download
            // that doesn't exist is a door with nothing behind it.
            <p className="text-xs opacity-70">
              {t("messages.voice.transcriptNodeNoModel")}
            </p>
          )}
          {transcript.kind === "failed" && (
            <p className="text-xs italic opacity-70">
              {t("messages.voice.transcriptFailed")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
