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
  args: OpenCheckoutArgs,
): Promise<void> {
  const cashfree = await initializeCashfree();

  return new Promise((resolve, reject) => {
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
        reject(err instanceof Error ? err : new Error("Checkout error."));
      });
  });
}
