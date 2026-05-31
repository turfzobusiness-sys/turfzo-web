export type UserRole = "player" | "owner" | "admin";

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
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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
