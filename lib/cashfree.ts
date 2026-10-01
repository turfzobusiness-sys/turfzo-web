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
 * How confident we are about a checkout that did NOT resolve.
 *
 *   - "failed"  — we know no money moved (the user dismissed the modal, or
 *                 the gateway reported an explicit cancellation). Safe to
 *                 release the pending booking.
 *   - "unknown" — we could not observe the outcome (client timeout, an
 *                 unexpected SDK/network error). The charge MAY have landed,
 *                 so callers must NOT cancel; the server reconciles.
 *
 * This mirrors the Flutter client's PaymentOutcomeStatus.paid /
 * .failed / .unavailable contract (lib/core/payments/payment_coordinator.dart).
 */
export type CashfreeFailureOutcome = "failed" | "unknown";

/**
 * Rejection type of {@link openCashfreeCheckout}. Callers must branch on
 * `outcome`, never on the message text: a plain `Error` is ambiguous and
 * previously made the caller cancel bookings whose money may have been
 * captured.
 */
export class CashfreeCheckoutError extends Error {
  readonly outcome: CashfreeFailureOutcome;

  constructor(outcome: CashfreeFailureOutcome, message: string, cause?: unknown) {
    super(message);
    this.name = "CashfreeCheckoutError";
    this.outcome = outcome;
    if (cause !== undefined) this.cause = cause;
  }
}

/**
 * True when a gateway error text describes an explicit user cancellation.
 * Anything else (declines aside, which the gateway reports via
 * `result.error` and which are definitive) stays "unknown" — we cannot see
 * the network, so we cannot claim the money never moved.
 */
function isCancellationText(text: string): boolean {
  return /cancel/i.test(text);
}

/**
 * Opens the Cashfree checkout in a modal popup on the current page.
 *
 * Resolves when the user completes the payment inside the modal.
 * Rejects with a {@link CashfreeCheckoutError} otherwise; its `outcome`
 * says whether the failure is definitive.
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
      // UNKNOWN, not failed: the tab may have lost the callback while the
      // charge completed. The backend reconciles within the lock window.
      reject(
        new CashfreeCheckoutError(
          "unknown",
          "The payment window closed before we could confirm the result. Your payment status will be checked — nothing was double-charged.",
        ),
      );
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
            const message =
              result.error.message || "Payment failed or cancelled";
            reject(
              new CashfreeCheckoutError(
                isCancellationText(message) ? "failed" : "unknown",
                isCancellationText(message)
                  ? "Payment was cancelled."
                  : "Payment could not be completed. Please try again.",
              ),
            );
            return;
          }
          if (result.paymentDetails) {
            resolve();
            return;
          }
          // Neither error nor paymentDetails — user dismissed the modal.
          // That is an observable, definitive "no payment".
          reject(
            new CashfreeCheckoutError("failed", "Payment was cancelled."),
          );
        },
      )
      .catch((err: unknown) => {
        clearTimeout(timer);
        // A thrown SDK/network error tells us nothing about whether the
        // charge landed. Classify as unknown and let the server reconcile.
        reject(
          new CashfreeCheckoutError(
            "unknown",
            "Payment could not be completed. Please try again.",
            err,
          ),
        );
      });
  });
}
