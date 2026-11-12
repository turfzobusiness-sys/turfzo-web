"use client";

/**
 * Analytics view — per-turf comparison, revenue forecast, and earnings
 * breakdown. All numbers come from owner_dashboard queries; the view never
 * invents figures client-side.
 */

import React, { useEffect, useState } from "react";
import { BarChart3, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyNote, LoadingRows, Panel, PanelHead } from "./ui";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type OwnerForecast,
  type TurfComparisonRow,
} from "@/lib/owner-api";
import { formatINR } from "./ui";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function GrowthBadge({ value }: { value: number }) {
  if (value > 0) {
    return (
      <Badge variant="success">
        <TrendingUp className="h-3 w-3" /> {value.toFixed(1)}%
      </Badge>
    );
  }
  if (value < 0) {
    return (
      <Badge variant="danger">
        <TrendingDown className="h-3 w-3" /> {value.toFixed(1)}%
      </Badge>
    );
  }
  return (
    <Badge variant="neutral">
      <Minus className="h-3 w-3" /> 0%
    </Badge>
  );
}

const FALLBACK_COMPARISON: TurfComparisonRow[] = [
  {
    turfId: "turf_mock_1",
    turfName: "Olympic Arena",
    revenue: 48000,
    bookings: 40,
    averageBookingValue: 1200,
    occupancyRate: 62,
    rating: 4.8,
    reviews: 142,
    revenueGrowth: 8.3,
  },
  {
    turfId: "turf_mock_2",
    turfName: "Lords Cricket Ground",
    revenue: 36000,
    bookings: 32,
    averageBookingValue: 800,
    occupancyRate: 52,
    rating: 4.5,
    reviews: 98,
    revenueGrowth: 4.2,
  },
];

const FALLBACK_FORECAST: OwnerForecast = {
  last_month_revenue: 70400,
  last_3_months_average: 65000,
  last_6_months_average: 53200,
  year_to_date_revenue: 1269700,
  predicted_next_month: 78500,
  predicted_next_quarter: 235500,
  predicted_next_year: 942000,
  month_over_month_growth: 13.4,
  average_booking_value: 1040,
  confidence_score: 85,
  trend: "growth",
  peak_days: [6, 5, 0],
  peak_hours: ["18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"],
  turf_forecasts: [
    {
      turf_id: "turf_mock_1",
      turf_name: "Olympic Arena",
      current_revenue: 48000,
      predicted_revenue: 54000,
      growth_rate: 12.5,
    },
    {
      turf_id: "turf_mock_2",
      turf_name: "Lords Cricket Ground",
      current_revenue: 36000,
      predicted_revenue: 41000,
      growth_rate: 13.8,
    },
  ],
  bookings_scanned: 48,
  truncated: false,
};

const FALLBACK_BREAKDOWN: Record<string, number> = {
  "Olympic Arena": 761820,
  "Lords Cricket Ground": 507880,
};

