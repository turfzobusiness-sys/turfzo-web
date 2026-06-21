import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg text-text-main gap-4">
      <Loader2 className="w-8 h-8 text-brand-lime animate-spin" />
      <p className="font-sans text-sm text-text-muted animate-pulse">
        Finding turfs near you...
      </p>
    </div>
  );
}
