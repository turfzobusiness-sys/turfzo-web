import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireUserId } from "./_helpers";

function generateRegistrationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "REG-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const getOpen = query({
  args: {
    city: v.optional(v.string()),
    sport: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("tournaments")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    let result = all;
    if (args.city) {
      const lower = args.city.toLowerCase();
      result = result.filter((t) => t.city.toLowerCase() === lower);
    }
    if (args.sport) result = result.filter((t) => t.sport === args.sport);
    return result.sort((a, b) => a.start_date.localeCompare(b.start_date));
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tournaments").collect();
  },
});

export const getById = query({
  args: { id: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getRegistrations = query({
  args: { tournament_id: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tournament_registrations")
      .withIndex("by_tournament", (q) => q.eq("tournament_id", args.tournament_id))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
  },
});

export const register = mutation({
  args: {
    tournament_id: v.id("tournaments"),
    team_name: v.string(),
    captain_name: v.string(),
    captain_email: v.string(),
    captain_phone: v.string(),
    entry_fee_paid: v.number(),
    payment_order_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tournament = await ctx.db.get(args.tournament_id);
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "open") throw new Error("Tournament registration is closed");
    if (tournament.registered_teams >= tournament.max_teams) {
      throw new Error("Tournament is full");
    }
    const id = await ctx.db.insert("tournament_registrations", {
      tournament_id: args.tournament_id,
      user_id: userId,
      team_name: args.team_name,
      captain_name: args.captain_name,
      captain_email: args.captain_email,
      captain_phone: args.captain_phone,
      entry_fee_paid: args.entry_fee_paid,
      payment_order_id: args.payment_order_id as Id<"payment_orders"> | undefined,
      status: "confirmed",
      registration_code: generateRegistrationCode(),
      created_at: new Date().toISOString(),
    });
    await ctx.db.patch(args.tournament_id, {
      registered_teams: tournament.registered_teams + 1,
    });
    return await ctx.db.get(id);
  },
});
