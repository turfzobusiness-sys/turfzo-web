/**
 * Mock Convex client for the Turfzo website.
 *
 * Enabled with NEXT_PUBLIC_USE_MOCK=true so the whole site runs on
 * fixture data with zero backend calls — used during the testing phase.
 * Fixtures mirror the real backend response shapes (see turfzo-backend).
 */

type MockHandler = (args: Record<string, unknown>) => unknown;

const MOCK_USER = {
  _id: "user_mock_1",
  id: "user_mock_1",
  email: "player@example.com",
  full_name: "John Player",
  display_name: "Johnny",
  role: "player",
  city: "Mumbai",
  state: "Maharashtra",
  phone_number: "+919876543210",
  is_email_verified: true,
  is_phone_verified: true,
  is_approved: true,
  notifications_enabled: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
};

const MOCK_OWNER_USER = {
  ...MOCK_USER,
  _id: "user_mock_owner_1",
  id: "user_mock_owner_1",
  email: "owner@example.com",
  full_name: "Akram Shakil",
  display_name: "Akram's Sports",
  role: "owner",
};

interface MockTurf {
  _id: string;
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price_per_hour: number;
  sport_type: string;
  format: string;
  tier: string;
  image_url: string;
  amenities: string[];
  is_available: boolean;
  latitude: number;
  longitude: number;
  has_floodlights: boolean;
  is_indoor: boolean;
  status: string;
  rating: number;
  review_count: number;
  operating_hours: { open: string; close: string };
  created_at: string;
  updated_at: string;
}

const mockTurfs: MockTurf[] = [
  {
    _id: "turf_mock_1",
    id: "turf_mock_1",
    name: "Olympic Arena",
    description: "Professional grade football turf with night lights.",
    address: "Andheri Sports Complex, JP Road",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400053",
    price_per_hour: 1200,
    sport_type: "football",
    format: "5-a-side",
    tier: "standard",
    image_url: "",
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Water"],
    is_available: true,
    latitude: 19.129,
    longitude: 72.833,
    has_floodlights: true,
    is_indoor: false,
    status: "active",
    rating: 4.8,
    review_count: 142,
    operating_hours: { open: "06:00", close: "23:00" },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    _id: "turf_mock_2",
    id: "turf_mock_2",
    name: "Lords Cricket Ground",
    description: "Indoor cricket net facility.",
    address: "Near BKC Ground, Bandra East",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400051",
    price_per_hour: 800,
    sport_type: "cricket",
    format: "5-a-side",
    tier: "budget",
    image_url: "",
    amenities: ["Equipment Rental", "Coach available", "Water"],
    is_available: true,
    latitude: 19.065,
    longitude: 72.864,
    has_floodlights: false,
    is_indoor: true,
    status: "active",
    rating: 4.5,
    review_count: 98,
    operating_hours: { open: "06:00", close: "22:00" },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
];

function slotsFor(
  _turfId: string,
  date: string,
): {
  time: string;
  available: boolean;
  start_time: string;
  end_time: string;
}[] {
  const unavailable = [3, 8];
  // Mirror the real backend: IST (+330) local day → absolute UTC instants.
  const dayStartMs = Date.parse(`${date}T00:00:00.000Z`) - 330 * 60_000;
  return Array.from({ length: 17 }, (_, i) => {
    const h = 6 + i;
    const startMs = dayStartMs + h * 3_600_000;
    return {
      time: `${String(h).padStart(2, "0")}:00 - ${String(h + 1).padStart(2, "0")}:00`,
      available: !unavailable.includes(i),
      start_time: new Date(startMs).toISOString(),
      end_time: new Date(startMs + 3_600_000).toISOString(),
    };
  });
}

interface MockBookingTurf {
  name: string;
  image_url: string | null;
  city: string;
  format: string | null;
  sport_type: string;
}

interface MockBooking {
  _id: string;
  id: string;
  booking_code: string;
  user_id: string;
  turf_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  service_fee: number;
  status: string;
  payment_status: string;
  payment_method: string;
  attendees: number;
  created_at: string;
  turfs: MockBookingTurf;
}

const mockBookings: MockBooking[] = [
  {
    _id: "booking_mock_1",
    id: "booking_mock_1",
    booking_code: "BK-8821",
    user_id: "user_mock_1",
    turf_id: "turf_mock_2",
    start_time: new Date(Date.now() + 2 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 3 * 3600000).toISOString(),
    total_price: 800,
    service_fee: 40,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Lords Cricket Ground",
      image_url: mockTurfs[1].image_url,
      city: "Mumbai",
      format: "5-a-side",
      sport_type: "cricket",
    },
  },
  {
    _id: "booking_mock_2",
    id: "booking_mock_2",
    booking_code: "BK-7419",
    user_id: "user_mock_2",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() - 3600000 * 3).toISOString(),
    end_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    total_price: 1200,
    service_fee: 60,
    status: "completed",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    turfs: {
      name: "Olympic Arena",
      image_url: mockTurfs[0].image_url,
      city: "Mumbai",
      format: "5-a-side",
      sport_type: "football",
    },
  },
  {
    _id: "booking_mock_3",
    id: "booking_mock_3",
    booking_code: "BK-9034",
    user_id: "user_mock_3",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() + 5 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 6 * 3600000).toISOString(),
    total_price: 1200,
    service_fee: 60,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Olympic Arena",
      image_url: mockTurfs[0].image_url,
      city: "Mumbai",
      format: "5-a-side",
      sport_type: "football",
    },
  },
  {
    _id: "booking_mock_4",
    id: "booking_mock_4",
    booking_code: "BK-9210",
    user_id: "user_mock_4",
    turf_id: "turf_mock_2",
    start_time: new Date(Date.now() + 24 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 25 * 3600000).toISOString(),
    total_price: 800,
    service_fee: 40,
    status: "confirmed",
    payment_status: "paid",
    payment_method: "cash",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Lords Cricket Ground",
      image_url: mockTurfs[1].image_url,
      city: "Mumbai",
      format: "5-a-side",
      sport_type: "cricket",
    },
  },
  {
    _id: "booking_mock_5",
    id: "booking_mock_5",
    booking_code: "BK-5192",
    user_id: "user_mock_5",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() + 28 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 29 * 3600000).toISOString(),
    total_price: 1200,
    service_fee: 60,
    status: "pending",
    payment_status: "paid",
    payment_method: "online",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Olympic Arena",
      image_url: mockTurfs[0].image_url,
      city: "Mumbai",
      format: "5-a-side",
      sport_type: "football",
    },
  },
  {
    _id: "booking_mock_6",
    id: "booking_mock_6",
    booking_code: "BK-6380",
    user_id: "user_mock_6",
    turf_id: "turf_mock_2",
    start_time: new Date(Date.now() + 48 * 3600000).toISOString(),
    end_time: new Date(Date.now() + 49 * 3600000).toISOString(),
    total_price: 800,
    service_fee: 40,
    status: "pending",
    payment_status: "pending",
    payment_method: "cash",
    attendees: 10,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Lords Cricket Ground",
      image_url: mockTurfs[1].image_url,
      city: "Mumbai",
      format: "5-a-side",
      sport_type: "cricket",
    },
  },
];

