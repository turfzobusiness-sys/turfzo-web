import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateTurf = mutation({
  args: {
    turfId: v.id("turfs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    price_per_hour: v.optional(v.number()),
    sport_type: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    operating_hours: v.optional(v.any()),
    max_players: v.optional(v.number()),
    has_floodlights: v.optional(v.boolean()),
    has_free_parking: v.optional(v.boolean()),
    has_changing_room: v.optional(v.boolean()),
    has_drinking_water: v.optional(v.boolean()),
    has_first_aid: v.optional(v.boolean()),
    is_indoor: v.optional(v.boolean()),
    ground_count: v.optional(v.number()),
    is_available: v.optional(v.boolean()),
    image_url: v.optional(v.string()),
    image_gallery: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user || user.role !== "owner") {
      throw new Error("Only owners can update turfs");
    }

    const turf = await ctx.db.get(args.turfId);
    if (!turf || turf.user_id !== user._id) {
      throw new Error("Turf not found or not authorized");
    }

    const { turfId, ...updateData } = args;
    await ctx.db.patch(turfId, {
      ...updateData,
      updated_at: new Date().toISOString(),
    });
    return await ctx.db.get(turfId);
  },
});

export const deleteTurf = mutation({
  args: { turfId: v.id("turfs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user || user.role !== "owner") {
      throw new Error("Only owners can delete turfs");
    }

    const turf = await ctx.db.get(args.turfId);
    if (!turf || turf.user_id !== user._id) {
      throw new Error("Turf not found or not authorized");
    }

    await ctx.db.delete(args.turfId);
    return { success: true };
  },
});

export const getTurf = query({
  args: { turfId: v.id("turfs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.turfId);
  },
});

export const getTurfsByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("turfs")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.or(q.eq(q.field("status"), "active"), q.eq(q.field("status"), "approved")))
      .collect();
  },
});

export const getActiveTurfs = query({
  handler: async (ctx) => {
    const active = await ctx.db
      .query("turfs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const approved = await ctx.db
      .query("turfs")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    return [...active, ...approved];
  },
});
