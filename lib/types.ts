export type UserRole = "player" | "owner" | "admin" | "user";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export interface Turf {
  _id: string;
  _creationTime: number;
  user_id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  price_per_hour: number;
  image_url?: string;
  image_gallery?: string[];
  is_available: boolean;
  sport_type?: string;
  amenities?: string[];
  rating?: number;
  review_count?: number;
  tier?: string;
  format?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  operating_hours?: Record<string, { open: string; close: string }>;
  max_players?: number;
  has_floodlights?: boolean;
  has_free_parking?: boolean;
  has_changing_room?: boolean;
  has_drinking_water?: boolean;
  has_first_aid?: boolean;
  is_indoor?: boolean;
  ground_count?: number;
  status?: "pending" | "approved" | "rejected" | "active" | "inactive";
}

export interface AppUser {
  _id: string;
  _creationTime: number;
  email: string;
  full_name?: string;
  display_name?: string;
  phone_number?: string;
  avatar_url?: string;
  role: UserRole;
  city?: string;
  state?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_approved: boolean;
  approved_at?: string;
  rejection_reason?: string;
  rejection_reason_at?: string;
  firebase_uid?: string;
  favorite_sports?: string[];
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  _id: string;
  _creationTime: number;
  user_id: string;
  turf_id: string;
  booking_code?: string;
  start_time: string;
  end_time: string;
  total_price: number;
  service_fee: number;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  payment_method?: string;
  attendees?: number;
  notes?: string;
  cancellation_reason?: string;
  pg_order_id?: string;
  pg_payment_id?: string;
  pg_signature?: string;
}

export interface Review {
  _id: string;
  _creationTime: number;
  user_id: string;
  turf_id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  owner_reply?: string;
  owner_replied_at?: string;
}

export interface Favorite {
  _id: string;
  _creationTime: number;
  user_id: string;
  turf_id: string;
  created_at: string;
}

export interface NotificationItem {
  _id: string;
  _creationTime: number;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data?: unknown;
  is_read: boolean;
}

export interface OwnerProfile {
  _id: string;
  _creationTime: number;
  user_id: string;
  business_name?: string;
  phone_number?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  onboarding_step: number;
  onboarding_completed: boolean;
  onboarding_completed_at?: number;
  agreement_accepted?: boolean;
  agreement_accepted_at?: number;
  venue_draft?: {
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    price_per_hour?: number;
    sport_type?: string;
    amenities?: string[];
  operating_hours?: { open?: string; close?: string };
    max_players?: number;
    has_floodlights?: boolean;
    has_free_parking?: boolean;
    has_changing_room?: boolean;
    has_drinking_water?: boolean;
    has_first_aid?: boolean;
    is_indoor?: boolean;
    ground_count?: number;
    image_gallery?: string[];
  };
}

export interface PayoutDetails {
  _id: string;
  _creationTime: number;
  owner_id: string;
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_ifsc_code: string;
  bank_name: string;
  bank_branch?: string;
  upi_id?: string;
  is_verified: boolean;
  verified_at?: number;
  verified_by?: string;
}

export interface OnboardingState {
  user: AppUser;
  profile: OwnerProfile | null;
  payout: PayoutDetails | null;
}

export interface OwnerDashboardSummary {
  totalEarnings: number;
  availableBalance: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completionRate: number;
  turfCount: number;
}

// =====================================================================
// Payment history (web app "Payments" tab)
// =====================================================================
export interface PaymentOrder {
  _id: string;
  _creationTime: number;
  id: string;
  user_id?: string;
  booking_id?: string;
  cashfree_order_id: string;
  cashfree_payment_session_id?: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  cashfree_payment_id?: string;
  payment_status?: string;
  verified?: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// =====================================================================
// Favourites (web app "Favourites" tab) — backend hydrates the turf
// =====================================================================
export interface FavoriteTurf {
  id: string;
  name: string;
  city?: string;
  image_url?: string;
  price_per_hour: number;
  rating?: number;
  sport_type?: string;
  is_available: boolean;
}

export interface FavoriteWithTurf {
  _id: string;
  _creationTime: number;
  id: string;
  user_id: string;
  turf_id: string;
  created_at: string;
  turf: FavoriteTurf | null;
}

// =====================================================================
// Reviews (web app "Reviews" tab)
// =====================================================================
export interface UserReview {
  _id: string;
  _creationTime: number;
  id: string;
  user_id: string;
  turf_id: string;
  booking_id: string;
  rating: number;
  comment?: string;
  owner_reply?: string;
  owner_replied_at?: string;
  updated_at?: string;
}

// =====================================================================
// Notifications (web app "Notifications" tab + header bell)
// =====================================================================
export interface UserNotification {
  _id: string;
  _creationTime: number;
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data?: unknown;
  is_read: boolean;
  created_at?: string;
}
