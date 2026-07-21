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
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { shareOrigin } from "@/lib/appOrigin";
import { InviteQRCode } from "@/components/InviteQRCode";
import { formatAbsoluteDateTime } from "@/lib/format";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";
import { useSlideshow } from "@/lib/useSlideshow";
import { useWakeLock } from "@/lib/useWakeLock";
import {
  buildGatheringSlides,
  hasActionableSlides,
  slideId,
  slideLabel,
  type GatheringSlide,
} from "@/lib/gatheringSlides";
import {
  DWELL_CHOICES,
  togglePinned,
  toggleHidden,
  useGatheringConfig,
  type GatheringConfig,
} from "@/lib/useGatheringConfig";

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

  const { config, update: updateConfig } = useGatheringConfig();
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

  const origin = shareOrigin();
  const anonymous = t("present.anonymous");

  // Config parses fresh each render, so a plain compute (buildGatheringSlides
  // is a cheap pure pass over already-loaded state) is simpler and correct
  // than memoizing against churning object identities.
  const baseInput = {
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
  };
  const slides = buildGatheringSlides({
    ...baseInput,
    filter: {
      categories: config.categories,
      pinnedIds: config.pinnedIds,
      hiddenIds: config.hiddenIds,
    },
  });
  // The full menu (ignoring pins/hides/toggles) for the lobby's curation
  // list, so an organizer can pin or hide any candidate.
  const candidates = buildGatheringSlides(baseInput).filter(
    (s) => s.kind !== "welcome",
  );
  const welcomeTitle = config.title.trim() || t("present.welcome.title");

  const { index, next, prev } = useSlideshow(slides.length, {
    dwellMs: config.dwellSeconds * 1000,
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
    // `/present` is chromeless (outside Layout), and the document itself
    // can't scroll — so the lobby must be its own fixed-height scroller.
    // The inner `min-h-dvh` + `justify-center` centers the card when it
    // fits and lets the outer scroll when the Customize panel makes it
    // taller than the viewport (otherwise the top is unreachable).
    return (
      <div className="h-dvh overflow-y-auto overscroll-contain bg-gradient-to-br from-canopy-900 to-moss-950 text-white">
        <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
          <div className="my-6 w-full max-w-lg rounded-2xl bg-white/10 p-8 backdrop-blur">
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

          <CustomizePanel
            config={config}
            candidates={candidates}
            onChange={updateConfig}
            t={t}
          />
          </div>
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
          welcomeTitle={welcomeTitle}
          t={t}
        />
      </div>

      {/* Controls — fade out on inactivity so the wall reads clean.
          The container's tap-anywhere pause toggle listens on
          pointerdown, so the toolbar must stop THAT event (a click
          handler's stopPropagation runs after pointerdown has already
          bubbled) or every control press also toggles pause. Bumping
          here keeps the controls visible through a touch interaction,
          where no mousemove fires. */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4 transition-opacity ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onPointerDown={(e) => {
          e.stopPropagation();
          bumpControls();
        }}
      >
        <ControlButton label={t("present.controls.prev")} onClick={prev}>
          ‹
        </ControlButton>
        <ControlButton
          label={paused ? t("present.controls.play") : t("present.controls.pause")}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? "▶" : "❚❚"}
        </ControlButton>
        <ControlButton label={t("present.controls.next")} onClick={next}>
          ›
        </ControlButton>
        <ControlButton label={t("present.controls.exit")} onClick={stop}>
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
  onClick: () => void;
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

// Organizer curation (docs/gathering-screen.md §7.2) — device-local, over
// already-public content, so no privacy weight. Lives in the lobby so it's
// set before the show starts. `Hide` doubles as the interim "please don't
// feature my post" control: no member-profile federation needed.
function CustomizePanel({
  config,
  candidates,
  onChange,
  t,
}: {
  config: GatheringConfig;
  candidates: GatheringSlide[];
  onChange: (next: GatheringConfig) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const cats: Array<keyof GatheringConfig["categories"]> = [
    "events",
    "tasks",
    "needs",
    "offers",
  ];
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm ${
      active
        ? "bg-white text-canopy-900"
        : "bg-white/10 text-white hover:bg-white/20"
    }`;
  return (
    <details className="mt-6 rounded-xl bg-white/5 p-4 text-left">
      <summary className="cursor-pointer text-sm font-semibold text-white/90">
        {t("present.customize.summary")}
      </summary>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-white/80">
          {t("present.customize.titleLabel")}
          <input
            type="text"
            value={config.title}
            maxLength={80}
            placeholder={t("present.customize.titlePlaceholder")}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          />
        </label>

        <div className="text-sm text-white/80">
          <span className="mb-1 block">
            {t("present.customize.dwellLabel")}
          </span>
          <div className="flex gap-2">
            {DWELL_CHOICES.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={config.dwellSeconds === n}
                onClick={() => onChange({ ...config, dwellSeconds: n })}
                className={chip(config.dwellSeconds === n)}
              >
                {t("present.customize.dwellUnit", { n })}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-white/80">
          <span className="mb-1 block">
            {t("present.customize.categoriesLabel")}
          </span>
          <div className="flex flex-wrap gap-2">
            {cats.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={config.categories[k]}
                onClick={() =>
                  onChange({
                    ...config,
                    categories: {
                      ...config.categories,
                      [k]: !config.categories[k],
                    },
                  })
                }
                className={chip(config.categories[k])}
              >
                {t(`present.customize.cat.${k}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-white/80">
          <span className="mb-1 block">
            {t("present.customize.itemsLabel")}
          </span>
          {candidates.length === 0 ? (
            <p className="text-white/50">{t("present.customize.itemsEmpty")}</p>
          ) : (
            <ul className="flex max-h-56 flex-col gap-1 overflow-y-auto pr-1">
              {candidates.map((c) => {
                const id = slideId(c);
                const pinned = config.pinnedIds.includes(id);
                const hidden = config.hiddenIds.includes(id);
                return (
                  <li
                    key={id}
                    className={`flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 ${
                      hidden ? "opacity-50" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {slideLabel(c)}
                    </span>
                    <button
                      type="button"
                      aria-pressed={pinned}
                      onClick={() => onChange(togglePinned(config, id))}
                      className={`rounded px-2 py-0.5 text-xs ${
                        pinned
                          ? "bg-white text-canopy-900"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {pinned
                        ? t("present.customize.pinned")
                        : t("present.customize.pin")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={hidden}
                      onClick={() => onChange(toggleHidden(config, id))}
                      className={`rounded px-2 py-0.5 text-xs ${
                        hidden
                          ? "bg-white text-canopy-900"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {hidden
                        ? t("present.customize.hidden")
                        : t("present.customize.hide")}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </details>
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
  welcomeTitle,
  t,
}: {
  slide: GatheringSlide;
  qrSize: number;
  showEmptyHint: boolean;
  welcomeTitle: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  if (slide.kind === "welcome") {
    return (
      <>
        <p className="text-lg font-semibold uppercase tracking-widest text-canopy-200">
          {t("present.welcome.eyebrow")}
        </p>
        <h1 className="mt-4 font-serif text-6xl font-bold leading-tight md:text-7xl">
          {welcomeTitle}
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
