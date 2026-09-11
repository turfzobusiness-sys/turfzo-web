"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, User as UserIcon, Sun, Moon, Monitor, Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { convexClient } from "@/lib/convex";
import { enableWebPush, isWebPushSupported, wasWebPushEnabled } from "@/lib/push";
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

/**
 * One-shot "turn on browser notifications" button. Visible only for
 * signed-in users on browsers that support web push and haven't enabled it
 * yet — disappears once enabled (or when unsupported / VAPID not set).
 */
function HeaderPushButton({ className }: { className?: string }) {
  const { status } = useAuth();
  const [visible, setVisible] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const isAuthed = status === "authenticated";

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAuthed) {
        if (!cancelled) setVisible(false);
        return;
      }
      const supported = await isWebPushSupported();
      if (!cancelled) setVisible(supported && !wasWebPushEnabled());
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  if (!isAuthed || !visible) return null;

  const enable = async () => {
    setBusy(true);
    try {
      await enableWebPush();
      setVisible(false);
      toast.success("Notifications enabled", {
        description: "You'll get booking reminders on this device.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't enable notifications.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={enable}
      disabled={busy}
      title="Enable browser notifications"
      aria-label="Enable browser notifications"
      className={cn(
        "relative inline-flex items-center justify-center rounded-md text-text-muted hover:bg-elevated hover:text-text-main transition-colors",
        busy && "opacity-50",
        className,
      )}
    >
      <BellRing className="size-5" />
    </button>
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
          {isAuthed && (
            <Link
              href="/tournaments/manage"
              aria-current={isActive(pathname, "/tournaments/manage") ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "relative h-12 px-4 font-sans text-sm font-medium",
                isActive(pathname, "/tournaments/manage")
                  ? "text-text-main"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              My Tournaments
              {isActive(pathname, "/tournaments/manage") && (
                <span className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-text-main" />
              )}
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <HeaderThemeButton />
          {isAuthed ? (
            <>
              <HeaderPushButton className="h-12 w-12" />
              <HeaderNotificationsButton className="h-12 w-12" />
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
          <HeaderThemeButton className="h-10 w-10 p-0" showLabel={false} />
          <HeaderPushButton className="h-10 w-10" />
          <HeaderNotificationsButton className="h-10 w-10" />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10"
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
