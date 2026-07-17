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
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { VoicePlayer } from "@/components/VoicePlayer";

/**
 * Voice capture (voice workstream V1, issue #471). Record → review →
 * hand the bytes to the caller; everything stays on this device —
 * this component performs zero network activity by construction.
 *
 * Codec reality: MediaRecorder records Opus/WebM on Chromium and
 * Firefox but AAC/MP4 on iOS Safari (which cannot produce WebM) —
 * and iPhones are the pilot's main platform. `pickRecorderMime`
 * negotiates; the chosen mime travels with the clip so any device
 * can play it back with a plain <audio> element.
 *
 * The length cap (default 45s) auto-stops the recording — the clip
 * up to the cap is kept and goes to review, which respects the
 * member's words better than rejecting the whole take.
 */

export const MAX_CLIP_MS = 45_000;

/** Preference order for recording formats. Exported for tests. */
export function pickRecorderMime(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  // Some browsers record fine with an unspecified type.
  return "";
}

export interface CapturedClip {
  base64: string;
  mime: string;
  durationMs: number;
}

type Phase = "requesting" | "recording" | "review" | "denied";

export function VoiceRecorder({
  maxMs = MAX_CLIP_MS,
  onCapture,
  onCancel,
}: {
  maxMs?: number;
  onCapture: (clip: CapturedClip) => void | Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("requesting");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [clip, setClip] = useState<CapturedClip | null>(null);
  const [sending, setSending] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const teardownCapture = useCallback(() => {
    for (const id of timersRef.current) window.clearInterval(id);
    timersRef.current = [];
    const rec = recorderRef.current;
    recorderRef.current = null;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        // Already stopping — releasing the mic below is what matters.
      }
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setClip(null);
    setElapsedMs(0);
    const mime = pickRecorderMime();
    if (
      mime === null ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setPhase("denied");
      return;
    }
    setPhase("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPhase("denied");
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      ...(mime ? { mimeType: mime } : {}),
      audioBitsPerSecond: 32_000,
    });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const durationMs = Math.min(Date.now() - startedAtRef.current, maxMs);
      const type = recorder.mimeType || mime || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      // FileReader rather than blob.arrayBuffer(): older Safari (and
      // jsdom) lack the latter; a data: URL is already base64.
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";
        const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
        setClip({ base64, mime: type, durationMs });
        setPhase("review");
      };
      reader.readAsDataURL(blob);
    };
    startedAtRef.current = Date.now();
    recorder.start();
    setPhase("recording");
    const ticker = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      // Auto-stop at the cap: keep the take, go to review.
      if (elapsed >= maxMs && recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
        for (const id of timersRef.current) window.clearInterval(id);
        timersRef.current = [];
      }
    }, 200);
    timersRef.current.push(ticker);
  }, [maxMs]);

  useEffect(() => {
    void start();
    return teardownCapture;
  }, [start, teardownCapture]);

  const stopRecording = () => {
    for (const id of timersRef.current) window.clearInterval(id);
    timersRef.current = [];
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const cancel = () => {
    teardownCapture();
    onCancel();
  };

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div
      className="rounded-xl border border-moss-200 bg-white p-3 dark:border-moss-700 dark:bg-moss-800"
      role="group"
      aria-label={t("messages.voice.recorderLabel")}
    >
      {phase === "requesting" && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("messages.voice.requesting")}
        </p>
      )}

      {phase === "denied" && (
        <div className="space-y-2">
          <p className="text-sm text-rose-700 dark:text-rose-300" role="alert">
            {t("messages.voice.micDenied")}
          </p>
          <button type="button" className="btn-ghost text-sm" onClick={cancel}>
            {t("common.close")}
          </button>
        </div>
      )}

      {phase === "recording" && (
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 animate-pulse rounded-full bg-rose-500"
          />
          <span className="text-sm tabular-nums" role="timer">
            {t("messages.voice.recording", {
              elapsed: fmt(elapsedMs),
              max: fmt(maxMs),
            })}
          </span>
          <button
            type="button"
            className="btn-primary min-h-[44px] text-sm"
            onClick={stopRecording}
          >
            {t("messages.voice.stop")}
          </button>
          <button
            type="button"
            className="btn-ghost min-h-[44px] text-sm"
            onClick={cancel}
          >
            {t("common.cancel")}
          </button>
        </div>
      )}

      {phase === "review" && clip && (
        <div className="space-y-2">
          <VoicePlayer
            audioBase64={clip.base64}
            mime={clip.mime}
            durationMs={clip.durationMs}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary min-h-[44px] text-sm"
              disabled={sending}
              aria-busy={sending}
              onClick={() => {
                setSending(true);
                void Promise.resolve(onCapture(clip)).finally(() =>
                  setSending(false),
                );
              }}
            >
              {sending
                ? t("messages.sending")
                : t("messages.voice.sendClip")}
            </button>
            <button
              type="button"
              className="btn-ghost min-h-[44px] text-sm"
              disabled={sending}
              onClick={() => void start()}
            >
              {t("messages.voice.reRecord")}
            </button>
            <button
              type="button"
              className="btn-ghost min-h-[44px] text-sm"
              disabled={sending}
              onClick={cancel}
            >
              {t("messages.voice.discard")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
