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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Post } from "@/types";
import { fetchAudioBlob } from "@/lib/audioBlobs";
import { VoicePlayer } from "@/components/VoicePlayer";

/**
 * Plays a voice post's recording (voice board, #474). The post row
 * carries only the signed content-address reference; the bytes live
 * on the community node and are fetched on demand — `eager` on the
 * post panel (the member opened the post to hear it), tap-to-load on
 * Board cards so scrolling a long board doesn't pull every recording.
 * A missing blob (uploader still offline, or a peer community's post
 * whose audio doesn't replicate before V8/#478) renders as a plain
 * "not available yet" line and the next attempt simply retries.
 */
export function AudioPostPlayer({
  audio,
  eager = false,
}: {
  audio: NonNullable<Post["audio"]>;
  eager?: boolean;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<
    | { phase: "idle" }
    | { phase: "loading" }
    | { phase: "unavailable" }
    | { phase: "ready"; base64: string; mime: string }
  >({ phase: eager ? "loading" : "idle" });

  const seconds = Math.max(1, Math.round(audio.durationMs / 1000));

  useEffect(() => {
    if (state.phase !== "loading") return;
    let cancelled = false;
    void fetchAudioBlob(audio.blobId).then((blob) => {
      if (cancelled) return;
      setState(
        blob
          ? { phase: "ready", base64: blob.base64, mime: blob.mime }
          : { phase: "unavailable" },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [state.phase, audio.blobId]);

  if (state.phase === "ready") {
    return (
      <VoicePlayer
        audioBase64={state.base64}
        mime={state.mime}
        durationMs={audio.durationMs}
      />
    );
  }

  if (state.phase === "unavailable") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-moss-600 dark:text-moss-300">
        <span>{t("voicePost.unavailable")}</span>
        <button
          type="button"
          className="btn-ghost min-h-[44px] text-sm"
          onClick={() => setState({ phase: "loading" })}
        >
          {t("voicePost.retry")}
        </button>
      </div>
    );
  }

  if (state.phase === "loading") {
    return (
      <p className="text-sm text-moss-600 dark:text-moss-300" role="status">
        {t("voicePost.loading")}
      </p>
    );
  }

  return (
    <button
      type="button"
      className="btn-secondary min-h-[44px] text-sm"
      onClick={() => setState({ phase: "loading" })}
    >
      <span aria-hidden="true" className="mr-1">
        🎙️
      </span>
      {t("voicePost.load", { seconds })}
    </button>
  );
}
