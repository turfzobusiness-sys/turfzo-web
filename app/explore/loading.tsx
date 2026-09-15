import { PageLoader } from "@/components/ui/page-loader";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg text-text-main gap-4">
      <PageLoader label="Finding turfs near you" />
    </div>
  );
}
