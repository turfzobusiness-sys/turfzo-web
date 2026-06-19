import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
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
    firebase_uid: v.optional(v.string()),
    password_hash: v.optional(v.string()),
    session_token: v.optional(v.string()),
    session_expires_at: v.optional(v.string()),
    last_login_at: v.optional(v.string()),
    favorite_sports: v.optional(v.array(v.string())),
    notifications_enabled: v.boolean(),
    preferred_payment_method: v.optional(v.string()),
    approved_at: v.optional(v.number()),
    approved_by: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_session_token", ["session_token"])
    .index("by_role", ["role"])
    .index("by_firebase_uid", ["firebase_uid"]),

  turfs: defineTable({
    user_id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zip_code: v.string(),
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
    operating_hours: v.optional(v.any()),
    max_players: v.optional(v.number()),
    has_floodlights: v.optional(v.boolean()),
    has_free_parking: v.optional(v.boolean()),
    has_changing_room: v.optional(v.boolean()),
    has_drinking_water: v.optional(v.boolean()),
    has_first_aid: v.optional(v.boolean()),
    is_indoor: v.optional(v.boolean()),
    ground_count: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("active"), v.literal("inactive"))),
    approved_at: v.optional(v.number()),
    approved_by: v.optional(v.string()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_city", ["city"])
    .index("by_sport_type", ["sport_type"])
    .index("by_is_available", ["is_available"])
    .index("by_status", ["status"])
    .searchIndex("search_turfs", {
      searchField: "name",
      filterFields: ["city", "sport_type", "is_available"],
    }),

  bookings: defineTable({
    user_id: v.string(),
    turf_id: v.string(),
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
    .index("by_status", ["status"])
    .index("by_user_and_status", ["user_id", "status"])
    .index("by_turf_and_start_time", ["turf_id", "start_time"]),

  reviews: defineTable({
    user_id: v.string(),
    turf_id: v.string(),
    booking_id: v.string(),
    rating: v.number(),
    comment: v.optional(v.string()),
    owner_reply: v.optional(v.string()),
    owner_replied_at: v.optional(v.number()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_turf_id", ["turf_id"])
    .index("by_user_id", ["user_id"])
    .index("by_booking_id", ["booking_id"]),

  favorites: defineTable({
    user_id: v.string(),
    turf_id: v.string(),
    created_at: v.string(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_and_turf", ["user_id", "turf_id"]),

  notifications: defineTable({
    user_id: v.string(),
    title: v.string(),
    body: v.string(),
    type: v.string(),
    data: v.optional(v.any()),
    is_read: v.boolean(),
    created_at: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_and_read", ["user_id", "is_read"]),

  ownerProfiles: defineTable({
    user_id: v.string(),
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
    venue_draft: v.optional(v.any()),
  })
    .index("by_user_id", ["user_id"]),

  payoutDetails: defineTable({
    owner_id: v.string(),
    bank_account_holder_name: v.string(),
    bank_account_number: v.string(),
    bank_ifsc_code: v.string(),
    bank_name: v.string(),
    bank_branch: v.optional(v.string()),
    upi_id: v.optional(v.string()),
    is_verified: v.boolean(),
    verified_at: v.optional(v.number()),
    verified_by: v.optional(v.string()),
  })
    .index("by_owner_id", ["owner_id"]),

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
    target_user_id: v.string(),
    admin_user_id: v.string(),
    timestamp: v.number(),
  })
    .index("by_admin_id", ["admin_user_id"])
    .index("by_target_id", ["target_user_id"])
    .index("by_timestamp", ["timestamp"]),

  payment_orders: defineTable({
    user_id: v.optional(v.string()),
    booking_id: v.optional(v.string()),
    cashfree_order_id: v.string(),
    cashfree_payment_session_id: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    receipt: v.string(),
    status: v.string(),
    cashfree_payment_id: v.optional(v.string()),
    payment_status: v.optional(v.string()),
    verified: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_cashfree_order_id", ["cashfree_order_id"])
    .index("by_user_id", ["user_id"])
    .index("by_booking_id", ["booking_id"]),

  slot_blocks: defineTable({
    turf_id: v.string(),
    owner_id: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    reason: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_turf_id", ["turf_id"])
    .index("by_owner_id", ["owner_id"])
    .index("by_turf_and_time", ["turf_id", "start_time"]),

  tournaments: defineTable({
    organizer_id: v.string(),
    turf_id: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    sport_type: v.string(),
    tournament_type: v.string(),
    entry_fee: v.number(),
    prize_pool: v.optional(v.number()),
    max_participants: v.number(),
    min_team_size: v.optional(v.number()),
    max_team_size: v.optional(v.number()),
    registration_deadline: v.string(),
    start_date: v.string(),
    end_date: v.string(),
    bracket_type: v.string(),
    auto_generate_bracket: v.boolean(),
    status: v.string(),
    rules: v.optional(v.string()),
    image_url: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_organizer", ["organizer_id"])
    .index("by_turf", ["turf_id"])
    .index("by_status", ["status"]),

  tournament_teams: defineTable({
    tournament_id: v.string(),
    name: v.string(),
    captain_id: v.string(),
    logo_url: v.optional(v.string()),
    status: v.string(),
    created_at: v.string(),
    updated_at: v.string(),
  }).index("by_tournament", ["tournament_id"]),

  tournament_participants: defineTable({
    tournament_id: v.string(),
    user_id: v.string(),
    team_id: v.optional(v.string()),
    registration_type: v.string(),
    status: v.string(),
    registered_at: v.string(),
  })
    .index("by_tournament", ["tournament_id"])
    .index("by_user", ["user_id"])
    .index("by_tournament_and_user", ["tournament_id", "user_id"]),

  tournament_matches: defineTable({
    tournament_id: v.string(),
    round_number: v.number(),
    match_number: v.number(),
    participant1_id: v.optional(v.string()),
    participant2_id: v.optional(v.string()),
    team1_id: v.optional(v.string()),
    team2_id: v.optional(v.string()),
    winner_id: v.optional(v.string()),
    winner_team_id: v.optional(v.string()),
    score1: v.optional(v.string()),
    score2: v.optional(v.string()),
    scheduled_at: v.optional(v.string()),
    next_match_id: v.optional(v.string()),
    match_position: v.optional(v.string()),
    completed_at: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
    updated_at: v.string(),
  }).index("by_tournament", ["tournament_id"]),

  promotions: defineTable({
    owner_id: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    discount_type: v.string(),
    discount_value: v.number(),
    valid_from: v.string(),
    valid_to: v.string(),
    usage_limit: v.optional(v.number()),
    usage_count: v.number(),
    is_active: v.boolean(),
    created_at: v.string(),
  })
    .index("by_owner", ["owner_id"])
    .index("by_code", ["code"]),

  dynamic_pricing_rules: defineTable({
    turf_id: v.string(),
    name: v.string(),
    type: v.string(),
    days_of_week: v.array(v.number()),
    start_time: v.optional(v.string()),
    end_time: v.optional(v.string()),
    price_adjustment_type: v.string(),
    adjustment_value: v.number(),
    priority: v.number(),
    is_active: v.boolean(),
    created_at: v.string(),
  }).index("by_turf", ["turf_id"]),

  customer_tags: defineTable({
    owner_id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    created_at: v.string(),
  }).index("by_owner", ["owner_id"]),

  revenue_forecasts: defineTable({
    owner_id: v.string(),
    forecast_date: v.string(),
    projected_revenue: v.number(),
    confidence_score: v.number(),
    factors: v.array(v.string()),
    created_at: v.string(),
  }).index("by_owner", ["owner_id"]),

  owner_settings: defineTable({
    owner_id: v.string(),
    reminder_lead_time_hours: v.number(),
    auto_approve_bookings: v.boolean(),
    notification_preferences: v.any(),
    updated_at: v.string(),
  }).index("by_owner", ["owner_id"]),
});
