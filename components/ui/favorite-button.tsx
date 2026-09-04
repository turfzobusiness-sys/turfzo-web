"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { convexClient } from "@/lib/convex";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  turfId: string;
  className?: string;
  /** Optional label override. Defaults to "Add to Favourites" / "Favourited". */
  label?: string;
}

/**
 * Client-side favourite toggle for a turf. Reads the current favourite
 * state from `favorites:isFavorited` on mount and optimistically toggles
 * via `favorites:add` / `favorites:remove`.
 *
 * If the user is not signed in, clicking opens the auth modal instead.
 */
export function FavoriteButton({ turfId, className, label }: FavoriteButtonProps) {
  const { status, convexUser, getFreshToken } = useAuth();
  const { openAuthModal } = useAuthModal();
  const isAuthed = status === "authenticated";
  const [favorited, setFavorited] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    if (!isAuthed || !convexUser?._id) {
      setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, 0);
      return () => { cancelled = true; };
    }
    (async () => {
      try {
        const token = await getFreshToken();
        const result = await convexClient.query<boolean>(
          "favorites:isFavorited",
          { user_id: convexUser._id, turf_id: turfId },
          token,
        );
        if (!cancelled) setFavorited(result);
      } catch {
        // ignore — default to not favourited
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, convexUser?._id, turfId, getFreshToken]);

  const toggle = async () => {
    if (!isAuthed) {
      openAuthModal("signin");
      return;
    }
    const token = await getFreshToken();
    const previous = favorited;
    // Optimistic update
    setFavorited(!previous);
    try {
      if (previous) {
        await convexClient.mutation(
          "favorites:remove",
          { turf_id: turfId },
          token,
        );
        toast.success("Removed from favourites.");
      } else {
        await convexClient.mutation(
          "favorites:add",
          { turf_id: turfId },
          token,
        );
        toast.success("Added to favourites!");
      }
    } catch (err) {
      // Revert on error
      setFavorited(previous);
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Could not update favourite."));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading && isAuthed}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favourites" : "Add to favourites"}
      title={favorited ? "Remove from favourites" : "Add to favourites"}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans font-bold text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        favorited
          ? "bg-error/10 text-error border border-error/30 hover:bg-error/20"
          : "bg-brand-lime text-black border border-brand-lime hover:bg-brand-lime-hover",
        className,
      )}
    >
      <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
      {label ?? (favorited ? "Favourited" : "Add to Favourites")}
    </button>
  );
}