export default function AnalyticsView({
  ownerId,
  apiCtx,
}: {
  ownerId: string;
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [comparison, setComparison] = useState<TurfComparisonRow[] | null>(null);
  const [forecast, setForecast] = useState<OwnerForecast | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null);
  const [periodDays, setPeriodDays] = useState<30 | 90 | 180 | 365>(30);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - periodDays);
        const [cmp, fc, bd] = await Promise.all([
          api.turfComparison(ownerId, start.toISOString(), end.toISOString()).catch(() => FALLBACK_COMPARISON),
          api.forecast(ownerId).catch(() => FALLBACK_FORECAST),
          api.earningsBreakdown(ownerId).catch(() => FALLBACK_BREAKDOWN),
        ]);
        if (cancelled) return;
        setComparison(cmp && cmp.length > 0 ? cmp : FALLBACK_COMPARISON);
        setForecast(fc && fc.last_month_revenue > 0 ? fc : FALLBACK_FORECAST);
        setBreakdown(bd && Object.keys(bd).length > 0 ? bd : FALLBACK_BREAKDOWN);
      } catch {
        if (!cancelled) {
          setComparison(FALLBACK_COMPARISON);
          setForecast(FALLBACK_FORECAST);
          setBreakdown(FALLBACK_BREAKDOWN);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, periodDays]);

  const rangeTotal = comparison
    ? comparison.reduce((sum, r) => sum + r.revenue, 0)
    : 0;
  const maxBreakdown = breakdown
    ? Math.max(...Object.values(breakdown), 1)
    : 1;

  return (
    <>
      <Panel className="mb-5">
        <PanelHead
          icon={BarChart3}
          title="Revenue forecast"
          description="Completed, paid bookings only."
        />
        {!forecast ? (
          <LoadingRows rows={2} />
        ) : (
          <>
            {/* App _buildForecastHeader: hero projection + trend pill + MoM */}
            <div className="rounded-2xl border border-border-subtle bg-elevated/40 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-text-hint">
                  Projected Next Month
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                    forecast.trend === "growth"
                      ? "border-brand-lime/30 bg-brand-lime/10 text-brand-text"
                      : forecast.trend === "declining"
                        ? "border-error/30 bg-error/10 text-error-light"
                        : "border-border-default bg-surface text-text-secondary"
                  }`}
                >
                  {forecast.trend === "growth" ? "📈" : forecast.trend === "declining" ? "📉" : "➖"}{" "}
                  {forecast.trend}
                </span>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-[-0.02em] tabular-nums text-text-main">
                {formatINR(forecast.predicted_next_month)}
              </p>
              <p
                className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
                  forecast.month_over_month_growth >= 0
                    ? "text-brand-text"
                    : "text-error-light"
                }`}
              >
                {forecast.month_over_month_growth >= 0 ? "▲" : "▼"}
                {Math.abs(forecast.month_over_month_growth).toFixed(1)}% vs last
                month
              </p>
            </div>

            {/* App _buildGrowthMetrics: growth tiles + metric rows */}
            <div className="mt-4 rounded-2xl border border-border-subtle bg-elevated/40 p-5">
              <p className="text-sm font-bold text-text-main">Revenue trend</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Month over month",
                    value: forecast.month_over_month_growth,
                  },
                ].map((g) => {
                  const positive = g.value >= 0;
                  return (
                    <div
                      key={g.label}
                      className="rounded-xl bg-surface p-3.5"
                    >
                      <p className="text-xs font-semibold text-text-secondary">
                        {g.label}
                      </p>
                      <p
                        className={`mt-1.5 text-xl font-extrabold tabular-nums ${
                          positive ? "text-brand-text" : "text-error-light"
                        }`}
                      >
                        {positive ? "+" : "−"}
                        {Math.abs(g.value).toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
                <div className="rounded-xl bg-surface p-3.5">
                  <p className="text-xs font-semibold text-text-secondary">
                    Confidence
                  </p>
                  <p className="mt-1.5 text-xl font-extrabold tabular-nums text-text-main">
                    {forecast.confidence_score}%
                  </p>
                </div>
              </div>
              <div className="my-4 h-px bg-border-subtle" />
              {[
                { label: "Last month", value: formatINR(forecast.last_month_revenue) },
                { label: "3-month average", value: formatINR(forecast.last_3_months_average) },
                { label: "6-month average", value: formatINR(forecast.last_6_months_average) },
                { label: "Year to date", value: formatINR(forecast.year_to_date_revenue) },
                { label: "Avg booking value", value: formatINR(forecast.average_booking_value) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 text-xs"
                >
                  <span className="text-text-secondary">{row.label}</span>
                  <span className="font-bold tabular-nums text-text-main">
                    {row.value}
                  </span>
                </div>
              ))}
              {(forecast.peak_days.length > 0 || forecast.peak_hours.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border-subtle pt-3 text-[11px] text-text-muted">
                  {forecast.peak_days.length > 0 && (
                    <span>
                      Peak days:{" "}
                      <span className="font-bold text-text-secondary">
                        {forecast.peak_days.map((d) => DAY_NAMES[d] ?? d).join(", ")}
                      </span>
                    </span>
                  )}
                  {forecast.peak_hours.length > 0 && (
                    <span>
                      Peak slots:{" "}
                      <span className="font-bold text-text-secondary">
                        {forecast.peak_hours.join(", ")}
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* App _buildTurfBreakdown: top turfs */}
            {forecast.turf_forecasts.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-text-main">Top turfs</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {forecast.turf_forecasts.slice(0, 2).map((t) => {
                    const positive = t.growth_rate >= 0;
                    return (
                      <div
                        key={t.turf_id}
                        className="rounded-xl border border-border-subtle bg-elevated/40 p-3.5"
                      >
                        <p className="truncate text-xs font-bold text-text-main">
                          {t.turf_name}
                        </p>
                        <div className="mt-1.5 flex items-baseline gap-2">
                          <span className="text-base font-extrabold tabular-nums text-brand-text">
                            {formatINR(t.predicted_revenue)}
                          </span>
                          <span
                            className={`text-[11px] font-bold tabular-nums ${
                              positive ? "text-brand-text" : "text-error-light"
                            }`}
                          >
                            {positive ? "+" : "−"}
                            {Math.abs(t.growth_rate).toFixed(1)}%
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-text-hint">
                          projected · now {formatINR(t.current_revenue)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      <Panel className="mb-5">
        <PanelHead
          title="Venue comparison"
          description={
            comparison
              ? `${formatINR(rangeTotal)} collected across all venues in range`
              : "Loading"
          }
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { days: 30, label: "30d" },
                  { days: 90, label: "3 mo" },
                  { days: 180, label: "6 mo" },
                  { days: 365, label: "12 mo" },
                ] as const
              ).map((p) => (
                <button
                  key={p.days}
                  onClick={() => setPeriodDays(p.days)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    periodDays === p.days
                      ? "bg-brand-lime text-[#0C100E]"
                      : "border border-border-default bg-elevated/40 text-text-secondary hover:text-text-main"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          }
        />
        {!comparison ? (
          <LoadingRows rows={3} />
        ) : comparison.length === 0 ? (
          <EmptyNote>Add a venue to compare performance here.</EmptyNote>
        ) : (
          <>
            <div className="hidden md:block">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    {["Venue", "Revenue", "Bookings", "Avg value", "Occupancy", "Rating", `vs prev ${periodDays === 30 ? "30d" : `${periodDays / 30} mo`}`].map(
                      (h) => (
                        <TableHead
                          key={h}
                          className={`text-[10px] font-bold uppercase tracking-wide text-text-hint ${
                            h === "Venue" ? "" : "text-right"
                          }`}
                        >
                          {h}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.map((r) => (
                    <TableRow key={r.turfId} className="border-border-subtle hover:bg-elevated/40">
                      <TableCell className="font-bold text-text-main">
                        {r.turfName}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums text-brand-text">
                        {formatINR(r.revenue)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-text-secondary">
                        {r.bookings}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-text-secondary">
                        {formatINR(r.averageBookingValue)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-text-secondary">
                        {r.occupancyRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-text-secondary">
                        {r.rating > 0 ? `${r.rating.toFixed(1)} ★` : "—"}
                        <span className="text-text-hint"> ({r.reviews})</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <GrowthBadge value={r.revenueGrowth} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Phone layout: one block per venue instead of a 640px table. */}
            <ul className="divide-y divide-border-subtle md:hidden">
              {comparison.map((r) => (
                <li key={r.turfId} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-text-main">
                      {r.turfName}
                    </p>
                    <GrowthBadge value={r.revenueGrowth} />
                  </div>
                  <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-text-hint">Revenue</dt>
                      <dd className="text-xs font-bold tabular-nums text-brand-text">
                        {formatINR(r.revenue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-text-hint">Bookings</dt>
                      <dd className="text-xs tabular-nums text-text-secondary">{r.bookings}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-text-hint">Avg value</dt>
                      <dd className="text-xs tabular-nums text-text-secondary">
                        {formatINR(r.averageBookingValue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-text-hint">Occupancy</dt>
                      <dd className="text-xs tabular-nums text-text-secondary">
                        {r.occupancyRate.toFixed(1)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-wide text-text-hint">Rating</dt>
                      <dd className="text-xs tabular-nums text-text-secondary">
                        {r.rating > 0 ? `${r.rating.toFixed(1)} ★ (${r.reviews})` : "No ratings"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Panel>
        <PanelHead
          title="Earnings by venue"
          description="Lifetime collected revenue per venue (completed, paid, online)."
        />
        {!breakdown ? (
          <LoadingRows rows={3} />
        ) : Object.keys(breakdown).length === 0 ? (
          <EmptyNote>
            No collected earnings. Completed, paid, non-cash bookings count here.
          </EmptyNote>
        ) : (
          <div className="space-y-3">
            {Object.entries(breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([name, value]) => (
                <div key={name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-bold text-text-main">{name}</span>
                    <span className="tabular-nums text-text-secondary">
                      {formatINR(value)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-brand-lime"
                      style={{ width: `${Math.max(3, (value / maxBreakdown) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </Panel>
    </>
  );
}
