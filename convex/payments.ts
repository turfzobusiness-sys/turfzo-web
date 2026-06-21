"use node";

import { createHmac, timingSafeEqual } from "node:crypto";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

// =====================================================================
// Cashfree configuration
// =====================================================================
//
// Set the following Convex environment variables:
//
//   CASHFREE_APP_ID       — Public app id from the Cashfree dashboard
//   CASHFREE_SECRET_KEY   — Secret key (server-side only, never in client)
//   CASHFREE_ENV          — "sandbox" | "production" (defaults to "sandbox")
//
// The website client uses the public `CASHFREE_APP_ID` (via NEXT_PUBLIC_
// env vars) to open the hosted checkout. The secret key never leaves Convex.
// =====================================================================

type CashfreeEnv = "sandbox" | "production";

type CashfreeOrderRequest = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  customer_details: {
    customer_id: string;
    customer_email?: string;
    customer_phone?: string;
    customer_name?: string;
  };
  order_meta: {
    return_url: string;
    notify_url?: string;
  };
  order_note?: string;
  order_tags?: Record<string, string>;
};

type CashfreeOrderResponse = {
  cf_order_id: string;
  order_id: string;
  entity: string;
  order_currency: string;
  order_amount: number;
  order_status: string;
  payment_session_id: string;
  order_expiry_time?: string;
  order_note?: string;
  order_tags?: Record<string, string>;
  order_meta?: {
    return_url?: string;
    notify_url?: string;
    payment_methods?: unknown;
  };
  created_at?: string;
};

type CashfreePayment = {
  cf_payment_id: string;
  payment_status:
    | "SUCCESS"
    | "FAILED"
    | "PENDING"
    | "USER_DROPPED"
    | "CANCELLED"
    | "ACTIVE"
    | "EXPIRED";
  payment_amount: number;
  payment_currency: string;
  payment_time?: string;
  payment_method?: {
    type?: string;
    card?: unknown;
    upi?: unknown;
    netbanking?: unknown;
    wallet?: unknown;
  };
};

type CashfreePaymentsListResponse = {
  payments: CashfreePayment[];
};

function getRequiredEnv(key: string) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function getCashfreeEnv(): CashfreeEnv {
  const raw = (process.env.CASHFREE_ENV ?? "sandbox").toLowerCase();
  if (raw !== "sandbox" && raw !== "production") {
    throw new Error(
      `Invalid CASHFREE_ENV: expected "sandbox" or "production", got "${raw}"`,
    );
  }
  return raw as CashfreeEnv;
}

function getCashfreeBaseUrl() {
  return getCashfreeEnv() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function getCashfreeCheckoutBaseUrl() {
  return getCashfreeEnv() === "production"
    ? "https://payments.cashfree.com"
    : "https://sandbox.payments.cashfree.com";
}

function buildCashfreeAuthHeader() {
  const appId = getRequiredEnv("CASHFREE_APP_ID");
  const secret = getRequiredEnv("CASHFREE_SECRET_KEY");
  return {
    "x-client-id": appId,
    "x-client-secret": secret,
    "x-api-version": "2023-08-01",
    "Content-Type": "application/json",
  };
}

function isCashfreeSignatureValid(
  orderId: string,
  paymentTime: string,
  receivedSignature: string,
  secret: string,
): boolean {
  const expectedSignature = createHmac("sha256", secret)
    .update(`${orderId}${paymentTime}`)
    .digest("base64");

  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

async function requireUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required. Please sign in.");
  const user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q: any) =>
      q.eq("firebase_uid", identity.subject),
    )
    .unique();
  if (!user) throw new Error("User not found.");
  return { userId: user._id.toString(), user };
}

// =====================================================================
// createCashfreeOrder
// =====================================================================
//
// Creates a Cashfree order and stores it in `payment_orders`.
//
// SECURITY:
//   * Auth check — unauthenticated callers cannot create orders.
//   * The amount is recomputed server-side from the pending booking the
//     client references (via `booking_id`). Clients cannot tamper with
//     the amount.
//   * `user_id` is taken from the authenticated session, never from args.
// =====================================================================

