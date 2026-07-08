/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { decodeEnvelope } from "@/lib/devicePairing";

// iOS WebKit's async clipboard read can hang indefinitely in
// home-screen web apps (the paste-permission callout never resolves).
// Without a bound, the Paste button would "do nothing" forever — race
// the read against this and fall back to the manual paste box.
const CLIPBOARD_READ_TIMEOUT_MS = 3000;

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
  /** Same-phone journey: the identity lives in this phone's browser
   *  (the installed app has its own isolated storage), so there is
   *  no second screen to point the camera at. Starts in a mode that
   *  never opens the camera and instead walks the member through
   *  copying the pairing code in the browser and pasting it here.
   *  The member can still switch to scan mode for the two-device
   *  case. */
  samePhone?: boolean;
}

/**
 * Destination-side capture step. Two modes:
 *
 *  - "scan" (default): tries the device camera via `BarcodeDetector`;
 *    falls back to a paste field for browsers that don't support it
 *    (or members who decline camera permission).
 *  - "samePhone": no camera at all — a phone can't scan its own
 *    screen. Numbered copy-the-code steps plus a one-tap Paste
 *    button (`navigator.clipboard.readText`), with the manual paste
 *    box as the fallback when clipboard read is denied.
 *
 * The component never persists captured input — `onCaptured` hands
 * the encoded envelope to the parent and is the only exit path.
 */
