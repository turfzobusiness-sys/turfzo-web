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
  convenience_fee: number;
  gst_tax: number;
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
    convenience_fee: 22,
    gst_tax: 216,
    sport_type: "football",
    format: "7-a-side",
    tier: "standard",
    image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6",
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Water"],
    is_available: true,
    latitude: 19.129,
    longitude: 72.833,
    has_floodlights: true,
    is_indoor: false,
    status: "active",
    rating: 4.8,
    review_count: 25,
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
    convenience_fee: 14,
    gst_tax: 144,
    sport_type: "cricket",
    format: "net-practice",
    tier: "budget",
    image_url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da",
    amenities: ["Equipment Rental", "Coach available", "Water"],
    is_available: true,
    latitude: 19.065,
    longitude: 72.864,
    has_floodlights: false,
    is_indoor: true,
    status: "active",
    rating: 4.5,
    review_count: 12,
    operating_hours: { open: "06:00", close: "22:00" },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    _id: "turf_mock_3",
    id: "turf_mock_3",
    name: "Smash Hit Badminton",
    description: "Premium wooden court badminton facility.",
    address: "Shivaji Park Road No 4",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400028",
    price_per_hour: 500,
    convenience_fee: 9,
    gst_tax: 90,
    sport_type: "badminton",
    format: "singles",
    tier: "budget",
    image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea",
    amenities: ["Locker", "Showers"],
    is_available: true,
    latitude: 19.026,
    longitude: 72.837,
    has_floodlights: false,
    is_indoor: true,
    status: "active",
    rating: 4.2,
    review_count: 30,
    operating_hours: { open: "06:00", close: "22:00" },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    _id: "turf_mock_4",
    id: "turf_mock_4",
    name: "Royal Tennis Club",
    description: "Synthetic clay courts for professional play.",
    address: "Worli Sea Face",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400018",
    price_per_hour: 1500,
    convenience_fee: 27,
    gst_tax: 270,
    sport_type: "tennis",
    format: "singles",
    tier: "premium",
    image_url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0",
    amenities: ["Floodlights", "Showers", "Parking"],
    is_available: true,
    latitude: 19.012,
    longitude: 72.815,
    has_floodlights: true,
    is_indoor: false,
    status: "active",
    rating: 4.9,
    review_count: 8,
    operating_hours: { open: "06:00", close: "22:00" },
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
  },
  {
    _id: "turf_mock_5",
    id: "turf_mock_5",
    name: "Green Valley Turf",
    description: "Large 7-a-side football turf in Powai.",
    address: "Hiranandani Gardens, Powai",
    city: "Mumbai",
    state: "Maharashtra",
    zip_code: "400076",
    price_per_hour: 1800,
    convenience_fee: 32,
    gst_tax: 324,
    sport_type: "football",
    format: "7-a-side",
    tier: "standard",
    image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    amenities: ["Floodlights", "Changing Rooms", "Cafeteria"],
    is_available: true,
    latitude: 19.117,
    longitude: 72.911,
    has_floodlights: true,
    is_indoor: false,
    status: "active",
    rating: 4.7,
    review_count: 45,
    operating_hours: { open: "06:00", close: "23:00" },
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
    booking_code: "TFZ-MOCK-001",
    user_id: "user_mock_1",
    turf_id: "turf_mock_1",
    start_time: new Date(Date.now() + 2 * 86400000).toISOString(),
    end_time: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(),
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
      format: "7-a-side",
      sport_type: "football",
    },
  },
  {
    _id: "booking_mock_2",
    id: "booking_mock_2",
    booking_code: "TFZ-MOCK-002",
    user_id: "user_mock_1",
    turf_id: "turf_mock_5",
    start_time: new Date(Date.now() + 5 * 86400000).toISOString(),
    end_time: new Date(Date.now() + 5 * 86400000 + 2 * 3600000).toISOString(),
    total_price: 3600,
    service_fee: 180,
    status: "pending",
    payment_status: "pending",
    payment_method: "cash",
    attendees: 12,
    created_at: new Date().toISOString(),
    turfs: {
      name: "Green Valley Turf",
      image_url: mockTurfs[4].image_url,
      city: "Mumbai",
      format: "7-a-side",
      sport_type: "football",
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
    description: "Open 7-a-side football tournament with cash prizes.",
    start_date: "2026-09-10T00:00:00.000Z",
    end_date: "2026-09-15T00:00:00.000Z",
    venue: "Olympic Arena",
    city: "Mumbai",
    entry_fee: 2000,
    prize_pool: "₹50,000",
    max_teams: 16,
    registered_teams: 12,
    status: "registration_open",
    image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6",
    created_at: "2026-07-01T00:00:00.000Z",
  },
  {
    _id: "tourn_mock_2",
    _creationTime: Date.now(),
    title: "Badminton Smash Open",
    sport: "badminton",
    format: "individual",
    description: "Singles badminton tournament, all levels welcome.",
    start_date: "2026-08-25T00:00:00.000Z",
    end_date: "2026-08-25T00:00:00.000Z",
    venue: "Smash Hit Badminton",
    city: "Mumbai",
    entry_fee: 500,
    prize_pool: "₹10,000",
    max_teams: 32,
    registered_teams: 24,
    status: "registration_open",
    image_url: "https://images.unsplash.com/photo-1613918431703-aa50889e3be7",
    created_at: "2026-07-05T00:00:00.000Z",
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
  "auth:getCurrentUser": () => ({ success: true, user: MOCK_USER }),
  "auth:syncFirebaseUser": () => ({ success: true, user: MOCK_USER }),
  "auth:updateUserProfile": () => ({ success: true }),
  "auth:getOwnerProfile": () => ({
    success: true,
    profile: {
      user: MOCK_OWNER_USER,
      onboarding: { step: 4, completed: true },
      turfs: mockTurfs,
    },
  }),
  "auth:getOwnerTurfs": () => mockTurfs,
  "auth:completeOnboardingStep": () => ({ success: true }),
  "auth:submitOnboarding": () => ({ success: true }),
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
    const hours = Math.max(1, (end.getTime() - start.getTime()) / 3_600_000);
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
    const newBooking = {
      _id: `booking_mock_new_${Date.now()}`,
      id: `booking_mock_new_${Date.now()}`,
      booking_code: `TFZ-${Math.floor(100000 + Math.random() * 900000)}`,
      user_id: "user_mock_1",
      turf_id: turfId,
      start_time: String(args.start_time ?? new Date().toISOString()),
      end_time: String(args.end_time ?? new Date().toISOString()),
      total_price: (turf?.price_per_hour ?? 1000) * 1,
      service_fee: Math.round((turf?.price_per_hour ?? 1000) * 0.05),
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
        image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6",
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
  "tournaments:getOpen": () => mockTournaments,
  "tournaments:getMyRegistrations": () => [],
  "tournaments:getById": ({ tournamentId }) =>
    mockTournaments.find((t) => t._id === tournamentId) ?? null,
  "tournaments:register": (args) => ({
    _id: "reg_mock_1",
    team_name: (args as { team_name?: string }).team_name ?? "Mock Team",
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
  "admin:listAllUsers": () => [MOCK_USER, MOCK_OWNER_USER],
  "admin:listPendingOwners": () => [],
  "admin:listContactMessages": () => [],
  "admin:approveOwner": () => ({ success: true }),
  "admin:rejectOwner": () => ({ success: true }),
  "admin:createOwnerWithVenue": () => ({ success: true }),
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
