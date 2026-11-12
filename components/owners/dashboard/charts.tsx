"use client";

/**
 * Charts ported from the Flutter owner dashboard so web and app render the
 * same visualizations: `_RevenueSparklinePainter` becomes <HeroSparkline>
 * (smooth cubic curve, gradient fill, glowing end dot) and the monthly
 * revenue chart becomes <MonthlyAreaChart> — the sparkline's curve language
 * scaled up with axis labels, replacing the blocky bar chart.
 */

import * as React from "react";
import { formatINR } from "./ui";

/** Cubic-smoothed path through points, mirroring the app's painter math. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const first = points[0];
  if (points.length === 1) return `M ${first.x} ${first.y}`;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const midX = (prev.x + cur.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`;
  }
  return d;
}

/**
 * The app's `_RevenueSparklinePainter` (owner_dashboard_screen.dart:1882):
 * white 1.6px curve on the gradient hero, fading fill, dot on the last point.
 */
export function HeroSparkline({
  values,
  className = "",
}: {
  values: number[];
  className?: string;
}) {
  // Per-instance id: two sparklines must not share one gradient definition.
  const fillId = `sparkFill-${React.useId().replace(/:/g, "")}`;
  if (values.length < 2) return null;

  return (
    <svg
      viewBox="0 0 300 34"
      preserveAspectRatio="none"
      className={`h-[34px] w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <SparkPaths values={values} width={300} height={34} fillId={fillId} stroke="white" />
    </svg>
  );
}

function SparkPaths({
  values,
  width,
  height,
  fillId,
  stroke,
}: {
  values: number[];
  width: number;
  height: number;
  fillId: string;
  stroke: string;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = Math.max(max - min, 1);
  const points = values.map((v, i) => ({
    x: (width * i) / (values.length - 1),
    y: height - 4 - ((v - min) / spread) * (height - 10),
  }));
  const line = smoothPath(points);
  const last = points[points.length - 1];

  return (
    <>
      <path
        d={`${line} L ${last.x} ${height} L ${points[0].x} ${height} Z`}
        fill={`url(#${fillId})`}
      />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeOpacity="0.9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* End dot: halo + core, as in the painter */}
      <circle cx={last.x} cy={last.y} r="4.5" fill={stroke} fillOpacity="0.22" />
      <circle cx={last.x} cy={last.y} r="2.2" fill={stroke} />
    </>
  );
}

/**
 * Monthly revenue as the app's trend language, scaled up: rounded area,
 * lime line, glowing current-month dot, hoverable points, month labels.
 */
export function MonthlyAreaChart({
  monthly,
  className = "",
}: {
  monthly: { label: string; total: number }[];
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const values = monthly.map((m) => m.total);
  const hasData = values.some((v) => v > 0);
  if (!hasData) return null;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 560 180"
        preserveAspectRatio="none"
        className="h-44 w-full"
        role="img"
        aria-label="Monthly revenue trend"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-lime)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-brand-lime)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <SparkPaths
          values={values}
          width={560}
          height={170}
          fillId="areaFill"
          stroke="var(--color-brand-lime)"
        />
        {/* Interaction targets, one invisible column per month */}
        {monthly.map((m, i) => (
          <rect
            key={m.label}
            x={(560 * i) / monthly.length}
            y="0"
            width={560 / monthly.length}
            height="180"
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {/* Hover marker on the curve */}
        {hover !== null &&
          (() => {
            const max = Math.max(...values);
            const min = Math.min(...values);
            const spread = Math.max(max - min, 1);
            const py =
              170 -
              4 -
              ((values[hover] - min) / spread) * (170 - 10);
            return (
              <circle
                cx={(560 * hover) / (monthly.length - 1 || 1)}
                cy={py}
                r="4"
                fill="var(--color-brand-lime)"
                stroke="var(--color-surface)"
                strokeWidth="1.5"
              />
            );
          })()}
      </svg>
      {/* Readout + labels overlay */}
      <div className="pointer-events-none absolute inset-0">
        {hover !== null && monthly[hover] && (
          <div
            className="absolute -translate-x-1/2 rounded-lg border border-border-strong bg-elevated px-2 py-1 text-[10px] font-bold tabular-nums text-text-main shadow-md"
            style={{
              left: `clamp(52px, ${((hover + 0.5) / monthly.length) * 100}%, calc(100% - 52px))`,
              top: "0px",
            }}
          >
            {monthly[hover].label} · {formatINR(monthly[hover].total)}
          </div>
        )}
        <div className="absolute inset-x-0 -bottom-5 flex">
          {monthly.map((m, i) => (
            <span
              key={m.label}
              className={`flex-1 text-center text-[10px] font-semibold ${
                hover === i ? "text-text-main" : "text-text-muted"
              }`}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
