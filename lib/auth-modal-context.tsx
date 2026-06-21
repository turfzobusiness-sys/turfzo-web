"use client";

import * as React from "react";

export type AuthMode = "signin" | "signup";

interface AuthModalContextValue {
  isOpen: boolean;
  mode: AuthMode;
  returnTo: string | null;
  openAuthModal: (mode?: AuthMode, returnTo?: string | null) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthMode) => void;
}

const AuthModalContext = React.createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [returnTo, setReturnTo] = React.useState<string | null>(null);

  const openAuthModal = React.useCallback((nextMode: AuthMode = "signin", nextReturnTo?: string | null) => {
    setMode(nextMode);
    setReturnTo(nextReturnTo ?? null);
    setIsOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = React.useMemo(
    () => ({ isOpen, mode, returnTo, openAuthModal, closeAuthModal, setMode }),
    [isOpen, mode, returnTo, openAuthModal, closeAuthModal]
  );

  return (
    <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = React.useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return ctx;
}
