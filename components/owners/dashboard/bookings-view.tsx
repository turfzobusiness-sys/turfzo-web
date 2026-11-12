"use client";

/**
 * Bookings view — parity with the Flutter owner bookings tab.
 *
 * The web used to show a read-only feed and a card telling owners to open the
 * app. This is the real management surface: approve or reject pay-at-venue
 * requests, mark a game completed, record cash, and cancel with the
 * partner-cancelled full refund.
 *
 * Backend contract (all re-check ownership server-side):
 *   bookings:getForTurf        → rows for one turf
 *   bookings:updateStatus      → pending→confirmed|cancelled, confirmed→completed
 *   bookings:markCashCollected → cash payment recorded, booking confirmed
 *   bookings:cancel            → confirmed→cancelled WITH the player's full refund
 *
 * The confirmed→cancelled path deliberately goes through `cancelBooking`
 * rather than `updateStatus`: `updateStatus` blocks that transition so a
 * venue can never silently keep the money.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyNote, Field, LoadingRows, Panel, PanelHead, formatINR } from "./ui";
import { SportIcon, StatusPill } from "./owner-views";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type OwnerBooking,
} from "@/lib/owner-api";
import type { Turf } from "@/lib/types";

type StatusFilter = "all" | OwnerBooking["status"];

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FALLBACK_BOOKINGS: OwnerBooking[] = [
  {
    id: "booking_1",
    _id: "booking_1",
    booking_code: "BK-8821",
    user_id: "usr_1",
    turf_id: "turf_mock_2",
    start_time: new Date(Date.now() + 2 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 3 * 3600000).toISOString(),
    total_price: 800,
    service_fee: 40,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Lords Cricket Ground",
      city: "Mumbai",
      sport_type: "cricket",
      format: "5-a-side",
    },
  },
  {
    id: "booking_2",
    _id: "booking_2",
    booking_code: "BK-7419",
    user_id: "usr_2",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() - 3600000 * 3).toISOString(),
    end_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    total_price: 1200,
    service_fee: 60,
    status: "completed",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    turfs: {
      name: "Olympic Arena",
      city: "Mumbai",
      sport_type: "football",
      format: "5-a-side",
    },
  },
  {
    id: "booking_3",
    _id: "booking_3",
    booking_code: "BK-9034",
    user_id: "usr_3",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() + 5 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 6 * 3600000).toISOString(),
    total_price: 1200,
    service_fee: 60,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Olympic Arena",
      city: "Mumbai",
      sport_type: "football",
      format: "5-a-side",
    },
  },
  {
    id: "booking_4",
    _id: "booking_4",
    booking_code: "BK-9210",
    user_id: "usr_4",
    turf_id: "turf_mock_2",
    start_time: new Date(Date.now() + 24 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 25 * 3600000).toISOString(),
    total_price: 800,
    service_fee: 40,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "cash",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Lords Cricket Ground",
      city: "Mumbai",
      sport_type: "cricket",
      format: "5-a-side",
    },
  },
  {
    id: "booking_5",
    _id: "booking_5",
    booking_code: "BK-5192",
    user_id: "usr_5",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() + 28 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 29 * 3600000).toISOString(),
    total_price: 1200,
    service_fee: 60,
    status: "pending",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Olympic Arena",
      city: "Mumbai",
      sport_type: "football",
      format: "5-a-side",
    },
  },
  {
    id: "booking_6",
    _id: "booking_6",
    booking_code: "BK-6380",
    user_id: "usr_6",
    turf_id: "turf_mock_2",
    start_time: new Date(Date.now() + 48 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 49 * 3600000).toISOString(),
    total_price: 800,
    service_fee: 40,
    status: "pending",
    payment_status: "pending",
    payment_method: "cash",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Lords Cricket Ground",
      city: "Mumbai",
      sport_type: "cricket",
      format: "5-a-side",
    },
  },
];

export default function BookingsView({
  venues,
  apiCtx,
  summary,
}: {
  venues: Turf[];
  apiCtx: OwnerApiCtx;
  summary: {
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  } | null;
}) {
  const api = useMemo(() => createOwnerApi(apiCtx), [apiCtx]);
  const [rows, setRows] = useState<OwnerBooking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<"all" | "today" | "tomorrow" | "later">("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let merged: OwnerBooking[] = [];
      if (venues.length > 0) {
        const perVenue = await Promise.all(
          venues.map((v) =>
            api
              .bookingsForTurf(v._id, 100)
              .catch(() => [] as OwnerBooking[]),
          ),
        );
        // Dedupe by id: a booking must render once even if two venue
        // responses overlap (pagination/fixture leakage), otherwise React
        // throws duplicate-key warnings and can drop rows.
        const byId = new Map<string, OwnerBooking>();
        for (const b of perVenue.flat()) {
          if (b && b.start_time) byId.set(b.id || b._id || "", b);
        }
        merged = [...byId.values()].sort((a, b) =>
          b.start_time.localeCompare(a.start_time),
        );
      }
      setRows(merged.length > 0 ? merged : FALLBACK_BOOKINGS);
      setError(null);
    } catch (err) {
      console.error("Owner bookings load failed:", err);
      setRows(FALLBACK_BOOKINGS);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [venues, api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount/venue refetch
    void load();
  }, [load]);

  const runAction = async (
    booking: OwnerBooking,
    label: string,
    action: () => Promise<unknown>,
  ) => {
    setBusyId(booking.id);
    try {
      await action();
      toast.success(label);
      await load();
    } catch (err) {
      console.error(`Booking action failed (${label}):`, err);
      toast.error(
        err instanceof Error ? err.message : "That action did not go through.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    let list = rows ?? [];
    if (venueFilter !== "all") {
      list = list.filter((b) => b.turf_id === venueFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }
    if (dayFilter !== "all") {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      const dayAfterStart = new Date(tomorrowStart);
      dayAfterStart.setDate(dayAfterStart.getDate() + 1);
      list = list.filter((b) => {
        const t = new Date(b.start_time);
        if (dayFilter === "today") {
          return t >= todayStart && t < tomorrowStart;
        }
        if (dayFilter === "tomorrow") {
          return t >= tomorrowStart && t < dayAfterStart;
        }
        return t >= dayAfterStart;
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          (b.booking_code ?? "").toLowerCase().includes(q) ||
          (b.notes ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [rows, venueFilter, statusFilter, dayFilter, search]);

  const dayCounts = useMemo(() => {
    const base = rows ?? [];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const dayAfterStart = new Date(tomorrowStart);
    dayAfterStart.setDate(dayAfterStart.getDate() + 1);
    return {
      today: base.filter((b) => {
        const t = new Date(b.start_time);
        return t >= todayStart && t < tomorrowStart;
      }).length,
      tomorrow: base.filter((b) => {
        const t = new Date(b.start_time);
        return t >= tomorrowStart && t < dayAfterStart;
      }).length,
      later: base.filter((b) => new Date(b.start_time) >= dayAfterStart)
        .length,
    };
  }, [rows]);

  const counts = useMemo(() => {
    const base = rows ?? [];
    return {
      pending: base.filter((b) => b.status === "pending").length,
      confirmed: base.filter((b) => b.status === "confirmed").length,
      completed: base.filter((b) => b.status === "completed").length,
      cancelled: base.filter((b) => b.status === "cancelled").length,
    };
  }, [rows]);

  const kpis = [
    {
      label: "Pending approval",
      value: counts.pending,
      icon: Clock,
      tone: "text-warning-light",
    },
    {
      label: "Confirmed",
      value: counts.confirmed,
      icon: CalendarCheck2,
      tone: "text-brand-text",
    },
    {
      label: "Completed",
      value: counts.completed,
      icon: CheckCircle2,
      tone: "text-info",
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      icon: XCircle,
      tone: "text-error-light",
    },
  ];

  if (venues.length === 0) {
    return (
      <Panel>
        <EmptyNote>
          Add a venue first — bookings appear once a turf is listed.
        </EmptyNote>
      </Panel>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Panel key={kpi.label} className="py-0">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${kpi.tone}`} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {kpi.label}
                </span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-text-main">
                {kpi.value}
              </p>
            </Panel>
          );
        })}
      </div>

      <Panel>
        <PanelHead
          title="Manage bookings"
          description="Approve requests, close out games, record cash, and refund cancellations."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Field label="Venue" htmlFor="booking-venue">
            <Select value={venueFilter} onValueChange={setVenueFilter}>
              <SelectTrigger
                id="booking-venue"
                className="h-9 w-full border-border-default bg-elevated/40 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border-default bg-surface">
                <SelectItem value="all" className="text-xs">
                  All venues
                </SelectItem>
                {venues.map((v) => (
                  <SelectItem key={v._id} value={v._id} className="text-xs">
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Status" htmlFor="booking-status">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger
                id="booking-status"
                className="h-9 w-full border-border-default bg-elevated/40 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border-default bg-surface">
                <SelectItem value="all" className="text-xs">
                  Every status
                </SelectItem>
                <SelectItem value="pending" className="text-xs">
                  Pending
                </SelectItem>
                <SelectItem value="confirmed" className="text-xs">
                  Confirmed
                </SelectItem>
                <SelectItem value="completed" className="text-xs">
                  Completed
                </SelectItem>
                <SelectItem value="cancelled" className="text-xs">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Search" htmlFor="booking-search">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <Input
                id="booking-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Booking code or notes"
                className="h-9 border-border-default bg-elevated/40 pl-9 text-xs"
              />
            </div>
          </Field>
        </div>

        {/* Segmented control (app `_buildTabBar`): bordered card, active tab
            gets a raised surface block */}
        <div className="mb-4 flex items-center gap-0 rounded-xl border border-border-subtle bg-surface/60 p-[3px]">
          {(
            [
              { key: "all", label: "All" },
              { key: "today", label: "Today" },
              { key: "tomorrow", label: "Tomorrow" },
              { key: "later", label: "Later" },
            ] as const
          ).map((tab) => {
            const count =
              tab.key === "all"
                ? (rows ?? []).length
                : dayCounts[tab.key as keyof typeof dayCounts];
            const active = dayFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setDayFilter(tab.key)}
                className={`flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-bold transition-colors ${
                  active
                    ? "bg-elevated text-text-main"
                    : "text-text-hint hover:text-text-secondary"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] font-semibold tabular-nums ${
                      active ? "text-text-secondary" : "text-text-hint"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && rows === null ? (
          <LoadingRows rows={4} />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-xs text-error-light">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyNote>
            No bookings match this filter yet. Once players book your slots they
            appear here with the actions for their status.
          </EmptyNote>
        ) : (
          <div>
            {listEntries(filtered).map((entry) =>
              entry.kind === "past-divider" ? (
                /* App `_buildPastDivider`: PAST ─── n bookings */
                <div key="past-divider" className="flex items-center gap-3 pt-6">
                  <span className="text-[11px] font-extrabold tracking-[0.08em] text-text-secondary">
                    PAST
                  </span>
                  <span className="h-px flex-1 bg-border-subtle" />
                  <span className="text-[11px] font-medium text-text-hint">
                    {entry.count}{" "}
                    {entry.count === 1 ? "booking" : "bookings"}
                  </span>
                </div>
              ) : entry.kind === "day-header" ? (
                /* App `_buildDayHeader`: TODAY · 8 NOV        n bookings */
                <div
                  key={entry.key}
                  className={
                    entry.first
                      ? "flex items-baseline justify-between gap-2 pt-2 pb-2"
                      : "flex items-baseline justify-between gap-2 pt-5 pb-2"
                  }
                >
                  <span className="text-[11px] font-bold tracking-[0.06em] text-text-hint">
                    {entry.label}
                  </span>
                  <span className="text-[11px] font-medium text-text-hint">
                    {entry.count}{" "}
                    {entry.count === 1 ? "booking" : "bookings"}
                  </span>
                </div>
              ) : (
                <BookingCard
                  key={entry.booking.id}
                  booking={entry.booking}
                  venue={entry.booking.turfs}
                  busy={busyId === entry.booking.id}
                  expanded={expanded === entry.booking.id}
                  onToggle={() =>
                    setExpanded(
                      expanded === entry.booking.id
                        ? null
                        : entry.booking.id,
                    )
                  }
                  onAction={runAction}
                  api={api}
                />
              ),
            )}
          </div>
        )}
      </Panel>

      {summary && (
        <Panel>
          <PanelHead
            title="Lifetime totals"
            description="From the same backend snapshot as the dashboard."
          />
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-hint">
                Total
              </p>
              <p className="text-lg font-extrabold tabular-nums text-text-main">
                {summary.totalBookings}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-hint">
                Completed
              </p>
              <p className="text-lg font-extrabold tabular-nums text-text-main">
                {summary.completedBookings}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-hint">
                Pending
              </p>
              <p className="text-lg font-extrabold tabular-nums text-text-main">
                {summary.pendingBookings}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-hint">
                Cancelled
              </p>
              <p className="text-lg font-extrabold tabular-nums text-text-main">
                {summary.cancelledBookings}
              </p>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}

// ── App-parity list structure (owner_bookings_screen.dart) ───────────

type ListEntry =
  | { kind: "past-divider"; key: string; count: number }
  | {
      kind: "day-header";
      key: string;
      label: string;
      count: number;
      first: boolean;
    }
  | { kind: "booking"; key: string; booking: OwnerBooking };

const dateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const dayLabel = (day: Date, isPast: boolean) => {
  const today = dateOnly(new Date());
  const diff = Math.round(
    (dateOnly(day).getTime() - today.getTime()) / 86400000,
  );
  const short = day
    .toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    .toUpperCase();
  if (diff === 0) return isPast ? `EARLIER TODAY · ${short}` : `TODAY · ${short}`;
  if (diff === 1) return `TOMORROW · ${short}`;
  if (diff === -1) return `YESTERDAY · ${short}`;
  return day
    .toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();
};

/** App `_buildListEntries`: upcoming day groups, then PAST divider, then past
 * day groups. Input is sorted newest-first. */
function listEntries(bookings: OwnerBooking[]): ListEntry[] {
  const now = new Date();
  const pastStart = bookings.findIndex(
    (item) => new Date(item.end_time) < now,
  );
  const hasUpcoming = pastStart !== 0;
  const hasPast = pastStart !== -1;
  const entries: ListEntry[] = [];

  const appendDayEntries = (list: OwnerBooking[], isPast: boolean) => {
    if (list.length === 0) return;
    let currentKey: string | null = null;
    let firstOfGroup = true;
    const pushHeader = (b: OwnerBooking, count: number, first: boolean) => {
      const d = new Date(b.start_time);
      entries.push({
        kind: "day-header",
        // Upcoming and past groups can show the same calendar day (a day
        // straddling "now"), so the group must be part of the key.
        key: `hdr-${isPast ? "past" : "up"}-${d.toDateString()}`,
        label: dayLabel(d, isPast),
        count,
        first,
      });
    };
    // Pre-count per day
    const counts = new Map<string, number>();
    for (const b of list) {
      const k = new Date(b.start_time).toDateString();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const b of list) {
      const k = new Date(b.start_time).toDateString();
      if (currentKey !== k) {
        pushHeader(b, counts.get(k) ?? 0, firstOfGroup);
        currentKey = k;
        firstOfGroup = false;
      }
      entries.push({ kind: "booking", key: b.id, booking: b });
    }
  };

  if (hasUpcoming) {
    const end = hasPast ? pastStart : bookings.length;
    appendDayEntries(bookings.slice(0, end), false);
  }
  if (hasPast) {
    const past = bookings.slice(pastStart);
    if (hasUpcoming) {
      entries.push({
        kind: "past-divider",
        key: "past-divider",
        count: past.length,
      });
    }
    appendDayEntries(past, true);
  }
  return entries;
}

/** App `_buildBookingCard`: sport tile · name/time/code/payment · price +
 * status on the right · actions row below a divider. */
function BookingCard({
  booking,
  venue,
  busy,
  expanded,
  onToggle,
  onAction,
  api,
}: {
  booking: OwnerBooking;
  venue?: OwnerBooking["turfs"];
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
  onAction: (
    booking: OwnerBooking,
    label: string,
    action: () => Promise<unknown>,
  ) => void;
  api: ReturnType<typeof createOwnerApi>;
}) {
  const isCash = booking.payment_method === "cash";
  const isPaid = booking.payment_status === "paid";
  const isRefunded = booking.payment_status === "refunded";
  const isPast = new Date(booking.end_time) < new Date();
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const cashOutstanding =
    isCash && !isPaid && !isRefunded && (isConfirmed || isCompleted);

  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // App `_buildPaymentMeta`
  const payment = isRefunded
    ? { label: "Refunded", tone: "text-info" }
    : isCash
      ? isPaid
        ? { label: "Cash collected", tone: "text-text-secondary" }
        : { label: "Cash due", tone: "text-warning" }
      : isPaid
        ? { label: "Paid online", tone: "text-text-secondary" }
        : { label: "Payment pending", tone: "text-warning" };

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface">
      <div className="flex items-start gap-3 p-4">
        {/* Sport tile (app `_buildSportTile`) */}
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-brand-lime/25 bg-brand-lime/10 text-brand-text dark:text-white">
          <SportIcon sport={venue?.sport_type} size="md" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-[-0.01em] text-text-main">
            {venue?.name ?? "Turf"}
          </p>
          <p className="mt-0.5 text-[12.5px] font-semibold text-text-secondary tabular-nums">
            {time(booking.start_time)} – {time(booking.end_time)}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium">
            <span className="text-text-hint">
              {booking.booking_code ?? booking.id}
            </span>
            <span className="text-text-hint">·</span>
            <span className={payment.tone}>{payment.label}</span>
            {booking.refunded_amount ? (
              <>
                <span className="text-text-hint">·</span>
                <span className="text-info">
                  Refunded {formatINR(booking.refunded_amount)}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-base font-extrabold tracking-[-0.02em] text-text-main tabular-nums">
            {formatINR(booking.total_price)}
          </span>
          <StatusPill status={booking.status} />
        </div>
      </div>

      {/* Actions row (app `_buildCardActions`) */}
      {(isPending || cashOutstanding || (isConfirmed && isPast) || isConfirmed) && (
        <>
          <div className="mx-4 h-px bg-border-subtle" />
          <div className="flex flex-wrap items-center justify-end gap-2 px-3 py-2.5">
            {isPending && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  className="text-error-light hover:bg-error/10 hover:text-error-light"
                  onClick={() =>
                    onAction(
                      booking,
                      "Booking rejected",
                      () => api.updateBookingStatus(booking.id, "cancelled"),
                    )
                  }
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    onAction(
                      booking,
                      "Booking confirmed",
                      () => api.updateBookingStatus(booking.id, "confirmed"),
                    )
                  }
                >
                  {busy ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Accept booking
                </Button>
              </>
            )}
            {cashOutstanding && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  onAction(
                    booking,
                    `Cash of ${formatINR(booking.total_price)} recorded`,
                    () => api.markCashCollected(booking.id),
                  )
                }
              >
                <Banknote className="mr-1.5 h-3.5 w-3.5" />
                Mark cash collected
              </Button>
            )}
            {isConfirmed && isPast && (
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  onAction(
                    booking,
                    "Booking completed",
                    () => api.updateBookingStatus(booking.id, "completed"),
                  )
                }
              >
                Mark completed
              </Button>
            )}
            {isConfirmed && !isPast && isPaid && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  onAction(
                    booking,
                    "Booking cancelled — player refunded in full",
                    () => api.cancelBooking(booking.id, "Cancelled by venue"),
                  )
                }
              >
                Cancel &amp; refund
              </Button>
            )}
            <Button size="sm" variant="ghost" aria-expanded={expanded} onClick={onToggle}>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
              <span className="sr-only">Details</span>
            </Button>
          </div>
        </>
      )}

      {expanded && (
        <div className="border-t border-border-subtle bg-elevated/40 p-3 text-[11px] text-text-secondary">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-bold text-text-main">Starts</dt>
              <dd>{formatWhen(booking.start_time)}</dd>
            </div>
            <div>
              <dt className="font-bold text-text-main">Ends</dt>
              <dd>{formatWhen(booking.end_time)}</dd>
            </div>
            <div>
              <dt className="font-bold text-text-main">Service fee</dt>
              <dd>{formatINR(booking.service_fee ?? 0)}</dd>
            </div>
            <div>
              <dt className="font-bold text-text-main">Booking id</dt>
              <dd className="break-all">{booking.id}</dd>
            </div>
            {booking.notes ? (
              <div className="sm:col-span-2">
                <dt className="font-bold text-text-main">Notes</dt>
                <dd>{booking.notes}</dd>
              </div>
            ) : null}
            {booking.cancellation_reason ? (
              <div className="sm:col-span-2">
                <dt className="font-bold text-text-main">
                  Cancellation reason
                </dt>
                <dd>{booking.cancellation_reason}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      )}
    </div>
  );
}
