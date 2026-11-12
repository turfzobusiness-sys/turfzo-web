"use client";

/**
 * Owner-web data helpers — typed wrappers around the Convex functions the
 * new dashboard views consume. Every path here was verified against the
 * backend exports (auth guard inside each backend fn re-checks ownership,
 * so these wrappers only pass ids).
 *
 * Auth: each helper takes the Firebase token explicitly (auth-context
 * refresh loop owns token lifecycle; helpers stay stateless).
 */

import { convexClient } from "@/lib/convex";

function isUnauthorized(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "CONVEX_UNAUTHORIZED"
  );
}

/** Query with one automatic retry via `refresher` when the token expired. */
export async function ownerQuery<T>(
  path: string,
  args: Record<string, unknown>,
  token: string | undefined,
  refresher?: () => Promise<string | undefined>,
  client: Pick<typeof convexClient, "query"> = convexClient,
): Promise<T> {
  try {
    return await client.query<T>(path, args, token);
  } catch (err) {
    if (isUnauthorized(err) && refresher) {
      return client.query<T>(path, args, await refresher());
    }
    throw err;
  }
}

/** Mutation with one automatic retry via `refresher` when the token expired. */
export async function ownerMutation<T>(
  path: string,
  args: Record<string, unknown>,
  token: string | undefined,
  refresher?: () => Promise<string | undefined>,
  client: Pick<typeof convexClient, "mutation"> = convexClient,
): Promise<T> {
  try {
    return await client.mutation<T>(path, args, token);
  } catch (err) {
    if (isUnauthorized(err) && refresher) {
      return client.mutation<T>(path, args, await refresher());
    }
    throw err;
  }
}

// ── Shapes (checked against backend return maps) ────────────────────

export interface TurfComparisonRow {
  turfId: string;
  turfName: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  occupancyRate: number;
  rating: number;
  reviews: number;
  revenueGrowth: number;
}

export interface ForecastTurfRow {
  turf_id: string;
  turf_name: string;
  current_revenue: number;
  predicted_revenue: number;
  growth_rate: number;
}

export interface OwnerForecast {
  last_month_revenue: number;
  last_3_months_average: number;
  last_6_months_average: number;
  year_to_date_revenue: number;
  predicted_next_month: number;
  predicted_next_quarter: number;
  predicted_next_year: number;
  month_over_month_growth: number;
  average_booking_value: number;
  confidence_score: number;
  trend: "growth" | "stable" | "declining";
  peak_days: number[];
  peak_hours: string[];
  turf_forecasts: ForecastTurfRow[];
  bookings_scanned?: number;
  truncated?: boolean;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  auto_segment: string;
  tag_ids: string[];
  segment: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
  average_booking_value: number;
  first_booking: string | null;
  last_booking: string;
  days_since_last_booking: number;
  booking_frequency: number;
  preferred_slots: string[];
  preferred_days: string[];
}

export interface SegmentSummary {
  total: number;
  vip: number;
  regular: number;
  new: number;
  atRisk: number;
  loyal: number;
  corporate: number;
  inactive: number;
  tagCounts: Record<string, number>;
}

export interface OwnerReview {
  id: string;
  turf_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  owner_reply?: string | null;
  created_at: string;
  user_display_name?: string;
  user_avatar_url?: string | null;
}

export interface Promotion {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  valid_from: string;
  valid_to: string;
  usage_limit?: number;
  used_count?: number;
  is_active: boolean;
}

export interface PricingRule {
  id: string;
  turf_id: string;
  name: string;
  type: string;
  days_of_week: number[];
  start_time?: string;
  end_time?: string;
  price_adjustment_type: string;
  adjustment_value: number;
  demand_threshold?: number;
  priority: number;
  is_active: boolean;
  // Hydrated client-side from getOwnerPricingRules
  turf_name?: string;
}

export interface OwnerTournament {
  id: string;
  name: string;
  description?: string;
  sport_type: string;
  tournament_type: string;
  status: string;
  entry_fee: number;
  prize_pool?: number;
  max_participants: number;
  registered_count?: number;
  start_date: string;
  end_date: string;
  registration_deadline: string;
}

export interface TournamentAnnouncement {
  id: string;
  tournament_id: string;
  title: string;
  message: string;
  priority?: string;
  created_at: string;
}

export interface OwnerSettings {
  owner_id: string;
  reminder_lead_time_hours: number;
  auto_approve_bookings: boolean;
  notification_preferences: { email: boolean; push: boolean; sms: boolean };
  enable_24h_reminder?: boolean;
  enable_2h_reminder?: boolean;
  enable_post_game_review?: boolean;
  enable_rebook_suggestions?: boolean;
  post_game_delay_hours?: number;
  rebook_days_inactive?: number;
}

export interface DayViewBooking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  user_id: string;
}

