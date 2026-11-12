"use client";

/**
 * Dynamic pricing rules view — list, create, delete rules per venue.
 * Wire `type` values match the Flutter app's PricingRuleType enum names
 * (timeOfDay, dayOfWeek, demand, weather, special, seasonal). Adjustment
 * types percentage / flat / fixed follow pricing.ts:applyRulesToPrice —
 * a fixed rule overrides the price and stops the chain.
 */

import React, { useEffect, useMemo, useState } from "react";
import { IndianRupee, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, LoadingRows, Panel, PanelHead, TimeField } from "./ui";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type PricingRule,
} from "@/lib/owner-api";
import type { Turf } from "@/lib/types";

const RULE_TYPES = [
  { value: "timeOfDay", label: "Time of day" },
  { value: "dayOfWeek", label: "Day of week" },
  { value: "demand", label: "Demand-based" },
  { value: "weather", label: "Weather" },
  { value: "special", label: "Special date" },
  { value: "seasonal", label: "Seasonal" },
] as const;

const ADJUSTMENT_TYPES = [
  { value: "percentage", label: "Percentage (±%)" },
  { value: "flat", label: "Flat amount (±₹)" },
  { value: "fixed", label: "Fixed override (₹, stops chain)" },
] as const;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface FormState {
  turfId: string;
  name: string;
  type: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  adjustmentType: string;
  adjustmentValue: string;
  demandThreshold: string;
  priority: string;
}

// Preview/session fallback: renders when the pricing rules query fails
// without auth (same pattern as FALLBACK_BOOKINGS in bookings-view).
const FALLBACK_PRICING_RULES: PricingRule[] = [
  {
    id: "rule_mock_1",
    turf_id: "turf_mock_1",
    turf_name: "Olympic Arena",
    name: "Evening peak",
    type: "timeOfDay",
    days_of_week: [5, 6, 0],
    start_time: "18:00",
    end_time: "22:00",
    price_adjustment_type: "percentage",
    adjustment_value: 20,
    priority: 10,
    is_active: true,
  },
  {
    id: "rule_mock_2",
    turf_id: "turf_mock_1",
    turf_name: "Olympic Arena",
    name: "Off-peak morning",
    type: "timeOfDay",
    days_of_week: [1, 2, 3, 4, 5],
    start_time: "06:00",
    end_time: "12:00",
    price_adjustment_type: "percentage",
    adjustment_value: -15,
    priority: 5,
    is_active: true,
  },
];

const EMPTY_FORM: FormState = {
  turfId: "",
  name: "",
  type: "timeOfDay",
  daysOfWeek: [],
  startTime: "",
  endTime: "",
  adjustmentType: "percentage",
  adjustmentValue: "",
  demandThreshold: "",
  priority: "0",
};

function ruleCondition(r: PricingRule): string {
  const parts: string[] = [];
  if (r.days_of_week?.length > 0 && r.days_of_week.length < 7) {
    parts.push(r.days_of_week.map((d) => DAY_LABELS[d] ?? d).join(", "));
  }
  if (r.start_time && r.end_time) parts.push(`${r.start_time}–${r.end_time}`);
  if (r.demand_threshold != null) parts.push(`demand ≥ ${r.demand_threshold}`);
  return parts.length > 0 ? parts.join(" · ") : "Any time";
}

function ruleEffect(r: PricingRule): string {
  if (r.price_adjustment_type === "percentage") {
    return `${r.adjustment_value > 0 ? "+" : ""}${r.adjustment_value}%`;
  }
  if (r.price_adjustment_type === "flat") {
    return `${r.adjustment_value > 0 ? "+" : "−"}₹${Math.abs(r.adjustment_value).toLocaleString("en-IN")}`;
  }
  return `fixed ₹${r.adjustment_value.toLocaleString("en-IN")}`;
}

