import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateVenue = mutation({
  args: {
    venueId: v.id("venues"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    price_per_hour: v.optional(v.number()),
    sport_type: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    operating_hours: v.optional(v.object({
      monday: v.optional(v.object({ open: v.string(), close: v.string() })),
      tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      wednesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
      friday: v.optional(v.object({ open: v.string(), close: v.string() })),
      saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
      sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
    })),
    max_players: v.optional(v.number()),
    has_floodlights: v.optional(v.boolean()),
    has_free_parking: v.optional(v.boolean()),
    has_changing_room: v.optional(v.boolean()),
    has_drinking_water: v.optional(v.boolean()),
    has_first_aid: v.optional(v.boolean()),
    is_indoor: v.optional(v.boolean()),
    ground_count: v.optional(v.number()),
    is_available: v.optional(v.boolean()),
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
      throw new Error("Only owners can update venues");
    }

    const venue = await ctx.db.get(args.venueId);
    if (!venue || venue.owner_id !== user._id) {
      throw new Error("Venue not found or not authorized");
    }

    const { venueId, ...updateData } = args;
    await ctx.db.patch(venueId, updateData);
    return await ctx.db.get(venueId);
  },
});

export const deleteVenue = mutation({
  args: { venueId: v.id("venues") },
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
      throw new Error("Only owners can delete venues");
    }

    const venue = await ctx.db.get(args.venueId);
    if (!venue || venue.owner_id !== user._id) {
      throw new Error("Venue not found or not authorized");
    }

    await ctx.db.delete(args.venueId);
    return { success: true };
  },
});

export const getVenue = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.venueId);
  },
});

export const getVenuesByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("venues")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

export const getActiveVenues = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("venues")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});