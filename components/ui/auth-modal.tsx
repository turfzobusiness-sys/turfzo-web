"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "@/lib/auth-modal-context";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthTabSwitcher } from "@/components/auth/auth-tab-switcher";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const pathname = usePathname();
  const isOwnerPath = pathname?.startsWith("/owners");
  const { isOpen, mode, closeAuthModal, setMode } = useAuthModal();
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeAuthModal]);

  // Focus first input on open
  React.useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const focusable = root.querySelector<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [isOpen, mode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay-heavy p-3 sm:p-6"
          onClick={closeAuthModal}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "relative w-full max-w-[720px] overflow-hidden rounded-md border border-border-default bg-bg shadow-lg",
              "grid grid-cols-1 lg:grid-cols-[260px_1fr]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel — Brand */}
            <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-r border-border-default min-h-[440px] bg-surface">

              <div className="relative z-10 flex flex-col items-center text-center px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Image
                    src="/turfzo_mascot.svg"
                    alt="Turfzo mascot"
                    width={80}
                    height={80}
                    priority
                    className="h-20 w-20"
                  />
                </motion.div>

                <h1
                  id="auth-modal-title"
                  className="mt-4 font-sans font-bold text-2xl tracking-tight leading-none"
                >
                  <span className="text-text-main">turf</span>
                  <span className="text-brand-lime">zo</span>
                </h1>
                <p className="mt-2 font-sans text-xs text-text-muted">
                  Book sports venues instantly.
                </p>
              </div>
            </div>

            {/* Right Panel — Form */}
            <div className="relative flex flex-col bg-bg">
              {/* Mobile brand row */}
              <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
                <Link href="/" onClick={closeAuthModal} className="flex items-center gap-2">
                  <Image
                    src="/turfzo_mascot.svg"
                    alt="Turfzo"
                    width={28}
                    height={28}
                    className="h-7 w-7"
                    priority
                  />
                  <span className="font-sans font-bold text-base text-text-main">
                    turf<span className="text-brand-lime">zo</span>
                  </span>
                </Link>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={closeAuthModal}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-elevated hover:text-text-main transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex flex-col gap-3.5 px-5 py-5 sm:px-6 sm:py-6">
                {/* Heading */}
                <div>
                  <h2 className="font-sans text-xl sm:text-2xl font-semibold text-text-main tracking-tight">
                    {mode === "signin" 
                      ? (isOwnerPath ? "Welcome back, Partner" : "Welcome back") 
                      : (isOwnerPath ? "Become a Turfzo Partner" : "Create your account")}
                  </h2>
                  <p className="mt-1 font-sans text-xs text-text-muted">
                    {mode === "signin"
                      ? (isOwnerPath ? "Sign in to manage your venues and payouts." : "Sign in to manage bookings.")
                      : (isOwnerPath ? "Register your sports facility and start earning." : "Join Turfzo to book turfs.")}
                  </p>
                </div>

                {/* Tab switcher */}
                <AuthTabSwitcher mode={mode} onChange={setMode} />

                {/* Form (with slide animation on mode switch) */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === "signin" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "signin" ? 10 : -10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {mode === "signin" ? (
                      <SignInForm />
                    ) : (
                      <SignUpForm role={isOwnerPath ? "owner" : "player"} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
