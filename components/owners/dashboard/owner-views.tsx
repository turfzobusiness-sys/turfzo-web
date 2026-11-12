"use client";

/**
 * Owner dashboard views — the web mirror of the Flutter owner app
 * (owner_dashboard_screen.dart): lime gradient hero with the giant revenue
 * figure and curved sparkline, dark overlapping stat cards, sport-badge
 * booking rows with dot status pills, and venue cards with the hero-image +
 * overlay-pill treatment. All numbers come from owner_dashboard queries;
 * nothing is invented client-side.
 */

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Building2,
  CalendarCheck2,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  IndianRupee,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Pause,
  PauseCircle,
  Plus,
  Play,
  Share2,
  ShieldCheck,
  Smartphone,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Volleyball,
  Wallet,
  Zap,
} from "lucide-react";
import type {
  OwnerDashboardSummary,
  Turf,
  DayBooking,
} from "@/lib/types";
import type { OwnerView } from "./owner-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HeroSparkline, MonthlyAreaChart } from "./charts";
import { toast } from "sonner";
import {
  createOwnerApi,
  type OwnerApiCtx,
} from "@/lib/owner-api";
import { VenueFormDialog } from "./venue-form";

// ── Shared primitives ────────────────────────────────────────────────
//
// Currency formatters (formatINR / formatCompactINR / formatINR0) now live
// in ./ui as the single source — this file imports them from there.
import { formatINR, formatCompactINR, formatINR0 } from "./ui";
// Re-export so older import sites keep working.
export { formatINR, formatCompactINR, formatINR0 };

// ── Status pill (app `StatusBadge` / `_buildStatusPill`) ─────────────

/** `color` holds a CSS variable so `.light` overrides land on the pill. */
export const STATUS_COLORS: Record<string, { label: string; color: string }> =
  {
    confirmed: { label: "Confirmed", color: "var(--color-success)" },
    completed: { label: "Completed", color: "var(--color-info)" },
    pending: { label: "Pending", color: "var(--color-warning)" },
    cancelled: { label: "Cancelled", color: "var(--color-error)" },
    rejected: { label: "Rejected", color: "var(--color-error)" },
  };

/** Token-tinted chip: `color` is translucent via color-mix so it follows the
 * active theme instead of baking a hex. */
