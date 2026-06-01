"use node";

import { action, httpAction } from "./_generated/server";
import { v } from "convex/values";
import { httpRouter } from "convex/server";
import crypto from "node:crypto";
import { getRazorpayCredentials, isRazorpayConfigured } from "../lib/env";

const RAZORPAY_KEY_ID = () => getRazorpayCredentials().keyId;
const RAZORPAY_KEY_SECRET = () => getRazorpayCredentials().keySecret;

export const createRazorpayOrder = action({
  args: {
    amount: v.number(),
    currency: v.optional(v.string()),
    receipt: v.string(),
    client_request_id: v.string(),
    type: v.union(v.literal("turf_booking"), v.literal("tournament_registration")),
    booking_id: v.optional(v.id("bookings")),
    tournament_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Invalid amount");
    }
    if (args.amount > 1_00_00_000) {
      throw new Error("Amount exceeds maximum allowed (₹10 lakh)");
    }

    // Idempotency: if a payment_order with the same (user_id, client_request_id) exists,
    // return its existing order ID rather than creating a new one.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("payment_orders")
      .withIndex("by_idempotency", (q) =>
        q.eq("user_id", user._id).eq("client_request_id", args.client_request_id)
      )
      .first();
    if (existing) {
      return {
        id: existing.razorpay_order_id,
        amount: existing.amount,
        currency: existing.currency,
        receipt: existing.receipt,
        key_id: isRazorpayConfigured() ? RAZORPAY_KEY_ID() : "rzp_test_mock",
        idempotent_replay: true,
      };
    }

    if (!isRazorpayConfigured()) {
      // Mock mode for dev — but logged loudly so it's obvious in console.
      console.warn(
        "[payments] RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not set. " +
          "Serving MOCK order. Set env vars in production."
      );
      const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const orderId = await ctx.db.insert("payment_orders", {
        user_id: user._id,
        booking_id: args.booking_id,
        tournament_id: args.tournament_id,
        razorpay_order_id: mockOrderId,
        client_request_id: args.client_request_id,
        type: args.type,
        amount: args.amount,
        currency: args.currency ?? "INR",
        receipt: args.receipt,
        status: "created",
        source: "client",
        created_at: new Date().toISOString(),
      });
      return {
        id: mockOrderId,
        amount: args.amount,
        currency: args.currency ?? "INR",
        receipt: args.receipt,
        key_id: "rzp_test_mock",
        _id: orderId,
        mock: true,
      };
    }

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${RAZORPAY_KEY_ID()}:${RAZORPAY_KEY_SECRET()}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify({
        amount: args.amount,
        currency: args.currency ?? "INR",
        receipt: args.receipt,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Razorpay order creation failed: ${text}`);
    }
    const order = await res.json();
    await ctx.db.insert("payment_orders", {
      user_id: user._id,
      booking_id: args.booking_id,
      tournament_id: args.tournament_id,
      razorpay_order_id: order.id,
      client_request_id: args.client_request_id,
      type: args.type,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
      source: "client",
      created_at: new Date().toISOString(),
    });
    return { ...order, key_id: RAZORPAY_KEY_ID() };
  },
});

export const verifyRazorpayPayment = action({
  args: {
    order_id: v.string(),
    payment_id: v.string(),
    signature: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!isRazorpayConfigured()) {
      return { verified: true, mock: true };
    }
    const expected = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET())
      .update(`${args.order_id}|${args.payment_id}`)
      .digest("hex");
    const verified = expected === args.signature;
    if (!verified) throw new Error("Invalid payment signature");
    return { verified: true };
  },
});

export const getRazorpayConfig = action({
  args: {},
  handler: async () => {
    return {
      key_id: isRazorpayConfigured() ? RAZORPAY_KEY_ID() : "rzp_test_mock",
      configured: isRazorpayConfigured(),
    };
  },
});

// HTTP webhook handler — called by Razorpay's webhook delivery (NOT by client).
// Verifies the X-Razorpay-Signature header and updates the booking status.
// This is the source of truth for payment confirmation, not the client callback.
export const razorpayWebhook = httpAction(async (ctx, req) => {
  if (!isRazorpayConfigured()) {
    return new Response("Razorpay not configured", { status: 503 });
  }
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }
  const body = await req.text();
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET())
    .update(body)
    .digest("hex");
  if (expected !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }
  const event = JSON.parse(body) as {
    event: string;
    payload: {
      payment?: {
        entity: {
          id: string;
          order_id: string;
          amount: number;
          status: string;
        };
      };
    };
  };

  if (event.event === "payment.captured" || event.event === "payment.authorized") {
    const payment = event.payload.payment?.entity;
    if (!payment) return new Response("No payment entity", { status: 400 });

    const order = await ctx.db
      .query("payment_orders")
      .withIndex(
        "by_order_id",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q: any) => q.eq("razorpay_order_id", payment.order_id)
      )
      .first();
    if (!order) {
      console.warn(`[webhook] Unknown order: ${payment.order_id}`);
      return new Response("Unknown order", { status: 404 });
    }
    if (order.status === "paid") {
      return new Response("OK (already processed)", { status: 200 });
    }

    await ctx.db.patch(order._id, {
      status: "paid",
      razorpay_payment_id: payment.id,
      razorpay_signature: signature,
      source: "webhook",
      paid_at: new Date().toISOString(),
    });

    if (order.booking_id) {
      const booking = await ctx.db.get(order.booking_id);
      if (booking && booking.status !== "confirmed") {
        await ctx.db.patch(order.booking_id, {
          status: "confirmed",
          payment_status: "paid",
          razorpay_payment_id: payment.id,
        });
      }
    }
    return new Response("OK", { status: 200 });
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment?.entity;
    if (!payment) return new Response("OK", { status: 200 });
    const order = await ctx.db
      .query("payment_orders")
      .withIndex(
        "by_order_id",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q: any) => q.eq("razorpay_order_id", payment.order_id)
      )
      .first();
    if (order && order.status !== "paid") {
      await ctx.db.patch(order._id, { status: "failed" });
    }
    return new Response("OK", { status: 200 });
  }

  return new Response("Event ignored", { status: 200 });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const http = httpRouter() as { route: (config: { path: string; method: string; handler: any }) => void };
http.route({
  path: "/razorpay/webhook",
  method: "POST",
  handler: razorpayWebhook,
});
export default http;
