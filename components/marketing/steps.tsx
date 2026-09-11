import type { LucideIcon } from "lucide-react";

export interface StepItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

export default function Steps({ steps }: { steps: StepItem[] }) {
  return (
    <div className="flex flex-col gap-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border-default flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-brand-lime" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-brand-lime font-bold">0{i + 1}</span>
                <h3 className="font-sans text-lg font-bold text-text-main">{step.title}</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed font-sans">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
