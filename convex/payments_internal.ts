import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getPendingBooking = internalQuery({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId as Id<"bookings">);
  },
});

export const getBookingById = internalQuery({
  args: { bookingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId as Id<"bookings">);
  },
});

export const getOrderByCashfreeId = internalQuery({
  args: { cashfreeOrderId: v.string() },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("payment_orders")
      .withIndex("by_cashfree_order_id", (q) =>
        q.eq("cashfree_order_id", args.cashfreeOrderId),
      )
      .take(1);
    return matches[0] ?? null;
  },
});

export const recordCashfreeOrder = internalMutation({
  args: {
    bookingId: v.string(),
    userId: v.string(),
    cashfreeOrderId: v.string(),
    paymentSessionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    receipt: v.string(),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    await ctx.db.insert("payment_orders", {
      user_id: args.userId,
      booking_id: args.bookingId,
      cashfree_order_id: args.cashfreeOrderId,
      cashfree_payment_session_id: args.paymentSessionId,
      amount: args.amount,
      currency: args.currency,
      receipt: args.receipt,
      status: args.status,
      payment_status: "pending",
      metadata: args.metadata,
      created_at: now,
      updated_at: now,
    });
  },
});

export const recordCashfreeVerification = internalMutation({
  args: {
    cashfreeOrderId: v.string(),
    cashfreePaymentId: v.union(v.string(), v.null()),
    verified: v.boolean(),
    paymentStatus: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const matchingOrders = await ctx.db
      .query("payment_orders")
      .withIndex("by_cashfree_order_id", (q) =>
        q.eq("cashfree_order_id", args.cashfreeOrderId),
      )
      .take(1);

    if (matchingOrders.length === 0) return;

    const order = matchingOrders[0];
    const now = new Date().toISOString();
    await ctx.db.patch(order._id, {
      cashfree_payment_id: args.cashfreePaymentId ?? undefined,
      verified: args.verified,
      status: args.verified ? "paid" : "failed",
      payment_status: args.paymentStatus,
      metadata: args.metadata ?? order.metadata,
      updated_at: now,
    });
  },
});

export const markBookingPaid = internalMutation({
  args: {
    bookingId: v.string(),
    cashfreeOrderId: v.string(),
    cashfreePaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId as Id<"bookings">);
    if (!booking) return;

    const now = new Date().toISOString();
    await ctx.db.patch(booking._id, {
      status: "confirmed",
      payment_status: "paid",
      pg_order_id: args.cashfreeOrderId,
      pg_payment_id: args.cashfreePaymentId,
      updated_at: now,
    });
  },
});
