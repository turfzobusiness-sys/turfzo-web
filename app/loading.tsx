import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center bg-bg text-text-main gap-4">
      <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
      <div className="font-poppins font-bold text-lg animate-pulse">
        Loading...
      </div>
    </div>
  );
}
