"use client";

import React, { useState } from "react";
import { ShieldAlert, ArrowLeft, ArrowRight, Loader2, CreditCard, Landmark, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PayoutData {
  bank_account_holder_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  upi_id?: string;
}

interface StepPayoutDetailsProps {
  initialData: PayoutData;
  onNext: (data: Required<Omit<PayoutData, "bank_branch" | "upi_id">> & PayoutData) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export function StepPayoutDetails({ initialData, onNext, onBack, loading }: StepPayoutDetailsProps) {
  const [holderName, setHolderName] = useState(initialData.bank_account_holder_name || "");
  const [accountNumber, setAccountNumber] = useState(initialData.bank_account_number || "");
  const [confirmAccount, setConfirmAccount] = useState(initialData.bank_account_number || "");
  const [ifsc, setIfsc] = useState(initialData.bank_ifsc_code || "");
  const [bankName, setBankName] = useState(initialData.bank_name || "");
  const [branch, setBranch] = useState(initialData.bank_branch || "");
  const [upi, setUpi] = useState(initialData.upi_id || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!holderName.trim()) {
      newErrors.holderName = "Account holder name is required";
    }
    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{9,18}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = "Please enter a valid bank account number (9 to 18 digits)";
    }
    if (accountNumber !== confirmAccount) {
      newErrors.confirmAccount = "Account numbers do not match";
    }
    if (!ifsc.trim()) {
      newErrors.ifsc = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim())) {
      newErrors.ifsc = "Please enter a valid 11-digit IFSC code (e.g., HDFC0001234)";
    }
    if (!bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (upi.trim() && !/^[\w.-]+@[\w.-]+$/.test(upi.trim())) {
      newErrors.upi = "Please enter a valid UPI ID (e.g., name@okaxis)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    onNext({
      bank_account_holder_name: holderName.trim(),
      bank_account_number: accountNumber.trim(),
      bank_ifsc_code: ifsc.trim().toUpperCase(),
      bank_name: bankName.trim(),
      bank_branch: branch.trim(),
      upi_id: upi.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-sans text-xl font-bold text-text-main tracking-wide">Payout Setup</h2>
        <p className="font-sans text-sm text-text-muted/70">
          Enter the bank account details where you wish to receive bookings settlements.
        </p>
      </div>

      <div className="bg-[#0f1c0f]/40 border border-brand-lime/10 p-3.5 rounded-[12px] flex items-start gap-3">
        <Landmark className="h-5 w-5 text-brand-lime mt-0.5 shrink-0" />
        <div className="text-xs font-sans text-text-muted/80 leading-normal">
          <p className="font-semibold text-text-main">Automatic Daily Settlements</p>
          <p className="mt-1">
            Settlements are processed automatically within 24 hours of booking completions. All payments are securely handled in compliance with RBI guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Holder Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="holder_name" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Account Holder Name <span className="text-brand-lime">*</span>
          </label>
          <div className="relative">
            <Landmark className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="holder_name"
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
          {errors.holderName && (
            <span className="font-sans text-xs text-error-light">{errors.holderName}</span>
          )}
        </div>

        {/* Account Number */}
        <div className="space-y-1.5">
          <label htmlFor="account_num" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Bank Account Number <span className="text-brand-lime">*</span>
          </label>
          <div className="relative">
            <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="account_num"
              type="password"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
          {errors.accountNumber && (
            <span className="font-sans text-xs text-error-light">{errors.accountNumber}</span>
          )}
        </div>

        {/* Confirm Account Number */}
        <div className="space-y-1.5">
          <label htmlFor="confirm_account" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Confirm Account Number <span className="text-brand-lime">*</span>
          </label>
          <div className="relative">
            <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted/70" />
            <input
              id="confirm_account"
              type="text"
              value={confirmAccount}
              onChange={(e) => setConfirmAccount(e.target.value)}
              placeholder="Re-enter account number"
              className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 pl-11 pr-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
            />
          </div>
          {errors.confirmAccount && (
            <span className="font-sans text-xs text-error-light">{errors.confirmAccount}</span>
          )}
        </div>

        {/* IFSC Code */}
        <div className="space-y-1.5">
          <label htmlFor="ifsc" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            IFSC Code <span className="text-brand-lime">*</span>
          </label>
          <input
            id="ifsc"
            type="text"
            value={ifsc}
            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
            placeholder="e.g., HDFC0001234"
            maxLength={11}
            className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
          />
          {errors.ifsc && (
            <span className="font-sans text-xs text-error-light">{errors.ifsc}</span>
          )}
        </div>

        {/* Bank Name */}
        <div className="space-y-1.5">
          <label htmlFor="bank_name" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
            Bank Name <span className="text-brand-lime">*</span>
          </label>
          <input
            id="bank_name"
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g., HDFC Bank"
            className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
          />
          {errors.bankName && (
            <span className="font-sans text-xs text-error-light">{errors.bankName}</span>
          )}
        </div>

        {/* Bank Branch */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="branch" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Branch Name
            </label>
            <span className="font-sans text-[10px] text-text-muted/50 uppercase">Optional</span>
          </div>
          <input
            id="branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g., HSR Layout"
            className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
          />
        </div>

        {/* UPI ID */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="upi" className="font-sans text-xs font-semibold text-text-muted uppercase tracking-wider">
              Settlement UPI ID
            </label>
            <span className="font-sans text-[10px] text-text-muted/50 uppercase">Optional</span>
          </div>
          <input
            id="upi"
            type="text"
            value={upi}
            onChange={(e) => setUpi(e.target.value.toLowerCase())}
            placeholder="e.g., turfzo@okaxis"
            className="w-full rounded-[8px] border border-border-default bg-elevated py-2.5 px-4 font-sans text-sm text-text-main placeholder:text-text-muted/40 hover:border-border-strong focus:border-brand-lime focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-lime/10 transition-all duration-200"
          />
          {errors.upi && (
            <span className="font-sans text-xs text-error-light">{errors.upi}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-sans text-text-muted/60 bg-surface border border-border-default p-2 rounded-[8px]">
        <CheckCircle2 className="h-4 w-4 text-brand-lime shrink-0" />
        <span>Your bank details are stored securely. You can modify them later from your billing preferences.</span>
      </div>

      {/* Form Navigation */}
      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button
          type="button"
          onClick={onBack}
          variant="ghost"
          className="inline-flex items-center gap-2 py-2.5 px-4 font-sans text-sm text-text-muted hover:text-text-main transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-brand-btn-bg border border-brand-lime/30 text-white py-2.5 px-6 font-sans font-bold text-sm tracking-wide rounded-[8px] hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Payouts...
            </>
          ) : (
            <>
              Next Step
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
