/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// The BarcodeDetector API isn't in TypeScript's lib.dom.d.ts as of
// TS 5.x. Local type so we don't need a global ambient declaration.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorConstructor {
  new (options: { formats: string[] }): {
    detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
  };
}
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

interface PairDeviceCaptureProps {
  /** Fires when a QR (or pasted text) was captured. The component
   *  stops the camera and unmounts; the parent advances to the
   *  passphrase stage. */
  onCaptured: (encoded: string) => void;
  /** Fires when the member clicks "Cancel" / "Back" at this stage. */
  onCancel: () => void;
}

/**
 * Destination-side capture step. Tries the device camera via
 * `BarcodeDetector`; falls back to a paste field for browsers that
 * don't support it (or members who decline camera permission).
 *
 * The component never persists captured input — `onCaptured` hands
 * the encoded envelope to the parent and is the only exit path.
 */
export function PairDeviceCapture({
  onCaptured,
  onCancel,
}: PairDeviceCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  // `null` = haven't tried yet, `false` = unavailable / declined,
  // `true` = camera is running. Three states keep the UI from
  // flashing the paste fallback during the brief permission prompt.
  const [cameraState, setCameraState] = useState<null | false | true>(null);
  const [pasted, setPasted] = useState("");

  const stopCamera = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
  }, []);

  // Start the camera on mount (best-effort). The camera permission
  // prompt fires immediately so the member knows the page wants
  // access. If denied, the paste fallback shows.
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (typeof window === "undefined" || !window.BarcodeDetector) {
        if (!cancelled) setCameraState(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setCameraState(true);
        const Detector = window.BarcodeDetector;
        if (!Detector) return;
        const detector = new Detector({ formats: ["qr_code"] });
        // 200ms poll — faster than human framing speed, lighter than
        // requestAnimationFrame on phone batteries.
        intervalRef.current = window.setInterval(async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && codes[0].rawValue) {
              stopCamera();
              onCaptured(codes[0].rawValue);
            }
          } catch {
            // Transient detect failures are normal during focus —
            // just wait for the next tick.
          }
        }, 200);
      } catch {
        if (!cancelled) setCameraState(false);
      }
    };
    void start();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // Intentionally run-once; the parent unmounts on capture/cancel.
  }, []);

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = pasted.trim();
    if (!value) return;
    stopCamera();
    onCaptured(value);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Directions surface — always shown at the top, before the
          camera preview. A member landing on this screen on a second
          device may not know where the QR comes from; the
          instructions are the first thing they should read. Rendered
          as a semantic <section> + <ol> so screen readers announce
          it as a list of ordered steps. */}
      <section
        aria-labelledby="pairDevice-directions-heading"
        className="rounded-xl border border-canopy-200 bg-canopy-50 p-4 dark:border-canopy-800 dark:bg-canopy-950/40"
      >
        <h2
          id="pairDevice-directions-heading"
          className="mb-2 text-sm font-semibold text-canopy-900 dark:text-canopy-100"
        >
          {t("pairDevice.capture.directions.title")}
        </h2>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-moss-700 dark:text-moss-200">
          <li>{t("pairDevice.capture.directions.step1")}</li>
          <li>{t("pairDevice.capture.directions.step2")}</li>
          <li>{t("pairDevice.capture.directions.step3")}</li>
        </ol>
      </section>

      {cameraState === true && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              className="block max-h-[60vh] w-full max-w-md object-cover"
              muted
              playsInline
              aria-label={t("pairDevice.capture.videoAriaLabel")}
            />
          </div>
          <p className="text-center text-sm text-moss-600 dark:text-moss-300">
            {t("pairDevice.capture.cameraInstructions")}
          </p>
        </div>
      )}

      {cameraState === null && (
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("pairDevice.capture.requestingCamera")}
        </p>
      )}

      {cameraState === false && (
        <div className="flex flex-col gap-3 rounded-xl bg-moss-50 p-4 dark:bg-moss-900/40">
          <p className="text-sm font-medium text-moss-900 dark:text-moss-100">
            {t("pairDevice.capture.cameraUnavailable")}
          </p>
          <p className="text-sm text-moss-600 dark:text-moss-300">
            {t("pairDevice.capture.cameraUnavailableHelp")}
          </p>
        </div>
      )}

      {/* Paste fallback always available — even when the camera is
          running — for the "I can read the QR but the camera isn't
          working from this angle" case. */}
      <form onSubmit={handlePasteSubmit} className="flex flex-col gap-2">
        <label htmlFor="pair-paste" className="text-sm font-medium">
          {t("pairDevice.capture.pasteLabel")}
        </label>
        <textarea
          id="pair-paste"
          className="input min-h-20 font-mono text-xs"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder={t("pairDevice.capture.pastePlaceholder")}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              stopCamera();
              onCancel();
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={pasted.trim() === ""}
          >
            {t("pairDevice.capture.continue")}
          </button>
        </div>
      </form>
    </div>
  );
}
