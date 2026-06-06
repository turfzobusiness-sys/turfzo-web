"use client";

import React from "react";
import { Check, Building2, MapPin, CreditCard, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Business Profile",
    subtitle: "GST, Address & Info",
    icon: Building2,
  },
  {
    number: 2,
    title: "Venue Setup",
    subtitle: "Court details, pricing & hours",
    icon: MapPin,
  },
  {
    number: 3,
    title: "Payout Setup",
    subtitle: "Bank account & settlements",
    icon: CreditCard,
  },
  {
    number: 4,
    title: "Review & Submit",
    subtitle: "Accept terms & finish",
    icon: ClipboardCheck,
  },
];

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile Stepper: Horizontal */}
      <div className="flex items-center justify-between md:hidden px-4 py-3 bg-surface border border-border-default rounded-[12px] mb-6 shadow-md shadow-brand-lime/2">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.number);
          const isActive = currentStep === step.number;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-1.5 relative">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 font-poppins text-xs font-bold transition-all duration-300",
                    isCompleted
                      ? "bg-brand-lime/10 border-brand-lime text-brand-lime"
                      : isActive
                      ? "bg-elevated border-brand-lime text-brand-lime ring-4 ring-brand-lime/15 shadow-sm"
                      : "bg-surface border-border-default text-text-muted/60"
                  )}
                >
                  {isCompleted ? <Check className="h-4.5 w-4.5 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-sans font-medium transition-colors duration-200",
                    isActive ? "text-brand-lime font-semibold" : "text-text-muted"
                  )}
                >
                  {step.title.split(" ")[0]}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-2 transition-all duration-300",
                    isCompleted ? "bg-brand-lime" : "bg-border-default"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Desktop Stepper: Vertical */}
      <div className="hidden md:flex flex-col gap-6 relative">
        <div className="absolute left-[21px] top-6 bottom-6 w-[2px] bg-border-default -z-10" />
        
        {/* Active Line Progress overlay */}
        <div 
          className="absolute left-[21px] top-6 w-[2px] bg-brand-lime transition-all duration-500 -z-10"
          style={{
            height: `${((Math.max(1, currentStep) - 1) / (STEPS.length - 1)) * 82}%`,
          }}
        />

        {STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isActive = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              className={cn(
                "flex items-center gap-4 p-3 rounded-[12px] transition-all duration-300 group cursor-default",
                isActive && "bg-brand-lime/5 border border-brand-lime/10"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-poppins font-bold text-sm transition-all duration-300",
                  isCompleted
                    ? "bg-brand-lime/15 border-brand-lime text-brand-lime shadow-md shadow-brand-lime/5"
                    : isActive
                    ? "bg-[#0f1f0f] border-brand-lime text-brand-lime ring-4 ring-brand-lime/10 scale-105"
                    : "bg-surface border-border-default text-text-muted group-hover:border-border-strong group-hover:bg-elevated"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : <Icon className="h-5 w-5" />}
              </div>

              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-poppins text-sm font-semibold tracking-wide transition-colors duration-200",
                    isActive ? "text-brand-lime" : isCompleted ? "text-text-main" : "text-text-muted"
                  )}
                >
                  {step.title}
                </span>
                <span className="font-sans text-xs text-text-muted/70 mt-0.5 leading-snug">
                  {step.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
