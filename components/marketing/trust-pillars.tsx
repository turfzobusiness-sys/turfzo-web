import { ShieldCheck, CalendarCheck, ReceiptText } from "lucide-react";

const PILLARS = [
  {
    title: "Verified turfs",
    desc: "Listings carry inspected location, facility and turf-condition details.",
    icon: ShieldCheck,
  },
  {
    title: "Live availability",
    desc: "Slots come straight from the venue backend — no double bookings.",
    icon: CalendarCheck,
  },
  {
    title: "Clear checkout price",
    desc: "The single service fee is shown before you pay. Nothing added later.",
    icon: ReceiptText,
  },
];

/** Three trust reasons. Deliberately number-free: no invented statistics. */
export default function TrustPillars() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {PILLARS.map((pillar) => {
        const Icon = pillar.icon;
        return (
          <div
            key={pillar.title}
            className="bg-surface border border-border-default rounded-xl p-6 shadow-md"
          >
            <div className="w-11 h-11 rounded-xl bg-bg border border-border-default flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-brand-lime" />
            </div>
            <h3 className="font-sans text-base font-bold text-text-main">{pillar.title}</h3>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed font-sans">{pillar.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
