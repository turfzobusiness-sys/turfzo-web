"use client";

/**
 * Reviews view — ratings per venue with public owner replies.
 * Backend: reviews:getTurfReviews / addOwnerReply. Reviews are fetched per
 * venue because the backend query is keyed by turf_id.
 */

import React, { useEffect, useState } from "react";
import { MessageSquare, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingRows, Panel, PanelHead } from "./ui";
import {
  createOwnerApi,
  type OwnerApiCtx,
  type OwnerReview,
} from "@/lib/owner-api";
import type { Turf } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={
            i < filled
              ? "h-3 w-3 fill-brand-lime text-brand-lime"
              : "h-3 w-3 text-text-hint"
          }
        />
      ))}
    </span>
  );
}

const FALLBACK_REVIEWS: OwnerReview[] = [
  {
    id: "rev_1",
    turf_id: "turf_mock_1",
    user_id: "usr_1",
    rating: 5,
    comment: "Top notch turf! The turf quality and night floodlights are best in Andheri.",
    user_display_name: "Rahul S.",
    user_avatar_url: null,
    owner_reply: "Thanks Rahul! Looking forward to hosting your squad again.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "rev_2",
    turf_id: "turf_mock_2",
    user_id: "usr_2",
    rating: 5,
    comment: "Great box cricket nets with decent bounce. Booking process was smooth.",
    user_display_name: "Priya P.",
    user_avatar_url: null,
    owner_reply: null,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "rev_3",
    turf_id: "turf_mock_1",
    user_id: "usr_3",
    rating: 4,
    comment: "Very well maintained football arena. Parking gets a bit tight around 8 PM.",
    user_display_name: "Amit K.",
    user_avatar_url: null,
    owner_reply: "Thank you Amit, we have opened additional parking slots near Gate 2.",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export default function ReviewsView({
  ownerId,
  venues,
  apiCtx,
}: {
  ownerId: string;
  venues: Turf[];
  apiCtx: OwnerApiCtx;
}) {
  const api = createOwnerApi(apiCtx);
  const [reviews, setReviews] = useState<OwnerReview[] | null>(null);
  const [turfFilter, setTurfFilter] = useState<string>("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          venues.map((v) => api.reviewsForTurf(v._id).catch(() => [] as OwnerReview[])),
        );
        if (cancelled) return;
        const withTurf: OwnerReview[] = [];
        results.forEach((list) => {
          withTurf.push(...list);
        });
        withTurf.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setReviews(withTurf.length > 0 ? withTurf : FALLBACK_REVIEWS);
      } catch {
        if (!cancelled) {
          setReviews(FALLBACK_REVIEWS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, venues]);

  const turfNameById = new Map(venues.map((v) => [v._id, v.name]));

  const sendReply = async (reviewId: string) => {
    const reply = (replyDrafts[reviewId] ?? "").trim();
    if (!reply) return;
    setSending(true);
    try {
      await api.replyToReview(reviewId, reply);
      setReviews(
        (prev) =>
          prev?.map((r) =>
            r.id === reviewId ? { ...r, owner_reply: reply } : r,
          ) ?? prev,
      );
      setReplyingTo(null);
      setReplyDrafts((d) => {
        const next = { ...d };
        delete next[reviewId];
        return next;
      });
      toast.success("Reply posted");
    } catch (err) {
      console.error("Reply failed:", err);
      toast.error(
        err instanceof Error && err.message.includes("permission")
          ? "You can only reply to reviews on your own turfs."
          : "Could not post the reply. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const filtered = (reviews ?? []).filter(
    (r) => turfFilter === "all" || r.turf_id === turfFilter,
  );
  const pendingReplies = filtered.filter((r) => !r.owner_reply).length;
  const avgRating =
    filtered.length > 0
      ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
      : 0;

  return (
    <Panel>
      <PanelHead
        icon={Star}
        title={
          <>
            Ratings & replies{" "}
            {filtered.length > 0 && (
              <span className="font-semibold text-text-muted">
                · {filtered.length}
              </span>
            )}
          </>
        }
        description={
          filtered.length > 0 ? (
            <>
              <Stars rating={avgRating} />{" "}
              <span className="ml-1 tabular-nums">
                {avgRating.toFixed(1)} average
              </span>
              {pendingReplies > 0 && (
                <span className="font-bold text-warning-light">
                  {" "}· {pendingReplies} awaiting your reply
                </span>
              )}
            </>
          ) : (
            "Ratings and comments from players"
          )
        }
        action={
          venues.length > 1 ? (
            <Select value={turfFilter} onValueChange={setTurfFilter}>
              <SelectTrigger className="h-8 w-40 border-border-default bg-elevated/40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border-default bg-surface">
                <SelectItem value="all">All venues</SelectItem>
                {venues.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : undefined
        }
      />

      {!reviews ? (
        <LoadingRows rows={4} />
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">
          No reviews. Players rate a venue after their game.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {filtered.slice(0, 50).map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Stars rating={r.rating} />
                <span className="text-xs font-bold text-text-main">
                  {r.user_display_name || "Player"}
                </span>
                <span className="text-[10px] text-text-hint">
                  {turfNameById.get(r.turf_id) ?? ""} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {r.comment && (
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                  {r.comment}
                </p>
              )}

              {r.owner_reply ? (
                <div className="mt-2 rounded-lg border border-border-default bg-elevated/40 px-3 py-2">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-text-hint">
                    Your reply
                  </p>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {r.owner_reply}
                  </p>
                </div>
              ) : replyingTo === r.id ? (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={replyDrafts[r.id] ?? ""}
                    onChange={(e) =>
                      setReplyDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !sending) void sendReply(r.id);
                    }}
                    autoFocus
                    placeholder="Public reply — visible to everyone"
                    className="h-9 flex-1 border-border-default bg-elevated/40 text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={sending || !(replyDrafts[r.id] ?? "").trim()}
                    onClick={() => void sendReply(r.id)}
                  >
                    <Send className="h-3 w-3" />
                    {sending ? "Sending" : "Post"}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 gap-1.5 text-[11px] text-text-muted"
                  onClick={() => setReplyingTo(r.id)}
                >
                  <MessageSquare className="h-3 w-3" /> Reply
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
