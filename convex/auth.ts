import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const syncFirebaseUser = mutation({
  args: {
    role: v.optional(v.union(v.literal("player"), v.literal("owner"), v.literal("admin"))),
    displayName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const token = identity.token as any;
    const firebaseUid = identity.subject;
    const email = token?.email || "";
    const emailVerified = token?.email_verified || false;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", firebaseUid))
      .unique();

    const now = new Date().toISOString();

    if (existingUser) {
      const targetRole = args.role || existingUser.role;
      await ctx.db.patch(existingUser._id, {
        role: targetRole,
        display_name: args.displayName || existingUser.display_name,
        phone_number: args.phoneNumber || existingUser.phone_number,
        city: args.city || existingUser.city,
        is_email_verified: emailVerified,
        updated_at: now,
      });

      if (targetRole === "owner") {
        const existingProfile = await ctx.db
          .query("ownerProfiles")
          .withIndex("by_user_id", (q) => q.eq("user_id", existingUser._id))
          .unique();
        if (!existingProfile) {
          await ctx.db.insert("ownerProfiles", {
            user_id: existingUser._id,
            business_name: "",
            phone_number: args.phoneNumber || existingUser.phone_number || "",
            gst_number: "",
            pan_number: "",
            address: "",
            city: args.city || existingUser.city || "",
            state: "",
            zip_code: "",
            onboarding_step: 1,
            onboarding_completed: false,
          });
        }
      }

      const updatedUser = await ctx.db.get(existingUser._id);
      return { success: true, user: updatedUser, session_token: "" };
    }

    const targetRole = args.role ?? "player";
    const newUser = await ctx.db.insert("users", {
      email,
      full_name: args.displayName || "",
      display_name: args.displayName || "",
      phone_number: args.phoneNumber || "",
      avatar_url: token?.picture || "",
      role: targetRole,
      city: args.city || "",
      state: "",
      is_email_verified: emailVerified,
      is_phone_verified: false,
      is_approved: targetRole === "player",
      firebase_uid: firebaseUid,
      favorite_sports: [],
      notifications_enabled: true,
      created_at: now,
      updated_at: now,
    });

    if (targetRole === "owner") {
      await ctx.db.insert("ownerProfiles", {
        user_id: newUser,
        business_name: "",
        phone_number: args.phoneNumber || "",
        gst_number: "",
        pan_number: "",
        address: "",
        city: args.city || "",
        state: "",
        zip_code: "",
        onboarding_step: 1,
        onboarding_completed: false,
      });
    }

    const userDoc = await ctx.db.get(newUser);
    return { success: true, user: userDoc, session_token: "" };
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    return user || null;
  },
});

export const updateUserProfile = mutation({
  args: {
    full_name: v.optional(v.string()),
    display_name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    favorite_sports: v.optional(v.array(v.string())),
    notifications_enabled: v.optional(v.boolean()),
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

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...args,
      updated_at: new Date().toISOString(),
    });

    return await ctx.db.get(user._id);
  },
});

export const getOwnerProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user || user.role !== "owner") {
      return null;
    }

    const profile = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .unique();

    const payout = await ctx.db
      .query("payoutDetails")
      .withIndex("by_owner_id", (q) => q.eq("owner_id", user._id))
      .unique();

    return { user, profile, payout };
  },
});

export const updateOwnerProfile = mutation({
  args: {
    business_name: v.optional(v.string()),
    gst_number: v.optional(v.string()),
    pan_number: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    onboarding_step: v.optional(v.number()),
    onboarding_completed: v.optional(v.boolean()),
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
      throw new Error("Not authorized");
    }

    const profile = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .unique();

    if (!profile) {
      throw new Error("Owner profile not found");
    }

    const updateData: any = { ...args };
    if (args.onboarding_completed) {
      updateData.onboarding_completed_at = Date.now();
    }

    await ctx.db.patch(profile._id, updateData);
    return await ctx.db.get(profile._id);
  },
});

export const createVenue = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    price_per_hour: v.number(),
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
      throw new Error("Only owners can create venues");
    }

    const venue = await ctx.db.insert("venues", {
      owner_id: user._id,
      name: args.name,
      description: args.description || "",
      address: args.address,
      city: args.city,
      state: args.state || "",
      zip_code: args.zip_code || "",
      price_per_hour: args.price_per_hour,
      image_url: "",
      image_gallery: [],
      is_available: true,
      sport_type: args.sport_type || "",
      amenities: args.amenities || [],
      rating: 0,
      review_count: 0,
      tier: "standard",
      format: "",
      location_name: "",
      latitude: 0,
      longitude: 0,
      operating_hours: args.operating_hours || {},
      max_players: args.max_players || 22,
      has_floodlights: args.has_floodlights || false,
      has_free_parking: args.has_free_parking || false,
      has_changing_room: args.has_changing_room || false,
      has_drinking_water: args.has_drinking_water || false,
      has_first_aid: args.has_first_aid || false,
      is_indoor: args.is_indoor || false,
      ground_count: args.ground_count || 1,
      status: "pending",
    });

    await ctx.db.patch(user._id, { updated_at: new Date().toISOString() });

    return venue;
  },
});

export const getOwnerVenues = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user || user.role !== "owner") {
      return [];
    }

    return await ctx.db
      .query("venues")
      .withIndex("by_owner_id", (q) => q.eq("owner_id", user._id))
      .collect();
  },
});

