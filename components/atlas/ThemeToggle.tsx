"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "atlas-theme";
const listeners = new Set<() => void>();

function getSnapshot(): "dark" | "light" {
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}
function getServerSnapshot(): "dark" | "light" {
  return "dark";
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function setStoredTheme(next: "dark" | "light") {
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((l) => l());
}

/**
 * Flips the enclosing `.atlas` root between instrument (near-black, default)
 * and paper (warm off-white) mode. Both hold the exact same plate — this
 * exists to prove it, not to add a decorative control.
 */
export function ThemeToggle() {
  const ref = useRef<HTMLButtonElement>(null);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const root = ref.current?.closest(".atlas") as HTMLElement | null;
    if (!root) return;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
  }, [theme]);

  return (
    <button
      ref={ref}
      type="button"
      className="atlas-theme-toggle"
      onClick={() => setStoredTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "paper" : "instrument"} mode`}
    >
      <span aria-hidden="true">{theme === "dark" ? "◐" : "◑"}</span>
      {theme === "dark" ? "instrument" : "paper"}
    </button>
  );
}