export function PairDeviceCapture({
  onCaptured,
  onCancel,
  samePhone = false,
}: PairDeviceCaptureProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [mode, setMode] = useState<"scan" | "samePhone">(
    samePhone ? "samePhone" : "scan",
  );
  // `null` = haven't tried yet, `false` = unavailable / declined,
  // `true` = camera is running. Three states keep the UI from
  // flashing the paste fallback during the brief permission prompt.
  const [cameraState, setCameraState] = useState<null | false | true>(null);
  const [pasted, setPasted] = useState("");
  const [clipboardFailed, setClipboardFailed] = useState(false);
  // Captured input that doesn't decode as a pairing envelope. Caught
  // HERE, not at the passphrase stage — advancing on garbage sends the
  // member into typing six words that can only ever fail.
  const [invalidCode, setInvalidCode] = useState(false);
  // While the async clipboard read is in flight (needs a busy state
  // because on iOS the read can take seconds or hang — see the
  // timeout above).
  const [pasting, setPasting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  // Start the camera when in scan mode (best-effort). The camera
  // permission prompt fires immediately so the member knows the page
  // wants access. If denied, the paste fallback shows. Same-phone
  // mode never touches the camera — switching modes stops/starts it
  // via the effect cleanup.
  useEffect(() => {
    if (mode !== "scan") return;
    setCameraState(null);
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
    // Restarts only on mode change; the parent unmounts on
    // capture/cancel.
  }, [mode]);

  // Single validated exit: only text that decodes as a pairing
  // envelope leaves this component. Returns false (and flags the
  // inline error) otherwise.
  function tryCapture(raw: string): boolean {
    const value = raw.trim();
    if (!value || !decodeEnvelope(value)) {
      setInvalidCode(true);
      return false;
    }
    setInvalidCode(false);
    setClipboardFailed(false);
    stopCamera();
    onCaptured(value);
    return true;
  }

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pasted.trim() === "") return;
    tryCapture(pasted);
  }

  // Pasting a valid code into the box completes the step on its own —
  // no Continue tap. This is the most reliable path on iOS, where the
  // native long-press Paste always works even when the async clipboard
  // API is blocked or hangs. Invalid text falls through to the normal
  // change handler so the member can still edit it.
  function handleTextareaPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const value = e.clipboardData.getData("text").trim();
    if (value && decodeEnvelope(value)) {
      e.preventDefault();
      tryCapture(value);
    }
  }

  // One-tap paste for the same-phone journey. Clipboard read needs a
  // user gesture (this click), may be denied, and on iOS standalone
  // may never settle — bounded by CLIPBOARD_READ_TIMEOUT_MS. Every
  // failure path lands on the manual paste box with focus, so the
  // member's next move is always visible.
  async function handleClipboardPaste() {
    setPasting(true);
    setClipboardFailed(false);
    setInvalidCode(false);
    try {
      const text = await Promise.race([
        navigator.clipboard.readText(),
        new Promise<never>((_, reject) =>
          window.setTimeout(
            () => reject(new Error("clipboard-timeout")),
            CLIPBOARD_READ_TIMEOUT_MS,
          ),
        ),
      ]);
      if (text.trim() === "") {
        setClipboardFailed(true);
        textareaRef.current?.focus();
        return;
      }
      tryCapture(text);
    } catch {
      setClipboardFailed(true);
      textareaRef.current?.focus();
    } finally {
      setPasting(false);
    }
  }

  // The manual paste form — shared verbatim by both modes; it is the
  // universal fallback everything else degrades to.
  const pasteForm = (
    <form onSubmit={handlePasteSubmit} className="flex flex-col gap-2">
      <label htmlFor="pair-paste" className="text-sm font-medium">
        {t("pairDevice.capture.pasteLabel")}
      </label>
      <textarea
        id="pair-paste"
        ref={textareaRef}
        className="input min-h-20 font-mono text-xs"
        value={pasted}
        onChange={(e) => {
          setPasted(e.target.value);
          setInvalidCode(false);
        }}
        onPaste={handleTextareaPaste}
        placeholder={t("pairDevice.capture.pastePlaceholder")}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />
      {invalidCode && (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-100"
        >
          {t("pairDevice.capture.invalidCode")}
        </p>
      )}
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
  );

  if (mode === "samePhone") {
    return (
      <div className="flex flex-col gap-4">
        <section
          aria-labelledby="pairDevice-samePhone-heading"
          className="rounded-xl border border-canopy-200 bg-canopy-50 p-4 dark:border-canopy-800 dark:bg-canopy-950/40"
        >
          <h2
            id="pairDevice-samePhone-heading"
            className="mb-2 text-sm font-semibold text-canopy-900 dark:text-canopy-100"
          >
            {t("pairDevice.capture.samePhone.title")}
          </h2>
          <ol className="ml-5 list-decimal space-y-1 text-sm text-moss-700 dark:text-moss-200">
            <li>{t("pairDevice.capture.samePhone.step1")}</li>
            <li>{t("pairDevice.capture.samePhone.step2")}</li>
            <li>{t("pairDevice.capture.samePhone.step3")}</li>
            <li>{t("pairDevice.capture.samePhone.step4")}</li>
          </ol>
        </section>

        <button
          type="button"
          className="btn-primary"
          disabled={pasting}
          aria-busy={pasting}
          onClick={() => {
            void handleClipboardPaste();
          }}
        >
          {pasting
            ? t("common.working")
            : t("pairDevice.capture.samePhone.pasteButton")}
        </button>
        {clipboardFailed && (
          <p
            role="alert"
            className="text-sm text-moss-700 dark:text-moss-200"
          >
            {t("pairDevice.capture.samePhone.clipboardFailed")}
          </p>
        )}

        {pasteForm}

        <button
          type="button"
          className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
          onClick={() => {
            setClipboardFailed(false);
            setMode("scan");
          }}
        >
          {t("pairDevice.capture.samePhone.switchToScan")}
        </button>
      </div>
    );
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
        <p role="status" className="text-sm text-moss-600 dark:text-moss-300">
          {t("pairDevice.capture.requestingCamera")}
        </p>
      )}

      {cameraState === false && (
        <div className="flex flex-col gap-3 rounded-xl bg-moss-50 p-4 dark:bg-moss-900/40">
          <p
            role="status"
            className="text-sm font-medium text-moss-900 dark:text-moss-100"
          >
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
      {pasteForm}

      <button
        type="button"
        className="self-start text-sm text-moss-600 underline-offset-2 hover:underline dark:text-moss-300"
        onClick={() => setMode("samePhone")}
      >
        {t("pairDevice.capture.samePhone.switchToSamePhone")}
      </button>
    </div>
  );
}
