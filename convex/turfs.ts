import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAvailable = query({
  args: {
    city: v.optional(v.string()),
    sport_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("turfs")
      .withIndex("by_available", (q) => q.eq("is_available", true))
      .collect();
    let result = all;
    if (args.city) {
      const lower = args.city.toLowerCase();
      result = result.filter((t) => t.city.toLowerCase() === lower);
    }
    if (args.sport_type) {
      result = result.filter((t) => t.sport_type === args.sport_type);
    }
    return result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  },
});

export const getById = query({
  args: { id: v.id("turfs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("turfs")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("is_available"), true))
      .collect();
  },
});

export const getAvailableSlots = query({
  args: {
    turf_id: v.id("turfs"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const turf = await ctx.db.get(args.turf_id);
    if (!turf) return [];

    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_turf_id", (q) => q.eq("turf_id", args.turf_id))
      .filter((q) =>
        q.and(
          q.gte(q.field("start_time"), startOfDay.toISOString()),
          q.lte(q.field("start_time"), endOfDay.toISOString()),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    const openHour = turf.operating_hours?.open ?? "06:00";
    const closeHour = turf.operating_hours?.close ?? "23:00";
    const [openH] = openHour.split(":").map(Number);
    const [closeH] = closeHour.split(":").map(Number);

    const slots: { time: string; available: boolean }[] = [];
    for (let h = openH; h < closeH; h++) {
      const slotStart = new Date(startOfDay);
      slotStart.setHours(h, 0, 0, 0);
      const isBooked = bookings.some((b) => {
        const bStart = new Date(b.start_time);
        return bStart.getTime() === slotStart.getTime();
      });
      slots.push({
        time: `${String(h).padStart(2, "0")}:00 - ${String(h + 1).padStart(2, "0")}:00`,
        available: !isBooked,
      });
    }
    return slots;
  },
});
