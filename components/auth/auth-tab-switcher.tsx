"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AuthMode } from "@/lib/auth-modal-context";

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: "signin", label: "Sign In" },
  { mode: "signup", label: "Sign Up" },
];

export function AuthTabSwitcher({
  mode,
  onChange,
  className,
}: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Auth mode"
      className={cn(
        "flex border-b border-border-default w-full gap-6",
        className
      )}
    >
      {TABS.map((tab) => {
        const active = tab.mode === mode;
        return (
          <button
            key={tab.mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.mode)}
            className={cn(
              "relative pb-2.5 font-sans text-sm font-medium transition-colors focus-visible:outline-none cursor-pointer",
              active
                ? "text-text-main"
                : "text-text-muted hover:text-text-main"
            )}
          >
            {tab.label}
            {active && (
              <motion.span
                layoutId="auth-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-main"
                transition={{ duration: 0.15, ease: "easeOut" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}


