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

/**
 * Plays a decrypted voice note (docs/message-relay.md §10). The
 * base64 audio exists in the clear only transiently: it becomes an
 * in-memory Blob + object URL for the lifetime of this component and
 * the URL is revoked on unmount — nothing plaintext is written
 * anywhere. Native <audio controls> deliberately: familiar, keyboard
 * accessible, and it handles both codecs (Opus/WebM from most
 * platforms, AAC/MP4 from iOS Safari) without us guessing.
 */
export function VoicePlayer({
  audioBase64,
  mime,
  durationMs,
}: {
  audioBase64: string;
  mime: string;
  durationMs: number;
}) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  const url = useMemo(() => {
    try {
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes], { type: mime }));
    } catch {
      return null;
    }
  }, [audioBase64, mime]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
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
    </div>
  );
}
