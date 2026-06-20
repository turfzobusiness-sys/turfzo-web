"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  X,
  Trophy,
  Ticket,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { convexClient } from "@/lib/convex";
import type { Booking, AppUser } from "@/lib/types";

const FAVORITE_SPORTS = ["Football", "Cricket", "Badminton", "Tennis", "Pickleball", "Multipurpose"];

export default function ProfilePage() {
  const router = useRouter();
  const { status, firebaseUser, convexUser, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);

  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/profile");
    }
  }, [status, router]);

  // Load bookings on mount when authenticated. setState calls happen inside
  // async callbacks (after the await), which is the correct pattern.
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const data = await convexClient.query<Booking[]>("bookings:getMyBookings", {});
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
      await convexClient.mutation<AppUser>("auth:updateProfile", {
        full_name: fullName,
        display_name: fullName,
        phone_number: phone || undefined,
        city: city || undefined,
        state: stateName || undefined,
        favorite_sports: favoriteSports.length > 0 ? favoriteSports : undefined,
      });
      setEditMode(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleSport = (sport: string) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  if (status === "initial" || status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-10 h-10 text-brand-lime animate-spin" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.start_time) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || (b.status === "confirmed" && new Date(b.start_time) <= new Date())
  );

  const displayName =
    (convexUser?.display_name && convexUser.display_name.trim() !== "")
      ? convexUser.display_name
      : (convexUser?.full_name && convexUser.full_name.trim() !== "")
        ? convexUser.full_name
        : firebaseUser?.displayName
          ? firebaseUser.displayName
          : (convexUser?.email ?? firebaseUser?.email)?.split("@")[0] ?? "User";
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
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
                <h2 className="text-lg font-bold text-text-main mb-6">Personal Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                  {[
                    { label: "Full Name", value: fullName, setter: setFullName, placeholder: "Your name" },
                    { label: "Phone", value: phone, setter: setPhone, placeholder: "+91 98765 43210" },
                    { label: "City", value: city, setter: setCity, placeholder: "e.g. Hyderabad" },
                    { label: "State", value: stateName, setter: setStateName, placeholder: "e.g. Telangana" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium text-text-muted mb-2">{f.label}</label>
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
                  <label className="block text-sm font-medium text-text-muted mb-3">Favourite Sports</label>
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
            {["Bookings", "Reviews", "Favourites", "Payment Methods", "Settings"].map((tab, i) => (
              <button
                key={tab}
                className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                  i === 0
                     ? "text-text-main"
                     : "text-text-muted hover:text-text-main"
                }`}
              >
                {tab}
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-main" />
                )}
              </button>
            ))}
          </nav>

          {/* ── Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left: Bookings list */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-text-main">Recent Bookings</h2>
                <Link href="/explore" className="text-sm font-medium text-text-muted hover:text-text-main flex items-center gap-1.5 transition-colors">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loadingBookings ? (
                <div className="py-12 flex flex-col items-center gap-4">
                  <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                  <span className="text-sm text-text-muted">Loading bookings…</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-5">
                    <Ticket className="w-8 h-8 text-text-muted/40" />
                  </div>
                  <h3 className="font-bold text-text-main text-lg mb-2">No bookings yet</h3>
                  <p className="text-sm text-text-muted max-w-sm mb-8">Ready to play? Book your first turf and see it here.</p>
                  <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-text-main hover:bg-text-main/90 text-bg font-semibold text-sm rounded-lg transition-colors">
                    Explore Turfs
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {bookings.slice(0, 5).map((booking) => {
                    const isUpcoming = booking.status === "confirmed" && new Date(booking.start_time) > new Date();
                    const isCancelled = booking.status === "cancelled";
                    const statusText = isUpcoming ? "Upcoming" : booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
                    const statusColor = isUpcoming ? "text-text-main bg-elevated" : isCancelled ? "text-error bg-error/10" : "text-text-muted bg-elevated";

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
                              <span>{new Date(booking.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              <span>•</span>
                              <span>{new Date(booking.start_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-base font-semibold text-text-main">₹{booking.total_price.toLocaleString("en-IN")}</span>
                          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
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
                <h2 className="text-lg font-bold text-text-main mb-6">Account Summary</h2>
                <div className="flex flex-col gap-4 text-sm">
                  {[
                    { label: "Member Since", value: new Date(convexUser?._creationTime ?? Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) },
                    { label: "Total Bookings", value: String(bookings.length) },
                    { label: "Total Spent", value: `₹${bookings.reduce((acc, b) => acc + (b.status !== "cancelled" ? b.total_price : 0), 0).toLocaleString("en-IN")}` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-text-muted">{row.label}</span>
                      <span className="font-medium text-text-main">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                    <span className="text-text-muted">Wallet Balance</span>
                    <span className="font-semibold text-text-main">₹0</span>
                  </div>
                </div>
              </div>

              {/* Favourite Sports */}
              {!editMode && (convexUser?.favorite_sports?.length ?? 0) > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-text-main mb-6">Favourite Sports</h2>
                  <div className="flex flex-wrap gap-2">
                    {convexUser?.favorite_sports?.map((s) => (
                      <span key={s} className="px-4 py-2 rounded-full bg-elevated text-sm font-medium text-text-main">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
