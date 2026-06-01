import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./_helpers";

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TFZ-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx).catch(() => null);
    if (!userId) return [];
    return await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .order("desc")
      .collect();
  },
});

export const getByCode = query({
  args: { booking_code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("booking_code"), args.booking_code))
      .first();
  },
});

export const createPending = mutation({
  args: {
    turf_id: v.id("turfs"),
    start_time: v.string(),
    end_time: v.string(),
    total_price: v.number(),
    service_fee: v.number(),
    attendees: v.optional(v.number()),
    notes: v.optional(v.string()),
    razorpay_order_id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const turf = await ctx.db.get(args.turf_id);
    if (!turf || !turf.is_available) {
      throw new Error("Turf is no longer available");
    }
    const slotStart = new Date(args.start_time);
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_turf_start", (q) =>
        q.eq("turf_id", args.turf_id).eq("start_time", slotStart.toISOString())
      )
      .first();
    if (existing && existing.status !== "cancelled") {
      throw new Error("This slot was just booked. Please pick another time.");
    }
    const bookingId = await ctx.db.insert("bookings", {
      user_id: userId,
      turf_id: args.turf_id,
      booking_code: generateBookingCode(),
      start_time: slotStart.toISOString(),
      end_time: new Date(args.end_time).toISOString(),
      total_price: args.total_price,
      service_fee: args.service_fee,
      status: "pending",
      payment_status: "pending",
      attendees: args.attendees,
      notes: args.notes,
      razorpay_order_id: args.razorpay_order_id,
    });
    return await ctx.db.get(bookingId);
  },
});

export const confirmPaid = mutation({
  args: {
    booking_id: v.id("bookings"),
    razorpay_payment_id: v.string(),
    razorpay_signature: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const booking = await ctx.db.get(args.booking_id);
    if (!booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Not authorized");
    if (booking.status === "confirmed") return booking;
    await ctx.db.patch(args.booking_id, {
      status: "confirmed",
      payment_status: "paid",
      razorpay_payment_id: args.razorpay_payment_id,
      razorpay_signature: args.razorpay_signature,
    });
    return await ctx.db.get(args.booking_id);
  },
});

export const cancel = mutation({
  args: {
    booking_id: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const booking = await ctx.db.get(args.booking_id);
    if (!booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Not authorized");
    if (booking.status === "cancelled") return booking;

    const hoursToStart =
      (new Date(booking.start_time).getTime() - Date.now()) / 3_600_000;
    let refundStatus: "pending" | "refunded" | "paid" = "pending";
    if (hoursToStart >= 24) refundStatus = "refunded";
    else if (hoursToStart >= 6) refundStatus = "paid";
    await ctx.db.patch(args.booking_id, {
      status: "cancelled",
      payment_status: refundStatus,
      cancellation_reason: args.reason,
    });
    return await ctx.db.get(args.booking_id);
  },
});