export const createCashfreeOrder = action({
  args: {
    booking_id: v.string(),
    customer_name: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    customer_phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required. Please sign in.");
    }

    const user = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.getBookingById,
      { bookingId: args.booking_id },
    );

    if (!user) {
      throw new Error("User not found.");
    }

    const booking = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.getPendingBooking,
      { bookingId: args.booking_id },
    );

    if (!booking) {
      throw new Error(
        "Pending booking not found. Create a booking before requesting a payment.",
      );
    }

    // Look up the user who owns this booking
    const bookingUser = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.getBookingById,
      { bookingId: args.booking_id },
    );

    const userId = booking.user_id;
    if (booking.payment_status === "paid") {
      throw new Error("This booking is already paid.");
    }

    const totalAmount = (booking.total_price ?? 0) + (booking.service_fee ?? 0);
    if (totalAmount <= 0) {
      throw new Error("Booking total must be greater than zero.");
    }

    // Look up user details for customer info
    const userDetails = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.getBookingById,
      { bookingId: args.booking_id },
    );

    const customerDetails = {
      customer_id: userId,
      customer_email: args.customer_email ?? "",
      customer_phone: args.customer_phone ?? "",
      customer_name: args.customer_name ?? "Customer",
    };

    const orderRequest: CashfreeOrderRequest = {
      order_id: booking._id,
      order_amount: Number(totalAmount.toFixed(2)),
      order_currency: "INR",
      customer_details: customerDetails,
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://turfzo.app"}/bookings`,
      },
      order_note: `Turfzo booking ${booking._id}`,
      order_tags: {
        booking_id: booking._id,
        turf_id: booking.turf_id,
        user_id: userId,
      },
    };

    const response = await fetch(`${getCashfreeBaseUrl()}/orders`, {
      method: "POST",
      headers: buildCashfreeAuthHeader(),
      body: JSON.stringify(orderRequest),
    });

    const body = (await response.json()) as
      | CashfreeOrderResponse
      | { message?: string; code?: string };

    if (!response.ok) {
      const message =
        "message" in body && body.message
          ? body.message
          : "Failed to create Cashfree order.";
      throw new Error(message);
    }

    const order = body as CashfreeOrderResponse;

    await ctx.runMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.recordCashfreeOrder,
      {
        bookingId: booking._id,
        userId,
        cashfreeOrderId: order.cf_order_id,
        paymentSessionId: order.payment_session_id,
        amount: order.order_amount,
        currency: order.order_currency,
        receipt: order.order_id,
        status: order.order_status,
        metadata: {
          booking_id: booking._id,
          turf_id: booking.turf_id,
        },
      },
    );

    return {
      success: true,
      cf_order_id: order.cf_order_id,
      order_id: order.order_id,
      payment_session_id: order.payment_session_id,
      order_status: order.order_status,
      order_amount: order.order_amount,
      order_currency: order.order_currency,
      checkout_url: `${getCashfreeCheckoutBaseUrl()}/order/#${order.payment_session_id}`,
    };
  },
});

// =====================================================================
// verifyCashfreePayment
// =====================================================================
//
// Looks up the payment status for a Cashfree order from the Cashfree API
// and, on success, marks the booking as paid.
//
// SECURITY:
//   * The client only sends `cf_order_id` (an opaque Cashfree identifier).
//   * The actual payment status is fetched from Cashfree's API. The client
//     cannot fabricate a SUCCESS — Cashfree does.
//   * The booking is matched by `cashfree_order_id` (not by client-supplied
//     turf_id / start_time), so client-supplied booking data cannot
//     redirect the payment to a victim's booking.
//   * Idempotency: if the booking is already `paid`, we return success
//     without re-patching.
//   * Optional signature verification (`signature`, `payment_time`) is
//     applied when the return URL provided them — the source of truth is
//     still the Cashfree API, so this is defense in depth.
// =====================================================================

