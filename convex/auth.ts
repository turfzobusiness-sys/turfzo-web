import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCurrentUserId } from "./_helpers";
import { verifyTurnstileToken } from "../lib/turnstile";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const syncFirebaseUser = mutation({
  args: {
    role: v.optional(v.union(v.literal("player"), v.literal("owner"))),
    displayName: v.optional(v.string()),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Verify Turnstile (only for new signups, not for existing-user sync)
    if (args.turnstileToken) {
      const result = await verifyTurnstileToken(args.turnstileToken);
      if (!result.ok) {
        throw new Error(
          `Bot verification failed (${result.errorCodes.join(", ")}). Please try again.`
        );
      }
    }
    const now = new Date().toISOString();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .first();

    if (existing) {
      const updates: Record<string, unknown> = { updated_at: now };
      if (args.displayName && !existing.display_name) {
        updates.display_name = args.displayName;
        updates.full_name = args.displayName;
      }
      if (args.role && !existing.role) {
        updates.role = args.role;
        updates.is_approved = args.role === "player";
      }
      await ctx.db.patch(existing._id, updates);
      return await ctx.db.get(existing._id);
    }

    const identityRecord = identity as {
      subject: string;
      email?: string;
      name?: string;
      phoneNumber?: string;
      picture?: string;
      emailVerified?: boolean;
    };

    const newUser = {
      firebase_uid: identityRecord.subject,
      email: identityRecord.email ?? "",
      full_name: args.displayName ?? identityRecord.name,
      display_name: args.displayName ?? identityRecord.name,
      phone_number: identityRecord.phoneNumber,
      avatar_url: identityRecord.picture,
      role: (args.role ?? "player") as "player" | "owner" | "admin",
      is_email_verified: identityRecord.emailVerified ?? false,
      is_phone_verified: false,
      is_approved: args.role === "player" || !args.role,
      notifications_enabled: true,
      created_at: now,
      updated_at: now,
    };
    const id = await ctx.db.insert("users", newUser);
    return await ctx.db.get(id);
  },
});

export const updateProfile = mutation({
  args: {
    full_name: v.optional(v.string()),
    display_name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    favorite_sports: v.optional(v.array(v.string())),
    notifications_enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(user._id, updates);
    return await ctx.db.get(user._id);
  },
});

// Admin: list all users (for /admin dashboard)
export const listAllUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "admin") throw new Error("Forbidden: admin only");
    return await ctx.db.query("users").order("desc").take(args.limit ?? 100);
  },
});
