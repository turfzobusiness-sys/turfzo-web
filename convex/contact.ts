import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_helpers";
import { verifyTurnstileToken } from "../lib/turnstile";

// In-memory rate limit using a `rate_limits` table. This is per-deployment
// (good enough for MVP). For production scale, use a dedicated edge service.
const RATE_LIMITS = {
  contact_form: { max: 3, windowMs: 60 * 60 * 1000 }, // 3/hour
  booking_create: { max: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
};

async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  max: number,
  windowMs: number
) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const existing = await ctx.db
    .query("rate_limits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();
  if (existing && existing.window_start > windowStart) {
    if (existing.count >= max) {
      throw new Error(
        `Too many requests. Please try again in a few minutes.`
      );
    }
    await ctx.db.patch(existing._id, { count: existing.count + 1 });
  } else {
    if (existing) {
      await ctx.db.patch(existing._id, { count: 1, window_start: now });
    } else {
      await ctx.db.insert("rate_limits", {
        key,
        count: 1,
        window_start: now,
      });
    }
  }
}

export const submitContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify Turnstile bot-protection token first.
    if (args.turnstileToken) {
      const result = await verifyTurnstileToken(args.turnstileToken);
      if (!result.ok) {
        throw new Error(
          `Bot verification failed (${result.errorCodes.join(", ")}). Please try again.`
        );
      }
    }

    // Validate inputs
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();
    if (name.length < 2 || name.length > 100) {
      throw new Error("Name must be 2-100 characters");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }
    if (message.length < 10 || message.length > 5000) {
      throw new Error("Message must be 10-5000 characters");
    }
    if (args.subject && args.subject.length > 200) {
      throw new Error("Subject must be under 200 characters");
    }

    const identity = await ctx.auth.getUserIdentity();
    const rateKey = identity
      ? `contact:${identity.subject}`
      : `contact:anon:${email}`;
    await checkRateLimit(
      ctx,
      rateKey,
      RATE_LIMITS.contact_form.max,
      RATE_LIMITS.contact_form.windowMs
    );

    const id = await ctx.db.insert("contact_messages", {
      name,
      email,
      subject: args.subject?.trim(),
      message,
      status: "new",
      user_id: identity?.subject,
      created_at: new Date().toISOString(),
    });
    return { ok: true, id };
  },
});

export const listContactMessages = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await ctx.db
      .query("contact_messages")
      .order("desc")
      .take(args.limit ?? 100);
  },
});

export const markMessageRead = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    await ctx.db.patch(args.id, { status: "read" });
  },
});
