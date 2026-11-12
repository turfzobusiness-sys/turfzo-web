"use client";

/**
 * Owner dashboard shell — the inspiration is a modern ops console: a floating
 * rounded sidebar (venue identity up top, grouped nav, user chip at the
 * bottom) and a content area of separate rounded boxes on a dark canvas.
 * Deliberately NOT a copy: Turfzo's own tokens (obsidian surfaces, lime
 * accent, hairline borders) and grouping follow the owner's actual workflow.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  Ban,
  Wallet,
  LifeBuoy,
  PanelLeftClose,
  PanelLeft,
  Bell,
  ChevronDown,
  LogOut,
  CalendarRange,
  Trophy,
  Users,
  Star,
  Ticket,
  IndianRupee,
  TrendingUp,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export type OwnerView =
  | "overview"
  | "venues"
  | "bookings"
  | "bulk-block"
  | "calendar"
  | "tournaments"
  | "customers"
  | "reviews"
  | "promotions"
  | "pricing"
  | "analytics"
  | "settings"
  | "earnings"
  | "support";

interface OwnerShellProps {
  businessName: string;
  ownerName?: string;
  city?: string;
  /** Live listing count, shown in the sidebar identity block. */
  venueCount: number;
  active: OwnerView;
  onNavigate: (view: OwnerView) => void;
  children: React.ReactNode;
}

const NAV_SECTIONS: {
  label: string;
  items: { view: OwnerView; label: string; icon: React.ElementType }[];
}[] = [
  {
    label: "OPERATIONS",
    items: [
      { view: "overview", label: "Dashboard", icon: LayoutDashboard },
      { view: "venues", label: "My Venues", icon: Building2 },
      { view: "bookings", label: "Bookings", icon: CalendarCheck2 },
      { view: "bulk-block", label: "Slot blocking", icon: Ban },
      { view: "calendar", label: "Calendar", icon: CalendarRange },
      { view: "tournaments", label: "Tournaments", icon: Trophy },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { view: "customers", label: "Customers", icon: Users },
      { view: "reviews", label: "Reviews", icon: Star },
      { view: "promotions", label: "Promotions", icon: Ticket },
      { view: "pricing", label: "Pricing Rules", icon: IndianRupee },
      { view: "analytics", label: "Analytics", icon: TrendingUp },
    ],
  },
  {
    label: "MONEY",
    items: [{ view: "earnings", label: "Earnings", icon: Wallet }],
  },
  {
    label: "SYSTEM",
    items: [
      { view: "settings", label: "Settings", icon: Settings },
      { view: "support", label: "Support", icon: LifeBuoy },
    ],
  },
];

export default function OwnerShell({
  businessName,
  ownerName,
  city,
  venueCount,
  active,
  onNavigate,
  children,
}: OwnerShellProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials =
    (ownerName || businessName)
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "O";

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans">
      {/* ── Floating rounded sidebar ── */}
      <aside
        className={`fixed inset-y-3 left-3 z-40 hidden md:flex flex-col rounded-xl border border-border-default bg-surface transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {/* Identity block */}
        <div className="flex items-center gap-3 p-4 border-b border-border-default">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-lime/15 flex items-center justify-center">
            <span className="text-brand-text font-extrabold text-sm">
              {initials}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-main truncate leading-tight">
                {businessName}
              </p>
              <p className="text-[11px] text-text-muted truncate leading-tight">
                {venueCount} venue{venueCount === 1 ? "" : "s"}
                {city ? ` · ${city}` : ""}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-text-muted hover:text-text-main transition-colors"
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-text-hint">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.view;
                  return (
                    <button
                      key={item.view}
                      onClick={() => onNavigate(item.view)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-elevated text-text-main border border-border-strong"
                          : "text-text-muted hover:text-text-main hover:bg-elevated/60 border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-brand-text" : ""
                        }`}
                      />
                      {!collapsed && item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User chip */}
        <div className="p-3 border-t border-border-default">
          <button
            onClick={handleSignOut}
            title="Sign out"
            className={`w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-elevated/60 transition-all group ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-elevated border border-border-default flex items-center justify-center">
              <span className="text-[11px] font-bold text-text-secondary">
                {initials}
              </span>
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-bold text-text-main truncate leading-tight">
                    {ownerName || "Owner"}
                  </p>
                  <p className="text-[10px] text-text-muted leading-tight">
                    Partner
                  </p>
                </div>
                <LogOut className="h-3.5 w-3.5 text-text-muted group-hover:text-text-main transition-colors" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 bg-bg/90 backdrop-blur border-b border-border-default px-4 py-3">
        <div className="h-8 w-8 rounded-lg bg-brand-lime/15 flex items-center justify-center">
          <span className="text-brand-text font-extrabold text-xs">
            {initials}
          </span>
        </div>
        <p className="text-sm font-bold text-text-main truncate flex-1">
          {businessName}
        </p>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="text-text-muted hover:text-text-main"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* ── Content area ── */}
      <div
        className={`transition-all duration-200 ${
          collapsed ? "md:pl-[88px]" : "md:pl-72"
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur px-4 md:px-6 py-3 border-b border-border-default/60">
          <div className="flex items-center gap-3">
            <OwnerViewSwitcher active={active} onNavigate={onNavigate} />
            <div className="flex-1" />
            <button
              onClick={() => onNavigate("bookings")}
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border-default bg-surface px-3.5 py-2 text-xs font-bold text-text-secondary hover:text-text-main hover:border-border-strong transition-all"
            >
              <Bell className="h-3.5 w-3.5 text-brand-text" />
              Bookings
            </button>
          </div>
        </header>

        {/* Page body — vertical rhythm of rounded boxes */}
        <main className="px-4 md:px-6 pt-5 pb-16 space-y-5 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Compact mobile view switcher (sidebar is hidden on small screens). */
function OwnerViewSwitcher({
  active,
  onNavigate,
}: {
  active: OwnerView;
  onNavigate: (view: OwnerView) => void;
}) {
  const [open, setOpen] = useState(false);
  const current =
    NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.view === active) ??
    NAV_SECTIONS[0].items[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface px-4 py-2 text-sm font-bold text-text-main"
      >
        <CurrentIcon className="h-4 w-4 text-brand-text" />
        {current.label}
        <ChevronDown
          className={`h-3.5 w-3.5 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-12 left-0 z-50 w-52 rounded-xl border border-border-default bg-surface shadow-xl overflow-hidden">
            {NAV_SECTIONS.flatMap((s) => s.items).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    item.view === active
                      ? "bg-elevated text-text-main"
                      : "text-text-muted hover:bg-elevated/60 hover:text-text-main"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
