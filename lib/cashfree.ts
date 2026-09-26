"use client";

// @ts-expect-error No type declarations available for cashfree-js
import { load } from "@cashfreepayments/cashfree-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cashfreeInstance: any = null;

/**
 * Determines whether Cashfree should run in production or sandbox mode.
 *
 * Priority:
 *   1. Explicit `NEXT_PUBLIC_CASHFREE_ENV` env var ("production" | "sandbox")
 *   2. Fallback: infer from the APP ID (TEST keys contain "test", case-insensitive)
 */
function resolveCashfreeMode(): "production" | "sandbox" {
  const explicit = process.env.NEXT_PUBLIC_CASHFREE_ENV;
  if (explicit === "production" || explicit === "sandbox") {
    return explicit;
  }
  // Fail-closed visibility: without an explicit env var, a live-looking
  // app id silently flipping us into production charges real money.
  // Keep the sandbox default but warn loudly in production builds.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[cashfree] NEXT_PUBLIC_CASHFREE_ENV is unset in production — defaulting to sandbox. Set it explicitly to \"production\" for live charges."
    );
  }
  const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID;
  if (appId && !appId.toLowerCase().includes("test")) {
    return "production";
  }
  return "sandbox";
}

export async function initializeCashfree() {
  if (cashfreeInstance) return cashfreeInstance;

  cashfreeInstance = await load({
    mode: resolveCashfreeMode(),
  });

  return cashfreeInstance;
}

export interface OpenCheckoutArgs {
  paymentSessionId: string;
}

/**
 * Opens the Cashfree checkout in a modal popup on the current page.
 *
 * Resolves when the user completes the payment inside the modal.
 * Rejects with a descriptive Error if the payment fails, the user
 * closes the modal, or an unexpected SDK error occurs.
 *
 * NOTE: Even on resolve, the caller MUST verify the payment server-side
 * via `payments:verifyCashfreePayment` — the frontend result is not
 * a guarantee that funds were captured.
 */
export async function openCashfreeCheckout(
  args: OpenCheckoutArgs & { timeoutMs?: number },
): Promise<void> {
  const cashfree = await initializeCashfree();
  // 6-min client timeout nests inside the 7-min PAYMENT_LOCK_WINDOW_MS so an
  // abandoned tab self-cancels via cancelIfUnpaid before server crons fire.
  const timeoutMs = args.timeoutMs ?? 6 * 60 * 1000;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Payment timed out. Please try again."));
    }, timeoutMs);
    cashfree
      .checkout({
        paymentSessionId: args.paymentSessionId,
        redirectTarget: "_modal",
      })
      .then(
        (result: {
          error?: { message?: string };
          redirect?: boolean;
          paymentDetails?: unknown;
        }) => {
          clearTimeout(timer);
          if (result.error) {
            reject(
              new Error(result.error.message || "Payment failed or cancelled"),
            );
            return;
          }
          if (result.paymentDetails) {
            resolve();
            return;
          }
          // Neither error nor paymentDetails — user dismissed the modal
          reject(new Error("Payment was cancelled."));
        },
      )
      .catch((err: unknown) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error("Checkout error."));
      });
  });
}
