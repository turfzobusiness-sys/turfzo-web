import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TFZ-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function requireUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q: any) => q.eq("firebase_uid", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user._id;
}

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx).catch(() => null);
    if (!userId) return [];
    return await ctx.db
      .query("bookings")
      .withIndex("by_user_id", (q: any) => q.eq("user_id", userId))
      .order("desc")
      .collect();
  },
});

export const getByCode = query({
  args: { booking_code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .filter((q: any) => q.eq(q.field("booking_code"), args.booking_code))
      .first();
  },
});

function isOverlapping(
  startTimeA: string,
  endTimeA: string,
  startTimeB: string,
  endTimeB: string,
): boolean {
  const aStart = new Date(startTimeA).getTime();
  const aEnd = new Date(endTimeA).getTime();
  const bStart = new Date(startTimeB).getTime();
  const bEnd = new Date(endTimeB).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export const createPending = mutation({
  args: {
    turf_id: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    attendees: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.start_time >= args.end_time) {
      throw new Error("start_time must be before end_time");
    }

    const turf = (await ctx.db.get(args.turf_id as any)) as any;
    if (!turf || !turf.is_available) {
      throw new Error("Turf is no longer available");
    }

    const startMs = new Date(args.start_time).getTime();
    const endMs = new Date(args.end_time).getTime();
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);
    if (durationHours < 1 || durationHours > 4) {
      throw new Error("Booking duration must be between 1 and 4 hours.");
    }
    const calculatedPrice = turf.price_per_hour * durationHours;
    const serviceFee = Math.round(calculatedPrice * 0.05 * 100) / 100;

    const requestStart = new Date(args.start_time);
    const windowStart = new Date(requestStart);
    windowStart.setDate(windowStart.getDate() - 1);
    const windowEnd = new Date(requestStart);
    windowEnd.setDate(windowEnd.getDate() + 1);

    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_turf_and_start_time", (q: any) =>
        q
          .eq("turf_id", args.turf_id)
          .gte("start_time", windowStart.toISOString())
          .lte("start_time", windowEnd.toISOString()),
      )
      .take(200);

    const hasConflict = existingBookings
      .filter((doc: any) => doc.status === "pending" || doc.status === "confirmed")
      .some((doc: any) =>
        isOverlapping(args.start_time, args.end_time, doc.start_time, doc.end_time),
      );

    if (hasConflict) {
      throw new Error("Requested slot is no longer available.");
    }

    const blocks = await ctx.db
      .query("slot_blocks")
      .withIndex("by_turf_and_time", (q: any) =>
        q
          .eq("turf_id", args.turf_id)
          .gte("start_time", windowStart.toISOString())
          .lte("start_time", windowEnd.toISOString()),
      )
      .take(200);

    const isBlocked = blocks.some((block: any) =>
      isOverlapping(args.start_time, args.end_time, block.start_time, block.end_time),
    );

    if (isBlocked) {
      throw new Error("This time slot is blocked by the turf owner.");
    }

    const now = new Date().toISOString();

    const bookingId = await ctx.db.insert("bookings", {
      user_id: userId,
      turf_id: args.turf_id,
      booking_code: generateBookingCode(),
      start_time: new Date(args.start_time).toISOString(),
      end_time: new Date(args.end_time).toISOString(),
      total_price: calculatedPrice,
      service_fee: serviceFee,
      status: "pending",
      payment_status: "pending",
      attendees: args.attendees,
      notes: args.notes,
      created_at: now,
      updated_at: now,
    });
    return await ctx.db.get(bookingId);
  },
});

export const confirmPaid = mutation({
  args: {
    booking_id: v.string(),
    pg_payment_id: v.string(),
    pg_signature: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const booking = await ctx.db.get(args.booking_id as Id<"bookings">);
    if (!booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Not authorized");
    if (booking.status === "confirmed") return booking;

    await ctx.db.patch(args.booking_id as Id<"bookings">, {
      status: "confirmed",
      payment_status: "paid",
      pg_payment_id: args.pg_payment_id,
      pg_signature: args.pg_signature,
      updated_at: new Date().toISOString(),
    });
    return await ctx.db.get(args.booking_id as Id<"bookings">);
  },
});

export const cancel = mutation({
  args: {
    booking_id: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const booking = await ctx.db.get(args.booking_id as Id<"bookings">);
    if (!booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Not authorized");
    if (booking.status === "cancelled") return booking;

    const hoursToStart =
      (new Date(booking.start_time).getTime() - Date.now()) / 3_600_000;
    let refundStatus: "pending" | "refunded" | "paid" = "pending";
    if (hoursToStart >= 24) refundStatus = "refunded";
    else if (hoursToStart >= 6) refundStatus = "paid";

    await ctx.db.patch(args.booking_id as Id<"bookings">, {
      status: "cancelled",
      payment_status: refundStatus,
      cancellation_reason: args.reason,
      updated_at: new Date().toISOString(),
    });
    return await ctx.db.get(args.booking_id as Id<"bookings">);
  },
});
