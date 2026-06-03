import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firebase_uid: v.string(),
    email: v.string(),
    full_name: v.optional(v.string()),
    display_name: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    role: v.union(v.literal("player"), v.literal("owner"), v.literal("admin")),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    is_email_verified: v.boolean(),
    is_phone_verified: v.boolean(),
    is_approved: v.boolean(),
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
  })
    .index("by_city", ["city"])
    .index("by_sport", ["sport_type"])
    .index("by_available", ["is_available"])
    .searchIndex("search_turfs", {
      searchField: "name",
      filterFields: ["city", "sport_type", "is_available"],
    }),

  bookings: defineTable({
    user_id: v.string(),
    turf_id: v.id("turfs"),
    booking_code: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    total_price: v.number(),
    service_fee: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    payment_status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("failed"),
        v.literal("refunded")
      )
    ),
    payment_method: v.optional(v.string()),
    attendees: v.optional(v.number()),
    notes: v.optional(v.string()),
    cancellation_reason: v.optional(v.string()),
    pg_order_id: v.optional(v.string()),
    pg_payment_id: v.optional(v.string()),
    pg_signature: v.optional(v.string()),
    // Legacy fields
    razorpay_order_id: v.optional(v.string()),
    razorpay_payment_id: v.optional(v.string()),
    razorpay_signature: v.optional(v.string()),
  })
    .index("by_user", ["user_id"])
    .index("by_turf", ["turf_id"])
    .index("by_turf_start", ["turf_id", "start_time"])
    .index("by_status", ["status"]),

  reviews: defineTable({
    user_id: v.string(),
    turf_id: v.id("turfs"),
    booking_id: v.id("bookings"),
    rating: v.number(),
    comment: v.optional(v.string()),
    owner_reply: v.optional(v.string()),
    owner_replied_at: v.optional(v.string()),
  })
    .index("by_turf", ["turf_id"])
    .index("by_user", ["user_id"]),

  favorites: defineTable({
    user_id: v.string(),
    turf_id: v.id("turfs"),
    created_at: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_turf", ["user_id", "turf_id"]),

  payment_orders: defineTable({
    user_id: v.string(),
    booking_id: v.optional(v.id("bookings")),
    tournament_id: v.optional(v.string()),
    pg_order_id: v.string(),
    client_request_id: v.string(),
    type: v.union(v.literal("turf_booking"), v.literal("tournament_registration")),
    amount: v.number(),
    currency: v.string(),
    receipt: v.string(),
    status: v.union(
      v.literal("created"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    pg_payment_id: v.optional(v.string()),
    pg_signature: v.optional(v.string()),
    // Legacy fields
    razorpay_order_id: v.optional(v.string()),
    razorpay_payment_id: v.optional(v.string()),
    razorpay_signature: v.optional(v.string()),
    source: v.optional(v.union(v.literal("client"), v.literal("webhook"))),
    created_at: v.string(),
    paid_at: v.optional(v.string()),
  })
    .index("by_order_id", ["pg_order_id"])
    .index("by_user", ["user_id"])
    .index("by_booking", ["booking_id"])
    .index("by_idempotency", ["user_id", "client_request_id"]),

  tournaments: defineTable({
    title: v.string(),
    sport: v.string(),
    format: v.string(),
    description: v.optional(v.string()),
    start_date: v.string(),
    end_date: v.optional(v.string()),
    venue: v.string(),
    turf_id: v.optional(v.id("turfs")),
    city: v.string(),
    entry_fee: v.number(),
    prize_pool: v.string(),
    max_teams: v.number(),
    registered_teams: v.number(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("open"),
      v.literal("closed"),
      v.literal("live"),
      v.literal("completed")
    ),
    image_url: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_city", ["city"])
    .index("by_sport", ["sport"]),

  tournament_registrations: defineTable({
    tournament_id: v.id("tournaments"),
    user_id: v.string(),
    team_name: v.string(),
    captain_name: v.string(),
    captain_email: v.string(),
    captain_phone: v.string(),
    entry_fee_paid: v.number(),
    payment_order_id: v.optional(v.id("payment_orders")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    registration_code: v.string(),
    created_at: v.string(),
  })
    .index("by_tournament", ["tournament_id"])
    .index("by_user", ["user_id"])
    .index("by_code", ["registration_code"]),

  contact_messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
    user_id: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),

  rate_limits: defineTable({
    key: v.string(),
    count: v.number(),
    window_start: v.number(),
  }).index("by_key", ["key"]),
});