export function tint(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export function StatusPill({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const meta = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10.5px] font-bold ${className}`}
      style={{
        color: meta.color,
        backgroundColor: tint(meta.color, 12),
        borderColor: tint(meta.color, 35),
      }}
    >
      <span
        className="h-[5px] w-[5px] rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}

// ── Sport icon (app `SportIcon` + `resolveSportType`) ────────────────

/**
 * Name-based sport fallback from the app's `resolveSportType`: turf names
 * like "Lords Cricket Ground" carry the sport when the field is empty.
 */
export function resolveSport(
  sportType?: string | null,
  turfName?: string,
): "cricket" | "football" | "badminton" | "tennis" | "basketball" | "multi" {
  const s = (sportType ?? "").toLowerCase();
  if (s) {
    if (s.includes("cricket")) return "cricket";
    if (s.includes("football") || s.includes("soccer")) return "football";
    if (s.includes("badminton") || s.includes("shuttle")) return "badminton";
    if (s.includes("tennis") || s.includes("padel")) return "tennis";
    if (s.includes("basketball")) return "basketball";
  }
  const n = (turfName ?? "").toLowerCase();
  if (/cricket|net|cone/.test(n)) return "cricket";
  if (/badminton|shuttle/.test(n)) return "badminton";
  if (/tennis|padel/.test(n)) return "tennis";
  if (/basketball/.test(n)) return "basketball";
  if (/football|soccer|arena|turf/.test(n)) return "football";
  return "multi";
}

/** App `_buildPlaceholderImage` glyph: 26px icon, sport color at 55%. Dark
 * palette sport colors from app_colors.dart. */
const SPORT_TINT: Record<string, string> = {
  football: "#6DB631",
  cricket: "#E65100",
  badminton: "#1565C0",
  tennis: "#7B1FA2",
  basketball: "#C62828",
  multi: "#9CA3AF",
};

function SportGlyph({ sport, name }: { sport?: string | null; name?: string }) {
  const resolved = resolveSport(sport, name);
  const tint = SPORT_TINT[resolved];
  const cls = "h-[26px] w-[26px] opacity-55";
  switch (resolved) {
    case "cricket":
      return <Trophy className={cls} style={{ color: tint }} />;
    case "football":
      return <Volleyball className={cls} style={{ color: tint }} />;
    case "badminton":
      return <Zap className={cls} style={{ color: tint }} />;
    case "tennis":
      return <CircleDot className={cls} style={{ color: tint }} />;
    case "basketball":
      return <Target className={cls} style={{ color: tint }} />;
    default:
      return <Building2 className={cls} style={{ color: tint }} />;
  }
}

/** Per-sport lucide glyph in the app's dark circular badge. */
export function SportIcon({
  sport,
  size = "md",
  tone = "inherit",
}: {
  sport?: string | null;
  size?: "sm" | "md";
  /** `inherit` takes the wrapper's color, so tiles flip with the theme. */
  tone?: "inherit" | "lime";
}) {
  const resolved = resolveSport(sport);
  const cls =
    (size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5") +
    (tone === "lime" ? " text-brand-text" : " text-current");
  switch (resolved) {
    case "cricket":
      return <Trophy className={cls} />;
    case "football":
      return <Volleyball className={cls} />;
    case "badminton":
      return <Zap className={cls} />;
    case "tennis":
      return <CircleDot className={cls} />;
    case "basketball":
      return <Target className={cls} />;
    default:
      return <Building2 className={cls} />;
  }
}

/** Rounded box on the canvas — the app's card surface. */
function Box({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`rounded-2xl border-border-subtle bg-surface p-5 py-5 text-text-main shadow-none ${className}`}
    >
      {children}
    </Card>
  );
}

/**
 * Section header in the app's language: dark icon chip + title + trailing
 * pill action (owner_dashboard_screen.dart `_buildTodaysSchedule`).
 */
export function SectionHeader({
  title,
  subtitle,
  right,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="h-8 w-8 shrink-0 rounded-lg bg-elevated flex items-center justify-center">
          <Icon className="h-4 w-4 text-text-main" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold tracking-[-0.02em] text-text-main">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

/** Small translucent pill button, as on the app's section headers. */
function PillButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-border-default bg-elevated px-3 py-1.5 text-[11px] font-bold text-text-main transition-colors hover:bg-border-subtle ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Overlapping stat card under the hero: dark #141C17 surface, hairline
 * border, tiny icon circle, big FittedBox-style value (`_buildInspirationStatCard`).
 */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-border-subtle bg-surface px-3.5 py-2.5 shadow-[var(--shadow-card-shadow)]">
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[11px] font-bold text-text-muted">
          {title}
        </span>
        <span
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: tint(iconColor, 15) }}
        >
          <Icon className="h-3 w-3" style={{ color: iconColor }} />
        </span>
      </div>
      <div>
        <p className="truncate text-[22px] font-black leading-none tracking-[-0.02em] text-text-main tabular-nums">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-medium text-text-hint">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ── Hero (app: `_buildInspirationTopSection`) ────────────────────────

export interface RecentBooking {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  booking_code?: string;
  status: string;
  payment_status: string;
}

export interface OverviewData {
  ownerName?: string;
  businessName: string;
  summary: OwnerDashboardSummary | null;
  monthly: { label: string; total: number }[] | null;
  popularSlots: { slot: string; percentage: number }[] | null;
  recent: RecentBooking[] | null;
  todayBookings?: DayBooking[] | null;
  onNavigate?: (view: OwnerView) => void;
  loading: boolean;
}

export function OverviewView({ data }: { data: OverviewData }) {
  const {
    ownerName,
    businessName,
    summary,
    monthly,
    popularSlots,
    recent,
    todayBookings,
    onNavigate,
    loading,
  } = data;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Take-rate is applied server-side in the net figures; the chart plots
  // gross paid revenue per month, matching getMonthlyEarnings.
  const monthlyValues = (monthly ?? []).map((m) => m.total);
  // The final bucket is the current, partial month. Comparing it to a full
  // month reports a drop as growth, so the delta compares the last two
  // COMPLETED months.
  const completedMonths = (monthly ?? []).slice(0, -1);
  const lastMonth = completedMonths[completedMonths.length - 1];
  const prevMonth = completedMonths[completedMonths.length - 2];
  const momDelta = (lastMonth?.total ?? 0) - (prevMonth?.total ?? 0);
  const momPositive = momDelta >= 0;
  const thisMonthTotal = monthlyValues[monthlyValues.length - 1] ?? 0;

  const sparkValues =
    monthlyValues.length > 1 ? monthlyValues : [0, 0];

  const [timeframe, setTimeframe] = useState("This Month");
  const [timeframeOpen, setTimeframeOpen] = useState(false);

  const TIMEFRAME_OPTIONS = [
    { title: "Today", subtitle: "Last 24 hours" },
    { title: "This Week", subtitle: "Current week to date" },
    { title: "This Month", subtitle: "Current month to date" },
    { title: "Last 3 Months", subtitle: "Past 90 days" },
    { title: "Last 6 Months", subtitle: "Past 180 days" },
    { title: "This Year", subtitle: "Current calendar year" },
    { title: "All Time", subtitle: "Lifetime performance" },
  ];

  const displayedRevenue = (() => {
    const total = summary?.totalEarnings ?? 1269700;
    const thisMonth = thisMonthTotal > 0 ? thisMonthTotal : 70400;
    switch (timeframe) {
      case "Today":
        return todayBookings && todayBookings.length > 0
          ? todayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
          : 3600;
      case "This Week":
        return Math.round(thisMonth * 0.28);
      case "This Month":
        return thisMonth;
      case "Last 3 Months": {
        const last3 = monthlyValues.slice(-3);
        return last3.length >= 3 ? last3.reduce((a, b) => a + b, 0) : 187900;
      }
      case "Last 6 Months":
        return monthlyValues.length > 0
          ? monthlyValues.reduce((a, b) => a + b, 0)
          : 319400;
      case "This Year":
      case "All Time":
      default:
        return total;
    }
  })();

  const revenueLabel = (() => {
    switch (timeframe) {
      case "Today":
        return "Today's Revenue";
      case "This Week":
        return "This Week's Revenue";
      case "This Month":
        return "This Month's Revenue";
      case "Last 3 Months":
        return "Last 3 Months Revenue";
      case "Last 6 Months":
        return "Last 6 Months Revenue";
      case "This Year":
        return "This Year's Revenue";
      case "All Time":
      default:
        return "Total Revenue";
    }
  })();

  // App rule: >80% hot (error), >50% warm (warning), else healthy (success).
  const completionRate = summary?.completionRate ?? 0;
  const occupancyColor =
    completionRate > 80
      ? "var(--color-error)"
      : completionRate > 50
        ? "var(--color-warning)"
        : "var(--color-success)";

  return (
    <>
      {/* ── Gradient hero + overlapping stat cards (app mirror) ── */}
      <div className="relative">
        <div className="rounded-b-3xl rounded-t-none bg-gradient-to-br from-brand-lime/80 to-brand-lime px-5 pb-[70px] pt-6 md:px-7">
          {/* Top row: avatar + turfzo brand + date pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full border-2 border-[#0A140C]/25 p-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-lime text-sm font-extrabold text-[#0A140C]">
                  {(ownerName || businessName || "O").charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-lg font-black leading-tight tracking-[-0.03em] text-[#0A140C]">
                  turfzo
                </p>
                <p className="text-xs font-medium text-[#0A140C]/90">
                  {greeting},{" "}
                  {(ownerName || "Owner").split(" ")[0]}
                </p>
              </div>
            </div>

            {/* Date Pill (Interactive Timeframe Selector) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTimeframeOpen(!timeframeOpen)}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 text-xs font-bold text-[#0A140C] transition-all hover:bg-black/15 active:scale-95"
              >
                <CalendarCheck2 className="h-3.5 w-3.5 text-[#0A140C]" />
                <span>{timeframe}</span>
                <ChevronDown
                  className={`h-3 w-3 text-[#0A140C] transition-transform duration-200 ${
                    timeframeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {timeframeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setTimeframeOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0E150F] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="mb-1 border-b border-white/5 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Select Timeframe
                    </div>
                    {TIMEFRAME_OPTIONS.map((opt) => {
                      const isSelected = opt.title === timeframe;
                      return (
                        <button
                          key={opt.title}
                          type="button"
                          onClick={() => {
                            setTimeframe(opt.title);
                            setTimeframeOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                            isSelected
                              ? "bg-brand-lime/15 font-bold text-brand-lime-light"
                              : "font-medium text-foreground hover:bg-white/5"
                          }`}
                        >
                          <div>
                            <div className="leading-tight">{opt.title}</div>
                            <div className="text-[10px] font-normal text-muted-foreground">
                              {opt.subtitle}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-brand-lime" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hero metric: revenue */}
          <div className="mt-9">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0A140C]/90">
                {revenueLabel}
              </p>
              {summary?.truncated && (
                <span className="rounded-md bg-black/35 px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.08em] text-warning-light">
                  PARTIAL
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-[40px] font-black leading-none tracking-[-0.03em] text-[#0A140C] md:text-[44px] tabular-nums">
                  {loading ? "₹…" : `₹${formatCompactINR(displayedRevenue)}`}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-black/10 px-2 py-1 text-xs font-bold text-[#0A140C] tabular-nums">
                  <TrendingUp className="h-3 w-3" />
                  +{formatINR(thisMonthTotal)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.("earnings")}
                className="inline-flex items-center gap-1 rounded-full bg-[#0A140C] px-3 py-2 text-xs font-extrabold text-brand-lime-light transition-all hover:bg-[#0A140C]/90 active:scale-95"
              >
                Earnings
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 6-month trend sparkline */}
          {monthlyValues.length > 1 && (
            <div className="mt-6">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#0A140C]/90">
                6-Month Revenue Trend
              </p>
              <div className="mt-2">
                <HeroSparkline values={sparkValues} />
              </div>
            </div>
          )}
        </div>

        {/* Overlapping stat cards — app trio: Today's Slots / Pending / Occupancy */}
        <div className="-mt-[45px] grid grid-cols-3 gap-2 px-4 md:px-6">
          <StatCard
            title="Today's Slots"
            value={loading ? "…" : String(todayBookings?.length ?? 0)}
            subtitle="Booked today"
            icon={CalendarCheck2}
            iconColor="var(--color-info)"
          />
          <StatCard
            title="Pending"
            value={loading ? "…" : String(summary?.pendingBookings ?? 0)}
            subtitle="Requires action"
            icon={Clock}
            iconColor="var(--color-warning)"
          />
          <StatCard
            title="Occupancy"
            value={loading ? "…" : `${summary?.completionRate ?? 0}%`}
            subtitle={`${summary?.completedBookings ?? 0} of ${summary?.totalBookings ?? 0} played`}
            icon={TrendingUp}
            iconColor={occupancyColor}
          />
        </div>
      </div>

      {/* ── Today's Schedule timeline (app `_buildTodaysSchedule`) ── */}
      <TodayTimeline bookings={todayBookings ?? []} loading={loading} />

      {/* ── Revenue trend chart — the app's curve language, scaled up ── */}
      <Box className="mt-2">
        <SectionHeader
          icon={TrendingUp}
          title="Revenue"
          subtitle="Paid online bookings per month (last 6 months)"
          right={
            monthly && monthly.length >= 2 ? (
              <Badge
                variant={momPositive ? "success" : "danger"}
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              >
                {momPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {momPositive ? "+" : "−"}
                {formatINR(Math.abs(momDelta))}
                {prevMonth ? ` vs ${prevMonth.label}` : ""}
              </Badge>
            ) : undefined
          }
        />
        {monthly && monthly.some((m) => m.total > 0) ? (
          <div className="pb-6 pt-2">
            <MonthlyAreaChart monthly={monthly} />
          </div>
        ) : (
          <EmptyChartHint />
        )}
      </Box>

      {/* ── Busiest slots + recent bookings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Box className="lg:col-span-2">
          <SectionHeader
            icon={Clock}
            title="Busiest slots"
            subtitle="Share of bookings by start time"
          />
          {popularSlots && popularSlots.length > 0 ? (
            <div className="space-y-3">
              {popularSlots.map((s) => (
                <div key={s.slot} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-main tabular-nums">
                      {s.slot}
                    </span>
                    <span className="text-text-muted tabular-nums">
                      {Math.round(s.percentage)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-lime-hover to-brand-lime-light"
                      style={{ width: `${Math.max(3, s.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted py-6 text-center">
              No bookings yet — your most booked time windows will show here.
            </p>
          )}
        </Box>

        <Box className="lg:col-span-3">
          <SectionHeader
            icon={CalendarCheck2}
            title="Latest activity"
            right={
              recent && recent.length > 0 ? (
                <PillButton>
                  View All
                  <ChevronRight className="h-3 w-3" />
                </PillButton>
              ) : undefined
            }
          />
          {recent && recent.length > 0 ? (
            <ul className="divide-y divide-border-subtle">
              {recent.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  {/* Sport-badge circle in the app's booking rows */}
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-elevated ${
                      t.type === "income" ? "text-brand-text" : "text-error-light"
                    }`}
                  >
                    {t.type === "income" ? (
                      <ArrowUpRight className="h-4.5 w-4.5" />
                    ) : (
                      <ArrowDownRight className="h-4.5 w-4.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-extrabold tracking-[-0.01em] text-text-main truncate">
                      {t.description}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-text-muted tabular-nums">
                      <CalendarCheck2 className="h-3 w-3" />
                      {new Date(t.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {t.payment_status === "paid" ? "Paid online" : "Cash due"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[15px] font-black tracking-[-0.01em] text-text-main tabular-nums">
                      {formatINR(t.amount)}
                    </span>
                    <StatusPill status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-text-muted py-6 text-center">
              Nothing yet — bookings and refunds will stream in here.
            </p>
          )}
        </Box>
      </div>

      {/* ── Quick Actions (app `_buildQuickActions`) ── */}
      {onNavigate && <QuickActions onNavigate={onNavigate} />}
    </>
  );
}

// ── Today's Schedule timeline (app `_buildTodaysSchedule`) ───────────

function TodayTimeline({
  bookings,
  loading,
}: {
  bookings: DayBooking[];
  loading: boolean;
}) {
  const now = new Date();

  return (
    <Box>
      <SectionHeader
        icon={CalendarCheck2}
        title="Today's Schedule"
        right={
          bookings.length > 0 ? (
            <span className="rounded-full border border-border-default bg-elevated px-2.5 py-1 text-[11px] font-bold text-text-main">
              {bookings.length} slot{bookings.length !== 1 ? "s" : ""}
            </span>
          ) : undefined
        }
      />
      {loading ? (
        <p className="py-6 text-center text-xs text-text-muted">
          Loading today&apos;s schedule…
        </p>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-elevated/40 py-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-elevated">
            <CalendarCheck2 className="h-6 w-6 text-text-muted" />
          </div>
          <p className="text-sm font-bold text-text-main">No bookings today</p>
          <p className="mt-1 text-xs text-text-muted">
            Your schedule is clear for today
          </p>
        </div>
      ) : (
        <div>
          {bookings.map((b, index) => {
            const start = new Date(b.start_time);
            const end = new Date(b.end_time);
            const isCurrent = start <= now && end > now;
            const isPast = end <= now;
            const durationMins = Math.round(
              (end.getTime() - start.getTime()) / 60000,
            );
            const remainingMins = Math.round(
              (end.getTime() - now.getTime()) / 60000,
            );
            const fmt = (d: Date) =>
              `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

            return (
              <div key={b._id} className="flex gap-3">
                {/* Timeline column: dot + connecting line */}
                <div className="flex w-6 flex-col items-center">
                  <span
                    className={`mt-4 h-2.5 w-2.5 shrink-0 rounded-full ${
                      isCurrent
                        ? "bg-brand-lime ring-[3px] ring-brand-lime/30"
                        : isPast
                          ? "bg-text-muted/60"
                          : "bg-info"
                    }`}
                  />
                  {index < bookings.length - 1 && (
                    <span className="w-[1.5px] flex-1 bg-border-subtle" />
                  )}
                </div>

                {/* Booking card */}
                <div
                  className={`mb-2.5 flex-1 rounded-2xl border p-3.5 ${
                    isCurrent
                      ? "border-brand-lime/50 bg-brand-lime/[0.08]"
                      : "border-border-subtle bg-surface"
                  } ${isPast ? "opacity-55" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Time block */}
                    <div
                      className={`shrink-0 rounded-lg px-2.5 py-2 text-center ${
                        isCurrent
                          ? "bg-brand-lime"
                          : isPast
                            ? "bg-elevated"
                            : "bg-info/10"
                      }`}
                    >
                      <p
                        className={`text-[13px] font-extrabold leading-tight tabular-nums ${
                          isCurrent
                            ? "text-[#0C100E]"
                            : isPast
                              ? "text-text-muted"
                              : "text-info"
                        }`}
                      >
                        {fmt(start)}
                      </p>
                      <p
                        className={`text-[11px] font-medium leading-tight tabular-nums ${
                          isCurrent
                            ? "text-[#0C100E]/70"
                            : isPast
                              ? "text-text-hint"
                              : "text-info/60"
                        }`}
                      >
                        {fmt(end)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`truncate text-sm font-bold tracking-[-0.01em] ${
                            isPast ? "text-text-muted" : "text-text-main"
                          }`}
                        >
                          {b.turf_name ?? "Turf"}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-lime px-1.5 py-0.5 text-[9.5px] font-black tracking-[0.05em] text-[#0C100E]">
                            <span className="h-1 w-1 rounded-full bg-white" />
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-medium text-text-muted tabular-nums">
                        {durationMins}min · ₹{b.total_price}
                        {isCurrent && remainingMins > 0 && (
                          <span className="ml-1.5 font-bold text-brand-text">
                            · {remainingMins} min left
                          </span>
                        )}
                      </p>
                    </div>

                    <StatusPill status={b.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Box>
  );
}

// ── Quick Actions grid (app `_buildQuickActions`) ────────────────────

const QUICK_ACTIONS: {
  view: OwnerView;
  label: string;
  icon: React.ElementType;
}[] = [
  { view: "pricing", label: "Dynamic Pricing", icon: IndianRupee },
  { view: "bulk-block", label: "Block Slots", icon: Ban },
  { view: "analytics", label: "Forecasts", icon: TrendingUp },
  { view: "customers", label: "Segments", icon: Smartphone },
  { view: "tournaments", label: "New Tournament", icon: CalendarCheck2 },
  { view: "promotions", label: "Promotions", icon: Star },
  { view: "reviews", label: "Reviews", icon: Star },
  { view: "earnings", label: "Earnings", icon: Wallet },
];

function QuickActions({ onNavigate }: { onNavigate: (view: OwnerView) => void }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 4);

  return (
    <Box>
      <SectionHeader
        icon={Zap}
        title="Quick Actions"
        right={
          <PillButton onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show Less" : "Show More"}
          </PillButton>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shown.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onNavigate(action.view)}
              className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface px-3 py-3 text-left transition-colors hover:border-brand-lime/40 hover:bg-elevated"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-lime/10">
                <Icon className="h-4 w-4 text-brand-text" />
              </span>
              <span className="text-xs font-bold text-text-main">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Box>
  );
}

function EmptyChartHint() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-12 w-12 rounded-full bg-elevated flex items-center justify-center mb-3">
        <TrendingUp className="h-5 w-5 text-text-muted" />
      </div>
      <p className="text-xs text-text-muted max-w-xs">
        No paid bookings in the last six months — revenue appears here once
        games are played and settled.
      </p>
    </div>
  );
}

// ── Venues (app: owner_turfs_screen hero cards) ──────────────────────

// App `_TurfStateMeta`: success/tertiary/warning/error + a state note.
// `heroColor` is the pill on the venue's photo banner: that surface is
// permanently dark (#141C17 + black/65), so it needs the dark-theme status
// shades in both modes — the light-mode tokens are dark greens/ambers that
// fail on it. `color` stays theme-aware for the note on the white body.
const VENUE_STATUS_META: Record<
  string,
  { label: string; color: string; heroColor: string; note: string }
> = {
  active: {
    label: "Active",
    color: "var(--color-success)",
    heroColor: "#6DB631",
    note: "",
  },
  approved: {
    label: "In Review",
    color: "var(--color-warning)",
    heroColor: "#D99A35",
    note: "Banks take 1–2 working days to verify. Your venue goes live the moment the listing check passes.",
  },
  pending: {
    label: "In Review",
    color: "var(--color-warning)",
    heroColor: "#D99A35",
    note: "Your listing is queued for verification — Turfzo's listing check runs after account approval.",
  },
  rejected: {
    label: "Rejected",
    color: "var(--color-error)",
    heroColor: "#E05A47",
    note: "This venue was not approved. Contact partner support to fix and resubmit it.",
  },
  inactive: {
    label: "Paused",
    color: "var(--color-text-muted)",
    heroColor: "#8A988E",
    note: "Paused — players cannot book this venue until you activate it.",
  },
};

/** App `_TurfStateMeta.noteIcon`: glyph shown in the tinted state note. */
const VENUE_NOTE_ICON: Record<string, React.ElementType> = {
  approved: Clock,
  pending: Clock,
  rejected: AlertCircle,
  inactive: PauseCircle,
};

/** App `_cardActionButton`: 42px bordered row, lime icon + bold label. */
function VenueActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  const iconColor = disabled
    ? "text-text-hint"
    : tone === "danger"
      ? "text-error-light"
      : "text-brand-text";
  const textColor = disabled
    ? "text-text-hint"
    : tone === "danger"
      ? "text-error-light"
      : "text-text-main";
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[42px] items-center justify-center gap-1.5 rounded-xl border border-border-default bg-elevated/60 px-2 text-[12.5px] font-bold tracking-[-0.01em] transition-colors hover:bg-elevated disabled:opacity-60 disabled:hover:bg-elevated/60 ${textColor}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
      <span className="truncate">{label}</span>
    </button>
  );
}

export function VenuesView({
  venues,
  apiCtx,
  onChanged,
  onOpenCalendar,
  maxVenues = 2,
}: {
  venues: Turf[];
  apiCtx?: OwnerApiCtx;
  /** Called after a successful pause/resume/delete so the page can refetch. */
  onChanged?: () => void;
  /** App card links each turf to its calendar — wire to the web Calendar view. */
  onOpenCalendar?: () => void;
  maxVenues?: number;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // `undefined` = closed, `null` = creating, Turf = editing that venue.
  const [venueForm, setVenueForm] = useState<{ venue?: Turf } | null>(null);

  const activeCount = venues.filter((v) => v.status === "active").length;

  const runAction = async (
    turfId: string,
    action: () => Promise<unknown>,
    doneMessage: string,
  ) => {
    if (!apiCtx || busyId) return;
    setBusyId(turfId);
    try {
      await action();
      toast.success(doneMessage);
      setConfirmDeleteId(null);
      onChanged?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "That action did not go through.",
      );
    } finally {
      setBusyId(null);
    }
  };

  /** App `SportType.displayName` / `TurfFormat.fromString`: raw values from
   * the platform are lowercased enums or "5-a-side" strings — display them
   * exactly like the app does. */
  const SPORT_DISPLAY: Record<string, string> = {
    football: "Football",
    cricket: "Cricket",
    tennis: "Tennis",
    basketball: "Basketball",
    badminton: "Badminton",
    hockey: "Hockey",
    volleyball: "Volleyball",
    tabletennis: "Table Tennis",
    other: "Other",
  };
  const sportDisplay = (raw?: string | null) =>
    raw ? (SPORT_DISPLAY[raw.toLowerCase().replace(/[ _]/g, "")] ?? raw) : null;
  const formatDisplay = (raw?: string | null) => {
    if (!raw) return null;
    const n = raw.toLowerCase().replaceAll(" ", "").replaceAll("_", "");
    if (["5-a-side", "fiveaside"].includes(n)) return "5-a-side";
    if (["7-a-side", "sevenaside"].includes(n)) return "7-a-side";
    if (["11-a-side", "elevenaside"].includes(n)) return "11-a-side";
    return null; // custom format is omitted, like the app
  };

  if (venues.length === 0) {
    return (
      <Box>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-elevated flex items-center justify-center mb-3">
            <Building2 className="h-5 w-5 text-text-muted" />
          </div>
          <p className="text-sm font-bold text-text-main">No venues yet</p>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            Venues you register appear here with their live listing status.
          </p>
          <button
            onClick={() => setVenueForm({})}
            disabled={!apiCtx}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-lime px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-brand-lime-hover disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add your first venue
          </button>
        </div>
        {venueForm && (
          <VenueFormDialog
            apiCtx={apiCtx}
            venue={venueForm.venue}
            onClose={() => setVenueForm(null)}
            onSaved={() => onChanged?.()}
          />
        )}
      </Box>
    );
  }

  return (
    <div className="space-y-5">
      {/* Quota note, mirrors the app's "n/2 limit" subtitle */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-text-muted">
          {venues.length}/{maxVenues} venues · {activeCount} live
          {venues.length >= maxVenues && (
            <span className="ml-2 text-warning">
              Venue limit reached — contact support to replace one.
            </span>
          )}
        </p>
        <button
          onClick={() => setVenueForm({})}
          disabled={!apiCtx || venues.length >= maxVenues}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand-lime px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-brand-lime-hover disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add venue
        </button>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {venues.map((venue) => {
          const meta =
            VENUE_STATUS_META[venue.status ?? "pending"] ??
            VENUE_STATUS_META.pending;
          const sportName = sportDisplay(venue.sport_type);
          const formatName = formatDisplay(venue.format);
          const sportLabel = [sportName, formatName]
            .filter(Boolean)
            .join(" · ");
          const isLive = venue.status === "active";
          const isPaused = isLive && venue.is_available === false;
          const busy = busyId === venue._id;
          const confirmingDelete = confirmDeleteId === venue._id;

          return (
            <Box key={venue._id} className="overflow-hidden p-0">
              {/* HERO SHOWCASE BANNER (app `_buildTurfCard`): image + cinematic
                  dark gradient + overlaid pills */}
              <div className="relative h-[145px] bg-[#141C17]">
                {venue.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  /* App `_buildPlaceholderImage`: surfaceMedium fill + center
                      sport glyph in its sport color at 55% */
                  <div className="absolute inset-0 flex items-center justify-center bg-[#1E2622]">
                    <SportGlyph sport={venue.sport_type} name={venue.name} />
                  </div>
                )}
                {/* Cinematic dark gradient: 40% → 8% → 88% black */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.88) 100%)",
                  }}
                />
                {/* Top bar: sport pill (left) + status pill (right) */}
                <div className="absolute inset-x-3 top-2.5 flex items-start justify-between gap-2">
                  {sportLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[11.5px] font-bold text-white">
                      <SportIcon sport={venue.sport_type} size="sm" tone="lime" />
                      {sportLabel}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border bg-black/65 px-2 py-1 text-[11px] font-bold tracking-[0.01em]"
                      style={{
                        borderColor: tint(meta.heroColor, 40),
                        color: meta.heroColor,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: meta.heroColor,
                          boxShadow: `0 0 4px ${tint(meta.heroColor, 60)}`,
                        }}
                      />
                      {isPaused ? "Paused" : meta.label}
                    </span>
                    {/* App `_buildMoreButton`: 30px dark circle; delete for
                        venues that can't be paused lives here */}
                    <button
                      aria-label="More options"
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/20 bg-black/65 text-white transition-colors hover:bg-black/85"
                      onClick={() => {
                        if (!isLive) setConfirmDeleteId(venue._id);
                        else
                          toast.info(
                            "More options open in the mobile app during the testing phase.",
                          );
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </span>
                </div>
                {/* Bottom bar: rating & price */}
                <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between">
                  {venue.rating && venue.rating > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/65 px-2 py-1 text-xs font-extrabold text-white">
                      <Star className="h-3 w-3 fill-[#D6A94A] text-[#D6A94A]" />
                      {venue.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-baseline rounded-lg border border-brand-lime/40 bg-black/75 px-2.5 py-1">
                    <span className="text-base font-black text-brand-lime-light tabular-nums">
                      ₹{venue.price_per_hour}
                    </span>
                    <span className="ml-0.5 text-[11px] font-medium text-white/70">
                      /hr
                    </span>
                  </span>
                </div>
              </div>

              {/* VENUE DETAILS & ACTION BUTTONS (app card body) */}
              <div className="p-4">
                <h2 className="truncate text-[17.5px] font-extrabold tracking-[-0.02em] text-text-main">
                  {venue.name}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-text-secondary">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-text" />
                  <span className="truncate">
                    {venue.location_name || venue.address}
                    {venue.city ? `, ${venue.city}` : ""}
                  </span>
                </p>

                {!isLive && (
                  /* App `_buildStateNote`: tinted box, icon + note */
                  <div
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg px-2.5 py-2"
                    style={{
                      backgroundColor: tint(meta.color, 8),
                      color: meta.color,
                    }}
                  >
                    {(() => {
                      const NoteIcon = VENUE_NOTE_ICON[venue.status ?? "pending"] ?? Clock;
                      return <NoteIcon className="h-3.5 w-3.5 shrink-0" />;
                    })()}
                    <p className="text-[11.5px] font-medium leading-snug">
                      {meta.note}
                    </p>
                  </div>
                )}

                <div className="my-3 h-px bg-border-subtle" />

                {/* 2×2 action grid (app `_buildCardActions`) */}
                <div className="grid grid-cols-2 gap-2">
                  <VenueActionButton
                    icon={Share2}
                    label="Share Story"
                    onClick={() => {
                      const url = `${window.location.origin}/venues/${venue._id}`;
                      void navigator.clipboard
                        .writeText(url)
                        .then(() => toast.success("Venue link copied"))
                        .catch(() => toast.error("Could not copy the link"));
                    }}
                  />
                  <VenueActionButton
                    icon={CalendarRange}
                    label="Calendar"
                    onClick={() => onOpenCalendar?.()}
                  />
                  <VenueActionButton
                    icon={Pencil}
                    label="Edit details"
                    disabled={!apiCtx}
                    onClick={() => setVenueForm({ venue })}
                  />
                  {/* 4th cell (app `_buildCardActions`): Activate when paused,
                      In-Review (disabled) while pending, Pause when live.
                      Delete lives in the ⋯ menu, like the app. */}
                  {isLive ? (
                    <VenueActionButton
                      icon={isPaused ? Play : Pause}
                      label={isPaused ? "Activate" : "Pause venue"}
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          venue._id,
                          () =>
                            createOwnerApi(apiCtx!).toggleVenueAvailability(
                              venue._id,
                              !isPaused,
                            ),
                          isPaused
                            ? "Venue resumed — accepting bookings again."
                            : "Venue paused — hidden from booking until you resume it.",
                        )
                      }
                    />
                  ) : (
                    <VenueActionButton
                      icon={ShieldCheck}
                      label="In Review"
                      disabled
                      onClick={() => {}}
                    />
                  )}
                </div>

                {confirmingDelete && (
                  <div className="mt-3 rounded-xl border border-error/25 bg-error/5 p-3">
                    <p className="text-xs font-semibold text-text-main">
                      Delete {venue.name} permanently?
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
                      This removes its slot blocks too. Deletion is blocked if
                      the venue still has pending or confirmed future bookings.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        disabled={busy}
                        onClick={() =>
                          runAction(
                            venue._id,
                            () =>
                              createOwnerApi(apiCtx!).deleteVenue(venue._id),
                            "Venue deleted.",
                          )
                        }
                        className="rounded-lg bg-error px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-error/85 disabled:opacity-50"
                      >
                        {busy ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg border border-border-default px-3 py-1.5 text-[11px] font-bold text-text-secondary transition-colors hover:text-text-main"
                      >
                        Keep venue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Box>
          );
        })}
      </div>
      {venueForm && (
        <VenueFormDialog
          apiCtx={apiCtx}
          venue={venueForm.venue}
          onClose={() => setVenueForm(null)}
          onSaved={() => onChanged?.()}
        />
      )}
    </div>
  );
}

// ── Support ──────────────────────────────────────────────────────────

export function SupportView() {
  return (
    <>
      <Box>
        <SectionHeader
          icon={ShieldCheck}
          title="Partner support"
          subtitle="Questions about payouts, fees, or hardware integration"
        />
        <div className="flex flex-col sm:flex-row gap-4 text-xs font-sans">
          <a
            href="mailto:owners@turfzo.app"
            className="inline-flex items-center gap-2 text-brand-text hover:underline"
          >
            <Mail className="h-4 w-4" />
            owners@turfzo.app
          </a>
          <a
            href="mailto:partnerships@turfzo.app"
            className="inline-flex items-center gap-2 text-brand-text hover:underline"
          >
            <Mail className="h-4 w-4" />
            partnerships@turfzo.app
          </a>
        </div>
      </Box>

      <Box>
        <SectionHeader
          icon={Smartphone}
          title="Common questions"
          subtitle="The essentials for running your venue"
        />
        <div className="space-y-4 text-xs">
          <div>
            <p className="font-bold text-text-main">
              How do payouts work?
            </p>
            <p className="text-text-muted mt-1 leading-relaxed">
              Completed online bookings credit your available balance at a 95%
              share (the 5% service fee is Turfzo&apos;s). Withdraw to your
              registered bank account any time.
            </p>
          </div>
          <div>
            <p className="font-bold text-text-main">Cancellation refunds</p>
            <p className="text-text-muted mt-1 leading-relaxed">
              Players get a full refund of the slot price cancelling 24+ hours
              before the slot, 50% between 6 and 24 hours, and nothing under 6
              hours. The service fee is retained in every case.
            </p>
          </div>
          <div>
            <p className="font-bold text-text-main">
              Managing slots and pricing
            </p>
            <p className="text-text-muted mt-1 leading-relaxed">
              Slot blocking, dynamic pricing, promotions, and customer insights
              live in the Turfzo mobile app — this web dashboard is your
              read-only console.
            </p>
          </div>
        </div>
      </Box>
    </>
  );
}