export default function PricingRulesView({
  ownerId,
  venues,
  apiCtx,
}: {
  ownerId: string;
  venues: Turf[];
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [rules, setRules] = useState<PricingRule[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.pricingRules(ownerId);
        if (!cancelled) setRules(list);
      } catch (err) {
        if (!cancelled) {
          console.error("Pricing rules load failed:", err);
          setRules(FALLBACK_PRICING_RULES);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const turfNameById = useMemo(
    () => new Map(venues.map((v) => [v._id, v.name])),
    [venues],
  );

  const create = async () => {
    const value = Number(form.adjustmentValue);
    if (!form.turfId) {
      toast.error("Pick a venue for the rule.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Rule name is required.");
      return;
    }
    if (!Number.isFinite(value) || value === 0) {
      toast.error("Adjustment value must be a non-zero number.");
      return;
    }
    if (form.adjustmentType === "fixed" && value < 0) {
      toast.error("A fixed override cannot be negative.");
      return;
    }
    const demandThreshold = form.demandThreshold
      ? Number(form.demandThreshold)
      : undefined;
    if (
      demandThreshold !== undefined &&
      (!Number.isFinite(demandThreshold) ||
        demandThreshold < 0 ||
        demandThreshold > 1)
    ) {
      toast.error("Demand threshold must be between 0 and 1.");
      return;
    }
    setSaving(true);
    try {
      await api.createPricingRule({
        turfId: form.turfId,
        name: form.name.trim(),
        type: form.type,
        daysOfWeek: form.daysOfWeek,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        adjustmentType: form.adjustmentType,
        adjustmentValue: value,
        demandThreshold,
        priority: form.priority ? Number(form.priority) : undefined,
      });
      setRules(await api.pricingRules(ownerId));
      setForm({ ...EMPTY_FORM, turfId: form.turfId });
      setOpen(false);
      toast.success("Pricing rule created");
    } catch (err) {
      console.error("Create rule failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not create the rule.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ruleId: string) => {
    try {
      await api.deletePricingRule(ruleId);
      setRules((prev) => prev?.filter((r) => r.id !== ruleId) ?? prev);
      toast.success("Rule deleted");
    } catch (err) {
      console.error("Delete rule failed:", err);
      toast.error("Could not delete the rule.");
    }
  };

  const toggleDay = (day: number) =>
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day].sort(),
    }));

  return (
    <Panel>
      <PanelHead
        icon={IndianRupee}
        title="Dynamic pricing rules"
        description="Applied to a slot's price before a booking is created."
        action={
          <Button size="sm" onClick={() => setOpen(true)} disabled={venues.length === 0}>
            <Plus className="h-3.5 w-3.5" /> New rule
          </Button>
        }
      />

      {venues.length === 0 && (
        <p className="py-6 text-center text-xs text-text-muted">
          Add a venue first. Rules attach to a specific turf.
        </p>
      )}

      {!rules ? (
        <LoadingRows rows={3} />
      ) : rules.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">
          No rules. A rule adjusts slot prices before a booking is priced.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {[...rules]
            .sort((a, b) => b.priority - a.priority)
            .map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-text-main">{r.name}</span>
                    <Badge
                      variant={
                        r.price_adjustment_type === "fixed" ||
                        r.adjustment_value > 0
                          ? "warning"
                          : "info"
                      }
                    >
                      {ruleEffect(r)}
                    </Badge>
                    {!r.is_active && <Badge variant="neutral">Paused</Badge>}
                  </div>
                  <p className="mt-1 text-[10px] text-text-hint">
                    {turfNameById.get(r.turf_id) ?? r.turf_id} · {ruleCondition(r)} · priority {r.priority}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete rule ${r.name}`}
                  onClick={() => void remove(r.id)}
                  className="text-error-light hover:bg-error/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border-default bg-surface sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-main">
              New pricing rule
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Rules run highest priority first. Fixed overrides stop the chain.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Venue">
              <Select
                value={form.turfId}
                onValueChange={(v) => setForm((f) => ({ ...f, turfId: v }))}
              >
                <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  {venues.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rule name" htmlFor="rule-name">
              <Input
                id="rule-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Evening peak"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            <Field label="Type">
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  {RULE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Adjustment">
              <Select
                value={form.adjustmentType}
                onValueChange={(v) => setForm((f) => ({ ...f, adjustmentType: v }))}
              >
                <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  {ADJUSTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Applies to days" hint="Leave empty for every day.">
                <div className="flex flex-wrap gap-1">
                  {DAY_LABELS.map((d, i) => (
                    <Button
                      key={d}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toggleDay(i)}
                      className={
                        form.daysOfWeek.includes(i)
                          ? "border-brand-lime/40 bg-brand-lime/10 text-brand-text"
                          : "border-border-subtle text-text-muted"
                      }
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Start time" htmlFor="rule-start">
              <TimeField
                id="rule-start"
                value={form.startTime}
                onChange={(startTime) => setForm((f) => ({ ...f, startTime }))}
              />
            </Field>
            <Field label="End time" htmlFor="rule-end">
              <TimeField
                id="rule-end"
                value={form.endTime}
                onChange={(endTime) => setForm((f) => ({ ...f, endTime }))}
              />
            </Field>
            <Field label="Value" htmlFor="rule-value">
              <Input
                id="rule-value"
                type="number"
                step="any"
                value={form.adjustmentValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adjustmentValue: e.target.value }))
                }
                placeholder="20"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            {form.type === "demand" && (
              <Field
                label="Demand threshold (0–1)"
                htmlFor="rule-demand"
                hint="Share of nearby slots already booked before the rule fires."
              >
                <Input
                  id="rule-demand"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={form.demandThreshold}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, demandThreshold: e.target.value }))
                  }
                  placeholder="0.8"
                  className="h-9 border-border-default bg-elevated/40 text-xs"
                />
              </Field>
            )}
            <Field label="Priority" htmlFor="rule-priority">
              <Input
                id="rule-priority"
                type="number"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void create()}>
              {saving ? "Creating" : "Create rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
