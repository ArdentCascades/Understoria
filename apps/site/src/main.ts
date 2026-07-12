/*
 * Understoria — SPDX-License-Identifier: AGPL-3.0-or-later
 * The showcase site's only script: theme handling + a mobile-nav
 * toggle. Everything else is static HTML + CSS.
 */
import "./styles.css";

const STORAGE_KEY = "understoria-site-theme";
const root = document.documentElement;

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveInitial(): "light" | "dark" {
  const saved = localStorage.getItem(STORAGE_KEY);
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
    if (!localStorage.getItem(STORAGE_KEY)) {
      current = e.matches ? "dark" : "light";
      apply(current);
    }
  });

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const toggle = target.closest("[data-theme-toggle]");
  if (toggle) {
    current = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, current);
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
  // Any in-menu link closes the mobile menu.
  if (target.closest("[data-nav-menu] a")) {
    document.querySelector("[data-nav-menu]")?.setAttribute("hidden", "");
  }
});
