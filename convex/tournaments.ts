import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function requireUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q: any) => q.eq("firebase_uid", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");
  return user._id;
}

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
      .collect();

    const mapped = [];
    for (const t of all) {
      let venueName = "Main Stadium";
      let cityName = "Mumbai";

      if (t.turf_id) {
        const turf = await ctx.db.get(t.turf_id as any);
        if (turf) {
          venueName = turf.name;
          cityName = turf.city;
        }
      }

      const teams = await ctx.db
        .query("tournament_teams")
        .withIndex("by_tournament", (q) => q.eq("tournament_id", t._id))
        .collect();

      mapped.push({
        _id: t._id,
        _creationTime: t._creationTime,
        title: t.name,
        sport: t.sport_type,
        format: t.tournament_type,
        description: t.description,
        start_date: t.start_date,
        end_date: t.end_date,
        venue: venueName,
        city: cityName,
        entry_fee: t.entry_fee,
        prize_pool: t.prize_pool ? `₹${t.prize_pool.toLocaleString()}` : "Trophy",
        max_teams: t.max_participants,
        registered_teams: teams.length,
        status: t.status as any,
        image_url: t.image_url,
        created_at: t.created_at,
      });
    }

    let result = mapped.filter((t) => t.status === "open");

    if (args.city) {
      const lower = args.city.toLowerCase();
      result = result.filter((t) => t.city.toLowerCase() === lower);
    }
    if (args.sport && args.sport !== "all") {
      const lower = args.sport.toLowerCase();
      result = result.filter((t) => t.sport.toLowerCase() === lower);
    }

    return result.sort((a, b) => a.start_date.localeCompare(b.start_date));
  },
});

export const register = mutation({
  args: {
    tournament_id: v.string(),
    team_name: v.string(),
    captain_name: v.string(),
    captain_email: v.string(),
    captain_phone: v.string(),
    entry_fee_paid: v.number(),
    payment_order_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tournament = await ctx.db.get(args.tournament_id as any);
    if (!tournament) throw new Error("Tournament not found");
    if (tournament.status !== "open") throw new Error("Tournament registration is closed");

    const teams = await ctx.db
      .query("tournament_teams")
      .withIndex("by_tournament", (q) => q.eq("tournament_id", args.tournament_id))
      .collect();

    if (teams.length >= tournament.max_participants) {
      throw new Error("Tournament is full");
    }

    // Insert the team
    const teamId = await ctx.db.insert("tournament_teams", {
      tournament_id: args.tournament_id,
      name: args.team_name,
      captain_id: userId,
      status: "confirmed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Register captain as participant
    await ctx.db.insert("tournament_participants", {
      tournament_id: args.tournament_id,
      user_id: userId,
      team_id: teamId,
      registration_type: "captain",
      status: "confirmed",
      registered_at: new Date().toISOString(),
    });

    return {
      _id: teamId,
      team_name: args.team_name,
      registration_code: generateRegistrationCode(),
    };
  },
});
