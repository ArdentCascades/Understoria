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

/**
 * The transcription engine (docs/transcription-plan.md §3, V7 #477).
 *
 * One clip at a time, on demand, in vosk-browser's worker; the
 * engine is loaded lazily (its 5.8 MB chunk is precache-excluded),
 * fed ONLY local bytes, and terminated when the clip is done — a
 * cheap phone pays for exactly what the member asked for, while
 * they're asking, and nothing stays resident afterward.
 *
 * No network during inference, by construction: the model reaches
 * the worker as an object URL over bytes already verified and read
 * from Cache Storage (transcriptionModels.ts), and the audio as a
 * decoded Float32Array. Nothing in this module is ever handed a
 * remote URL — the tests assert that property on this file's
 * imports rather than trusting a comment.
 */

import {
  canRunTranscription,
  isTranscriptionEnabled,
} from "./transcription";
import {
  fetchModelManifest,
  modelForLanguage,
  readModelBytes,
} from "./transcriptionModels";

/** A hung engine must not hold the UI hostage: past this, tear it
 *  down and report failure. Generous — a slow phone legitimately
 *  takes a minute or two on a long clip. */
export const TRANSCRIBE_TIMEOUT_MS = 120_000;

/** Settle window after the final flush: recognizer results ride an
 *  ordered worker port, so once retrieveFinalResult() is in flight,
 *  a quiet second means everything has arrived. (The worker offers
 *  no flush acknowledgement to await instead.) */
export const RESULT_SETTLE_MS = 1_000;

/** Samples per worker message — bounds message size, keeps the UI
 *  thread's send loop cheap. */
const CHUNK_SAMPLES = 16_384;

export type TranscribeOutcome =
  | { kind: "ok"; text: string }
  /** Recognizer ran fine and heard nothing it could turn into words. */
  | { kind: "empty" }
  /** No verified model on this device for the app language —
   *  Settings is where the download lives. */
  | { kind: "no_model" }
  /** This device (or this deployment's CSP) can't run WASM. */
  | { kind: "unsupported" }
  | { kind: "failed" };

/** Decode a clip to mono float samples. Decoding happens on the
 *  main thread (milliseconds for sub-minute clips) at whatever rate
 *  the decoder yields — Safari ignores the context rate — and the
 *  true rate rides along for the recognizer to resample. */
async function decodeToMono(
  bytes: ArrayBuffer,
): Promise<{ samples: Float32Array; sampleRate: number }> {
  const ctx = new OfflineAudioContext(1, 1, 44_100);
  const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
    // Older Safari only honors the callback form; modern engines
    // return a promise. Feed both into one settle — a promise
    // ignores the second resolution.
    const maybe = ctx.decodeAudioData(bytes, resolve, reject);
    if (maybe && typeof maybe.then === "function") {
      maybe.then(resolve, reject);
    }
  });
  const channels = decoded.numberOfChannels;
  const mono = new Float32Array(decoded.length);
  for (let c = 0; c < channels; c++) {
    const data = decoded.getChannelData(c);
    for (let i = 0; i < data.length; i++) mono[i] += data[i] / channels;
  }
  return { samples: mono, sampleRate: decoded.sampleRate };
}

function base64ToBytes(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Transcribe one clip for the member's own eyes. Every failure mode
 * maps to an outcome the UI can say honestly; audio playback is
 * never affected by any of them.
 */
export async function transcribeClip(
  audioBase64: string,
  appLanguage: string | undefined,
): Promise<TranscribeOutcome> {
  if (!isTranscriptionEnabled() || !canRunTranscription()) {
    return { kind: "unsupported" };
  }
  const manifest = await fetchModelManifest();
  const entry = modelForLanguage(manifest, appLanguage);
  if (entry === null) return { kind: "no_model" };
  const modelBytes = await readModelBytes(entry);
  if (modelBytes === null) return { kind: "no_model" };

  let modelUrl: string | null = null;
  let model: { terminate(): void } | null = null;
  let timer: number | undefined;
  try {
    const { samples, sampleRate } = await decodeToMono(
      base64ToBytes(audioBase64),
    );

    const vosk = await import("vosk-browser");
    modelUrl = URL.createObjectURL(
      new Blob([modelBytes], { type: "application/octet-stream" }),
    );

    const text = await new Promise<string>((resolve, reject) => {
      timer = window.setTimeout(
        () => reject(new Error("transcribe timeout")),
        TRANSCRIBE_TIMEOUT_MS,
      );
      void (async () => {
        const loaded = await vosk.createModel(modelUrl!, 0);
        model = loaded;
        const recognizer = new loaded.KaldiRecognizer(sampleRate);
        recognizer.setWords(false);
        const pieces: string[] = [];
        let settle: number | undefined;
        const settleSoon = () => {
          if (settle !== undefined) clearTimeout(settle);
          settle = window.setTimeout(
            () => resolve(pieces.join(" ").trim()),
            RESULT_SETTLE_MS,
          );
        };
        recognizer.on("result", (message) => {
          const t = (
            message as { result?: { text?: string } }
          ).result?.text?.trim();
          if (t) pieces.push(t);
          settleSoon();
        });
        for (let i = 0; i < samples.length; i += CHUNK_SAMPLES) {
          recognizer.acceptWaveformFloat(
            samples.subarray(i, i + CHUNK_SAMPLES) as Float32Array,
            sampleRate,
          );
        }
        recognizer.retrieveFinalResult();
        settleSoon();
      })().catch(reject);
    });

    return text === "" ? { kind: "empty" } : { kind: "ok", text };
  } catch {
    return { kind: "failed" };
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    // Free the worker + WASM memory the moment the clip is done —
    // resident model memory is exactly what a cheap phone can't
    // spare between transcriptions.
    try {
      // Cast past control-flow analysis: the assignment happens
      // inside the promise executor's closure, which TS's narrowing
      // doesn't track from here.
      (model as { terminate(): void } | null)?.terminate();
    } catch {
      // Already down.
    }
    if (modelUrl !== null) URL.revokeObjectURL(modelUrl);
  }
}
