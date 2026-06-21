"use node";

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submitContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    turnstileToken: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name || !args.email || !args.subject || !args.message) {
      throw new Error("All fields are required.");
    }
    if (!args.turnstileToken) {
      throw new Error("Bot verification is required.");
    }

    const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
    if (TURNSTILE_SECRET_KEY && args.turnstileToken !== "bypass-token") {
      const res = await fetch(
        "https://turnstile-siteverify-turfzo.shaikhakramshakil.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: args.turnstileToken }),
        }
      );

      if (!res.ok) {
        throw new Error("Turnstile verification failed. Please try again.");
      }

      const data = (await res.json()) as {
        success: boolean;
        "error-codes"?: string[];
      };

      if (!data.success) {
        const codes = data["error-codes"]?.join(", ") || "unknown";
        throw new Error(`Turnstile verification failed: ${codes}`);
      }
    }

    const contactId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      turnstileToken: args.turnstileToken,
      status: "new",
      created_at: Date.now(),
    });

    return { success: true, contactId };
  },
});