const mockTournaments = [
  {
    _id: "tourn_mock_1",
    _creationTime: Date.now(),
    title: "Mumbai Premier League 2026",
    sport: "football",
    format: "team",
    description: "Open 5-a-side football tournament with cash prizes.",
    start_date: "2026-09-10T00:00:00.000Z",
    end_date: "2026-09-15T00:00:00.000Z",
    venue: "Olympic Arena",
    city: "Mumbai",
    entry_fee: 2000,
    prize_pool: "₹50,000",
    max_teams: 16,
    registered_teams: 12,
    status: "registration_open",
    image_url: "",
    created_at: "2026-07-01T00:00:00.000Z",
  },
  {
    _id: "tourn_mock_2",
    _creationTime: Date.now(),
    title: "BKC Cricket Super Cup",
    sport: "cricket",
    format: "team",
    description: "5-a-side box cricket tournament, open entry.",
    start_date: "2026-08-25T00:00:00.000Z",
    end_date: "2026-08-25T00:00:00.000Z",
    venue: "Lords Cricket Ground",
    city: "Mumbai",
    entry_fee: 1500,
    prize_pool: "₹30,000",
    max_teams: 16,
    registered_teams: 14,
    status: "registration_open",
    image_url: "",
  },
];

const mockReviews = [
  {
    _id: "rev_mock_1",
    id: "rev_mock_1",
    turf_id: "turf_mock_1",
    user_id: "user_reviewer_1",
    rating: 5,
    comment: "Great turf, lights were superb at night!",
    user_display_name: "Rahul",
    user_avatar_url: null,
    owner_reply: "Thanks Rahul!",
    owner_replied_at: "2026-06-16T10:00:00.000Z",
    created_at: "2026-06-15T12:00:00.000Z",
  },
  {
    _id: "rev_mock_2",
    id: "rev_mock_2",
    turf_id: "turf_mock_1",
    user_id: "user_reviewer_2",
    rating: 4,
    comment: "Good facility, parking is tight on weekends.",
    user_display_name: "Priya",
    user_avatar_url: null,
    owner_reply: null,
    owner_replied_at: null,
    created_at: "2026-06-14T12:00:00.000Z",
  },
];