export const updatePayoutDetails = mutation({
  args: {
    bank_account_holder_name: v.string(),
    bank_account_number: v.string(),
    bank_ifsc_code: v.string(),
    bank_name: v.string(),
    bank_branch: v.optional(v.string()),
    upi_id: v.optional(v.string()),
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
      throw new Error("Only owners can update payout details");
    }

    const existing = await ctx.db
      .query("payoutDetails")
      .withIndex("by_owner_id", (q) => q.eq("owner_id", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        is_verified: false,
      });
      return await ctx.db.get(existing._id);
    }

    const payout = await ctx.db.insert("payoutDetails", {
      owner_id: user._id,
      ...args,
      is_verified: false,
    });

    return await ctx.db.get(payout);
  },
});

export const getPayoutDetails = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user || user.role !== "owner") {
      return null;
    }

    return await ctx.db
      .query("payoutDetails")
      .withIndex("by_owner_id", (q) => q.eq("owner_id", user._id))
      .unique();
  },
});

export const completeOnboardingStep = mutation({
  args: {
    step: v.number(),
    businessProfile: v.optional(v.object({
      business_name: v.string(),
      phone_number: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zip_code: v.optional(v.string()),
      gst_number: v.optional(v.string()),
      pan_number: v.optional(v.string()),
    })),
    venueDraft: v.optional(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      address: v.string(),
      city: v.string(),
      state: v.optional(v.string()),
      zip_code: v.optional(v.string()),
      price_per_hour: v.number(),
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
    })),
    payoutDetails: v.optional(v.object({
      bank_account_holder_name: v.string(),
      bank_account_number: v.string(),
      bank_ifsc_code: v.string(),
      bank_name: v.string(),
      bank_branch: v.optional(v.string()),
      upi_id: v.optional(v.string()),
    })),
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
      throw new Error("Not authorized");
    }

    const profile = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .unique();

    if (!profile) {
      throw new Error("Owner profile not found");
    }

    if (args.step === 1 && args.businessProfile) {
      await ctx.db.patch(profile._id, {
        ...args.businessProfile,
        onboarding_step: Math.max(profile.onboarding_step, 2),
      });
    } else if (args.step === 2 && args.venueDraft) {
      await ctx.db.patch(profile._id, {
        venue_draft: args.venueDraft,
        onboarding_step: Math.max(profile.onboarding_step, 3),
      });
    } else if (args.step === 3 && args.payoutDetails) {
      const existingPayout = await ctx.db
        .query("payoutDetails")
        .withIndex("by_owner_id", (q) => q.eq("owner_id", user._id))
        .unique();

      if (existingPayout) {
        await ctx.db.patch(existingPayout._id, {
          ...args.payoutDetails,
          is_verified: false,
        });
      } else {
        await ctx.db.insert("payoutDetails", {
          owner_id: user._id,
          ...args.payoutDetails,
          is_verified: false,
        });
      }

      await ctx.db.patch(profile._id, {
        onboarding_step: Math.max(profile.onboarding_step, 4),
      });
    }

    return { success: true };
  },
});

export const submitOnboarding = mutation({
  args: {
    agreementAccepted: v.boolean(),
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
      throw new Error("Not authorized");
    }

    const profile = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .unique();

    if (!profile) {
      throw new Error("Owner profile not found");
    }

    if (!profile.venue_draft) {
      throw new Error("No venue draft found to submit");
    }

    if (!args.agreementAccepted) {
      throw new Error("Must accept partner agreement");
    }

    const draft = profile.venue_draft;

    const venueId = await ctx.db.insert("venues", {
      owner_id: user._id,
      name: draft.name || "My Venue",
      description: draft.description || "",
      address: draft.address || "",
      city: draft.city || "",
      state: draft.state || "",
      zip_code: draft.zip_code || "",
      price_per_hour: draft.price_per_hour || 0,
      image_url: "",
      image_gallery: [],
      is_available: true,
      sport_type: draft.sport_type || "",
      amenities: draft.amenities || [],
      rating: 0,
      review_count: 0,
      tier: "standard",
      format: "",
      location_name: "",
      latitude: 0,
      longitude: 0,
      operating_hours: draft.operating_hours || {},
      max_players: draft.max_players || 22,
      has_floodlights: draft.has_floodlights || false,
      has_free_parking: draft.has_free_parking || false,
      has_changing_room: draft.has_changing_room || false,
      has_drinking_water: draft.has_drinking_water || false,
      has_first_aid: draft.has_first_aid || false,
      is_indoor: draft.is_indoor || false,
      ground_count: draft.ground_count || 1,
      status: "pending",
    });

    await ctx.db.patch(profile._id, {
      onboarding_completed: true,
      onboarding_completed_at: Date.now(),
      agreement_accepted: true,
      agreement_accepted_at: Date.now(),
      venue_draft: undefined,
    });

    await ctx.db.insert("notifications", {
      user_id: user._id,
      title: "Onboarding Application Submitted",
      body: `Your venue "${draft.name || "My Venue"}" onboarding application has been submitted and is pending admin approval.`,
      type: "onboarding_submitted",
      is_read: false,
    });

    return { success: true, venueId };
  },
});

export const getOnboardingState = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user || user.role !== "owner") {
      return null;
    }

    const profile = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .unique();

    const payout = await ctx.db
      .query("payoutDetails")
      .withIndex("by_owner_id", (q) => q.eq("owner_id", user._id))
      .unique();

    return { user, profile, payout };
  },
});