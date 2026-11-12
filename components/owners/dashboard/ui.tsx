"use client";

/**
 * Dashboard composition layer over shadcn/ui primitives.
 *
 * These are thin wrappers, not reimplementations: every surface, badge,
 * input, select, switch, dialog, table, and skeleton below is the shadcn
 * component with Turfzo's density and tokens applied. Keeping the wrappers
 * here means the eight views share one geometry (12px card radius, 20px
 * padding, 4px header gap) instead of eight copies of the same class list.
 */

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { cn, toDateInputValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ── Shared currency formatters (single source; the app's ₹ conventions) ──

/** Full rupee figure: 1269700 → ₹12,69,700 (en-IN grouping). */
export function formatINR(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/** Compact Indian format for hero figures: 1269700 → ₹12.7L. */
export function formatCompactINR(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "₹0";
  const n = value;
  if (Math.abs(n) >= 10000000) return `${(n / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${Math.round(n)}`;
}

/** Compact with the ₹ prefix: 1269700 → ₹12.7L (hero variant). */
export function formatINR0(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "₹0";
  return `₹${formatCompactINR(value)}`;
}

/** A dashboard panel: shadcn Card flattened to the app's density. */
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border-border-default bg-surface py-0 text-text-main shadow-none",
        className,
      )}
    >
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

/** Panel heading: optional leading icon, one line of supporting copy, action slot. */
export function PanelHead({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <CardHeader
      className={cn(
        "flex flex-col gap-3 p-0 pb-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-text-main">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-brand-text" />}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="mt-0.5 text-xs text-text-muted">
            {description}
          </CardDescription>
        )}
      </div>
      {action}
    </CardHeader>
  );
}

/** Skeleton rows sized to the list they replace, so loading does not shift layout. */
export function LoadingRows({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Empty state: the rule that fills this panel, stated plainly. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-8 text-center text-xs leading-relaxed text-text-muted">
      {children}
    </p>
  );
}

/** Form field: shadcn Label + whatever control the caller supplies. */
export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-text-hint"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-text-hint">{hint}</p>}
    </div>
  );
}

/** Half-hour steps, covering a full local day. */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

/**
 * Date field built from shadcn Calendar + Popover. Native
 * `<input type="date">` pickers render the OS chrome, which ignores the
 * dashboard's tokens — the app-style popover keeps one visual language.
 */
export function DateField({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 border-border-default bg-elevated/40 px-3 text-xs font-normal",
            !value && "text-text-hint",
            className,
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          {selected
            ? selected.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto border-border-default bg-surface p-0"
      >
        <Calendar
          mode="single"
          className="[--cell-size:--spacing(9)]"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toDateInputValue(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Clock time as one shadcn Select, not the OS time spinner. */
export function TimeField({
  id,
  value,
  onChange,
  placeholder = "Time",
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className={cn(
          "h-9 w-full border-border-default bg-elevated/40 text-xs",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="border-border-default bg-surface"
        style={{ maxHeight: "16rem" }}
      >
        {TIME_OPTIONS.map((time) => (
          <SelectItem key={time} value={time} className="text-xs tabular-nums">
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Date + time pair stored as the `YYYY-MM-DDTHH:mm` string the existing
 * forms already speak, so submit handlers stay unchanged.
 */
export function DateTimeField({
  id,
  value,
  onChange,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [datePart = "", timePart = ""] = value.split("T");

  return (
    <div className={cn("flex gap-2", className)}>
      <DateField
        id={id}
        value={datePart}
        onChange={(date) =>
          onChange(`${date}T${timePart || "09:00"}`)
        }
        className="min-w-0 flex-1"
      />
      <TimeField
        value={timePart}
        onChange={(time) =>
          onChange(`${datePart || toDateInputValue(new Date())}T${time}`)
        }
        className="w-24 shrink-0"
      />
    </div>
  );
}
