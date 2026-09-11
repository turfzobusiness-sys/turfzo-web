"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

const NAV_LINKS = [
  { label: "Find a Turf", href: "/explore" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "For Owners", href: "/owners" },
  { label: "Help", href: "/contact" },
];

/** Slim public header. Authenticated product keeps the full header. */
export default function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resolved, setMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur border-b border-border-default">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Turfzo home">
          <Image src="/turfzo_mascot.svg" alt="" width={28} height={28} className="w-7 h-7" />
          <span className="font-sans text-lg font-extrabold tracking-tight text-text-main">Turfzo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  active ? "text-text-main" : "text-text-muted hover:text-text-main"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
            title={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 text-xs font-semibold text-text-main shadow-xs hover:bg-elevated hover:border-border-strong transition-all cursor-pointer select-none"
          >
            {resolved === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-text-muted hover:text-text-main transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/owners/register"
            className="text-sm font-semibold bg-surface border border-border-strong text-text-main hover:border-border-focused px-4 py-2 rounded-[10px] transition-colors"
          >
            List your Turf
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
            aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-default bg-surface text-text-main"
          >
            {resolved === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-text-main border border-border-default bg-surface"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border-default bg-surface px-6 py-4 flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-text-main py-2.5 border-b border-border-subtle last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3">
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm font-semibold text-text-main py-2.5 border border-border-default rounded-[10px]"
            >
              Sign in
            </Link>
            <Link
              href="/owners/register"
              onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm font-semibold bg-brand-lime text-brand-btn-bg py-2.5 rounded-[10px]"
            >
              List your Turf
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
