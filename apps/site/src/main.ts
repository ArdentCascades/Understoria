/*
 * Understoria — SPDX-License-Identifier: AGPL-3.0-or-later
 * The showcase site's only script: theme handling + a mobile-nav
 * toggle. Everything else is static HTML + CSS.
 */
import "./styles.css";

const STORAGE_KEY = "understoria-site-theme";
const root = document.documentElement;

// Safari private mode (pre-17), storage-disabled browsers, and
// blocked third-party contexts THROW on localStorage access — even a
// read. Unguarded, that killed this module at the top level: no theme
// applied AND a dead hamburger menu. The fallbacks (no saved theme /
// unsaveable choice) degrade to system-theme-following, which is
// exactly right for a visitor whose storage doesn't work.
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The choice still applies for this page view; it just won't stick.
  }
}

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveInitial(): "light" | "dark" {
  const saved = safeGet(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return systemPrefersDark() ? "dark" : "light";
}

function apply(theme: "light" | "dark"): void {
  root.classList.toggle("dark", theme === "dark");
  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    const light = toggle.querySelector<HTMLElement>("[data-icon-light]");
    const dark = toggle.querySelector<HTMLElement>("[data-icon-dark]");
    if (light) light.hidden = theme === "dark";
    if (dark) dark.hidden = theme !== "dark";
  }
}

let current = resolveInitial();
apply(current);

// Follow the system theme until the visitor makes an explicit choice.
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (!safeGet(STORAGE_KEY)) {
      current = e.matches ? "dark" : "light";
      apply(current);
    }
  });

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const toggle = target.closest("[data-theme-toggle]");
  if (toggle) {
    current = current === "dark" ? "light" : "dark";
    safeSet(STORAGE_KEY, current);
    apply(current);
    return;
  }
  const navToggle = target.closest("[data-nav-toggle]");
  if (navToggle) {
    const menu = document.querySelector<HTMLElement>("[data-nav-menu]");
    if (menu) {
      const open = menu.hasAttribute("hidden");
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
      navToggle.setAttribute("aria-expanded", String(open));
    }
    return;
  }
  // Any in-menu link closes the mobile menu. The toggle's
  // aria-expanded must follow, or a screen reader hears "expanded"
  // over a menu that's gone.
  if (target.closest("[data-nav-menu] a")) {
    document.querySelector("[data-nav-menu]")?.setAttribute("hidden", "");
    document
      .querySelector("[data-nav-toggle]")
      ?.setAttribute("aria-expanded", "false");
  }
});
