"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "@/lib/auth-modal-context";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthTabSwitcher } from "@/components/auth/auth-tab-switcher";
import { cn } from "@/lib/utils";

export function AuthModal() {
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
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay-heavy backdrop-blur-md p-3 sm:p-6"
          onClick={closeAuthModal}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full max-w-[720px] overflow-hidden rounded-xl border border-border-default bg-bg shadow-card-shadow",
              "grid grid-cols-1 lg:grid-cols-[260px_1fr]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel — Brand */}
            <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-r border-border-default min-h-[440px]">
              <div className="absolute inset-0 bg-gradient-to-br from-surface via-bg to-elevated" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(159,232,112,0.08),transparent_55%)]" />

              <div className="relative z-10 flex flex-col items-center text-center px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Image
                    src="/turfzo_mascot.svg"
                    alt="Turfzo mascot"
                    width={140}
                    height={140}
                    priority
                    className="h-32 w-32"
                  />
                </motion.div>

                <h1
                  id="auth-modal-title"
                  className="mt-4 font-poppins font-extrabold text-3xl tracking-tighter leading-none"
                >
                  <span className="text-text-main">turf</span>
                  <span className="text-brand-lime">zo</span>
                </h1>
                <p className="mt-3 font-sans text-[10px] tracking-[0.25em] uppercase text-text-muted font-bold">
                  Book <span className="text-brand-lime">•</span> Play{" "}
                  <span className="text-brand-lime">•</span> Enjoy
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
                  <span className="font-poppins font-extrabold text-base text-text-main">
                    turf<span className="text-brand-lime">zo</span>
                  </span>
                </Link>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={closeAuthModal}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-default bg-surface text-text-muted hover:border-border-strong hover:text-text-main transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex flex-col gap-3.5 px-5 py-5 sm:px-6 sm:py-6">
                {/* Heading */}
                <div>
                  <h2 className="font-poppins text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-1 font-sans text-xs text-text-muted">
                    {mode === "signin"
                      ? "Sign in to manage bookings."
                      : "Join Turfzo to book turfs."}
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
                    {mode === "signin" ? <SignInForm /> : <SignUpForm />}
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
