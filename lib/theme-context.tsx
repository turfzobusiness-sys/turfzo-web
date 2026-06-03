"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ThemeMode = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "turfzo-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? getSystemTheme() : mode;
}

function getStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return stored && ["dark", "light", "system"].includes(stored) ? stored : "system";
}

function applyClass(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    const r = resolveTheme(newMode);
    applyClass(r);
    setResolved(r);
  }, []);

  // Initialize from localStorage after mount (matches the blocking script)
  const [initialized, setInitialized] = useState(false);
  if (!initialized && typeof window !== "undefined") {
    const stored = getStoredMode();
    const r = resolveTheme(stored);
    // Apply synchronously on first render to avoid flash
    applyClass(r);
    // Defer state update to avoid setState during render
    Promise.resolve().then(() => {
      setModeState(stored);
      setResolved(r);
      setInitialized(true);
    });
  }

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { mode: "dark" as ThemeMode, resolved: "dark" as ResolvedTheme, setMode: () => {} };
  }
  return ctx;
}
