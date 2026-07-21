// Understoria desktop shell. Deliberately thin: the app is apps/web,
// byte-identical to what a community node serves, loaded over a
// privileged app:// scheme so IndexedDB/WebCrypto work with no
// browser and no TLS certificate — the point of the AppImage
// (docs/desktop-appimage.md). All decision logic lives in
// appServer.ts / policy.ts, which are unit-tested without Electron.

import { app, BrowserWindow, protocol, session, shell } from "electron";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  buildCsp,
  extractInlineScriptHashes,
  mimeFor,
  resolveAppPath,
} from "./appServer.js";
import {
  decideWindowOpen,
  isExternalOpenable,
  isInternalNavigation,
  isPermissionAllowed,
} from "./policy.js";

const APP_SCHEME = "app";
const APP_URL = `${APP_SCHEME}://understoria/`;
const WEB_ROOT = path.join(app.getAppPath(), "web-dist");

// Must run before app-ready: without standard+secure privileges the
// renderer gets no IndexedDB (Dexie — the entire datastore) and no
// localStorage; without supportFetchAPI/stream, fetch() of app://
// assets and media playback fail.
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

// One window, one instance: a second launch focuses the first
// (matching how a member thinks of "the app", and avoiding two
// renderers racing on the same IndexedDB).
const isPrimary = app.requestSingleInstanceLock();
if (!isPrimary) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  void app.whenReady().then(() => {
    // CSP script hashes come from the built index.html we actually
    // ship (the inline no-FOUC theme script) — computed at startup so
    // the policy never drifts from the bundle and never needs
    // 'unsafe-inline'.
    const indexHtml = readFileSync(path.join(WEB_ROOT, "index.html"), "utf8");
    const csp = buildCsp(extractInlineScriptHashes(indexHtml));

    protocol.handle(APP_SCHEME, async (request) => {
      const { pathname } = new URL(request.url);
      const resolved = resolveAppPath(pathname, WEB_ROOT);
      try {
        const body = await readFile(resolved.filePath);
        const mime =
          resolved.kind === "fallback"
            ? "text/html; charset=utf-8"
            : mimeFor(resolved.filePath);
        const headers: Record<string, string> = { "content-type": mime };
        if (mime.startsWith("text/html")) {
          headers["content-security-policy"] = csp;
        }
        return new Response(body, { headers });
      } catch {
        return new Response("not found", { status: 404 });
      }
    });

    session.defaultSession.setPermissionRequestHandler(
      (_wc, permission, callback) => callback(isPermissionAllowed(permission)),
    );
    session.defaultSession.setPermissionCheckHandler((_wc, permission) =>
      isPermissionAllowed(permission),
    );

    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    app.quit();
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 360,
    minHeight: 500,
    backgroundColor: "#14532d",
    icon: path.join(app.getAppPath(), "build", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      // No preload: the renderer needs no bridge — it detects the
      // shell by location.protocol === "app:" (apps/web lib/desktop.ts),
      // so the attack surface between web content and the OS is zero
      // beyond Chromium itself.
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    const decision = decideWindowOpen(url);
    if (decision === "external") {
      void shell.openExternal(url);
      return { action: "deny" };
    }
    if (decision === "allow-blank") return { action: "allow" };
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (isInternalNavigation(url, `${APP_SCHEME}:`)) return;
    event.preventDefault();
    if (isExternalOpenable(url)) void shell.openExternal(url);
  });

  void win.loadURL(APP_URL);
}