export interface DayViewBlock {
  id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

export interface DayView {
  bookings: DayViewBooking[];
  blocks: DayViewBlock[];
}

/** `bookings:getForTurf` — raw booking doc plus the hydrated turf summary. */
export interface OwnerBooking {
  id: string;
  _id?: string;
  user_id: string;
  turf_id: string;
  booking_code?: string;
  start_time: string;
  end_time: string;
  total_price: number;
  service_fee?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  attendees?: number;
  notes?: string;
  cancellation_reason?: string;
  refunded_amount?: number;
  created_at?: string;
  turfs?: {
    name: string;
    city?: string;
    sport_type?: string;
    format?: string;
  };
}

/** One row of `payouts:getPayouts` (a `payment_orders` doc with payout_* status). */
export interface OwnerPayout {
  _id: string;
  amount: number;
  status: string;
  method?: string;
  upi_id?: string;
  created_at?: string;
  processed_at?: string;
  failure_reason?: string;
}

/** `owner_services:getOwnerTags` — an owner-defined customer tag. */
export interface OwnerTag {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  color: string;
  created_at?: string;
}

/** Payout settlement details on file (`auth:getPayoutDetails`). */
export interface PayoutDetails {
  bank_account_holder_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  bank_branch?: string;
  upi_id?: string;
  is_verified?: boolean;
}

// ── API calls ────────────────────────────────────────────────────────

/** Per-page context: fresh token + refresher for expired-token retries. */
export interface OwnerApiCtx {
  token?: string;
  refresher?: () => Promise<string | undefined>;
  /** Optional client override — test/preview harnesses inject MockConvexHttpClient. */
  client?: Pick<typeof convexClient, "query" | "mutation">;
}

export function createOwnerApi(ctx: OwnerApiCtx) {
  const q = <T>(path: string, args: Record<string, unknown>) =>
    ownerQuery<T>(path, args, ctx.token, ctx.refresher, ctx.client);
  const m = <T>(path: string, args: Record<string, unknown>) =>
    ownerMutation<T>(path, args, ctx.token, ctx.refresher, ctx.client);

  return {
    turfComparison: (ownerId: string, start: string, end: string) =>
      q<TurfComparisonRow[]>("owner_dashboard:getTurfComparison", {
        ownerId,
        startDate: start,
        endDate: end,
      }),

    forecast: (ownerId: string) =>
      q<OwnerForecast>("owner_dashboard:generateForecast", { ownerId }),

    earningsBreakdown: (ownerId: string) =>
      q<Record<string, number>>("owner_dashboard:getEarningsBreakdown", {
        ownerId,
      }),

    customerProfiles: (ownerId: string) =>
      q<CustomerProfile[]>("owner_dashboard:getOwnerCustomerProfiles", {
        ownerId,
      }),

    segmentSummary: (ownerId: string) =>
      q<SegmentSummary>("owner_dashboard:getCustomerSegmentsSummary", {
        ownerId,
      }),

    updateCustomerTags: (customerId: string, tags: string[]) =>
      m("owner_dashboard:updateCustomerTags", { customerId, tags }),

    reviewsForTurf: (turfId: string) =>
      q<OwnerReview[]>("reviews:getByTurf", { turf_id: turfId, limit: 100 }),

    replyToReview: (reviewId: string, reply: string) =>
      m("reviews:addOwnerReply", { review_id: reviewId, reply }),

    promotions: (ownerId: string) =>
      q<Promotion[]>("owner_services:getOwnerPromotions", { ownerId }),

    createPromotion: (args: {
      ownerId: string;
      code: string;
      description?: string;
      discountType: string;
      discountValue: number;
      validFrom: string;
      validTo: string;
      usageLimit?: number;
    }) => m("owner_services:createPromotion", args),

    togglePromotion: (promotionId: string, isActive: boolean) =>
      m("owner_services:togglePromotionStatus", { promotionId, isActive }),

    deletePromotion: (promotionId: string) =>
      m("owner_services:deletePromotion", { promotionId }),

    pricingRules: (ownerId: string) =>
      q<PricingRule[]>("owner_services:getOwnerPricingRules", { ownerId }),

    createPricingRule: (args: {
      turfId: string;
      name: string;
      type: string;
      daysOfWeek: number[];
      startTime?: string;
      endTime?: string;
      adjustmentType: string;
      adjustmentValue: number;
      demandThreshold?: number;
      priority?: number;
    }) => m("owner_services:createPricingRule", args),

    deletePricingRule: (ruleId: string) =>
      m("owner_services:deletePricingRule", { ruleId }),

    ownerTournaments: (ownerId: string) =>
      q<OwnerTournament[]>("tournaments:getOwnerTournaments", { ownerId }),

    createTournament: (args: Record<string, unknown>) =>
      m("tournaments:createTournament", args),

    updateTournamentStatus: (tournamentId: string, status: string) =>
      m("tournaments:updateTournamentStatus", { tournamentId, status }),

    announcements: (tournamentId: string) =>
      q<TournamentAnnouncement[]>("tournaments:getAnnouncements", {
        tournamentId,
      }),

    createAnnouncement: (tournamentId: string, title: string, message: string) =>
      m("tournaments:createAnnouncement", { tournamentId, title, message }),

    dayView: (turfId: string, date: string) =>
      q<DayView>("owner_day:getDayView", { turf_id: turfId, date }),

    createSlotBlock: (
      turfId: string,
      startTime: string,
      endTime: string,
      reason?: string,
    ) =>
      m("slot_blocks:create", {
        turf_id: turfId,
        start_time: startTime,
        end_time: endTime,
        reason,
      }),

    removeSlotBlock: (blockId: string) =>
      m("slot_blocks:remove", { block_id: blockId }),

    settings: (ownerId: string) =>
      q<OwnerSettings>("owner_services:getOwnerSettings", { ownerId }),

    updateSettings: (
      ownerId: string,
      settings: Partial<OwnerSettings> & {
        notification_preferences?: {
          email: boolean;
          push: boolean;
          sms: boolean;
        };
      },
    ) => m("owner_services:updateReminderSettings", { ownerId, settings }),

    // ── Bookings management (parity with the Flutter owner bookings tab) ──
    //
    // `bookings:getForTurf` returns raw booking rows plus the turf summary.
    // Every mutation below re-checks ownership server-side; the client only
    // supplies ids. Status transitions allowed by the backend: pending →
    // confirmed|cancelled, confirmed → completed. A confirmed → cancelled
    // transition must go through `cancelBooking` so the player gets the
    // partner-cancelled full refund.

    bookingsForTurf: (turfId: string, limit = 100) =>
      q<OwnerBooking[]>("bookings:getForTurf", { turfId, limit }),

    updateBookingStatus: (
      bookingId: string,
      status: OwnerBooking["status"],
    ) => m("bookings:updateStatus", { bookingId, status }),

    markCashCollected: (bookingId: string) =>
      m("bookings:markCashCollected", { bookingId }),

    cancelBooking: (bookingId: string, reason?: string) =>
      m("bookings:cancel", { bookingId, reason }),

    // ── Payouts (Flutter earnings screen) ──────────────────────────────
    payouts: (ownerId: string, limit = 50) =>
      q<{ payouts: OwnerPayout[]; continueCursor: string | null; isDone: boolean }>(
        "payouts:getPayouts",
        { ownerId, limit },
      ),

    requestPayout: (args: {
      ownerId: string;
      amount: number;
      method: "upi" | "bank";
      upiId?: string;
      bankDetails?: {
        account_holder_name: string;
        account_number: string;
        bank_name: string;
        ifsc_code: string;
      };
    }) => m<{ payoutId?: string }>("payouts:requestPayout", args),

    payoutDetails: () =>
      q<PayoutDetails | null>("auth:getPayoutDetails", {}),

    // ── Slot blocks (bulk blocking needs the existing block list) ─────
    slotBlocks: (
      turfId: string,
      startDate?: string,
      endDate?: string,
      limit = 200,
    ) =>
      q<DayViewBlock[]>("slot_blocks:getByTurf", {
        turf_id: turfId,
        start_date: startDate,
        end_date: endDate,
        limit,
      }),

    // ── Customer tag definitions (Flutter segments → Tags tab) ────────
    ownerTags: (ownerId: string) =>
      q<OwnerTag[]>("owner_services:getOwnerTags", { ownerId }),

    createTag: (args: {
      ownerId: string;
      name: string;
      description?: string;
      color: string;
    }) => m("owner_services:createTag", args),

    deleteTag: (tagId: string) =>
      m("owner_services:deleteTag", { tagId }),

    // ── Venue management (Flutter My Turfs screen parity) ──────────────
    //
    // Availability toggle only works on active turfs server-side (mirror of
    // the app's pause/resume); delete cascades slot blocks and refuses when
    // pending/confirmed future bookings exist.

    /** Create a venue (`turfs:create`) — backend requires an approved owner
     *  and stamps status "pending" until an admin approves the listing. */
    createVenue: (turf: Record<string, unknown>) =>
      m<{ _id?: string; id?: string }>("turfs:create", { turf }),

    /** Edit a venue (`turfs:update`) — same editable-field contract. */
    updateVenue: (turfId: string, turf: Record<string, unknown>) =>
      m<unknown>("turfs:update", { turfId, turf }),

    toggleVenueAvailability: (turfId: string, isAvailable: boolean) =>
      m<unknown>("turfs:toggleAvailability", {
        turfId,
        isAvailable,
      }),

    deleteVenue: (turfId: string) =>
      m<{ success: boolean }>("turfs:deleteTurf", { turfId }),

    ownerTurfs: () =>
      q<{ _id: string; name: string; city?: string }[]>("auth:getOwnerTurfs", {}),
  };
}

export type OwnerApi = ReturnType<typeof createOwnerApi>;
