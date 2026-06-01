"use client";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: RazorpayResponse) => void;
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";
const BRAND_COLOR = "#9FE870";

let scriptLoadPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve) => {
    const existing = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

export interface OpenCheckoutArgs {
  orderId: string;
  amountInPaise: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
}

export async function openRazorpayCheckout(args: OpenCheckoutArgs): Promise<RazorpayResponse> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Razorpay checkout failed to load. Check your network connection.");
  }
  return new Promise((resolve, reject) => {
    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock",
      amount: args.amountInPaise,
      currency: "INR",
      name: "Turfzo",
      description: args.description,
      order_id: args.orderId,
      prefill: {
        name: args.customerName,
        email: args.customerEmail,
        contact: args.customerPhone,
      },
      notes: args.notes,
      theme: { color: BRAND_COLOR },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled by user")),
      },
    };
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }
    const instance = new window.Razorpay(options);
    instance.open();
  });
}
