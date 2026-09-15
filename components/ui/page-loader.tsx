import Image from "next/image";

/**
 * Branded route-loading indicator. Replaces the generic lucide spinner on
 * full-page loading states. Server component — pure CSS animation, no JS.
 */
export function PageLoader({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center gap-5"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -m-5 rounded-full bg-brand-lime/25 blur-2xl"
        />
        <Image
          src="/turfzo_mascot.svg"
          alt=""
          width={72}
          height={72}
          className="relative h-[72px] w-[72px] animate-loader-float"
        />
      </div>
      <div
        aria-hidden
        className="relative h-1 w-44 overflow-hidden rounded-full bg-elevated"
      >
        <div className="absolute inset-0 rounded-full bg-brand-lime/15" />
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-brand-lime/50 via-brand-lime to-brand-lime/50 animate-loader-bar" />
      </div>
      <p className="font-sans text-sm text-text-muted">
        {label}
        <span aria-hidden className="ml-0.5 inline-flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block size-1 rounded-full bg-brand-lime animate-loader-dot"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      </p>
    </div>
  );
}