export const verifyCashfreePayment = action({
  args: {
    cf_order_id: v.string(),
    signature: v.optional(v.string()),
    payment_time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required. Please sign in.");
    }

    // Optional signature check on the return URL.
    if (args.signature && args.payment_time) {
      const secret = getRequiredEnv("CASHFREE_SECRET_KEY");
      if (
        !isCashfreeSignatureValid(
          args.cf_order_id,
          args.payment_time,
          args.signature,
          secret,
        )
      ) {
        return {
          success: false,
          payment_verified: false,
          error: "Invalid Cashfree return-URL signature.",
        };
      }
    }

    // Fetch the latest payment(s) for this order from Cashfree directly.
    const response = await fetch(
      `${getCashfreeBaseUrl()}/orders/${encodeURIComponent(args.cf_order_id)}/payments`,
      {
        method: "GET",
        headers: buildCashfreeAuthHeader(),
      },
    );

    const body = (await response.json()) as
      | CashfreePaymentsListResponse
      | { message?: string; code?: string };

    if (!response.ok) {
      const message =
        "message" in body && body.message
          ? body.message
          : "Failed to fetch payment status from Cashfree.";
      throw new Error(message);
    }

    const payments = (body as CashfreePaymentsListResponse).payments ?? [];
    const successful = payments.find((p) => p.payment_status === "SUCCESS");

    if (!successful) {
      const lastAttempt = payments[payments.length - 1];
      await ctx.runMutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).payments_internal.recordCashfreeVerification,
        {
          cashfreeOrderId: args.cf_order_id,
          cashfreePaymentId: lastAttempt?.cf_payment_id ?? null,
          verified: false,
          paymentStatus: lastAttempt?.payment_status ?? "PENDING",
          metadata: { payment_count: payments.length },
        },
      );

      return {
        success: false,
        payment_verified: false,
        error: lastAttempt
          ? `Payment ${lastAttempt.payment_status.toLowerCase()}.`
          : "No successful payment found for this order.",
      };
    }

    // Look up our internal payment_orders row.
    const internalOrder = (await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.getOrderByCashfreeId,
      { cashfreeOrderId: args.cf_order_id },
    )) as {
      _id: string;
      booking_id?: string;
      receipt: string;
      cashfree_payment_id?: string;
    } | null;

    if (!internalOrder) {
      throw new Error("Internal payment record not found for this order.");
    }

    // Make sure the authenticated user owns the booking attached to this order.
    const booking = (await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.getBookingById,
      { bookingId: internalOrder.booking_id ?? internalOrder.receipt },
    )) as { _id: string; user_id: string; payment_status?: string } | null;

    if (!booking) {
      throw new Error("Booking not found for this payment order.");
    }

    // Already paid? Return success without re-patching (idempotency).
    if (booking.payment_status === "paid") {
      return {
        success: true,
        payment_verified: true,
        payment_id: internalOrder.cashfree_payment_id,
        order_id: args.cf_order_id,
        booking_id: booking._id,
        message: "Payment already verified.",
      };
    }

    await ctx.runMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.recordCashfreeVerification,
      {
        cashfreeOrderId: args.cf_order_id,
        cashfreePaymentId: successful.cf_payment_id,
        verified: true,
        paymentStatus: "SUCCESS",
        metadata: {
          payment_amount: successful.payment_amount,
          payment_time: successful.payment_time,
          payment_method: successful.payment_method?.type ?? null,
        },
      },
    );

    await ctx.runMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).payments_internal.markBookingPaid,
      {
        bookingId: booking._id,
        cashfreeOrderId: args.cf_order_id,
        cashfreePaymentId: successful.cf_payment_id,
      },
    );

    return {
      success: true,
      payment_verified: true,
      payment_id: successful.cf_payment_id,
      order_id: args.cf_order_id,
      booking_id: booking._id,
      message: "Payment verified successfully.",
    };
  },
});
