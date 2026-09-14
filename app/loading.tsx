import { PageLoader } from "@/components/ui/page-loader";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center bg-bg text-text-main gap-4">
      <PageLoader label="Loading" />
    </div>
  );
}
