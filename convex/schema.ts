import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    full_name: v.optional(v.string()),
    display_name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    role: v.union(v.literal("player"), v.literal("owner"), v.literal("admin"), v.literal("user")),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    is_email_verified: v.boolean(),
    is_phone_verified: v.boolean(),
    is_approved: v.boolean(),
    firebase_uid: v.optional(v.string()),
    password_hash: v.optional(v.string()),
    session_expires_at: v.optional(v.string()),
    session_token: v.optional(v.string()),
    last_login_at: v.optional(v.string()),
    favorite_sports: v.optional(v.array(v.string())),
    notifications_enabled: v.boolean(),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_firebase_uid", ["firebase_uid"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  turfs: defineTable({
    user_id: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    price_per_hour: v.number(),
    image_url: v.optional(v.string()),
    image_gallery: v.optional(v.array(v.string())),
    is_available: v.boolean(),
    sport_type: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    review_count: v.optional(v.number()),
    tier: v.optional(v.string()),
    format: v.optional(v.string()),
    location_name: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    operating_hours: v.optional(
      v.object({
        open: v.string(),
        close: v.string(),
      })
    ),
    max_players: v.optional(v.number()),
    has_floodlights: v.optional(v.boolean()),
    has_free_parking: v.optional(v.boolean()),
    has_changing_room: v.optional(v.boolean()),
    has_drinking_water: v.optional(v.boolean()),
    has_first_aid: v.optional(v.boolean()),
    is_indoor: v.optional(v.boolean()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_city", ["city"])
    .index("by_sport", ["sport_type"])
    .index("by_available", ["is_available"])
    .searchIndex("search_turfs", {
      searchField: "name",
      filterFields: ["city", "sport_type", "is_available"],
    }),

  venues: defineTable({
    owner_id: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    price_per_hour: v.number(),
    image_url: v.optional(v.string()),
    image_gallery: v.optional(v.array(v.string())),
    is_available: v.boolean(),
    sport_type: v.optional(v.string()),
    amenities: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    review_count: v.optional(v.number()),
    tier: v.optional(v.string()),
    format: v.optional(v.string()),
    location_name: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("active"), v.literal("inactive")),
    approved_at: v.optional(v.number()),
    approved_by: v.optional(v.id("users")),
  })
    .index("by_owner_id", ["owner_id"])
    .index("by_status", ["status"])
    .index("by_city", ["city"]),

  ownerProfiles: defineTable({
    user_id: v.id("users"),
    business_name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    gst_number: v.optional(v.string()),
    pan_number: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip_code: v.optional(v.string()),
    onboarding_step: v.number(),
    onboarding_completed: v.boolean(),
    onboarding_completed_at: v.optional(v.number()),
    agreement_accepted: v.optional(v.boolean()),
    agreement_accepted_at: v.optional(v.number()),
    venue_draft: v.optional(v.object({
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
    })),
  })
    .index("by_user_id", ["user_id"]),

  payoutDetails: defineTable({
    owner_id: v.id("users"),
    bank_account_holder_name: v.string(),
    bank_account_number: v.string(),
    bank_ifsc_code: v.string(),
    bank_name: v.string(),
    bank_branch: v.optional(v.string()),
    upi_id: v.optional(v.string()),
    is_verified: v.boolean(),
    verified_at: v.optional(v.number()),
    verified_by: v.optional(v.id("users")),
  })
    .index("by_owner_id", ["owner_id"]),

  bookings: defineTable({
    user_id: v.id("users"),
    turf_id: v.union(v.id("venues"), v.id("turfs")),
    booking_code: v.optional(v.string()),
    start_time: v.string(),
    end_time: v.string(),
    total_price: v.number(),
    service_fee: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("completed")),
    payment_status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"), v.literal("refunded")),
    payment_method: v.optional(v.string()),
    attendees: v.optional(v.number()),
    notes: v.optional(v.string()),
    cancellation_reason: v.optional(v.string()),
    pg_order_id: v.optional(v.string()),
    pg_payment_id: v.optional(v.string()),
    pg_signature: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_turf_id", ["turf_id"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    user_id: v.id("users"),
    turf_id: v.union(v.id("venues"), v.id("turfs")),
    booking_id: v.union(v.id("bookings"), v.string()),
    rating: v.number(),
    comment: v.optional(v.string()),
    owner_reply: v.optional(v.string()),
    owner_replied_at: v.optional(v.number()),
    created_at: v.optional(v.string()),
  })
    .index("by_turf_id", ["turf_id"])
    .index("by_user_id", ["user_id"]),

  favorites: defineTable({
    user_id: v.id("users"),
    turf_id: v.union(v.id("venues"), v.id("turfs")),
    created_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_turf_id", ["turf_id"]),

  notifications: defineTable({
    user_id: v.id("users"),
    title: v.string(),
    body: v.string(),
    type: v.string(),
    data: v.optional(v.any()),
    is_read: v.boolean(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_is_read", ["is_read"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    turnstileToken: v.string(),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
    created_at: v.number(),
  })
    .index("by_status", ["status"]),

  auditLogs: defineTable({
    action: v.string(),
    target_user_id: v.id("users"),
    admin_user_id: v.id("users"),
    timestamp: v.number(),
  })
    .index("by_admin_id", ["admin_user_id"])
    .index("by_target_id", ["target_user_id"])
    .index("by_timestamp", ["timestamp"]),
});