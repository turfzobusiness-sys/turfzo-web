"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, User as UserIcon, Sun, Moon, Monitor } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useTheme } from "@/lib/theme-context";

type NavLink = { label: string; href: string };

// "Home" is intentionally omitted — the logo already links to "/".
const NAV_LINKS: NavLink[] = [
  { label: "Explore Turfs", href: "/explore" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "List Your Turf", href: "/owners" },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function ThemeIcon({ mode }: { mode: "dark" | "light" | "system" }) {
  if (mode === "dark") return <Moon className="size-5" />;
  if (mode === "light") return <Sun className="size-5" />;
  return <Monitor className="size-5" />;
}

function HeaderThemeButton({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  const cycle = () => {
    if (mode === "dark") setMode("light");
    else if (mode === "light") setMode("system");
    else setMode("dark");
  };
  const label =
    mode === "dark" ? "Dark mode" : mode === "light" ? "Light mode" : "System";
  return (
    <button
      type="button"
      onClick={cycle}
      title={label}
      aria-label={`Switch theme: currently ${label}`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted hover:bg-elevated hover:text-text-main transition-colors",
        className
      )}
    >
      <ThemeIcon mode={mode} />
    </button>
  );
}

export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const pathname = usePathname();
  const { status, firebaseUser, convexUser, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const isAuthed = status === "authenticated";

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    // Close the mobile menu whenever the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const handleSignOut = React.useCallback(async () => {
    setOpen(false);
    await signOut();
  }, [signOut]);

  const handleSignInClick = React.useCallback(() => {
    setOpen(false);
    openAuthModal("signin");
  }, [openAuthModal]);

  const handleSignUpClick = React.useCallback(() => {
    setOpen(false);
    openAuthModal("signup");
  }, [openAuthModal]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all ease-out",
        {
          "bg-bg/95 supports-[backdrop-filter]:bg-bg/80 border-border-default backdrop-blur-md":
            scrolled && !open,
          "bg-bg/90 border-transparent": open,
          "border-transparent": !scrolled && !open,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-16 w-full items-center justify-between px-5 md:h-20 md:transition-all md:ease-out",
          {
            "md:px-6": scrolled,
          }
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 select-none"
          aria-label="Turfzo home"
        >
          <Image
            src="/turfzo_mascot.svg"
            alt="Turfzo Logo"
            width={44}
            height={44}
            className="h-10 w-10 md:h-11 md:w-11"
            priority
          />
          <span className="font-sans font-bold text-xl md:text-2xl text-text-main tracking-tight leading-none whitespace-nowrap">
            turf<span className="text-brand-lime">zo</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "relative h-12 px-4 font-sans text-sm font-medium",
                  active
                    ? "text-text-main"
                    : "text-text-muted hover:text-text-main"
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-text-main"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <HeaderThemeButton />
          {isAuthed ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 gap-2 px-5 text-base"
                )}
              >
                <UserIcon className="size-5" />
                <span>
                  {((convexUser?.display_name && convexUser.display_name.trim() !== "")
                    ? convexUser.display_name
                    : (convexUser?.full_name && convexUser.full_name.trim() !== "")
                      ? convexUser.full_name
                      : firebaseUser?.displayName
                        ? firebaseUser.displayName
                        : (convexUser?.email ?? firebaseUser?.email)?.split("@")[0]) ?? "Profile"}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="h-12 w-12"
              >
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSignInClick}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 px-6 text-base"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleSignUpClick}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-12 px-6 text-base"
                )}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5 md:hidden">
          <HeaderThemeButton className="h-12 w-12" />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-12 w-12"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <MenuToggleIcon open={open} className="size-6" duration={300} />
          </Button>
        </div>
      </nav>

      <div
        className={cn(
          "bg-bg/95 fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col overflow-hidden border-y border-border-default md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-3 p-5"
          )}
        >
          <div className="grid gap-y-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      className: "justify-start",
                    }),
                    "h-14 px-4 text-base",
                    active
                      ? "text-text-main bg-surface"
                      : "text-text-muted"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {isAuthed ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline", className: "w-full" }),
                    "h-14 gap-2 text-base"
                  )}
                >
                  <UserIcon className="size-5" />
                  {((convexUser?.display_name && convexUser.display_name.trim() !== "")
                    ? convexUser.display_name
                    : (convexUser?.full_name && convexUser.full_name.trim() !== "")
                      ? convexUser.full_name
                      : firebaseUser?.displayName
                        ? firebaseUser.displayName
                        : (convexUser?.email ?? firebaseUser?.email)?.split("@")[0]) ?? "Profile"}
                </Link>
                <Button
                  variant="ghost"
                  className="h-14 w-full text-base"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSignInClick}
                  className={cn(
                    buttonVariants({ variant: "outline", className: "w-full" }),
                    "h-14 text-base"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className={cn(
                    buttonVariants({ variant: "default", className: "w-full" }),
                    "h-14 text-base"
                  )}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
