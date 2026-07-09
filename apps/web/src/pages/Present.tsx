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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { InviteQRCode } from "@/components/InviteQRCode";
import { formatAbsoluteDateTime } from "@/lib/format";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { useSlideshow } from "@/lib/useSlideshow";
import { useWakeLock } from "@/lib/useWakeLock";
import {
  buildGatheringSlides,
  hasActionableSlides,
  type GatheringSlide,
} from "@/lib/gatheringSlides";

// Dwell per slide (docs/gathering-screen.md §6.2). ~12s: long enough to
// read and raise a phone, short enough to keep the wall alive.
const DWELL_MS = 12_000;
// Re-select slides on this cadence so a past event or a just-claimed task
// ages out of the rotation even while nobody touches the screen. The live
// Dexie data already re-renders on writes; this only advances wall-clock
// `now` for the time-based filters.
const REFRESH_MS = 30_000;
const CONTROLS_HIDE_MS = 3_000;

function useViewportMin(): number {
  const [min, setMin] = useState(() =>
    typeof window === "undefined"
      ? 800
      : Math.min(window.innerWidth, window.innerHeight),
  );
  useEffect(() => {
    const onResize = () =>
      setMin(Math.min(window.innerWidth, window.innerHeight));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return min;
}

export default function PresentPage() {
  const { t } = useTranslation();
  const app = useApp();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [presenting, setPresenting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const viewportMin = useViewportMin();
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const anonymous = t("present.anonymous");

  const slides = useMemo(
    () =>
      buildGatheringSlides({
        origin,
        events: app.events,
        eventCancellations: app.eventCancellations,
        eventRsvps: app.eventRsvps,
        projects: app.projects,
        projectTasks: app.projectTasks,
        posts: app.posts,
        members: app.members,
        currentMemberKey: app.currentMember?.publicKey ?? null,
        now,
        anonymousName: anonymous,
      }),
    [
      origin,
      anonymous,
      now,
      app.events,
      app.eventCancellations,
      app.eventRsvps,
      app.projects,
      app.projectTasks,
      app.posts,
      app.members,
      app.currentMember,
    ],
  );

  const { index, next, prev } = useSlideshow(slides.length, {
    dwellMs: DWELL_MS,
    paused: paused || !presenting,
  });
  useWakeLock(presenting);

  const bumpControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => setControlsVisible(false),
      CONTROLS_HIDE_MS,
    );
  }, []);

  const stop = useCallback(() => {
    setPresenting(false);
    setPaused(false);
    if (typeof document !== "undefined" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const start = useCallback(() => {
    setPresenting(true);
    bumpControls();
    // Fullscreen is a bonus — a rejection (unsupported, blocked) still
    // leaves a working in-page show.
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, [bumpControls]);

  // Leaving fullscreen (Esc, or the OS chrome) returns to the lobby.
  useEffect(() => {
    if (!presenting) return;
    const onFsChange = () => {
      if (!document.fullscreenElement) setPresenting(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [presenting]);

  // Keyboard: arrows move, space pauses, Escape leaves (covers the
  // no-fullscreen case; in fullscreen the browser eats Escape and the
  // fullscreenchange handler above catches it).
  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => {
      bumpControls();
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "Escape") {
        if (!document.fullscreenElement) stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, next, prev, stop, bumpControls]);

  const qrSize = Math.round(Math.min(Math.max(viewportMin * 0.32, 200), 480));
  const slide = slides[Math.min(index, slides.length - 1)] ?? { kind: "welcome" };
  const showEmptyHint = !hasActionableSlides(slides);

  // --- Lobby ---------------------------------------------------------
  if (!presenting) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-canopy-900 to-moss-950 p-6 text-center text-white">
        <div className="w-full max-w-lg rounded-2xl bg-white/10 p-8 backdrop-blur">
          <h1 className="font-serif text-4xl font-semibold">
            {t("present.lobby.title")}
          </h1>
          <p className="mt-4 text-lg text-white/80">
            {t("present.lobby.body")}
          </p>
          <button
            type="button"
            className="btn-primary mt-8 w-full text-lg"
            onClick={start}
          >
            {t("present.lobby.start")}
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-lg px-4 py-2 text-sm text-white/70 underline-offset-2 hover:text-white hover:underline"
            onClick={() => navigate(-1)}
          >
            {t("present.lobby.back")}
          </button>
        </div>
      </div>
    );
  }

  // --- Running show --------------------------------------------------
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-canopy-900 to-moss-950 p-8 text-center text-white"
      onMouseMove={bumpControls}
      onPointerDown={() => setPaused((p) => !p)}
    >
      <div
        key={index}
        className={`flex w-full max-w-5xl flex-col items-center ${
          reduced ? "" : "motion-safe:animate-fade-in"
        }`}
      >
        <SlideView
          slide={slide}
          qrSize={qrSize}
          showEmptyHint={showEmptyHint}
          t={t}
        />
      </div>

      {/* Controls — fade out on inactivity so the wall reads clean. */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4 transition-opacity ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ControlButton
          label={t("present.controls.prev")}
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
        >
          ‹
        </ControlButton>
        <ControlButton
          label={paused ? t("present.controls.play") : t("present.controls.pause")}
          onClick={(e) => {
            e.stopPropagation();
            setPaused((p) => !p);
          }}
        >
          {paused ? "▶" : "❚❚"}
        </ControlButton>
        <ControlButton
          label={t("present.controls.next")}
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
        >
          ›
        </ControlButton>
        <ControlButton
          label={t("present.controls.exit")}
          onClick={(e) => {
            e.stopPropagation();
            stop();
          }}
        >
          ✕
        </ControlButton>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-lg text-white hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}

// A white card behind the QR keeps it black-on-white (best scan
// reliability) even against the dark wall background.
function QrCard({ value, size, ariaLabel }: { value: string; size: number; ariaLabel: string }) {
  return (
    <div className="mt-8 rounded-2xl bg-white p-4 shadow-2xl">
      <InviteQRCode value={value} size={size} ariaLabel={ariaLabel} />
    </div>
  );
}

function SlideView({
  slide,
  qrSize,
  showEmptyHint,
  t,
}: {
  slide: GatheringSlide;
  qrSize: number;
  showEmptyHint: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  if (slide.kind === "welcome") {
    return (
      <>
        <p className="text-lg font-semibold uppercase tracking-widest text-canopy-200">
          {t("present.welcome.eyebrow")}
        </p>
        <h1 className="mt-4 font-serif text-6xl font-bold leading-tight md:text-7xl">
          {t("present.welcome.title")}
        </h1>
        <p className="mt-6 text-2xl text-white/80 md:text-3xl">
          {showEmptyHint ? t("present.welcome.empty") : t("present.welcome.hint")}
        </p>
      </>
    );
  }

  if (slide.kind === "event") {
    return (
      <>
        <p className="text-lg font-semibold uppercase tracking-widest text-canopy-200">
          {t("present.event.eyebrow")}
        </p>
        <h1 className="mt-4 font-serif text-5xl font-bold leading-tight md:text-6xl">
          {slide.title}
        </h1>
        <p className="mt-5 text-2xl text-white/85 md:text-3xl">
          {formatAbsoluteDateTime(slide.startsAt)}
          {slide.location ? ` · ${slide.location}` : ""}
        </p>
        <QrCard
          value={slide.href}
          size={qrSize}
          ariaLabel={t("present.event.qrAria", { title: slide.title })}
        />
        <p className="mt-5 text-2xl font-semibold text-canopy-100">
          {t("present.event.cta")}
        </p>
      </>
    );
  }

  if (slide.kind === "task") {
    return (
      <>
        <p className="text-lg font-semibold uppercase tracking-widest text-amber-200">
          {t("present.task.eyebrow")}
        </p>
        <h1 className="mt-4 font-serif text-5xl font-bold leading-tight md:text-6xl">
          {slide.taskTitle}
        </h1>
        {slide.projectTitle && (
          <p className="mt-5 text-2xl text-white/85 md:text-3xl">
            {t("present.task.in", { project: slide.projectTitle })}
          </p>
        )}
        <QrCard
          value={slide.href}
          size={qrSize}
          ariaLabel={t("present.task.qrAria", { title: slide.taskTitle })}
        />
        <p className="mt-5 text-2xl font-semibold text-amber-100">
          {t("present.task.cta")}
        </p>
      </>
    );
  }

  // need | offer
  const isNeed = slide.kind === "need";
  return (
    <>
      <p className="text-lg font-semibold uppercase tracking-widest text-canopy-200">
        {isNeed ? t("present.need.eyebrow") : t("present.offer.eyebrow")}
      </p>
      <h1 className="mt-4 font-serif text-5xl font-bold leading-tight md:text-6xl">
        {slide.title}
      </h1>
      <p className="mt-5 text-2xl text-white/85 md:text-3xl">
        {t("present.postedBy", { name: slide.authorName })}
      </p>
      <QrCard
        value={slide.href}
        size={qrSize}
        ariaLabel={
          isNeed
            ? t("present.need.qrAria", { name: slide.authorName })
            : t("present.offer.qrAria", { name: slide.authorName })
        }
      />
      <p className="mt-5 text-2xl font-semibold text-canopy-100">
        {isNeed ? t("present.need.cta") : t("present.offer.cta")}
      </p>
    </>
  );
}
