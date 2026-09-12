"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, User as UserIcon, Sun, Moon, Bell } from "lucide-react";
import { toast } from "sonner";
import { convexClient } from "@/lib/convex";
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

function HeaderThemeButton({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolved, setMode } = useTheme();
  const toggle = () => {
    setMode(resolved === "dark" ? "light" : "dark");
  };
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-semibold text-text-main shadow-sm transition-all hover:bg-elevated hover:border-border-strong cursor-pointer active:scale-95 select-none",
        className
      )}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200" />
          {showLabel && <span className="hidden sm:inline">Light</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-indigo-500 transition-transform duration-200" />
          {showLabel && <span className="hidden sm:inline">Dark</span>}
        </>
      )}
    </button>
  );
}

function HeaderNotificationsButton({ className }: { className?: string }) {
  const { status, convexUser } = useAuth();
  const [unread, setUnread] = React.useState(0);
  const isAuthed = status === "authenticated";

  React.useEffect(() => {
    if (!isAuthed || !convexUser?._id) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const count = await convexClient.query<number>(
          "notifications:getUnreadCount",
          { user_id: convexUser._id },
        );
        if (!cancelled) setUnread(count);
      } catch {
        if (!cancelled) setUnread(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, convexUser?._id]);

  if (!isAuthed) return null;

  return (
    <Link
      href="/profile?tab=notifications"
      title="Notifications"
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-md text-text-muted hover:bg-elevated hover:text-text-main transition-colors",
        className,
      )}
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 inline-flex items-center justify-center text-[10px] font-bold bg-brand-lime text-black rounded-full">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}


export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const pathname = usePathname();
  const { status, firebaseUser, convexUser, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { resolved, setMode } = useTheme();
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
        "sticky top-0 z-50 w-full transition-all duration-300 ease-out",
        scrolled && !open
          ? "pt-3 sm:pt-4 px-3 sm:px-6 md:px-8 pointer-events-none bg-transparent border-transparent"
          : "pt-0 px-0 pointer-events-auto bg-bg/85 backdrop-blur-md border-b border-border-default/50"
      )}
    >
      <nav
        className={cn(
          "w-full transition-all duration-300 ease-out flex items-center justify-between pointer-events-auto",
          scrolled && !open
            ? "max-w-5xl mx-auto h-14 md:h-16 px-4 md:px-6 rounded-full bg-surface/85 dark:bg-surface/80 backdrop-blur-xl border border-border-strong/50 dark:border-border-default/80 shadow-lg shadow-black/8 dark:shadow-black/35"
            : "max-w-7xl mx-auto h-16 md:h-20 px-5 md:px-8 rounded-none border-0 bg-transparent shadow-none",
          open && "bg-bg border-b border-border-default rounded-none"
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 md:gap-3 select-none"
          aria-label="Turfzo home"
        >
          <Image
            src="/turfzo_mascot.svg"
            alt="Turfzo Logo"
            width={44}
            height={44}
            className={cn(
              "transition-all duration-300",
              scrolled && !open ? "h-8 w-8 md:h-9 md:w-9" : "h-10 w-10 md:h-11 md:w-11"
            )}
            priority
          />
          <span
            className={cn(
              "font-sans font-bold text-text-main tracking-tight leading-none whitespace-nowrap transition-all duration-300",
              scrolled && !open ? "text-lg md:text-xl" : "text-xl md:text-2xl"
            )}
          >
            turf<span className="text-brand-lime">zo</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center justify-center font-sans font-medium rounded-full transition-all duration-200",
                  scrolled && !open
                    ? "h-9 px-3.5 text-xs lg:text-sm"
                    : "h-11 px-4 text-sm",
                  active
                    ? "text-text-main bg-elevated font-semibold shadow-2xs"
                    : "text-text-muted hover:text-text-main hover:bg-elevated/60"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {isAuthed && (
            <Link
              href="/tournaments/manage"
              aria-current={isActive(pathname, "/tournaments/manage") ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center font-sans font-medium rounded-full transition-all duration-200",
                scrolled && !open
                  ? "h-9 px-3.5 text-xs lg:text-sm"
                  : "h-11 px-4 text-sm",
                isActive(pathname, "/tournaments/manage")
                  ? "text-text-main bg-elevated font-semibold shadow-2xs"
                  : "text-text-muted hover:text-text-main hover:bg-elevated/60"
              )}
            >
              My Tournaments
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <HeaderThemeButton
            className={cn(
              "rounded-full transition-all duration-200",
              scrolled && !open ? "h-9 px-3 text-xs" : "h-11 px-3.5 text-xs"
            )}
          />
          {isAuthed ? (
            <>
              <HeaderNotificationsButton
                className={cn(
                  "rounded-full transition-all duration-200",
                  scrolled && !open ? "h-9 w-9" : "h-11 w-11"
                )}
              />
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full transition-all duration-200 gap-2",
                  scrolled && !open
                    ? "h-9 px-3.5 text-xs md:text-sm"
                    : "h-11 px-5 text-sm"
                )}
              >
                <UserIcon className={cn(scrolled && !open ? "size-4" : "size-4.5")} />
                <span className="max-w-[120px] truncate">
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
                className={cn(
                  "rounded-full transition-all duration-200",
                  scrolled && !open ? "h-9 w-9" : "h-11 w-11"
                )}
              >
                <LogOut className={cn(scrolled && !open ? "size-4" : "size-4.5")} />
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSignInClick}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full transition-all duration-200 cursor-pointer",
                  scrolled && !open
                    ? "h-9 px-4 text-xs md:text-sm"
                    : "h-11 px-5 text-sm"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleSignUpClick}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-full transition-all duration-200 cursor-pointer font-semibold",
                  scrolled && !open
                    ? "h-9 px-4 md:px-5 text-xs md:text-sm"
                    : "h-11 px-6 text-sm"
                )}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <HeaderThemeButton
            className={cn(
              "rounded-full transition-all duration-200",
              scrolled && !open ? "h-9 w-9 p-0" : "h-10 w-10 p-0"
            )}
            showLabel={false}
          />
          <HeaderNotificationsButton
            className={cn(
              "rounded-full transition-all duration-200",
              scrolled && !open ? "h-9 w-9" : "h-10 w-10"
            )}
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "md:hidden rounded-full transition-all duration-200",
              scrolled && !open ? "h-9 w-9" : "h-10 w-10"
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <MenuToggleIcon open={open} className={cn(scrolled && !open ? "size-5" : "size-6")} duration={300} />
          </Button>
        </div>
      </nav>

      <div
        className={cn(
          "bg-bg/98 fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col overflow-hidden border-y border-border-default md:hidden",
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
          <div className="flex flex-col gap-3">
            {/* Mobile Theme Segmented Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border-default">
              <span className="text-sm font-semibold text-text-main">
                Theme
              </span>
              <div className="inline-flex items-center p-1 rounded-lg bg-elevated border border-border-subtle gap-1">
                <button
                  type="button"
                  onClick={() => setMode("light")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    resolved === "light"
                      ? "bg-surface text-text-main shadow-xs font-bold"
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setMode("dark")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    resolved === "dark"
                      ? "bg-surface text-text-main shadow-xs font-bold"
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Dark
                </button>
              </div>
            </div>

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
            {isAuthed && (
              <Link
                href="/tournaments/manage"
                onClick={() => setOpen(false)}
                aria-current={
                  isActive(pathname, "/tournaments/manage") ? "page" : undefined
                }
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    className: "justify-start",
                  }),
                  "h-14 px-4 text-base",
                  isActive(pathname, "/tournaments/manage")
                    ? "text-text-main bg-surface"
                    : "text-text-muted"
                )}
              >
                My Tournaments
              </Link>
            )}
          </div>
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
