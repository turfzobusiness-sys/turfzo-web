"use client";

/**
 * Bulk slot blocking — parity with the Flutter "Multi-Turf Slot Blocking"
 * screen.
 *
 * The calendar blocks one slot on one turf at a time. Owners closing for
 * maintenance, a private event, or a holiday need a range across several
 * turfs in one action. The backend only accepts one turf + one ISO range per
 * call (`slot_blocks:create`), so this fans out over turf × date exactly like
 * the app does and reports how many landed.
 *
 * Nothing here reserves or prices anything — it only writes block rows, and
 * each row is re-validated server-side against the turf's ownership.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarRange,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn, toDateInputValue } from "@/lib/utils";
import { DateField, Field, LoadingRows, Panel, PanelHead, TimeField } from "./ui";
import {
  createOwnerApi,
  type DayViewBlock,
  type OwnerApiCtx,
} from "@/lib/owner-api";
import type { Turf } from "@/lib/types";

const BLOCK_TYPES = [
  { key: "maintenance", label: "Maintenance" },
  { key: "event", label: "Private event" },
  { key: "holiday", label: "Holiday" },
  { key: "other", label: "Other" },
] as const;

type BlockType = (typeof BLOCK_TYPES)[number]["key"];

const DEFAULT_OPEN_HOUR = 6;
const DEFAULT_CLOSE_HOUR = 23;

function operatingHoursFor(venue: Turf | undefined): {
  open: number;
  close: number;
} {
  const parseHour = (value: string | undefined, fallback: number) => {
    const hour = Number(value?.split(":")[0]);
    return Number.isInteger(hour) && hour >= 0 && hour <= 24 ? hour : fallback;
  };
  const open = parseHour(venue?.operating_hours?.open, DEFAULT_OPEN_HOUR);
  let close = parseHour(venue?.operating_hours?.close, DEFAULT_CLOSE_HOUR);
  if (close <= open) close += 24;
  return { open, close };
}

/** Every `YYYY-MM-DD` between two local dates, inclusive. */
function eachDate(from: string, to: string): string[] {
  if (!from || !to) return [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (start > end) return [];
  const out: string[] = [];
  const cursor = new Date(start);
  // A year of dates is already an unreasonable block request; cap it so a
  // typo cannot fan out into thousands of mutations.
  while (cursor <= end && out.length < 366) {
    out.push(toDateInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function formatBlockRange(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BulkBlockView({
  venues,
  apiCtx,
}: {
  venues: Turf[];
  apiCtx: OwnerApiCtx;
}) {
  const api = useMemo(() => createOwnerApi(apiCtx), [apiCtx]);

  // `null` = untouched, so the default "every venue selected" stays derived
  // from props instead of being copied into state by an effect. An explicit
  // empty array is a real user choice (block nothing) and must be kept.
  const [explicitSelection, setExplicitSelection] = useState<string[] | null>(
    null,
  );
  const [from, setFrom] = useState(toDateInputValue(new Date()));
  const [to, setTo] = useState(toDateInputValue(new Date()));
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("08:00");
  const [blockType, setBlockType] = useState<BlockType>("maintenance");
  const [reason, setReason] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const [blocks, setBlocks] = useState<DayViewBlock[] | null>(null);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [blocksTurfId, setBlocksTurfId] = useState<string>("");

  // Defaults are derived, never written to state from an effect: every venue
  // selected (app parity) and the first venue owning the block list.
  const selectedTurfIds = useMemo(
    () => explicitSelection ?? venues.map((v) => v._id),
    [explicitSelection, venues],
  );
  const activeTurfId = blocksTurfId || venues[0]?._id || "";

  const dates = useMemo(() => eachDate(from, to), [from, to]);
  const total = selectedTurfIds.length * dates.length;

  const loadBlocks = useCallback(async () => {
    if (!activeTurfId) {
      setBlocks([]);
      return;
    }
    setLoadingBlocks(true);
    try {
      const rows = await api.slotBlocks(activeTurfId, from, to, 200);
      setBlocks(rows);
    } catch (err) {
      console.error("Slot block load failed:", err);
      setBlocks([]);
    } finally {
      setLoadingBlocks(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTurfId, from, to]);

  useEffect(() => {
    // Mount/venue-change fetch; rows land in async callbacks. The rule's
    // heuristic flags the kick-off because `loadBlocks` sets its loading flag
    // first. Same suppression as the other owner dashboard views.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch
    void loadBlocks();
  }, [loadBlocks]);

  const toggleTurf = (id: string) => {
    setExplicitSelection((prev) => {
      const current = prev ?? venues.map((v) => v._id);
      return current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
    });
  };

  const quickPick = (kind: "next7" | "weekend" | "next30") => {
    const today = new Date();
    if (kind === "next7") {
      setFrom(toDateInputValue(today));
      const end = new Date(today);
      end.setDate(end.getDate() + 6);
      setTo(toDateInputValue(end));
      return;
    }
    if (kind === "next30") {
      setFrom(toDateInputValue(today));
      const end = new Date(today);
      end.setDate(end.getDate() + 29);
      setTo(toDateInputValue(end));
      return;
    }
    // Weekend: the coming Saturday + Sunday.
    const sat = new Date(today);
    const delta = (6 - sat.getDay() + 7) % 7;
    sat.setDate(sat.getDate() + delta);
    const sun = new Date(sat);
    sun.setDate(sun.getDate() + 1);
    setFrom(toDateInputValue(sat));
    setTo(toDateInputValue(sun));
  };

  const block = async () => {
    if (selectedTurfIds.length === 0) {
      toast.error("Pick at least one venue.");
      return;
    }
    if (dates.length === 0) {
      toast.error("Pick a valid date range (end on or after start).");
      return;
    }
    if (!allDay && startTime >= endTime) {
      toast.error("End time must be after the start time.");
      return;
    }

    setRunning(true);
    setProgress({ done: 0, total });
    let ok = 0;
    let failed = 0;
    let firstError: string | null = null;
    let done = 0;

    const reasonText = reason.trim();
    const storedReason =
      blockType === "maintenance" && !reasonText
        ? "maintenance"
        : reasonText
          ? `[${blockType}] ${reasonText}`
          : blockType;

    for (const turfId of selectedTurfIds) {
      const venue = venues.find((v) => v._id === turfId);
      const { open, close } = operatingHoursFor(venue);
      for (const date of dates) {
        const startClock = allDay ? `${String(open).padStart(2, "0")}:00` : startTime;
        const endClock = allDay ? `${String(close).padStart(2, "0")}:00` : endTime;
        const startIso = new Date(`${date}T${startClock}:00`).toISOString();
        let endIso = new Date(`${date}T${endClock}:00`).toISOString();
        // All-day blocks on a venue that closes after midnight end on the
        // following calendar day, same as the app.
        if (allDay && new Date(endIso) <= new Date(startIso)) {
          const next = new Date(`${date}T${endClock}:00`);
          next.setDate(next.getDate() + 1);
          endIso = next.toISOString();
        }
        try {
          await api.createSlotBlock(turfId, startIso, endIso, storedReason);
          ok += 1;
        } catch (err) {
          failed += 1;
          if (!firstError) {
            firstError =
              err instanceof Error ? err.message : "A block was rejected.";
          }
        }
        done += 1;
        setProgress({ done, total });
      }
    }

    setRunning(false);
    setProgress(null);

    if (failed === 0) {
      toast.success(
        `${ok} slot block${ok === 1 ? "" : "s"} created across ${
          selectedTurfIds.length
        } venue${selectedTurfIds.length === 1 ? "" : "s"}.`,
      );
    } else {
      toast.error(
        `${ok} blocked, ${failed} failed. ${firstError ?? ""}`.trim(),
      );
    }
    await loadBlocks();
  };

  const unblock = async (blockId: string) => {
    try {
      await api.removeSlotBlock(blockId);
      setBlocks((prev) => prev?.filter((b) => b.id !== blockId) ?? prev);
      toast.success("Block removed");
    } catch (err) {
      console.error("Block removal failed:", err);
      toast.error("Could not remove that block. Please try again.");
    }
  };

  if (venues.length === 0) {
    return (
      <Panel>
        <p className="py-8 text-center text-xs text-text-muted">
          Add a venue first — blocks apply to a turf&apos;s slots.
        </p>
      </Panel>
    );
  }

  return (
    <>
      <Panel>
        <PanelHead
          title="Block slots"
          description="Close slots across several venues and dates in one go — maintenance, events, or holidays."
          action={
            <Badge variant="neutral">
              {total} block{total === 1 ? "" : "s"} queued
            </Badge>
          }
        />

        <div className="grid gap-4">
          <Field label="Venues" hint="Select every venue the block applies to.">
            <div className="flex flex-wrap gap-2">
              {venues.map((venue) => {
                const active = selectedTurfIds.includes(venue._id);
                return (
                  <button
                    key={venue._id}
                    type="button"
                    onClick={() => toggleTurf(venue._id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-brand-lime/50 bg-brand-lime/15 text-brand-text"
                        : "border-border-default bg-elevated/40 text-text-muted hover:text-text-main",
                    )}
                  >
                    {venue.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="From" htmlFor="block-from">
              <DateField id="block-from" value={from} onChange={setFrom} />
            </Field>
            <Field label="To" htmlFor="block-to">
              <DateField id="block-to" value={to} onChange={setTo} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => quickPick("next7")}>
              Next 7 days
            </Button>
            <Button size="sm" variant="outline" onClick={() => quickPick("weekend")}>
              This weekend
            </Button>
            <Button size="sm" variant="outline" onClick={() => quickPick("next30")}>
              Next 30 days
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="block-all-day"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
            <label
              htmlFor="block-all-day"
              className="text-xs font-semibold text-text-main"
            >
              All day
            </label>
            <span className="text-[10px] text-text-hint">
              Uses each venue&apos;s own open and close hours.
            </span>
          </div>

          {!allDay && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start time" htmlFor="block-start">
                <TimeField
                  id="block-start"
                  value={startTime}
                  onChange={setStartTime}
                />
              </Field>
              <Field label="End time" htmlFor="block-end">
                <TimeField id="block-end" value={endTime} onChange={setEndTime} />
              </Field>
            </div>
          )}

          <Field label="Type">
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setBlockType(type.key)}
                  aria-pressed={blockType === type.key}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    blockType === type.key
                      ? "border-brand-lime/50 bg-brand-lime/15 text-brand-text"
                      : "border-border-default bg-elevated/40 text-text-muted hover:text-text-main",
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label="Reason (optional)"
            htmlFor="block-reason"
            hint="Shown to you on the calendar and stored with every block."
          >
            <Input
              id="block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual grass renovation"
              className="h-9 border-border-default bg-elevated/40 text-xs"
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void block()} disabled={running || total === 0}>
              {running ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              {running && progress
                ? `Blocking ${progress.done}/${progress.total}`
                : `Block ${total} slot${total === 1 ? "" : "s"}`}
            </Button>
            {running && progress && (
              <span className="text-[11px] text-text-muted">
                {Math.round((progress.done / Math.max(1, progress.total)) * 100)}
                %
              </span>
            )}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Existing blocks"
          description="Blocks overlapping the selected date range."
          action={
            <div className="flex items-center gap-2">
              <select
                value={activeTurfId}
                onChange={(e) => setBlocksTurfId(e.target.value)}
                aria-label="Venue for block list"
                className="h-9 rounded-md border border-border-default bg-elevated/40 px-2 text-xs text-text-main"
              >
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void loadBlocks()}
                disabled={loadingBlocks}
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", loadingBlocks && "animate-spin")}
                />
                <span className="sr-only">Refresh blocks</span>
              </Button>
            </div>
          }
        />

        {loadingBlocks && blocks === null ? (
          <LoadingRows rows={3} />
        ) : !blocks || blocks.length === 0 ? (
          <p className="py-8 text-center text-xs text-text-muted">
            No blocks in this range. Blocked slots show up here with a one-click
            unblock.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-2.5">
                <CalendarRange className="h-4 w-4 shrink-0 text-warning-light" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-main">
                    {formatBlockRange(b.start_time)} →{" "}
                    {formatBlockRange(b.end_time)}
                  </p>
                  {b.reason && (
                    <p className="text-[10px] text-text-muted">{b.reason}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void unblock(b.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
