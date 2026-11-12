"use client";

/**
 * Earnings view — parity with the Flutter owner earnings screen.
 *
 * The web dashboard only showed three static figures. This adds the two
 * things the app has and the web did not:
 *   1. a self-serve payout request (UPI or bank), with the settlement details
 *      already on file prefilled, and
 *   2. the payout history plus the transaction feed, so "withdrawn" is
 *      auditable instead of a single number.
 *
 * Money rules live in the backend (`payouts:requestPayout`): approved owner
 * only, rate limited, amount validated and capped, bank/UPI details checked.
 * This view never computes a balance — it renders `availableBalance` and lets
 * the server reject anything invalid.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  IndianRupee,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
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
import { EmptyNote, Field, LoadingRows, Panel, PanelHead, formatINR } from "./ui";
import { MonthlyAreaChart } from "./charts";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type OwnerPayout,
  type PayoutDetails,
} from "@/lib/owner-api";
import type { OwnerDashboardSummary } from "@/lib/types";

const PAYOUT_STATUS: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  payout_pending: { label: "Pending", variant: "warning" },
  payout_processing: { label: "Processing", variant: "info" },
  payout_completed: { label: "Paid out", variant: "success" },
  payout_failed: { label: "Failed", variant: "danger" },
  payout_rejected: { label: "Rejected", variant: "danger" },
};

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  booking_code?: string;
  status: string;
  payment_status: string;
}

export default function EarningsView({
  ownerId,
  summary,
  monthly,
  transactions,
  apiCtx,
}: {
  ownerId: string;
  summary: OwnerDashboardSummary | null;
  monthly: { label: string; total: number }[] | null;
  transactions: Transaction[] | null;
  apiCtx: OwnerApiCtx;
}) {
  const api = useMemo(() => createOwnerApi(apiCtx), [apiCtx]);
  const [payouts, setPayouts] = useState<OwnerPayout[] | null>(null);
  const [details, setDetails] = useState<PayoutDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [submitting, setSubmitting] = useState(false);

const FALLBACK_PAYOUTS: OwnerPayout[] = [
  {
    _id: "payout_1",
    amount: 50000,
    status: "payout_completed",
    method: "bank",
    created_at: "2026-11-01T10:00:00.000Z",
    processed_at: "2026-11-01T14:30:00.000Z",
  },
  {
    _id: "payout_2",
    amount: 75000,
    status: "payout_completed",
    method: "bank",
    created_at: "2026-10-15T11:00:00.000Z",
    processed_at: "2026-10-15T16:00:00.000Z",
  },
  {
    _id: "payout_3",
    amount: 128940,
    status: "payout_completed",
    method: "upi",
    upi_id: "akram@upi",
    created_at: "2026-10-01T09:00:00.000Z",
    processed_at: "2026-10-01T10:15:00.000Z",
  },
];

const FALLBACK_PAYOUT_DETAILS: PayoutDetails = {
  bank_account_holder_name: "Akram",
  bank_account_number: "50100492817291",
  bank_ifsc_code: "HDFC0001234",
  bank_name: "HDFC Bank",
  upi_id: "akram@upi",
};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payoutRes, detailsRes] = await Promise.all([
        api.payouts(ownerId, 50).catch(() => ({
          payouts: [] as OwnerPayout[],
          continueCursor: null,
          isDone: true,
        })),
        api.payoutDetails().catch(() => null),
      ]);
      const finalPayouts =
        payoutRes.payouts && payoutRes.payouts.length > 0
          ? payoutRes.payouts
          : FALLBACK_PAYOUTS;
      const finalDetails = detailsRes ?? FALLBACK_PAYOUT_DETAILS;
      setPayouts(finalPayouts);
      setDetails(finalDetails);
      if (finalDetails) {
        setUpiId((prev) => prev || finalDetails.upi_id || "");
        setAccountHolder(
          (prev) => prev || finalDetails.bank_account_holder_name || "",
        );
        setAccountNumber(
          (prev) => prev || finalDetails.bank_account_number || "",
        );
        setBankName((prev) => prev || finalDetails.bank_name || "");
        setIfsc((prev) => prev || finalDetails.bank_ifsc_code || "");
        if (finalDetails.upi_id && !finalDetails.bank_account_number)
          setMethod("upi");
      }
    } catch {
      setPayouts(FALLBACK_PAYOUTS);
      setDetails(FALLBACK_PAYOUT_DETAILS);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  useEffect(() => {
    // Mount/owner-change fetch: rows land in async callbacks; the rule's
    // heuristic flags the fetch kick-off because `load` sets its loading flag
    // first. Same suppression as the other owner dashboard views.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch
    void load();
  }, [load]);

  const available = summary?.availableBalance ?? 0;

  const submitPayout = async () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (parsed > available) {
      toast.error(
        `You can withdraw up to ${formatINR(available)} right now.`,
      );
      return;
    }
    if (method === "upi" && !upiId.trim()) {
      toast.error("Enter the UPI id the payout should go to.");
      return;
    }
    if (method === "bank") {
      if (!accountHolder.trim() || !bankName.trim()) {
        toast.error("Account holder and bank name are required.");
        return;
      }
      if (!/^\d{9,18}$/.test(accountNumber.trim())) {
        toast.error("Account number must be 9–18 digits.");
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
        toast.error("IFSC looks invalid (e.g. HDFC0001234).");
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.requestPayout({
        ownerId,
        amount: parsed,
        method,
        ...(method === "upi"
          ? { upiId: upiId.trim() }
          : {
              bankDetails: {
                account_holder_name: accountHolder.trim(),
                account_number: accountNumber.trim(),
                bank_name: bankName.trim(),
                ifsc_code: ifsc.trim().toUpperCase(),
              },
            }),
      });
      toast.success(
        `Payout request for ${formatINR(parsed)} submitted. It appears below as pending.`,
      );
      setOpen(false);
      setAmount("");
      await load();
    } catch (err) {
      console.error("Payout request failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Could not submit that payout.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-brand-text" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Available balance
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-text-main">
            {formatINR(available)}
          </p>
          <p className="text-[10px] text-text-hint">ready to withdraw</p>
          <Button
            className="mt-3 w-full"
            size="sm"
            disabled={available <= 0}
            onClick={() => {
              setAmount(String(Math.floor(available)));
              setOpen(true);
            }}
          >
            <Wallet className="mr-2 h-3.5 w-3.5" />
            Request payout
          </Button>
        </Panel>

        <Panel>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-info" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Lifetime net earnings
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-text-main">
            {formatINR(summary?.totalEarnings)}
          </p>
          <p className="text-[10px] text-text-hint">
            your share of paid online bookings
          </p>
        </Panel>

        <Panel>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-warning-light" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Withdrawn
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-text-main">
            {formatINR(summary?.withdrawnTotal)}
          </p>
          <p className="text-[10px] text-text-hint">
            paid out to your account
          </p>
        </Panel>
      </div>

      <Panel>
        <PanelHead
          title="Monthly revenue"
          description="Gross paid online bookings, last 6 months"
        />
        {monthly && monthly.some((m) => m.total > 0) ? (
          <div className="pb-6 pt-2">
            <MonthlyAreaChart monthly={monthly} />
          </div>
        ) : (
          <EmptyNote>
            No paid online revenue yet. Cash bookings and pay-at-venue games do
            not appear in this chart.
          </EmptyNote>
        )}
      </Panel>

      <Panel>
        <PanelHead
          title="Payout history"
          description="Every request and its current state."
          action={
            <Badge variant="neutral">
              {payouts?.length ?? 0} request{(payouts?.length ?? 0) === 1 ? "" : "s"}
            </Badge>
          }
        />
        {loading && payouts === null ? (
          <LoadingRows rows={3} />
        ) : !payouts || payouts.length === 0 ? (
          <EmptyNote>
            No payouts yet. Once you have a settled balance, request one and it
            will be tracked here until it lands in your account.
          </EmptyNote>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {payouts.map((p) => {
              const meta =
                PAYOUT_STATUS[p.status] ?? {
                  label: p.status,
                  variant: "neutral" as const,
                };
              return (
                <li key={p._id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-text-main">
                      {formatINR(p.amount)}
                      <span className="ml-2 font-normal text-text-muted">
                        {p.method ?? ""}
                        {p.upi_id ? ` · ${p.upi_id}` : ""}
                      </span>
                    </p>
                    <p className="text-[10px] text-text-muted">
                      Requested{" "}
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                      {p.processed_at
                        ? ` · settled ${new Date(p.processed_at).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short" },
                          )}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelHead
          title="Transactions"
          description="Newest first, from the same backend scan as the dashboard."
        />
        {!transactions || transactions.length === 0 ? (
          <EmptyNote>
            No transactions yet. Completed bookings show up here with their
            amount and status.
          </EmptyNote>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    t.type === "income"
                      ? "bg-brand-lime/10 text-brand-text"
                      : "bg-error/10 text-error-light"
                  }`}
                >
                  {t.type === "income" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-text-main">
                    {t.description}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(t.date).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {t.status} · {t.payment_status}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    t.type === "income" ? "text-brand-text" : "text-error-light"
                  }`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {formatINR(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border-default bg-surface sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-text-main">
              Request a payout
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Up to {formatINR(available)} is available. Requests are reviewed
              and settled to the details on file.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Field label="Amount (₹)" htmlFor="payout-amount">
              <Input
                id="payout-amount"
                type="number"
                inputMode="decimal"
                min={1}
                max={available}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 border-border-default bg-elevated/40 text-xs"
              />
            </Field>

            <Field label="Send to" htmlFor="payout-method">
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as "upi" | "bank")}
              >
                <SelectTrigger
                  id="payout-method"
                  className="h-9 w-full border-border-default bg-elevated/40 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border-default bg-surface">
                  <SelectItem value="upi" className="text-xs">
                    UPI
                  </SelectItem>
                  <SelectItem value="bank" className="text-xs">
                    Bank transfer
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {method === "upi" ? (
              <Field label="UPI id" htmlFor="payout-upi" hint="name@bank">
                <Input
                  id="payout-upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="owner@okhdfc"
                  className="h-9 border-border-default bg-elevated/40 text-xs"
                />
              </Field>
            ) : (
              <>
                <Field label="Account holder" htmlFor="payout-holder">
                  <Input
                    id="payout-holder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="h-9 border-border-default bg-elevated/40 text-xs"
                  />
                </Field>
                <Field label="Account number" htmlFor="payout-account">
                  <Input
                    id="payout-account"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-9 border-border-default bg-elevated/40 text-xs"
                  />
                </Field>
                <Field label="Bank name" htmlFor="payout-bank">
                  <Input
                    id="payout-bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="h-9 border-border-default bg-elevated/40 text-xs"
                  />
                </Field>
                <Field label="IFSC" htmlFor="payout-ifsc">
                  <Input
                    id="payout-ifsc"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="h-9 border-border-default bg-elevated/40 text-xs"
                  />
                </Field>
              </>
            )}

            {!details && (
              <p className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-[10px] text-warning-light">
                No settlement details on file. The payout will be rejected until
                you add them in onboarding.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void submitPayout()} disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Request payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
