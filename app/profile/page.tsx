"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  X,
  Ticket,
  ArrowRight,
  LogOut,
  MessageSquare,
  Heart,
  CreditCard,
  Bell,
  Shield,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import { toast } from "sonner";
import type {
  Booking,
  AppUser,
  UserReview,
  FavoriteWithTurf,
  PaymentOrder,
  UserNotification,
} from "@/lib/types";

const FAVORITE_SPORTS = [
  "Football",
  "Cricket",
  "Badminton",
  "Tennis",
  "Pickleball",
  "Multipurpose",
];

export default function ProfilePage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser, signOut, refreshUser, getFreshToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    | "bookings"
    | "reviews"
    | "favourites"
    | "payments"
    | "notifications"
    | "settings"
  >("bookings");

  const tabs = [
    { id: "bookings", label: "Bookings" },
    { id: "reviews", label: "Reviews" },
    { id: "favourites", label: "Favourites" },
    { id: "payments", label: "Payments" },
    { id: "notifications", label: "Notifications" },
    { id: "settings", label: "Settings" },
  ] as const;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);

  const lastUserId = useRef<string | null>(null);

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteWithTurf[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [accountActionLoading, setAccountActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/profile");
    }
  }, [status, router]);

  // Support deep-linking to a specific tab (e.g. /profile?tab=notifications
  // from the header bell) without requiring useSearchParams/Suspense.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (
      tab === "bookings" ||
      tab === "reviews" ||
      tab === "favourites" ||
      tab === "payments" ||
      tab === "notifications" ||
      tab === "settings"
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tab);
    }
  }, []);

  // Load bookings on mount when authenticated. setState calls happen inside
  // async callbacks (after the await), which is the correct pattern.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await convexClient.query<Booking[]>(
          "bookings:getMyBookings",
          {},
        );
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) console.error("Failed to load bookings:", err);
      } finally {
        if (!cancelled) setLoadingBookings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Fetch the user's reviews, favourites, payment history and notifications
  // once authenticated. Each sub-fetch is independent so a single failure
  // doesn't block the others. setState calls happen after the awaits.
  useEffect(() => {
    if (status !== "authenticated" || !convexUser?._id) return;
    const userId = convexUser._id;
    let cancelled = false;

    (async () => {
      try {
        const data = await convexClient.query<UserReview[]>(
          "reviews:getByUser",
          { user_id: userId, limit: 50 },
        );
        if (!cancelled) setReviews(data);
      } catch (err) {
        if (!cancelled) console.error("Failed to load reviews:", err);
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    })();

    (async () => {
      try {
        const data = await convexClient.query<FavoriteWithTurf[]>(
          "favorites:getByUser",
          { user_id: userId, limit: 50 },
        );
        if (!cancelled) setFavorites(data);
      } catch (err) {
        if (!cancelled) console.error("Failed to load favorites:", err);
      } finally {
        if (!cancelled) setLoadingFavorites(false);
      }
    })();

    (async () => {
      try {
        const data = await convexClient.query<PaymentOrder[]>(
          "payments_history:getMyPaymentHistory",
          { limit: 50 },
        );
        if (!cancelled) setPayments(data);
      } catch (err) {
        if (!cancelled) console.error("Failed to load payments:", err);
      } finally {
        if (!cancelled) setLoadingPayments(false);
      }
    })();

    (async () => {
      try {
        const [all, unread] = await Promise.all([
          convexClient.query<UserNotification[]>("notifications:getByUser", {
            user_id: userId,
            limit: 50,
          }),
          convexClient.query<number>("notifications:getUnreadCount", {
            user_id: userId,
          }),
        ]);
        if (!cancelled) {
          setNotifications(all);
          setUnreadCount(unread);
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to load notifications:", err);
      } finally {
        if (!cancelled) setLoadingNotifications(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, convexUser?._id]);

  // Sync user fields into local form state when convexUser first arrives.
  // Only fires when the user identity changes to avoid clobbering user edits.
  useEffect(() => {
    if (convexUser && convexUser._id !== lastUserId.current) {
      lastUserId.current = convexUser._id;
      setFullName(convexUser.full_name ?? convexUser.display_name ?? "");
      setPhone(convexUser.phone_number ?? "");
      setCity(convexUser.city ?? "");
      setStateName(convexUser.state ?? "");
      setFavoriteSports(convexUser.favorite_sports ?? []);
    }
  }, [convexUser]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await convexClient.mutation<AppUser>("auth:updateUserProfile", {
        full_name: fullName,
        display_name: fullName,
        phone_number: phone || undefined,
        city: city || undefined,
        state: stateName || undefined,
        favorite_sports: favoriteSports.length > 0 ? favoriteSports : undefined,
      });
      await refreshUser();
      toast.success("Profile saved!");
      setEditMode(false);
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setSaveError(
        getErrorMessage(err, "Failed to save profile. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSport = (sport: string) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const handleUnfavorite = async (turfId: string) => {
    try {
      await convexClient.mutation("favorites:remove", { turf_id: turfId });
      setFavorites((prev) => prev.filter((f) => f.turf_id !== turfId));
      toast.success("Removed from favourites.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Could not remove favourite."));
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await convexClient.mutation("notifications:markAsRead", {
        notification_id: notificationId,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Could not mark as read."));
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await convexClient.mutation<{ updated: number }>(
        "notifications:markAllAsRead",
        {},
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Could not mark all as read."));
    }
  };

  const handleResetPassword = async () => {
    const email = convexUser?.email ?? firebaseUser?.email;
    if (!email) {
      toast.error("No email address on file.");
      return;
    }
    setAccountActionLoading(true);
    try {
      const token = await getFreshToken();
      await convexClient.action<{ success: boolean }>(
        "auth:sendPasswordReset",
        { email },
        token,
      );
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Could not send reset email."));
    } finally {
      setAccountActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This will permanently remove your data and cannot be undone.",
    );
    if (!confirmed) return;
    const doubleConfirm = window.confirm(
      "Last chance — this action is irreversible. Proceed?",
    );
    if (!doubleConfirm) return;
    setAccountActionLoading(true);
    try {
      const token = await getFreshToken();
      const result = await convexClient.action<{
        success: boolean;
        error?: string;
      }>("auth:deleteAccount", {}, token);
      if (!result.success) {
        toast.error(
          result.error === "NOT_AUTHENTICATED"
            ? "Your session has expired. Please sign in again."
            : "Could not delete account. Please try again.",
        );
        return;
      }
      toast.success("Account deleted. Signing you out…");
      await signOut();
      router.push("/");
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      toast.error(getErrorMessage(err, "Could not delete account."));
    } finally {
      setAccountActionLoading(false);
    }
  };

  if (
    status === "initial" ||
    status === "loading" ||
    status === "unauthenticated"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
      </div>
    );
  }

  const displayName =
    convexUser?.display_name && convexUser.display_name.trim() !== ""
      ? convexUser.display_name
      : convexUser?.full_name && convexUser.full_name.trim() !== ""
        ? convexUser.full_name
        : firebaseUser?.displayName
          ? firebaseUser.displayName
          : ((convexUser?.email ?? firebaseUser?.email)?.split("@")[0] ??
            "User");
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = convexUser?.avatar_url || firebaseUser?.photoURL;

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main font-sans selection:bg-brand-lime/30">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 w-full">
          {/* ── Banner ── */}
          <section className="relative mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              {/* avatar + info */}
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-elevated">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-text-muted">
                        {initial}
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 bg-brand-lime rounded-full border-4 border-bg flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" strokeWidth={4} />
                  </span>
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold text-text-main mb-2">
                    {displayName}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 text-sm text-text-muted">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {convexUser?.email ?? firebaseUser?.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {convexUser?.phone_number || "Not added"}
                      {convexUser?.is_phone_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                          <Check className="w-3 h-3" strokeWidth={3} /> Verified
                        </span>
                      ) : (
                        <a
                          href="/auth/verify-phone"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-lime/15 text-brand-lime text-[10px] font-bold hover:bg-brand-lime/25 transition-colors"
                        >
                          Verify mobile
                        </a>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-3">
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-elevated hover:bg-elevated/80 text-text-main transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-text-muted hover:text-text-main transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg bg-text-main text-bg hover:bg-text-main/90 disabled:opacity-60 transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </>
                )}
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-error hover:bg-error/10 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {saveError && (
            <div className="mb-8 p-4 bg-error/10 text-error text-sm rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {saveError}
            </div>
          )}

          {/* ── Edit Mode Fields ── */}
          {editMode && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="pt-6 border-t border-border-subtle">
                <h2 className="text-lg font-bold text-text-main mb-6">
                  Personal Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                  {[
                    {
                      label: "Full Name",
                      value: fullName,
                      setter: setFullName,
                      placeholder: "Your name",
                    },
                    {
                      label: "Phone",
                      value: phone,
                      setter: setPhone,
                      placeholder: "+91 98765 43210",
                    },
                    {
                      label: "City",
                      value: city,
                      setter: setCity,
                      placeholder: "e.g. Hyderabad",
                    },
                    {
                      label: "State",
                      value: stateName,
                      setter: setStateName,
                      placeholder: "e.g. Telangana",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-text-muted mb-2">
                        {f.label}
                      </label>
                      <input
                        value={f.value}
                        onChange={(e) => f.setter(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-elevated border-none rounded-lg px-4 py-3 text-sm text-text-main placeholder:text-text-muted/40 focus:outline-none focus:ring-1 focus:ring-border-strong transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 max-w-3xl">
                  <label className="block text-sm font-medium text-text-muted mb-3">
                    Favourite Sports
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {FAVORITE_SPORTS.map((sport) => {
                      const on = favoriteSports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
                            on
                              ? "bg-text-main text-bg"
                              : "bg-elevated text-text-muted hover:text-text-main"
                          }`}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Tabs ── */}
          <nav className="flex gap-6 border-b border-border-subtle mb-10 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "text-brand-lime"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.span
                      layoutId="profileTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-lime"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Tab Contents ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "bookings" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Left: Bookings list */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold text-text-main">
                        Recent Bookings
                      </h2>
                      <Link
                        href="/explore"
                        className="text-sm font-medium text-text-muted hover:text-text-main flex items-center gap-1.5 transition-colors"
                      >
                        View all <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {loadingBookings ? (
                      <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                        <span className="text-sm text-text-muted">
                          Loading bookings…
                        </span>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="py-16 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-5">
                          <Ticket className="w-8 h-8 text-text-muted/40" />
                        </div>
                        <h3 className="font-bold text-text-main text-lg mb-2">
                          No bookings yet
                        </h3>
                        <p className="text-sm text-text-muted max-w-sm mb-8">
                          Ready to play? Book your first turf and see it here.
                        </p>
                        <Link
                          href="/explore"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-text-main hover:bg-text-main/90 text-bg font-semibold text-sm rounded-lg transition-colors"
                        >
                          Explore Turfs
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {bookings.slice(0, 5).map((booking) => {
                          const isUpcoming =
                            booking.status === "confirmed" &&
                            new Date(booking.start_time) > new Date();
                          const isCancelled = booking.status === "cancelled";
                          const statusText = isUpcoming
                            ? "Upcoming"
                            : booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1);
                          const statusColor = isUpcoming
                            ? "text-text-main bg-elevated"
                            : isCancelled
                              ? "text-error bg-error/10"
                              : "text-text-muted bg-elevated";

                          return (
                            <div
                              key={booking._id}
                              className="flex items-center justify-between gap-4 group pb-6 border-b border-border-subtle/50 last:border-0"
                            >
                              <div className="flex items-center gap-5 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center flex-shrink-0 text-text-muted">
                                  <MapPin className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-base text-text-main">
                                    Booking #{booking.booking_code}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                                    <span>
                                      {new Date(
                                        booking.start_time,
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {new Date(
                                        booking.start_time,
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-base font-semibold text-text-main">
                                  ₹{booking.total_price.toLocaleString("en-IN")}
                                </span>
                                <span
                                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor}`}
                                >
                                  {statusText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right sidebar */}
                  <div className="flex flex-col gap-10">
                    {/* Account Summary */}
                    <div>
                      <h2 className="text-lg font-bold text-text-main mb-6">
                        Account Summary
                      </h2>
                      <div className="flex flex-col gap-4 text-sm">
                        {[
                          {
                            label: "Member Since",
                            value: convexUser?._creationTime
                              ? new Date(
                                  convexUser._creationTime,
                                ).toLocaleDateString("en-IN", {
                                  month: "long",
                                  year: "numeric",
                                })
                              : "—",
                          },
                          {
                            label: "Total Bookings",
                            value: String(bookings.length),
                          },
                          {
                            label: "Total Spent",
                            value: `₹${bookings.reduce((acc, b) => acc + (b.status !== "cancelled" ? b.total_price : 0), 0).toLocaleString("en-IN")}`,
                          },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between items-center"
                          >
                            <span className="text-text-muted">{row.label}</span>
                            <span className="font-medium text-text-main">
                              {row.value}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                          <span className="text-text-muted">
                            Wallet Balance
                          </span>
                          <span className="font-semibold text-text-main">
                            ₹0
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Favourite Sports */}
                    {!editMode &&
                      (convexUser?.favorite_sports?.length ?? 0) > 0 && (
                        <div>
                          <h2 className="text-lg font-bold text-text-main mb-6">
                            Favourite Sports
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {convexUser?.favorite_sports?.map((s) => (
                              <span
                                key={s}
                                className="px-4 py-2 rounded-full bg-elevated text-sm font-medium text-text-main"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="max-w-3xl">
                  <h2 className="text-xl font-bold text-text-main mb-6">
                    My Reviews
                  </h2>
                  {loadingReviews ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                      <span className="text-sm text-text-muted">Loading reviews…</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="bg-surface/50 border border-border-default rounded-lg p-8 sm:p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8 text-text-muted/40" />
                      </div>
                      <h3 className="font-bold text-text-main text-lg mb-2">
                        No reviews written yet
                      </h3>
                      <p className="text-sm text-text-muted mb-6 leading-relaxed">
                        You haven&apos;t shared feedback on any turfs. Reviewing
                        venues helps fellow athletes in your city find the best
                        sports facilities.
                      </p>
                      <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-semibold text-sm rounded-lg transition-all"
                      >
                        Explore &amp; Review Turfs
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-surface/50 border border-border-default rounded-lg p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Link
                              href={`/venues/${review.turf_id}`}
                              className="text-sm font-semibold text-text-main hover:text-brand-lime transition-colors"
                            >
                              View Turf
                            </Link>
                            <div className="flex items-center gap-1 text-brand-lime text-sm font-bold">
                              <span aria-label={`${review.rating} out of 5 stars`}>
                                {"★".repeat(review.rating)}
                              </span>
                              <span className="text-text-muted font-normal ml-1">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-text-muted leading-relaxed mb-3">
                              {review.comment}
                            </p>
                          )}
                          {review.owner_reply && (
                            <div className="mt-3 pl-4 border-l-2 border-border-subtle">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                Owner reply
                              </span>
                              <p className="text-xs text-text-main mt-1 leading-relaxed">
                                {review.owner_reply}
                              </p>
                            </div>
                          )}
                          {review.updated_at && (
                            <p className="text-[10px] text-text-muted mt-3">
                              {new Date(review.updated_at).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "numeric" },
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "favourites" && (
                <div className="max-w-5xl">
                  <h2 className="text-xl font-bold text-text-main mb-6">
                    Favourite Turfs
                  </h2>
                  {loadingFavorites ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                      <span className="text-sm text-text-muted">Loading favourites…</span>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="bg-surface/50 border border-border-default rounded-lg p-8 sm:p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-6">
                        <Heart className="w-8 h-8 text-text-muted/40" />
                      </div>
                      <h3 className="font-bold text-text-main text-lg mb-2">
                        Your Favourites list is empty
                      </h3>
                      <p className="text-sm text-text-muted mb-6 leading-relaxed">
                        Save your go-to football turfs, cricket nets, or tennis
                        courts by tapping the heart icon on venue pages to see
                        them here.
                      </p>
                      <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-semibold text-sm rounded-lg transition-all"
                      >
                        Find Your Favourites
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {favorites.map((fav) => {
                        const turf = fav.turf;
                        return (
                          <div
                            key={fav.id}
                            className="bg-surface/50 border border-border-default rounded-lg overflow-hidden flex flex-col"
                          >
                            <Link
                              href={turf ? `/venues/${turf.id}` : "/explore"}
                              className="relative block h-36 bg-elevated overflow-hidden"
                            >
                              {turf?.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={turf.image_url}
                                  alt={turf.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Heart className="w-8 h-8 text-text-muted/30" />
                                </div>
                              )}
                            </Link>
                            <div className="p-4 flex flex-col gap-2 flex-grow">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={turf ? `/venues/${turf.id}` : "/explore"}
                                  className="text-sm font-bold text-text-main hover:text-brand-lime transition-colors line-clamp-1"
                                >
                                  {turf?.name ?? "Turf unavailable"}
                                </Link>
                                {turf && (
                                  <span className="flex items-center gap-1 text-xs text-brand-lime font-semibold shrink-0">
                                    ★ {turf.rating?.toFixed(1) ?? "New"}
                                  </span>
                                )}
                              </div>
                              {turf ? (
                                <div className="flex items-center justify-between text-xs text-text-muted">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {turf.city ?? "India"}
                                  </span>
                                  <span className="font-semibold text-brand-lime">
                                    ₹{turf.price_per_hour}/hr
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted">
                                  This turf is no longer available.
                                </span>
                              )}
                              <button
                                onClick={() => handleUnfavorite(fav.turf_id)}
                                className="mt-2 self-start text-[11px] font-semibold text-text-muted hover:text-error flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="max-w-4xl flex flex-col gap-8">
                  <div>
                    <h2 className="text-xl font-bold text-text-main mb-1">
                      Payment History
                    </h2>
                    <p className="text-xs text-text-muted">
                      Your bookings and tournament entry payments.
                    </p>
                  </div>

                  {loadingPayments ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                      <span className="text-sm text-text-muted">Loading payments…</span>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="bg-surface/50 border border-border-default rounded-lg p-8 sm:p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-6">
                        <CreditCard className="w-8 h-8 text-text-muted/40" />
                      </div>
                      <h3 className="font-bold text-text-main text-lg mb-2">
                        No payments yet
                      </h3>
                      <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-sm">
                        Your completed and pending transactions will appear here
                        once you book a turf or register for a tournament.
                      </p>
                      <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-semibold text-sm rounded-lg transition-all"
                      >
                        Explore Turfs
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {payments.map((p) => {
                        const isTournament = Boolean(p.metadata?.tournament_id);
                        const isRefunded = p.status.startsWith("refund");
                        const isSuccess = p.status === "paid" || p.verified === true;
                        const statusLabel = isRefunded
                          ? "Refunded"
                          : isSuccess
                            ? "Paid"
                            : p.status === "failed"
                              ? "Failed"
                              : "Pending";
                        const statusColor = isRefunded
                          ? "text-text-main bg-elevated"
                          : isSuccess
                            ? "text-brand-lime bg-brand-lime/10"
                            : p.status === "failed"
                              ? "text-error bg-error/10"
                              : "text-text-muted bg-elevated";
                        return (
                          <div
                            key={p.id}
                            className="bg-surface/50 border border-border-default rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center shrink-0">
                                <CreditCard className="w-5 h-5 text-text-muted" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-main">
                                  {isTournament ? "Tournament Entry" : "Turf Booking"}
                                </p>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                  {new Date(p.created_at).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-[10px] text-text-muted/70 mt-0.5">
                                  Order #{p.receipt}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                              <span className="text-sm font-bold text-text-main">
                                ₹{p.amount.toLocaleString("en-IN")}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="bg-surface/50 border border-border-default rounded-lg p-6 flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-text-main border-b border-border-subtle pb-2">
                      Supported Payment Options
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                      <div className="flex justify-between items-center bg-elevated/30 rounded-md px-3 py-2">
                        <span className="text-text-muted">UPI</span>
                        <span className="text-brand-lime font-bold">Supported</span>
                      </div>
                      <div className="flex justify-between items-center bg-elevated/30 rounded-md px-3 py-2">
                        <span className="text-text-muted">Net Banking</span>
                        <span className="text-brand-lime font-bold">Supported</span>
                      </div>
                      <div className="flex justify-between items-center bg-elevated/30 rounded-md px-3 py-2">
                        <span className="text-text-muted">Cards</span>
                        <span className="text-brand-lime font-bold">Supported</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      For your security, we don&apos;t store full card credentials.
                      You can save cards with our secure payment gateway during
                      checkout.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-main">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold bg-brand-lime text-black rounded-full px-2 py-0.5">
                          {unreadCount} new
                        </span>
                      )}
                    </h2>
                    {notifications.some((n) => !n.is_read) && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {loadingNotifications ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                      <span className="text-sm text-text-muted">Loading notifications…</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="bg-surface/50 border border-border-default rounded-lg p-8 sm:p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-6">
                        <Bell className="w-8 h-8 text-text-muted/40" />
                      </div>
                      <h3 className="font-bold text-text-main text-lg mb-2">
                        You&apos;re all caught up
                      </h3>
                      <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-sm">
                        Booking confirmations, reminders, and tournament updates
                        will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`border rounded-lg p-4 flex items-start gap-3 transition-colors ${
                            n.is_read
                              ? "bg-surface/30 border-border-subtle"
                              : "bg-surface/60 border-border-default"
                          }`}
                        >
                          <div
                            className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                              n.is_read ? "bg-text-muted/30" : "bg-brand-lime"
                            }`}
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-sm font-semibold text-text-main">
                                {n.title}
                              </h4>
                              {!n.is_read && (
                                <button
                                  onClick={() => handleMarkNotificationRead(n.id)}
                                  className="text-[10px] font-semibold text-text-muted hover:text-brand-lime flex items-center gap-1 shrink-0 transition-colors"
                                >
                                  <Check className="w-3 h-3" /> Mark read
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-text-muted mt-1 leading-relaxed">
                              {n.body}
                            </p>
                            {n.created_at && (
                              <p className="text-[10px] text-text-muted/70 mt-2">
                                {new Date(n.created_at).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="max-w-3xl bg-surface/50 border border-border-default rounded-lg p-6 sm:p-8 flex flex-col gap-8">
                  <div>
                    <h3 className="font-bold text-text-main text-lg">
                      Account Settings
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      Configure security features and notification settings
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 border-b border-border-subtle pb-6">
                    <h4 className="text-sm font-bold text-text-main flex items-center gap-2">
                      <Bell className="w-4 h-4 text-text-muted" /> Notification
                      Preferences
                    </h4>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-main">
                            Email Updates
                          </span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Receive receipts and tournament confirmation emails
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-9 h-5 rounded-full bg-elevated border-border-default accent-brand-lime cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-main">
                            SMS alerts
                          </span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Get booking reminders and matching PIN alerts 1 hour
                            before slots
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-9 h-5 rounded-full bg-elevated border-border-default accent-brand-lime cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-b border-border-subtle pb-6">
                    <h4 className="text-sm font-bold text-text-main flex items-center gap-2">
                      <Shield className="w-4 h-4 text-text-muted" /> Security &
                      Access
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-main">
                          Reset Password
                        </span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          Triggers a password reset instruction link to{" "}
                          {convexUser?.email ?? firebaseUser?.email}
                        </span>
                      </div>
                      <button
                        onClick={handleResetPassword}
                        disabled={accountActionLoading}
                        className="px-4 py-2 border border-border-default hover:border-brand-lime/30 text-xs font-semibold rounded-lg bg-surface text-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {accountActionLoading ? "Sending…" : "Reset Password"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-error">
                      Danger Zone
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-main">
                          Delete Account
                        </span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          Permanently delete your profile and cancel all active
                          bookings. This action is irreversible.
                        </span>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={accountActionLoading}
                        className="px-4 py-2 border border-error/30 hover:bg-error/10 text-xs font-semibold rounded-lg text-error transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {accountActionLoading ? "Deleting…" : "Delete Profile"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