const mockNotifications = [
  {
    _id: "notif_mock_1",
    id: "notif_mock_1",
    user_id: "user_mock_1",
    title: "Booking confirmed",
    body: "Your slot at Olympic Arena is confirmed.",
    type: "booking",
    is_read: false,
    created_at: "2026-08-01T09:00:00.000Z",
  },
];

function findTurf(id: string | undefined): MockTurf | null {
  return mockTurfs.find((t) => t._id === id || t.id === id) ?? null;
}

const routes: Record<string, MockHandler> = {
  // ── Auth ───────────────────────────────────────────────────────────
  // ── OTP (MSG91 phone verification, link flow) ──────────────────────
  "otp:sendOtp": () => ({
    success: true,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  }),
  "otp:verifyAndLink": () => ({
    success: true,
    user: { ...MOCK_USER, phone_number: "+919876543210", is_phone_verified: true },
  }),
  "auth:getCurrentUser": () => ({ success: true, user: MOCK_USER }),
  "auth:syncFirebaseUser": () => ({ success: true, user: MOCK_USER }),
  "auth:updateUserProfile": () => ({ success: true }),
  "auth:getOwnerProfile": () => ({
    user: MOCK_OWNER_USER,
    profile: {
      _id: "owner_profile_mock_1",
      user_id: "user_mock_owner_1",
      business_name: "Akram's Sports Arena",
      phone_number: "+919876543210",
      gst_number: "29ABCDE1234F1Z5",
      pan_number: "ABCDE1234F",
      address: "Sports Complex, JP Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip_code: "400053",
      onboarding_step: 4,
      onboarding_completed: true,
      onboarding_completed_at: "2026-07-01T00:00:00.000Z",
      agreement_accepted: true,
    },
    payout: {
      _id: "payout_mock_1",
      owner_id: "user_mock_owner_1",
      bank_account_holder_name: "Akram Shakil",
      bank_account_number: "XXXXXX1234",
      bank_ifsc_code: "HDFC0001234",
      bank_name: "HDFC Bank",
      upi_id: "akram@upi",
      is_verified: true,
    },
  }),
  "auth:getOwnerTurfs": () => mockTurfs,
  "auth:completeOnboardingStep": () => ({ success: true }),
  "auth:submitOnboarding": () => ({ success: true }),
  "auth:reapplyAsOwner": () => ({ success: true }),
  "auth:sendPasswordReset": () => ({ success: true }),
  "auth:resetPassword": () => ({ success: true }),
  "auth:resolveStorageUrl": ({ storageId }) =>
    `https://mock.turfzo.in/storage/${String(storageId)}`,
  "auth:updatePayoutDetails": () => ({ success: true }),
  "auth:getPayoutDetails": () => ({
    payout_details: {
      bank_account_number: "XXXXXX1234",
      ifsc_code: "HDFC0001234",
      account_holder_name: "Akram Shakil",
    },
  }),
  "auth:deleteAccount": () => ({ success: true }),
  "auth:generateUploadUrl": () => "https://mock.turfzo.in/upload",

  // ── Turfs ──────────────────────────────────────────────────────────
  "turfs:getAvailable": () => mockTurfs,
  "turfs:getAll": () => mockTurfs,
  "turfs:getById": ({ turfId }) => findTurf(String(turfId ?? "")),
  "turfs:getByCity": ({ city }) =>
    mockTurfs.filter(
      (t) => t.city.toLowerCase() === String(city ?? "").toLowerCase()
    ),
  "turfs:getBySport": ({ sportType }) =>
    mockTurfs.filter(
      (t) =>
        t.sport_type.toLowerCase() === String(sportType ?? "").toLowerCase()
    ),
  "turfs:search": ({ query, city }) => {
    const q = String(query ?? "").toLowerCase();
    const c = String(city ?? "").toLowerCase();
    return mockTurfs.filter(
      (t) =>
        (q === "" || t.name.toLowerCase().includes(q)) &&
        (c === "" || t.city.toLowerCase() === c)
    );
  },
  "turfs:getNearby": () => mockTurfs.slice(0, 5),
  "turfs:getAvailableSlots": ({ turf_id, date }) =>
    slotsFor(String(turf_id ?? ""), String(date ?? "")),

  // ── Bookings ───────────────────────────────────────────────────────
  "bookings:getMyBookings": () => mockBookings,
  "bookings:calculatePreview": (args) => {
    const turf = findTurf(String(args.turf_id ?? ""));
    const pricePerHour = turf?.price_per_hour ?? 1000;
    const start = new Date(String(args.start_time));
    const end = new Date(String(args.end_time));
    // Whole-hour billing (1–4h), same as backend: round to nearest hour, min 1.
    const hours = Math.max(1, Math.round((end.getTime() - start.getTime()) / 3_600_000));
    const subtotal = Math.round(pricePerHour * hours * 100) / 100;
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
    return {
      subtotal,
      serviceFee,
      grandTotal: subtotal + serviceFee,
    };
  },
  "bookings:createPending": (args) => {
    const turfId = String(args.turf_id ?? "");
    const turf = findTurf(turfId);
    const start = new Date(String(args.start_time ?? new Date().toISOString()));
    const end = new Date(String(args.end_time ?? new Date().toISOString()));
    const hours = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 3_600_000),
    );
    const price = turf?.price_per_hour ?? 1000;
    const newBooking = {
      _id: `booking_mock_new_${Date.now()}`,
      id: `booking_mock_new_${Date.now()}`,
      booking_code: `TFZ-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: "user_mock_1",
      turf_id: turfId,
      start_time: String(args.start_time ?? new Date().toISOString()),
      end_time: String(args.end_time ?? new Date().toISOString()),
      total_price: price * hours,
      service_fee: Math.round(price * hours * 0.05),
      status: "pending",
      payment_status: "pending",
      payment_method: "online",
      attendees: Number(args.attendees ?? 1),
      created_at: new Date().toISOString(),
      turfs: {
        name: turf?.name ?? "Mock Turf",
        image_url: turf?.image_url ?? null,
        city: turf?.city ?? "Mumbai",
        format: turf?.format ?? "7-a-side",
        sport_type: turf?.sport_type ?? "football",
      },
    };
    mockBookings.unshift(newBooking);
    return newBooking;
  },
  "bookings:isSlotAvailable": () => true,
  "bookings:cancelIfUnpaid": () => ({
    cancelled: true,
    status: "cancelled",
    reason: "UNPAID",
  }),
  "bookings:getRefundPreview": () => ({
    refundAmount: 0,
    refundPolicy: "full",
    chargedOnline: false,
    hoursUntilStart: 24,
    canCancel: true,
    paymentMethod: "online",
    paymentStatus: "pending",
  }),
  "bookings:cancel": ({ bookingId }) => {
    const b = mockBookings.find(
      (x) => x._id === bookingId || x.id === bookingId
    );
    if (b) {
      b.status = "cancelled";
      return { ...b };
    }
    throw new Error("Booking not found");
  },
  "bookings:getByCode": () => mockBookings[0],
  "bookings:getById": ({ bookingId }) =>
    mockBookings.find((b) => b._id === bookingId) ?? mockBookings[0],
  // Per-turf only: the dashboard merges one response per venue, so returning
  // another venue's rows here would duplicate React keys.
  "bookings:getForTurf": ({ turfId }) =>
    mockBookings.filter((b) => !turfId || b.turf_id === turfId),
  "bookings:updateStatus": ({ bookingId, status }) => {
    const b = mockBookings.find(
      (x) => x._id === bookingId || x.id === bookingId,
    );
    if (!b) throw new Error("Booking not found");
    b.status = String(status);
    return { ...b };
  },
  "bookings:markCashCollected": ({ bookingId }) => {
    const b = mockBookings.find(
      (x) => x._id === bookingId || x.id === bookingId,
    );
    if (!b) throw new Error("Booking not found");
    b.payment_status = "paid";
    b.status = "confirmed";
    return { ...b };
  },

  // ── Payments (mock — no real Cashfree call) ────────────────────────
  "payments:createCashfreeOrder": (args) => ({
    success: true,
    cf_order_id: "mock_cf_order_1",
    order_id: "mock_merchant_order_1",
    payment_session_id: "mock_session",
    order_status: "ACTIVE",
    order_amount: args.amount ?? args.total_amount ?? 0,
    order_currency: "INR",
    checkout_url: "https://mock.turfzo.in/checkout",
  }),
  "payments:verifyCashfreePayment": () => ({
    success: true,
    payment_verified: true,
    booking: mockBookings[0],
  }),
  "payments:createTournamentOrder": (args) => ({
    success: true,
    cf_order_id: "mock_cf_tourn_1",
    order_id: "mock_merchant_tourn_1",
    payment_session_id: "mock_session",
    order_status: "ACTIVE",
    order_amount: args.amount ?? 0,
    order_currency: "INR",
    checkout_url: "https://mock.turfzo.in/checkout",
  }),
  "payments:verifyTournamentCashfreePayment": () => ({
    success: true,
    payment_verified: true,
  }),
  "payments:refundTournamentEntry": () => ({
    success: true,
    refund_status: "SUCCESS",
    refund_id: "refund_mock_t_1",
    refund_amount: 0,
    refund_message: "Refund processed successfully.",
  }),
  "waitlists:listMine": () => [],
  "waitlists:join": () => "waitlist_mock_1",
  "waitlists:cancel": () => true,
  "payments_history:getMyPaymentHistory": () => [
    {
      _id: "pay_hist_1",
      booking_id: "booking_mock_1",
      amount: 1260,
      currency: "INR",
      status: "success",
      created_at: "2026-08-01T09:00:00.000Z",
    },
  ],

  // ── Reviews ────────────────────────────────────────────────────────
  "reviews:getByTurf": ({ turf_id }) =>
    mockReviews.filter((r) => r.turf_id === turf_id),
  "reviews:getByUser": () => mockReviews,
  "reviews:create": (args) => {
    const rating = Number(args.rating ?? 5);
    const review = {
      _id: "rev_mock_new",
      id: "rev_mock_new",
      turf_id: String(args.turf_id ?? ""),
      booking_id: String(args.booking_id ?? ""),
      user_id: MOCK_USER._id,
      rating,
      comment: String(args.comment ?? ""),
      created_at: "2026-08-01T09:00:00.000Z",
    };
    return review;
  },

  // ── Favorites ──────────────────────────────────────────────────────
  "favorites:getByUser": () => [
    {
      _id: "fav_mock_1",
      id: "fav_mock_1",
      _creationTime: 0,
      user_id: MOCK_USER._id,
      turf_id: "turf_mock_1",
      created_at: "2026-08-01T09:00:00.000Z",
      turf: {
        id: "turf_mock_1",
        name: "Blaze Arena",
        city: "Bengaluru",
        image_url: "",
        price_per_hour: 1200,
        rating: 4.5,
        sport_type: "football",
        is_available: true,
      },
    },
  ],
  "favorites:isFavorited": ({ turf_id }) => turf_id === "turf_mock_1",
  "favorites:add": ({ turf_id }) => ({ success: true, turf_id }),
  "favorites:remove": ({ turf_id }) => ({ success: true, turf_id }),

  // ── Notifications ──────────────────────────────────────────────────
  "notifications:getByUser": () => mockNotifications,
  "notifications:getUnreadCount": () => 1,
  "notifications:markAsRead": () => ({ updated: 1 }),
  "notifications:markAllAsRead": () => ({ updated: 1 }),

  // ── Tournaments ────────────────────────────────────────────────────
  // NOTE: the backend exposes "tournaments:getTournamentById" (canonical).
  // "tournaments:getById" is kept as a local alias pointing at the same
  // fixture so older call sites keep working.
  "tournaments:getOpen": () => mockTournaments,
  "tournaments:getMyRegistrations": () => [],
  "tournaments:getById": ({ tournamentId }) =>
    mockTournaments.find((t) => t._id === tournamentId) ?? null,
  "tournaments:getTournamentById": ({ tournamentId }) => {
    const t = mockTournaments.find((x) => x._id === tournamentId);
    if (!t) return null;
    return {
      _id: t._id,
      id: t._id,
      name: t.title,
      description: t.description,
      sport_type: t.sport,
      tournament_type: t.format,
      entry_fee: t.entry_fee,
      prize_pool: null,
      max_participants: t.max_teams,
      status: "registration_open",
      start_date: t.start_date,
      can_manage: true,
    };
  },
  "tournaments:getOwnerTournaments": () =>
    mockTournaments.slice(0, 2).map((t) => ({
      _id: t._id,
      id: t._id,
      name: t.title,
      sport_type: t.sport,
      tournament_type: t.format,
      entry_fee: t.entry_fee,
      max_participants: t.max_teams,
      status: "registration_open",
      start_date: t.start_date,
      end_date: new Date(
        new Date(t.start_date).getTime() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      registration_deadline: t.start_date,
      prize_pool: 5000,
      min_team_size: 5,
      max_team_size: t.max_teams,
      rules: null,
    })),
  "tournaments:getAllTournaments": () =>
    mockTournaments.map((t) => ({
      _id: t._id,
      id: t._id,
      name: t.title,
      sport_type: t.sport,
      tournament_type: t.format,
      entry_fee: t.entry_fee,
      max_participants: t.max_teams,
      status: "registration_open",
      start_date: t.start_date,
    })),
  "tournaments:getTournamentParticipants": () => [],
  "tournaments:getTeams": () => [],
  "tournaments:getMatches": () => [],
  "tournaments:getAnnouncements": () => [],

  // ── Owner web dashboard parity views ──────────────────────────────
  "owner_dashboard:getTurfComparison": () =>
      mockTurfs.map((t, i) => ({
        turfId: t._id,
        turfName: t.name,
        revenue: 48000 - i * 12000,
        bookings: 40 - i * 8,
        averageBookingValue: 1200,
        occupancyRate: 62 - i * 10,
        rating: t.rating ?? 4.5,
        reviews: t.review_count ?? 12,
        revenueGrowth: i === 0 ? 8.3 : -4.1,
      })),
  "owner_dashboard:generateForecast": () => ({
    last_month_revenue: 152000,
    last_3_months_average: 141000,
    last_6_months_average: 138500,
    year_to_date_revenue: 842000,
    predicted_next_month: 158500,
    predicted_next_quarter: 475500,
    predicted_next_year: 1902000,
    month_over_month_growth: 6.2,
    average_booking_value: 1250,
    confidence_score: 72,
    trend: "growth",
    peak_days: [6, 5, 0],
    peak_hours: ["19:00 - 20:00", "20:00 - 21:00", "18:00 - 19:00"],
    turf_forecasts: [],
    bookings_scanned: 340,
    truncated: false,
  }),
  "owner_dashboard:getEarningsBreakdown": () => ({
    [mockTurfs[0].name]: 152000,
    ...(mockTurfs[1] ? { [mockTurfs[1].name]: 96500 } : {}),
  }),
  "owner_dashboard:getOwnerCustomerProfiles": () =>
    [
      { seg: "vip", spend: 62000, bookings: 31, last: 4, tags: ["corporate", "weekend"] },
      { seg: "vip", spend: 28400, bookings: 22, last: 11, tags: ["academy"] },
      { seg: "loyal", spend: 19600, bookings: 14, last: 8, tags: [] },
      { seg: "regular", spend: 8400, bookings: 6, last: 19, tags: [] },
      { seg: "regular", spend: 5600, bookings: 4, last: 26, tags: ["evening"] },
      { seg: "atRisk", spend: 11200, bookings: 9, last: 34, tags: [] },
      { seg: "atRisk", spend: 7300, bookings: 5, last: 47, tags: ["academy"] },
      { seg: "inactive", spend: 4200, bookings: 3, last: 71, tags: [] },
      { seg: "newCustomer", spend: 1200, bookings: 1, last: 2, tags: [] },
      { seg: "newCustomer", spend: 900, bookings: 1, last: 6, tags: [] },
    ].map((c, i) => ({
      id: `profile_mock_${i}`,
      user_id: `user_mock_customer_${i + 1}`,
      auto_segment: c.seg,
      tag_ids: c.tags,
      segment: c.seg,
      total_bookings: c.bookings,
      completed_bookings: Math.max(0, c.bookings - 1),
      cancelled_bookings: 1,
      total_spent: c.spend,
      average_booking_value: Math.round(c.spend / Math.max(1, c.bookings)),
      first_booking: "2025-11-02T10:00:00.000Z",
      last_booking: "2026-10-20T10:00:00.000Z",
      days_since_last_booking: c.last,
      booking_frequency: 2.1,
      preferred_slots: ["19:00 - 20:00"],
      preferred_days: ["Sat"],
    })),
  "owner_dashboard:getCustomerSegmentsSummary": () => ({
    total: 0,
    vip: 0,
    regular: 0,
    new: 0,
    atRisk: 0,
    loyal: 0,
    corporate: 0,
    inactive: 0,
    tagCounts: {},
  }),
  "owner_dashboard:updateCustomerTags": ({ tags }) => ({
    customer_id: "mock_customer",
    tags,
  }),
  "owner_services:getOwnerPromotions": () => [
    {
      id: "promo_mock_1",
      code: "WEEKEND20",
      description: "Weekend special",
      discount_type: "percentage",
      discount_value: 20,
      valid_from: "2026-10-01T00:00:00.000Z",
      valid_to: "2026-12-31T23:59:59.000Z",
      usage_limit: 100,
      is_active: true,
    },
  ],
  "owner_services:createPromotion": (args) => ({
    id: "promo_mock_new",
    ...args,
    is_active: true,
  }),
  "owner_services:togglePromotionStatus": () => true,
  "owner_services:deletePromotion": () => true,
  "owner_services:getOwnerPricingRules": () => [
    {
      id: "rule_mock_1",
      turf_id: mockTurfs[0]._id,
      name: "Evening peak",
      type: "timeOfDay",
      days_of_week: [5, 6, 0],
      start_time: "18:00",
      end_time: "22:00",
      price_adjustment_type: "percentage",
      adjustment_value: 20,
      priority: 10,
      is_active: true,
    },
  ],
  "owner_services:createPricingRule": (args) => ({
    id: "rule_mock_new",
    days_of_week: [],
    price_adjustment_type: "percentage",
    adjustment_value: 0,
    priority: args.priority ?? 0,
    is_active: true,
    ...args,
  }),
  "owner_services:deletePricingRule": () => true,
  "owner_services:getOwnerSettings": () => ({
    owner_id: "mock_owner",
    reminder_lead_time_hours: 24,
    auto_approve_bookings: true,
    notification_preferences: { email: true, push: true, sms: false },
    enable_24h_reminder: true,
    enable_2h_reminder: false,
    enable_post_game_review: true,
    enable_rebook_suggestions: false,
    post_game_delay_hours: 2,
    rebook_days_inactive: 21,
  }),
  "owner_services:updateReminderSettings": (args) => args,
  "owner_day:getDayView": ({ date }) => {
    const base = date ? String(date) : "2026-11-03";
    return {
      bookings: [
        {
          id: "bk_mock_cal",
          start_time: `${base}T13:30:00.000Z`,
          end_time: `${base}T14:30:00.000Z`,
          status: "confirmed",
          user_id: MOCK_USER._id,
        },
      ],
      blocks: [
        {
          id: "block_mock_1",
          start_time: `${base}T06:30:00.000Z`,
          end_time: `${base}T08:00:00.000Z`,
          reason: "Maintenance",
        },
      ],
    };
  },
  "slot_blocks:create": (args) => ({
    id: "block_mock_new",
    ...args,
  }),
  "slot_blocks:remove": () => true,
  "slot_blocks:getByTurf": () => [
    {
      id: "block_mock_1",
      start_time: `${new Date().toISOString().slice(0, 10)}T06:00:00.000Z`,
      end_time: `${new Date().toISOString().slice(0, 10)}T08:00:00.000Z`,
      reason: "Maintenance",
    },
  ],
  "payouts:getPayouts": () => ({
    payouts: [
      {
        _id: "payout_mock_1",
        amount: 12000,
        status: "payout_completed",
        method: "upi",
        upi_id: "owner@okhdfc",
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        processed_at: new Date(Date.now() - 11 * 86400000).toISOString(),
      },
      {
        _id: "payout_mock_2",
        amount: 4500,
        status: "payout_pending",
        method: "upi",
        upi_id: "owner@okhdfc",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    continueCursor: null,
    isDone: true,
  }),
  "payouts:requestPayout": () => ({ payoutId: "payout_mock_new" }),
  "owner_services:getOwnerTags": () => [
    {
      id: "tag_mock_1",
      name: "Regulars",
      description: "Books at least twice a month",
      color: "#C6F24E",
    },
    {
      id: "tag_mock_2",
      name: "Corporate",
      description: "Office leagues",
      color: "#4E9AF2",
    },
  ],
  "owner_services:createTag": (args) => ({
    id: `tag_mock_${Date.now()}`,
    ...args,
  }),
  "owner_services:deleteTag": () => true,
  "reviews:addOwnerReply": () => true,
  "tournaments:createTournament": () => ({ success: true }),
  "tournaments:updateTournamentStatus": () => true,
  "tournaments:approveRegistration": () => true,
  "tournaments:rejectRegistration": () => true,
  "tournaments:generateInitialMatches": () => true,
  "tournaments:updateMatchResult": () => true,
  "tournaments:createAnnouncement": () => "ann_mock_1",
  "tournaments:deleteAnnouncement": () => true,
  "tournaments:deleteTournament": () => true,
  "tournaments:register": (args) => ({
    _id: "reg_mock_1",
    team_name: (args as { team_name?: string }).team_name ?? "Mock Team",
    registration_code: "REG-MOCK123",
  }),
  "tournaments:registerParticipant": () => ({
    registration_code: "REG-MOCK123",
  }),

  // ── Contact ────────────────────────────────────────────────────────
  "contact:submitContact": () => ({ success: true }),

  // ── Admin (minimal — enough to render pages) ───────────────────────
  "admin:checkAdminExists": () => ({ adminExists: true, adminCount: 1 }),
  "admin:setupFirstAdmin": () => ({ success: true }),
  "admin:getPlatformAnalytics": () => ({
    totalUsers: 2,
    totalTurfs: mockTurfs.length,
    playerCount: 1,
    ownerCount: 1,
    totalRevenue: 4200,
    monthlyRevenue: 1200,
    totalBookings: 5,
    completedBookings: 3,
  }),
  "admin:getUsers": () => [MOCK_USER, MOCK_OWNER_USER],
  "admin:listPendingTurfs": () => [],
  "admin:approveTurf": () => ({ success: true }),
  "admin:rejectTurf": () => ({ success: true }),
  "admin:listPendingOwners": () => [],
  "admin:listContactMessages": () => [],
  "admin:approveOwner": () => ({ success: true }),
  "admin:rejectOwner": () => ({ success: true }),
  "admin:sendOwnerDecisionEmail": () => ({ success: true, emailSent: true }),
  "admin:createOwnerWithVenue": () => ({ success: true }),
  "payouts:listPayouts": () => ({ payouts: [], isDone: true }),
  "payouts:updatePayoutStatus": () => true,

  // ── Owner analytics (display-only on web) ──────────────────────────
  "owner_dashboard:getSummary": () => ({
    totalEarnings: 1269700,
    monthlyEarnings: 70400,
    availableBalance: 1015760,
    withdrawnTotal: 253940,
    totalBookings: 48,
    completedBookings: 42,
    pendingBookings: 2,
    cancelledBookings: 4,
    completionRate: 87.5,
    turfCount: 2,
  }),
  // The dashboard now makes one call. Fixture mirrors the backend shape so
  // mock mode keeps rendering every panel.
  "owner_dashboard:getSnapshot": () => ({
    summary: {
      totalEarnings: 1269700,
      monthlyEarnings: 70400,
      availableBalance: 1015760,
      withdrawnTotal: 253940,
      totalBookings: 48,
      completedBookings: 42,
      pendingBookings: 2,
      cancelledBookings: 4,
      completionRate: 87.5,
      turfCount: 2,
      bookingsScanned: 48,
      truncated: false,
    },
    monthlyEarnings: [
      { label: "Jun", total: 39700 },
      { label: "Jul", total: 43200 },
      { label: "Aug", total: 48600 },
      { label: "Sep", total: 55400 },
      { label: "Oct", total: 62100 },
      { label: "Nov", total: 70400 },
    ],
    popularSlots: [
      { slot: "18:00 - 19:00", percentage: 38.5 },
      { slot: "19:00 - 20:00", percentage: 29.2 },
      { slot: "20:00 - 21:00", percentage: 18.0 },
    ],
    recentTransactions: [
      {
        id: "txn_mock_1",
        type: "income",
        amount: 800,
        date: new Date().toISOString(),
        description: "Booking #BK-8821 • Lords Cricket Ground",
        booking_code: "BK-8821",
        status: "confirmed",
        payment_status: "paid",
      },
      {
        id: "txn_mock_2",
        type: "income",
        amount: 1200,
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        description: "Booking #BK-7419 • Olympic Arena",
        booking_code: "BK-7419",
        status: "completed",
        payment_status: "paid",
      },
      {
        id: "txn_mock_3",
        type: "income",
        amount: 1200,
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        description: "Booking #BK-9034 • Olympic Arena",
        booking_code: "BK-9034",
        status: "confirmed",
        payment_status: "paid",
      },
      {
        id: "txn_mock_4",
        type: "income",
        amount: 800,
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        description: "Booking #BK-9210 • Lords Cricket Ground",
        booking_code: "BK-9210",
        status: "confirmed",
        payment_status: "paid",
      },
      {
        id: "txn_mock_5",
        type: "income",
        amount: 1200,
        date: new Date(Date.now() - 3600000 * 28).toISOString(),
        description: "Booking #BK-5192 • Olympic Arena",
        booking_code: "BK-5192",
        status: "pending",
        payment_status: "paid",
      },
      {
        id: "txn_mock_6",
        type: "income",
        amount: 800,
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        description: "Booking #BK-6380 • Lords Cricket Ground",
        booking_code: "BK-6380",
        status: "pending",
        payment_status: "pending",
      },
    ],
    generatedAt: new Date().toISOString(),
  }),
};

export class MockConvexHttpClient {
  authToken?: string | null = "mock-token";

  async query<T = unknown>(
    path: string,
    args: Record<string, unknown> = {}
  ): Promise<T> {
    return this._dispatch<T>("query", path, args);
  }

  async mutation<T = unknown>(
    path: string,
    args: Record<string, unknown> = {}
  ): Promise<T> {
    return this._dispatch<T>("mutation", path, args);
  }

  async action<T = unknown>(
    path: string,
    args: Record<string, unknown> = {}
  ): Promise<T> {
    return this._dispatch<T>("action", path, args);
  }

  private async _dispatch<T>(
    endpoint: string,
    path: string,
    args: Record<string, unknown>
  ): Promise<T> {
    await new Promise((r) => setTimeout(r, 80));
    if (process.env.NODE_ENV !== "production") {
      console.info(`[MockConvex ${endpoint}] ${path}`);
    }
    const handler = routes[path];
    if (!handler) {
      throw new Error(
        `[Mock] No fixture registered for "${path}". Add one in lib/mock-convex.ts.`
      );
    }
    try {
      return (await handler(args)) as T;
    } catch (err) {
      throw new Error(`[Mock] Fixture for "${path}" failed: ${String(err)}`);
    }
  }
}
