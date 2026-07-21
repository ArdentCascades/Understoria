// Detection of the desktop shell (apps/desktop — the Linux AppImage).
// The shell serves this same bundle over a privileged app:// scheme
// and deliberately injects NO preload bridge, so the protocol IS the
// signal (docs/desktop-appimage.md §4). Everything desktop-specific
// in the renderer keys off this one function: the install guide goes
// quiet (a native app never nags about installing itself), passkeys
// hide (WebAuthn needs a registrable domain the app:// origin lacks),
// and share links swap to the community's public origin
// (lib/appOrigin.ts).

/** True when running inside the desktop shell's app:// origin. */
export function isDesktopShell(): boolean {
  return (
    typeof window !== "undefined" && window.location.protocol === "app:"
  );
}
