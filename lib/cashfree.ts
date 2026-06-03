"use client";

// @ts-expect-error No type declarations available for cashfree-js
import { load } from "@cashfreepayments/cashfree-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cashfreeInstance: any = null;

export async function initializeCashfree() {
  if (cashfreeInstance) return cashfreeInstance;
  
  const isProd = process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === "production" || 
                 (process.env.NEXT_PUBLIC_CASHFREE_APP_ID && !process.env.NEXT_PUBLIC_CASHFREE_APP_ID.includes("test"));
                 
  cashfreeInstance = await load({
    mode: isProd ? "production" : "sandbox",
  });
  
  return cashfreeInstance;
}

export interface OpenCheckoutArgs {
  paymentSessionId: string;
}

export async function openCashfreeCheckout(args: OpenCheckoutArgs): Promise<void> {
  const cashfree = await initializeCashfree();
  
  return new Promise((resolve, reject) => {
    cashfree.checkout({
      paymentSessionId: args.paymentSessionId,
      returnUrl: window.location.href, // Cashfree will redirect back here if redirect is chosen, but we can also use seamless popup if possible.
      // With Cashfree JS, calling checkout opens a modal if redirect is not forced.
      // But we can just use the popup mode.
    }).then((result: { error?: { message?: string }; redirect?: boolean; paymentDetails?: unknown }) => {
      if(result.error){
        reject(new Error(result.error.message || "Payment failed or cancelled"));
      }
      if(result.redirect){
        // This won't happen if we use redirect: "if_required" and popup succeeds
        // But if it does redirect, it will leave the page.
        console.log("Redirection...")
      }
      if(result.paymentDetails){
        console.log("Payment completed via popup");
        resolve();
      }
    }).catch((err: unknown) => reject(err));
  });
}
