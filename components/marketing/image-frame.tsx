import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageFrameProps {
  src: string;
  alt: string;
  aspect?: "16/9" | "4/3" | "3/2" | "21/9" | "4/5";
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/** Rounded, bordered, softly-elevated image. Marketing crops only. */
export default function ImageFrame({
  src,
  alt,
  aspect = "16/9",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
  className,
}: ImageFrameProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border-default bg-surface shadow-md",
        className
      )}
      style={{ aspectRatio: aspect.replace("/", " / ") }}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover object-center" />
    </div>
  );
}
