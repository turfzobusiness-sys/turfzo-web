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

export const createPending = mutation({
  args: {
    turf_id: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    total_price: v.number(),
    service_fee: v.number(),
    attendees: v.optional(v.number()),
    notes: v.optional(v.string()),
    pg_order_id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const turf = (await ctx.db.get(args.turf_id as any)) as any;
    if (!turf || !turf.is_available) {
      throw new Error("Turf is no longer available");
    }
    const slotStart = new Date(args.start_time);

    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_turf_id", (q: any) => q.eq("turf_id", args.turf_id))
      .filter((q: any) => q.eq(q.field("start_time"), slotStart.toISOString()))
      .first();

    if (existing && existing.status !== "cancelled") {
      throw new Error("This slot was just booked. Please pick another time.");
    }

    const now = new Date().toISOString();

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
      pg_order_id: args.pg_order_id,
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
