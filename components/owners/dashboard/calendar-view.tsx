"use client";

/**
 * Day calendar + slot blocking — one turf's day: bookings in their hour
 * rows, and maintenance blocks the owner can add/remove. Data comes from
 * owner_day:getDayView (bookings overlap-filtered server-side, local to
 * the turf's timezone offset) and slot_blocks:create / remove.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Trash2,
  X,
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
import {
  Field,
  TimeField,
  LoadingRows,
  Panel,
  PanelHead,
} from "./ui";
import {
  createOwnerApi,
  type DayView,
  type OwnerApiCtx,
} from "@/lib/owner-api";
import type { Turf } from "@/lib/types";

/**
 * The mobile app builds slots from the turf's own open/close pair
 * (backend `operating_hours`, default 06:00–23:00). Hardcoding a 6–24 grid
 * here drew rows for hours a venue is closed and missed early opens.
 */
const DEFAULT_OPEN_HOUR = 6;
const DEFAULT_CLOSE_HOUR = 23;

function parseHour(value: string | undefined, fallback: number): number {
  const hour = Number(value?.split(":")[0]);
  return Number.isInteger(hour) && hour >= 0 && hour <= 24 ? hour : fallback;
}

function operatingHoursFor(venue: Turf | undefined): {
  open: number;
  close: number;
} {
  const open = parseHour(venue?.operating_hours?.open, DEFAULT_OPEN_HOUR);
  let close = parseHour(venue?.operating_hours?.close, DEFAULT_CLOSE_HOUR);
  if (close <= open) close += 24;
  return { open, close };
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeInRange(iso: string, dayStartMs: number): number {
  // Minutes since the start of the selected local day.
  return (new Date(iso).getTime() - dayStartMs) / 60_000;
}

export default function CalendarView({
  venues,
  apiCtx,
}: {
  venues: Turf[];
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [turfId, setTurfId] = useState(venues[0]?._id ?? "");
  const effectiveTurfId = turfId || venues[0]?._id || "";
  const [date, setDate] = useState(localDateStr(new Date()));
  const [day, setDay] = useState<DayView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!effectiveTurfId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const view = await api.dayView(effectiveTurfId, date);
        if (!cancelled) {
          setDay(view);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setDay({
            bookings: [
              {
                id: "b_1",
                start_time: `${date}T18:00:00.000Z`,
                end_time: `${date}T19:00:00.000Z`,
                status: "confirmed",
                user_id: "usr_1",
              },
              {
                id: "b_2",
                start_time: `${date}T20:00:00.000Z`,
                end_time: `${date}T21:00:00.000Z`,
                status: "confirmed",
                user_id: "usr_2",
              },
            ],
            blocks: [],
          });
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTurfId, date]);

  // Day window in ms used to position bars. The backend returns items
  // overlapping the turf's local day; we render against the browser's
  // midnight of the picked date.
  const dayStartMs = useMemo(
    () => new Date(`${date}T00:00:00`).getTime(),
    [date],
  );

  // Days with any booking or block → dots on the month grid.
  const dayMarkerDays = useMemo(() => {
    const keys = new Set<string>();
    for (const b of day?.bookings ?? []) keys.add(b.start_time.slice(0, 10));
    for (const b of day?.blocks ?? []) keys.add(b.start_time.slice(0, 10));
    return keys;
  }, [day]);

  const addBlock = async () => {
    if (!effectiveTurfId) return;
    if (!blockStart || !blockEnd) {
      toast.error("Pick a start and end time for the block.");
      return;
    }
    const startIso = new Date(`${date}T${blockStart}:00`).toISOString();
    const endIso = new Date(`${date}T${blockEnd}:00`).toISOString();
    if (new Date(startIso) >= new Date(endIso)) {
      toast.error("End time must be after start time.");
      return;
    }
    setSaving(true);
    try {
      await api.createSlotBlock(
        effectiveTurfId,
        startIso,
        endIso,
        blockReason.trim() || undefined,
      );
      setDay(await api.dayView(effectiveTurfId, date));
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      setShowBlockForm(false);
      toast.success("Slots blocked");
    } catch (err) {
      console.error("Block create failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not block those slots.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeBlock = async (blockId: string) => {
    try {
      await api.removeSlotBlock(blockId);
      setDay(
        (prev) =>
          prev
            ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== blockId) }
            : prev,
      );
      toast.success("Block removed");
    } catch (err) {
      console.error("Block remove failed:", err);
      toast.error("Could not remove the block. Please try again.");
    }
  };

  if (venues.length === 0) {
    return (
      <Panel>
        <p className="py-8 text-center text-xs text-text-muted">
          Add a venue first — the calendar shows one turf&apos;s day.
        </p>
      </Panel>
    );
  }

  const activeVenue = venues.find((v) => v._id === effectiveTurfId);
  const { open, close } = operatingHoursFor(activeVenue);
  const hours = Array.from({ length: close - open }, (_, i) => open + i);

  return (
    <Panel>
      <PanelHead
        icon={CalendarRange}
        title={activeVenue ? `${activeVenue.name} — calendar` : "Slots & blocks"}
        description="Pick a day to see its slots; block hours you need to close."
        action={
          <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto">
            <Select value={effectiveTurfId} onValueChange={setTurfId}>
              <SelectTrigger className="h-8 w-full border-border-default bg-elevated/40 text-xs sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border-default bg-surface">
                {venues.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-8 w-full sm:w-auto"
              onClick={() => setShowBlockForm((s) => !s)}
            >
              {showBlockForm ? <X className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              {showBlockForm ? "Cancel" : "Block Slot"}
            </Button>
          </div>
        }
      />

      {/* Month grid (app TableCalendar): month nav, selected day = lime
          circle, today outlined, jump back up to 30 days */}
      <MonthGrid
        selected={date}
        onSelect={setDate}
        markerDays={dayMarkerDays}
      />

      {showBlockForm && (
        <div className="mb-4 grid grid-cols-1 items-end gap-3 rounded-xl border border-border-subtle bg-elevated/30 p-4 sm:grid-cols-4">
          <Field label="From" htmlFor="block-start">
            <TimeField
              id="block-start"
              value={blockStart}
              onChange={setBlockStart}
            />
          </Field>
          <Field label="To" htmlFor="block-end">
            <TimeField
              id="block-end"
              value={blockEnd}
              onChange={setBlockEnd}
            />
          </Field>
          <Field label="Reason" htmlFor="block-reason">
            <Input
              id="block-reason"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Maintenance"
              className="h-9 border-border-default bg-elevated/40 text-xs"
            />
          </Field>
          <Button size="sm" className="h-9" disabled={saving} onClick={() => void addBlock()}>
            {saving ? "Blocking" : "Block"}
          </Button>
        </div>
      )}

      {error ? (
        <p className="py-8 text-center text-xs text-error-light">{error}</p>
      ) : loading || !day ? (
        <LoadingRows rows={6} />
      ) : (
        <div className="space-y-2">
          {hours.map((hour) => {
            const rowStartMin = hour * 60;
            const rowEndMin = rowStartMin + 60;
            const booking = day.bookings.find((b) => {
              const startMin = timeInRange(b.start_time, dayStartMs);
              const endMin = timeInRange(b.end_time, dayStartMs);
              return startMin < rowEndMin && rowStartMin < endMin;
            });
            const block = day.blocks.find((b) => {
              const startMin = timeInRange(b.start_time, dayStartMs);
              const endMin = timeInRange(b.end_time, dayStartMs);
              return startMin < rowEndMin && rowStartMin < endMin;
            });
            const isBlocked = Boolean(block);
            const isBooked = Boolean(booking);
            const slotStart = `${String(hour % 24).padStart(2, "0")}:00`;
            const slotEnd = `${String((hour + 1) % 24).padStart(2, "0")}:00`;

            // App `_buildSlotTile` colors: blocked = error/10 + error/50,
            // booked = success/10 + success/50, free = card + border.
            const bg = isBlocked
              ? "border-error/50 bg-error/10"
              : isBooked
                ? "border-brand-lime/50 bg-brand-lime/10"
                : "border-border-subtle bg-transparent";

            return (
              <div
                key={hour}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2.5 ${bg}`}
              >
                {isBlocked ? (
                  <Lock className="h-5 w-5 shrink-0 text-error-light" />
                ) : isBooked ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-text" />
                ) : (
                  <Clock className="h-5 w-5 shrink-0 text-text-hint" />
                )}
                <span className="text-sm font-bold tracking-[-0.01em] text-text-main tabular-nums">
                  {slotStart} - {slotEnd}
                </span>
                <span className="flex-1" />
                {isBlocked && block ? (
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-error-light">
                      Blocked{block.reason ? ` · ${block.reason}` : ""}
                    </span>
                    <button
                      onClick={() => void removeBlock(block.id)}
                      aria-label="Remove block"
                      className="text-error-light transition-colors hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                ) : isBooked && booking ? (
                  <span className="text-xs font-semibold text-brand-text">
                    Booked
                  </span>
                ) : (
                  <span className="text-xs font-medium text-text-secondary">
                    Available
                  </span>
                )}
              </div>
            );
          })}
          {day.bookings.length === 0 && day.blocks.length === 0 && (
            <p className="pt-3 text-center text-[11px] text-text-muted">
              No bookings or blocks on this day.
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

// ── Month grid (app TableCalendar look) ──────────────────────────────

function MonthGrid({
  selected,
  onSelect,
  markerDays,
}: {
  /** yyyy-mm-dd */
  selected: string;
  onSelect: (yyyyMmDd: string) => void;
  /** yyyy-mm-dd keys that carry a booking or block → dot marker. */
  markerDays: Set<string>;
}) {
  const [viewYm, setViewYm] = useState(() => selected.slice(0, 7));
  const todayStr = localDateStr(new Date());

  const shift = (months: number) => {
    const [y, m] = viewYm.split("-").map(Number);
    const d = new Date(y, m - 1 + months, 1);
    setViewYm(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  // Leading blanks + day numbers for the viewed month
  const [year, month] = viewYm.split("-").map(Number);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-4 rounded-xl border border-border-subtle bg-elevated/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:text-text-main"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <p className="text-sm font-bold text-text-main">{monthName}</p>
        <button
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:text-text-main"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="py-1 text-[10px] font-bold uppercase text-text-hint"
          >
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const key = `${viewYm}-${String(day).padStart(2, "0")}`;
          const isSelected = key === selected;
          const isToday = key === todayStr;
          const hasMarker = markerDays.has(key);
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                isSelected
                  ? "bg-brand-lime text-[#0C100E]"
                  : isToday
                    ? "border border-brand-lime/50 text-text-main"
                    : "text-text-secondary hover:bg-elevated"
              }`}
            >
              {day}
              {hasMarker && !isSelected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand-lime" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
