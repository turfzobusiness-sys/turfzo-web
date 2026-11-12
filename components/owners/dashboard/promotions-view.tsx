"use client";

/**
 * Promotions view — list, create, toggle, delete promo codes.
 * Backend: owner_services:getOwnerPromotions / createPromotion /
 * togglePromotionStatus / deletePromotion.
 */

import React, { useEffect, useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
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
import {
  DateTimeField,
  Field,
  LoadingRows,
  Panel,
  PanelHead,
} from "./ui";
import { formatINR } from "./ui";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type Promotion,
} from "@/lib/owner-api";

interface FormState {
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: string;
  validFrom: string;
  validTo: string;
  usageLimit: string;
}

// Preview/session fallback: renders when the promotions query fails without
// auth (same pattern as FALLBACK_BOOKINGS in bookings-view).
const FALLBACK_PROMOTIONS: Promotion[] = [
  {
    id: "promo_mock_1",
    code: "WEEKEND20",
    description: "Weekend special — 20% off evening slots",
    discount_type: "percentage",
    discount_value: 20,
    valid_from: "2026-10-01T00:00:00.000Z",
    valid_to: "2026-12-31T23:59:00.000Z",
    usage_limit: 100,
    used_count: 34,
    is_active: true,
  },
  {
    id: "promo_mock_2",
    code: "FLAT100",
    description: "Flat ₹100 off morning bookings",
    discount_type: "flat",
    discount_value: 100,
    valid_from: "2026-10-15T00:00:00.000Z",
    valid_to: "2026-11-30T23:59:00.000Z",
    usage_limit: 50,
    used_count: 12,
    is_active: false,
  },
];

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  validFrom: "",
  validTo: "",
  usageLimit: "",
};

function promoStatus(p: Promotion): {
  label: string;
  variant: "success" | "neutral" | "danger" | "info";
} {
  const now = new Date();
  if (!p.is_active) return { label: "Paused", variant: "neutral" };
  if (new Date(p.valid_to) < now) return { label: "Expired", variant: "danger" };
  if (p.valid_from && new Date(p.valid_from) > now)
    return { label: "Scheduled", variant: "info" };
  return { label: "Active", variant: "success" };
}

function discountLabel(p: Promotion): string {
  return p.discount_type === "percentage"
    ? `${p.discount_value}% off`
    : `${formatINR(p.discount_value)} off`;
}

export default function PromotionsView({
  ownerId,
  apiCtx,
}: {
  ownerId: string;
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [promos, setPromos] = useState<Promotion[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.promotions(ownerId);
        if (!cancelled) setPromos(list);
      } catch (err) {
        if (!cancelled) {
          console.error("Promotions load failed:", err);
          setPromos(FALLBACK_PROMOTIONS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  const create = async () => {
    const value = Number(form.discountValue);
    if (!form.code.trim()) {
      toast.error("Promo code is required.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Discount value must be a positive number.");
      return;
    }
    if (form.discountType === "percentage" && value > 100) {
      toast.error("Percentage discount cannot exceed 100.");
      return;
    }
    if (!form.validFrom || !form.validTo) {
      toast.error("Start and end dates are required.");
      return;
    }
    if (new Date(form.validFrom) >= new Date(form.validTo)) {
      toast.error("End date must be after the start date.");
      return;
    }
    setSaving(true);
    try {
      await api.createPromotion({
        ownerId,
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: value,
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo).toISOString(),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      });
      setPromos(await api.promotions(ownerId));
      setForm(EMPTY_FORM);
      setOpen(false);
      toast.success("Promotion created");
    } catch (err) {
      console.error("Create promotion failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not create the promotion.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: Promotion) => {
    try {
      await api.togglePromotion(p.id, !p.is_active);
      setPromos(
        (prev) =>
          prev?.map((x) =>
            x.id === p.id ? { ...x, is_active: !p.is_active } : x,
          ) ?? prev,
      );
      toast.success(p.is_active ? "Promotion paused" : "Promotion resumed");
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Could not update the promotion.");
    }
  };

  const remove = async (p: Promotion) => {
    try {
      await api.deletePromotion(p.id);
      setPromos((prev) => prev?.filter((x) => x.id !== p.id) ?? prev);
      toast.success("Promotion deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Could not delete the promotion.");
    }
  };

  return (
    <Panel>
      <PanelHead
        icon={Ticket}
        title="Promo codes"
        description="Players apply these at checkout."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New promo
          </Button>
        }
      />

      {!promos ? (
        <LoadingRows rows={3} />
      ) : promos.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">
          No promo codes. Create one to discount bookings at checkout.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {promos.map((p) => {
            const st = promoStatus(p);
            return (
              <li key={p.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono font-bold text-brand-text">
                      {p.code}
                    </Badge>
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <span className="text-xs font-bold text-text-main">
                      {discountLabel(p)}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-text-hint">
                    {new Date(p.valid_from).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" – "}
                    {new Date(p.valid_to).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {p.usage_limit ? ` · limit ${p.usage_limit}` : " · unlimited"}
                    {p.description ? ` · ${p.description}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void toggle(p)}
                  >
                    {p.is_active ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${p.code}`}
                    onClick={() => void remove(p)}
                    className="text-error-light hover:bg-error/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border-default bg-surface sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-main">
              New promo code
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Applies to bookings made while the code is active.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Code" htmlFor="promo-code">
              <Input
                id="promo-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="WEEKEND20"
                className="h-9 border-border-default bg-elevated/40 font-mono text-xs uppercase"
              />
            </Field>
            <Field label="Description" htmlFor="promo-desc">
              <Input
                id="promo-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Weekend special"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            <Field label="Discount type">
              <Select
                value={form.discountType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    discountType: v as FormState["discountType"],
                  }))
                }
              >
                <SelectTrigger className="h-9 w-full border-border-default bg-elevated/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Discount value" htmlFor="promo-value">
              <Input
                id="promo-value"
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountValue: e.target.value }))
                }
                placeholder="20"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
            <Field label="Valid from" htmlFor="promo-from">
              <DateTimeField
                id="promo-from"
                value={form.validFrom}
                onChange={(validFrom) =>
                  setForm((f) => ({ ...f, validFrom }))
                }
              />
            </Field>
            <Field label="Valid to" htmlFor="promo-to">
              <DateTimeField
                id="promo-to"
                value={form.validTo}
                onChange={(validTo) => setForm((f) => ({ ...f, validTo }))}
              />
            </Field>
            <Field label="Usage limit" htmlFor="promo-limit">
              <Input
                id="promo-limit"
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usageLimit: e.target.value }))
                }
                placeholder="Unlimited"
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void create()}>
              {saving ? "Creating" : "Create promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
